+++
title = "mnist-from-scratch README"
description = "README mirror for mnist-from-scratch"
draft = false
+++

[Repository](https://github.com/sguzman/mnist-from-scratch) | [DeepWiki](https://deepwiki.com/sguzman/mnist-from-scratch/)

# MNIST from Scratch in Rust

A high-performance, educational machine learning laboratory for the MNIST
dataset, built entirely from scratch in Rust. This project implements
fundamental ML architectures without high-level frameworks (like PyTorch or
TensorFlow), focusing on raw mathematical implementation and terminal-based
visualization.

> [!TIP]
> **New to Machine Learning?** Check out our comprehensive
> [Training Guide](./TRAINING_GUIDE.md) to learn how these models actually
> "think" and learn!

## 🚀 Key Features

- **Custom Dataset Pipeline**: Hand-written parser for the IDX binary format and
  an automated downloader/cache manager.
- **Hierarchical Model Suite**:
  - **Perceptron**: Multiclass mistake-driven linear classifier.
  - **Softmax Regression**: Probabilistic linear model with cross-entropy loss.
  - **Multi-Layer Perceptron (MLP)**: 3-layer neural network (784 -> 128 -> 10)
    with ReLU activation and manual backpropagation.
- **Neural Visualization Lab**:
  - **Activation Maximization**: "Reverse-engineer" what the model thinks is an
    ideal digit using gradient ascent.
  - **Ground Truth Analysis**: Compute and visualize the statistical average of
    digits in the training set.
  - **High-Fidelity ASCII**: Advanced terminal renderer using Gaussian
    blurring, gamma correction, and shaded block characters.
- **Robust CLI**: A single entry point (`mnist-lab`) for the entire ML lifecycle.
- **Predictor**: Real-world prediction from 28x28 PNG images.

## 🛠 Installation

Requires [Rust and Cargo](https://rustup.rs/).

```bash
git clone https://github.com/sguzman/mnist-from-scratch
cd mnist-from-scratch
cargo build --release
```

## 🧪 The MNIST Laboratory (`mnist-lab`)

The `mnist-lab` binary provides a comprehensive toolkit for experimentation.

### 1. Data Acquisition

Automatically download and extract the MNIST dataset into a local cache.

```bash
cargo run --release --bin mnist-lab -- fetch
```

### 2. Model Training

Train any supported architecture with configurable hyperparameters.

```bash
# Train the MLP (Highest accuracy)
cargo run --release --bin mnist-lab -- train --model-type mlp --epochs 10 --lr 0.01

# Train a fast Softmax baseline
cargo run --release --bin mnist-lab -- train --model-type softmax --epochs 5 --lr 0.1
```

### 3. Evaluation

Run the model against the 10,000-image test set to measure performance.

```bash
cargo run --release --bin mnist-lab -- eval --path model.json --model-type mlp
```

### 4. Digit Visualization (Generate)

Explore the model's internal representations or compare against ground truth.

```bash
# See the statistical "Ground Truth" for digit 3
cargo run --release --bin mnist-lab -- generate --digit 3 --model-type average

# See the MLP's "Ideal" representation of digit 3
cargo run --release --bin mnist-lab -- generate --digit 3 --model-type mlp --path model.json
```

### 5. PNG Prediction

Test the model on your own handwritten digits (must be 28x28 PNG).

```bash
cargo run --release --bin mnist-lab -- predict --path my_digit.png --model-type mlp --model-path model.json
```

## 🧠 Technical Implementation

- **Linear Algebra**: Powered by `ndarray` for efficient matrix operations.
- **Optimization**: MLP training uses manual backpropagation with the Chain Rule.
- **Visualization Priors**: The `generate` command for MLPs uses **Total
  Variation (TV) Regularization** and **Gradient Smoothing** to produce clean,
  connected shapes instead of adversarial noise.
- **Persistence**: Models are serialized/deserialized using `serde_json` for
  cross-platform portability.

## 📊 Expected Performance

| Model | Epochs | Accuracy | Training Time |
| :--- | :---: | :---: | :--- |
| Perceptron | 5 | ~88% | < 1s |
| Softmax | 10 | ~92% | ~2s |
| MLP | 15 | ~97% | ~15s |

---

*Created as a deep-dive into fundamental machine learning and high-performance
Rust.*
