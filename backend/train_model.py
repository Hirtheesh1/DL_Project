"""
train_model.py
==============
Extracts and runs the exact training code from DL.ipynb.
Uses the local GPU (if available) to train the LSTM model and saves
best_rnn_model.keras directly inside the backend/ folder.

Run once before starting the Flask server:
    python backend/train_model.py
"""

import os
import numpy as np
import tensorflow as tf
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix

# ─── GPU configuration ───────────────────────────────────────────────────────
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"✅  GPU(s) found: {[g.name for g in gpus]}")
        print("    Training will use GPU acceleration.")
    except RuntimeError as e:
        print(f"⚠️  GPU config error: {e}")
else:
    print("ℹ️  No GPU found — training on CPU (will be slower).")

# ─── Paths ────────────────────────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH   = os.path.join(BACKEND_DIR, '..', 'Epileptic Seizure Recognition.csv')
MODEL_PATH  = os.path.join(BACKEND_DIR, 'best_rnn_model.keras')

print("\n" + "=" * 60)
print("  LSTM Epilepsy Seizure Prediction — Model Training")
print("=" * 60)

# ─── Load data (exact notebook code) ─────────────────────────────────────────
print("\n[1/4] Loading dataset ...")
data = pd.read_csv(DATA_PATH)

# The notebook drops the column whose header starts with 'Unnamed'
unnamed_cols = [c for c in data.columns if 'Unnamed' in c]
if unnamed_cols:
    data = data.drop(columns=unnamed_cols)

X = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

# Binary: class 1 = seizure, everything else = 0 (non-seizure)
y[y > 1] = 0

print(f"    Dataset shape : {data.shape}")
print(f"    Seizures (1)  : {y.sum()}  /  Total: {len(y)}"
      f"  ({y.mean() * 100:.1f}%)")

# ─── Split & scale (exact notebook code) ─────────────────────────────────────
print("\n[2/4] Splitting & scaling ...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, shuffle=True
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

X_train_scaled = X_train_scaled.reshape(
    (X_train_scaled.shape[0], X_train_scaled.shape[1], 1))
X_test_scaled  = X_test_scaled.reshape(
    (X_test_scaled.shape[0],  X_test_scaled.shape[1],  1))

print(f"    Train shape   : {X_train_scaled.shape}")
print(f"    Test shape    : {X_test_scaled.shape}")

# ─── Build model (exact notebook code) ───────────────────────────────────────
print("\n[3/4] Building model ...")
model = Sequential()
model.add(LSTM(64, return_sequences=True))
model.add(Dropout(0.2))
model.add(LSTM(64, return_sequences=False))
model.add(Dropout(0.2))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(32, activation='relu'))
model.add(Dense(1, activation='sigmoid'))

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
model.summary()

# ─── Train (exact notebook code, save to backend/) ───────────────────────────
print(f"\n[4/4] Training  →  model will be saved to:\n      {MODEL_PATH}\n")

callbacks = [
    EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
    ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor='val_loss'),
]

history = model.fit(
    X_train_scaled, y_train,
    epochs=150,
    batch_size=128,
    validation_split=0.2,
    callbacks=callbacks,
)

# ─── Evaluate ─────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  Evaluation on held-out test set")
print("=" * 60)

loss, accuracy = model.evaluate(X_test_scaled, y_test)
print(f"Loss     : {loss:.4f}")
print(f"Accuracy : {accuracy * 100:.2f}%")
print(f"Test Loss: {loss:.4f},  Test Accuracy: {accuracy:.4f}")

predictions = model.predict(X_test_scaled)
predictions = (predictions > 0.5).astype(int)
print("\n" + classification_report(y_test, predictions))
print("Confusion Matrix:")
print(confusion_matrix(y_test, predictions))

print(f"\n✅  model saved → {MODEL_PATH}")
print("    Start the backend with:  python backend/app.py")
