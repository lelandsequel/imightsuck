// API Configuration - Together AI
const API_KEY = 'tgp_v1_eoBpabHhovcbFrACelYaDv89YXODXl0zHxAwi3Yic6k';
const API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'meta-llama/Llama-3-70b-chat-hf';

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY_HERE'; // Get from https://elevenlabs.io
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Get guru mode from localStorage
const GURU_ID = localStorage.getItem('guruMode') || 'writer';
const CURRENT_GURU = GURUS[GURU_ID] || GURUS.writer;

// History and stats
let responseHistory = JSON.parse(localStorage.getItem('responseHistory') || '[]');
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let isTyping = false;

// Voice settings
let voiceSettings = JSON.parse(localStorage.getItem('voiceSettings') || '{"voice": "", "speed": 1.0, "pitch": 1.0, "autoPlay": false, "useElevenLabs": false}');
let synth = window.speechSynthesis;
let currentUtterance = null;
let availableVoices = [];
let currentAvatar = null;
let isSpeaking = false;

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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (!GURU_ID || !GURUS[GURU_ID]) {
        window.location.href = 'index.html';
        return;
    }
    
    initializePage();
    updateStats();
    applyDarkMode();
    setupEventListeners();
});

function initializePage() {
    document.getElementById('guruTitle').textContent = `${CURRENT_GURU.icon} ${CURRENT_GURU.name}`;
    document.getElementById('subtitle').textContent = CURRENT_GURU.description;
    document.getElementById('initialSpeech').textContent = CURRENT_GURU.initialSpeech;
    document.getElementById('issueInput').placeholder = CURRENT_GURU.placeholder;
    document.getElementById('askGuruBtn').textContent = CURRENT_GURU.buttonText;
    document.body.style.setProperty('--guru-color', CURRENT_GURU.color);
    
    // Initialize avatar
    const avatarConfig = AVATARS[CURRENT_GURU.id] || AVATARS.guru;
    currentAvatar = avatarConfig;
    setupAvatar(avatarConfig);
}

function setupEventListeners() {
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // History toggle
    document.getElementById('historyToggle').addEventListener('click', toggleHistory);
    
    // Voice input (microphone)
    document.getElementById('micBtn').addEventListener('click', startVoiceInput);
    
    // Voice settings
    document.getElementById('voiceSettingsBtn').addEventListener('click', toggleVoiceSettings);
    
    // Text-to-speech buttons
    document.getElementById('speakBtn').addEventListener('click', () => speakCurrentResponse());
    document.getElementById('stopBtn').addEventListener('click', stopSpeech);
    
    // Example button
    document.getElementById('exampleBtn').addEventListener('click', useExample);
    
    // Copy button
    document.getElementById('copyBtn').addEventListener('click', copyResponse);
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareResponse);
    
    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadResponse);
    
    // Voice settings controls
    loadVoices();
    setupVoiceSettings();
    
    // Enter key to submit
    document.getElementById('issueInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askGuru();
        }
    });
}

// Typing animation
async function typeText(element, text, speed = 30) {
    isTyping = true;
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, speed));
    }
    isTyping = false;
}

