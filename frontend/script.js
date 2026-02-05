document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputText = document.getElementById('input-text');
    const currentCount = document.getElementById('current-count');
    const convertBtn = document.getElementById('convert-btn');
    const targetSelect = document.getElementById('target-select');
    const resultSection = document.getElementById('result-section');
    const originalTextDisplay = document.getElementById('original-text-display');
    const convertedTextDisplay = document.getElementById('converted-text-display');
    const copyBtn = document.getElementById('copy-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const feedbackBtns = document.querySelectorAll('.feedback-btn');

    // Constants
    const API_URL = '/api/convert'; // 상대 경로 사용 (백엔드 서빙 대응)
    const MAX_LENGTH = 500;

    // 0. Load persisted data from LocalStorage
    const savedText = localStorage.getItem('biztone_input_text');
    const savedTarget = localStorage.getItem('biztone_target');
    
    if (savedText) {
        inputText.value = savedText;
        currentCount.textContent = savedText.length;
    }
    if (savedTarget) {
        targetSelect.value = savedTarget;
    }

    // 1. Character Count Logic & LocalStorage Persistence
    inputText.addEventListener('input', () => {
        let length = inputText.value.length;
        if (length > MAX_LENGTH) {
            inputText.value = inputText.value.substring(0, MAX_LENGTH);
            length = MAX_LENGTH;
        }
        currentCount.textContent = length;
        
        if (length >= MAX_LENGTH) {
            currentCount.style.color = 'red';
        } else {
            currentCount.style.color = 'inherit';
        }

        // Persist to LocalStorage
        localStorage.setItem('biztone_input_text', inputText.value);
    });

    targetSelect.addEventListener('change', () => {
        localStorage.setItem('biztone_target', targetSelect.value);
    });

    // 2. Conversion Logic (API Call)
    convertBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        const target = targetSelect.value;

        if (!text) {
            alert('변환할 내용을 입력해주세요.');
            inputText.focus();
            return;
        }

        // Show Loading & Disable Button
        loadingOverlay.classList.remove('hidden');
        convertBtn.disabled = true;
        convertBtn.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    target: target
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '서버 오류가 발생했습니다.');
            }

            const data = await response.json();

            // Render Result
            originalTextDisplay.textContent = data.original;
            convertedTextDisplay.textContent = data.converted;
            
            // Show Result Section
            resultSection.style.display = 'block';
            
            // Scroll to Result
            resultSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Conversion Error:', error);
            alert(`변환 중 오류가 발생했습니다:\n${error.message}`);
        } finally {
            // Hide Loading & Enable Button
            loadingOverlay.classList.add('hidden');
            convertBtn.disabled = false;
            convertBtn.setAttribute('aria-busy', 'false');
        }
    });

    // 3. Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = convertedTextDisplay.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="icon">✅</span> 복사 완료!';
            copyBtn.classList.add('success');
            copyBtn.style.backgroundColor = '#dcfce7';
            copyBtn.style.borderColor = '#86efac';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.borderColor = '';
                copyBtn.classList.remove('success');
            }, 2000);
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다.');
        });
    });

    // 4. Feedback Logic
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const type = button.dataset.type;
            
            // Visual feedback for selection
            feedbackBtns.forEach(b => b.style.opacity = '0.3');
            button.style.opacity = '1';
            button.style.transform = 'scale(1.2)';
            
            // In a real app, you would send this to the backend
            console.log(`Feedback received: ${type}`);
            
            // Show a small toast or message instead of alert
            const feedbackArea = document.querySelector('.feedback-area');
            const originalContent = feedbackArea.innerHTML;
            feedbackArea.innerHTML = '<p>피드백 감사합니다! 더 나은 서비스를 위해 노력하겠습니다. ✨</p>';
            
            setTimeout(() => {
                feedbackArea.innerHTML = originalContent;
                // Re-bind events if necessary, but here we just leave it for simplicity
                // In a production app, we might just hide the feedback area after use.
            }, 3000);
        });
    });
});
