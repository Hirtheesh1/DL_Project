# NeuroScan AI — Epilepsy Seizure Detection

A professional full-stack web application for LSTM-based Epileptic Seizure Detection.

## 🗂️ Project Structure
```
DL_Project-main/
├── Epileptic Seizure Recognition.csv   ← Dataset
├── best_rnn_model.keras                ← Trained LSTM model (run notebook first)
├── DL.ipynb                            ← Training notebook
├── DL0.ipynb                           ← Alternate notebook
├── backend/
│   ├── app.py                          ← Flask REST API
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/                 ← All React components
    │   ├── services/api.js             ← Axios API layer
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 🚀 Quick Start

### 1. Train the model (if `best_rnn_model.keras` doesn't exist)
Open and run `DL.ipynb` in Jupyter/Colab to generate `best_rnn_model.keras`.

### 2. Start the Backend (Flask)
```powershell
cd d:\DL_Project-main\backend
pip install -r requirements.txt
python app.py
# API runs at http://localhost:5000
```

### 3. Start the Frontend (React + Vite)
```powershell
cd d:\DL_Project-main\frontend
npm install      # (already done)
npm run dev
# App runs at http://localhost:5173
```

## 🔌 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check if backend is online |
| GET | `/api/model-info` | Model architecture & metrics |
| GET | `/api/stats` | Dataset statistics |
| GET | `/api/sample` | Random EEG sample from test set |
| POST | `/api/predict` | Predict seizure for 178 features |
| POST | `/api/batch-predict` | Predict for multiple samples |

## 🌟 Features
- **Live Prediction** — Load real EEG samples or enter custom feature values
- **Feature Heatmap** — 178-cell colour-coded heatmap of EEG amplitudes
- **Confidence Ring** — SVG confidence gauge with risk colouring
- **Metrics Dashboard** — Confusion matrix, precision/recall/F1 bars
- **Training History** — Interactive accuracy & loss charts (12 epochs)
- **Model Architecture** — Visual LSTM layer pipeline
- **Dataset Explorer** — Class distribution pie chart + dataset facts
- **Prediction History** — Session history table with correctness tracking
- **Backend Status** — Live API health indicator in navbar

## 🏗️ Tech Stack
**Backend:** Python, Flask, TensorFlow/Keras, scikit-learn, NumPy, Pandas
**Frontend:** React 18, Vite, Recharts, Axios, react-hot-toast, react-icons
