import os
import glob
import numpy as np
import rasterio
from rasterio.enums import Resampling
import matplotlib.pyplot as plt
from pathlib import Path

class Sentinel2Processor:
    def __init__(self, safe_path):
        self.safe_path = Path(safe_path)
        self.granule_path = list((self.safe_path / "GRANULE").glob("L2A*"))[0]
        self.img_data_path = self.granule_path / "IMG_DATA"
        
        self.bands = {}
        self.profile = None
        
    def _get_band_path(self, band_name, resolution="R10m"):
        # Find file ending with _{band_name}_10m.jp2 or 20m.jp2
        search_path = self.img_data_path / resolution
        # Pattern example: T43QCE_20250918T053651_B02_10m.jp2
        # We look for *_{band_name}_{resolution[1:]}.jp2
        pattern = f"*_{band_name}_{resolution[1:]}.jp2"
        files = list(search_path.glob(pattern))
        if not files:
            raise FileNotFoundError(f"Band {band_name} not found in {search_path}")
        return files[0]

    def read_bands(self):
        """
        Reads B02, B03, B04, B08 (10m) and B11, B12 (20m).
        Resamples 20m bands to 10m.
        """
        # 10m Bands
        for b in ['B02', 'B03', 'B04', 'B08']:
            path = self._get_band_path(b, "R10m")
            with rasterio.open(path) as src:
                self.bands[b] = src.read(1).astype('float32') / 10000.0 # Reflectance
                if self.profile is None:
                    self.profile = src.profile
                    self.profile.update(dtype='float32', count=1)

        # 20m Bands (Upsample to 10m)
        target_shape = self.bands['B02'].shape
        for b in ['B11', 'B12']:
            path = self._get_band_path(b, "R20m")
            with rasterio.open(path) as src:
                data = src.read(
                    1,
                    out_shape=target_shape,
                    resampling=Resampling.bilinear
                ).astype('float32') / 10000.0
                self.bands[b] = data

        print("All bands read and aligned to 10m resolution.")

    def crop_image(self, center_lat, center_lon, size_pixels=256):
        """
        Crops a patch around the given coordinates.
        """
        # Convert lat/lon to pixel coordinates
        # We need the transform from the profile
        if self.profile is None:
            raise ValueError("Bands not read yet.")
            
        # Note: This requires reprojecting lat/lon to the CRS of the image (usually UTM)
        # For simplicity, we assume the user might provide coordinates in the CRS or we implement reprojection
        # Here we will just implement a pixel-based crop for now if lat/lon conversion is complex without pyproj
        # But let's try to do it right with rasterio.warp if needed, or just assume inputs are consistent.
        
        # For this implementation, let's assume we are cropping from the center if coords are not provided,
        # or we implement a simple window read if we had the file open. 
        # Since we loaded data into memory (numpy), we can just slice.
        
        # TODO: Implement proper Lat/Lon to Pixel conversion. 
        # For now, returning a center crop for demonstration.
        h, w = self.bands['B02'].shape
        cy, cx = h // 2, w // 2
        half = size_pixels // 2
        
        slice_y = slice(cy - half, cy + half)
        slice_x = slice(cx - half, cx + half)
        
        cropped_bands = {}
        for b, data in self.bands.items():
            cropped_bands[b] = data[slice_y, slice_x]
            
        return cropped_bands

    def calculate_indices(self, bands_subset=None):
        """
        Calculates NDWI, MNDWI, NDVI, NDSI (using MNDWI formula here for water), Turbidity.
        """
        b = bands_subset if bands_subset else self.bands
        
        # Avoid division by zero
        epsilon = 1e-8
        
        indices = {}
        
        # NDWI (McFeeters) = (Green - NIR) / (Green + NIR)
        indices['NDWI'] = (b['B03'] - b['B08']) / (b['B03'] + b['B08'] + epsilon)
        
        # MNDWI (Xu) = (Green - SWIR1) / (Green + SWIR1)
        indices['MNDWI'] = (b['B03'] - b['B11']) / (b['B03'] + b['B11'] + epsilon)
        
        # NDVI = (NIR - Red) / (NIR + Red)
        indices['NDVI'] = (b['B08'] - b['B04']) / (b['B08'] + b['B04'] + epsilon)
        
        # Turbidity (Simple proxy: Red band or Green band magnitude)
        indices['Turbidity'] = b['B04'] 
        
        return indices

    def generate_rgb(self, bands_subset=None, output_path=None):
        b = bands_subset if bands_subset else self.bands
        
        # Stack B04, B03, B02
        rgb = np.stack([b['B04'], b['B03'], b['B02']], axis=-1)
        
        # Clip and normalize for visualization (0-0.3 reflectance is typical for land/water)
        rgb = np.clip(rgb * 3.5, 0, 1) # Brighten it up
        
        if output_path:
            plt.imsave(output_path, rgb)
            
        return rgb

    def create_composite(self, bands_subset=None):
        """
        Creates a 6-channel composite for the model.
        Order: B02, B03, B04, B08, B11, B12
        """
        b = bands_subset if bands_subset else self.bands
        composite = np.stack([
            b['B02'], b['B03'], b['B04'], b['B08'], b['B11'], b['B12']
        ], axis=0) # Channels first for PyTorch
        return composite

    def prepare_patches(self, output_dir, patch_size=256, stride=256):
        """
        Slides a window over the image and saves patches.
        """
        os.makedirs(output_dir, exist_ok=True)
        
        h, w = self.bands['B02'].shape
        
        idx = 0
        for y in range(0, h - patch_size, stride):
            for x in range(0, w - patch_size, stride):
                patch_bands = {}
                for b_name, data in self.bands.items():
                    patch_bands[b_name] = data[y:y+patch_size, x:x+patch_size]
                
                # Check if patch is valid (not empty/nodata)
                if np.mean(patch_bands['B02']) > 0:
                    # Save as .npy
                    composite = self.create_composite(patch_bands)
                    np.save(os.path.join(output_dir, f"patch_{idx}.npy"), composite)
                    idx += 1
        
        print(f"Generated {idx} patches in {output_dir}")

if __name__ == "__main__":
    # Example Usage
    safe_path = r"C:\Users\Urvashi\OneDrive\Desktop\AQUA_guardian_project\sential2_dataset\S2C_MSIL2A_20250918T053651_N0511_R005_T43QCE_20250918T105819.SAFE"
    processor = Sentinel2Processor(safe_path)
    processor.read_bands()
    
    # Generate RGB
    processor.generate_rgb(output_path="preview_rgb.png")
    
    # Calculate Indices
    indices = processor.calculate_indices()
    plt.imsave("preview_mndwi.png", indices['MNDWI'], cmap='RdBu')
    
    # Generate Patches
    processor.prepare_patches("data/satellite_patches")
