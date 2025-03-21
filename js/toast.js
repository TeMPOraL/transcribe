// Toast notification manager
class ToastManager {
    constructor() {
        this.toastElement = null;
    }
    
    // Show a temporary toast message
    show(message, duration = 2000) {
        if (!this.toastElement) {
            this.toastElement = document.getElementById('toast-notification');
            
            if (!this.toastElement) {
                this.toastElement = document.createElement('div');
                this.toastElement.id = 'toast-notification';
                document.body.appendChild(this.toastElement);
            }
        }
        
        this.toastElement.textContent = message;
        this.toastElement.className = 'toast-visible';
        
        setTimeout(() => {
            this.toastElement.className = '';
        }, duration);
    }
}

// Create a global instance
const toast = new ToastManager();
