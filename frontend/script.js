// ============================================
//  ROAMING BACKGROUND WORDS — Cosmic Library Theme
//  Gravity-well cursor effect + dense word cloud
// ============================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

const LIBRARY_WORDS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];

let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function rand(a, b) { return a + Math.random() * (b - a); }

// Brighter, more vivid palette
const PALETTE = [
    'rgba(196,181,253,1)',   // lavender
    'rgba(167,139,250,1)',   // violet
    'rgba(139,92,246,1)',    // purple
    'rgba(103,232,249,1)',   // cyan
    'rgba(56,189,248,1)',    // sky
    'rgba(248,250,252,0.9)', // white
    'rgba(245,208,254,1)',   // pink-purple
    'rgba(165,243,252,1)',   // light cyan
    'rgba(224,231,255,0.9)', // indigo-white
];

class WordParticle {
    constructor(initial = false) { this.init(initial); }

    init(initial = false) {
        this.word = LIBRARY_WORDS[Math.floor(Math.random() * LIBRARY_WORDS.length)];
        this.x = rand(0, canvas.width);
        this.y = initial ? rand(-100, canvas.height + 100) : rand(-80, -10);
        this.size = rand(14, 28);          // bigger letters
        this.baseAlpha = rand(0.04, 0.13);  // lower visibility
        this.alpha = 0;
        this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

        // Truly random direction — all 360°
        const angle = rand(0, Math.PI * 2);
        const speed = rand(0.25, 0.85);   // faster
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Ensure not stuck (add tiny drift)
        if (Math.abs(this.vy) < 0.08) this.vy += rand(0.08, 0.15) * (Math.random() > 0.5 ? 1 : -1);

        this.wobbleAmp = rand(0.2, 0.7);
        this.wobbleFreq = rand(0.008, 0.03);
        this.rotation = rand(-0.4, 0.4);
        this.rotSpeed = rand(-0.012, 0.012);
        this.life = 0;
        this.maxLife = rand(320, 800);

        // Parallax-ish depth
        this.depth = rand(0.5, 1.0);
    }

    update() {
        const t = this.life / this.maxLife;

        this.x += (this.vx + Math.sin(this.life * this.wobbleFreq) * this.wobbleAmp) * this.depth;
        this.y += (this.vy + Math.cos(this.life * this.wobbleFreq * 0.7) * this.wobbleAmp * 0.5) * this.depth;
        this.rotation += this.rotSpeed;
        this.life++;

        // Smooth fade in / out
        if (t < 0.1) this.alpha = this.baseAlpha * (t / 0.1);
        else if (t > 0.75) this.alpha = this.baseAlpha * ((1 - t) / 0.25);
        else this.alpha = this.baseAlpha;

        // Wrap around edges loosely, or reset when life ends
        if (
            this.life >= this.maxLife ||
            this.y > canvas.height + 80 ||
            this.y < -120 ||
            this.x > canvas.width + 160 ||
            this.x < -160
        ) { this.init(); }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.font = `${this.size}px 'Cormorant Garamond', serif`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.word, 0, 0);
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    const density = window._cosmicDensity || 1;
    // Triple the count for a dense word-cloud background
    const count = Math.min(350, Math.floor((canvas.width * canvas.height) / 4000 * density));
    for (let i = 0; i < count; i++) particles.push(new WordParticle(true));
}

function animateBg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateBg);
}

resizeCanvas();
initParticles();
animateBg();

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });


// ============================================
//  SETTINGS PANEL
// ============================================
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettings = document.getElementById('closeSettings');

settingsBtn.addEventListener('click', () => { settingsPanel.classList.add('open'); settingsOverlay.classList.add('open'); });
closeSettings.addEventListener('click', () => { settingsPanel.classList.remove('open'); settingsOverlay.classList.remove('open'); });
settingsOverlay.addEventListener('click', () => { settingsPanel.classList.remove('open'); settingsOverlay.classList.remove('open'); });

document.getElementById('setTheme').addEventListener('change', function () {
    document.body.classList.toggle('light-theme', this.value === 'light');
});


document.getElementById('setWordSpeed').addEventListener('input', function () {
    const v = parseFloat(this.value);
    particles.forEach(p => { p.vx *= v; p.vy *= v; });
});

