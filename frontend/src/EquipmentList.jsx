// frontend/src/EquipmentList.jsx
import React, { useState, useEffect } from 'react'; // Importer les hooks nécessaires

function EquipmentList() {
  // États pour stocker les données, l'état de chargement et les erreurs
  const [equipment, setEquipment] = useState([]); // Contiendra la liste du matériel
  const [isLoading, setIsLoading] = useState(true); // Vrai pendant le chargement
  const [error, setError] = useState(null); // Stockera un message d'erreur

  // useEffect pour déclencher la récupération des données au montage du composant
  useEffect(() => {
    // Définir une fonction async à l'intérieur pour utiliser await
    const fetchEquipment = async () => {
      setIsLoading(true); // Commence le chargement
      setError(null); // Réinitialise les erreurs précédentes
      try {
        // Appel à notre API backend !
        const response = await fetch('http://localhost:3001/api/equipment'); // URL de l'API backend

        // Vérifier si la requête a réussi (statut HTTP 200-299)
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        // Extraire les données JSON de la réponse
        const data = await response.json();
        setEquipment(data); // Mettre à jour l'état avec les données reçues

      } catch (err) {
        // En cas d'erreur (réseau, serveur, parsing JSON...)
        console.error("Erreur lors de la récupération du matériel:", err);
        setError(err.message); // Stocker le message d'erreur
      } finally {
        // Quoi qu'il arrive (succès ou erreur), le chargement est terminé
        setIsLoading(false);
      }
    };

    fetchEquipment(); // Appeler la fonction pour lancer la récupération
  }, []); // Le tableau vide [] signifie que cet effet ne s'exécute qu'une fois (au montage)

  // Rendu conditionnel basé sur l'état
  if (isLoading) {
    return <p>Chargement du matériel...</p>;
  }

  if (error) {
    return <p>Erreur: {error}</p>;
  }

  // Si tout va bien, afficher la liste
  return (
    <div>
      <h2>Liste du Matériel</h2>
      {equipment.length === 0 ? (
        <p>Aucun matériel trouvé.</p>
      ) : (
        <ul>
          {equipment.map(item => (
            <li key={item.id}>
              {/* Attention : item.brand peut être null si la relation n'est pas chargée */}
              <strong>{item.baseModelName}</strong> {item.versionIdentifier ? `(${item.versionIdentifier})` : ''}
              {' - '}
              {/* Accès sécurisé à la marque via l'optional chaining '?.' */}
              <i>{item.brand?.name || 'Marque inconnue'}</i>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EquipmentList;