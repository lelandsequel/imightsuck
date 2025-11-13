// API Configuration
const API_KEY = 'tgp_v1_eoBpabHhovcbFrACelYaDv89YXODXl0zHxAwi3Yic6k';
const API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'meta-llama/Llama-3-70b-chat-hf';

// ElevenLabs API Configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// D-ID API Configuration (for talking avatars)
const DID_API_URL = 'https://api.d-id.com/talks';

// Get guru mode from localStorage
const GURU_ID = localStorage.getItem('guruMode') || 'writer';
const CURRENT_GURU = GURUS[GURU_ID] || GURUS.writer;

// App State
let responseHistory = JSON.parse(localStorage.getItem('responseHistory') || '[]');
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let isTyping = false;
let isSpeaking = false;
let currentUtterance = null;
let currentAvatar = null;

// Settings
let appSettings = JSON.parse(localStorage.getItem('appSettings') || JSON.stringify({
    voiceProvider: 'elevenlabs',
    elevenLabsKey: '',
    voiceSpeed: 1.0,
    autoPlay: false,
    avatarProvider: 'readyplayerme',
    readyPlayerMeUrl: '',
    didKey: ''
}));

// Keywords for analysis
const positiveKeywords = [
    'death', 'died', 'dying', 'cancer', 'illness', 'sick', 'hospital',
    'abuse', 'trauma', 'depression', 'anxiety', 'suicide', 'mental health',
    'unemployed', 'homeless', 'eviction', 'poverty', 'hungry', 'starving',
    'accident', 'injury', 'disability', 'chronic', 'pain', 'suffering',
    'grief', 'loss', 'mourning', 'funeral', 'divorce', 'separation'
];

const negativeKeywords = [
    'forgot', 'lost', 'dropped', 'spilled', 'broke', 'accidentally',
    'late', 'missed', 'overslept', 'wrong', 'mistake', 'oops',
    'embarrassing', 'awkward', 'weird', 'strange', 'weirdo',
    'can\'t', 'don\'t know', 'confused', 'clueless', 'no idea',
    'bad at', 'terrible', 'awful', 'horrible', 'worst'
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    if (!GURU_ID || !GURUS[GURU_ID]) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeApp();
    setupEventListeners();
    loadAvatar();
    updateStats();
    applyDarkMode();
});

function initializeApp() {
    document.getElementById('guruTitle').textContent = CURRENT_GURU.name;
    document.getElementById('subtitle').textContent = CURRENT_GURU.description;
    document.getElementById('initialSpeech').textContent = CURRENT_GURU.initialSpeech;
    document.getElementById('issueInput').placeholder = CURRENT_GURU.placeholder;
    
    // Auto-resize textarea
    const textarea = document.getElementById('issueInput');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function setupEventListeners() {
    // Sidebar
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    document.getElementById('closeSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });
    
    // Navigation
    document.getElementById('historyNavBtn').addEventListener('click', () => {
        openModal('historyModal');
        updateHistory();
    });
    
    document.getElementById('settingsNavBtn').addEventListener('click', () => {
        openModal('settingsModal');
        loadSettings();
    });
    
    // Top bar actions
    document.getElementById('voiceSettingsBtn').addEventListener('click', () => {
        openModal('settingsModal');
        loadSettings();
    });
    
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Input actions
    document.getElementById('micBtn').addEventListener('click', startVoiceInput);
    document.getElementById('exampleBtn').addEventListener('click', useExample);
    document.getElementById('askGuruBtn').addEventListener('click', askGuru);
    
    // Enter key to submit
    document.getElementById('issueInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askGuru();
        }
    });
    
    // Modal overlay click to close
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Settings
    setupSettingsListeners();
}