document.getElementById('setDensity').addEventListener('change', function () {
    const m = { low: 0.4, medium: 1, high: 2 };
    window._cosmicDensity = m[this.value] || 1;
    initParticles();
});

document.getElementById('setAccent').addEventListener('change', function () {
    document.documentElement.style.setProperty('--accent', this.value);
    document.documentElement.style.setProperty('--border-glow', this.value + '80');
});

document.getElementById('setSidebarCompact').addEventListener('change', function () {
    const sb = document.querySelector('.sidebar');
    const mc = document.querySelector('.main-content');
    if (this.checked) {
        sb.style.width = '68px';
        mc.style.marginLeft = '68px';
        document.querySelectorAll('.menu-item span').forEach(s => s.style.display = 'none');
        document.querySelector('.logo h2').style.display = 'none';
    } else {
        sb.style.width = 'var(--sidebar-w)';
        mc.style.marginLeft = 'var(--sidebar-w)';
        document.querySelectorAll('.menu-item span').forEach(s => s.style.display = '');
        document.querySelector('.logo h2').style.display = '';
    }
});

document.getElementById('setReduceMotion').addEventListener('change', function () {
    const el = document.getElementById('reduce-motion-style') || Object.assign(document.createElement('style'), { id: 'reduce-motion-style' });
    el.textContent = this.checked
        ? `*, *::before, *::after { animation-duration:0.01ms !important; transition-duration:0.15s !important; } #bg-canvas { opacity:0.25; }`
        : '';
    document.head.appendChild(el);
});


// ============================================
//  NAVIGATION
// ============================================
const menuItems = document.querySelectorAll('.menu-item');
const viewSections = document.querySelectorAll('.view-section');
const API_URL = 'http://localhost:8081/api';

menuItems.forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        menuItems.forEach(m => m.classList.remove('active'));
        item.classList.add('active');
        viewSections.forEach(s => s.classList.remove('active'));
        const id = item.getAttribute('data-target');
        document.getElementById(id).classList.add('active');
        if (id === 'dashboard') loadDashboard();
        if (id === 'show-books') loadCatalog();
        if (id === 'admin-panel') loadAdmin();
    });
});


// ============================================
//  TOAST
// ============================================
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}


// ============================================
//  API
// ============================================
async function fetchBooks() {
    try { return await (await fetch(`${API_URL}/books`)).json(); }
    catch { return []; }
}


// ============================================
//  DASHBOARD
// ============================================
async function loadDashboard() {
    const books = await fetchBooks();
    animateCounter('stat-total', books.length);
    animateCounter('stat-issued', books.filter(b => b.isIssued).length);
    animateCounter('stat-available', books.filter(b => !b.isIssued).length);

    const tbody = document.getElementById('recent-books-list');
    tbody.innerHTML = '';
    books.slice(-5).reverse().forEach((b, i) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${i * 70}ms`;
        tr.innerHTML = `
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td><span class="badge ${b.isIssued ? 'badge-warning' : 'badge-success'}">${b.isIssued ? 'Issued' : 'Available'}</span></td>`;
        tbody.appendChild(tr);
    });
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    const start = parseInt(el.textContent) || 0;
    let step = 0;
    const timer = setInterval(() => {
        step++;
        const ease = 1 - Math.pow(1 - step / 36, 3);
        el.textContent = Math.round(start + (target - start) * ease);
        if (step >= 36) clearInterval(timer);
    }, 18);
}


// ============================================
//  CATALOG
// ============================================
async function loadCatalog() {
    const books = await fetchBooks();
    const tbody = document.getElementById('all-books-list');
    tbody.innerHTML = '';
    books.forEach((b, i) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${i * 50}ms`;
        tr.innerHTML = `
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td>₹${b.price}</td>
            <td><span class="badge ${b.isIssued ? 'badge-warning' : 'badge-success'}">${b.isIssued ? 'Issued' : 'Available'}</span></td>
            <td>${b.issuedTo || '—'}</td>`;
        tbody.appendChild(tr);
    });
}


// ============================================
//  ADMIN PANEL
// ============================================
let _allBooks = [];
let _activeFilter = 'all';

