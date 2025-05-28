let currentHashedIP = null;
let currentWaffle = null;
let downloadCooldown = false;

const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards'
            observer.unobserve(entry.target)
        }
    })
}

const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.1
})

document.querySelectorAll('.feature-card').forEach(el => {
    observer.observe(el)
})

async function getHashedIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        const ip = data.ip + navigator.userAgent + Date.now()
        const encoder = new TextEncoder()
        const data_buffer = encoder.encode(ip)
        const hash_buffer = await crypto.subtle.digest('SHA-512', data_buffer)
        const hash_array = Array.from(new Uint8Array(hash_buffer))
        return hash_array.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
        return null
    }
}

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
    }
    return result
}

function showModal(title, message) {
    const modal = document.createElement('div')
    modal.className = 'glass-effect'
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
    `

    const closeButton = document.createElement('div')
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
    `
    closeButton.innerHTML = '×'
    closeButton.onclick = () => modal.remove()

    const titleEl = document.createElement('h3')
    titleEl.textContent = title
    titleEl.style.cssText = `
        color: #fff;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 500;
    `

    const status = document.createElement('p')
    status.textContent = message
    status.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin: 0;
    `

    modal.appendChild(closeButton)
    modal.appendChild(titleEl)
    modal.appendChild(status)
    document.body.appendChild(modal)
}

function showProgressBar() {
    const progress = document.createElement('div')
    progress.className = 'glass-effect'
    progress.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        height: 24px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `

    const bar = document.createElement('div')
    bar.style.cssText = `
        height: 100%;
        width: 0%;
        background: linear-gradient(to right, #00f260, #0575e6);
        transition: width 2s ease;
    `

    progress.appendChild(bar)
    document.body.appendChild(progress)

    requestAnimationFrame(() => {
        bar.style.width = '100%'
    })

    setTimeout(() => {
        progress.remove()
    }, 2100)
}

async function checkStatus() {
    try {
        const statusResponse = await fetch('https://raw.githubusercontent.com/pitzachef/Stellar/refs/heads/main/status')
        const status = await statusResponse.text()
        return status.trim()
    } catch {
        return 'down'
    }
}

async function generateNewCredentials() {
    currentHashedIP = await getHashedIP()
    currentWaffle = generateRandomString(10)
}

async function startDownload() {
    if (downloadCooldown) return
    downloadCooldown = true

    const status = await checkStatus()
    if (status === 'down') {
        showModal('Stellar is down', 'The Stellar service is currently unavailable. Try again later.')
        downloadCooldown = false
        return
    }

    showProgressBar()
    setTimeout(() => {
        const query = '?hash=' + currentHashedIP + '&waffle=' + currentWaffle
        window.location.href = window.location.origin + '/' + query
        downloadCooldown = false
    }, 2000)
}

document.getElementById('downloadBtn').addEventListener('click', startDownload)

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (!this.href.endsWith('#')) {
            e.preventDefault()
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            })
        }
    })
})

document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01
    const heroImage = document.querySelector('.hero-image')
    if (heroImage) heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`
})
