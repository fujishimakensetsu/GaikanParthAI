# Python 3.11 slim イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# アプリケーションコードをコピー
COPY index.html .

# Cloud Run は PORT 環境変数を使用
ENV PORT=8080

# ヘルスチェック用
HEALTHCHECK CMD curl --fail http://localhost:$PORT/ || exit 1

# Python の組み込みHTTPサーバーで静的ファイルを提供
CMD python -m http.server $PORT --bind 0.0.0.0
