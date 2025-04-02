// backend/server.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001; // Utilise le port défini par l'environnement ou 3001

// --- Middlewares ---
// Utiliser cors AVANT vos routes API
app.use(cors()); // <<< Utiliser cors() - par défaut autorise toutes les origines
app.use(express.json());
// -----------------

app.use(express.json()); // Crucial pour pouvoir lire req.body dans les requêtes POST/PUT

// Route de base pour vérifier que le serveur tourne
app.get('/', (req, res) => {
  res.send('Bonjour Camerapedia API !');
});

// Route pour récupérer toutes les marques
app.get('/api/brands', async (req, res) => {
  try {
    // Utilise Prisma pour trouver toutes les entrées dans la table Brand
    const brands = await prisma.brand.findMany();
    // Retourne les marques trouvées en tant que réponse JSON
    res.json(brands);
  } catch (error) {
    // En cas d'erreur (ex: problème de connexion à la BDD), log l'erreur côté serveur
    console.error("Erreur lors de la récupération des marques:", error);
    // Retourne une réponse d'erreur 500 (Internal Server Error) au client
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des marques." });
  }
});
// Route pour créer une nouvelle marque
app.post('/api/brands', async (req, res) => {
  // Récupère les données du corps de la requête
  const { name, countryOfOrigin, logoUrl } = req.body;

  // Valide que le nom est présent
  if (!name) {
    // Si le nom manque, retourne une erreur 400 (Bad Request)
    return res.status(400).json({ error: "Le champ 'name' est obligatoire." });
  }

  try {
    // Tente de créer la nouvelle marque dans la base de données
    const newBrand = await prisma.brand.create({
      data: {
        name, // Raccourci pour name: name
        countryOfOrigin, // Sera null si non fourni et que le champ est optionnel dans le schéma
        logoUrl,         // Idem
      },
    });
    // Si la création réussit, retourne la nouvelle marque avec le statut 201 (Created)
    res.status(201).json(newBrand);
  } catch (error) {
    // Vérifie si l'erreur est une violation de contrainte unique (code P2002)
    // et si elle concerne bien le champ 'name' (basé sur le schéma)
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      // Si une marque avec ce nom existe déjà, retourne une erreur 409 (Conflict)
      return res.status(409).json({ error: `Une marque avec le nom '${name}' existe déjà.` });
    }

    // Pour toute autre erreur (ex: problème de connexion BDD)
    console.error("Erreur lors de la création de la marque:", error);
    // Retourne une erreur 500 (Internal Server Error)
    res.status(500).json({ error: "Une erreur est survenue lors de la création de la marque." });
  }
});
// Route pour récupérer toutes les montures
app.get('/api/mounts', async (req, res) => {
  try {
    // Utilise Prisma pour trouver toutes les entrées dans la table Mount
    const mounts = await prisma.mount.findMany();
    // Retourne les montures trouvées en tant que réponse JSON
    res.json(mounts);
  } catch (error) {
    // En cas d'erreur (ex: problème de connexion à la BDD), log l'erreur côté serveur
    console.error("Erreur lors de la récupération des montures:", error);
    // Retourne une réponse d'erreur 500 (Internal Server Error) au client
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des montures." });
  }
});

