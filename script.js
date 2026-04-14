// ==========================================
// CONSTANTS & UTILITIES
// ==========================================
const STORAGE_KEY = 'eventProposalsDb';

function getProposals() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveProposals(proposals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

function generateId() {
    return 'PRP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function getBadgeClass(status) {
    switch (status) {
        case 'Under Review': return 'badge-review';
        case 'Approved': return 'badge-approved';
        case 'Rejected': return 'badge-rejected';
        default: return 'badge-review';
    }
}

// SVG Assets for JS Status rendering
const SVG_REVIEW = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const SVG_APP = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
const SVG_REJ = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

function getStatusBadgeHTML(status) {
    let svg = SVG_REVIEW;
    if (status === 'Approved') svg = SVG_APP;
    if (status === 'Rejected') svg = SVG_REJ;
    return `${svg} <span>${status}</span>`;
}

// ==========================================
// AUTHENTICATION & SESSION
// ==========================================
function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function requireAuth(allowedRole) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    
    if (allowedRole && user.role !== allowedRole) {
        window.location.href = user.role === 'student' ? 'student.html' : 'faculty.html';
        return null;
    }
    
    const emailEl = document.getElementById('userEmail');
    if (emailEl) {
        emailEl.textContent = user.email;
    }
    
    return user;
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ==========================================
// MAIN INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const page = document.body.getAttribute('data-page');
    
    if (page === 'login') {
        initLoginPage();
    } else if (page === 'student') {
        const user = requireAuth('student');
        if (user) initStudentDashboard(user);
    } else if (page === 'faculty') {
        const user = requireAuth('faculty');
        if (user) initFacultyDashboard(user);
    } else if (page === 'proposal') {
        const user = requireAuth('student');
        if (user) initProposalForm(user);
    } else if (page === 'faculty-review') {
        const user = requireAuth('faculty');
        if (user) initFacultyReview(user);
    }
});

// ==========================================
// PAGE SPECIFIC LOGIC
// ==========================================

function initLoginPage() {
    const user = getCurrentUser();
    if (user) {
        window.location.href = user.role === 'student' ? 'student.html' : 'faculty.html';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const role = document.getElementById('role').value;
            
            sessionStorage.setItem('currentUser', JSON.stringify({ email, role }));
            window.location.href = role === 'student' ? 'student.html' : 'faculty.html';
        });
    }
}

function initStudentDashboard(user) {
    const proposals = getProposals().filter(p => p.studentEmail === user.email);
    const listContainer = document.getElementById('proposalsList');
    
    if (proposals.length === 0) {
        listContainer.innerHTML = '<div class="card grid-column-span-full"><p class="text-center color-gray">You have not constructed any event records yet.</p></div>';
        listContainer.style.display = 'block';
        return;
    }

    proposals.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    listContainer.innerHTML = proposals.map(p => `
        <div class="card proposal-card">
            <h3>
                ${p.title}
                <span class="badge ${getBadgeClass(p.status)}">${getStatusBadgeHTML(p.status)}</span>
            </h3>
            <div class="meta">
                <p><span>Event Date</span> <strong>${p.eventDate}</strong></p>
                <p><span>Venue Setup</span> <strong>${p.venue}</strong></p>
                <p><span>Estimated Budget</span> <strong style="color:var(--color-primary);">${formatCurrency(p.estimatedBudget)}</strong></p>
            </div>
            <div class="proposal-card-footer">
                <a href="proposal.html?id=${p.id}" class="btn btn-secondary btn-sm">
                    Access Details
                    <svg class="icon" style="width:16px;height:16px;" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
            </div>
        </div>
    `).join('');
}

function initFacultyDashboard(user) {
    const proposals = getProposals().filter(p => p.status === 'Under Review');
    const listContainer = document.getElementById('pendingProposalsList');
    
    if (proposals.length === 0) {
        listContainer.innerHTML = '<div class="card grid-column-span-full"><p class="text-center color-gray">System Check: System is optimal. No proposals queued for review.</p></div>';
        listContainer.style.display = 'block';
        return;
    }

    proposals.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

    listContainer.innerHTML = proposals.map(p => `
        <div class="card proposal-card">
            <h3>
                ${p.title}
                <span class="badge ${getBadgeClass(p.status)}">${getStatusBadgeHTML(p.status)}</span>
            </h3>
            <div class="meta">
                <p><span>Coordinator</span> <strong>${p.studentEmail}</strong></p>
                <p><span>Execution Date</span> <strong>${p.eventDate}</strong></p>
                <p><span>Requested Cap</span> <strong style="color:var(--color-primary);">${formatCurrency(p.estimatedBudget)}</strong></p>
            </div>
            <div class="proposal-card-footer">
                <a href="faculty-review.html?id=${p.id}" class="btn btn-primary btn-sm">
                    Execute Review
                    <svg class="icon" style="width:16px;height:16px;" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
            </div>
        </div>
    `).join('');
}

