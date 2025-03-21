// Results handling for the transcription app
class ResultsManager {
    constructor(containerId) {
        this.resultsContainer = document.getElementById(containerId);
        this.transcriptionStore = {}; // Store for completed transcriptions
    }

    // Clear all results
    clearResults() {
        this.resultsContainer.innerHTML = '';
    }

    // Set side-by-side layout based on number of models
    setSideBySideLayout(enabled) {
        if (enabled) {
            this.resultsContainer.classList.add('side-by-side');
        } else {
            this.resultsContainer.classList.remove('side-by-side');
        }
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
    createResultCard(modelId, initialContent = '', processingTime = null, isError = false) {
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
        
        // Action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'result-actions';
        
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
        
        actionsContainer.appendChild(copyBtn);
        actionsContainer.appendChild(downloadBtn);
        header.appendChild(actionsContainer);
        
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        
        const textarea = document.createElement('textarea');
        textarea.className = isError ? 'error-text' : '';
        textarea.readOnly = true;
        textarea.value = initialContent;
        
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
                timeEl.textContent = `${processingTime}s`;
            }
            
            // Store the transcription
            this.storeTranscription(modelId, content, processingTime);
        }
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
    
}