function setupSettingsListeners() {
    const voiceProvider = document.getElementById('voiceProviderSelect');
    const avatarProvider = document.getElementById('avatarProviderSelect');
    const speedSlider = document.getElementById('speedSlider');
    const autoPlayCheck = document.getElementById('autoPlayCheck');
    const elevenLabsKey = document.getElementById('elevenLabsKeyInput');
    const readyPlayerMeUrl = document.getElementById('readyPlayerMeUrl');
    const didKey = document.getElementById('didKeyInput');
    
    voiceProvider.value = appSettings.voiceProvider || 'elevenlabs';
    avatarProvider.value = appSettings.avatarProvider || 'readyplayerme';
    speedSlider.value = appSettings.voiceSpeed || 1.0;
    autoPlayCheck.checked = appSettings.autoPlay || false;
    elevenLabsKey.value = appSettings.elevenLabsKey || '';
    readyPlayerMeUrl.value = appSettings.readyPlayerMeUrl || '';
    didKey.value = appSettings.didKey || '';
    
    document.getElementById('speedValue').textContent = speedSlider.value;
    
    voiceProvider.addEventListener('change', (e) => {
        appSettings.voiceProvider = e.target.value;
        saveSettings();
    });
    
    avatarProvider.addEventListener('change', (e) => {
        appSettings.avatarProvider = e.target.value;
        saveSettings();
        loadAvatar();
    });
    
    speedSlider.addEventListener('input', (e) => {
        appSettings.voiceSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = e.target.value;
        saveSettings();
    });
    
    autoPlayCheck.addEventListener('change', (e) => {
        appSettings.autoPlay = e.target.checked;
        saveSettings();
    });
    
    elevenLabsKey.addEventListener('change', (e) => {
        appSettings.elevenLabsKey = e.target.value;
        saveSettings();
    });
    
    readyPlayerMeUrl.addEventListener('change', (e) => {
        appSettings.readyPlayerMeUrl = e.target.value;
        saveSettings();
        loadAvatar();
    });
    
    didKey.addEventListener('change', (e) => {
        appSettings.didKey = e.target.value;
        saveSettings();
    });
    
    // Show/hide provider-specific settings
    updateProviderSettings();
    voiceProvider.addEventListener('change', updateProviderSettings);
    avatarProvider.addEventListener('change', updateProviderSettings);
}

function updateProviderSettings() {
    const voiceProvider = document.getElementById('voiceProviderSelect').value;
    const avatarProvider = document.getElementById('avatarProviderSelect').value;
    
    document.getElementById('elevenLabsSettings').style.display = 
        voiceProvider === 'elevenlabs' ? 'block' : 'none';
    
    document.getElementById('readyPlayerMeSettings').style.display = 
        avatarProvider === 'readyplayerme' ? 'block' : 'none';
    
    document.getElementById('didSettings').style.display = 
        avatarProvider === 'did' ? 'block' : 'none';
}

function loadSettings() {
    // Settings are loaded in setupSettingsListeners
}

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
}

// Avatar Functions
function loadAvatar() {
    const provider = appSettings.avatarProvider || 'readyplayerme';
    const avatarWrapper = document.getElementById('avatarWrapper');
    const fallbackAvatar = document.getElementById('fallbackAvatar');
    const readyPlayerMeFrame = document.getElementById('readyPlayerMeAvatar');
    
    if (provider === 'readyplayerme' && appSettings.readyPlayerMeUrl) {
        // Load Ready Player Me avatar
        const avatarUrl = appSettings.readyPlayerMeUrl;
        // Use Ready Player Me Web SDK or iframe
        readyPlayerMeFrame.src = `https://readyplayer.me/avatar?frameApi`;
        readyPlayerMeFrame.style.display = 'block';
        fallbackAvatar.style.display = 'none';
    } else if (provider === 'did' && appSettings.didKey) {
        // D-ID will be handled when speaking
        fallbackAvatar.style.display = 'flex';
        readyPlayerMeFrame.style.display = 'none';
    } else {
        // Fallback avatar
        fallbackAvatar.style.display = 'flex';
        readyPlayerMeFrame.style.display = 'none';
    }
    
    const avatarConfig = AVATARS[CURRENT_GURU.id] || AVATARS.guru;
    currentAvatar = avatarConfig;
}

// Main Ask Function
async function askGuru() {
    if (isTyping) return;
    
    const input = document.getElementById('issueInput').value.trim();
    const chatMessages = document.getElementById('chatMessages');
    const askBtn = document.getElementById('askGuruBtn');
    
    if (!input) return;
    
    // Add user message
    addMessage(input, 'user');
    
    // Clear input
    document.getElementById('issueInput').value = '';
    document.getElementById('issueInput').style.height = 'auto';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    // Disable button
    askBtn.disabled = true;
    isTyping = true;
    
    try {
        let response;
        
        if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
            try {
                response = await callAPI(input);
            } catch (apiError) {
                console.error('API Error:', apiError);
                response = getFallbackResponse(input);
            }
        } else {
            response = getFallbackResponse(input);
        }
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add guru response
        addMessage(response.text, 'guru', response.category);
        
        // Save to history
        const historyItem = {
            id: Date.now(),
            issue: input,
            response: response.text,
            category: response.category,
            guru: CURRENT_GURU.name,
            timestamp: new Date().toISOString()
        };
        responseHistory.unshift(historyItem);
        if (responseHistory.length > 50) responseHistory.pop();
        localStorage.setItem('responseHistory', JSON.stringify(responseHistory));
        
        // Update stats
        updateStats();
        
        // Auto-play voice if enabled
        if (appSettings.autoPlay) {
            setTimeout(() => speakText(response.text), 500);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        addMessage('Something went wrong. Try again!', 'guru');
    } finally {
        askBtn.disabled = false;
        isTyping = false;
    }
}

