# 🌊 AQUA Guardian

**AI-Powered Water Pollution Monitoring & Reporting System**

AQUA Guardian is a comprehensive platform designed to empower citizens and authorities to monitor, report, and combat water pollution. It leverages AI for automated pollution classification, blockchain for immutable record-keeping, and a modern dashboard for real-time analytics.

## 🚀 Features

- **📸 AI-Powered Reporting**: Upload photos of water bodies; our CNN model automatically detects pollution types (Plastic, Oil Spill, Sewage, etc.).
- **🛡️ Blockchain Verification**: Reports are hashed and logged to a blockchain for transparency and immutability.
- **📊 Real-Time Dashboard**: Visualize pollution hotspots, water quality trends, and marine impact metrics.
- **📍 Geolocation**: Pinpoint exact locations of pollution incidents.
- **🏆 Gamification**: Earn rewards and NFTs for contributing to a cleaner environment.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Python, FastAPI, TensorFlow/Keras
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: Custom CNN model for image classification
- **Blockchain**: Ethereum/Polygon (Simulated/Testnet)

## 🏁 Quick Start

### Prerequisites

- Node.js & npm
- Python 3.9+
- Docker (Optional)

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt

# Create .env file with Supabase credentials (see backend/README.md)
# Run the server
python -m uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## 📂 Project Structure

- `backend/`: FastAPI server, ML models, and API logic.
- `frontend/`: React application and UI components.
- `data/`: Datasets and raw data files.
- `docs/`: Project documentation.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