// Main ask function
async function askGuru() {
    if (isTyping) return;
    
    const input = document.getElementById('issueInput').value.trim();
    const responseSection = document.getElementById('responseSection');
    const responseText = document.getElementById('responseText');
    const responseBox = document.getElementById('responseBox');
    const guruSpeech = document.getElementById('guruSpeech');
    const askBtn = document.getElementById('askGuruBtn');

    if (!input) {
        guruSpeech.innerHTML = `<p>${CURRENT_GURU.initialSpeech}</p>`;
        return;
    }

    askBtn.disabled = true;
    askBtn.textContent = 'The Guru is thinking...';
    responseSection.style.display = 'block';
    responseText.innerHTML = '<div class="loading">The Guru is contemplating your existence...</div>';
    guruSpeech.innerHTML = `<p>Let me think about this... *${CURRENT_GURU.avatar.includes('🧘') ? 'meditates' : 'strokes beard'}*</p>`;

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

        // Update UI with typing animation
        responseText.textContent = '';
        responseBox.className = 'response-box ' + (response.category === 'sucks' ? 'sucks' : response.category === 'doesntSuck' ? 'doesnt-suck' : '');
        await typeText(responseText, response.text, 20);
        
        guruSpeech.innerHTML = `<p>There you have it.</p>`;
        updateStats();
        updateHistory();
        
        // Auto-play voice if enabled
        if (voiceSettings.autoPlay) {
            setTimeout(() => speakText(response.text), 500);
        }
        
        setTimeout(() => {
            responseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        responseText.innerHTML = `<div class="error">Something went wrong. Try again!</div>`;
        guruSpeech.innerHTML = `<p>Even the best of us have our moments. Try again.</p>`;
    } finally {
        askBtn.disabled = false;
        askBtn.textContent = CURRENT_GURU.buttonText;
    }
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

    // Use guru-specific fallback responses
    const responses = getGuruFallbackResponses();
    const categoryResponses = responses[category] || responses.neutral;
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    return {
        text: randomResponse.replace('{issue}', `"${issue}"`),
        category: category
    };
}

function getGuruFallbackResponses() {
    // Basic fallback responses for each guru
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
    
    // Add guru-specific responses based on personality
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

// Stats and History
function updateStats() {
    const sucksCount = responseHistory.filter(h => h.category === 'sucks').length;
    const total = responseHistory.length;
    const suckScore = total > 0 ? Math.round((sucksCount / total) * 100) : 0;
    
    document.getElementById('suckScore').textContent = `${suckScore}%`;
    document.getElementById('suckDetail').textContent = `${sucksCount} out of ${total} times`;
    document.getElementById('statsSection').style.display = total > 0 ? 'block' : 'none';
}

function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    responseHistory.slice(0, 20).forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-issue">${item.issue}</div>
            <div class="history-response ${item.category}">${item.response.substring(0, 100)}...</div>
            <div class="history-meta">${new Date(item.timestamp).toLocaleDateString()}</div>
        `;
        historyItem.onclick = () => {
            document.getElementById('issueInput').value = item.issue;
            document.getElementById('responseText').textContent = item.response;
            document.getElementById('responseSection').style.display = 'block';
            toggleHistory();
        };
        historyList.appendChild(historyItem);
    });
}

function toggleHistory() {
    const panel = document.getElementById('historyPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        updateHistory();
    }
}

// Dark Mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyDarkMode();
}

function applyDarkMode() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').textContent = '🌙';
    }
}

// Voice Input (Microphone)
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input not supported in your browser');
        return;
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const micBtn = document.getElementById('micBtn');
    micBtn.textContent = '🎤 Listening...';
    micBtn.disabled = true;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('issueInput').value = transcript;
        micBtn.textContent = '🎤';
        micBtn.disabled = false;
    };
    
    recognition.onerror = () => {
        micBtn.textContent = '🎤';
        micBtn.disabled = false;
    };
    
    recognition.start();
}

// Example Problems
function useExample() {
    const example = EXAMPLE_PROBLEMS[Math.floor(Math.random() * EXAMPLE_PROBLEMS.length)];
    document.getElementById('issueInput').value = example;
}

// Share/Copy/Download
function copyResponse() {
    const text = document.getElementById('responseText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

function shareResponse() {
    const text = document.getElementById('responseText').textContent;
    const issue = document.getElementById('issueInput').value;
    const shareText = `"${issue}"\n\n${text}`;
    
    if (navigator.share) {
        navigator.share({ text: shareText });
    } else {
        copyResponse();
    }
}

function downloadResponse() {
    const text = document.getElementById('responseText').textContent;
    const issue = document.getElementById('issueInput').value;
    const blob = new Blob([`Issue: ${issue}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guru-verdict-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Response Reactions
function rateResponse(rating) {
    const lastResponse = responseHistory[0];
    if (lastResponse) {
        lastResponse.rating = rating;
        localStorage.setItem('responseHistory', JSON.stringify(responseHistory));
        alert(`Thanks for your feedback!`);
    }
}

// Text-to-Speech Functions
function loadVoices() {
    availableVoices = synth.getVoices();
    
    // Wait for voices to load
    if (availableVoices.length === 0) {
        synth.onvoiceschanged = () => {
            availableVoices = synth.getVoices();
            populateVoiceSelect();
        };
    } else {
        populateVoiceSelect();
    }
}

function populateVoiceSelect() {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';
    
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voiceSettings.voice && voice.name === voiceSettings.voice) {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });
    
    // Set default if no voice selected
    if (!voiceSettings.voice && availableVoices.length > 0) {
        // Prefer English voices
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
            voiceSelect.value = availableVoices.indexOf(englishVoice);
        }
    }
}

