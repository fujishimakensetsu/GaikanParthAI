import streamlit as st
import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv
from streamlit_image_comparison import image_comparison
import io

# --- ページ設定 ---
st.set_page_config(
    page_title="ArchiEnhance AI",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- カスタムCSS ---
st.markdown("""
<style>
    /* Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    /* Root variables */
    :root {
        --arch-dark: #0a0a0b;
        --arch-charcoal: #141416;
        --arch-slate: #1c1c1f;
        --arch-steel: #2a2a2e;
        --arch-mist: #f5f3ef;
        --arch-cream: #ebe7df;
        --arch-gold: #c9a962;
        --arch-copper: #b87333;
        --arch-blueprint: #1a3a5c;
    }

    /* Main app background */
    .stApp {
        background: linear-gradient(180deg, #0a0a0b 0%, #0d0d0e 100%);
        background-image:
            linear-gradient(rgba(26, 58, 92, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26, 58, 92, 0.03) 1px, transparent 1px);
        background-size: 100% 100%, 40px 40px;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #141416 0%, #0a0a0b 100%);
        border-right: 1px solid rgba(201, 169, 98, 0.1);
    }

    [data-testid="stSidebar"] .stMarkdown {
        color: #f5f3ef;
    }

    /* Headers */
    h1, h2, h3 {
        font-family: 'Archivo Black', sans-serif !important;
        color: #f5f3ef !important;
        letter-spacing: 0.05em;
    }

    h1 {
        background: linear-gradient(135deg, #c9a962 0%, #b87333 50%, #c9a962 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2.5rem !important;
        margin-bottom: 0 !important;
    }

    /* Body text */
    p, span, label, .stMarkdown {
        font-family: 'DM Sans', sans-serif !important;
        color: #ebe7df;
    }

    /* Captions and small text */
    .stCaption, small {
        font-family: 'JetBrains Mono', monospace !important;
        color: rgba(245, 243, 239, 0.4) !important;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-size: 0.7rem !important;
    }

    /* File uploader */
    [data-testid="stFileUploader"] {
        background: rgba(20, 20, 22, 0.7);
        border: 2px dashed rgba(201, 169, 98, 0.3);
        border-radius: 0;
        padding: 2rem;
        transition: all 0.3s ease;
    }

    [data-testid="stFileUploader"]:hover {
        border-color: rgba(201, 169, 98, 0.6);
        background: rgba(201, 169, 98, 0.05);
    }

    [data-testid="stFileUploader"] label {
        color: #ebe7df !important;
    }

    /* Buttons */
    .stButton > button {
        font-family: 'DM Sans', sans-serif !important;
        font-weight: 600;
        letter-spacing: 0.05em;
        background: linear-gradient(135deg, #c9a962 0%, #b87333 100%);
        color: #0a0a0b !important;
        border: none;
        border-radius: 0;
        padding: 0.8rem 2rem;
        transition: all 0.3s ease;
        text-transform: uppercase;
    }

    .stButton > button:hover {
        background: linear-gradient(135deg, #d4b46d 0%, #c9843e 100%);
        box-shadow: 0 0 30px rgba(201, 169, 98, 0.3);
        transform: translateY(-1px);
    }

    .stButton > button:active {
        transform: translateY(0);
    }

    /* Secondary buttons */
    .stDownloadButton > button {
        background: rgba(42, 42, 46, 0.8) !important;
        color: #ebe7df !important;
        border: 1px solid rgba(201, 169, 98, 0.3) !important;
    }

    .stDownloadButton > button:hover {
        background: rgba(201, 169, 98, 0.1) !important;
        border-color: rgba(201, 169, 98, 0.6) !important;
    }

    /* Radio buttons */
    [data-testid="stRadio"] > label {
        color: rgba(245, 243, 239, 0.6) !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.75rem !important;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    [data-testid="stRadio"] div[role="radiogroup"] label {
        background: rgba(20, 20, 22, 0.7);
        border: 1px solid rgba(42, 42, 46, 0.8);
        padding: 0.8rem 1.2rem;
        margin: 0.3rem 0;
        transition: all 0.3s ease;
    }

    [data-testid="stRadio"] div[role="radiogroup"] label:hover {
        border-color: rgba(201, 169, 98, 0.4);
        background: rgba(201, 169, 98, 0.05);
    }

    [data-testid="stRadio"] div[role="radiogroup"] label[data-checked="true"] {
        border-color: rgba(201, 169, 98, 0.6);
        background: rgba(201, 169, 98, 0.1);
    }

    /* Checkboxes */
    [data-testid="stCheckbox"] {
        background: rgba(20, 20, 22, 0.7);
        border: 1px solid rgba(42, 42, 46, 0.8);
        padding: 0.8rem 1rem;
        margin: 0.5rem 0;
        transition: all 0.3s ease;
    }

    [data-testid="stCheckbox"]:hover {
        border-color: rgba(201, 169, 98, 0.4);
    }

    [data-testid="stCheckbox"] label span {
        color: #ebe7df !important;
    }

    /* Text area */
    .stTextArea textarea {
        font-family: 'DM Sans', sans-serif !important;
        background: rgba(20, 20, 22, 0.9) !important;
        border: 1px solid rgba(42, 42, 46, 0.8) !important;
        color: #ebe7df !important;
        border-radius: 0 !important;
    }

    .stTextArea textarea:focus {
        border-color: rgba(201, 169, 98, 0.5) !important;
        box-shadow: 0 0 0 1px rgba(201, 169, 98, 0.2) !important;
    }

    .stTextArea textarea::placeholder {
        color: rgba(245, 243, 239, 0.3) !important;
    }

    /* Info boxes */
    .stAlert {
        background: rgba(26, 58, 92, 0.1) !important;
        border: 1px solid rgba(26, 58, 92, 0.3) !important;
        border-radius: 0 !important;
        color: #ebe7df !important;
    }

    /* Spinner */
    .stSpinner > div {
        border-color: #c9a962 transparent transparent transparent !important;
    }

    /* Divider */
    hr {
        border-color: rgba(201, 169, 98, 0.1) !important;
    }

    /* Image containers */
    [data-testid="stImage"] {
        border: 1px solid rgba(201, 169, 98, 0.1);
        background: rgba(20, 20, 22, 0.5);
    }

    /* Columns gap */
    [data-testid="column"] {
        padding: 0.5rem;
    }

    /* Success message */
    .stSuccess {
        background: rgba(201, 169, 98, 0.1) !important;
        border: 1px solid rgba(201, 169, 98, 0.3) !important;
        color: #c9a962 !important;
    }

    /* Error message */
    .stError {
        background: rgba(220, 38, 38, 0.1) !important;
        border: 1px solid rgba(220, 38, 38, 0.3) !important;
    }

    /* Custom header component */
    .custom-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0 2rem 0;
        border-bottom: 1px solid rgba(201, 169, 98, 0.1);
        margin-bottom: 2rem;
    }

    .logo-mark {
        width: 50px;
        height: 50px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .logo-mark::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border: 1px solid rgba(201, 169, 98, 0.5);
        transform: rotate(45deg);
    }

    .logo-mark::after {
        content: '';
        position: absolute;
        width: 70%;
        height: 70%;
        background: rgba(201, 169, 98, 0.1);
        transform: rotate(45deg);
    }

    .logo-text {
        color: #c9a962;
        font-family: 'Archivo Black', sans-serif;
        font-size: 1.2rem;
        position: relative;
        z-index: 1;
    }

    /* Section headers */
    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .section-number {
        width: 24px;
        height: 24px;
        border: 1px solid rgba(201, 169, 98, 0.5);
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        color: #c9a962;
    }

    .section-number span {
        transform: rotate(-45deg);
    }

    /* Glass panel effect */
    .glass-panel {
        background: rgba(20, 20, 22, 0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(201, 169, 98, 0.1);
        padding: 1.5rem;
        margin-bottom: 1rem;
    }

    /* Processing info */
    .processing-info {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        color: rgba(245, 243, 239, 0.5);
        padding: 1rem;
        background: rgba(26, 58, 92, 0.1);
        border: 1px solid rgba(26, 58, 92, 0.2);
    }

    .processing-info li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.5rem 0;
    }

    .processing-info li::before {
        content: '';
        width: 4px;
        height: 4px;
        background: rgba(201, 169, 98, 0.5);
        transform: rotate(45deg);
    }

    /* Footer */
    .custom-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0.75rem 2rem;
        background: rgba(10, 10, 11, 0.9);
        border-top: 1px solid rgba(42, 42, 46, 0.3);
        display: flex;
        justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        color: rgba(245, 243, 239, 0.3);
        z-index: 1000;
    }

    /* Ambient glow effects */
    .ambient-glow {
        position: fixed;
        pointer-events: none;
        z-index: 0;
    }

    .glow-gold {
        top: -200px;
        left: 20%;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(201, 169, 98, 0.05) 0%, transparent 70%);
    }

    .glow-blue {
        bottom: -200px;
        right: 20%;
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(26, 58, 92, 0.08) 0%, transparent 70%);
    }

    /* Result label badges */
    .result-badge {
        display: inline-block;
        padding: 0.4rem 0.8rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.65rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
    }

    .badge-before {
        background: rgba(42, 42, 46, 0.8);
        border: 1px solid rgba(42, 42, 46, 0.5);
        color: rgba(245, 243, 239, 0.6);
    }

    .badge-after {
        background: rgba(201, 169, 98, 0.1);
        border: 1px solid rgba(201, 169, 98, 0.3);
        color: #c9a962;
    }
</style>

<!-- Ambient glow effects -->
<div class="ambient-glow glow-gold"></div>
<div class="ambient-glow glow-blue"></div>
""", unsafe_allow_html=True)

# ==========================================
# パスワード認証機能
# ==========================================
def check_password():
    """パスワード認証"""
    if "password_correct" not in st.session_state:
        st.session_state.password_correct = False

    if st.session_state.password_correct:
        return True

    try:
        correct_password = st.secrets["password"]
    except:
        correct_password = os.getenv("APP_PASSWORD")

    if not correct_password:
        st.error("パスワードが設定されていません。環境変数 APP_PASSWORD を確認してください。")
        return False

    # ログイン画面
    st.markdown("""
    <div style="text-align: center; padding: 4rem 0;">
        <div class="logo-mark" style="margin: 0 auto 2rem auto;">
            <span class="logo-text">A</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<h1 style='text-align: center;'>ARCHIENHANCE</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: rgba(245,243,239,0.4); font-family: JetBrains Mono; letter-spacing: 0.2em; font-size: 0.8rem;'>AI VISUALIZATION</p>", unsafe_allow_html=True)

    st.markdown("<br><br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("<p style='color: rgba(245,243,239,0.5); font-size: 0.85rem; margin-bottom: 0.5rem;'>パスワードを入力</p>", unsafe_allow_html=True)
        password = st.text_input("", type="password", label_visibility="collapsed", placeholder="パスワード")

        if password:
            if password == correct_password:
                st.session_state.password_correct = True
                st.rerun()
            else:
                st.error("パスワードが正しくありません")

    return False

if not check_password():
    st.stop()

# ==========================================
# APIキーとモデルの設定
# ==========================================
load_dotenv()

try:
    api_key = st.secrets["GEMINI_API_KEY"]
except:
    api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    st.error("APIキーが見つかりません。")
    st.stop()

genai.configure(api_key=api_key)

MODEL_NAME = 'models/nano-banana-pro-preview'

try:
    model = genai.GenerativeModel(MODEL_NAME)
except Exception as e:
    st.error(f"モデルの読み込みに失敗しました: {e}")
    st.stop()

# ==========================================
# サイドバー
# ==========================================
with st.sidebar:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
        <div style="width: 32px; height: 32px; border: 1px solid rgba(201,169,98,0.5); transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(-45deg); color: #c9a962; font-family: 'Archivo Black'; font-size: 0.9rem;">A</span>
        </div>
        <div>
            <div style="font-family: 'Archivo Black'; color: #f5f3ef; font-size: 1rem; letter-spacing: 0.05em;">ARCHIENHANCE</div>
            <div style="font-family: 'JetBrains Mono'; color: rgba(245,243,239,0.4); font-size: 0.6rem; letter-spacing: 0.15em;">AI VISUALIZATION</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    # Section 01: 時間帯設定
    st.markdown("""
    <div class="section-header">
        <div class="section-number"><span>01</span></div>
        <span style="color: #ebe7df; font-weight: 500; letter-spacing: 0.05em;">時間帯</span>
    </div>
    """, unsafe_allow_html=True)

    time_of_day = st.radio(
        "",
        ["昼間（Daytime）", "夜間（Nighttime）"],
        index=0,
        label_visibility="collapsed"
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # Section 02: 生成オプション
    st.markdown("""
    <div class="section-header">
        <div class="section-number"><span>02</span></div>
        <span style="color: #ebe7df; font-weight: 500; letter-spacing: 0.05em;">生成オプション</span>
    </div>
    """, unsafe_allow_html=True)

    auto_background = st.checkbox("背景を自動生成", value=True, help="白い背景部分に空や風景を自動で追加します")
    enhance_texture = st.checkbox("質感を強調", value=True, help="コンクリート、ガラス、木材などの素材感を強調します")

    st.markdown("<br>", unsafe_allow_html=True)

    # Section 03: 追加指示
    st.markdown("""
    <div class="section-header">
        <div class="section-number"><span>03</span></div>
        <span style="color: #ebe7df; font-weight: 500; letter-spacing: 0.05em;">追加指示（任意）</span>
    </div>
    """, unsafe_allow_html=True)

    custom_prompt = st.text_area(
        "",
        placeholder="例：ヴィンテージ風に、ガラスの反射を強調、緑を多めに...",
        label_visibility="collapsed",
        height=100
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # Processing info
    is_daytime = "昼間" in time_of_day
    st.markdown(f"""
    <div class="processing-info">
        <div style="color: rgba(245,243,239,0.7); font-weight: 500; margin-bottom: 0.5rem;">処理内容</div>
        <ul style="list-style: none; padding: 0; margin: 0;">
            <li>建物構造の解析</li>
            <li>{'昼間' if is_daytime else '夜間'}のライティング適用</li>
            {'<li>背景の自動生成</li>' if auto_background else ''}
            {'<li>素材質感の強調</li>' if enhance_texture else ''}
        </ul>
    </div>
    """, unsafe_allow_html=True)

# ==========================================
# メインコンテンツ
# ==========================================

# Header
st.markdown("""
<div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0 2rem 0; border-bottom: 1px solid rgba(201,169,98,0.1); margin-bottom: 2rem;">
    <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="position: relative; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border: 1px solid rgba(201,169,98,0.5); transform: rotate(45deg);"></div>
            <div style="position: absolute; width: 70%; height: 70%; background: rgba(201,169,98,0.1); transform: rotate(45deg);"></div>
            <span style="position: relative; color: #c9a962; font-family: 'Archivo Black'; font-size: 1.1rem;">A</span>
        </div>
        <div>
            <h1 style="margin: 0; font-size: 1.8rem;">ARCHIENHANCE</h1>
            <p style="margin: 0; font-family: 'JetBrains Mono'; color: rgba(245,243,239,0.4); font-size: 0.65rem; letter-spacing: 0.2em;">AI VISUALIZATION</p>
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 0.5rem; font-family: 'JetBrains Mono'; color: rgba(245,243,239,0.3); font-size: 0.7rem;">
        <div style="width: 6px; height: 6px; background: #c9a962; border-radius: 50%; animation: pulse 2s infinite;"></div>
        <span>Powered by Gemini</span>
    </div>
</div>

<style>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
</style>
""", unsafe_allow_html=True)

# File uploader
st.markdown("""
<div class="section-header">
    <div class="section-number"><span>01</span></div>
    <span style="color: #ebe7df; font-weight: 500; letter-spacing: 0.05em;">画像をアップロード</span>
</div>
""", unsafe_allow_html=True)

uploaded_file = st.file_uploader(
    "建築パース画像をドラッグ＆ドロップ、またはクリックして選択",
    type=["jpg", "jpeg", "png"],
    label_visibility="collapsed"
)

if uploaded_file is not None:
    original_image = Image.open(uploaded_file)

    st.markdown("<br>", unsafe_allow_html=True)

    # Generate button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        generate_btn = st.button(
            "高画質化を実行",
            type="primary",
            use_container_width=True
        )

    st.markdown("<br>", unsafe_allow_html=True)

    if generate_btn:
        st.markdown("---")

        st.markdown("""
        <div class="section-header">
            <div class="section-number"><span>02</span></div>
            <span style="color: #ebe7df; font-weight: 500; letter-spacing: 0.05em;">生成結果</span>
        </div>
        """, unsafe_allow_html=True)

        with st.spinner(""):
            # Custom loading message
            is_daytime = "昼間" in time_of_day
            st.markdown(f"""
            <div style="text-align: center; padding: 2rem;">
                <div style="font-family: 'DM Sans'; color: rgba(245,243,239,0.8); margin-bottom: 0.5rem;">
                    {'昼間' if is_daytime else '夜間'}のビジュアライゼーションを生成中...
                </div>
                <div style="font-family: 'JetBrains Mono'; color: rgba(245,243,239,0.4); font-size: 0.7rem; letter-spacing: 0.2em;">
                    PROCESSING
                </div>
            </div>
            """, unsafe_allow_html=True)

            try:
                # プロンプト作成
                time_setting = "bright natural daylight, clear blue sky, warm sunlight" if is_daytime else "dramatic night lighting, warm interior glow from windows, elegant evening atmosphere"

                prompt = f"""You are an expert architectural visualizer. Enhance this building exterior perspective with professional quality.

LIGHTING: {time_setting}

REQUIREMENTS:
- Significantly enhance global illumination and ambient occlusion
- Deepen shadows for better depth perception
- Maintain the original architectural design and proportions
- Output a photorealistic, high-quality architectural visualization

{"BACKGROUND: If the image has white or empty background areas, generate a realistic, contextual environment (sky, landscape, trees, or urban context) that seamlessly blends with the building and lighting." if auto_background else ""}

{"TEXTURES: Enhance all surface materials (concrete, glass, wood, metal, stone) to appear highly detailed and photorealistic." if enhance_texture else ""}

{f"ADDITIONAL INSTRUCTIONS: {custom_prompt}" if custom_prompt else ""}

Deliver a stunning, professional architectural rendering."""

                response = model.generate_content(
                    [prompt, original_image],
                    generation_config=genai.GenerationConfig(
                        response_modalities=['Text', 'Image']
                    )
                )

                # 画像データの取り出し
                generated_image = None

                if hasattr(response, 'candidates') and response.candidates:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            image_data = part.inline_data.data
                            generated_image = Image.open(io.BytesIO(image_data))
                            break

                if generated_image:
                    # 比較スライダー
                    image_comparison(
                        img1=original_image,
                        img2=generated_image,
                        label1="変換前",
                        label2="変換後",
                    )

                    st.markdown("<br>", unsafe_allow_html=True)

                    # ダウンロードボタン
                    buf = io.BytesIO()
                    generated_image.save(buf, format="PNG", quality=95)

                    col1, col2, col3 = st.columns([2, 1, 2])
                    with col2:
                        time_label = "daytime" if is_daytime else "nighttime"
                        st.download_button(
                            label="ダウンロード",
                            data=buf.getvalue(),
                            file_name=f"archienhance_{time_label}_{uploaded_file.name.split('.')[0]}.png",
                            mime="image/png",
                            use_container_width=True
                        )
                else:
                    st.warning("画像の生成に失敗しました。再度お試しください。")
                    if hasattr(response, 'text') and response.text:
                        st.info(response.text)

            except Exception as e:
                st.error(f"エラーが発生しました: {e}")

    else:
        # Preview only
        st.markdown("""
        <div class="section-header">
            <div class="section-number"><span>02</span></div>
            <span style="color: #ebe7df; font-weight: 500; letter-spacing: 0.05em;">プレビュー</span>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="result-badge badge-before">元画像</div>', unsafe_allow_html=True)
        st.image(original_image, use_container_width=True)

# Footer
st.markdown("""
<div class="custom-footer">
    <span>ArchiEnhance AI v2.0</span>
    <span>建築パース高画質化ツール</span>
</div>
""", unsafe_allow_html=True)

# Bottom padding for footer
st.markdown("<div style='height: 60px;'></div>", unsafe_allow_html=True)
