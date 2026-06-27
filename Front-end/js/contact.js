// Gestion du formulaire de contact
const API_BASE_URL_CONTACT = `${window.location.origin}/backend/api`;

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function handleContactSubmit(e) {
    e.preventDefault();

    // Récupérer les données du formulaire
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validation côté client
    const validation = validateContact(name, email, subject, message);
    if (!validation.valid) {
        showAlert('error', validation.message);
        return;
    }

    // Préparer les données
    const data = {
        name: name,
        email: email,
        phone: phone || null,
        subject: subject,
        message: message
    };

    try {
        const response = await fetch(`${API_BASE_URL_CONTACT}/send_message.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await parseJsonResponse(response);

        if (response.ok) {
            showAlert('success', result.message || 'Votre message a été envoyé avec succès !');
            // Réinitialiser le formulaire
            document.querySelector('.contact-form').reset();
            // Redirection optionnelle après 3 secondes
            setTimeout(() => {
                // Vous pouvez rediriger vers une page de confirmation si souhaité
                // window.location.href = './index.html';
            }, 3000);
        } else {
            showAlert('error', result.message || 'Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur d\'envoi:', error);
        showAlert('error', `Erreur de connexion au serveur: ${error.message}. Veuillez vérifier que le serveur est actif (php -S localhost:8000)`);
    }
}

// Fonction de validation du formulaire de contact
function validateContact(name, email, subject, message) {
    // Vérifier les champs obligatoires
    if (!name || !email || !subject || !message) {
        return { valid: false, message: 'Tous les champs obligatoires doivent être remplis' };
    }

    // Vérifier la longueur du nom
    if (name.length < 3) {
        return { valid: false, message: 'Le nom doit contenir au moins 3 caractères' };
    }

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Veuillez entrer une adresse email valide' };
    }

    // Vérifier la longueur du message
    if (message.length < 10) {
        return { valid: false, message: 'Le message doit contenir au moins 10 caractères' };
    }


    return { valid: true };
}

// Fonction pour afficher les alertes
function showAlert(type, message) {
    // Créer une div alerte Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Insérer l'alerte dans le conteneur d'alertes
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertDiv);
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Si pas de conteneur, insérer au début du formulaire
        const form = document.querySelector('.contact-form');
        if (form) {
            form.insertAdjacentElement('beforebegin', alertDiv);
        }
    }

    // Retirer l'alerte après 5 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Fonction pour parser les réponses JSON en toute sécurité
async function parseJsonResponse(response) {
    const text = await response.text();
    if (!text) {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch {
        return { message: 'Réponse du serveur illisible (pas du JSON).' };
    }
}
