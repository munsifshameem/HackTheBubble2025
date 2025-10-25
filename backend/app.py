from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/submit-journey', methods = ['POST'])
def submit_journey():
    data = request.json
    distance = data.get('distance')

    if distance is None:
        return jsonify({'error': 'Distance not provided'}), 400
    
    # calculate score based on distance 1 point for every 100m traveled
    score = distance / 100

    return jsonify({'score': score, 'distance': distance}), 200

if __name__ == '__main__':
    app.run(debug=True)

    