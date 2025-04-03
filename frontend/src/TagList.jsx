// frontend/src/TagList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TagList() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Appel API GET vers /api/tags
        const response = await fetch('http://localhost:3001/api/tags');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || 'Impossible de récupérer les tags'}`);
        }
        const data = await response.json();
        setTags(data); // Met à jour l'état avec les tags
      } catch (err) {
        console.error("Erreur fetch tags:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (isLoading) return <p>Chargement des tags...</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur : {error}</p>;

  return (
    <div>
      <h2>Liste des Tags</h2>
      <p>
        <Link to="/">← Retour à la liste principale</Link>
        {' | '}
        <Link to="/add-tag">Ajouter un Tag</Link> {/* Lien pratique */}
      </p>

      {tags.length > 0 ? (
        <ul>
          {tags.map((tag) => (
            <li key={tag.id}>
              {tag.name}
              {/* On pourrait ajouter un lien pour voir tous les équipements avec ce tag */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun tag trouvé dans la base de données.</p>
      )}
       <hr />
       <p><Link to="/">← Retour à la liste principale</Link></p>
    </div>
  );
}

export default TagList;