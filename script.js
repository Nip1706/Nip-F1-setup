document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si l'utilisateur est connecté
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  const userInfoElement = document.getElementById('userInfo');
  const guestMessageElement = document.getElementById('guestMessage');

  if (currentUser) {
    // Afficher les informations de l'utilisateur connecté
    userInfoElement.innerHTML = `
      <span class="user-name">Bonjour, ${currentUser.username}</span>
      <button id="logoutBtn" class="logout-btn">Déconnexion</button>
    `;

    // Cacher le message invitant à se connecter
    if (guestMessageElement) {
      guestMessageElement.style.display = 'none';
    }

    // Ajouter l'événement de déconnexion
    document.getElementById('logoutBtn').addEventListener('click', function() {
      sessionStorage.removeItem('currentUser');
      window.location.reload();
    });
  } else {
    // Si l'utilisateur n'est pas connecté, vider l'élément userInfo
    userInfoElement.innerHTML = '';
  }

  // Charger les données JSON
  fetch('setup.json')
    .then(response => response.json())
    .then(data => {
      const setupData = data;
      initializeApp(setupData);
    })
    .catch(error => {
      console.error('Erreur de chargement des données:', error);
      document.getElementById('setupContainer').innerHTML =
        '<div class="no-selection">Erreur de chargement des données</div>';
    });
});

