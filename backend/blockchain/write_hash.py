import hashlib
import json
from typing import Optional

try:
    from .contract_interface import log_report
    BLOCKCHAIN_AVAILABLE = True
except (ImportError, EnvironmentError):
    print("Blockchain interface not available. Logging disabled.")
    BLOCKCHAIN_AVAILABLE = False

def generate_hash(data: dict) -> str:
    """Generates SHA256 hash of the report data for integrity verification.
    Returns a hex string prefixed with 0x.
    """
    # Use deterministic serialization
    serialized = json.dumps(data, sort_keys=True, default=str).encode('utf-8')
    hash_hex = hashlib.sha256(serialized).hexdigest()
    return f"0x{hash_hex}"

def generate_location_hash(lat: float, lng: float) -> str:
    """Generates a privacy-preserving hash of the location coordinates.
    """
    coord_str = f"{lat:.4f},{lng:.4f}" # Round to ~11m precision for hashing
    hash_hex = hashlib.sha256(coord_str.encode('utf-8')).hexdigest()
    return f"0x{hash_hex}"

def write_hash_to_chain(
    report_hash: str, 
    report_id: str, 
    ai_decision: str, 
    reviewer_decision: str, 
    location_hash: str
) -> Optional[str]:
    """Writes the report metadata to the blockchain.
    Returns the transaction hash as a hex string.
    """
    if not BLOCKCHAIN_AVAILABLE:
        return None

    try:
        numerical_id, tx_hash = log_report(
            report_hash, 
            report_id, 
            ai_decision, 
            reviewer_decision, 
            location_hash
        )
        print(f"Report logged to blockchain. DB ID: {report_id}, BC ID: {numerical_id}, Tx: {tx_hash}")
        return tx_hash
        
    except Exception as e:
        print(f"Blockchain error: {e}")
        return None
