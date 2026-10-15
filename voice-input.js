'use strict';

const TELUGU_LETTERS = [
    'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ',
    'క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
    'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ'
];
const ENGLISH_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SPEECH_LANG = { en: 'en-IN', te: 'te-IN' };
const LANG_NAME = { en: 'English', te: 'Telugu' };

const MAX_QUICK_ENDS = 4;
const MAX_SILENT_SESSIONS = 3;

const MAX_PARTICLES = 16;
const IS_ANDROID = /Android/i.test(navigator.userAgent);

const STOP_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';

function appLanguage() {
    try { return state.settings.language === 'te' ? 'te' : 'en'; } catch (_) { return 'en'; }
}

function motionReduced() {
    try {
        if (state.settings.reduceMotion) return true;
    } catch (_) {  }
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function notify(message) {
    if (typeof toast === 'function') toast(message);
}
 
function joinText(a, b) {
    return [String(a).trimEnd(), String(b).trim()].filter(Boolean).join(' ');
}
 
class VoiceInputController {
    constructor() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.supported = Boolean(SpeechRecognition);
        this.recognition = null;
        this.isRecording = false;
 
        this.input = null;
        this.baseText = '';
        this.interimActive = false;
        this.boundInputs = new WeakSet();
 
        this.particleTimer = null;
        this.restartTimer = null;
        this.startedAt = 0;
        this.quickEnds = 0;
        this.silentSessions = 0;
        this.sendIdleHTML = '';
 
        if (!this.supported) return;
 
        const r = new SpeechRecognition();

        r.continuous = !IS_ANDROID;
        r.interimResults = true;
        r.maxAlternatives = 1;
        r.onresult = (e) => this.handleResult(e);
        r.onerror = (e) => this.handleError(e);
        r.onend = () => this.handleEnd();
        this.recognition = r;
 
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); });
        window.addEventListener('pagehide', () => this.stop());
    }
 
 
    start() {
        if (!this.supported) {
            notify('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        if (this.isRecording) return;
 
        const input = document.getElementById('chat-input');
        if (!input || input.disabled) return;
 
        this.input = input;
        this.bindInput(input);
        this.baseText = input.value;
        this.interimActive = false;
        this.quickEnds = 0;
        this.silentSessions = 0;
        this.recognition.lang = SPEECH_LANG[appLanguage()];
 
        this.isRecording = true;
        if (!this.beginSession()) {
            this.isRecording = false;
            return;
        }
        this.updateUI(true);
        this.startParticleAnimation();
    }
 
    stop() {
        if (!this.isRecording) return;
        this.isRecording = false;
        this.interimActive = false;
        clearTimeout(this.restartTimer);
        this.stopParticleAnimation();
        if (this.recognition) {
            try { this.recognition.stop(); } catch (_) {  }
        }
        this.updateUI(false);
    }
 
    beginSession() {
        try {
            this.startedAt = Date.now();
            this.recognition.start();
            return true;
        } catch (err) {
            if (err && err.name === 'InvalidStateError') return true;
            console.error('Speech recognition failed to start:', err);
            notify('Could not start the microphone.');
            return false;
        }
    }
 
    discardSession() {
        this.interimActive = false;
        try { this.recognition.abort(); } catch (_) {  }
    }
 
    bindInput(input) {
        if (this.boundInputs.has(input)) return;
        this.boundInputs.add(input);
        input.addEventListener('input', () => {
            if (!this.isRecording) return;
            this.baseText = input.value;
            if (this.interimActive) this.discardSession();
        });
    }
 
    writeInput(text) {
        const input = this.input;
        const max = input.maxLength > 0 ? input.maxLength : 4000;
        input.value = text.slice(0, max).trimStart();
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
    }
 
    handleResult(event) {
        const input = this.input;
        if (!input || !input.isConnected) { this.stop(); return; }
 
        this.quickEnds = 0;
        this.silentSessions = 0;
 
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            if (result.isFinal) {
                this.baseText = joinText(this.baseText, transcript);
            } else {
                interim += transcript;
            }
        }
 
        this.interimActive = Boolean(interim.trim());
        this.writeInput(joinText(this.baseText, interim));
    }
 
    handleEnd() {
        this.interimActive = false;
        if (!this.isRecording) return;
 
        if (Date.now() - this.startedAt < 700) this.quickEnds++;
        else this.quickEnds = 0;
 
        if (this.quickEnds >= MAX_QUICK_ENDS) {
            notify('Voice input keeps stopping. Please check your microphone and try again.');
            this.stop();
            return;
        }
 
        clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
            if (!this.isRecording) return;
            if (!this.input || !this.input.isConnected) { this.stop(); return; }
            if (!this.beginSession()) this.stop();
        }, 250);
    }
 
    handleError(event) {
        switch (event.error) {
            case 'aborted':
                break;
            case 'no-speech':
                if (++this.silentSessions >= MAX_SILENT_SESSIONS) {
                    notify("I couldn't hear anything. Tap the mic to try again.");
                    this.stop();
                }
                break;
            case 'not-allowed':
            case 'service-not-allowed':
                notify('Microphone access was denied. Please allow it in your browser settings.');
                this.stop();
                break;
            case 'audio-capture':
                notify('No microphone was found.');
                this.stop();
                break;
            case 'network':
                notify('Voice input needs an internet connection.');
                this.stop();
                break;
            case 'language-not-supported':
                notify(`${LANG_NAME[appLanguage()]} voice input is not supported on this device.`);
                this.stop();
                break;
            default:
                console.warn('Speech Recognition Error:', event.error);
        }
    }
 
    updateUI(isActive) {
        const micBtn = document.getElementById('mic-button');
        const sendBtn = document.getElementById('chat-send-btn');
        if (!micBtn || !sendBtn) return;
 
        if (isActive) {
            this.sendIdleHTML = sendBtn.innerHTML;
            micBtn.classList.add('is-active');
            micBtn.setAttribute('aria-pressed', 'true');
            sendBtn.classList.add('is-stop');
            sendBtn.setAttribute('title', 'Stop recording');
            sendBtn.setAttribute('aria-label', 'Stop recording');
            sendBtn.setAttribute('formnovalidate', 'true');
            sendBtn.innerHTML = STOP_ICON;
        } else {
            micBtn.classList.remove('is-active');
            micBtn.setAttribute('aria-pressed', 'false');
            sendBtn.classList.remove('is-stop');
            sendBtn.setAttribute('title', 'Send message');
            sendBtn.setAttribute('aria-label', 'Send message');
            sendBtn.removeAttribute('formnovalidate');
            if (this.sendIdleHTML) sendBtn.innerHTML = this.sendIdleHTML;
        }
    }

    spawnParticle() {
        const wrapper = document.getElementById('mic-wrapper');
        if (!wrapper || wrapper.childElementCount > MAX_PARTICLES) return;
 
        const pool = appLanguage() === 'te' ? TELUGU_LETTERS : ENGLISH_LETTERS;
        const p = document.createElement('span');
        p.className = 'mic-particle';
        p.setAttribute('aria-hidden', 'true');
        p.textContent = pool[Math.floor(Math.random() * pool.length)];
 
        const angle = Math.random() * 2 * Math.PI;
        const distance = 35 + Math.random() * 45;
        p.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        p.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        p.style.setProperty('--rot', `${(Math.random() - 0.5) * 60}deg`);
 
        wrapper.appendChild(p);
        const remove = () => p.remove();
        p.addEventListener('animationend', remove, { once: true });
        setTimeout(remove, 3500);
    }
 
    startParticleAnimation() {
        clearInterval(this.particleTimer);
        if (motionReduced()) return;
        this.particleTimer = setInterval(() => {
            if (this.isRecording) this.spawnParticle();
        }, 350);
    }
 
    stopParticleAnimation() {
        clearInterval(this.particleTimer);
        this.particleTimer = null;
        document.querySelectorAll('.mic-particle').forEach((el) => el.remove());
    }
}
 
window.voiceInput = new VoiceInputController();