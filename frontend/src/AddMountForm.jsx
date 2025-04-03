// frontend/src/AddMountForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AddMountForm() {
  // États pour chaque champ du formulaire
  const [mountName, setMountName] = useState('');
  const [mountType, setMountType] = useState(''); // ex: Baïonnette, Vissant
  const [mountDescription, setMountDescription] = useState('');
  // États pour messages et soumission
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!mountName.trim()) {
      setMessage('Le nom de la monture ne peut pas être vide.');
      setIsSubmitting(false);
      return;
    }

    // Préparer les données à envoyer (inclure les champs optionnels s'ils sont remplis)
    const mountData = {
      name: mountName,
      ...(mountType.trim() && { type: mountType }), // Ajoute 'type' seulement s'il n'est pas vide
      ...(mountDescription.trim() && { description: mountDescription }), // Ajoute 'description' si pas vide
    };

    try {
      // Appel API POST vers /api/mounts
      const response = await fetch('http://localhost:3001/api/mounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mountData), // Envoyer l'objet complet
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Erreur HTTP ${response.status}`);
      }

      setMessage(`Monture "${responseData.name}" ajoutée avec succès !`);
      // Vider tous les champs
      setMountName('');
      setMountType('');
      setMountDescription('');

      // Efface le message de succès après 3s
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error("Erreur lors de l'ajout de la monture:", err);
      setMessage(`Erreur : ${err.message}`);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div>
       <p>
         <Link to="/mounts">← Voir la liste des Montures</Link>
         {' | '}
         <Link to="/">Retour à la liste principale</Link>
       </p>
      <h2>Ajouter une Nouvelle Monture</h2>
      {message && <p className={message.startsWith('Erreur') ? 'error-message' : 'success-message'}>{message}</p>}

      {/* Note: style simple pour séparer les champs */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <div>
          <label htmlFor="mountName" style={{ marginRight: '10px' }}>Nom (requis):</label>
          <input
            type="text"
            id="mountName"
            value={mountName}
            onChange={(e) => setMountName(e.target.value)}
            disabled={isSubmitting}
            autoFocus
            required // Ajout validation navigateur simple
          />
        </div>
         <div>
          <label htmlFor="mountType" style={{ marginRight: '10px' }}>Type (optionnel):</label>
          <input
            type="text"
            id="mountType"
            value={mountType}
            placeholder="ex: Baïonnette, Vissant"
            onChange={(e) => setMountType(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
         <div>
          <label htmlFor="mountDescription" style={{ marginRight: '10px' }}>Description (optionnel):</label>
          <textarea
            id="mountDescription"
            value={mountDescription}
            rows="3"
            onChange={(e) => setMountDescription(e.target.value)}
            disabled={isSubmitting}
            style={{ width: '100%'}} // S'assurer que textarea prend la largeur
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-start'}}>
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter la Monture'}
        </button>
      </form>

       {/* Styles */}
       <style>{`
        .error-message { color: red; }
        .success-message { color: green; }
        /* label { margin-right: 10px; } */
        /* input, textarea { margin-bottom: 10px; } */
        button:disabled { opacity: 0.6; }
        p a { margin-bottom: 15px; display: inline-block; }
      `}</style>
    </div>
  );
}

export default AddMountForm;