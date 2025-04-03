// frontend/src/BrandList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Pour le lien de retour

function BrandList() {
  // États pour la liste, le chargement, les erreurs
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effet pour charger les marques au montage
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3001/api/brands');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || 'Impossible de récupérer les marques'}`);
        }
        const data = await response.json();
        setBrands(data); // Met à jour l'état avec les marques reçues
      } catch (err) {
        console.error("Erreur fetch brands:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []); // Exécuté une seule fois

  // Rendu conditionnel
  if (isLoading) return <p>Chargement des marques...</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur : {error}</p>;

  // Rendu de la liste
  return (
    <div>
      <h2>Liste des Marques</h2>
      <p>
        <Link to="/">← Retour à la liste principale</Link>
        {' | '}
        <Link to="/add-brand">Ajouter une Marque</Link> {/* Lien pratique */}
      </p>

      {brands.length > 0 ? (
        <ul>
          {brands.map((brand) => (
            <li key={brand.id}>
              {brand.name}
              {/* On pourrait ajouter un lien vers une future page de détail de la marque ici */}
              {/* Exemple: <Link to={`/brand/${brand.id}`}>{brand.name}</Link> */}
               {brand.countryOfOrigin && <small> ({brand.countryOfOrigin})</small>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune marque trouvée dans la base de données.</p>
      )}
       <hr />
       <p><Link to="/">← Retour à la liste principale</Link></p>
    </div>
  );
}

export default BrandList;