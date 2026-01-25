from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='.')
CORS(app)

# 環境変数からAPIキーとパスワードを取得
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
APP_PASSWORD = os.getenv('APP_PASSWORD', 'archienhance2024')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/config')
def get_config():
    """クライアントに必要な設定を返す（APIキーは含まない）"""
    return jsonify({
        'password': APP_PASSWORD,
        'hasApiKey': bool(GEMINI_API_KEY)
    })

@app.route('/api/generate', methods=['POST'])
def generate():
    """Gemini APIへのプロキシエンドポイント"""
    if not GEMINI_API_KEY:
        return jsonify({'error': 'APIキーが設定されていません'}), 500

    try:
        data = request.json

        # Gemini APIにリクエスト (gemini-2.0-flash-exp-image-generation)
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={GEMINI_API_KEY}',
            json={
                'contents': [{
                    'parts': data.get('parts', [])
                }],
                'generationConfig': {
                    'responseModalities': ['TEXT', 'IMAGE']
                }
            },
            headers={'Content-Type': 'application/json'},
            timeout=120
        )

        if response.status_code != 200:
            error_data = response.json()
            return jsonify({'error': error_data.get('error', {}).get('message', 'API request failed')}), response.status_code

        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({'error': 'リクエストがタイムアウトしました'}), 504
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
