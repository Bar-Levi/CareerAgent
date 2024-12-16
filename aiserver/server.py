from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "CareerAgent AI Server is running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    # Perform prediction logic here
    return jsonify({'prediction': 'dummy prediction'})

if __name__ == '__main__':
    app.run(port=5000)
