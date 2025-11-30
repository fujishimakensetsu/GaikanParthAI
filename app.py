import streamlit as st
import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv
from streamlit_image_comparison import image_comparison
import io

# --- ページ設定 (必ず一番最初に書く必要があります) ---
st.set_page_config(page_title="ArchiEnhance AI", layout="wide")

# ==========================================
# ▼▼▼ パスワード認証機能の追加ここから ▼▼▼
# ==========================================
def check_password():
    """パスワード認証が成功したらTrueを返す関数"""
    if "password_correct" not in st.session_state:
        st.session_state.password_correct = False

    if st.session_state.password_correct:
        return True

    # パスワード入力フォーム
    st.write("### 🔒 アクセス制限")
    password = st.text_input("パスワードを入力してください", type="password")
    
    if password:
        # st.secrets["password"] と比較
        try:
            if password == st.secrets["password"]:
                st.session_state.password_correct = True
                st.rerun()  # 画面をリロード
                return True
            else:
                st.error("パスワードが間違っています")
        except KeyError:
            # secretsにpasswordが設定されていない場合のエラーハンドリング
            st.error("管理画面(Secrets)に 'password' が設定されていません。")

    return False

if not check_password():
    st.stop()  # 認証されていない場合はここで処理を停止
# ==========================================
# ▲▲▲ パスワード認証機能の追加ここまで ▲▲▲
# ==========================================


# --- 1. APIキーとモデルの設定 ---
load_dotenv()

try:
    api_key = st.secrets["GEMINI_API_KEY"]
except:
    api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    st.error("APIキーが見つかりません。.envファイルまたはSecretsを確認してください。")
    st.stop()

genai.configure(api_key=api_key)

# ★モデル設定: Nano Banana Pro (ユーザー指定)
MODEL_NAME = 'models/nano-banana-pro-preview'

try:
    model = genai.GenerativeModel(MODEL_NAME)
except Exception as e:
    st.error(f"モデルの読み込みに失敗しました: {e}")
    st.stop()

# --- 2. サイドバー設定 ---
st.sidebar.header("設定 🛠️")
time_of_day = st.sidebar.radio("時間帯", ["Day (昼)", "Night (夜)"], index=1) 
auto_background = st.sidebar.checkbox("背景の自動生成", value=True)
enhance_texture = st.sidebar.checkbox("質感の強調", value=True)
custom_prompt = st.sidebar.text_area("追加指示", placeholder="例: 空を青くして、モダンな雰囲気に")

# --- 3. メイン画面 ---
st.title("ArchiEnhance AI 🏗️")
st.caption(f"Powered by {MODEL_NAME}")

uploaded_file = st.file_uploader("建築パース画像をアップロード", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # 画像を読み込む
    original_image = Image.open(uploaded_file)
    
    # --- レイアウト調整 ---
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.write("### 📄 元画像")
        st.image(original_image, use_container_width=True)
    
    with col2:
        st.write("### ⚙️ 生成設定")
        st.info(f"時間: {time_of_day} | 背景: {'ON' if auto_background else 'OFF'}")
        
        # 生成ボタン
        generate_btn = st.button("Enhance Graphic (生成開始) ✨", type="primary", use_container_width=True)

    # --- 生成処理 (画面幅いっぱいに表示するためカラム外へ) ---
    if generate_btn:
        st.divider() 
        st.write("### 🚀 生成結果")
        
        with st.spinner(f"{MODEL_NAME} が高画質生成中... (しばらくお待ちください)"):
            try:
                # --- プロンプト作成 (高画質化の指示を追加) ---
                base_prompt = f"Enhance this architectural image. Lighting: {time_of_day}."
                
                # ★画質向上のための呪文を追加
                quality_boost = " 8k resolution, photorealistic, highly detailed, sharp focus, architectural photography masterpiece, professional rendering."
                
                prompt = base_prompt + quality_boost
                
                if auto_background:
                    prompt += " Add realistic high-quality background context."
                if enhance_texture:
                    prompt += " Emphasize realistic textures and material details."
                if custom_prompt:
                    prompt += f" {custom_prompt}"

                # 画像生成リクエスト
                response = model.generate_content([prompt, original_image])
                
                # 画像データの取り出し
                generated_image = None
                
                if hasattr(response, 'parts'):
                    for part in response.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            image_data = part.inline_data.data
                            generated_image = Image.open(io.BytesIO(image_data))
                            break
                
                if not generated_image and hasattr(response, 'images'):
                        if len(response.images) > 0:
                            generated_image = response.images[0]

                # 結果の表示
                if generated_image:
                    # 比較スライダー
                    image_comparison(
                        img1=original_image,
                        img2=generated_image,
                        label1="Before",
                        label2="After",
                    )
                    
                    # ダウンロードボタン
                    buf = io.BytesIO()
                    # 保存形式をPNGにして画質劣化を防ぐ
                    generated_image.save(buf, format="PNG")
                    
                    col_dl1, col_dl2 = st.columns([3, 1])
                    with col_dl2:
                        st.download_button(
                            label="生成画像をダウンロード (高画質PNG) 📥",
                            data=buf.getvalue(),
                            file_name="enhanced_image.png",
                            mime="image/png",
                            use_container_width=True
                        )
                else:
                    st.warning("画像データが取得できませんでした。")
                    st.write(response.text)

            except Exception as e:
                st.error(f"エラーが発生しました: {e}")