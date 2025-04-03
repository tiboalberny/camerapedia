// frontend/src/AddBrandForm.jsx
import React, { useState } from 'react';
// Importe Link pour le lien de retour
import { Link } from 'react-router-dom';


function AddBrandForm() {
  // État pour stocker le nom de la marque entré par l'utilisateur
  const [brandName, setBrandName] = useState('');
  // État pour gérer les messages d'erreur ou de succès
  const [message, setMessage] = useState('');
  // État pour savoir si on est en cours de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Gestionnaire pour la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page
    setMessage(''); // Réinitialise les messages
    setIsSubmitting(true); // Démarre la soumission

    // Vérification simple que le champ n'est pas vide
    if (!brandName.trim()) {
      setMessage('Le nom de la marque ne peut pas être vide.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Appel API POST vers le backend
      const response = await fetch('http://localhost:3001/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indique qu'on envoie du JSON
        },
        // Convertit l'objet JS en chaîne JSON pour le corps de la requête
        body: JSON.stringify({ name: brandName }),
      });

      // Analyser la réponse
      const responseData = await response.json();

      if (!response.ok) {
        // Si l'API renvoie une erreur (ex: 409 Conflict si marque existe déjà)
        // Utilise le message d'erreur de l'API s'il existe, sinon un message générique
        throw new Error(responseData.error || `Erreur HTTP ${response.status}`);
      }

      // Succès !
      setMessage(`Marque "${responseData.name}" ajoutée avec succès !`);
      setBrandName(''); // Vide le champ du formulaire


    } catch (err) {
        console.error("Erreur lors de l'ajout de la marque:", err);
        setMessage(`Erreur : ${err.message}`);
      } finally {
         setIsSubmitting(false);
         // On pourrait faire disparaître le message de succès après quelques secondes
         if (!message.startsWith('Erreur')) { // Ne pas effacer les messages d'erreur trop vite
             setTimeout(() => setMessage(''), 3000); // Efface le message de succès après 3s
         }
      }
  };

  return (
    <div>
       <p>
        <Link to="/">← Retour à la liste principale</Link>
      </p>
      <h2>Ajouter une Nouvelle Marque</h2>
      {/* Affiche les messages de succès ou d'erreur */}
      {message && <p className={message.startsWith('Erreur') ? 'error-message' : 'success-message'}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="brandName">Nom de la marque :</label>
          <input
            type="text"
            id="brandName"
            value={brandName}
            // Met à jour l'état 'brandName' à chaque changement dans l'input
            onChange={(e) => setBrandName(e.target.value)}
            // Désactive le champ pendant la soumission
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {/* Change le texte du bouton pendant la soumission */}
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter la Marque'}
        </button>
      </form>

      {/* Style simple pour les messages (à mettre dans App.css ou un fichier CSS dédié) */}
      <style>{`
        .error-message { color: red; }
        .success-message { color: green; }
        label { margin-right: 10px; }
        input { margin-bottom: 10px; }
        button:disabled { opacity: 0.6; }
      `}</style>
    </div>
  );
}

export default AddBrandForm;