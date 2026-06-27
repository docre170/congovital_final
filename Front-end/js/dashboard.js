document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.dashboard-layout')) return;

    if (!localStorage.getItem('user_id')) {
        window.location.href = 'frontend/html/abonne.html';
        return;
    }

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    const sectionTitles = {
        'overview': 'Tableau de bord',
        'appointments': 'Rendez-vous',
        'book': 'Prendre rendez-vous',
        'profile': 'Mon profil',
        'messages': 'Messages',
        'patients': 'Patients',
        'users': 'Utilisateurs'
    };

    function showSection(sectionId) {
        sections.forEach(s => {
            s.classList.toggle('active', s.id === 'section-' + sectionId);
        });
        navItems.forEach(n => {
            n.classList.toggle('active', n.dataset.section === sectionId);
        });
        if (pageTitle && sectionTitles[sectionId]) {
            pageTitle.textContent = sectionTitles[sectionId];
        }
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const sectionId = this.dataset.section;
            if (sectionId) {
                showSection(sectionId);
            } else if (this.id === 'logout-btn') {
                handleLogout();
            }
        });
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });

    function showAlert(containerId, type, message) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const cls = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
        container.innerHTML = '<div class="alert-dashboard show ' + cls + '">' + message + '</div>';
        setTimeout(() => { container.innerHTML = ''; }, 5000);
    }

    function getStatusBadge(status) {
        var labels = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé' };
        return '<span class="status-badge ' + status + '">' + (labels[status] || status) + '</span>';
    }

    function refreshAppointmentsTable() {
        var url = API_BASE_URL + '/get_appointments.php?user_id=' + CURRENT_USER_ID;
        fetch(url)
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (!data.success) return;
                var apps = data.data || [];
                var tbody = document.getElementById('appointments-table-body');
                if (!tbody) return;
                if (apps.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#999;">Aucun rendez-vous trouvé</td></tr>';
                    return;
                }
                var html = '';
                apps.forEach(function(app) {
                    html += '<tr>' +
                        '<td>' + (app.service_type || app.service || '') + '</td>' +
                        '<td>' + formatDate(app.appointment_date) + '</td>' +
                        '<td>' + (app.appointment_time || '').substring(0, 5) + '</td>' +
                        '<td>' + getStatusBadge(app.status) + '</td>' +
                        '<td>' + getActionButtons(app) + '</td>' +
                        '</tr>';
                });
                tbody.innerHTML = html;
                attachAppointmentHandlers();
            })
            .catch(function(err) { console.error('Erreur chargement rendez-vous:', err); });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function getActionButtons(app) {
        if (app.status === 'pending') {
            return '<button class="btn-sm btn-success" onclick="confirmAppointment(' + app.id + ')">Confirmer</button> ' +
                '<button class="btn-sm btn-danger" onclick="cancelAppointment(' + app.id + ')">Annuler</button>';
        }
        if (app.status === 'confirmed') {
            var buttons = '';
            if (CURRENT_ROLE !== 'patient') {
                buttons += '<button class="btn-sm btn-info" onclick="completeAppointment(' + app.id + ')">Terminer</button> ';
            }
            buttons += '<button class="btn-sm btn-danger" onclick="cancelAppointment(' + app.id + ')">Annuler</button>';
            return buttons;
        }
        return '<span style="color:#999;font-size:0.85em;">--</span>';
    }

    function attachAppointmentHandlers() {
        document.querySelectorAll('.btn-sm.btn-success').forEach(function(btn) {
            if (btn.textContent.trim() === 'Confirmer' && !btn._attached) {
                btn._attached = true;
            }
        });
    }

    window.confirmAppointment = function(id) {
        if (!confirm('Confirmer ce rendez-vous?')) return;
        fetch(API_BASE_URL + '/update_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'confirmed' })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                showAlert('alert-container-dashboard', 'success', 'Rendez-vous confirmé.');
                refreshAppointmentsTable();
            } else {
                showAlert('alert-container-dashboard', 'error', data.message || 'Erreur de confirmation.');
            }
        })
        .catch(function() { showAlert('alert-container-dashboard', 'error', 'Erreur de connexion.'); });
    };

    window.cancelAppointment = function(id) {
        if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) return;
        fetch(API_BASE_URL + '/update_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'cancelled' })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                showAlert('alert-container-dashboard', 'success', 'Rendez-vous annulé.');
                refreshAppointmentsTable();
            } else {
                showAlert('alert-container-dashboard', 'error', data.message || 'Erreur d\'annulation.');
            }
        })
        .catch(function() { showAlert('alert-container-dashboard', 'error', 'Erreur de connexion.'); });
    };

    window.completeAppointment = function(id) {
        if (!confirm('Marquer ce rendez-vous comme terminé?')) return;
        fetch(API_BASE_URL + '/update_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'completed' })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                showAlert('alert-container-dashboard', 'success', 'Rendez-vous terminé.');
                refreshAppointmentsTable();
            } else {
                showAlert('alert-container-dashboard', 'error', data.message || 'Erreur.');
            }
        })
        .catch(function() { showAlert('alert-container-dashboard', 'error', 'Erreur de connexion.'); });
    };

    function handleLogout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
            localStorage.removeItem('fullname');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_role');
            localStorage.removeItem('remember_me');
            window.location.href = 'index.html';
        }
    }

    var bookForm = document.getElementById('book-appointment-form');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var data = {
                user_id: CURRENT_USER_ID,
                service_type: document.getElementById('book-service').value,
                appointment_date: document.getElementById('book-date').value,
                appointment_time: document.getElementById('book-time').value,
                notes: document.getElementById('book-notes').value || ''
            };
            fetch(API_BASE_URL + '/book_appointment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(function(r) { return r.json(); })
            .then(function(result) {
                if (result.success) {
                    showAlert('book-alert', 'success', 'Rendez-vous pris avec succès !');
                    bookForm.reset();
                    refreshAppointmentsTable();
                    setTimeout(function() { showSection('appointments'); }, 1500);
                } else {
                    showAlert('book-alert', 'error', result.message || 'Erreur lors de la réservation.');
                }
            })
            .catch(function() { showAlert('book-alert', 'error', 'Erreur de connexion au serveur.'); });
        });
    }

    var profileForm = document.getElementById('update-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var data = {
                user_id: CURRENT_USER_ID,
                fullname: document.getElementById('edit-fullname').value,
                phone: document.getElementById('edit-phone').value
            };
            fetch(API_BASE_URL + '/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(function(r) { return r.json(); })
            .then(function(result) {
                if (result.success) {
                    showAlert('profile-alert', 'success', 'Profil mis à jour avec succès !');
                    localStorage.setItem('fullname', data.fullname);
                } else {
                    showAlert('profile-alert', 'error', result.message || 'Erreur de mise à jour.');
                }
            })
            .catch(function() { showAlert('profile-alert', 'error', 'Erreur de connexion au serveur.'); });
        });
    }

    refreshAppointmentsTable();

    var hash = window.location.hash.replace('#', '');
    if (hash && sectionTitles[hash]) {
        showSection(hash);
    }
});

    // Gestion de l'ajout d'utilisateur par l'administrateur
    var adminAddUserForm = document.getElementById('admin-add-user-form');
    if (adminAddUserForm) {
        adminAddUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const role = document.getElementById('admin-role').value;
            
            // Sécurité supplémentaire côté client (même si le select le restreint)
            if (role === 'admin') {
                showAlert('admin-add-user-alert', 'error', 'Vous ne pouvez pas créer de compte administrateur.');
                return;
            }

            var data = {
                username: document.getElementById('admin-username').value,
                fullname: document.getElementById('admin-fullname').value,
                email: document.getElementById('admin-email').value,
                role: role,
                password: document.getElementById('admin-password').value,
                phone: document.getElementById('admin-phone').value || null
            };

            fetch(API_BASE_URL + '/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(function(r) { return r.json(); })
            .then(function(result) {
                if (result.success) {
                    showAlert('admin-add-user-alert', 'success', 'Compte créé avec succès !');
                    adminAddUserForm.reset();
                    // Recharger la page après un court délai pour voir le nouvel utilisateur dans la liste
                    setTimeout(function() { window.location.reload(); }, 1500);
                } else {
                    showAlert('admin-add-user-alert', 'error', result.message || 'Erreur lors de la création du compte.');
                }
            })
            .catch(function() { showAlert('admin-add-user-alert', 'error', 'Erreur de connexion au serveur.'); });
        });
    }
