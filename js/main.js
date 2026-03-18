// ============================
// cyber terminal portfolio
// ============================

// loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initializeAnimations();
    }, 2000);
});

// matrix rain effect
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.drops = [];
        this.fontSize = 14;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const text = String.fromCharCode(Math.random() * 128);
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// particle system
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles-container');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }
    
    init() {
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.animate();
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (10 + Math.random() * 20) + 's';
        
        this.container.appendChild(particle);
        this.particles.push({
            element: particle,
            x: parseFloat(particle.style.left),
            y: parseFloat(particle.style.top),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }
    
    animate() {
        this.particles.forEach(particle => {
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += (dx / distance) * force * 0.1;
                particle.vy += (dy / distance) * force * 0.1;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // boundary check
            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// typing animation
class TypingAnimation {
    constructor() {
        this.element = document.querySelector('.typed-text');
        this.cursor = document.querySelector('.cursor');
        this.texts = [
            'Cybersecurity Specialist',
            'Cybersecurity Analyst',
            'SOC Analyst',
            'System Administrator',
            'Security Tools Developer'
        ];
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.isDeleting ? 50 : 100;
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// terminal modal
class Terminal {
    constructor() {
        this.modal = document.getElementById('terminal-modal');
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.commands = {
            help: this.showHelp.bind(this),
            about: this.showAbout.bind(this),
            skills: this.showSkills.bind(this),
            contact: this.showContact.bind(this),
            clear: this.clearTerminal.bind(this),
            hack: this.runHack.bind(this)
        };
        
        this.setupEventListeners();
        this.bootTerminal();
    }
    
    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.input.value);
                this.commandHistory.push(this.input.value);
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.commandHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    this.input.value = '';
                }
            }
        });
        
        // close terminal
        document.querySelector('.btn-close').addEventListener('click', () => this.closeTerminal());
        
        // close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTerminal();
            }
        });
    }
    
    bootTerminal() {
        this.output.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-prompt">guest@portfolio:~$</span>
                <span class="terminal-command"></span>
            </div>
            <div class="terminal-success">Cyber Terminal v1.0.0</div>
            <div class="terminal-success">Welcome to my portfolio terminal</div>
            <div class="terminal-info">Type 'help' for available commands</div>
        `;
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    executeCommand(command) {
        this.output.innerHTML += `<div class="terminal-line">
            <span class="terminal-prompt">guest@portfolio:~$</span>
            <span class="terminal-command">${command}</span>
        </div>`;
        
        const [cmd, ...args] = command.toLowerCase().trim().split(' ');
        
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else if (cmd) {
            this.output.innerHTML += `<div class="terminal-error">Command not found: ${cmd}. Type 'help' for available commands.</div>`;
        }
        
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    showHelp() {
        const helpText = `
            <div class="terminal-help">
            <strong>Available Commands:</strong><br>
            <span class="command">• help</span> - Show this help message<br>
            <span class="command">• about</span> - Display about information<br>
            <span class="command">• skills</span> - List technical skills<br>
            <span class="command">• contact</span> - Show contact information<br>
            <span class="command">• hack</span> - Start hacking simulation (just for fun!)<br>
            <span class="command">• clear</span> - Clear terminal<br>
            </div>
        `;
        this.output.innerHTML += helpText;
    }
    
    showAbout() {
        this.output.innerHTML += `
            <div class="terminal-about">
            <strong>EDOARDO FORNASIER</strong><br>
            I'm a Cybersecurity Analyst who has been passionate about technology since childhood, 
            with a strong interest in programming and cybersecurity.<br><br>
            I enjoy understanding how systems behave, especially under pressure or during attacks 
            and I believe that working in security requires both defending systems and understanding 
            how vulnerabilities work.<br><br>
            This site is my personal space where I keep notes, share experiences, and explore topics 
            related to cybersecurity.
            </div>
        `;
    }
    
    showSkills() {
        const skills = `
            <div class="terminal-skills">
            • Wazuh SIEM<br>
            • WithSecure EDR<br>
            • Sophos EDR<br>
            • Microsoft Defender<br>
            • Nessus<br>
            • OpenVAS<br>
            • Burp Suite<br>
            • Metasploit Framework<br>
            • Hydra<br>
            • Wireshark<br>
            • AnyRun<br>
            • VirusTotal<br>
            • Linux<br>
            • Windows<br>
            • AWS<br>
            • Docker<br>
            • Proxmox<br>
            • Python<br>
            • C#<br>
            • C++<br>
            • Go<br>
            • JavaScript<br>
            • HTML<br>
            • CSS<br>
            • PowerShell<br>
            • Bash<br>
            • SQL<br>
            • Git<br>
            • GitHub<br>
            • Arduino<br>
            • ESP32
            </div>
        `;
        this.output.innerHTML += skills;
    }
    
    showContact() {
        this.output.innerHTML += `
            <div class="terminal-contact">
            Email: edoardo.enricomaria.fornasier@gmail.com<br>
            GitHub: https://github.com/CyberCactus64<br>
            LinkedIn: https://www.linkedin.com/in/edoardo-fornasier-b17882266
            </div>
        `;
    }
    
    clearTerminal() {
        this.output.innerHTML = '';
    }
    
    showDate() {
        const now = new Date();
        this.output.innerHTML += `<div>${now.toString()}</div>`;
    }
    
    runHack() {
        this.simulateProcessing('Initializing exploit framework...', 1000);
        setTimeout(() => {
            this.output.innerHTML += `<div class="terminal-success">Just kidding! I'm a security professional, not a hacker :)</div>`;
            this.output.innerHTML += `<div>Or maybe not... :)</div>`;
            this.output.scrollTop = this.output.scrollHeight;
        }, 2500);
    }
    
    simulateProcessing(message, duration) {
        let dots = 0;
        const interval = setInterval(() => {
            this.output.innerHTML += `<div>${message}${'.'.repeat(dots)}</div>`;
            this.output.scrollTop = this.output.scrollHeight;
            dots = (dots + 1) % 4;
        }, 200);
        
        setTimeout(() => {
            clearInterval(interval);
            this.output.scrollTop = this.output.scrollHeight;
        }, duration);
    }
}

