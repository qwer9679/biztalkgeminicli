import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# 환경 변수 로드
load_dotenv()

# 프론트엔드 파일 경로 설정 (루트의 frontend 폴더)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

app = Flask(__name__, static_folder=frontend_dir)
CORS(app)

# Groq 클라이언트 초기화
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 대상별 시스템 프롬프트 정의 (개요서 기반)
SYSTEM_PROMPTS = {
    "boss": "다음 문장을 상사(Upward)에게 적합한 존댓말과 경어를 사용하여 변환해주세요. 문장은 간결하면서도 핵심 보고 내용이 포함되어야 합니다.",
    "colleague": "다음 문장을 타팀 동료(Lateral)에게 적합한 중립적이지만 예의바른 업무 말투로 변환해주세요. 친절하면서도 전문성을 유지해야 합니다.",
    "customer": "다음 문장을 고객(External)에게 적합한 공식적이고 정중한 비즈니스 어투로 변환해주세요. 서비스 지향적인 태도가 느껴져야 합니다."
}

@app.route('/')
def index():
    """메인 페이지 서빙"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    """CSS, JS 등 정적 파일 서빙"""
    return send_from_directory(app.static_folder, path)

@app.route('/api/convert', methods=['POST'])
def convert_tone():
    data = request.json
    text = data.get('text', '')
    target = data.get('target', 'boss')

    if not text:
        return jsonify({"error": "변환할 텍스트를 입력해주세요."}), 400

    if target not in SYSTEM_PROMPTS:
        return jsonify({"error": "유효하지 않은 대상입니다."}), 400

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPTS[target]},
                {"role": "user", "content": f"다음 문장을 변환해줘: {text}"}
            ],
            temperature=0.7,
            max_tokens=500
        )

        converted_text = completion.choices[0].message.content.strip()
        
        return jsonify({
            "original": text,
            "converted": converted_text,
            "target": target
        })

    except Exception as e:
        return jsonify({"error": f"API 호출 중 오류가 발생했습니다: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
