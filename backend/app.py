from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/submit-journey', methods = ['POST'])
def submit_journey():
    data = request.json
    
    