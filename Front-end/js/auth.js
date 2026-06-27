// frontend/js/auth.js

// Configuration de l'API - ADAPTEZ CE CHEMIN SELON VOTRE STRUCTURE
const API_BASE_URL = 'http://localhost/congovital/backend/api';

document.addEventListener('DOMContentLoaded', function() {
    // ================ GESTION DE LA CONNEXION ================
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupération des valeurs
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.getElementById('role').value;
            
            // Validation basique
            if (!email || !password || !role) {
                showAlert('Veuillez remplir tous les champs obligatoires.', 'danger');
                return;
            }
            
            // Afficher le chargement
            showAlert('Connexion en cours...', 'info');
            
            // Désactiver le bouton
            const submitBtn = document.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Connexion...';
            }
            
            // Appel à l'API
            fetch(API_BASE_URL + '/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: role
                })
            })
            .then(response => {
                console.log('Status HTTP:', response.status);
                
                if (!response.ok) {
                    if (response.status === 405) {
                        throw new Error('Méthode non autorisée. Vérifiez l\'URL et la méthode POST.');
                    }
                    if (response.status === 404) {
                        throw new Error('API introuvable. Vérifiez l\'URL: ' + API_BASE_URL + '/login.php');
                    }
                    if (response.status === 500) {
                        throw new Error('Erreur serveur. Vérifiez les logs PHP.');
                    }
                    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response.json();
            })
            .then(data => {
                console.log('Réponse du serveur:', data);
                
                if (data.success) {
                    showAlert('✅ Connexion réussie ! Redirection en cours...', 'success');
                    
                    // Stocker les informations utilisateur
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('session', JSON.stringify(data.session));
                    
                    // Redirection selon le rôle
                    setTimeout(() => {
                        const userRole = data.user.role;
                        
                        switch(userRole) {
                            case 'admin':
                                window.location.href = '../pages/admin/dashboard-admin.html';
                                break;
                            case 'doctor':
                            case 'nurse':
                                window.location.href = '../pages/professionnel/dashboard-professionnel.html';
                                break;
                            case 'patient':
                            default:
                                window.location.href = '../pages/dashboard-patient.html';
                                break;
                        }
                    }, 1500);
                    
                } else {
                    showAlert('❌ ' + data.message, 'danger');
                    
                    // Réactiver le bouton
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Se Connecter';
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showAlert('❌ ' + error.message, 'danger');
                
                // Réactiver le bouton
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Se Connecter';
                }
            });
        });
    }
    
    // ================ GESTION DE L'INSCRIPTION ================
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupération des valeurs
            const username = document.getElementById('username').value.trim();
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();
            const phone = document.getElementById('phone')?.value.trim() || '';
            const dateOfBirth = document.getElementById('date_of_birth')?.value.trim() || '';
            const gender = document.getElementById('gender')?.value || '';
            const role = document.getElementById('role')?.value || 'patient';
            
            // Validation
            if (!username || !fullname || !email || !password || !confirmPassword) {
                showAlert('Veuillez remplir tous les champs obligatoires.', 'danger');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Les mots de passe ne correspondent pas.', 'danger');
                return;
            }
            
            if (password.length < 4) {
                showAlert('Le mot de passe doit contenir au moins 4 caractères.', 'danger');
                return;
            }
            
            // Afficher le chargement
            showAlert('Inscription en cours...', 'info');
            
            // Désactiver le bouton
            const submitBtn = document.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Inscription...';
            }
            
            // Appel à l'API
            fetch(API_BASE_URL + '/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    fullname: fullname,
                    email: email,
                    password: password,
                    phone: phone || null,
                    date_of_birth: dateOfBirth || null,
                    gender: gender || null,
                    role: role
                })
            })
            .then(response => {
                console.log('Status HTTP:', response.status);
                
                if (!response.ok) {
                    if (response.status === 405) {
                        throw new Error('Méthode non autorisée.');
                    }
                    if (response.status === 404) {
                        throw new Error('API introuvable: ' + API_BASE_URL + '/register.php');
                    }
                    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response.json();
            })
            .then(data => {
                console.log('Réponse du serveur:', data);
                
                if (data.success) {
                    showAlert('✅ Inscription réussie ! Redirection vers la page de connexion...', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'connexion.html';
                    }, 1500);
                    
                } else {
                    showAlert('❌ ' + data.message, 'danger');
                    
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "S'inscrire";
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showAlert('❌ ' + error.message, 'danger');
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "S'inscrire";
                }
            });
        });
    }
    
    // ================ GESTION DE LA DÉCONNEXION ================
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Supprimer les données de session
            localStorage.removeItem('user');
            localStorage.removeItem('session');
            sessionStorage.clear();
            
            // Rediriger vers la page de connexion
            window.location.href = 'connexion.html';
        });
    }
    
    // ================ VÉRIFICATION DE LA SESSION ================
    // Vérifier si l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user'));
    const currentPage = window.location.pathname;
    
    // Si l'utilisateur est connecté et qu'il est sur la page de connexion/inscription
    if (user && (currentPage.includes('connexion.html') || currentPage.includes('inscription.html'))) {
        // Rediriger vers le dashboard approprié
        const role = user.role;
        switch(role) {
            case 'admin':
                window.location.href = '../pages/admin/dashboard-admin.html';
                break;
            case 'doctor':
            case 'nurse':
                window.location.href = '../pages/professionnel/dashboard-professionnel.html';
                break;
            default:
                window.location.href = '../pages/dashboard-patient.html';
                break;
        }
    }
    
    // Si l'utilisateur n'est pas connecté et qu'il est sur une page protégée
    const protectedPages = ['dashboard-patient.html', 'dashboard-admin.html', 'dashboard-professionnel.html'];
    if (!user && protectedPages.some(page => currentPage.includes(page))) {
        window.location.href = 'connexion.html';
    }
});

// ================ FONCTION D'AFFICHAGE DES ALERTES ================
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertClasses = {
        'info': 'alert-info',
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning'
    };
    
    alertContainer.innerHTML = `
        <div class="alert ${alertClasses[type] || 'alert-info'} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Scroll vers le haut pour voir l'alerte
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ================ FONCTIONS UTILITAIRES ================
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function getApiUrl(endpoint) {
    return API_BASE_URL + '/' + endpoint;
}

// Exposer les fonctions globalement
window.showAlert = showAlert;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.getApiUrl = getApiUrl;
window.API_BASE_URL = API_BASE_URL;