async function loadAdmin() {
    _allBooks = await fetchBooks();
    renderAdminSearch(_allBooks);
    renderMembers(_allBooks);
    renderReport(_allBooks);
}

function renderAdminSearch(books) {
    const query = (document.getElementById('adminSearch').value || '').toLowerCase();
    const filter = _activeFilter;

    const filtered = books.filter(b => {
        const matchFilter =
            filter === 'all' ? true :
                filter === 'issued' ? b.isIssued :
                    filter === 'available' ? !b.isIssued : true;

        const matchQuery =
            !query ||
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            String(b.id).includes(query);

        return matchFilter && matchQuery;
    });

    const tbody = document.getElementById('admin-search-results');
    tbody.innerHTML = '';

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:22px;color:var(--text-muted);font-style:italic;">No books found</td></tr>`;
        return;
    }

    filtered.forEach((b, i) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${i * 40}ms`;
        tr.innerHTML = `
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td>₹${b.price}</td>
            <td><span class="badge ${b.isIssued ? 'badge-warning' : 'badge-success'}">${b.isIssued ? 'Issued' : 'Available'}</span></td>
            <td>${b.issuedTo || '—'}</td>`;
        tbody.appendChild(tr);
    });
}

function renderMembers(books) {
    const issued = books.filter(b => b.isIssued);
    const tbody = document.getElementById('admin-members-list');
    tbody.innerHTML = '';
    if (!issued.length) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:22px;color:var(--text-muted);font-style:italic;">No active members</td></tr>`;
        return;
    }
    issued.forEach((b, i) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${i * 55}ms`;
        tr.innerHTML = `<td><strong>${b.issuedTo}</strong></td><td>#${b.id}</td><td>${b.title}</td>`;
        tbody.appendChild(tr);
    });
}

function renderReport(books) {
    const total = books.length;
    const issued = books.filter(b => b.isIssued).length;
    const avail = total - issued;
    const rate = total ? Math.round((issued / total) * 100) : 0;

    const container = document.getElementById('admin-report');
    container.innerHTML = '';

    [
        { label: 'Total Books', value: total, color: '#a78bfa' },
        { label: 'Issued', value: issued, color: '#fbbf24' },
        { label: 'Available', value: avail, color: '#34d399' },
        { label: 'Issue Rate', value: rate + '%', color: '#67e8f9' },
    ].forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = `
            background:rgba(255,255,255,0.03);
            border:1px solid var(--border);
            border-radius:12px;
            padding:20px;
            text-align:center;
            animation: fadeSlideIn 0.4s ease;
        `;
        div.innerHTML = `
            <div style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:${item.color};margin-bottom:6px;">${item.value}</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">${item.label}</div>
        `;
        container.appendChild(div);
    });
}

// Admin Search input
document.getElementById('adminSearch').addEventListener('input', () => renderAdminSearch(_allBooks));

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        _activeFilter = this.getAttribute('data-filter');
        renderAdminSearch(_allBooks);
    });
});

// Refresh
document.getElementById('adminRefreshBtn').addEventListener('click', async () => {
    showToast('🔄 Refreshing data...');
    await loadAdmin();
    showToast('✅ Data refreshed!');
});

// Print
document.getElementById('adminPrintBtn').addEventListener('click', () => {
    window.print();
});

