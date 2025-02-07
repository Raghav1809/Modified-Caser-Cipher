// Initialize dark mode
const darkModeToggle = document.getElementById('darkMode');
darkModeToggle.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', darkModeToggle.checked ? 'dark' : 'light');
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
darkModeToggle.checked = savedTheme === 'dark';

// Initialize tooltips
const tooltip = document.getElementById('tooltip');
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        tooltip.textContent = e.target.title;
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
        tooltip.classList.add('show');
    });

    element.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
    });
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.tab === 'encrypt') {
            document.querySelector('.encrypt-btn').click();
        } else {
            document.querySelector('.decrypt-btn').click();
        }
    });
});

// Character counter
const textArea = document.getElementById('text');
const charCount = document.querySelector('.char-count');

textArea.addEventListener('input', () => {
    const count = textArea.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    if (document.getElementById('autoConvert').checked) {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if (activeTab === 'encrypt') {
            encrypt();
        } else {
            decrypt();
        }
    }
});

// Synchronize key inputs
const keySlider = document.getElementById('keySlider');
const keyInput = document.getElementById('key');
const keyValue = document.getElementById('keyValue');

function updateKeyDisplay(value) {
    keySlider.value = value;
    keyInput.value = value;
    keyValue.textContent = value;
}

keySlider.addEventListener('input', () => {
    updateKeyDisplay(keySlider.value);
    if (document.getElementById('autoConvert').checked) {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if (activeTab === 'encrypt') {
            encrypt();
        } else {
            decrypt();
        }
    }
});

keyInput.addEventListener('input', () => {
    let value = parseInt(keyInput.value);
    if (value < 1) value = 1;
    if (value > 25) value = 25;
    updateKeyDisplay(value);
});

// Random text generation
document.getElementById('generateRandomBtn').addEventListener('click', () => {
    const sentences = [
        "The quick brown fox jumps over the lazy dog",
        "Pack my box with five dozen liquor jugs",
        "How vexingly quick daft zebras jump",
        "The five boxing wizards jump quickly",
        "Sphinx of black quartz, judge my vow"
    ];
    textArea.value = sentences[Math.floor(Math.random() * sentences.length)];
    textArea.dispatchEvent(new Event('input'));
});

// Paste from clipboard
document.getElementById('pasteBtn').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        textArea.value = text;
        textArea.dispatchEvent(new Event('input'));
    } catch (err) {
        alert('Failed to read from clipboard');
    }
});

// File upload handling
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        textArea.value = e.target.result;
        textArea.dispatchEvent(new Event('input'));
    };
    reader.readAsText(file);
});