// Route pour créer une nouvelle monture
app.post('/api/mounts', async (req, res) => {
  // Récupère les données du corps de la requête
  const { name, type, description } = req.body;

  // Valide que le nom est présent
  if (!name) {
    // Si le nom manque, retourne une erreur 400 (Bad Request)
    return res.status(400).json({ error: "Le champ 'name' est obligatoire." });
  }

  try {
    // Tente de créer la nouvelle monture dans la base de données
    const newMount = await prisma.mount.create({
      data: {
        name, // Raccourci pour name: name
        type, // Sera null si non fourni et que le champ est optionnel
        description, // Idem
      },
    });
    // Si la création réussit, retourne la nouvelle monture avec le statut 201 (Created)
    res.status(201).json(newMount);
  } catch (error) {
    // Vérifie si l'erreur est une violation de contrainte unique (code P2002)
    // et si elle concerne bien le champ 'name' (basé sur le schéma)
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      // Si une monture avec ce nom existe déjà, retourne une erreur 409 (Conflict)
      return res.status(409).json({ error: `Une monture avec le nom '${name}' existe déjà.` });
    }

    // Pour toute autre erreur (ex: problème de connexion BDD)
    console.error("Erreur lors de la création de la monture:", error);
    // Retourne une erreur 500 (Internal Server Error)
    res.status(500).json({ error: "Une erreur est survenue lors de la création de la monture." });
  }
});
// Route pour récupérer toutes les définitions de spécifications
app.get('/api/specification-definitions', async (req, res) => {
  try {
    // Utilise Prisma pour trouver toutes les entrées dans la table SpecificationDefinition
    const specDefinitions = await prisma.specificationDefinition.findMany();
    // Retourne les définitions trouvées en tant que réponse JSON
    res.json(specDefinitions);
  } catch (error) {
    // En cas d'erreur (ex: problème de connexion à la BDD), log l'erreur côté serveur
    console.error("Erreur lors de la récupération des définitions de spécifications:", error);
    // Retourne une réponse d'erreur 500 (Internal Server Error) au client
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des définitions de spécifications." });
  }
});

// Route pour créer une nouvelle définition de spécification
app.post('/api/specification-definitions', async (req, res) => {
  // Récupère les données du corps de la requête
  const { specKey, displayName, valueType, applicableTo, unit, description } = req.body;

  // Valide la présence des champs requis
  if (!specKey || !displayName || !valueType || !applicableTo) {
    // Construit un message d'erreur listant les champs manquants
    const missingFields = [];
    if (!specKey) missingFields.push('specKey');
    if (!displayName) missingFields.push('displayName');
    if (!valueType) missingFields.push('valueType');
    if (!applicableTo) missingFields.push('applicableTo');
    // Si des champs manquent, retourne une erreur 400 (Bad Request)
    return res.status(400).json({ error: `Les champs suivants sont obligatoires: ${missingFields.join(', ')}.` });
  }

  // Optionnel : Valider que valueType est une valeur valide de l'enum SpecValueType
  // Optionnel : Valider que applicableTo est un tableau de valeurs valides de l'enum EquipmentType
  // Ces validations plus poussées ne sont pas explicitement demandées mais seraient bonnes en pratique.

  try {
    // Tente de créer la nouvelle définition de spécification dans la base de données
    const newSpecDefinition = await prisma.specificationDefinition.create({
      data: {
        specKey,
        displayName,
        valueType, // Assurez-vous que cette valeur correspond à l'enum SpecValueType
        applicableTo, // Assurez-vous que c'est un tableau de EquipmentType valides
        unit, // Sera null si non fourni et que le champ est optionnel
        description, // Idem
      },
    });
    // Si la création réussit, retourne la nouvelle définition avec le statut 201 (Created)
    res.status(201).json(newSpecDefinition);
  } catch (error) {
    // Vérifie si l'erreur est une violation de contrainte unique (code P2002)
    // et si elle concerne bien le champ 'specKey' (basé sur le schéma)
    if (error.code === 'P2002' && error.meta?.target?.includes('specKey')) {
      // Si une définition avec cette clé existe déjà, retourne une erreur 409 (Conflict)
      return res.status(409).json({ error: `Une définition de spécification avec la clé '${specKey}' existe déjà.` });
    }

    // Gérer d'autres erreurs potentielles (ex: valeur enum invalide)
    // Prisma peut lever une erreur si `valueType` ou les éléments de `applicableTo` ne sont pas valides
    if (error.code === 'P2003' || error.message.includes('Enum')) { // Approximation, le code exact peut varier
        return res.status(400).json({ error: "Valeur invalide fournie pour 'valueType' ou 'applicableTo'." });
    }


    // Pour toute autre erreur (ex: problème de connexion BDD)
    console.error("Erreur lors de la création de la définition de spécification:", error);
    // Retourne une erreur 500 (Internal Server Error)
    res.status(500).json({ error: "Une erreur est survenue lors de la création de la définition de spécification." });
  }
});
// Route pour récupérer tous les tags
app.get('/api/tags', async (req, res) => {
  try {
    // Utilise Prisma pour trouver toutes les entrées dans la table Tag
    const tags = await prisma.tag.findMany();
    // Retourne les tags trouvés en tant que réponse JSON
    res.json(tags);
  } catch (error) {
    // En cas d'erreur (ex: problème de connexion à la BDD), log l'erreur côté serveur
    console.error("Erreur lors de la récupération des tags:", error);
    // Retourne une réponse d'erreur 500 (Internal Server Error) au client
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des tags." });
  }
});

