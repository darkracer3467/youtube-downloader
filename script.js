// Form submission handler for search
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const query = document.getElementById('query').value;
    const resultsDiv = document.getElementById('results');
    const statusDiv = document.getElementById('status');
    
    // Clear previous results
    resultsDiv.innerHTML = '';
    
    // Show loading status
    statusDiv.className = '';
    statusDiv.textContent = 'Arama yapılıyor...';
    statusDiv.style.display = 'block';
    
    // Send search request to backend
    fetch('https://your-server-url.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        // Hide status
        statusDiv.style.display = 'none';
        
        // Display results
        if (data.length > 0) {
            data.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <img src="${item.thumbnail}" alt="${item.title}" class="result-thumbnail">
                    <div class="result-info">
                        <div class="result-title">${item.title}</div>
                        <div class="result-duration">${formatDuration(item.duration)}</div>
                        <button class="download-btn" data-url="${item.url}">İndir (MP3)</button>
                    </div>
                `;
                resultsDiv.appendChild(resultItem);
            });
            
            // Add event listeners to download buttons
            document.querySelectorAll('.download-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const url = this.getAttribute('data-url');
                    downloadMedia(url, 'mp3');
                });
            });
        } else {
            resultsDiv.innerHTML = '<p>Arama sonucu bulunamadı.</p>';
        }
    })
    .catch(error => {
        statusDiv.className = 'error';
        statusDiv.textContent = 'Bir hata oluştu: ' + error.message;
        statusDiv.style.display = 'block';
    });
});

// Format duration in seconds to MM:SS format
function formatDuration(seconds) {
    if (!seconds) return 'Bilinmiyor';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Download media function
function downloadMedia(url, mediaType) {
    const statusDiv = document.getElementById('status');
    
    // Show loading status
    statusDiv.className = '';
    statusDiv.textContent = 'İndirme işlemi başlatılıyor...';
    statusDiv.style.display = 'block';
    
    // Send download request to backend
    fetch('https://your-server-url.com/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url, mediaType: mediaType })
    })
    .then(response => response.json())
    .then(data => {
        // Check download status
        const checkStatus = () => {
            fetch(`https://your-server-url.com/status/${data.downloadId}`)
            .then(response => response.json())
            .then(statusData => {
                if (statusData.status === 'completed') {
                    statusDiv.className = 'success';
                    statusDiv.innerHTML = `
                        <p>${statusData.message}</p>
                        <p><strong>Başlık:</strong> ${statusData.title}</p>
                        <p>Dosya İndirme: Şu anda dosya bilgisayarınıza indiriliyor.</p>
                    `;
                } else if (statusData.status === 'error') {
                    statusDiv.className = 'error';
                    statusDiv.textContent = statusData.message;
                } else {
                    statusDiv.className = '';
                    statusDiv.textContent = statusData.message;
                    // Continue checking status
                    setTimeout(checkStatus, 1000);
                }
            })
            .catch(error => {
                statusDiv.className = 'error';
                statusDiv.textContent = 'Bir hata oluştu: ' + error.message;
            });
        };
        
        // Start checking status
        setTimeout(checkStatus, 1000);
    })
    .catch(error => {
        statusDiv.className = 'error';
        statusDiv.textContent = 'Bir hata oluştu: ' + error.message;
    });
}