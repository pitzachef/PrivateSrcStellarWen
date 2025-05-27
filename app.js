const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.1
});

document.querySelectorAll('.feature-card').forEach(el => {
    observer.observe(el);
});

async function getHashedIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip + navigator.userAgent + Date.now();
        const encoder = new TextEncoder();
        const data_buffer = encoder.encode(ip);
        const hash_buffer = await crypto.subtle.digest('SHA-512', data_buffer);
        const hash_array = Array.from(new Uint8Array(hash_buffer));
        return hash_array.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Error getting IP:', error);
        return null;
    }
}

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function showStatusModal(title, message, isError = false) {
    const modal = document.createElement('div');
    modal.className = 'glass-effect';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 2rem;
        border-radius: 1rem;
        z-index: 1000;
        width: 400px;
        text-align: center;
        background: rgba(15, 15, 20, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `;

    const closeButton = document.createElement('div');
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 18px;
    `;
    closeButton.innerHTML = '×';
    closeButton.onclick = () => modal.remove();

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
        color: #fff;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 500;
    `;

    const status = document.createElement('p');
    status.textContent = message;
    status.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin: 0;
    `;

    modal.appendChild(closeButton);
    modal.appendChild(titleEl);
    modal.appendChild(status);
    document.body.appendChild(modal);

    return { status, modal };
}

async function checkStatus() {
    try {
        const statusResponse = await fetch('https://raw.githubusercontent.com/pitzachef/Stellar/refs/heads/main/status');
        const status = await statusResponse.text();
        return status.trim();
    } catch (error) {
        console.error('Error checking status:', error);
        return 'down';
    }
}

async function getDownloadUrl() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/pitzachef/Stellar/refs/heads/main/url');
        const url = await response.text();
        return url.trim();
    } catch (error) {
        console.error('Error getting download URL:', error);
        return null;
    }
}

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get('hash');
    const waffle = urlParams.get('waffle');

    if (hash && waffle) {
        const status = await checkStatus();
        const downloadUrl = await getDownloadUrl();

        if (status === 'down') {
            showStatusModal('Stellar Status', 'Stellar is currently down. Please try again later.', true);
            return;
        }

        if (status === 'fixing' || status === 'beta') {
            showStatusModal('Stellar Status', 'Stellar is currently under maintenance. Please check back soon!', true);
            return;
        }

        if (status === 'up' && downloadUrl) {
            const { modal } = showStatusModal('Preparing Download', 'Establishing secure connection...');
            setTimeout(() => {
                modal.remove();
                window.location.href = downloadUrl;
            }, 2000);
        }
    }
};

document.getElementById('downloadBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    const ipHash = await getHashedIP();
    const waffleHash = generateRandomString(10);
    window.location.href = `?hash=${ipHash}&waffle=${waffleHash}`;
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.id !== 'downloadBtn') {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    document.querySelector('.hero-image').style.transform = `translate(${moveX}px, ${moveY}px)`;
});
