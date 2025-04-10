document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Désactiver tous les onglets et formulaires
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        
        // Activer l'onglet cliqué et le formulaire correspondant
        tab.classList.add('active');
        const targetForm = document.getElementById(tab.getAttribute('data-tab') + 'Form');
        if (targetForm) targetForm.classList.add('active');
      });
    });
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorElement = document.getElementById('loginError');
        
        // Réinitialiser le message d'erreur
        errorElement.textContent = '';
        
        // Vérifier si les champs sont remplis
        if (!username || !password) {
          errorElement.textContent = 'Veuillez remplir tous les champs.';
          return;
        }
        
        // Simuler une vérification d'identifiants (en production, cela serait fait côté serveur)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username);
        
        if (!user || !verifyPassword(password, user.password)) {
          errorElement.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
          return;
        }
        
        // Stocker les informations de session (en production, utiliser des cookies sécurisés ou JWT)
        sessionStorage.setItem('currentUser', JSON.stringify({
          username: user.username,
          email: user.email,
          id: user.id
        }));
        
        // Rediriger vers la page principale
        window.location.href = 'index.html';
      });
    }
    
    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const termsAccepted = document.getElementById('termsAccept').checked;
        const errorElement = document.getElementById('registerError');
        
        // Réinitialiser le message d'erreur
        errorElement.textContent = '';
        
        // Vérifier si les champs sont remplis
        if (!username || !email || !password || !passwordConfirm) {
          errorElement.textContent = 'Veuillez remplir tous les champs.';
          return;
        }
        
        // Vérifier si les mots de passe correspondent
        if (password !== passwordConfirm) {
          errorElement.textContent = 'Les mots de passe ne correspondent pas.';
          return;
        }
        
        // Vérifier la complexité du mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          errorElement.textContent = 'Le mot de passe ne respecte pas les critères de sécurité.';
          return;
        }
        
        // Vérifier l'acceptation des CGU
        if (!termsAccepted) {
          errorElement.textContent = 'Vous devez accepter les conditions générales d\'utilisation.';
          return;
        }
        
        // Vérifier si l'utilisateur existe déjà
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.username === username)) {
          errorElement.textContent = 'Ce nom d\'utilisateur est déjà utilisé.';
          return;
        }
        if (users.some(u => u.email === email)) {
          errorElement.textContent = 'Cette adresse email est déjà utilisée.';
          return;
        }
        
        // Créer le nouvel utilisateur avec un mot de passe hashé (simulation)
        const newUser = {
          id: Date.now().toString(),
          username: username,
          email: email,
          password: hashPassword(password), // En production, utilisez bcrypt ou Argon2
          createdAt: new Date().toISOString()
        };
        
        // Ajouter l'utilisateur à la liste
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Afficher un message de succès et rediriger vers la connexion
        alert('Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');
        
        // Passer à l'onglet de connexion
        document.querySelector('[data-tab="login"]').click();
      });
    }
    
    // Fonction pour simuler le hachage de mot de passe (NE PAS UTILISER EN PRODUCTION)
    // En production, utilisez bcrypt ou Argon2 côté serveur
    function hashPassword(password) {
      // Ceci est une simulation, PAS pour production
      return btoa(password) + '_hashed';
    }
    
    // Fonction pour vérifier le mot de passe (NE PAS UTILISER EN PRODUCTION)
    function verifyPassword(password, hashedPassword) {
      // Ceci est une simulation, PAS pour production
      return btoa(password) + '_hashed' === hashedPassword;
    }
});