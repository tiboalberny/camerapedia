// frontend/src/App.jsx
import './App.css'; // On garde les styles pour l'instant
import EquipmentList from './EquipmentList'; 

function App() {
  return (
    <div className="App">
      <h1>Encyclopédie Camerapedia</h1>
      <EquipmentList /> {/* Utiliser le composant ici */}
    </div>
  );
}

export default App;