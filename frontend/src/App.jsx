import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Garde le style de base s'il existe
import EquipmentDetail from './EquipmentDetail';
import AddBrandForm from './AddBrandForm';
import BrandList from './BrandList';
import AddTagForm from './AddTagForm';
import TagList from './TagList';
import AddMountForm from './AddMountForm';
import MountList from './MountList';
import AddEquipmentForm from './AddEquipmentForm';

// --- Composant pour la liste (pour mieux organiser) ---
function EquipmentList() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      // ... (le même code fetch que précédemment) ...
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3001/api/equipment');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || 'Impossible de récupérer les données'}`);
        }
        const data = await response.json();
        setEquipmentList(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du matériel:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  if (isLoading) return <p>Chargement de la liste...</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur liste : {error}</p>;

  return (
    <div>
      <h2>Liste du Matériel</h2>
      {equipmentList.length > 0 ? (
        <ul>
          {equipmentList.map((equipment) => (
            <li key={equipment.id}>
              {/* Utilisez Link pour créer un lien vers la page de détail */}
              <Link to={`/equipment/${equipment.id}`}>
                {equipment.baseModelName} {equipment.versionIdentifier || ''}
                {equipment.brand ? ` - ${equipment.brand.name}` : ''}
              </Link>
               {/* Afficher les tags si présents */}
               {equipment.tags && equipment.tags.length > 0 && (
                  <small> (Tags: {equipment.tags.map(tag => tag.name).join(', ')})</small>
               )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun matériel trouvé.</p>
      )}
    </div>
  );
}


// --- Composant principal App qui gère les routes ---
function App() {
  return (
    <div className="App">
       <header>
            <h1>{/* ... */}</h1>
            <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
              <Link to="/">Liste Matériel</Link>
              <Link to="/brands">Liste Marques</Link>
              <Link to="/tags">Liste Tags</Link>
              <Link to="/mounts">Liste Montures</Link>
              <span style={{borderLeft: '1px solid #ccc', paddingLeft: '15px'}}>Ajouter :</span>
              <Link to="/add-brand">Marque</Link>
              <Link to="/add-tag">Tag</Link>
              <Link to="/add-mount">Monture</Link>
              <Link to="/add-equipment">Matériel</Link> {/* Nouveau Lien */}
            </nav>
        </header>

      <main>
        {/* Définit les différentes routes de l'application */}
        <Routes>
          <Route path="/" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/add-brand" element={<AddBrandForm />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/add-tag" element={<AddTagForm />} />
          <Route path="/tags" element={<TagList />} />
          <Route path="/add-mount" element={<AddMountForm />} />
          <Route path="/mounts" element={<MountList />} />
          <Route path="/add-equipment" element={<AddEquipmentForm />} />
        </Routes>
      </main>

      <footer>
        {/* Pied de page */}
        <p>© 2023 Camerapedia</p>
      </footer>
    </div>
  );
}

export default App;