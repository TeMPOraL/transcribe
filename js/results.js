// Results handling for the transcription app
class ResultsManager {
    constructor(containerId) {
        this.resultsContainer = document.getElementById(containerId);
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
        }
    }
}
