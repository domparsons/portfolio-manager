# Portfolio Manager

Portfolio Manager is a full-featured investment tracking and analysis tool, built as my final-year Computer Science project. It enables users to track, backtest, and optimise their investment portfolios with advanced analytics and simulations.


## Key Features  

### 🔹 Portfolio & Asset Management  
- Create and manage investment portfolios.  
- Track performance, asset allocations, and risk exposure.  
- Maintain a **watchlist** to monitor key assets.  

### 🔹 Advanced Backtesting  
- Run backtests using **historical stock data** (via Yahoo Finance).  
- Implement and evaluate strategies (e.g., moving averages, momentum).  
- View **detailed performance metrics** (Sharpe ratio, max drawdown, volatility).  

### 🔹 Monte Carlo Simulations  
- Predict potential portfolio performance under different market conditions.  
- Model **volatility, asset correlations, and risk-adjusted returns**.  
- Visualize probability distributions of future outcomes.  

### 🔹 Interactive Analytics & Reporting  
- Generate **performance reports** (export to CSV, PDF).  
- View data through **interactive charts** and visualizations.  
- Optimize **asset allocations** for better risk-reward balance.  

### 🔹 Secure & Scalable Architecture  
- User authentication & authorization.  
- Backend built with **FastAPI & SQLite** (support for future DB migration).  
- Caching mechanism to optimize API usage.  


## Prerequisites  

Before installing, ensure you have:  

- **Python 3.12+** installed. [Download here](https://www.python.org/downloads/)  
- **Node.js (v18+) & npm** installed. [Download here](https://nodejs.org/)  
- **A valid API key** (if required for Yahoo Finance or other data sources).  
- **Git** installed for cloning the repository.  

You can check your versions by running:  

```bash
python --version  # Should be 3.12+
node -v           # Should be v18+
npm -v            # Should match Node.js version
git --version     # Ensure Git is installed
```


## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/domparsons/portfolio-manager.git
    ```

2. Set up a virtual environment and install the required API dependencies:

    ```bash
    cd portfolio-api
    uv sync
    ```

3. Install the required frontend dependencies:

    ```bash
    cd portfolio-dashboard 
    npm install
    ```

## Usage

**Run the Script**: After installing the dependencies, you can run the application
