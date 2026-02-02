# Python 3.11 slim イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システム依存関係をインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt をコピーして依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY server.py .
COPY index.html .

# Cloud Run は PORT 環境変数を使用
ENV PORT=8080

# ヘルスチェック用
HEALTHCHECK CMD curl --fail http://localhost:$PORT/ || exit 1

# Gunicorn でFlaskアプリを起動（タイムアウトを延長）
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 300 server:app
