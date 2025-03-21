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
        formData.append('file', audioFile);
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
