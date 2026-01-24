# Python 3.11 slim イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システム依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt をコピーして依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# Cloud Run は PORT 環境変数を使用
ENV PORT=8080

# Streamlit の設定
ENV STREAMLIT_SERVER_PORT=$PORT
ENV STREAMLIT_SERVER_ADDRESS=0.0.0.0
ENV STREAMLIT_SERVER_HEADLESS=true
ENV STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# ヘルスチェック用
HEALTHCHECK CMD curl --fail http://localhost:$PORT/_stcore/health || exit 1

# Streamlit アプリを起動
CMD streamlit run app.py --server.port=$PORT --server.address=0.0.0.0