function initializeApp(setupData) {
  // Éléments du DOM
  const trackSelect = document.getElementById('trackSelect');
  const setupContainer = document.getElementById('setupContainer');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const circuitListDiv = document.getElementById('circuitList'); // Récupérer la div de la sidebar
  let currentMode = 'course';
  let currentTrackId = '';

  // Vérifier si l'utilisateur est connecté
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  // Charger les réglages personnalisés de l'utilisateur si il est connecté
  let userSetups = {};
  if (currentUser) {
    const storedUserSetups = localStorage.getItem(`userSetups_${currentUser.id}`);
    if (storedUserSetups) {
      userSetups = JSON.parse(storedUserSetups);
    }
  }

  // Remplir le sélecteur de circuits et la sidebar
  trackSelect.innerHTML = '<option value="">Sélectionner un circuit</option>'; // Réinitialiser le select
  circuitListDiv.innerHTML = ''; // Réinitialiser la sidebar

  Object.keys(setupData).forEach(id => {
    const trackData = setupData[id];
    const trackName = trackData.circuit;
    const country = trackData.country;
    const countryCode = trackData.countryCode ? trackData.countryCode.toLowerCase() : country.toLowerCase().replace(' ', '-');
    const flagFileName = trackData.flagFileName;

    // Créer l'option pour le menu déroulant
    const option = document.createElement('option');
    option.value = id;
    const optionContent = document.createElement('div');
    optionContent.style.display = 'flex';
    optionContent.style.alignItems = 'center';
    optionContent.style.gap = '5px';
    const flagImageSelect = document.createElement('img');
    flagImageSelect.src = flagFileName;
    flagImageSelect.alt = country;
    flagImageSelect.style.width = '20px';
    flagImageSelect.style.height = 'auto';
    const trackTextSelect = document.createTextNode(trackName);
    optionContent.appendChild(flagImageSelect);
    optionContent.appendChild(trackTextSelect);
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(optionContent);
    option.innerHTML = tempDiv.innerHTML;
    trackSelect.appendChild(option);

    // Créer l'élément pour la sidebar
    const circuitItem = document.createElement('div');
    circuitItem.className = 'sidebar-item';
    circuitItem.dataset.trackId = id;
    circuitItem.addEventListener('click', () => {
      currentTrackId = id;
      renderSetup();
      // Mettre à jour la sélection dans le menu déroulant
      trackSelect.value = id;
      // Ajouter une classe pour indiquer la sélection active (facultatif pour le style)
      document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
      circuitItem.classList.add('active');
    });

    const flagImageSidebar = document.createElement('img');
    flagImageSidebar.src = flagFileName;
    flagImageSidebar.alt = country;
    flagImageSidebar.style.width = '24px';
    flagImageSidebar.style.height = 'auto';
    const trackTextSidebar = document.createTextNode(country);
    circuitItem.appendChild(flagImageSidebar);
    circuitItem.appendChild(trackTextSidebar);
    circuitListDiv.appendChild(circuitItem);

    // Sélectionner le premier circuit par défaut
    if (!currentTrackId && Object.keys(setupData).length > 0) {
      currentTrackId = Object.keys(setupData)[0];
      renderSetup();
      trackSelect.value = currentTrackId;
      const firstSidebarItem = circuitListDiv.firstChild;
      if (firstSidebarItem) {
        firstSidebarItem.classList.add('active');
      }
    }
  });

  // Gérer les changements de mode
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      renderSetup();
    });
  });

  // Gérer les changements de circuit dans le menu déroulant
  trackSelect.addEventListener('change', () => {
    currentTrackId = trackSelect.value;
    renderSetup();
    // Mettre à jour la sélection dans la sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.trackId === currentTrackId) {
        item.classList.add('active');
      }
    });
  });

  // Fonction pour afficher les réglages
  function renderSetup() {
    setupContainer.innerHTML = '';

    if (!currentTrackId) {
      setupContainer.innerHTML = '<div class="no-selection">Sélectionnez un circuit pour voir les réglages</div>';
      return;
    }

    // Vérifier si nous avons des réglages pour ce circuit et ce mode
    if (setupData[currentTrackId] && setupData[currentTrackId].settings[currentMode]) {
      // Déterminer quels réglages afficher (par défaut ou personnalisés)
      let settings;

      if (currentUser && userSetups[currentTrackId] && userSetups[currentTrackId].settings[currentMode]) {
        // Utiliser les réglages personnalisés de l'utilisateur
        settings = userSetups[currentTrackId].settings[currentMode];
      } else {
        // Utiliser les réglages par défaut
        settings = setupData[currentTrackId].settings[currentMode];
      }

      Object.keys(settings).forEach(categoryKey => {
        const category = settings[categoryKey];

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'setup-category';

        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = categoryKey;
        categoryHeader.addEventListener('click', () => {
          categoryHeader.classList.toggle('active');
          itemsContainer.classList.toggle('active');
        });

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'setup-items';

        if (typeof category === 'object' && category !== null) {
          Object.keys(category).forEach(key => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'setup-item';
            itemDiv.dataset.category = categoryKey;
            itemDiv.dataset.setting = key;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'setup-name';
            nameSpan.textContent = key;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'setup-value';
            valueSpan.textContent = category[key];

            itemDiv.appendChild(nameSpan);
            itemDiv.appendChild(valueSpan);

            // Ajouter le bouton d'édition si l'utilisateur est connecté
            if (currentUser) {
              const editControls = document.createElement('div');
              editControls.className = 'edit-controls';

              const input = document.createElement('input');
              input.type = 'text';
              input.className = 'value-input';
              input.value = category[key];

              const saveButton = document.createElement('button');
              saveButton.className = 'save-btn';
              saveButton.textContent = '✓';
              saveButton.addEventListener('click', (e) => {
                e.stopPropagation();
                saveSettingChange(categoryKey, key, input.value);
                itemDiv.classList.remove('edit-mode');
                valueSpan.textContent = input.value;
              });

              const cancelButton = document.createElement('button');
              cancelButton.className = 'cancel-btn';
              cancelButton.textContent = '✗';
              cancelButton.addEventListener('click', (e) => {
                e.stopPropagation();
                itemDiv.classList.remove('edit-mode');
              });

              editControls.appendChild(input);
              editControls.appendChild(saveButton);
              editControls.appendChild(cancelButton);
              itemDiv.appendChild(editControls);

              const editButton = document.createElement('button');
              editButton.className = 'edit-btn';
              editButton.textContent = 'Modifier';
              editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                itemDiv.classList.add('edit-mode');
                input.focus();
              });

              itemDiv.appendChild(editButton);
            }

            itemsContainer.appendChild(itemDiv);
          });
        }

        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(itemsContainer);
        setupContainer.appendChild(categoryDiv);
      });

      // Ouvrir la première catégorie par défaut
      const firstCategory = setupContainer.querySelector('.category-header');
      const firstItems = setupContainer.querySelector('.setup-items');
      if (firstCategory && firstItems) {
        firstCategory.classList.add('active');
        firstItems.classList.add('active');
      }
    }
  }

  // Fonction pour sauvegarder les modifications de réglages
  function saveSettingChange(category, setting, value) {
    if (!currentUser) return;

    const bahrainTrackId = '1'; // Assurez-vous que c'est l'ID correct de Bahreïn

    if (currentTrackId === bahrainTrackId) {
      console.log('--- SAVE SETTING CHANGE BAHREIN ---');
      console.log('Track ID:', currentTrackId, 'Mode:', currentMode, 'Catégorie:', category, 'Réglage:', setting, 'Valeur:', value);
      console.log('User Setups avant sauvegarde:', userSetups);
    }

    // Initialiser la structure des réglages utilisateur si nécessaire
    if (!userSetups[currentTrackId]) {
      userSetups[currentTrackId] = {
        circuit: setupData[currentTrackId].circuit,
        settings: {
          course: JSON.parse(JSON.stringify(setupData[currentTrackId].settings.course)),
          qualification: JSON.parse(JSON.stringify(setupData[currentTrackId].settings.qualification))
        }
      };
    }

    // Initialiser la structure pour le mode actuel si nécessaire
    if (!userSetups[currentTrackId].settings[currentMode]) {
      userSetups[currentTrackId].settings[currentMode] = JSON.parse(JSON.stringify(setupData[currentTrackId].settings[currentMode]));
    }

    // Initialiser la structure pour la catégorie si nécessaire
    if (!userSetups[currentTrackId].settings[currentMode][category]) {
      userSetups[currentTrackId].settings[currentMode][category] = {};
    }

    // Mettre à jour la valeur
    userSetups[currentTrackId].settings[currentMode][category][setting] = parseFloat(value) || value;

    // Sauvegarder dans le localStorage
    localStorage.setItem(`userSetups_${currentUser.id}`, JSON.stringify(userSetups));

    // Afficher un message de confirmation
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Réglage sauvegardé';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 2000);
    }, 100);
    }
}