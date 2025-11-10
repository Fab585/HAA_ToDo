# HABoard Development Container
FROM python:3.11-bullseye

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Common utilities
    git \
    curl \
    wget \
    vim \
    nano \
    # Build tools
    build-essential \
    # SQLite
    sqlite3 \
    libsqlite3-dev \
    # For HA dependencies
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    zlib1g-dev \
    autoconf \
    # Network tools
    iputils-ping \
    net-tools \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python development tools
RUN pip install --no-cache-dir \
    # Testing
    pytest \
    pytest-asyncio \
    pytest-cov \
    pytest-homeassistant-custom-component \
    # Linting & formatting
    ruff \
    black \
    mypy \
    # Security
    bandit \
    safety \
    # Pre-commit hooks
    pre-commit \
    # Home Assistant development
    homeassistant \
    # Debugging
    ipython \
    ipdb

# Set working directory
WORKDIR /workspaces/HAA_ToDo

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=dialog

# Default command
CMD ["/bin/bash"]
