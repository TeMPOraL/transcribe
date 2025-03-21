// Settings manager for the transcription app
class SettingsManager {
    constructor() {
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.cancelSettingsBtn = document.getElementById('cancel-settings');
        
        this.openaiKeyInput = document.getElementById('openai-api-key');
        this.geminiKeyInput = document.getElementById('gemini-api-key');
        
        this.initEventListeners();
        this.loadSavedSettings();
    }
    
    initEventListeners() {
        // Open settings modal
        this.settingsBtn.addEventListener('click', () => this.openModal());
        
        // Close settings modal
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeModal());
        
        // Save settings
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Close when clicking outside the modal
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.loadSavedSettings(); // Refresh the inputs with saved values
        this.settingsModal.classList.remove('hidden');
    }
    
    closeModal() {
        this.settingsModal.classList.add('hidden');
    }
    
    saveSettings() {
        const openaiKey = this.openaiKeyInput.value.trim();
        const geminiKey = this.geminiKeyInput.value.trim();
        
        // Save to localStorage
        if (openaiKey) {
            localStorage.setItem('openai_api_key', openaiKey);
        }
        
        if (geminiKey) {
            localStorage.setItem('gemini_api_key', geminiKey);
        }
        
        this.closeModal();
    }
    
    loadSavedSettings() {
        const openaiKey = localStorage.getItem('openai_api_key') || '';
        const geminiKey = localStorage.getItem('gemini_api_key') || '';
        
        this.openaiKeyInput.value = openaiKey;
        this.geminiKeyInput.value = geminiKey;
    }
    
    getAPIKey(provider) {
        switch(provider.toLowerCase()) {
            case 'openai':
                return localStorage.getItem('openai_api_key') || '';
            case 'gemini':
            case 'google':
                return localStorage.getItem('gemini_api_key') || '';
            default:
                return '';
        }
    }
    
    hasAPIKey(provider) {
        const key = this.getAPIKey(provider);
        return key && key.length > 0;
    }
}
