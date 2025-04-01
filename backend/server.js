const express = require('express');
const app = express();
const port = 3001;

// Définir une route GET pour la racine '/'
app.get('/', (req, res) => {
  res.send('Bonjour Camerapedia !');
});

// Faire écouter le serveur sur le port spécifié
app.listen(port, () => {
  console.log(`Serveur Express écoutant sur http://localhost:${port}`);
});
