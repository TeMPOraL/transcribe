document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    const api = new TranscriptionAPI();
    const settings = new SettingsManager();
    const resultsManager = new ResultsManager('results-container');
    
    // Elements
    const fileInput = document.getElementById('audio-file');
    const fileDetails = document.getElementById('file-details');
    const errorMessage = document.getElementById('error-message');
    const audioPlayerContainer = document.getElementById('audio-player-container');
    const audioPreview = document.getElementById('audio-preview');
    
    let selectedFile = null;
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        
        if (selectedFile) {
            // Display file details
            const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
            fileDetails.textContent = `${selectedFile.name} (${fileSizeMB} MB)`;
            
            // Set up audio player if it's an audio file
            if (selectedFile.type.startsWith('audio/')) {
                const audioURL = URL.createObjectURL(selectedFile);
                audioPreview.src = audioURL;
                audioPlayerContainer.classList.remove('hidden');
                
                // Clean up object URL when audio is done
                audioPreview.onloadedmetadata = () => {
                    console.log(`Audio duration: ${audioPreview.duration.toFixed(2)}s`);
                };
            } else {
                audioPlayerContainer.classList.add('hidden');
            }
            
            // Set current file in results manager (handles caching logic)
            resultsManager.setCurrentFile(selectedFile.name);
        } else {
            fileDetails.textContent = '';
            audioPlayerContainer.classList.add('hidden');
        }
    });
    
    // Add all available models to the review section
    Object.keys(TRANSCRIPTION_MODELS).forEach(modelId => {
        resultsManager.createResultCard(modelId);
    });
    
    // Set up analyze buttons
    const diffBtn = document.getElementById('diff-btn');
    const likelihoodMapBtn = document.getElementById('likelihood-map-btn');

    diffBtn.addEventListener('click', () => {
        // Will be implemented later
        toast.show('Diff functionality will be implemented later');
    });

    likelihoodMapBtn.addEventListener('click', () => {
        // Will be implemented later
        toast.show('Likelihood map functionality will be implemented later');
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
