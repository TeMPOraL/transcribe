// Results handling for the transcription app
class ResultsManager {
    constructor(containerId) {
        this.resultsContainer = document.getElementById(containerId);
        this.transcriptionStore = {}; // Store for completed transcriptions
        this.selectedResults = new Set(); // Track selected results for analysis
    }

    // Clear all results
    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.selectedResults.clear();
        this.updateAnalyzeButtons();
    }

    // Store transcription result
    storeTranscription(modelId, content, processingTime) {
        this.transcriptionStore[modelId] = {
            content: content,
            processingTime: processingTime,
            timestamp: new Date().toISOString()
        };
    }

    // Check if we already have a transcription for this model
    hasStoredTranscription(modelId) {
        return !!this.transcriptionStore[modelId];
    }

    // Get stored transcription
    getStoredTranscription(modelId) {
        return this.transcriptionStore[modelId];
    }

    // Get all stored model IDs
    getStoredModelIds() {
        return Object.keys(this.transcriptionStore);
    }

    // Create a result card for a model
    createResultCard(modelId) {
        const modelInfo = TRANSCRIPTION_MODELS[modelId];
        const modelName = modelInfo ? `openai/${modelInfo.name.toLowerCase()}` : modelId;
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.id = `result-${modelId}`;
        
        // Create header with play button, checkbox, model name, and status
        const header = document.createElement('div');
        header.className = 'result-header';
        
        // Play button - now positioned first
        const playBtn = document.createElement('button');
        playBtn.className = 'action-btn play-btn';
        playBtn.innerHTML = '<span title="Run transcription">▶️</span>';
        playBtn.dataset.modelId = modelId;
        playBtn.addEventListener('click', () => this.runTranscription(modelId));
        
        // Checkbox for selecting results
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `select-${modelId}`;
        checkbox.className = 'result-select';
        checkbox.disabled = true; // Disabled until transcription is successful
        checkbox.addEventListener('change', () => this.toggleResultSelection(modelId));
        
        // Model name and processing time
        const modelLabel = document.createElement('label');
        modelLabel.htmlFor = `select-${modelId}`;
        modelLabel.className = 'model-label';
        
        const modelNameEl = document.createElement('span');
        modelNameEl.className = 'model-name';
        modelNameEl.textContent = modelName;
        
        const timeEl = document.createElement('span');
        timeEl.className = 'processing-time';
        timeEl.textContent = '(not run)';
        
        modelLabel.appendChild(modelNameEl);
        modelLabel.appendChild(timeEl);
        
        // Action buttons container for other actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'result-actions';
        
        // Add elements to header - note the new order
        header.appendChild(playBtn);
        header.appendChild(checkbox);
        header.appendChild(modelLabel);
        header.appendChild(actionsContainer);
        
        // Content container (hidden initially)
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        resultContainer.style.display = 'none';
        
        const textarea = document.createElement('textarea');
        textarea.readOnly = true;
        textarea.value = '';
        
        resultContainer.appendChild(textarea);
        
        resultCard.appendChild(header);
        resultCard.appendChild(resultContainer);
        
        this.resultsContainer.appendChild(resultCard);
        
        return resultCard;
    }

    // Update a result card with transcription results
    updateResultCard(modelId, content, processingTime = null, isError = false) {
        const resultCard = document.getElementById(`result-${modelId}`);
        
        if (resultCard) {
            const textarea = resultCard.querySelector('textarea');
            textarea.value = content;
            if (isError) {
                textarea.classList.add('error-text');
            }
            
            if (processingTime) {
                const timeEl = resultCard.querySelector('.processing-time');
                timeEl.textContent = `(${processingTime}s)`;
            }
            
            // Update toggle button to "▼" (expand/collapse)
            let toggleBtn = resultCard.querySelector('.toggle-btn');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<span title="Show/hide transcription">▼</span>';
            } else if (resultCard.toggleBtn) {
                toggleBtn = resultCard.toggleBtn;
                toggleBtn.innerHTML = '<span title="Show/hide transcription">▼</span>';
            }
            
            // Add copy and download buttons if they don't exist
            const actionsContainer = resultCard.querySelector('.result-actions');
            if (!actionsContainer.querySelector('.copy-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'action-btn copy-btn';
                copyBtn.innerHTML = '<span title="Copy to clipboard">📋</span>';
                copyBtn.addEventListener('click', () => this.copyTranscription(modelId));
                
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'action-btn download-btn';
                downloadBtn.innerHTML = '<span title="Download as text file">💾</span>';
                downloadBtn.addEventListener('click', () => this.downloadTranscription(modelId));
                
                // Insert before the toggle button
                actionsContainer.insertBefore(downloadBtn, toggleBtn);
                actionsContainer.insertBefore(copyBtn, downloadBtn);
            }
            
            // Store the transcription
            this.storeTranscription(modelId, content, processingTime);
        }
    }
    
    // Toggle transcription visibility (expand/collapse)
    toggleTranscriptionVisibility(modelId) {
        const resultCard = document.getElementById(`result-${modelId}`);
        if (resultCard) {
            const resultContainer = resultCard.querySelector('.result-container');
            const toggleBtn = resultCard.querySelector('.toggle-btn span');
            
            if (resultContainer.style.display === 'none') {
                resultContainer.style.display = 'block';
                toggleBtn.textContent = '▼';
                toggleBtn.title = 'Hide transcription';
            } else {
                resultContainer.style.display = 'none';
                toggleBtn.textContent = '▶';
                toggleBtn.title = 'Show transcription';
            }
        }
    }
    
    // Toggle result selection for analysis
    toggleResultSelection(modelId) {
        const checkbox = document.getElementById(`select-${modelId}`);
        
        if (checkbox.checked) {
            this.selectedResults.add(modelId);
        } else {
            this.selectedResults.delete(modelId);
        }
        
        this.updateAnalyzeButtons();
    }
    
    // Update analyze buttons based on selection
    updateAnalyzeButtons() {
        const diffBtn = document.getElementById('diff-btn');
        const likelihoodMapBtn = document.getElementById('likelihood-map-btn');
        
        // Enable diff button only when exactly 2 results are selected
        diffBtn.disabled = this.selectedResults.size !== 2;
        
        // Enable likelihood map when at least 1 result is selected
        likelihoodMapBtn.disabled = this.selectedResults.size < 1;
    }
    
    // Copy transcription to clipboard
    copyTranscription(modelId) {
        if (this.hasStoredTranscription(modelId)) {
            const text = this.transcriptionStore[modelId].content;
            navigator.clipboard.writeText(text)
                .then(() => toast.show(`Copied ${TRANSCRIPTION_MODELS[modelId].name} transcription`))
                .catch(err => console.error('Could not copy text: ', err));
        }
    }
    
    // Download transcription as a text file
    downloadTranscription(modelId) {
        if (this.hasStoredTranscription(modelId)) {
            const text = this.transcriptionStore[modelId].content;
            const modelName = TRANSCRIPTION_MODELS[modelId].name;
            const filename = `${modelName.toLowerCase().replace(/\s+/g, '-')}-transcription.txt`;
            
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            toast.show(`Downloaded ${modelName} transcription`);
        }
    }
    
    // Run transcription for a single model
    async runTranscription(modelId) {
        const resultCard = document.getElementById(`result-${modelId}`);
        if (!resultCard) return;
        
        const playBtn = resultCard.querySelector('.play-btn');
        const timeEl = resultCard.querySelector('.processing-time');
        const checkbox = resultCard.querySelector('.result-select');
        const textarea = resultCard.querySelector('textarea');
        
        // Verify that an audio file is selected
        const audioFile = document.getElementById('audio-file').files[0];
        if (!audioFile) {
            toast.show('Please select an audio file first');
            return;
        }
        
        // Check if OpenAI API key is present
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            toast.show('Please set your OpenAI API key in Settings');
            return;
        }
        
        // Update UI to loading state
        playBtn.innerHTML = '<span title="Transcribing...">🔄</span>';
        playBtn.disabled = true;
        timeEl.textContent = '(transcribing...)';
        resultCard.classList.remove('success-card', 'error-card');
        
        const startTime = performance.now();
        const language = document.getElementById('language').value;
        
        try {
            const api = new TranscriptionAPI();
            const result = await api.transcribe(
                apiKey,
                audioFile,
                modelId,
                language
            );
            
            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(2);
            
            // Update result card with success state
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'action-btn toggle-btn';
            toggleBtn.innerHTML = '<span title="Show/hide transcription">▼</span>';
            toggleBtn.addEventListener('click', () => this.toggleTranscriptionVisibility(modelId));
            
            // Replace the play button with this toggle button
            playBtn.parentNode.replaceChild(toggleBtn, playBtn);
            
            // Store a reference to the toggle button for later use
            resultCard.toggleBtn = toggleBtn;
            
            // Add copy and download buttons
            const actionsContainer = resultCard.querySelector('.result-actions');
            
            // Only add buttons if they don't already exist
            if (!actionsContainer.querySelector('.copy-btn')) {
                // Copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'action-btn copy-btn';
                copyBtn.innerHTML = '<span title="Copy to clipboard">📋</span>';
                copyBtn.addEventListener('click', () => this.copyTranscription(modelId));
                
                // Download button
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'action-btn download-btn';
                downloadBtn.innerHTML = '<span title="Download as text file">💾</span>';
                downloadBtn.addEventListener('click', () => this.downloadTranscription(modelId));
                
                // Insert before the toggle button
                actionsContainer.insertBefore(copyBtn, playBtn);
                actionsContainer.insertBefore(downloadBtn, playBtn);
            }
            
            // Update UI
            timeEl.textContent = `(${processingTime}s)`;
            textarea.value = result;
            textarea.classList.remove('error-text');
            resultCard.classList.add('success-card');
            
            // Show the transcription
            resultCard.querySelector('.result-container').style.display = 'block';
            
            // Enable checkbox for analysis
            checkbox.disabled = false;
            
            // Store the transcription
            this.storeTranscription(modelId, result, processingTime);
            
        } catch (error) {
            // Update UI for error state
            playBtn.innerHTML = '<span title="Try again">🔄</span>';
            playBtn.disabled = false;
            playBtn.className = 'action-btn play-btn';
            
            timeEl.textContent = '(error)';
            textarea.value = `Error: ${error.message || 'Failed to transcribe audio'}`;
            textarea.classList.add('error-text');
            resultCard.classList.add('error-card');
            
            // Show the error message
            resultCard.querySelector('.result-container').style.display = 'block';
            
            console.error(`Transcription error for ${modelId}:`, error);
        }
    }
    
}