// Export CSV
document.getElementById('adminExportBtn').addEventListener('click', async () => {
    const books = await fetchBooks();
    const rows = [
        ['ID', 'Title', 'Author', 'Price', 'Status', 'Issued To'],
        ...books.map(b => [b.id, b.title, b.author, b.price, b.isIssued ? 'Issued' : 'Available', b.issuedTo || ''])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cosmic-pages-catalog.csv';
    a.click();
    showToast('📥 CSV exported!');
});

// Delete (frontend-only — removes from local view)
document.getElementById('adminDeleteBtn').addEventListener('click', () => {
    const id = parseInt(document.getElementById('deleteBookId').value);
    if (!id) { showToast('⚠️ Enter a Book ID'); return; }
    const idx = _allBooks.findIndex(b => b.id === id);
    if (idx === -1) { showToast('❌ Book not found'); return; }

    const book = _allBooks[idx];
    if (book.isIssued) { showToast('⚠️ Cannot delete — book is currently issued'); return; }

    _allBooks.splice(idx, 1);
    renderAdminSearch(_allBooks);
    renderMembers(_allBooks);
    renderReport(_allBooks);
    document.getElementById('deleteBookId').value = '';
    showToast(`🗑️ "${book.title}" removed from view`);
});


// ============================================
//  FORMS
// ============================================
document.getElementById('addBookForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.style.opacity = '0.6'; btn.disabled = true;
    const payload = {
        id: parseInt(document.getElementById('bookId').value),
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        price: parseInt(document.getElementById('bookPrice').value)
    };
    try {
        const data = await (await fetch(`${API_URL}/books`, { method: 'POST', body: JSON.stringify(payload) })).json();
        if (data.success) { e.target.reset(); showToast('✨ Book added to catalog'); loadDashboard(); }
        else showToast('⚠️ ' + (data.error || 'Failed to add book'));
    } catch { showToast('❌ Network error'); }
    finally { btn.style.opacity = ''; btn.disabled = false; }
});

document.getElementById('issueBookForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = parseInt(document.getElementById('issueBookId').value);
    const name = document.getElementById('issueMemberName').value;
    try {
        const data = await (await fetch(`${API_URL}/issue`, { method: 'POST', body: JSON.stringify({ id, name }) })).json();
        if (data.success) { e.target.reset(); showToast(`📚 Book #${id} issued to ${name}`); loadDashboard(); loadCatalog(); }
        else showToast('⚠️ ' + (data.error || 'Failed'));
    } catch { showToast('❌ Network error'); }
});

document.getElementById('returnBookForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = parseInt(document.getElementById('returnBookId').value);
    try {
        const data = await (await fetch(`${API_URL}/return`, { method: 'POST', body: JSON.stringify({ id }) })).json();
        if (data.success) { e.target.reset(); showToast(`↩️ Book #${id} returned`); loadDashboard(); loadCatalog(); }
        else showToast('⚠️ ' + (data.error || 'Failed'));
    } catch { showToast('❌ Network error'); }
});


// ============================================
//  INIT
// ============================================
loadDashboard();
loadCatalog();


// ============================================
//  ADMIN AVATAR POPOVER (bottom-left button)
// ============================================
const adminAvatarBtn = document.getElementById('adminAvatarBtn');
const adminPopover = document.getElementById('adminPopover');

adminAvatarBtn.addEventListener('click', e => {
    e.stopPropagation();
    adminPopover.classList.toggle('open');
});

// Close when clicking anywhere outside
document.addEventListener('click', () => adminPopover.classList.remove('open'));
adminPopover.addEventListener('click', e => e.stopPropagation());

// ── Popover actions ──

// 1. Go to Admin Panel
document.getElementById('popGoAdmin').addEventListener('click', () => {
    adminPopover.classList.remove('open');
    menuItems.forEach(m => m.classList.remove('active'));
    document.querySelector('[data-target="admin-panel"]').classList.add('active');
    viewSections.forEach(s => s.classList.remove('active'));
    document.getElementById('admin-panel').classList.add('active');
    loadAdmin();
});

// 2. Export CSV
document.getElementById('popExportCsv').addEventListener('click', async () => {
    adminPopover.classList.remove('open');
    const books = await fetchBooks();
    const rows = [
        ['ID', 'Title', 'Author', 'Price', 'Status', 'Issued To'],
        ...books.map(b => [b.id, `"${b.title}"`, `"${b.author}"`, b.price,
        b.isIssued ? 'Issued' : 'Available', b.issuedTo || ''])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'cosmic-pages-catalog.csv'
    });
    a.click();
    showToast('📥 Catalog exported as CSV!');
});

// 3. Print
document.getElementById('popPrint').addEventListener('click', () => {
    adminPopover.classList.remove('open');
    window.print();
});

// 4. Sign Out (demo — show toast and reload after 2s)
document.getElementById('popSignOut').addEventListener('click', () => {
    adminPopover.classList.remove('open');
    showToast('👋 Signing out...');
    setTimeout(() => location.reload(), 2000);
});
