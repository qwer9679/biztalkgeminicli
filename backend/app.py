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
    "boss": (
        "당신은 비즈니스 커뮤니케이션 전문가입니다. 사용자의 입력을 '상사(Upward)'에게 보고하는 상황에 맞춰 변환하세요.\n"
        "규칙:\n"
        "1. 격식체(하십시오체)와 정중한 표현을 사용하세요.\n"
        "2. 보고 형식에 맞춰 두괄식으로 핵심을 명확히 전달하세요.\n"
        "3. 불필요한 사족을 배제하고 간결하게 작성하세요.\n"
        "4. 오직 변환된 텍스트만 출력하세요. (설명이나 따옴표 제외)"
    ),
    "colleague": (
        "당신은 비즈니스 커뮤니케이션 전문가입니다. 사용자의 입력을 '타팀 동료(Lateral)'와 협업하는 상황에 맞춰 변환하세요.\n"
        "규칙:\n"
        "1. 정중한 해요체를 사용하세요.\n"
        "2. 협업을 요청하거나 의견을 조율하는 부드럽고 긍정적인 어조를 사용하세요.\n"
        "3. 상대방의 전문성을 존중하는 태도를 보이세요.\n"
        "4. 오직 변환된 텍스트만 출력하세요. (설명이나 따옴표 제외)"
    ),
    "customer": (
        "당신은 비즈니스 커뮤니케이션 전문가입니다. 사용자의 입력을 '고객(External)'에게 응대하는 상황에 맞춰 변환하세요.\n"
        "규칙:\n"
        "1. 매우 정중한 경어(하십시오체/해요체 혼용)와 서비스 지향적인 어조를 사용하세요.\n"
        "2. 고객의 입장을 공감하고 정중히 돕겠다는 의지를 표현하세요.\n"
        "3. 부정적인 내용은 완곡하게 표현하세요.\n"
        "4. 오직 변환된 텍스트만 출력하세요. (설명이나 따옴표 제외)"
    )
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
    try:
        data = request.json
        if not data:
             return jsonify({"error": "요청 데이터가 없습니다."}), 400

        text = data.get('text', '').strip()
        target = data.get('target', 'boss')

        if not text:
            return jsonify({"error": "변환할 텍스트를 입력해주세요."}), 400
            
        if len(text) > 1000: # 프론트엔드 제한의 2배 정도 여유를 둠
            return jsonify({"error": "입력 텍스트가 너무 깁니다. (최대 500자 권장)"}), 400

        if target not in SYSTEM_PROMPTS:
            return jsonify({"error": "유효하지 않은 대상입니다."}), 400

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
        print(f"[ERROR] Conversion failed: {str(e)}") # 서버 로그용
        return jsonify({"error": "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}), 500

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.json
    feedback_type = data.get('type') # 'like' or 'dislike'
    # 실제 운영 환경에서는 데이터베이스나 로그 파일에 저장
    # 개인정보 보호를 위해 텍스트 내용은 로그 레벨에 따라 조정 필요
    print(f"[FEEDBACK] Type: {feedback_type}")
    return jsonify({"status": "success", "message": "Feedback received"}), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
