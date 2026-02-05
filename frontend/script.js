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
    const API_URL = '/api/convert'; 
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
            currentCount.classList.add('text-red-500');
            currentCount.classList.remove('text-slate-400');
        } else {
            currentCount.classList.remove('text-red-500');
            currentCount.classList.add('text-slate-400');
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
        convertBtn.classList.add('opacity-70', 'cursor-not-allowed');

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
            resultSection.classList.remove('hidden');
            
            // Scroll to Result
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error('Conversion Error:', error);
            alert(`변환 중 오류가 발생했습니다:\n${error.message}`);
        } finally {
            // Hide Loading & Enable Button
            loadingOverlay.classList.add('hidden');
            convertBtn.disabled = false;
            convertBtn.setAttribute('aria-busy', 'false');
            convertBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    });

    // 3. Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = convertedTextDisplay.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const btnText = copyBtn.querySelector('.btn-text');
            const icon = copyBtn.querySelector('.icon');
            const originalText = btnText.textContent;
            const originalIcon = icon.textContent;

            btnText.textContent = '복사 완료!';
            icon.textContent = '✅';
            copyBtn.classList.add('bg-green-500', 'text-white', 'border-green-500');
            copyBtn.classList.remove('bg-white', 'text-blue-600', 'border-blue-200');
            
            setTimeout(() => {
                btnText.textContent = originalText;
                icon.textContent = originalIcon;
                copyBtn.classList.remove('bg-green-500', 'text-white', 'border-green-500');
                copyBtn.classList.add('bg-white', 'text-blue-600', 'border-blue-200');
            }, 2000);
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다.');
        });
    });

    // 4. Feedback Logic
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const button = e.currentTarget;
            const type = button.dataset.type;
            
            // Visual feedback for selection
            feedbackBtns.forEach(b => {
                b.classList.add('opacity-50');
                b.classList.remove('bg-white', 'shadow-md');
            });
            button.classList.remove('opacity-50');
            button.classList.add('bg-white', 'shadow-md', 'scale-110');
            
            // Send feedback to backend
            try {
                await fetch('/api/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: type,
                        original: originalTextDisplay.textContent,
                        converted: convertedTextDisplay.textContent
                    })
                });
                console.log(`Feedback sent: ${type}`);
            } catch (error) {
                console.error('Feedback Error:', error);
            }
            
            const feedbackArea = button.closest('div').parentElement;
            const originalHTML = feedbackArea.innerHTML;
            feedbackArea.innerHTML = '<p class="text-blue-600 font-medium py-4 fade-in">피드백 감사합니다! 더 나은 서비스를 위해 노력하겠습니다. ✨</p>';
            
            setTimeout(() => {
                feedbackArea.innerHTML = originalHTML;
            }, 3000);
        });
    });
});