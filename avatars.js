// Avatar configurations
const AVATARS = {
    guru: {
        id: 'guru',
        name: 'Wise Guru',
        emoji: '🧙‍♂️',
        color: '#667eea',
        voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs Adam voice
        animation: 'float'
    },
    therapist: {
        id: 'therapist',
        name: 'The Therapist',
        emoji: '🧘',
        color: '#55efc4',
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // ElevenLabs Bella voice
        animation: 'calm'
    },
    drill: {
        id: 'drill',
        name: 'Drill Sergeant',
        emoji: '💂',
        color: '#ff7675',
        voiceId: 'VR6AewLTigWG4xSOukaG', // ElevenLabs Arnold voice
        animation: 'intense'
    },
    philosopher: {
        id: 'philosopher',
        name: 'The Philosopher',
        emoji: '🤔',
        color: '#a29bfe',
        voiceId: 'ThT5KcBeYPX3keUQqHPh', // ElevenLabs Dorothy voice
        animation: 'thoughtful'
    },
    savage: {
        id: 'savage',
        name: 'The Savage',
        emoji: '😈',
        color: '#d63031',
        voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs Adam voice
        animation: 'aggressive'
    },
    writer: {
        id: 'writer',
        name: 'The Writer',
        emoji: '✍️',
        color: '#764ba2',
        voiceId: 'VR6AewLTigWG4xSOukaG', // ElevenLabs Arnold voice
        animation: 'cool'
    }
};

// Avatar HTML/CSS animations
const AVATAR_ANIMATIONS = {
    float: `
        @keyframes avatarFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(2deg); }
            50% { transform: translateY(-5px) rotate(0deg); }
            75% { transform: translateY(-10px) rotate(-2deg); }
        }
    `,
    calm: `
        @keyframes avatarCalm {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.05) rotate(1deg); }
        }
    `,
    intense: `
        @keyframes avatarIntense {
            0%, 100% { transform: translateX(0px) scale(1); }
            25% { transform: translateX(-3px) scale(1.05); }
            50% { transform: translateX(0px) scale(1); }
            75% { transform: translateX(3px) scale(1.05); }
        }
    `,
    thoughtful: `
        @keyframes avatarThoughtful {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(-5deg) scale(0.98); }
        }
    `,
    aggressive: `
        @keyframes avatarAggressive {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(5deg); }
            50% { transform: scale(1) rotate(0deg); }
            75% { transform: scale(1.1) rotate(-5deg); }
        }
    `,
    cool: `
        @keyframes avatarCool {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(-3deg); }
        }
    `,
    speaking: `
        @keyframes avatarSpeaking {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.15); }
            50% { transform: scale(1.1); }
            75% { transform: scale(1.15); }
        }
    `
};

