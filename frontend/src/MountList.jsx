// frontend/src/MountList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MountList() {
  const [mounts, setMounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Appel API GET vers /api/mounts
        const response = await fetch('http://localhost:3001/api/mounts');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || 'Impossible de récupérer les montures'}`);
        }
        const data = await response.json();
        setMounts(data); // Met à jour l'état avec les montures
      } catch (err) {
        console.error("Erreur fetch mounts:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMounts();
  }, []);

  if (isLoading) return <p>Chargement des montures...</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur : {error}</p>;

  return (
    <div>
      <h2>Liste des Montures</h2>
      <p>
        <Link to="/">← Retour à la liste principale</Link>
        {' | '}
        <Link to="/add-mount">Ajouter une Monture</Link>
      </p>

      {mounts.length > 0 ? (
        <ul>
          {mounts.map((mount) => (
            <li key={mount.id}>
              <strong>{mount.name}</strong>
              {mount.type && ` (${mount.type})`}
              {mount.description && <p style={{margin: '5px 0 0 15px'}}><small>{mount.description}</small></p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune monture trouvée dans la base de données.</p>
      )}
       <hr />
       <p><Link to="/">← Retour à la liste principale</Link></p>
    </div>
  );
}

export default MountList;