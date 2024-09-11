from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd

app = Flask(__name__, static_folder='../client/build')
CORS(app)

airport_df = pd.read_csv('airport_list.csv')

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/airports', methods=['GET'])
def get_data():
    query = request.args.get('query')
    if (len(query) < 3):
        return jsonify([])
    filtered_df = airport_df[airport_df['city'].str.contains(query, case=False, na=False) | airport_df['name'].str.contains(query, case=False, na=False)]
    airports = filtered_df[['id','name','city','latitude','longitude']].to_dict(orient='records')
    return jsonify(airports)

if __name__ == "__main__":
    app.run(debug=True)