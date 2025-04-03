// frontend/src/AddEquipmentForm.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Liste des types d'équipement (correspondant à l'Enum Prisma)
// On pourrait aussi la récupérer via une API dédiée si elle changeait souvent
const EQUIPMENT_TYPES = ['CAMERA_BODY', 'LENS', 'FLASH', 'MOTOR', 'ACCESSORY'];

function AddEquipmentForm() {
  // --- États pour les listes déroulantes ---
  const [brands, setBrands] = useState([]);
  const [mounts, setMounts] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState(null);

  // --- États pour les champs du formulaire ---
  const [brandId, setBrandId] = useState(''); // Stocke l'ID de la marque sélectionnée
  const [baseModelName, setBaseModelName] = useState('');
  const [versionIdentifier, setVersionIdentifier] = useState('');
  const [equipmentType, setEquipmentType] = useState(''); // Stocke la valeur de l'Enum sélectionnée
  const [mountId, setMountId] = useState(''); // Stocke l'ID de la monture sélectionnée (peut être vide)
  const [productionStartYear, setProductionStartYear] = useState('');
  const [productionEndYear, setProductionEndYear] = useState('');
  const [description, setDescription] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');

  // --- États pour la soumission ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const navigate = useNavigate();

  // --- Effet pour charger les marques et montures ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDropdowns(true);
      setDropdownError(null);
      try {
        // Récupère les marques ET les montures en parallèle
        const [brandsResponse, mountsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/brands'),
          fetch('http://localhost:3001/api/mounts')
        ]);

        if (!brandsResponse.ok) throw new Error('Impossible de charger les marques');
        if (!mountsResponse.ok) throw new Error('Impossible de charger les montures');

        const brandsData = await brandsResponse.json();
        const mountsData = await mountsResponse.json();

        setBrands(brandsData);
        setMounts(mountsData);

      } catch (err) {
        console.error("Erreur chargement données formulaire:", err);
        setDropdownError(err.message);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchData();
  }, []); // Exécuté une fois au montage

  // --- Gestionnaire de soumission ---
   const handleSubmit = async (event) => {
       event.preventDefault();
       setSubmitMessage('');
       setIsSubmitting(true);

       // Validation simple des champs requis
       if (!brandId || !baseModelName || !equipmentType) {
           setSubmitMessage('Erreur : Marque, Nom du modèle et Type sont requis.');
           setIsSubmitting(false);
           return;
       }

       // Construction de l'objet de données à envoyer
       const equipmentData = {
           brandId: parseInt(brandId), // Assurer que c'est un nombre
           baseModelName,
           versionIdentifier: versionIdentifier || null, // Envoyer null si vide
           equipmentType,
           mountId: mountId ? parseInt(mountId) : null, // Envoyer null si vide/non sélectionné
           productionStartYear: productionStartYear ? parseInt(productionStartYear) : null,
           productionEndYear: productionEndYear ? parseInt(productionEndYear) : null,
           description: description || null,
           mainImageUrl: mainImageUrl || null,
           // Note: On ne gère pas les tags/specs ici pour l'instant
       };

       try {
            const response = await fetch('http://localhost:3001/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipmentData),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || `Erreur HTTP ${response.status}`);
            }

            setSubmitMessage(`Matériel "${responseData.baseModelName}" ajouté avec succès ! ID: ${responseData.id}`);
            // Réinitialiser le formulaire après succès
            setBrandId('');
            setBaseModelName('');
            setVersionIdentifier('');
            setEquipmentType('');
            setMountId('');
            setProductionStartYear('');
            setProductionEndYear('');
            setDescription('');
            setMainImageUrl('');

            // Optionnel: Rediriger vers la page du nouveau matériel ou la liste principale
            setTimeout(() => {
                // navigate(`/equipment/${responseData.id}`); // Aller vers la page détail
                 navigate(`/`); // Ou revenir à la liste principale
            }, 2000);


       } catch (err) {
           console.error("Erreur lors de l'ajout du matériel:", err);
           setSubmitMessage(`Erreur : ${err.message}`);
       } finally {
           setIsSubmitting(false);
       }
   };


  // --- Rendu ---
  if (isLoadingDropdowns) return <p>Chargement des options du formulaire...</p>;
  if (dropdownError) return <p style={{ color: 'red' }}>Erreur chargement options : {dropdownError}</p>;

  return (
    <div>
      <p><Link to="/">← Retour à la liste principale</Link></p>
      <h2>Ajouter un Nouveau Matériel</h2>

      {submitMessage && <p className={submitMessage.startsWith('Erreur') ? 'error-message' : 'success-message'}>{submitMessage}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>

        {/* Marque (Requis) */}
        <div>
          <label htmlFor="brandId">Marque : *</label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">-- Sélectionnez une marque --</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nom Modèle (Requis) */}
        <div>
          <label htmlFor="baseModelName">Nom Modèle : *</label>
          <input
            type="text"
            id="baseModelName"
            value={baseModelName}
            onChange={(e) => setBaseModelName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

         {/* Version (Optionnel) */}
        <div>
          <label htmlFor="versionIdentifier">Version :</label>
          <input
            type="text"
            id="versionIdentifier"
            placeholder="ex: Program, HP, II"
            value={versionIdentifier}
            onChange={(e) => setVersionIdentifier(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

         {/* Type (Requis) */}
        <div>
          <label htmlFor="equipmentType">Type : *</label>
           <select
            id="equipmentType"
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">-- Sélectionnez un type --</option>
            {EQUIPMENT_TYPES.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ')} {/* Remplace _ par espace pour affichage */}
              </option>
            ))}
          </select>
        </div>

         {/* Monture (Optionnel) */}
         <div>
          <label htmlFor="mountId">Monture :</label>
          <select
            id="mountId"
            value={mountId}
            onChange={(e) => setMountId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">-- Aucune / Non applicable --</option>
             {mounts.map(mount => (
              <option key={mount.id} value={mount.id}>
                {mount.name}
              </option>
            ))}
          </select>
        </div>

         {/* Années Production (Optionnel) */}
         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
           <label>Années Prod.:</label>
           <input
             type="number"
             placeholder="Début"
             value={productionStartYear}
             onChange={(e) => setProductionStartYear(e.target.value)}
             disabled={isSubmitting}
             style={{ width: '80px'}}
           />
           <span> - </span>
           <input
             type="number"
             placeholder="Fin"
             value={productionEndYear}
             onChange={(e) => setProductionEndYear(e.target.value)}
             disabled={isSubmitting}
             style={{ width: '80px'}}
           />
        </div>

         {/* Description (Optionnel) */}
        <div>
          <label htmlFor="description">Description :</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            style={{ width: '100%'}}
           />
        </div>

        {/* URL Image (Optionnel) */}
        <div>
          <label htmlFor="mainImageUrl">URL Image Principale :</label>
          <input
            type="url"
            id="mainImageUrl"
            placeholder="https://..."
            value={mainImageUrl}
            onChange={(e) => setMainImageUrl(e.target.value)}
            disabled={isSubmitting}
             style={{ width: '100%'}}
          />
        </div>

         {/* Bouton Soumission */}
         <button type="submit" disabled={isSubmitting || isLoadingDropdowns} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
           {isSubmitting ? 'Ajout en cours...' : 'Ajouter le Matériel'}
         </button>

      </form>

       {/* Styles */}
       <style>{`
        .error-message { color: red; }
        .success-message { color: green; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="number"], input[type="url"], select, textarea {
            width: 100%;
            padding: 8px;
            margin-bottom: 5px; /* Réduit marge basse pour formulaires denses */
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box; /* Important */
        }
        button:disabled { opacity: 0.6; }
        p a { margin-bottom: 15px; display: inline-block; }
      `}</style>
    </div>
  );
}

export default AddEquipmentForm;