function initProposalForm(user) {
    const params = new URLSearchParams(window.location.search);
    const proposalId = params.get('id');
    const tableBody = document.getElementById('budgetItemsBody');
    const addBtn = document.getElementById('addItemBtn');
    const form = document.getElementById('proposalForm');
    
    function addBudgetRow(name = '', qty = 1, cost = 0) {
        const template = document.getElementById('budgetItemTemplate');
        const row = template.content.cloneNode(true).firstElementChild;
        
        row.querySelector('.item-name').value = name;
        row.querySelector('.item-qty').value = qty;
        row.querySelector('.item-cost').value = cost || '';
        if (name) calculateRow(row);
        
        row.querySelector('.item-qty').addEventListener('input', () => calculateRow(row));
        row.querySelector('.item-cost').addEventListener('input', () => calculateRow(row));
        row.querySelector('.remove-item-btn').addEventListener('click', (e) => {
            row.remove();
            calculateTotal();
        });
        
        tableBody.appendChild(row);
        calculateTotal();
    }
    
    function calculateRow(row) {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const cost = parseFloat(row.querySelector('.item-cost').value) || 0;
        const subtotal = qty * cost;
        row.querySelector('.item-total').textContent = formatCurrency(subtotal);
        calculateTotal();
    }

    function calculateTotal() {
        let total = 0;
        document.querySelectorAll('.budget-row').forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const cost = parseFloat(row.querySelector('.item-cost').value) || 0;
            total += (qty * cost);
        });
        document.getElementById('totalBudgetDisplay').textContent = formatCurrency(total);
        return total;
    }

    if (addBtn) addBtn.addEventListener('click', () => addBudgetRow());

    let isReadOnly = false;
    
    if (proposalId) {
        const proposals = getProposals();
        const proposal = proposals.find(p => p.id === proposalId && p.studentEmail === user.email);
        
        if (!proposal) {
            alert("Record locked or not found.");
            window.location.href = 'student.html';
            return;
        }

        document.getElementById('pageTitle').textContent = 'Modify Event Configuration';
        
        document.getElementById('title').value = proposal.title;
        document.getElementById('description').value = proposal.description;
        document.getElementById('eventDate').value = proposal.eventDate;
        document.getElementById('venue').value = proposal.venue;
        
        proposal.budgetItems.forEach(item => {
            addBudgetRow(item.name, item.quantity, item.costPerUnit);
        });

        const banner = document.getElementById('statusBanner');
        const badge = document.getElementById('statusBadge');
        banner.style.display = 'block';
        badge.style.display = 'inline-flex';
        badge.innerHTML = getStatusBadgeHTML(proposal.status);
        badge.className = `badge ${getBadgeClass(proposal.status)}`;

        if (proposal.status === 'Rejected') {
            banner.className = 'card banner-card banner-error mb-30';
            banner.innerHTML = `
                <h3 class="mb-10 text-sm" style="display:flex; align-items:center; gap:8px;">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Action Required: Proposal Revision Requested
                </h3>
                <p class="font-weight-600 mb-10">Faculty Remarks:</p>
                <div class="details-box" style="background: white;">${proposal.remarks}</div>
                <p class="text-sm mt-10" style="color:var(--color-danger);">System unlocked for configuration modifications based on remarks above.</p>
            `;
            document.getElementById('submitBtn').innerHTML = 'Commence Reproposal <svg class="icon" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>';
        } else {
            isReadOnly = true;
            if (proposal.status === 'Approved') {
                banner.className = 'card banner-card banner-success mb-30';
                banner.innerHTML = `
                    <h3 class="mb-10 text-sm" style="display:flex; align-items:center; gap:8px;">
                        <svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Proposal Officially Approved
                    </h3>
                    <p class="font-weight-600 mb-10">Faculty Instructions:</p>
                    <div class="details-box" style="background: white;">${proposal.remarks || 'Proceed securely.'}</div>
                `;
            } else {
                banner.className = 'card banner-card banner-info mb-30';
                banner.innerHTML = `
                    <h3 class="text-sm" style="display:flex; align-items:center; gap:8px;">
                        <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        System Lock: Configuration currently under faculty review. Modification capabilities are halted.
                    </h3>`;
            }
        }
    } else {
        addBudgetRow();
    }

    if (isReadOnly) {
        document.getElementById('pageTitle').textContent = 'Event Configuration Access (Read-Only)';
        form.querySelectorAll('input, document, textarea').forEach(el => el.setAttribute('readonly', true));
        form.querySelectorAll('button').forEach(el => el.disabled = true);
        
        document.getElementById('submitBtn').closest('.form-actions').style.display = 'none';
        if (addBtn) addBtn.style.display = 'none';
        document.querySelectorAll('.remove-item-btn').forEach(btn => btn.style.display = 'none');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        
        const budgetItems = [];
        document.querySelectorAll('.budget-row').forEach(row => {
            const name = row.querySelector('.item-name').value.trim();
            const quantity = parseFloat(row.querySelector('.item-qty').value) || 0;
            const costPerUnit = parseFloat(row.querySelector('.item-cost').value) || 0;
            if (name) {
                budgetItems.push({ name, quantity, costPerUnit, totalCost: quantity * costPerUnit });
            }
        });

        if (budgetItems.length === 0) {
            alert("System Alert: You must provision at least one valid resource item.");
            return;
        }

        const newProposal = {
            id: proposalId || generateId(),
            studentEmail: user.email,
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            eventDate: document.getElementById('eventDate').value,
            venue: document.getElementById('venue').value.trim(),
            budgetItems: budgetItems,
            estimatedBudget: calculateTotal(),
            status: 'Under Review',
            remarks: '',
            createdAt: proposalId ? getProposals().find(p=>p.id===proposalId).createdAt : new Date().toISOString()
        };

        const proposals = getProposals();
        if (proposalId) {
            const index = proposals.findIndex(p => p.id === proposalId);
            if (index !== -1) proposals[index] = newProposal;
        } else {
            proposals.push(newProposal);
        }
        
        saveProposals(proposals);
        window.location.href = 'student.html';
    });
}

