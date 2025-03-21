// Information about available transcription models
const TRANSCRIPTION_MODELS = {
    'whisper-1': {
        name: 'Whisper-1',
        description: 'Original Whisper model for audio transcription',
        endpoint: 'audio/transcriptions',
        defaultParams: {
            response_format: 'text'
        }
    },
    'gpt-4o-mini-transcribe': {
        name: 'GPT-4o Mini Transcribe',
        description: 'GPT-4o Mini model with transcription capabilities',
        endpoint: 'audio/transcriptions',
        defaultParams: {
            response_format: 'text'
        }
    },
    'gpt-4o-transcribe': {
        name: 'GPT-4o Transcribe',
        description: 'Full GPT-4o model with transcription capabilities',
        endpoint: 'audio/transcriptions',
        defaultParams: {
            response_format: 'text'
        }
    }
};
