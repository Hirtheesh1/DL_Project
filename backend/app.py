import os
import io
import csv
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

app = Flask(__name__)
CORS(app)

# ── Global state ────────────────────────────────────────────────────
model = None
scaler = None
X_test = None
y_test = None
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'Epileptic Seizure Recognition.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'best_rnn_model.keras')

def load_resources():
    """Load model, scaler and test data once at startup."""
    global model, scaler, X_test, y_test

    # ── Load & preprocess dataset ────────────────────────────────────
    data = pd.read_csv(DATA_PATH)
    if 'Unnamed' in data.columns[0]:
        data = data.drop(columns=[data.columns[0]])

    X = data.iloc[:, :-1].values
    y = data.iloc[:, -1].values
    y[y > 1] = 0  # binary: seizure vs non-seizure

    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.20, random_state=42, shuffle=True)
    X_test, _, y_test, _ = X_temp, y_temp, y_temp, None   # keep all for sampling

    scaler = StandardScaler()
    scaler.fit(X_train)
    X_test = X_test  # raw; scaled on demand

    # ── Load Keras model ─────────────────────────────────────────────
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH)
        print("✅  Model loaded from", MODEL_PATH)
    except Exception as exc:
        print(f"⚠️  Could not load model: {exc}")
        model = None

load_resources()

# ── Helpers ──────────────────────────────────────────────────────────

def run_predict(features: np.ndarray):
    """Scale features → reshape → predict → return proba & label."""
    scaled = scaler.transform(features)
    reshaped = scaled.reshape(scaled.shape[0], scaled.shape[1], 1)
    proba = float(model.predict(reshaped, verbose=0)[0][0])
    label = 1 if proba >= 0.5 else 0
    confidence = proba if label == 1 else 1 - proba
    return proba, label, confidence


# ── Routes ───────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'scaler_ready': scaler is not None,
    })


