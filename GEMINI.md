# BizTone Converter Project

이 프로젝트는 사용자의 일상적인 말투를 전문적인 비즈니스 말투로 변환해주는 웹 애플리케이션입니다.

## 프로젝트 개요
- **Frontend**: Tailwind CSS, Vanilla JS
- **Backend**: Python Flask, Groq API (LLM: llama-3.3-70b-versatile)
- **주요 기능**: 상사, 동료, 고객 대상별 맞춤형 말투 변환

## Gemini CLI 지침
- 모든 응답과 작업 수행 시 `myrules.md` 파일의 지침을 우선적으로 따릅니다.
- **언어**: 한국어로 소통합니다.
- **보안**: `.env` 파일은 직접 수정하지 않으며, API 키 노출에 주의합니다.

## 주요 파일 구조
- `frontend/`: 웹 UI 구성 (index.html, style.css, script.js)
- `backend/`: API 서버 및 LLM 연동 로직 (app.py)
- `PRD.md`: 제품 요구사항 정의서
- `프로그램개요서.md`: 프로젝트 전반에 대한 개요 및 기획 내용
