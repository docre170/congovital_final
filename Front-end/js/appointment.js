// Gestion du formulaire de rendez-vous multi-étapes
const API_BASE_URL_APPOINTMENT = `${window.location.origin}/backend/api`;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.appointment-form');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (!form || !nextBtn || !prevBtn || !submitBtn) {
        return;
    }

    const fieldsets = form.querySelectorAll('fieldset');
    let currentStep = 0;

    showStep(currentStep);

    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();

        if (validateStep(currentStep)) {
            if (currentStep < fieldsets.length - 1) {
                currentStep++;
                showStep(currentStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    function showStep(n) {
        fieldsets.forEach((fieldset, index) => {
            fieldset.classList.toggle('active', index === n);
        });

        if (n === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }

        if (n === fieldsets.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    function fieldValueTrimmed(el) {
        if (!el) {
            return '';
        }
        const v = el.value;
        return typeof v === 'string' ? v.trim() : '';
    }

    function validateStep(n) {
        const inputs = fieldsets[n].querySelectorAll(
            'input[required]:not([type="radio"]):not([type="checkbox"]), select[required], textarea[required], input[type="checkbox"][required]'
        );
        let isValid = true;

        inputs.forEach(input => {
            const val = input.type === 'checkbox' ? (input.checked ? '1' : '') : fieldValueTrimmed(input);
            if (!val) {
                input.style.borderColor = '#d32f2f';
                isValid = false;
            } else {
                input.style.borderColor = '#ddd';
            }
        });

        const radioWithRequired = fieldsets[n].querySelector('input[type="radio"][required]');
        if (radioWithRequired && radioWithRequired.name) {
            const groupName = radioWithRequired.name;
            const radiosInStep = fieldsets[n].querySelectorAll('input[type="radio"]');
            const groupRadios = Array.prototype.filter.call(radiosInStep, function(r) {
                return r.name === groupName;
            });
            const anyRadioChecked = groupRadios.some(function(r) {
                return r.checked;
            });
            if (!anyRadioChecked) {
                isValid = false;
            }
        }

        if (!isValid) {
            alert('Veuillez remplir tous les champs obligatoires.');
        }

        return isValid;
    }

    async function parseJsonSafe(response) {
        const text = await response.text();
        if (!text) {
            return {};
        }
        try {
            return JSON.parse(text);
        } catch {
            return { message: 'Réponse du serveur illisible.' };
        }
    }

    let submitting = false;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateStep(currentStep) || submitting) {
            return;
        }

        const consultationTypeEl = form.querySelector('input[name="consultation-type"]:checked');
        const doctorEl = document.getElementById('doctor');
        const doctorVal =
            doctorEl && fieldValueTrimmed(doctorEl) ? doctorEl.value.trim() : null;

        const userIdRaw = localStorage.getItem('user_id');
        const userIdParsed = userIdRaw ? parseInt(userIdRaw, 10) : NaN;

        const payload = {
            user_id: Number.isFinite(userIdParsed) ? userIdParsed : null,
            first_name: fieldValueTrimmed(document.getElementById('first-name')),
            last_name: fieldValueTrimmed(document.getElementById('last-name')),
            email: fieldValueTrimmed(document.getElementById('email')),
            phone: fieldValueTrimmed(document.getElementById('phone')),
            date_of_birth: fieldValueTrimmed(document.getElementById('date-of-birth')) || null,
            service: fieldValueTrimmed(document.getElementById('service')),
            doctor: doctorVal,
            reason: fieldValueTrimmed(document.getElementById('reason')),
            appointment_date: fieldValueTrimmed(document.getElementById('appointment-date')),
            appointment_time: fieldValueTrimmed(document.getElementById('appointment-time')),
            consultation_type: consultationTypeEl ? consultationTypeEl.value : null,
        };

        submitting = true;
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL_APPOINTMENT}/book_appointment.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await parseJsonSafe(response);

            if (response.ok) {
                alert(result.message || 'Votre rendez-vous a été enregistré. Vous recevrez une confirmation par email.');
                form.reset();
                currentStep = 0;
                showStep(currentStep);
            } else {
                const hint = result.suggestion || result.details;
                const msg = result.message || 'Impossible d’enregistrer le rendez-vous.';
                alert(hint ? msg + ' — ' + hint : msg);
            }
        } catch (err) {
            console.error(err);
            alert(
                `Erreur réseau : ${err.message}. Vérifiez que le serveur PHP est actif depuis la racine du projet (ex. php -S localhost:8000).`
            );
        } finally {
            submitting = false;
            submitBtn.disabled = false;
        }
    });
});
