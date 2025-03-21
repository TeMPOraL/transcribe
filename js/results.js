// Results handling for the transcription app
class ResultsManager {
    constructor(containerId) {
        this.resultsContainer = document.getElementById(containerId);
        this.transcriptionStore = {}; // Store for completed transcriptions
        this.comparisonActive = false;
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
            
            // Update comparison if active
            if (this.comparisonActive) {
                this.showComparison();
            }
        }
    }
    
    // Copy transcription to clipboard
    copyTranscription(modelId) {
        if (this.hasStoredTranscription(modelId)) {
            const text = this.transcriptionStore[modelId].content;
            navigator.clipboard.writeText(text)
                .then(() => this.showToast(`Copied ${TRANSCRIPTION_MODELS[modelId].name} transcription`))
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
            
            this.showToast(`Downloaded ${modelName} transcription`);
        }
    }
    
    // Show a temporary toast message
    showToast(message, duration = 2000) {
        let toast = document.getElementById('toast-notification');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.className = 'toast-visible';
        
        setTimeout(() => {
            toast.className = '';
        }, duration);
    }
    
    // Create comparison view of all transcriptions
    showComparison() {
        this.comparisonActive = true;
        const modelIds = this.getStoredModelIds();
        
        if (modelIds.length < 2) {
            this.showToast('Need at least 2 transcriptions to compare');
            return;
        }
        
        // Create comparison container if it doesn't exist
        let comparisonContainer = document.getElementById('comparison-container');
        if (!comparisonContainer) {
            comparisonContainer = document.createElement('div');
            comparisonContainer.id = 'comparison-container';
            comparisonContainer.className = 'comparison-container';
            
            const comparisonHeader = document.createElement('div');
            comparisonHeader.className = 'comparison-header';
            comparisonHeader.innerHTML = `
                <h3>Transcription Comparison</h3>
                <button id="close-comparison" class="secondary-btn">Close</button>
            `;
            
            comparisonContainer.appendChild(comparisonHeader);
            
            document.getElementById('close-comparison')?.addEventListener('click', () => this.closeComparison());
            
            this.resultsContainer.parentNode.insertBefore(comparisonContainer, this.resultsContainer.nextSibling);
        } else {
            comparisonContainer.innerHTML = '';
            const comparisonHeader = document.createElement('div');
            comparisonHeader.className = 'comparison-header';
            comparisonHeader.innerHTML = `
                <h3>Transcription Comparison</h3>
                <button id="close-comparison" class="secondary-btn">Close</button>
            `;
            
            comparisonContainer.appendChild(comparisonHeader);
            
            document.getElementById('close-comparison')?.addEventListener('click', () => this.closeComparison());
        }
        
        // Create a table to display comparisons
        const comparisonTable = document.createElement('table');
        comparisonTable.className = 'comparison-table';
        
        // Create header row with model names
        const headerRow = document.createElement('tr');
        modelIds.forEach(modelId => {
            const th = document.createElement('th');
            th.textContent = TRANSCRIPTION_MODELS[modelId].name;
            headerRow.appendChild(th);
        });
        
        const thead = document.createElement('thead');
        thead.appendChild(headerRow);
        comparisonTable.appendChild(thead);
        
        // Create tbody for content
        const tbody = document.createElement('tbody');
        const contentRow = document.createElement('tr');
        
        modelIds.forEach(modelId => {
            const td = document.createElement('td');
            const content = this.transcriptionStore[modelId].content;
            
            const div = document.createElement('div');
            div.className = 'comparison-text';
            div.textContent = content;
            
            td.appendChild(div);
            contentRow.appendChild(td);
        });
        
        tbody.appendChild(contentRow);
        comparisonTable.appendChild(tbody);
        
        // Add the table to the comparison container
        comparisonContainer.appendChild(comparisonTable);
        
        // Add download all button
        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.className = 'primary-btn';
        downloadAllBtn.textContent = 'Download All Transcriptions';
        downloadAllBtn.addEventListener('click', () => this.downloadAllTranscriptions());
        
        comparisonContainer.appendChild(downloadAllBtn);
    }
    
    // Close comparison view
    closeComparison() {
        this.comparisonActive = false;
        const comparisonContainer = document.getElementById('comparison-container');
        if (comparisonContainer) {
            comparisonContainer.remove();
        }
    }
    
    // Download all transcriptions as a ZIP file
    downloadAllTranscriptions() {
        const modelIds = this.getStoredModelIds();
        if (modelIds.length === 0) {
            this.showToast('No transcriptions to download');
            return;
        }
        
        // For a single transcription, just download it directly
        if (modelIds.length === 1) {
            this.downloadTranscription(modelIds[0]);
            return;
        }
        
        // Create a text file with all transcriptions
        let allText = '';
        modelIds.forEach(modelId => {
            const modelName = TRANSCRIPTION_MODELS[modelId].name;
            const content = this.transcriptionStore[modelId].content;
            allText += `=== ${modelName} ===\n${content}\n\n`;
        });
        
        const blob = new Blob([allText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-transcriptions.txt';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.showToast('Downloaded all transcriptions');
    }
}
