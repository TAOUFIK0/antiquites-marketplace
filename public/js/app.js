// Utilities pour l'interface utilisateur
class AntiquitesUI {
    static init() {
        this.setupAnimations();
        this.setupFormValidation();
        this.setupImagePreview();
        this.setupToasts();
    }

    // Animations d'apparition des éléments
    static setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observer les cartes d'annonces
        document.querySelectorAll('.announcement-card, .form-container, .admin-dashboard').forEach(el => {
            observer.observe(el);
        });
    }

    // Validation des formulaires
    static setupFormValidation() {
        // Validation du formulaire d'inscription
        const registerForm = document.querySelector('form[action="/register"]');
        if (registerForm) {
            const passwordField = registerForm.querySelector('#password');
            const confirmPasswordField = registerForm.querySelector('#confirmPassword');
            
            if (confirmPasswordField) {
                confirmPasswordField.addEventListener('input', function() {
                    const password = passwordField.value;
                    const confirmPassword = this.value;
                    
                    if (password !== confirmPassword) {
                        this.setCustomValidity('Les mots de passe ne correspondent pas');
                        this.classList.add('is-invalid');
                    } else {
                        this.setCustomValidity('');
                        this.classList.remove('is-invalid');
                    }
                });
            }
        }

        // Validation des prix dans le formulaire admin
        document.querySelectorAll('input[name="price"]').forEach(input => {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (value < 0) {
                    this.setCustomValidity('Le prix doit être positif');
                } else if (value > 999999) {
                    this.setCustomValidity('Le prix est trop élevé');
                } else {
                    this.setCustomValidity('');
                }
            });
        });
    }

    // Prévisualisation des images
    static setupImagePreview() {
        const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
        
        imageInputs.forEach(input => {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        let preview = document.getElementById('imagePreview');
                        if (!preview) {
                            preview = document.createElement('div');
                            preview.id = 'imagePreview';
                            preview.style.marginTop = '1rem';
                            input.parentNode.appendChild(preview);
                        }
                        
                        preview.innerHTML = `
                            <p style="margin-bottom: 0.5rem; font-weight: bold; color: #8b4513;">Aperçu :</p>
                            <img src="${e.target.result}" 
                                 style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"
                                 alt="Aperçu de l'image">
                        `;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // Système de notifications toast
    static setupToasts() {
        // Fonction pour afficher un toast
        window.showToast = function(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Supprimer le toast après 4 secondes
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 4000);
        };

        // Animation de sortie pour les toasts
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOut {
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Confirmation pour les actions importantes
    static confirmAction(message = 'Êtes-vous sûr ?') {
        return confirm(message);
    }

    // Fonction pour formater les prix
    static formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    // Fonction pour formater les dates
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    AntiquitesUI.init();
    
    // Compteur de caractères pour les descriptions
    const descriptionField = document.getElementById('description');
    if (descriptionField) {
        const charCountElement = document.getElementById('charCount');
        if (charCountElement) {
            descriptionField.addEventListener('input', function() {
                const count = this.value.length;
                charCountElement.textContent = count;
                
                if (count > 900) {
                    charCountElement.style.color = '#dc3545';
                } else if (count > 800) {
                    charCountElement.style.color = '#ffc107';
                } else {
                    charCountElement.style.color = '#888';
                }
            });
        }
    }

    // Effet de hover sur les cartes d'annonces
    document.querySelectorAll('.announcement-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });

    // Animation des boutons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Effet de ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Style pour l'effet ripple
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
});

// Fonctions utilitaires globales
window.AntiquitesUtils = {
    formatPrice: AntiquitesUI.formatPrice,
    formatDate: AntiquitesUI.formatDate,
    confirmAction: AntiquitesUI.confirmAction
};
