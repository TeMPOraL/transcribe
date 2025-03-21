document.addEventListener('DOMContentLoaded', () => {
    // Initialize API
    const api = new TranscriptionAPI();
    
    // Elements
    const fileInput = document.getElementById('audio-file');
    const fileDetails = document.getElementById('file-details');
    const modelSelect = document.getElementById('model-select');
    const languageInput = document.getElementById('language');
    const transcribeBtn = document.getElementById('transcribe-btn');
    const transcriptionResult = document.getElementById('transcription-result');
    const errorMessage = document.getElementById('error-message');
    
    let selectedFile = null;
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        
        if (selectedFile) {
            // Display file details
            const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
            fileDetails.textContent = `${selectedFile.name} (${fileSizeMB} MB)`;
            
            // Enable the transcribe button
            transcribeBtn.disabled = false;
        } else {
            fileDetails.textContent = '';
            transcribeBtn.disabled = true;
        }
    });
    
    // Handle transcribe button click
    transcribeBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showError('Please select an audio file first.');
            return;
        }
        
        // Get the API key from the user
        const apiKey = prompt('Please enter your OpenAI API key:');
        if (!apiKey) {
            showError('API key is required for transcription.');
            return;
        }
        
        // Show loading state
        transcribeBtn.disabled = true;
        transcribeBtn.textContent = 'Transcribing...';
        transcriptionResult.value = 'Processing...';
        hideError();
        
        try {
            const result = await api.transcribe(
                apiKey,
                selectedFile,
                modelSelect.value,
                languageInput.value
            );
            
            // Display the result
            transcriptionResult.value = result;
        } catch (error) {
            console.error('Transcription error:', error);
            showError(error.message || 'Failed to transcribe audio. Please try again.');
            transcriptionResult.value = '';
        } finally {
            // Reset button state
            transcribeBtn.disabled = false;
            transcribeBtn.textContent = 'Transcribe';
        }
    });
    
    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }
});