function initFacultyReview(user) {
    const params = new URLSearchParams(window.location.search);
    const proposalId = params.get('id');
    
    if (!proposalId) {
        window.location.href = 'faculty.html';
        return;
    }

    const proposals = getProposals();
    const proposal = proposals.find(p => p.id === proposalId);
    
    if (!proposal) {
        alert("System Alert: Data index not found.");
        window.location.href = 'faculty.html';
        return;
    }

    document.getElementById('viewTitle').textContent = proposal.title;
    
    const statusBadge = document.getElementById('viewStatus');
    statusBadge.innerHTML = getStatusBadgeHTML(proposal.status);
    statusBadge.className = `badge ${getBadgeClass(proposal.status)}`;
    
    document.getElementById('viewStudent').textContent = proposal.studentEmail;
    document.getElementById('viewDate').textContent = proposal.eventDate;
    document.getElementById('viewVenue').textContent = proposal.venue;
    document.getElementById('viewDescription').innerHTML = proposal.description.replace(/\n/g, '<br>');
    
    const tbody = document.getElementById('viewBudgetItems');
    tbody.innerHTML = proposal.budgetItems.map(item => `
        <tr>
            <td class="font-weight-500" style="color:var(--color-heading);">${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.costPerUnit)}</td>
            <td class="font-weight-600 item-total">${formatCurrency(item.totalCost)}</td>
        </tr>
    `).join('');
    
    document.getElementById('viewTotalBudget').textContent = formatCurrency(proposal.estimatedBudget);

    const actionSection = document.getElementById('reviewActionSection');
    
    if (proposal.status !== 'Under Review') {
        actionSection.innerHTML = `
            <div class="banner-card ${proposal.status === 'Approved' ? 'banner-success' : 'banner-error'} m-0" style="margin:0;">
                <h3 class="text-sm mb-10">System Data: Logic dictates proposition has been ${proposal.status}</h3>
                <p class="font-weight-600 text-sm mb-10">Faculty Instructions:</p>
                <div class="details-box" style="background: white;">${proposal.remarks || 'No instructions transmitted.'}</div>
            </div>
        `;
        return;
    }

    // specific UI hover logic for the custom danger button without breaking inline CSS (actually it's handled in styles.css now)
    document.getElementById('approveBtn').addEventListener('click', () => {
        const remarks = document.getElementById('reviewRemarks').value.trim();
        updateProposalStatus(proposalId, 'Approved', remarks);
    });

    document.getElementById('rejectBtn').addEventListener('click', () => {
        const remarks = document.getElementById('reviewRemarks').value.trim();
        if (!remarks) {
            alert('System Lock: Operational remarks are explicitly mandated to successfully veto a proposal. Please formulate technical rationale.');
            document.getElementById('reviewRemarks').focus();
            return;
        }
        updateProposalStatus(proposalId, 'Rejected', remarks);
    });

    // Custom hover states for JS injected buttons
    const rejectBtn = document.getElementById('rejectBtn');
    rejectBtn.addEventListener('mouseenter', () => {
        rejectBtn.style.background = 'var(--color-danger)';
        rejectBtn.style.color = 'white';
    });
    rejectBtn.addEventListener('mouseleave', () => {
        rejectBtn.style.background = 'transparent';
        rejectBtn.style.color = 'var(--color-danger)';
    });
}

function updateProposalStatus(id, newStatus, remarks) {
    const proposals = getProposals();
    const index = proposals.findIndex(p => p.id === id);
    if (index !== -1) {
        proposals[index].status = newStatus;
        proposals[index].remarks = remarks;
        saveProposals(proposals);
        window.location.href = 'faculty.html';
    }
}