// Advanced options toggle
function toggleAdvancedOptions() {
    const content = document.querySelector('.advanced-content');
    content.classList.toggle('show');
    const icon = document.querySelector('.collapse-btn i:last-child');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// History management
const historyList = document.getElementById('history');
const maxHistoryItems = 5;

function addToHistory(input, output, mode, shift) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <strong>${mode.charAt(0).toUpperCase() + mode.slice(1)}ed</strong> with shift ${shift}<br>
        <small>${input.substring(0, 30)}${input.length > 30 ? '...' : ''}</small>
    `;
    
    if (historyList.children.length >= maxHistoryItems) {
        historyList.removeChild(historyList.lastChild);
    }
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    saveHistory();
}

function saveHistory() {
    const historyItems = Array.from(historyList.children).map(item => item.innerHTML);
    localStorage.setItem('cipherHistory', JSON.stringify(historyItems));
}

function loadHistory() {
    const savedHistory = localStorage.getItem('cipherHistory');
    if (savedHistory) {
        const items = JSON.parse(savedHistory);
        items.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = item;
            historyList.appendChild(historyItem);
        });
    }
}

function clearHistory() {
    historyList.innerHTML = '';
    localStorage.removeItem('cipherHistory');
}

// Load history on startup
loadHistory();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        encrypt();
    } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        decrypt();
    } else if (e.key === '?') {
        e.preventDefault();
        showHelp();
    }
});

// Help modal
function showHelp() {
    const modal = document.getElementById('helpModal');
    modal.classList.add('show');
}

function closeHelp() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('show');
}

// Share result
async function shareResult() {
    const text = document.getElementById('output').textContent;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Caesar Cipher Result',
                text: text
            });
        } catch (err) {
            alert('Error sharing result');
        }
    } else {
        alert('Web Share API not supported');
    }
}

// Download result
function downloadResult() {
    const text = document.getElementById('output').textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caesar-cipher-result.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Main cipher functions
function processText(char, shift, encrypt = true) {
    const preserveSpaces = document.getElementById('preserveSpaces').checked;
    const preserveSpecialChars = document.getElementById('preserveSpecialChars').checked;

    if (!preserveSpaces && char === ' ') return '';
    if (!preserveSpecialChars && !char.match(/[a-z0-9]/i)) return '';
    
    if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpperCase = char === char.toUpperCase();
        const base = isUpperCase ? 65 : 97;
        
        if (encrypt) {
            return String.fromCharCode(((code - base + shift) % 26) + base);
        } else {
            return String.fromCharCode(((code - base - shift + 26) % 26) + base);
        }
    }
    return char;
}

function encrypt() {
    const text = document.getElementById('text').value;
    const shift = parseInt(document.getElementById('key').value);
    
    if (!text) {
        document.getElementById('output').textContent = '⚠ Please enter some text';
        return;
    }
    
    if (isNaN(shift) || shift < 1 || shift > 25) {
        document.getElementById('output').textContent = '⚠ Please enter a valid shift value (1-25)';
        return;
    }
    
    const result = text.split('').map(char => processText(char, shift, true)).join('');
    document.getElementById('output').textContent = result;
    document.getElementById('outputInfo').textContent = `(${result.length} characters)`;
    
    addToHistory(text, result, 'encrypt', shift);
}

function decrypt() {
    const text = document.getElementById('text').value;
    const shift = parseInt(document.getElementById('key').value);
    
    if (!text) {
        document.getElementById('output').textContent = '⚠ Please enter some text';
        return;
    }
    
    if (isNaN(shift) || shift < 1 || shift > 25) {
        document.getElementById('output').textContent = '⚠ Please enter a valid shift value (1-25)';
        return;
    }
    
    const result = text.split('').map(char => processText(char, shift, false)).join('');
    document.getElementById('output').textContent = result;
    document.getElementById('outputInfo').textContent = `(${result.length} characters)`;
    
    addToHistory(text, result, 'decrypt', shift);
}

function clearAll() {
    document.getElementById('text').value = '';
    document.getElementById('output').textContent = 'Your result will appear here...';
    document.getElementById('outputInfo').textContent = '';
    document.getElementById('key').value = '3';
    document.getElementById('keySlider').value = '3';
    document.getElementById('keyValue').textContent = '3';
    document.querySelector('.char-count').textContent = '0 characters';
}

async function copyToClipboard() {
    const output = document.getElementById('output').textContent;
    
    try {
        await navigator.clipboard.writeText(output);
        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    } catch (err) {
        alert('Failed to copy text');
    }
}

// Copyright section functions
function showPrivacyPolicy() {
    const modal = document.getElementById('helpModal');
    const modalContent = modal.querySelector('.help-content');
    modalContent.innerHTML = `
        <h3>Privacy Policy</h3>
        <p>Last updated: February 2025</p>
        <div class="policy-content">
            <h4>Data Collection</h4>
            <p>This application does not collect or store any personal data. All encryption and decryption operations are performed locally in your browser.</p>
            
            <h4>Local Storage</h4>
            <p>We use local storage to save your preferences (such as dark mode) and recent conversion history. This data never leaves your device.</p>
            
            <h4>Third-Party Services</h4>
            <p>We do not use any third-party services or analytics tools.</p>
        </div>
    `;
    modal.classList.add('show');
}

function showTerms() {
    const modal = document.getElementById('helpModal');
    const modalContent = modal.querySelector('.help-content');
    modalContent.innerHTML = `
        <h3>Terms of Use</h3>
        <p>Last updated: February 2025</p>
        <div class="policy-content">
            <h4>Usage Agreement</h4>
            <p>This tool is provided for educational and personal use. You agree to use it responsibly and in compliance with all applicable laws.</p>
            
            <h4>Limitations</h4>
            <p>The Caesar Cipher is a basic encryption method and should not be used for securing sensitive information. We are not responsible for any data loss or security issues.</p>
            
            <h4>Modifications</h4>
            <p>We reserve the right to modify or discontinue this service at any time without notice.</p>
        </div>
    `;
    modal.classList.add('show');
}

function showContact() {
    const modal = document.getElementById('helpModal');
    const modalContent = modal.querySelector('.help-content');
    modalContent.innerHTML = `
        <h3>Contact Information</h3>
        <div class="contact-content">
            <p>For questions, suggestions, or bug reports, please reach out to us:</p>
            <ul>
                <li><i class="fas fa-envelope"></i> Email: support@caesarcipher.com</li>
                <li><i class="fas fa-github"></i> GitHub: github.com/caesar-cipher</li>
                <li><i class="fas fa-bug"></i> Bug Reports: github.com/caesar-cipher/issues</li>
            </ul>
            <p class="response-time">We typically respond within 24-48 hours.</p>
        </div>
    `;
    modal.classList.add('show');
}