function setupVoiceSettings() {
    const voiceSelect = document.getElementById('voiceSelect');
    const speedSlider = document.getElementById('speedSlider');
    const pitchSlider = document.getElementById('pitchSlider');
    const autoPlayCheck = document.getElementById('autoPlayCheck');
    const useElevenLabsCheck = document.getElementById('useElevenLabsCheck');
    const elevenLabsKeyInput = document.getElementById('elevenLabsKeyInput');
    const elevenLabsKeyGroup = document.getElementById('elevenLabsKeyGroup');
    
    // Set current values
    speedSlider.value = voiceSettings.speed || 1.0;
    pitchSlider.value = voiceSettings.pitch || 1.0;
    autoPlayCheck.checked = voiceSettings.autoPlay || false;
    useElevenLabsCheck.checked = voiceSettings.useElevenLabs || false;
    elevenLabsKeyInput.value = ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY_HERE' ? ELEVENLABS_API_KEY : '';
    
    if (useElevenLabsCheck.checked) {
        elevenLabsKeyGroup.style.display = 'block';
    }
    
    document.getElementById('speedValue').textContent = speedSlider.value;
    document.getElementById('pitchValue').textContent = pitchSlider.value;
    
    // Event listeners
    voiceSelect.addEventListener('change', (e) => {
        const selectedVoice = availableVoices[e.target.value];
        voiceSettings.voice = selectedVoice.name;
        localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    });
    
    speedSlider.addEventListener('input', (e) => {
        voiceSettings.speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = e.target.value;
        localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    });
    
    pitchSlider.addEventListener('input', (e) => {
        voiceSettings.pitch = parseFloat(e.target.value);
        document.getElementById('pitchValue').textContent = e.target.value;
        localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    });
    
    autoPlayCheck.addEventListener('change', (e) => {
        voiceSettings.autoPlay = e.target.checked;
        localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    });
    
    useElevenLabsCheck.addEventListener('change', (e) => {
        voiceSettings.useElevenLabs = e.target.checked;
        elevenLabsKeyGroup.style.display = e.target.checked ? 'block' : 'none';
        localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    });
    
    elevenLabsKeyInput.addEventListener('change', (e) => {
        if (e.target.value) {
            // Store in script (in production, use secure storage)
            window.ELEVENLABS_API_KEY = e.target.value;
        }
    });
}

