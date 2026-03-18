// ============================
// articles system
// ============================

class ArticlesSystem {
    constructor() {
        this.articles = [];
        this.currentArticle = null;
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.renderArticles();
        this.setupEventListeners();
        this.initializeBackground();
    }

    async loadArticles() {
        try {
            // lista dei file markdown da caricare
            const articleFiles = [
                'article1.md',
                'article2.md'
            ];

            for (const filename of articleFiles) {
                try {
                    const response = await fetch(`articles/${filename}`);
                    if (response.ok) {
                        const content = await response.text();
                        const article = this.parseMarkdown(filename, content);
                        this.articles.push(article);
                    }
                } catch (error) {
                    console.warn(`Could not load article: ${filename}`, error);
                }
            }

            // ordina gli articoli per data (più recenti prima)
            this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    }

    parseMarkdown(filename, content) {
        const lines = content.split('\n');
        let title = '';
        let excerpt = '';
        let htmlContent = '';
        let headers = [];
        let inCodeBlock = false;
        let codeBlockLang = '';
        let codeBlockContent = '';

        // estrai il titolo dal primo header h1
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('# ')) {
                title = line.substring(2).trim();
                break;
            }
        }

        // se non troviamo titolo h1, usa il nome del file
        if (!title) {
            title = filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        // processa il contenuto
        let processedLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // gestisci code blocks
            if (line.startsWith('```')) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeBlockLang = line.substring(3).trim();
                    codeBlockContent = '';
                } else {
                    inCodeBlock = false;
                    processedLines.push(`<pre><code class="language-${codeBlockLang}">${this.escapeHtml(codeBlockContent)}</code></pre>`);
                    codeBlockContent = '';
                }
                continue;
            }

            if (inCodeBlock) {
                codeBlockContent += line + '\n';
                continue;
            }

            // processa altri elementi markdown
            let processedLine = this.processMarkdownLine(line);
            if (processedLine) {
                processedLines.push(processedLine);
            }
        }

        htmlContent = processedLines.join('\n');

        // genera excerpt (prime 150 caratteri del testo)
        const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
        excerpt = textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;

        // estrai headers per la navigazione
        headers = this.extractHeaders(content);

        return {
            id: filename.replace('.md', ''),
            title: title,
            excerpt: excerpt,
            content: htmlContent,
            date: this.getFileDate(filename),
            readTime: this.calculateReadTime(textContent),
            tags: this.extractTags(content),
            headers: headers
        };
    }

    processMarkdownLine(line) {
        const trimmed = line.trim();
        
        // headers
        if (trimmed.startsWith('#')) {
            const level = trimmed.match(/^#+/)[0].length;
            const text = trimmed.replace(/^#+\s*/, '');
            return `<h${level}>${this.processInlineMarkdown(text)}</h${level}>`;
        }

        // blockquote
        if (trimmed.startsWith('>')) {
            const text = trimmed.replace(/^>\s*/, '');
            return `<blockquote>${this.processInlineMarkdown(text)}</blockquote>`;
        }

        // lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const text = trimmed.replace(/^[-*]\s*/, '');
            return `<li>${this.processInlineMarkdown(text)}</li>`;
        }

        if (trimmed.match(/^\d+\.\s/)) {
            const text = trimmed.replace(/^\d+\.\s*/, '');
            return `<li>${this.processInlineMarkdown(text)}</li>`;
        }

        // horizontal rule
        if (trimmed === '---' || trimmed === '***') {
            return '<hr>';
        }

        // empty line
        if (trimmed === '') {
            return '<br>';
        }

        // regular paragraph
        if (trimmed !== '') {
            return `<p>${this.processInlineMarkdown(line)}</p>`;
        }

        return '';
    }

    processInlineMarkdown(text) {
        // bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // inline code
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        return this.escapeHtml(text);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    extractHeaders(content) {
        const headers = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                
                headers.push({
                    level: level,
                    text: text,
                    id: id,
                    line: i + 1
                });
            }
        }
        
        return headers;
    }

    extractTags(content) {
        const tags = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            const match = line.match(/^tags:\s*(.+)$/i);
            if (match) {
                const tagList = match[1].split(',').map(tag => tag.trim());
                tags.push(...tagList);
            }
        }
        
        return tags;
    }

    getFileDate(filename) {
        // per ora usa una data fissa, in futuro potresti voler leggere la data del file
        const dates = {
            'article1.md': '2024-01-15',
            'article2.md': '2024-01-20'
        };
        
        return dates[filename] || new Date().toISOString().split('T')[0];
    }

    calculateReadTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        const readTime = Math.ceil(words / wordsPerMinute);
        return Math.max(1, readTime);
    }

    renderArticles() {
        const grid = document.getElementById('articles-grid');
        
        if (this.articles.length === 0) {
            grid.innerHTML = `
                <div class="no-articles">
                    <p>No articles found. Check back soon!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.articles.map(article => `
            <article class="article-card fade-in" onclick="articlesSystem.openArticle('${article.id}')">
                <h3>${this.escapeHtml(article.title)}</h3>
                <p class="article-excerpt">${this.escapeHtml(article.excerpt)}</p>
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.date)}</span>
                    <span class="article-read-time">${article.readTime} min read</span>
                    <a href="#" class="read-more" onclick="event.stopPropagation(); articlesSystem.openArticle('${article.id}')">
                        Read More →
                    </a>
                </div>
                ${article.tags.length > 0 ? `
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </article>
        `).join('');

        // aggiungi animazioni fade-in
        this.setupScrollAnimations();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    openArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        this.currentArticle = article;
        
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-content').innerHTML = article.content;
        document.getElementById('article-modal').classList.add('active');
        
        // blocca lo scroll del body
        document.body.style.overflow = 'hidden';
        
        // scroll all'inizio del modal
        document.querySelector('.article-modal-body').scrollTop = 0;
    }

    closeArticle() {
        document.getElementById('article-modal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentArticle = null;
    }

    setupEventListeners() {
        // close modal con escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentArticle) {
                this.closeArticle();
            }
        });

        // close modal cliccando outside
        document.getElementById('article-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeArticle();
            }
        });

        // mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // chiudi menu al click su link
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    initializeBackground() {
        // inizializza matrix rain se non è già attivo
        if (!document.getElementById('matrix-canvas').hasAttribute('data-initialized')) {
            new MatrixRain();
            document.getElementById('matrix-canvas').setAttribute('data-initialized', 'true');
        }

        // inizializza particle system se non è già attivo
        if (!document.getElementById('particles-container').hasAttribute('data-initialized')) {
            new ParticleSystem();
            document.getElementById('particles-container').setAttribute('data-initialized', 'true');
        }
    }
}

// matrix rain per articles page
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        if (!this.canvas) return;
        
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

// particle system per articles page
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles-container');
        if (!this.container) return;
        
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }
    
    init() {
        for (let i = 0; i < 30; i++) {
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
            
            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// funzioni globali
function closeArticle() {
    if (window.articlesSystem) {
        window.articlesSystem.closeArticle();
    }
}

// inizializza quando il dom è caricato
document.addEventListener('DOMContentLoaded', () => {
    window.articlesSystem = new ArticlesSystem();
});
