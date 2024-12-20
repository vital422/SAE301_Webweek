let offset = 0; // initialiser l'offset
const limit = 10; // nombre d'utilisateurs par page

// fonction pour vider la table d'utilisateurs
function viderTableUtilisateurs() {
   document.getElementById('users-container').innerHTML = "";
}

// fonction pour vider la pagination
function viderPagination() {
   document.getElementById('paginationLiens').innerHTML = "";
}

// fonction pour charger les utilisateurs depuis l'API
function chargerUtilisateurs(page = 1, recherche = '') {
   const xhttp = new XMLHttpRequest();
   const limit = 10; 
   const offset = (page - 1) * limit; 

   // construire l'URL avec les paramètres de recherche et de pagination
   const url = `../API/listerEvents.php?limit=${limit}&offset=${offset}&q=${encodeURIComponent(recherche)}`;

   xhttp.open("GET", url, true);
   xhttp.onreadystatechange = function () {
       if (this.readyState === 4 && this.status === 200) {
           try {
               const response = JSON.parse(this.responseText);

               if (response.status === "OK" && response.users && response.users.length > 0) {
                  // vider les utilisateurs et mettre à jour la table
                  viderTableUtilisateurs();
                  const template = document.getElementById("template-users").innerHTML;
                  const rendered = Mustache.render(template, { users: response.users });
                  document.getElementById("users-container").innerHTML = rendered;

                  afficherPagination(response.totalPages, page);
               } else {
                  viderTableUtilisateurs();
                  viderPagination();
                  document.getElementById("users-container").innerHTML = "<tr><td colspan='7' class='text-center'>Aucune réservation correspondante</td></tr>";
               }
           } catch (e) {
               console.error("Erreur lors du traitement des données JSON :", e);
           }
       }
   };
   xhttp.send();
}


// fonction pour afficher les liens de pagination
function afficherPagination(totalPages, pageActuelle) {
   const paginationLiens = document.getElementById('paginationLiens');
   paginationLiens.innerHTML = '';

   // créer les liens de pagination
   for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.classList.add('page-item');

      const a = document.createElement('a');
      a.classList.add('page-link');
      a.href = '#';
      a.textContent = i;

      if (i === pageActuelle) {
         li.classList.add('actives');
      }

      // ajouter l'événement pour charger la page correspondante
      a.addEventListener('click', function (event) {
         event.preventDefault();
         chargerUtilisateurs(i); // charger les utilisateurs pour la page i
      });

      li.appendChild(a);
      paginationLiens.appendChild(li);
   }
}

function afficherMessage(message, type) {
   const messageDiv = document.getElementById('message');
   messageDiv.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
   setTimeout(() => {
      messageDiv.innerHTML = ''; 
   }, 5000);
}


function supprimerEvent(event) {
   const target = event.target.closest('.supprimer-user'); 
   if (!target) return;

   const idEvent = target.getAttribute('data-id'); 
   if (!idEvent) {
      afficherMessage("ID de l'événement non valide.", "danger");
      return;
   }

   const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cet événement ?");
   if (!confirmation) return;

   // requête AJAX pour supprimer
   const formData = new FormData();
   formData.append('action', 'supprimer');
   formData.append('id_events', idEvent);

   fetch('../API/listerEvents.php', {
      method: 'POST',
      body: formData
   })
   .then(response => response.json())
   .then(data => {
      if (data.status === 'success') {
         afficherMessage(data.message, "success");
         chargerUtilisateurs(1); 
      } else {
         afficherMessage(data.message, "danger");
      }
   })
   .catch(error => {
      console.error("Erreur lors de la suppression :", error);
      afficherMessage("Une erreur est survenue lors de la suppression.", "danger");
   });
}





function init() {
   const rechercheInput = document.getElementById('recherche-input');

   // Charger les utilisateurs dès le départ
   chargerUtilisateurs(1);

   // ajouter un événement pour la recherche
   if (rechercheInput) {
      rechercheInput.addEventListener('input', function () {
         chargerUtilisateurs(1, this.value); 
      });
   }

   // ajouter l'écouteur pour la suppression d'événements
   document.addEventListener('click', supprimerEvent);
}

window.addEventListener("load", init);
