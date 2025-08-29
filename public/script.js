document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const uploadForm = document.getElementById('uploadForm');
    const unsplashForm = document.getElementById('unsplashForm');
    const imageListBody = document.querySelector('#imageList tbody');
    const welcomeUserSpan = document.getElementById('welcomeUser');

    let token = localStorage.getItem('token');

    const api = (endpoint, options = {}) => {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        return fetch(`/api${endpoint}`, options);
    };

    const checkLoginState = () => {
        if (token) {
            loginSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            welcomeUserSpan.textContent = "user"; // Simplified
            fetchImages();
        } else {
            loginSection.classList.remove('hidden');
            appSection.classList.add('hidden');
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            checkLoginState();
        } else {
            alert(data.message);
        }
    });

    logoutBtn.addEventListener('click', () => {
        token = null;
        localStorage.removeItem('token');
        checkLoginState();
    });

    const fetchImages = async () => {
        const response = await api('/images');
        const images = await response.json();
        imageListBody.innerHTML = '';
        images.forEach(image => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="/uploads/${image.originalFilename}" alt="preview"></td>
                <td>${image.originalFilename}</td>
                <td>${image.status}</td>
                <td>
                    <button onclick="enhanceImage(${image.id})">Enhance</button>
                    ${image.status === 'processed' ? `<a href="/api/images/${image.id}/download" target="_blank">Download</a>` : ''}
                    <button onclick="deleteImage(${image.id})">Delete</button>
                </td>
            `;
            imageListBody.appendChild(row);
        });
    };
    
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', document.getElementById('imageFile').files[0]);
        
        const response = await api('/images', { method: 'POST', body: formData });
        if(response.ok) {
            alert('Upload successful!');
            fetchImages();
        } else {
            alert('Upload failed.');
        }
    });

    unsplashForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.getElementById('unsplashQuery').value;
        const response = await api('/images/fetch-unsplash', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ query })
        });
        if(response.ok) {
            alert('Unsplash image fetched!');
            fetchImages();
        } else {
            alert('Failed to fetch from Unsplash.');
        }
    });


    window.enhanceImage = async (id) => {
        const response = await api(`/images/${id}/enhance`, { method: 'POST' });
        if(response.ok) {
            alert('Enhancement started. Refresh list in a bit to see status change.');
            setTimeout(fetchImages, 5000); // Refresh after 5s
        } else {
            alert('Failed to start enhancement.');
        }
    };
    
    window.deleteImage = async (id) => {
        if(confirm('Are you sure you want to delete this image?')) {
            const response = await api(`/images/${id}`, { method: 'DELETE' });
            if(response.ok) {
                alert('Image deleted.');
                fetchImages();
            } else {
                alert('Failed to delete image.');
            }
        }
    };

    checkLoginState();
});