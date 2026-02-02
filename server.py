from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
import time

app = Flask(__name__, static_folder='.')
CORS(app)

# リトライ設定
MAX_RETRIES = 3
RETRY_DELAY = 5  # 秒

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
        last_error = None

        # リトライループ
        for attempt in range(MAX_RETRIES):
            # Gemini APIにリクエスト (Gemini 3 Pro Image Preview)
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={GEMINI_API_KEY}',
                json={
                    'contents': [{
                        'parts': data.get('parts', [])
                    }],
                    'generationConfig': {
                        'responseModalities': ['TEXT', 'IMAGE']
                    }
                },
                headers={'Content-Type': 'application/json'},
                timeout=180
            )

            if response.status_code == 200:
                return jsonify(response.json())

            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'API request failed')

            # 過負荷エラーの場合はリトライ
            if response.status_code == 503 or 'overloaded' in error_message.lower():
                last_error = error_message
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))  # 徐々に待機時間を増やす
                    continue

            # その他のエラーは即座に返す
            return jsonify({'error': error_message}), response.status_code

        # リトライ回数を超えた場合
        return jsonify({'error': f'モデルが混雑しています。しばらく待ってから再度お試しください。({last_error})'}), 503

    except requests.exceptions.Timeout:
        return jsonify({'error': 'リクエストがタイムアウトしました'}), 504
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
