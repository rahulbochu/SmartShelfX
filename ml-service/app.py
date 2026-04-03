from flask import Flask, request, jsonify
import numpy as np
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

def train_and_predict(transactions, days_to_predict=7):
    if len(transactions) < 2:
        # Not enough data, use average
        avg = sum(transactions) / len(transactions) if transactions else 1.0
        return avg * days_to_predict, "Average Baseline"

    X = np.array(range(len(transactions))).reshape(-1, 1)
    y = np.array(transactions, dtype=float)

    if len(transactions) >= 5:
        # Enough data — use XGBoost
        model = XGBRegressor(
            n_estimators=100,      # 100 boosting rounds
            learning_rate=0.1,     # how fast it learns
            max_depth=3,           # tree depth
            random_state=42,
            verbosity=0            # silent mode
        )
        model.fit(X, y)
        model_used = "XGBoost"
    else:
        # Not enough data — fallback to Linear Regression
        model = LinearRegression()
        model.fit(X, y)
        model_used = "Linear Regression"

    # Predict next 7 days
    future_X = np.array(range(len(transactions),
                  len(transactions) + days_to_predict)).reshape(-1, 1)
    predictions = model.predict(future_X)

    return max(0, float(sum(predictions))), model_used

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(silent=True) or {}

        product_id = data.get('productId')
        current_stock = data.get('currentStock', 0)
        transactions = data.get('transactions', [])
        # Normalize and guard input to keep model path predictable.
        if not isinstance(transactions, list):
            return jsonify({'error': 'transactions must be a list of numbers'}), 400
        transactions = [float(value) for value in transactions]
        reorder_level = data.get('reorderLevel', 10)

        # Get predicted demand and model used
        predicted_demand, model_used = train_and_predict(transactions)

        # Average daily usage
        avg_daily_usage = sum(transactions) / len(transactions) if transactions else 1.0

        # Days until stockout
        days_until_stockout = int(current_stock / avg_daily_usage) if avg_daily_usage > 0 else 999

        # Risk level
        if days_until_stockout <= 3:
            risk_level = "HIGH"
            recommendation = "URGENT: Restock immediately!"
        elif days_until_stockout <= 7:
            risk_level = "MEDIUM"
            recommendation = "Restock within next 3 days"
        else:
            risk_level = "LOW"
            recommendation = "Stock level is healthy"

        return jsonify({
            'productId': product_id,
            'predictedDemand': round(predicted_demand, 2),
            'averageDailyUsage': round(avg_daily_usage, 2),
            'daysUntilStockout': days_until_stockout,
            'riskLevel': risk_level,
            'recommendation': recommendation,
            'modelUsed': model_used
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'SmartShelfX ML Service',
        'status': 'running',
        'endpoints': ['/health', '/predict']
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'Python ML Service is running!',
        'model': 'XGBoost'
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)