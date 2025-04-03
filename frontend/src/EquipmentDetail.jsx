// frontend/src/EquipmentDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

function EquipmentDetail() {
  const { id } = useParams();
  const equipmentId = parseInt(id); // Convertir une fois pour utilisation

  // États pour l'équipement, chargement, erreur principale
  const [equipment, setEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la section "Ajouter Spec"
  const [availableSpecs, setAvailableSpecs] = useState([]); // Specs définitions chargeables
  const [selectedSpecDefId, setSelectedSpecDefId] = useState('');
  const [specValue, setSpecValue] = useState(''); // Valeur entrée par l'utilisateur
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [addSpecError, setAddSpecError] = useState('');
  const [addSpecSuccess, setAddSpecSuccess] = useState('');

  // --- Fonction pour recharger les données de l'équipement ---
  // useCallback pour éviter de recréer la fonction à chaque rendu, utile si passé en dépendance
  const fetchEquipmentDetail = useCallback(async () => {
    // Ne pas remettre isLoading à true si c'est juste un rafraichissement
    // setIsLoading(true);
    setError(null); // Réinitialise l'erreur principale
    try {
      const response = await fetch(`http://localhost:3001/api/equipment/${equipmentId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        if (response.status === 404) throw new Error(`Matériel avec l'ID ${equipmentId} non trouvé.`);
        throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || 'Impossible de récupérer les détails'}`);
      }
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      console.error("Erreur fetch details:", err);
      setError(err.message); // Met l'erreur principale
    } finally {
      setIsLoading(false); // Arrête le chargement principal seulement la 1ere fois
    }
  }, [equipmentId]); // Dépend de equipmentId

  // --- Effet pour charger les données initiales (équipement ET définitions de specs) ---
  useEffect(() => {
    setIsLoading(true); // Chargement initial global
    const loadInitialData = async () => {
        await fetchEquipmentDetail(); // Charge les détails de l'équipement

        // Charger les définitions de spécifications pour le formulaire d'ajout
        try {
             const specDefResponse = await fetch('http://localhost:3001/api/specification-definitions');
             if (!specDefResponse.ok) throw new Error('Impossible de charger les définitions de specs');
             const specDefsData = await specDefResponse.json();
             setAvailableSpecs(specDefsData);
        } catch (err) {
             console.error("Erreur chargement spec definitions:", err);
             setError(prev => prev ? `${prev}\n${err.message}` : err.message); // Ajoute à l'erreur existante si besoin
        } finally {
            // Assurez-vous que isLoading global est bien remis à false même si les specs def échouent
             setIsLoading(false);
        }
    };
    loadInitialData();

  }, [fetchEquipmentDetail]); // Dépend de la fonction fetchEquipmentDetail (qui dépend de equipmentId)


  // --- Gestionnaire pour l'ajout de spécification ---
  const handleAddSpecification = async (event) => {
    event.preventDefault();
    setAddSpecError('');
    setAddSpecSuccess('');
    setIsAddingSpec(true);

    const definition = availableSpecs.find(def => def.id === parseInt(selectedSpecDefId));
    if (!definition) {
      setAddSpecError("Veuillez sélectionner une spécification valide.");
      setIsAddingSpec(false);
      return;
    }

    // Préparation de la valeur en fonction du type attendu
    let valueToSend;
    switch (definition.valueType) {
        case 'INT':
            valueToSend = parseInt(specValue);
            if (isNaN(valueToSend)) { setAddSpecError("Valeur invalide pour un entier."); setIsAddingSpec(false); return; }
            break;
        case 'FLOAT':
            valueToSend = parseFloat(specValue);
             if (isNaN(valueToSend)) { setAddSpecError("Valeur invalide pour un nombre décimal."); setIsAddingSpec(false); return; }
            break;
        case 'BOOLEAN':
            // Gérer la checkbox - l'état 'specValue' sera true/false directement
             valueToSend = specValue === true; // Assurer que c'est bien un booléen
            break;
         case 'STRING':
         default:
            if (typeof specValue !== 'string' || specValue.trim() === '') {
                 setAddSpecError("La valeur ne peut pas être vide pour une chaîne."); setIsAddingSpec(false); return;
            }
            valueToSend = specValue;
            break;
    }


    try {
      const response = await fetch(`http://localhost:3001/api/equipment/${equipmentId}/specifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specDefinitionId: parseInt(selectedSpecDefId),
          value: valueToSend
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || `Erreur HTTP ${response.status}`);
      }

      // Succès ! Mettre à jour l'état local et afficher un message
      setAddSpecSuccess(`Spécification "${responseData.specDefinition.displayName}" ajoutée.`);
      // IMPORTANT: Met à jour l'état 'equipment' localement pour voir le changement sans recharger
      setEquipment(prevEquipment => ({
          ...prevEquipment,
          specifications: [...prevEquipment.specifications, responseData] // Ajoute la nouvelle spec à la liste existante
      }));

      // Réinitialiser le formulaire d'ajout
      setSelectedSpecDefId('');
      setSpecValue('');
      setTimeout(() => setAddSpecSuccess(''), 3000); // Efface le message succès

    } catch (err) {
      console.error("Erreur ajout spec:", err);
      setAddSpecError(`Erreur : ${err.message}`);
    } finally {
      setIsAddingSpec(false);
    }
  };

  // --- Gestionnaire pour la suppression de spécification ---
  const handleDeleteSpecification = async (specValueIdToDelete) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette spécification ?")) {
          return; // Ne rien faire si l'utilisateur annule
      }

       // On pourrait mettre un état "isDeleting" pour l'UI si besoin
      setAddSpecError(''); // Réutilise le message d'erreur pour la suppression
      try {
          const response = await fetch(`http://localhost:3001/api/equipment/${equipmentId}/specifications/${specValueIdToDelete}`, {
              method: 'DELETE',
          });

          // Statut 204 signifie succès pour DELETE, pas de JSON à parser
          if (response.status === 204) {
               // Succès ! Mettre à jour l'état local
               setEquipment(prevEquipment => ({
                   ...prevEquipment,
                   // Filtre la liste pour enlever la spec supprimée
                   specifications: prevEquipment.specifications.filter(spec => spec.id !== specValueIdToDelete)
               }));
               // Afficher un message de succès temporaire peut être bien aussi
               setAddSpecSuccess('Spécification supprimée.');
                setTimeout(() => setAddSpecSuccess(''), 3000);

          } else if (!response.ok) {
              // Essayer de lire le message d'erreur s'il y en a un
              const errorData = await response.json().catch(() => ({ message: response.statusText }));
              throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
          }
      } catch (err) {
          console.error("Erreur suppression spec:", err);
          setAddSpecError(`Erreur suppression : ${err.message}`);
      }
      // Remettre à false l'état "isDeleting" si on en avait un
  };


  // --- Rendu du composant ---
  if (isLoading) return <p>Chargement des détails du matériel...</p>;
  if (error) return (
    <div>
      <p style={{ color: 'red' }}>Erreur : {error}</p>
      <Link to="/">Retour à la liste</Link>
    </div>
  );
  if (!equipment) return (
    <div>
      <p>Impossible de charger les informations.</p>
      <Link to="/">Retour à la liste</Link>
    </div>
  );


  // Filtrer les définitions de specs disponibles :
  // - Celles qui sont applicables au type de matériel courant
  // - Celles qui ne sont PAS déjà présentes dans les specs de l'équipement
   const currentSpecDefIds = equipment.specifications.map(spec => spec.specDefinitionId);
   const possibleSpecsToAdd = availableSpecs.filter(def =>
       def.applicableTo.includes(equipment.equipmentType) &&
       !currentSpecDefIds.includes(def.id)
   );

   // Trouver la définition de spec sélectionnée pour déterminer le type d'input
   const selectedDefinition = availableSpecs.find(def => def.id === parseInt(selectedSpecDefId));


  // --- JSX ---
  return (
    <div>
      {/* ... (Affichage des infos de base : nom, marque, image, etc. comme avant) ... */}
       <h2>
            {equipment.baseModelName} {equipment.versionIdentifier || ''}
            {equipment.brand ? ` - ${equipment.brand.name}` : ''}
       </h2>
       <p><Link to="/">← Retour à la liste</Link></p>
        {equipment.mainImageUrl && (
            <img src={equipment.mainImageUrl} alt={`Image de ${equipment.baseModelName}`} style={{ maxWidth: '300px', marginBottom: '1em' }} />
        )}
        <p><strong>Type :</strong> {equipment.equipmentType}</p>
        {equipment.mount && <p><strong>Monture :</strong> {equipment.mount.name}</p>}
        {(equipment.productionStartYear || equipment.productionEndYear) && (
            <p>
                <strong>Production :</strong>
                {/* Affiche l'année de début ou '?' si elle n'existe pas */}
                {equipment.productionStartYear ? ` ${equipment.productionStartYear}` : '?'}
                {' - '} {/* Séparateur */}
                {/* Affiche l'année de fin ou 'Aujourd'hui' (ou '?') si elle n'existe pas */}
                {equipment.productionEndYear ? `${equipment.productionEndYear}` : 'Aujourd\'hui'}
                {/* Alternative si on préfère '?' pour une fin inconnue : */}
                {/* {equipment.productionEndYear ? `${equipment.productionEndYear}` : '?'} */}
            </p>
        )}
        {equipment.description && <p><strong>Description :</strong> {equipment.description}</p>}


      {/* --- Affichage des Spécifications Existantes --- */}
      <h3>Spécifications Techniques</h3>
      {equipment.specifications && equipment.specifications.length > 0 ? (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {equipment.specifications.map(specValue => (
            <li key={specValue.id} style={{ marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
              <strong>{specValue.specDefinition.displayName}:</strong>
              {' '}
              {specValue.specDefinition.valueType === 'STRING' && specValue.stringValue}
              {specValue.specDefinition.valueType === 'INT' && specValue.intValue}
              {specValue.specDefinition.valueType === 'FLOAT' && specValue.floatValue}
              {specValue.specDefinition.valueType === 'BOOLEAN' && (specValue.booleanValue ? 'Oui' : 'Non')}
              {' '}
              {specValue.specDefinition.unit || ''}
              {/* Bouton Supprimer */}
              <button
                  onClick={() => handleDeleteSpecification(specValue.id)}
                  style={{ marginLeft: '15px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8em' }}
                  title="Supprimer cette spécification"
              >
                  [X]
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune spécification technique renseignée.</p>
      )}

      {/* --- Formulaire pour Ajouter une Spécification --- */}
      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ccc' }}>
        <h4>Ajouter une Spécification</h4>
        {addSpecSuccess && <p style={{ color: 'green' }}>{addSpecSuccess}</p>}
        {addSpecError && <p style={{ color: 'red' }}>{addSpecError}</p>}

        <form onSubmit={handleAddSpecification} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {/* Liste déroulante des specs ajoutables */}
          <select
            value={selectedSpecDefId}
            onChange={(e) => {
                setSelectedSpecDefId(e.target.value);
                // Réinitialiser la valeur quand on change de spec
                const def = availableSpecs.find(d => d.id === parseInt(e.target.value));
                setSpecValue(def?.valueType === 'BOOLEAN' ? false : ''); // Init à false pour boolean, vide sinon
                setAddSpecError(''); // Efface erreur précédente
            }}
            disabled={isAddingSpec}
            required
          >
            <option value="">-- Choisir Spécification --</option>
            {possibleSpecsToAdd.map(def => (
              <option key={def.id} value={def.id}>
                {def.displayName} {def.unit ? `(${def.unit})` : ''}
              </option>
            ))}
             {possibleSpecsToAdd.length === 0 && <option disabled>Aucune autre spec applicable/disponible</option>}
          </select>

          {/* Champ de valeur conditionnel */}
          {selectedDefinition && (
            <>
              {selectedDefinition.valueType === 'BOOLEAN' ? (
                 <input
                    type="checkbox"
                    checked={specValue === true} // Gère l'état booléen
                    onChange={(e) => setSpecValue(e.target.checked)} // Met à jour l'état avec true/false
                    disabled={isAddingSpec}
                    style={{ transform: 'scale(1.5)', marginLeft: '10px' }}
                 />
              ) : (
                 <input
                    // Change le type d'input en fonction du valueType
                    type={selectedDefinition.valueType === 'INT' || selectedDefinition.valueType === 'FLOAT' ? 'number' : 'text'}
                    // Ajoute step="any" pour autoriser les décimaux pour FLOAT
                    step={selectedDefinition.valueType === 'FLOAT' ? 'any' : undefined}
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder={`Entrez la valeur (${selectedDefinition.valueType})`}
                    disabled={isAddingSpec}
                    required
                 />
              )}
            </>
          )}


          <button type="submit" disabled={!selectedSpecDefId || isAddingSpec}>
            {isAddingSpec ? '...' : 'Ajouter'}
          </button>
        </form>
      </div>

      {/* ... (Reste du JSX : Tags, lien retour...) ... */}
        <h3>Tags</h3>
        {equipment.tags && equipment.tags.length > 0 ? (
          <p>{equipment.tags.map(tag => tag.name).join(', ')}</p>
        ) : (
          <p>Aucun tag associé.</p>
        )}
         <hr />
         <p><Link to="/">← Retour à la liste</Link></p>
    </div>
  );
}

export default EquipmentDetail;