// navigation
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.setupEventListeners();
        this.setupSkillCards();
    }
    
    setupEventListeners() {
        // mobile menu toggle
        this.hamburger.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
        });

        // close mobile menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
            });
        });

        // navbar background on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.style.background = 'rgba(10, 10, 10, 0.98)';
                this.navbar.style.backdropFilter = 'blur(15px)';
            } else {
                this.navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                this.navbar.style.backdropFilter = 'blur(10px)';
            }
        });
    }
    
    setupSkillCards() {
        const skillCards = document.querySelectorAll('.skill-card');
        
        skillCards.forEach(card => {
            let isFlipped = false;
            
            card.addEventListener('mouseenter', (e) => {
                if (!isFlipped) {
                    card.classList.add('flipped');
                    isFlipped = true;
                }
            });
            
            card.addEventListener('mouseleave', (e) => {
                // only flip back if mouse is actually leaving the card
                const rect = card.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX > rect.right || 
                    e.clientY < rect.top || e.clientY > rect.bottom) {
                    card.classList.remove('flipped');
                    isFlipped = false;
                }
            });
        });
    }
}

// statistics counter
class StatsCounter {
    constructor() {
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.animated = false;
        
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateStats();
                    this.animated = true;
                }
            });
        });
        
        this.statNumbers.forEach(stat => observer.observe(stat));
    }
    
    animateStats() {
        this.statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + '+';
                }
            };
            
            updateCounter();
        });
    }
}

// scroll animations
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.fade-in');
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        this.elements.forEach(element => observer.observe(element));
    }
}

// contact form
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }
    
    handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // simulate form submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span>SENDING...</span>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = '<span>✓ SENT!</span>';
            this.form.reset();
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 1500);
        
        console.log('Form data:', data);
    }
}

// initialize everything
function initializeAnimations() {
    new MatrixRain();
    new ParticleSystem();
    new TypingAnimation();
    new Terminal();
    new Navigation();
    new StatsCounter();
    new ScrollAnimations();
    new ContactForm();
}

// global functions
function openTerminal() {
    document.getElementById('terminal-modal').classList.add('active');
    document.getElementById('terminal-input').focus();
}

function closeTerminal() {
    document.getElementById('terminal-modal').classList.remove('active');
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// close terminal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTerminal();
    }
});

// close terminal on background click
document.getElementById('terminal-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeTerminal();
    }
});