// Route pour créer un nouveau tag
app.post('/api/tags', async (req, res) => {
  // Récupère les données du corps de la requête
  const { name } = req.body;

  // Valide que le nom est présent
  if (!name) {
    // Si le nom manque, retourne une erreur 400 (Bad Request)
    return res.status(400).json({ error: "Le champ 'name' est obligatoire." });
  }

  try {
    // Tente de créer le nouveau tag dans la base de données
    const newTag = await prisma.tag.create({
      data: {
        name, // Raccourci pour name: name
      },
    });
    // Si la création réussit, retourne le nouveau tag avec le statut 201 (Created)
    res.status(201).json(newTag);
  } catch (error) {
    // Vérifie si l'erreur est une violation de contrainte unique (code P2002)
    // et si elle concerne bien le champ 'name' (basé sur le schéma)
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      // Si un tag avec ce nom existe déjà, retourne une erreur 409 (Conflict)
      return res.status(409).json({ error: `Un tag avec le nom '${name}' existe déjà.` });
    }

    // Pour toute autre erreur (ex: problème de connexion BDD)
    console.error("Erreur lors de la création du tag:", error);
    // Retourne une erreur 500 (Internal Server Error)
    res.status(500).json({ error: "Une erreur est survenue lors de la création du tag." });
  }
});
// Route pour récupérer tout le matériel avec les relations
app.get('/api/equipment', async (req, res) => {
  try {
    // Utilise Prisma pour trouver toutes les entrées dans la table Equipment
    // Inclut les données associées de Brand, Mount, et Tags
    const equipmentList = await prisma.equipment.findMany({
      include: {
        brand: true, // Inclut les détails de la marque
        mount: true, // Inclut les détails de la monture (sera null si non applicable)
        tags: true   // Inclut les tags associés
      }
    });
    // Retourne la liste du matériel trouvée en tant que réponse JSON
    res.json(equipmentList);
  } catch (error) {
    // En cas d'erreur (ex: problème de connexion à la BDD), log l'erreur côté serveur
    console.error("Erreur lors de la récupération du matériel:", error);
    // Retourne une réponse d'erreur 500 (Internal Server Error) au client
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération du matériel." });
  }
});
// Route pour créer un nouveau matériel (Version Simplifiée)
// La gestion des specs et tags sera ajoutée plus tard ou via des endpoints dédiés
app.post('/api/equipment', async (req, res) => {
  const {
      brandId,          // ID de la marque (requis)
      baseModelName,    // Nom modèle (requis)
      versionIdentifier,// Version (optionnel)
      productionStartYear,
      productionEndYear,
      equipmentType,    // Requis (ex: 'CAMERA_BODY')
      mainImageUrl,
      description,
      mountId           // ID de la monture (optionnel)
      // On ne gère PAS les 'tags' et 'specifications' directement ici pour l'instant
  } = req.body;

  // Validation de base
  if (!brandId || !baseModelName || !equipmentType) {
      return res.status(400).json({ error: 'brandId, baseModelName, et equipmentType sont requis.' });
  }
  // TODO: Valider que equipmentType est une valeur valide de l'Enum
  // TODO: Valider que brandId et mountId (si fourni) existent réellement dans leurs tables respectives

  try {
      // Vérifier si brandId existe (exemple de validation)
      // Note: Prisma lèvera aussi une erreur si la relation échoue,
      // mais une vérification préalable donne un message plus clair.
      const brandExists = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!brandExists) {
          return res.status(400).json({ error: `La marque avec l'ID ${brandId} n'existe pas.` });
      }

      // Vérifier si mountId existe (si fourni)
      if (mountId) { // Seulement si mountId n'est pas null/undefined
          const mountExists = await prisma.mount.findUnique({ where: { id: mountId } });
          if (!mountExists) {
              return res.status(400).json({ error: `La monture avec l'ID ${mountId} n'existe pas.` });
          }
      }

      const newEquipment = await prisma.equipment.create({
          data: {
              brandId,
              baseModelName,
              versionIdentifier,
              productionStartYear,
              productionEndYear,
              equipmentType, // Assurez-vous que la valeur envoyée correspond à l'Enum Prisma
              mainImageUrl,
              description,
              mountId, // Prisma gère correctement null ici si mountId est null/undefined
              // Pas de gestion des relations 'tags' ou 'specifications' ici pour l'instant
          },
          // Inclure les relations dans la réponse pour voir ce qui a été créé
           include: {
              brand: true,
              mount: true
           }
      });
      res.status(201).json(newEquipment);

  } catch (error) {
      console.error("Erreur POST /api/equipment:", error);
      // Gérer les erreurs potentielles (ex: equipmentType invalide, violation de contrainte DB)
       if (error.code === 'P2003') { // Erreur de clé étrangère (ex: brandId, mountId n'existe pas) - redondant si on vérifie avant
           return res.status(400).json({ error: "Erreur de référence: la marque ou la monture spécifiée n'existe pas." });
       }
       // Gérer l'erreur si equipmentType n'est pas dans l'Enum
       if (error.message.includes("Argument `equipmentType`: Invalid value")) {
           return res.status(400).json({ error: `La valeur fournie pour equipmentType n'est pas valide. Utilisez une des valeurs de l'Enum (ex: CAMERA_BODY, LENS...).` });
       }
      res.status(500).json({ error: 'Impossible de créer le matériel' });
  }
});
// Route pour récupérer un matériel spécifique par ID avec ses relations
app.get('/api/equipment/:id', async (req, res) => {
  // Récupère l'ID depuis les paramètres de la route et le convertit en entier
  const equipmentId = parseInt(req.params.id, 10);

  // Vérifie si la conversion a réussi et si l'ID est un nombre positif
  if (isNaN(equipmentId) || equipmentId <= 0) {
    return res.status(400).json({ error: "L'ID fourni est invalide." });
  }

  try {
    // Utilise Prisma pour trouver un matériel unique par son ID
    // findUniqueOrThrow lève une erreur si l'enregistrement n'est pas trouvé
    const equipment = await prisma.equipment.findUniqueOrThrow({
      where: { id: equipmentId },
      include: {
        brand: true, // Inclut les détails de la marque associée
        mount: true, // Inclut les détails de la monture associée (peut être null)
        tags: true,  // Inclut tous les tags associés via la table de liaison
        specifications: { // Inclut les spécifications associées
          include: {
            specDefinition: true // Pour chaque spécification, inclut aussi sa définition
          }
        }
      }
    });
    // Si trouvé, retourne le matériel avec ses relations en JSON
    res.json(equipment);
  } catch (error) {
    // Vérifie si l'erreur est due à un enregistrement non trouvé (code Prisma P2025)
    if (error.code === 'P2025') {
      // Si non trouvé, retourne une erreur 404 (Not Found)
      return res.status(404).json({ error: `Matériel avec l'ID ${equipmentId} non trouvé.` });
    }

    // Pour toute autre erreur (ex: problème de connexion BDD, erreur inattendue)
    console.error(`Erreur lors de la récupération du matériel ID ${equipmentId}:`, error);
    // Retourne une erreur 500 (Internal Server Error)
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération du matériel." });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur API Camerapedia démarré sur http://localhost:${port}`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});