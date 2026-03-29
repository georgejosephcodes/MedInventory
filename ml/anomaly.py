from sklearn.ensemble import IsolationForest
import numpy as np

def detect_anomalies(logs):
    # logs is a list of dicts: { "id": "...", "quantity": 5, "medicineId": "..." }
    
    if len(logs) < 10:
        return []
    
    # Group logs by medicine
    from collections import defaultdict
    medicine_logs = defaultdict(list)
    for log in logs:
        medicine_logs[log["medicineId"]].append(log)
    
    anomalous_ids = []
    
    for medicine_id, med_logs in medicine_logs.items():
        # Need at least 5 logs per medicine
        if len(med_logs) < 5:
            continue
        
        ids = [log["id"] for log in med_logs]
        quantities = np.array([log["quantity"] for log in med_logs]).reshape(-1, 1)
        
        model = IsolationForest(contamination=0.01, random_state=42)
        predictions = model.fit_predict(quantities)
        
        flagged = [ids[i] for i, pred in enumerate(predictions) if pred == -1]
        anomalous_ids.extend(flagged)
    
    return anomalous_ids