async function speakText(text) {
    if (!text) return;
    
    // Stop any current speech
    stopSpeech();
    
    // Use ElevenLabs if enabled and API key is available
    if (voiceSettings.useElevenLabs && (window.ELEVENLABS_API_KEY || ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY_HERE')) {
        await speakWithElevenLabs(text);
        return;
    }
    
    // Fallback to browser TTS
    if (!synth) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    if (voiceSettings.voice) {
        const selectedVoice = availableVoices.find(v => v.name === voiceSettings.voice);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    } else if (availableVoices.length > 0) {
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        utterance.voice = englishVoice;
    }
    
    // Set properties
    utterance.rate = voiceSettings.speed || 1.0;
    utterance.pitch = voiceSettings.pitch || 1.0;
    utterance.volume = 1.0;
    
    currentUtterance = utterance;
    
    // Start avatar animation
    startAvatarSpeaking();
    
    // Update UI
    document.getElementById('speakBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'inline-block';
    
    utterance.onend = () => {
        stopAvatarSpeaking();
        document.getElementById('speakBtn').style.display = 'inline-block';
        document.getElementById('stopBtn').style.display = 'none';
        currentUtterance = null;
        isSpeaking = false;
    };
    
    utterance.onerror = () => {
        stopAvatarSpeaking();
        document.getElementById('speakBtn').style.display = 'inline-block';
        document.getElementById('stopBtn').style.display = 'none';
        currentUtterance = null;
        isSpeaking = false;
    };
    
    synth.speak(utterance);
    isSpeaking = true;
}

async function speakWithElevenLabs(text) {
    const apiKey = window.ELEVENLABS_API_KEY || ELEVENLABS_API_KEY;
    const voiceId = currentAvatar?.voiceId || AVATARS.guru.voiceId;
    
    try {
        startAvatarSpeaking();
        document.getElementById('speakBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'inline-block';
        
        const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    speed: voiceSettings.speed || 1.0
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
            document.getElementById('speakBtn').style.display = 'inline-block';
            document.getElementById('stopBtn').style.display = 'none';
            URL.revokeObjectURL(audioUrl);
            isSpeaking = false;
        };
        
        audio.onerror = () => {
            stopAvatarSpeaking();
            document.getElementById('speakBtn').style.display = 'inline-block';
            document.getElementById('stopBtn').style.display = 'none';
            URL.revokeObjectURL(audioUrl);
            isSpeaking = false;
        };
        
        currentUtterance = audio;
        isSpeaking = true;
        audio.play();
        
    } catch (error) {
        console.error('ElevenLabs error:', error);
        // Fallback to browser TTS
        stopAvatarSpeaking();
        speakText(text);
    }
}

function speakCurrentResponse() {
    const text = document.getElementById('responseText').textContent;
    if (text) {
        speakText(text);
    }
}

function stopSpeech() {
    if (synth && synth.speaking) {
        synth.cancel();
    }
    if (currentUtterance && currentUtterance.pause) {
        currentUtterance.pause();
        currentUtterance.currentTime = 0;
    }
    stopAvatarSpeaking();
    document.getElementById('speakBtn').style.display = 'inline-block';
    document.getElementById('stopBtn').style.display = 'none';
    currentUtterance = null;
    isSpeaking = false;
}

function toggleVoiceSettings() {
    const panel = document.getElementById('voiceSettingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        loadVoices();
    }
}

// Avatar Functions
function setupAvatar(avatarConfig) {
    const avatarEmoji = document.getElementById('avatarEmoji');
    const avatarWrapper = document.getElementById('avatarWrapper');
    const canvas = document.getElementById('avatarCanvas');
    
    if (avatarEmoji) {
        avatarEmoji.textContent = avatarConfig.emoji;
    }
    
    if (avatarWrapper) {
        avatarWrapper.style.setProperty('--avatar-color', avatarConfig.color);
        avatarWrapper.className = `avatar-wrapper avatar-${avatarConfig.animation}`;
    }
    
    // Draw avatar on canvas
    drawAvatar(canvas, avatarConfig);
}

function drawAvatar(canvas, avatarConfig) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw avatar background circle
    ctx.fillStyle = avatarConfig.color + '40';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw avatar face circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY - 10, 8, 0, Math.PI * 2);
    ctx.arc(centerX + 20, centerY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw mouth (neutral)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 15, 15, 0, Math.PI);
    ctx.stroke();
}

function startAvatarSpeaking() {
    const avatarWrapper = document.getElementById('avatarWrapper');
    if (avatarWrapper) {
        avatarWrapper.classList.add('speaking');
        animateAvatarMouth();
    }
}

function stopAvatarSpeaking() {
    const avatarWrapper = document.getElementById('avatarWrapper');
    if (avatarWrapper) {
        avatarWrapper.classList.remove('speaking');
    }
}

function animateAvatarMouth() {
    if (!isSpeaking) return;
    
    const canvas = document.getElementById('avatarCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Redraw mouth with animation
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY - 10, 8, 0, Math.PI * 2);
    ctx.arc(centerX + 20, centerY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Animated mouth
    const mouthSize = 10 + Math.random() * 10;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 15, mouthSize, 0, Math.PI);
    ctx.stroke();
    
    if (isSpeaking) {
        requestAnimationFrame(() => animateAvatarMouth());
    }
}
