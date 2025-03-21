document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    const api = new TranscriptionAPI();
    const settings = new SettingsManager();
    const resultsManager = new ResultsManager('results-container');
    
    // Elements
    const fileInput = document.getElementById('audio-file');
    const fileDetails = document.getElementById('file-details');
    const languageInput = document.getElementById('language');
    const transcribeBtn = document.getElementById('transcribe-btn');
    const errorMessage = document.getElementById('error-message');
    
    // Get all model checkboxes
    const modelCheckboxes = document.querySelectorAll('.model-checkbox input[type="checkbox"]');
    
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
        
        // Get selected models
        const selectedModels = Array.from(modelCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        if (selectedModels.length === 0) {
            showError('Please select at least one transcription model.');
            return;
        }
        
        // Check if OpenAI API key is present
        const apiKey = settings.getAPIKey('openai');
        
        if (!apiKey) {
            showError('Please set your OpenAI API key in Settings.');
            return;
        }
        
        // Show loading state
        transcribeBtn.disabled = true;
        transcribeBtn.textContent = 'Transcribing...';
        hideError();
        
        // Clear previous results
        resultsManager.clearResults();
        
        // Create placeholder result cards for each selected model
        selectedModels.forEach(modelId => {
            resultsManager.createResultCard(modelId, 'Processing...');
        });
        
        // Toggle layout class based on number of models
        resultsManager.setSideBySideLayout(selectedModels.length >= 2);
        
        // Process each model
        try {
            const transcriptionPromises = selectedModels.map(modelId => 
                processTranscription(apiKey, selectedFile, modelId, languageInput.value)
            );
            
            // Wait for all transcriptions to complete
            await Promise.all(transcriptionPromises);
        } catch (error) {
            console.error('One or more transcriptions failed:', error);
            // Individual errors are handled in processTranscription
        } finally {
            // Reset button state
            transcribeBtn.disabled = false;
            transcribeBtn.textContent = 'Transcribe';
        }
    });
    
    // Process transcription for a single model
    async function processTranscription(apiKey, file, modelId, language) {
        const startTime = performance.now();
        
        try {
            const result = await api.transcribe(
                apiKey,
                file,
                modelId,
                language
            );
            
            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(2);
            
            // Update the result card
            resultsManager.updateResultCard(modelId, result, processingTime);
            
            return result;
        } catch (error) {
            console.error(`Transcription error for ${modelId}:`, error);
            resultsManager.updateResultCard(modelId, `Error: ${error.message || 'Failed to transcribe audio.'}`, null, true);
            // Don't rethrow to allow other models to complete
        }
    }
    
    
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