function addMessage(text, type, category = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="mini-avatar" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));"></div>
            </div>
            <div class="message-content">
                <p>${escapeHtml(text)}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="mini-avatar" style="background: linear-gradient(135deg, ${CURRENT_GURU.color}, ${CURRENT_GURU.color}dd);"></div>
            </div>
            <div class="message-content ${category === 'sucks' ? 'sucks' : category === 'doesntSuck' ? 'doesnt-suck' : ''}">
                <p>${escapeHtml(text)}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message guru-message';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <div class="mini-avatar" style="background: linear-gradient(135deg, ${CURRENT_GURU.color}, ${CURRENT_GURU.color}dd);"></div>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return 'typing-indicator';
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) indicator.remove();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function callAPI(issue) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: CURRENT_GURU.systemPrompt },
                { role: 'user', content: `Someone is asking: "${issue}". Tell them if they suck at life or not.` }
            ],
            temperature: 0.9,
            max_tokens: 300
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    const lowerResponse = aiResponse.toLowerCase();
    let category = 'neutral';
    if (lowerResponse.includes("don't suck") || (lowerResponse.includes("don't") && lowerResponse.includes("suck"))) {
        category = 'doesntSuck';
    } else if (lowerResponse.includes("suck") || lowerResponse.includes("fuck") || lowerResponse.includes("disaster")) {
        category = 'sucks';
    }

    return { text: aiResponse, category: category };
}

function getFallbackResponse(issue) {
    const lowerInput = issue.toLowerCase();
    const hasSeriousIssue = positiveKeywords.some(keyword => lowerInput.includes(keyword));
    const hasMinorIssue = negativeKeywords.some(keyword => lowerInput.includes(keyword));
    
    let category;
    if (hasSeriousIssue) {
        category = 'doesntSuck';
    } else if (hasMinorIssue || issue.length < 20) {
        category = 'sucks';
    } else {
        category = Math.random() < 0.5 ? 'sucks' : 'doesntSuck';
    }

    const responses = getGuruFallbackResponses();
    const categoryResponses = responses[category] || responses.neutral;
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    return {
        text: randomResponse.replace('{issue}', `"${issue}"`),
        category: category
    };
}

function getGuruFallbackResponses() {
    const base = {
        sucks: [
            "Well, {issue}? You definitely suck at this. Get your act together.",
            "{issue}? That's pretty pathetic. You need to step up your game.",
            "Listen, {issue}? You're failing spectacularly. Time to change course."
        ],
        doesntSuck: [
            "{issue}? That's actually a legitimate problem. You're handling it well.",
            "Well, {issue}? You don't suck. This is reasonable, and you're dealing with it appropriately.",
            "{issue}? That's understandable. You're not sucking here, you're being a functional adult."
        ],
        neutral: [
            "{issue}? Hmm, I'm on the fence. You might suck, you might not.",
            "{issue}? That's... something. I can't decide if you suck or not."
        ]
    };
    
    if (CURRENT_GURU.id === 'writer') {
        return {
            sucks: [
                "Well, well, well. {issue}? You're like a walking cautionary tale. You don't just suck, you're a fucking tragedy wrapped in incompetence.",
                "{issue}? You're like a character in a bad novel who never got the memo about character development. You're failing spectacularly.",
                "Listen, {issue}? That's a fucking character flaw masquerading as circumstance. You're composing a symphony of failure."
            ],
            doesntSuck: [
                "Well, I'll be fucking damned. {issue}? That's actually legitimate, and you're handling it with grace. You don't suck.",
                "{issue}? You're like a character who actually learned from mistakes. You're handling this well.",
                "Fuck me, you're actually competent. {issue}? You're dealing with it properly. Well done."
            ],
            neutral: base.neutral
        };
    }
    
    return base;
}

