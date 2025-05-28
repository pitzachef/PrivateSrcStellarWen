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
    } catch (error) {
        console.error('Error getting IP:', error)
        return null
    }
}

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

function showStatusModal(title, message, isError = false) {
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

    return { status, modal }
}

async function checkStatus() {
    try {
        const statusResponse = await fetch('https://raw.githubusercontent.com/pitzachef/Stellar/refs/heads/main/status')
        const status = await statusResponse.text()
        return status.trim()
    } catch (error) {
        console.error('Error checking status:', error)
        return 'down'
    }
}

async function getDownloadUrl() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/pitzachef/Stellar/refs/heads/main/url')
        const url = await response.text()
        return url.trim()
    } catch (error) {
        console.error('Error getting download URL:', error)
        return null
    }
}

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search)
    const hash = urlParams.get('hash')
    const waffle = urlParams.get('waffle')

    if (hash && waffle) {
        const status = await checkStatus()
        const downloadUrl = await getDownloadUrl()

        if (status === 'down') {
            showStatusModal('Stellar Status', 'Stellar is currently down. Please try again later.', true)
            return
        }

        if (status === 'fixing' || status === 'beta') {
            showStatusModal('Stellar Status', 'Stellar is currently under maintenance. Please check back soon!', true)
            return
        }

        if (status === 'up' && downloadUrl) {
            const { modal } = showStatusModal('Preparing Download', 'Establishing secure connection...')
            setTimeout(() => {
                modal.remove()
                window.location.href = downloadUrl
            }, 2000)
        }
    }
}

document.getElementById('downloadBtn').addEventListener('click', async function(e) {
    e.preventDefault()
    const ipHash = await getHashedIP()
    const waffleHash = generateRandomString(10)
    window.location.href = `?hash=${ipHash}&waffle=${waffleHash}`
})

document.getElementById('licenseBtn').addEventListener('click', function(e) {
    e.preventDefault()
    const licenseText = `STELLAR SOFTWARE LICENSE AGREEMENT
Effective Date: July 1, 2025
Licensor: Binninwl
Product: Stellar

This Software License Agreement ("Agreement") is a legal agreement between you ("Licensee") and Binninwl ("Licensor") for the use of the software known as "Stellar." By downloading, installing, or using Stellar, you agree to be bound by the terms of this Agreement. If you do not agree, do not install, copy, or use Stellar.

1. GRANT OF LICENSE
Licensor grants Licensee a non-exclusive, non-transferable, revocable license to use Stellar solely for personal, non-commercial purposes in accordance with this Agreement.

2. OWNERSHIP
All rights, title, and interest in and to Stellar—including but not limited to its source code, object code, design, interface, documentation, and trademarks—remain the sole property of Licensor. No ownership or intellectual property rights are transferred under this Agreement.

3. RESTRICTIONS
Licensee shall not:
- Copy, reproduce, or distribute Stellar in any form, except as expressly permitted by Licensor.
- Modify, adapt, translate, decompile, reverse engineer, disassemble, or create derivative works based on Stellar or any part thereof.
- Use Stellar for any commercial purpose, or in any way that violates applicable laws or regulations.
- Distribute modified or fake copies of Stellar.
- Claim Stellar as your own, or misrepresent your affiliation with it.
- Sell or profit from the distribution of Stellar.

4. PROHIBITED ACTIVITIES
Licensee shall not:
- Associate Stellar with any malicious or harmful activity, including malware or exploits.
- Use Stellar's name, brand, or assets in any way that misleads others or breaches platform or legal policies.
- Create software under the Stellar name or branding that is misleading, harmful, or illegal.

5. TERMINATION
Licensor reserves the right to terminate or restrict Licensee's access to Stellar at any time for any violation of this Agreement or to protect the integrity of Stellar and its users.

6. DISCLAIMER OF WARRANTIES
Stellar is provided "as is" without warranty of any kind. Licensor disclaims all warranties, express or implied, including but not limited to warranties of merchantability and fitness for a particular purpose. Licensee uses Stellar at their own risk.

7. LIMITATION OF LIABILITY
Licensor shall not be liable for any damages, losses, or consequences arising out of the use or inability to use Stellar, including but not limited to incidental, special, or consequential damages.

8. CHANGES TO AGREEMENT
Licensor may update this Agreement at any time without prior notice. Continued use of Stellar constitutes acceptance of any modified terms.

9. CONTACT
For questions or to report violations of this Agreement, contact: moonzybinninwl on Discord.`

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
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(15, 15, 20, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `

    const closeButton = document.createElement('div')
    closeButton.style.cssText = `
        position: sticky;
        top: 0;
        right: 0;
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
        margin-left: auto;
    `
    closeButton.innerHTML = '×'
    closeButton.onclick = () => modal.remove()

    const content = document.createElement('pre')
    content.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: monospace;
        margin: 1rem 0 0;
    `
    content.textContent = licenseText

    modal.appendChild(closeButton)
    modal.appendChild(content)
    document.body.appendChild(modal)
})

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.id !== 'downloadBtn') {
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
    
    document.querySelector('.hero-image').style.transform = `translate(${moveX}px, ${moveY}px)`
})