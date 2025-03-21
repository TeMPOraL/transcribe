// Handle API calls to transcription services
class TranscriptionAPI {
    constructor() {
        this.apiBaseUrl = 'https://api.openai.com/v1';
    }

    async transcribe(apiKey, audioFile, modelId, language) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        if (!audioFile) {
            throw new Error('Audio file is required');
        }

        const model = TRANSCRIPTION_MODELS[modelId];
        if (!model) {
            throw new Error(`Unknown model: ${modelId}`);
        }

        const formData = new FormData();
        
        // Enhanced file handling for all models to ensure correct MIME types
        const fileExtension = audioFile.name.split('.').pop().toLowerCase();
        let mimeType;
        
        // Map file extensions to appropriate MIME types
        switch (fileExtension) {
            case 'm4a':
                mimeType = 'audio/mp4';
                break;
            case 'mp3':
                mimeType = 'audio/mpeg';
                break;
            case 'wav':
                mimeType = 'audio/wav';
                break;
            case 'ogg':
            case 'oga':
                mimeType = 'audio/ogg';
                break;
            case 'flac':
                mimeType = 'audio/flac';
                break;
            case 'webm':
                mimeType = 'audio/webm';
                break;
            case 'mp4':
                mimeType = 'video/mp4';
                break;
            default:
                mimeType = audioFile.type || 'audio/mpeg';
        }
        
        console.log(`Processing file: ${audioFile.name}, extension: ${fileExtension}, mime type: ${mimeType}`);
        
        // Create a new file with explicit MIME type
        const renamedFile = new File([audioFile], audioFile.name, { type: mimeType });
        formData.append('file', renamedFile);
        
        formData.append('model', modelId);
        
        // Add language if provided
        if (language) {
            formData.append('language', language);
        }
        
        // Add default parameters for the model
        if (model.defaultParams) {
            for (const [key, value] of Object.entries(model.defaultParams)) {
                formData.append(key, value);
            }
        }

        try {
            console.log(`Sending request to ${this.apiBaseUrl}/${model.endpoint} with model: ${modelId}`);
            
            // Log formData contents for debugging
            for (let [key, value] of formData.entries()) {
                if (key !== 'file') {
                    console.log(`FormData: ${key} = ${value}`);
                } else {
                    console.log(`FormData: file = ${value.name}, type: ${value.type}, size: ${value.size} bytes`);
                }
            }
            
            const response = await fetch(`${this.apiBaseUrl}/${model.endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Details:', errorData);
                
                // Create a more detailed error message
                const errorMessage = errorData.error?.message || `API error: ${response.status} ${response.statusText}`;
                throw new Error(`Transcription failed: ${errorMessage}`);
            }

            // Get the response as text (since we're requesting response_format=text)
            return await response.text();
        } catch (error) {
            console.error('Error during transcription:', error);
            throw error;
        }
    }
}
