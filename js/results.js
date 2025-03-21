// Results handling for the transcription app
class ResultsManager {
    constructor(containerId) {
        this.resultsContainer = document.getElementById(containerId);
        this.transcriptionStore = {}; // Store for completed transcriptions
        this.selectedResults = new Set(); // Track selected results for analysis
        this.fileTranscriptionCache = {}; // Cache for transcriptions by filename
        this.currentFilename = null; // Track current filename
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
        
        // Add rerun button
        const rerunBtn = document.createElement('button');
        rerunBtn.className = 'action-btn rerun-btn';
        rerunBtn.innerHTML = '<span title="Re-run transcription">🔄</span>';
        rerunBtn.addEventListener('click', () => this.runTranscription(modelId));
        actionsContainer.appendChild(rerunBtn);
        
        // Add elements to header - in the requested order
        header.appendChild(checkbox);
        header.appendChild(playBtn);
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
    updateResultCard(modelId, content, processingTime = null, isError = false, fromCache = false) {
        const resultCard = document.getElementById(`result-${modelId}`);
        
        if (resultCard) {
            const textarea = resultCard.querySelector('textarea');
            textarea.value = content;
            if (isError) {
                textarea.classList.add('error-text');
            } else {
                textarea.classList.remove('error-text');
            }
            
            if (processingTime) {
                const timeEl = resultCard.querySelector('.processing-time');
                timeEl.textContent = `(${processingTime}s)${fromCache ? ' [cached]' : ''}`;
            }
            
            // Update or create toggle button for expand/collapse
            let toggleBtn = resultCard.querySelector('.toggle-btn');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<span title="Show/hide transcription">▼</span>';
            } else if (resultCard.toggleBtn) {
                toggleBtn = resultCard.toggleBtn;
                toggleBtn.innerHTML = '<span title="Show/hide transcription">▼</span>';
            }
            
            // Ensure rerun button exists
            this.ensureRerunButtonExists(resultCard, modelId);
            
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
                
                // Add buttons to the actions container
                actionsContainer.appendChild(copyBtn);
                actionsContainer.appendChild(downloadBtn);
            }
            
            // Show the transcription
            resultCard.querySelector('.result-container').style.display = 'block';
            
            // Enable checkbox for analysis
            const checkbox = resultCard.querySelector('.result-select');
            checkbox.disabled = false;
            
            // Add appropriate class based on error status
            resultCard.classList.remove('success-card', 'error-card');
            resultCard.classList.add(isError ? 'error-card' : 'success-card');
            
            // Store the transcription (if not from cache)
            if (!fromCache) {
                this.storeTranscription(modelId, content, processingTime);
            }
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
    
    // Set current file and handle switching between files
    setCurrentFile(filename) {
        if (!filename) return;
        
        // If switching to a different file, save current transcriptions
        if (this.currentFilename && this.currentFilename !== filename) {
            this.saveToCache(this.currentFilename);
        }
        
        this.currentFilename = filename;
        
        // Check if we have cached transcriptions for this file
        if (this.fileTranscriptionCache[filename]) {
            // Restore transcriptions from cache
            this.restoreFromCache(filename);
        } else {
            // New file - reset the interface
            this.resetInterface();
        }
    }

    // Save current transcriptions to cache
    saveToCache(filename) {
        if (!filename || Object.keys(this.transcriptionStore).length === 0) return;
        
        this.fileTranscriptionCache[filename] = JSON.parse(JSON.stringify(this.transcriptionStore));
    }

    // Restore transcriptions from cache
    restoreFromCache(filename) {
        if (!this.fileTranscriptionCache[filename]) return;
        
        // Reset current store
        this.transcriptionStore = {};
        this.selectedResults.clear();
        
        // Restore from cache
        const cachedData = this.fileTranscriptionCache[filename];
        this.transcriptionStore = JSON.parse(JSON.stringify(cachedData));
        
        // Update UI for each model
        Object.keys(TRANSCRIPTION_MODELS).forEach(modelId => {
            if (cachedData[modelId]) {
                // Restore this model's data from cache
                this.updateResultCardFromCache(modelId, cachedData[modelId]);
            } else {
                // Reset this model (no cached data)
                this.resetResultCard(modelId);
            }
        });
        
        this.updateAnalyzeButtons();
    }

    // Reset the interface for a new file
    resetInterface() {
        // Clear current transcriptions
        this.transcriptionStore = {};
        this.selectedResults.clear();
        
        // Reset all model cards
        Object.keys(TRANSCRIPTION_MODELS).forEach(modelId => {
            this.resetResultCard(modelId);
        });
        
        this.updateAnalyzeButtons();
    }

    // Update a result card from cached data
    updateResultCardFromCache(modelId, cachedData) {
        this.updateResultCard(
            modelId, 
            cachedData.content, 
            cachedData.processingTime,
            false, // Not an error
            true   // Is from cache
        );
    }

    // Reset a single result card to initial state
    resetResultCard(modelId) {
        const resultCard = document.getElementById(`result-${modelId}`);
        if (!resultCard) return;
        
        // Get elements in card
        const timeEl = resultCard.querySelector('.processing-time');
        const checkbox = resultCard.querySelector('.result-select');
        const textarea = resultCard.querySelector('textarea');
        const resultContainer = resultCard.querySelector('.result-container');
        
        // Reset UI elements
        textarea.value = '';
        textarea.classList.remove('error-text');
        timeEl.textContent = '(not run)';
        checkbox.disabled = true;
        checkbox.checked = false;
        resultContainer.style.display = 'none';
        resultCard.classList.remove('success-card', 'error-card');
        
        // Ensure play button is present
        this.ensurePlayButton(resultCard, modelId);
        
        // Ensure rerun button exists
        this.ensureRerunButtonExists(resultCard, modelId);
    }

    // Make sure play button exists
    ensurePlayButton(resultCard, modelId) {
        let playBtn = resultCard.querySelector('.play-btn');
        const toggleBtn = resultCard.querySelector('.toggle-btn');
        
        if (!playBtn && toggleBtn) {
            // Replace toggle with play button
            playBtn = document.createElement('button');
            playBtn.className = 'action-btn play-btn';
            playBtn.innerHTML = '<span title="Run transcription">▶️</span>';
            playBtn.dataset.modelId = modelId;
            playBtn.addEventListener('click', () => this.runTranscription(modelId));
            
            toggleBtn.parentNode.replaceChild(playBtn, toggleBtn);
        } else if (playBtn) {
            // Reset existing play button
            playBtn.innerHTML = '<span title="Run transcription">▶️</span>';
            playBtn.disabled = false;
        }
    }

    // Add rerun button if it doesn't exist
    ensureRerunButtonExists(resultCard, modelId) {
        const actionsContainer = resultCard.querySelector('.result-actions');
        if (!actionsContainer) return;
        
        let rerunBtn = actionsContainer.querySelector('.rerun-btn');
        
        if (!rerunBtn) {
            rerunBtn = document.createElement('button');
            rerunBtn.className = 'action-btn rerun-btn';
            rerunBtn.innerHTML = '<span title="Re-run transcription">🔄</span>';
            rerunBtn.addEventListener('click', () => this.runTranscription(modelId));
            
            actionsContainer.appendChild(rerunBtn);
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
                
                // Add buttons to actions container
                actionsContainer.appendChild(copyBtn);
                actionsContainer.appendChild(downloadBtn);
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
