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
    createResultCard(modelId, initialContent = '', processingTime = null, isError = false) {
        const modelInfo = TRANSCRIPTION_MODELS[modelId];
        const modelName = modelInfo ? `openai/${modelInfo.name.toLowerCase()}` : modelId;
        const isNotRun = initialContent === 'Processing...';
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.id = `result-${modelId}`;
        
        // Create header with checkbox, model name, and status
        const header = document.createElement('div');
        header.className = 'result-header';
        
        // Checkbox for selecting results
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `select-${modelId}`;
        checkbox.className = 'result-select';
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
        if (processingTime) {
            timeEl.textContent = `(${processingTime}s)`;
        } else if (isNotRun) {
            timeEl.textContent = '(not run)';
        }
        
        modelLabel.appendChild(modelNameEl);
        modelLabel.appendChild(timeEl);
        
        // Action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'result-actions';
        
        // Add copy and download buttons only if not in "not run" state
        if (!isNotRun) {
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
        }
        
        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'action-btn toggle-btn';
        toggleBtn.innerHTML = isNotRun ? '<span title="Run this model">▶</span>' : '<span title="Show/hide transcription">▼</span>';
        toggleBtn.addEventListener('click', () => {
            if (isNotRun) {
                // Logic to run a single model will be implemented later
                toast.show('Single model run not implemented yet');
            } else {
                this.toggleTranscriptionVisibility(modelId);
            }
        });
        
        actionsContainer.appendChild(toggleBtn);
        
        // Add elements to header
        header.appendChild(checkbox);
        header.appendChild(modelLabel);
        header.appendChild(actionsContainer);
        
        // Content container (initially expanded for results, collapsed for "not run")
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        if (isNotRun) {
            resultContainer.style.display = 'none';
        }
        
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
                timeEl.textContent = `(${processingTime}s)`;
            }
            
            // Update toggle button to "▼" (expand/collapse)
            const toggleBtn = resultCard.querySelector('.toggle-btn');
            toggleBtn.innerHTML = '<span title="Show/hide transcription">▼</span>';
            
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
    
}
