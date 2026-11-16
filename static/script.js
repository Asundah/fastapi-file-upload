const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const statusMessage = document.getElementById('status-message');
const previewContainer = document.getElementById('preview-container');
const uploadedImage = document.getElementById('uploaded-image');

let selectedFile = null;

// 1. Handle clicking the drop zone
dropZone.addEventListener('click', () => fileInput.click());

// 2. Handle drag and drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// 3. Handle file selection via click
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        statusMessage.innerText = "❌ Please select an image file.";
        statusMessage.style.color = "#ff5252";
        return;
    }
    selectedFile = file;
    statusMessage.innerText = `Selected: ${file.name}`;
    statusMessage.style.color = "#bb86fc";
}

// 4. Upload the file via Fetch API
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        statusMessage.innerText = "❌ Please select a file first.";
        statusMessage.style.color = "#ff5252";
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    statusMessage.innerText = "⏳ Uploading...";
    statusMessage.style.color = "#e0e0e0";

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData // Notice: NO headers here! The browser sets the multipart boundary automatically
        });

        const data = await response.json();

        if (response.ok) {
            statusMessage.innerText = "✅ " + data.message;
            statusMessage.style.color = "#4caf50";
            
            // Show the preview
            previewContainer.style.display = 'block';
            uploadedImage.src = data.url;
        } else {
            statusMessage.innerText = "❌ " + data.detail;
            statusMessage.style.color = "#ff5252";
        }
    } catch (error) {
        console.error(error);
        statusMessage.innerText = "❌ Upload failed. Check console.";
        statusMessage.style.color = "#ff5252";
    }
});