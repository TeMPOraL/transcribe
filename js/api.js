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
        
        // Enhanced file handling for Whisper model
        if (modelId === 'whisper-1') {
            // Get file extension and ensure proper MIME type
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
                default:
                    mimeType = audioFile.type || 'audio/mpeg';
            }
            
            // Create a new file with explicit MIME type
            const renamedFile = new File([audioFile], audioFile.name, { type: mimeType });
            formData.append('file', renamedFile);
        } else {
            // For other models, use the file as is
            formData.append('file', audioFile);
        }
        
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
            const response = await fetch(`${this.apiBaseUrl}/${model.endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
            }

            // Get the response as text (since we're requesting response_format=text)
            return await response.text();
        } catch (error) {
            throw error;
        }
    }
}
