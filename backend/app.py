import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # 프론트엔드와의 통신을 위한 CORS 허용

# Groq 클라이언트 초기화
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 대상별 시스템 프롬프트 정의
SYSTEM_PROMPTS = {
    "boss": "당신은 업무 말투 변환 전문가입니다. 사용자의 입력을 '상사'에게 보고하는 격식 있고 정중한 비즈니스 어투로 변환하세요. 문장은 간결하면서도 핵심 보고 내용이 포함되어야 합니다.",
    "colleague": "당신은 업무 말투 변환 전문가입니다. 사용자의 입력을 '타팀 동료'에게 요청하거나 협업하는 정중한 '해요체' 업무 말투로 변환하세요. 친절하면서도 전문성을 유지해야 합니다.",
    "customer": "당신은 업무 말투 변환 전문가입니다. 사용자의 입력을 '고객'에게 안내하는 매우 정중하고 격식을 갖춘 비즈니스 어투로 변환하세요. 서비스 지향적인 태도가 느껴져야 합니다."
}

@app.route('/api/convert', methods=['POST'])
def convert_tone():
    data = request.json
    text = data.get('text', '')
    target = data.get('target', 'boss')  # 기본값: boss

    if not text:
        return jsonify({"error": "변환할 텍스트를 입력해주세요."}), 400

    if target not in SYSTEM_PROMPTS:
        return jsonify({"error": "유효하지 않은 대상입니다."}), 400

    try:
        # Groq API 호출
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",  # 또는 다른 적절한 모델
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
