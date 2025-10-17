document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const videoFeed = document.getElementById('video-feed');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const statusElement = document.getElementById('status');
    const modeSelect = document.getElementById('mode-select');
    const captureBtn = document.getElementById('capture-btn');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Initialize buttons
    if (startBtn) {
        startBtn.addEventListener('click', startCamera);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopCamera);
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', capturePhoto);
    }

    if (modeSelect) {
        modeSelect.addEventListener('change', changeMode);
    }

    // Start camera function
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                } 
            });
            
            videoFeed.srcObject = stream;
            videoFeed.play();
            updateStatus('Camera is active', 'success');
            
            // Enable/disable buttons
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            
        } catch (err) {
            console.error('Error accessing camera:', err);
            updateStatus('Error accessing camera: ' + err.message, 'error');
        }
    }

    // Stop camera function
    function stopCamera() {
        const stream = videoFeed.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoFeed.srcObject = null;
            updateStatus('Camera is off', 'error');
            
            // Enable/disable buttons
            if (startBtn) startBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = true;
        }
    }

    // Capture photo function
    function capturePhoto() {
        if (!videoFeed.srcObject) {
            updateStatus('Please start the camera first', 'error');
            return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image and download
        const link = document.createElement('a');
        link.download = 'capture-' + new Date().toISOString() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        updateStatus('Photo captured!', 'success');
    }

    // Change mode function
    function changeMode() {
        const mode = modeSelect.value;
        // Here you would typically make an API call to change the mode on the server
        updateStatus(`Mode changed to: ${mode}`, 'info');
    }

    // Update status message
    function updateStatus(message, type = 'info') {
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = 'status';
        
        switch (type) {
            case 'success':
                statusElement.style.color = '#4CAF50';
                statusElement.style.borderLeft = '5px solid #4CAF50';
                break;
            case 'error':
                statusElement.style.color = '#f44336';
                statusElement.style.borderLeft = '5px solid #f44336';
                break;
            case 'info':
            default:
                statusElement.style.color = '#2196F3';
                statusElement.style.borderLeft = '5px solid #2196F3';
        }
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Space to capture
        if (e.code === 'Space') {
            e.preventDefault();
            capturePhoto();
        }
        // S to start/stop
        else if (e.code === 'KeyS') {
            e.preventDefault();
            if (videoFeed.srcObject) {
                stopCamera();
            } else {
                startCamera();
            }
        }
    });
});