// Voice Functions
async function speakText(text) {
    if (!text || isSpeaking) return;
    
    stopSpeech();
    
    const provider = appSettings.voiceProvider || 'elevenlabs';
    
    if (provider === 'elevenlabs' && appSettings.elevenLabsKey) {
        await speakWithElevenLabs(text);
    } else {
        await speakWithBrowserTTS(text);
    }
}

async function speakWithElevenLabs(text) {
    const apiKey = appSettings.elevenLabsKey;
    const voiceId = currentAvatar?.voiceId || AVATARS.guru.voiceId;
    
    try {
        startAvatarSpeaking();
        
        const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('ElevenLabs API error');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
            stopAvatarSpeaking();
            URL.revokeObjectURL(audioUrl);
            isSpeaking = false;
        };
        
        audio.onerror = () => {
            stopAvatarSpeaking();
            URL.revokeObjectURL(audioUrl);
            isSpeaking = false;
        };
        
        currentUtterance = audio;
        isSpeaking = true;
        audio.play();
        
    } catch (error) {
        console.error('ElevenLabs error:', error);
        stopAvatarSpeaking();
        speakWithBrowserTTS(text);
    }
}

async function speakWithBrowserTTS(text) {
    if (!window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (englishVoice) utterance.voice = englishVoice;
    utterance.rate = appSettings.voiceSpeed || 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    startAvatarSpeaking();
    currentUtterance = utterance;
    isSpeaking = true;
    
    utterance.onend = () => {
        stopAvatarSpeaking();
        isSpeaking = false;
    };
    
    utterance.onerror = () => {
        stopAvatarSpeaking();
        isSpeaking = false;
    };
    
    window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    if (currentUtterance && currentUtterance.pause) {
        currentUtterance.pause();
        currentUtterance.currentTime = 0;
    }
    stopAvatarSpeaking();
    isSpeaking = false;
}

function startAvatarSpeaking() {
    const status = document.getElementById('avatarStatus');
    if (status) {
        status.classList.add('speaking');
        status.querySelector('span').textContent = 'Speaking...';
    }
}

function stopAvatarSpeaking() {
    const status = document.getElementById('avatarStatus');
    if (status) {
        status.classList.remove('speaking');
        status.querySelector('span').textContent = 'Ready';
    }
}

// Voice Input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input not supported in your browser');
        return;
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const micBtn = document.getElementById('micBtn');
    micBtn.style.background = 'var(--accent-primary)';
    micBtn.style.color = 'white';
    micBtn.disabled = true;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('issueInput').value = transcript;
        micBtn.style.background = '';
        micBtn.style.color = '';
        micBtn.disabled = false;
    };
    
    recognition.onerror = () => {
        micBtn.style.background = '';
        micBtn.style.color = '';
        micBtn.disabled = false;
    };
    
    recognition.start();
}

// Example Problems
function useExample() {
    const example = EXAMPLE_PROBLEMS[Math.floor(Math.random() * EXAMPLE_PROBLEMS.length)];
    document.getElementById('issueInput').value = example;
    document.getElementById('issueInput').focus();
}

// Stats
function updateStats() {
    const sucksCount = responseHistory.filter(h => h.category === 'sucks').length;
    const total = responseHistory.length;
    const suckScore = total > 0 ? Math.round((sucksCount / total) * 100) : 0;
    
    document.getElementById('suckScore').textContent = `${suckScore}%`;
    document.getElementById('totalSessions').textContent = total;
    
    const statsCard = document.getElementById('statsCard');
    if (total > 0) {
        statsCard.style.display = 'flex';
    }
}

// History
function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (responseHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px;">No history yet. Ask the Guru something!</p>';
        return;
    }
    
    responseHistory.slice(0, 20).forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-issue">${escapeHtml(item.issue)}</div>
            <div class="history-response ${item.category}">${escapeHtml(item.response.substring(0, 150))}${item.response.length > 150 ? '...' : ''}</div>
            <div class="history-meta">${new Date(item.timestamp).toLocaleDateString()}</div>
        `;
        historyItem.onclick = () => {
            document.getElementById('issueInput').value = item.issue;
            closeModal();
        };
        historyList.appendChild(historyItem);
    });
}

// Modals
function openModal(modalId) {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 200);
}

// Dark Mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyDarkMode();
}

function applyDarkMode() {
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}
