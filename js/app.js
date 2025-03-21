document.addEventListener('DOMContentLoaded', () => {
    // Initialize API and Settings
    const api = new TranscriptionAPI();
    const settings = new SettingsManager();
    
    // Elements
    const fileInput = document.getElementById('audio-file');
    const fileDetails = document.getElementById('file-details');
    const languageInput = document.getElementById('language');
    const transcribeBtn = document.getElementById('transcribe-btn');
    const resultsContainer = document.getElementById('results-container');
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
        clearResults();
        
        // Create placeholder result cards for each selected model
        selectedModels.forEach(modelId => {
            createResultCard(modelId, 'Processing...');
        });
        
        // Toggle layout class based on number of models
        if (selectedModels.length >= 2) {
            resultsContainer.classList.add('side-by-side');
        } else {
            resultsContainer.classList.remove('side-by-side');
        }
        
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
            updateResultCard(modelId, result, processingTime);
            
            return result;
        } catch (error) {
            console.error(`Transcription error for ${modelId}:`, error);
            updateResultCard(modelId, `Error: ${error.message || 'Failed to transcribe audio.'}`, null, true);
            // Don't rethrow to allow other models to complete
        }
    }
    
    // Create a result card for a model
    function createResultCard(modelId, initialContent = '', processingTime = null, isError = false) {
        const modelInfo = TRANSCRIPTION_MODELS[modelId];
        const modelName = modelInfo ? modelInfo.name : modelId;
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.id = `result-${modelId}`;
        
        const header = document.createElement('div');
        header.className = 'result-header';
        
        const modelNameEl = document.createElement('span');
        modelNameEl.className = 'model-name';
        modelNameEl.textContent = modelName;
        
        const timeEl = document.createElement('span');
        timeEl.className = 'processing-time';
        if (processingTime) {
            timeEl.textContent = `${processingTime}s`;
        }
        
        header.appendChild(modelNameEl);
        header.appendChild(timeEl);
        
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        
        const textarea = document.createElement('textarea');
        textarea.className = isError ? 'error-text' : '';
        textarea.readOnly = true;
        textarea.value = initialContent;
        
        resultContainer.appendChild(textarea);
        
        resultCard.appendChild(header);
        resultCard.appendChild(resultContainer);
        
        resultsContainer.appendChild(resultCard);
        
        return resultCard;
    }
    
    // Update a result card with transcription results
    function updateResultCard(modelId, content, processingTime = null, isError = false) {
        const resultCard = document.getElementById(`result-${modelId}`);
        
        if (resultCard) {
            const textarea = resultCard.querySelector('textarea');
            textarea.value = content;
            if (isError) {
                textarea.classList.add('error-text');
            }
            
            if (processingTime) {
                const timeEl = resultCard.querySelector('.processing-time');
                timeEl.textContent = `${processingTime}s`;
            }
        }
    }
    
    // Clear all results
    function clearResults() {
        resultsContainer.innerHTML = '';
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