@app.route('/api/model-info', methods=['GET'])
def model_info():
    layers = []
    if model:
        for layer in model.layers:
            layers.append({
                'name': layer.name,
                'type': layer.__class__.__name__,
                'output_shape': str(layer.output_shape) if hasattr(layer, 'output_shape') else 'N/A',
            })
    return jsonify({
        'name': 'LSTM Epilepsy Seizure Detector',
        'accuracy': 97.65,
        'loss': 0.0607,
        'precision': {
            'class_0': 0.9855,
            'class_1': 0.9391,
            'macro_avg': 0.9623,
            'weighted_avg': 0.9765,
        },
        'recall': {
            'class_0': 0.9855,
            'class_1': 0.9391,
            'macro_avg': 0.9623,
            'weighted_avg': 0.9765,
        },
        'f1_score': {
            'class_0': 0.9855,
            'class_1': 0.9391,
            'macro_avg': 0.9623,
            'weighted_avg': 0.9765,
        },
        'confusion_matrix': [[1830, 27], [27, 416]],
        'total_samples': 11500,
        'test_samples': 2300,
        'features': 178,
        'architecture': {
            'layers': [
                {'type': 'LSTM', 'units': 64, 'return_sequences': True},
                {'type': 'Dropout', 'rate': 0.2},
                {'type': 'LSTM', 'units': 64, 'return_sequences': False},
                {'type': 'Dropout', 'rate': 0.2},
                {'type': 'Dense', 'units': 64, 'activation': 'relu'},
                {'type': 'Dropout', 'rate': 0.2},
                {'type': 'Dense', 'units': 32, 'activation': 'relu'},
                {'type': 'Dense', 'units': 1, 'activation': 'sigmoid'},
            ]
        },
        'optimizer': 'Adam',
        'loss_fn': 'Binary Cross-Entropy',
        'epochs_trained': 12,
        'batch_size': 128,
        'dataset': 'Epileptic Seizure Recognition (UCI)',
        'layers': layers,
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    body = request.get_json(force=True)
    features = body.get('features')

    if features is None or len(features) != 178:
        return jsonify({'error': f'Expected 178 features, got {len(features) if features else 0}'}), 400

    arr = np.array(features, dtype=float).reshape(1, -1)
    proba, label, confidence = run_predict(arr)

    return jsonify({
        'prediction': int(label),
        'label': 'Seizure' if label == 1 else 'Non-Seizure',
        'probability': round(proba, 6),
        'confidence': round(confidence * 100, 2),
        'risk_level': 'High' if proba >= 0.75 else ('Medium' if proba >= 0.5 else 'Low'),
    })


@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    body = request.get_json(force=True)
    samples = body.get('samples', [])

    if not samples:
        return jsonify({'error': 'No samples provided'}), 400

    arr = np.array(samples, dtype=float)
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    if arr.shape[1] != 178:
        return jsonify({'error': f'Each sample must have 178 features'}), 400

    scaled = scaler.transform(arr)
    reshaped = scaled.reshape(scaled.shape[0], scaled.shape[1], 1)
    probas = model.predict(reshaped, verbose=0).flatten()

    results = []
    for i, proba in enumerate(probas):
        proba = float(proba)
        label = 1 if proba >= 0.5 else 0
        confidence = proba if label == 1 else 1 - proba
        results.append({
            'index': i,
            'prediction': label,
            'label': 'Seizure' if label == 1 else 'Non-Seizure',
            'probability': round(proba, 6),
            'confidence': round(confidence * 100, 2),
            'risk_level': 'High' if proba >= 0.75 else ('Medium' if proba >= 0.5 else 'Low'),
        })

    seizure_count = sum(1 for r in results if r['prediction'] == 1)
    return jsonify({
        'results': results,
        'summary': {
            'total': len(results),
            'seizures': seizure_count,
            'non_seizures': len(results) - seizure_count,
            'seizure_rate': round(seizure_count / len(results) * 100, 2),
        }
    })


@app.route('/api/sample', methods=['GET'])
def get_sample():
    """Return a random EEG sample with its true label for demo."""
    idx = np.random.randint(0, len(X_test))
    features = X_test[idx].tolist()
    true_label = int(y_test[idx])
    return jsonify({
        'features': features,
        'true_label': true_label,
        'true_label_name': 'Seizure' if true_label == 1 else 'Non-Seizure',
        'sample_index': idx,
    })


@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400

    try:
        # Read the CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.reader(stream)
        rows = list(reader)
        
        if not rows:
            return jsonify({'error': 'CSV file is empty'}), 400
            
        # Check if first row is header
        start_idx = 0
        try:
            float(rows[0][0])
        except ValueError:
            start_idx = 1 # skip header

        samples = []
        for i in range(start_idx, len(rows)):
            row = rows[i]
            # Some CSVs might have 'Unnamed' index as first col, or label as last col
            # We try to keep only 178 numeric features.
            # If row has > 178 cols, we take the FIRST 178 that are numeric.
            numeric_vals = []
            for val in row:
                try:
                    numeric_vals.append(float(val))
                except ValueError:
                    continue
            
            if len(numeric_vals) >= 178:
                samples.append(numeric_vals[:178])

        if not samples:
            return jsonify({'error': 'No valid samples found (need at least 178 numeric columns)'}), 400

        # Run batch prediction
        arr = np.array(samples, dtype=float)
        scaled = scaler.transform(arr)
        reshaped = scaled.reshape(scaled.shape[0], scaled.shape[1], 1)
        probas = model.predict(reshaped, verbose=0).flatten()

        results = []
        for i, proba in enumerate(probas):
            proba = float(proba)
            label = 1 if proba >= 0.5 else 0
            results.append({
                'index': i,
                'prediction': label,
                'label': 'Seizure' if label == 1 else 'Non-Seizure',
                'probability': round(proba, 6),
                'risk_level': 'High' if proba >= 0.75 else ('Medium' if proba >= 0.5 else 'Low'),
            })

        seizure_count = sum(1 for r in results if r['prediction'] == 1)
        return jsonify({
            'filename': file.filename,
            'summary': {
                'total': len(results),
                'seizures': seizure_count,
                'non_seizures': len(results) - seizure_count,
                'seizure_rate': round(seizure_count / len(results) * 100, 2),
            },
            'results': results[:100] # return first 100 for preview
        })

    except Exception as e:
        return jsonify({'error': f'Parsing error: {str(e)}'}), 500


@app.route('/api/stats', methods=['GET'])
def stats():
    """High-level project statistics."""
    return jsonify({
        'dataset': {
            'name': 'Epileptic Seizure Recognition',
            'source': 'UCI Machine Learning Repository',
            'total_samples': 11500,
            'features': 178,
            'classes': ['Non-Seizure (0)', 'Seizure (1)'],
            'class_distribution': {'seizure': 2300, 'non_seizure': 9200},
            'train_samples': 7360,
            'test_samples': 2300,
        },
        'model': {
            'type': 'LSTM (Long Short-Term Memory)',
            'accuracy': 97.65,
            'precision': 96.23,
            'recall': 96.23,
            'f1_score': 96.23,
            'epochs': 12,
            'parameters': '~186k',
        }
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
