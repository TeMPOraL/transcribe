# Extra AI instructions
Here are stored extra guidelins for you.

## Vibe coding
This is a vibe-coded project. That is, I'm relying on you to do a good job here, I won't be touching the code myself if I can avoid it,
and I'm happy to embrace the directions you're giving. Whatever makes it work.

## Evolving your instruction set
If I tell you to remember something, behave differently, or you realize yourself you'd benefit from remembering some specific guideline,
please add it to this file (or modify existing guideline). The format of the guidelines is unspecified, except second-level headers to split
them by categories; otherwise, whatever works best for you is best. You may store information about the project you want to retain long-term,
as well as any instructions for yourself to make your work more efficient and correct.

## Project design
The project is a simple, client-side transcription playground for comparing different OpenAI transcription models. The implementation:

- Runs entirely in the browser (no server component)
- Uses vanilla HTML/CSS/JavaScript (no build step required)
- No external dependencies
- Features:
  - Audio file upload
  - Model selection (whisper-1, gpt-4o-mini-transcribe, gpt-4o-transcribe)
  - Language selection (defaults to Norwegian)
  - Transcription results display
  - Error handling

Directory structure:
- index.html (main entry point)
- css/styles.css (styling)
- js/models.js (model definitions)
- js/api.js (OpenAI API integration)
- js/app.js (application logic)
- js/results.js (results management and UI)
- js/settings.js (API key and settings management)
- js/toast.js (toast notification system)
- AI.md (AI instruction file)

