
# PuppetOS

Welcome to **PuppetOS**, an open-source AI Agent framework designed to tackle the challenges of memory, knowledge, and plugin management in AI Agent development.

## Overview

PuppetOS aims to:
- Enhance **memory** and **context management** with systems like RAG or custom mechanisms.
- Provide dynamic **knowledge integration** where agents can learn from interactions.
- Offer a **modular plugin system** to encourage community contributions and versatility.
- Support both **chat-based** and **tool-based training** for accessibility and precision.
- **Offer different functionalities** like:
  - Buying groceries online
  - Ordering things online
  - Ordering food
  - Handling other basic tasks we do on a day-to-day basis

## Target Features

- **Memory Management**: Efficient long-term and real-time context management.
- **Knowledge Growth**: Agents adapt and learn from interactions and updates.
- **Plugin Architecture**: Easily extendable with community-developed plugins.
- **Training Flexibility**: User-friendly chat and developer-focused tools for agent training.
- **Platform Support**: Currently focused on X, Discord and Telegram, with more to come.

## Getting Started

### Installation

```sh
# Clone the repository
git clone https://github.com/juanc07/PuppetOS.git

# Navigate to the project directory
cd PuppetOS

# Ensure pnpm is installed globally
npm install -g pnpm

# Install dependencies
pnpm install
```

---

## PuppetOS Project Commands Guide

This guide explains how to set up, run, and manage the PuppetOS project using pnpm. It includes the proper order for running commands, their purposes, and additional details to ensure everything works smoothly.

---

## **Command Execution Order and Purpose**

### 1. **Install Dependencies**
   Run this command to install all required dependencies for the project.
   ```bash
   pnpm install
   ```
   - **Why**: This command ensures that all dependencies defined in the root `package.json` and workspace packages (e.g., `src`, `plugins`, etc.) are installed.
   - **When to Run**: Run this when cloning the project for the first time or after pulling changes that modify `package.json`.

---

### 2. **Clean Previous Builds**
   Use the `clean` command to remove old build artifacts from the project.
   ```bash
   pnpm run clean
   ```
   - **Why**: Removes the `dist` directory to ensure a fresh and clean build environment.
   - **When to Run**: Run this before building the project to avoid conflicts with outdated files.

---

### 3. **Build the Project**
   Compile TypeScript files into JavaScript for production.
   ```bash
   pnpm run build
   ```
   - **Why**: This command compiles the source code (in `src/`) into production-ready JavaScript and outputs it to the `dist` directory.
   - **When to Run**: Run this when preparing for deployment or starting the project in production mode.

---

### 4. **Start the Application**
   Start the application in production mode using the compiled JavaScript files.
   ```bash
   pnpm run start
   ```
   - **Why**: Executes the compiled application from the `dist` directory.
   - **When to Run**: Use this to start the app in a production environment.

---

### 5. **Development Mode**
   Use the `dev` command to run the application directly with `ts-node` for local development.
   ```bash
   pnpm run dev
   ```
   - **Why**: Allows running TypeScript files directly without pre-compiling them, making it faster for development.
   - **When to Run**: Use this during development to test changes quickly.

---

### 6. **Run Tests**
   Run all tests across the workspace to validate functionality.
   ```bash
   pnpm run test
   ```
   - **Why**: Ensures that all components, plugins, and features work as expected.
   - **When to Run**: Before pushing changes or preparing a release.

---

## **Full Command Reference**

### **Scripts Defined in `package.json`**
| Command          | Description                                        |
|------------------|----------------------------------------------------|
| `pnpm install`   | Installs all dependencies for the workspace.       |
| `pnpm run clean` | Removes the `dist` directory for a fresh build.    |
| `pnpm run build` | Compiles TypeScript files to JavaScript.           |
| `pnpm run start` | Starts the application in production mode.         |
| `pnpm run dev`   | Starts the application in development mode.        |
| `pnpm run test`  | Runs all tests across the workspace.               |

---

## **Tips for Using pnpm Effectively**
1. **Workspaces**:
   - The project uses a pnpm workspace, so dependencies shared across modules are managed efficiently.
   - The `pnpm install` command automatically resolves dependencies for all sub-packages (e.g., `src/**`, `plugins/**`).

2. **Environment Setup**:
   - Ensure `pnpm` is installed globally:
     ```bash
     npm install -g pnpm
     ```

3. **Cross-Platform Support**:
   - The `clean` script uses `rimraf`, a cross-platform utility for deleting directories. Ensure it’s installed as a dev dependency in the root workspace.

---

Following this guide ensures that you can efficiently manage and execute PuppetOS commands while avoiding common pitfalls.
