// frontend/src/AddTagForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Pour les liens de navigation

function AddTagForm() {
  const [tagName, setTagName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!tagName.trim()) {
      setMessage('Le nom du tag ne peut pas être vide.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Appel API POST vers /api/tags
      const response = await fetch('http://localhost:3001/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName }), // Envoyer le nom du tag
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Erreur HTTP ${response.status}`);
      }

      setMessage(`Tag "${responseData.name}" ajouté avec succès !`);
      setTagName(''); // Vide le champ

      // Efface le message de succès après 3s
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error("Erreur lors de l'ajout du tag:", err);
      setMessage(`Erreur : ${err.message}`);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div>
       <p>
         <Link to="/tags">← Voir la liste des Tags</Link> {/* Lien vers la future liste */}
         {' | '}
         <Link to="/">Retour à la liste principale</Link>
       </p>
      <h2>Ajouter un Nouveau Tag</h2>
      {message && <p className={message.startsWith('Erreur') ? 'error-message' : 'success-message'}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tagName">Nom du tag :</label>
          <input
            type="text"
            id="tagName"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter le Tag'}
        </button>
      </form>

      {/* Styles (identiques à AddBrandForm) */}
       <style>{`
        .error-message { color: red; }
        .success-message { color: green; }
        label { margin-right: 10px; }
        input { margin-bottom: 10px; }
        button:disabled { opacity: 0.6; }
        p a { margin-bottom: 15px; display: inline-block; }
      `}</style>
    </div>
  );
}

export default AddTagForm;