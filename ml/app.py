from flask import Flask, request, jsonify
from anomaly import detect_anomalies

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    logs = data.get('logs', [])
    
    anomalous_ids = detect_anomalies(logs)
    
    return jsonify({
        "success": True,
        "anomalousIds": anomalous_ids
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)