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
    const API_URL = 'http://127.0.0.1:5000/api/convert'; // Local Flask Server URL
    const MAX_LENGTH = 500;

    // 1. Character Count Logic
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

        // Show Loading
        loadingOverlay.classList.remove('hidden');

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
            // Hide Loading
            loadingOverlay.classList.add('hidden');
        }
    });

    // 3. Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = convertedTextDisplay.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="icon">✅</span> 복사 완료!';
            copyBtn.style.backgroundColor = '#dcfce7';
            copyBtn.style.borderColor = '#86efac';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.borderColor = '';
            }, 2000);
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다.');
        });
    });

    // 4. Feedback (Simple Mock)
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            alert(`피드백 감사합니다! (${type === 'like' ? '좋아요' : '싫어요'})`);
        });
    });
});
