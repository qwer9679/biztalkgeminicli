# BizTone Converter - 제품 요구사항 정의서 (PRD)

## 1. 서론 (Introduction)

### 1.1 프로젝트 개요
- **프로젝트 명**: BizTone Converter (업무 말투 자동 변환 솔루션)
- **목적**: 사용자의 일상적인 언어를 비즈니스 상황과 대상(상사, 동료, 고객)에 맞는 전문적인 업무 말투로 자동 변환하여 커뮤니케이션 효율성과 품질을 높임.

### 1.2 배경 및 필요성
- 다양한 이해관계자에 따른 적절한 커뮤니케이션 방식 요구 증가.
- 신입사원 및 비즈니스 화법에 미숙한 직원들의 어려움 해소.
- 조직 전체의 일관된 커뮤니케이션 품질 유지 필요.

### 1.3 목표 사용자 (Target Audience)
- **Primary**: 신입사원 및 주니어 레벨 직원.
- **Secondary**: 다수의 이해관계자와 소통하는 관리자, 영업/CS 담당자.

## 2. 사용자 시나리오 (User Scenarios)

### 2.1 상사 보고 (Reporting to Boss)
- **사용자**: 신입사원 A
- **상황**: 프로젝트 지연 사실을 보고해야 함.
- **행동**: "프로젝트 좀 늦어질 것 같아요" 입력 -> 대상 '상사' 선택.
- **기대 결과**: "프로젝트 일정이 다소 지연될 예정입니다. 빠른 시일 내에 완료하도록 하겠습니다."로 변환된 텍스트 획득.

### 2.2 협업 요청 (Requesting Collaboration)
- **사용자**: 타팀 매니저 B
- **상황**: 다른 팀에 자료 요청.
- **행동**: "이 자료 좀 보내줄 수 있어?" 입력 -> 대상 '타팀 동료' 선택.
- **기대 결과**: "협업을 위해 관련 자료 공유 부탁드립니다. 가능하시다면 오늘 중으로 보내주시면 감사하겠습니다."로 변환된 텍스트 획득.

## 3. 기능적 요구사항 (Functional Requirements)

### 3.1 입력 기능 (Input)
- **[FR-01] 대상 선택**: 사용자 대상 선택 드롭다운 제공 (옵션: 상사, 타팀 동료, 고객). 기본값은 '상사'.
- **[FR-02] 텍스트 입력**: 원본 텍스트 입력 영역 제공 (최대 500자).
- **[FR-03] 유효성 검사**: 글자 수 실시간 표시 및 초과 시 경고.

### 3.2 변환 엔진 (Conversion Engine)
- **[FR-04] AI 변환 요청**: Groq AI API를 활용하여 자연어 처리.
- **[FR-05] 프롬프트 최적화**: 선택된 대상에 따라 사전에 정의된 시스템 프롬프트 적용.
    - 상사: 격식체, 존댓말, 보고 형식.
    - 동료: 정중한 해요체, 협업 지향적 어조.
    - 고객: 매우 정중한 경어, 서비스 지향적 어조.

### 3.3 출력 및 유틸리티 (Output & Utility)
- **[FR-06] 결과 표시**: 원본과 변환 결과를 좌우(PC) 또는 상하(모바일)로 비교하여 표시.
- **[FR-07] 하이라이팅**: (선택 사항) 주요 변경된 형태소나 어휘 강조.
- **[FR-08] 복사 기능**: 변환된 텍스트를 원클릭으로 클립보드에 복사.
- **[FR-09] 피드백**: 결과 품질에 대한 '좋아요/싫어요' 피드백 수집.

## 4. 비기능적 요구사항 (Non-Functional Requirements)

### 4.1 성능 (Performance)
- **응답 시간**: 변환 요청 후 결과 표시까지 평균 3초 이내 목표.
- **가용성**: Vercel Serverless Function을 통한 안정적인 가동 시간 보장.

### 4.2 사용성 (Usability)
- **반응형 웹**: 데스크톱, 태블릿, 모바일 환경 모두 지원 (Flexbox/Grid 활용).
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원 (ARIA 라벨 준수).

### 4.3 보안 (Security)
- **API 키 관리**: Vercel 환경 변수를 통해 Groq API 키 보호 (클라이언트 노출 방지).
- **데이터 처리**: 사용자 입력 데이터는 변환 목적으로만 일회성 사용 후 저장하지 않음(로그에는 개인정보 제외).

## 5. 시스템 아키텍처 (System Architecture)

### 5.1 기술 스택 (Tech Stack)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python 3.11, Flask 2.3.x
- **AI Engine**: Groq AI API
- **Deployment**: Vercel (Frontend Hosting & Serverless Functions)

### 5.2 데이터 흐름 (Data Flow)
1. User Input (Client) ->
2. API Request (POST /api/convert) ->
3. Flask Backend (Validation & Prompting) ->
4. Groq API (LLM Inference) ->
5. Response (JSON) ->
6. UI Update (Client)

## 6. 개발 및 배포 계획 (Roadmap)

1. **Phase 1: UI Prototyping**: HTML/CSS 구조 설계 및 마크업.
2. **Phase 2: Backend Setup**: Flask API 서버 구축 및 로컬 환경 설정.
3. **Phase 3: AI Integration**: Groq API 연동 및 프롬프트 엔지니어링.
4. **Phase 4: Testing**: 통합 테스트 및 엣지 케이스 처리.
5. **Phase 5: Deployment**: Vercel 배포 및 환경 변수 설정.

