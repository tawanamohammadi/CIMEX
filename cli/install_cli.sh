#!/bin/bash
# Install CLI tools globally

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Install cimex (panel CLI)
sudo cp "$SCRIPT_DIR/cimex.py" /usr/local/bin/cimex
sudo chmod +x /usr/local/bin/cimex
echo "Installed cimex to /usr/local/bin/cimex"

# Install cimex-node (node CLI)
sudo cp "$SCRIPT_DIR/cimex-node.py" /usr/local/bin/cimex-node
sudo chmod +x /usr/local/bin/cimex-node
echo "Installed cimex-node to /usr/local/bin/cimex-node"

# Make Python scripts executable
chmod +x /usr/local/bin/cimex
chmod +x /usr/local/bin/cimex-node

echo "CLI tools installed successfully!"

