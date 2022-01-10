const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Notification = require("../models/notification");
const cron = require("node-cron");
const io = require("socket.io");

router.get("/", (req, res) => {
  res.send("Hello from server !");
});

// Route pour créer un produit
router.post("/products", async (req, res) => {
  const product = new Product(req.body);

  try {
    // On enregistre le produit dans la BD
    await product.save();
    const alertDate = new Date(req.body.dateExp); // Il s'agit de la date d'expiration du produit
    const onloadDate = Date.now();

    // tOut et le temps en ms entre la date d'expiration et la date d'aujourd'hui
    const tOut = alertDate - onloadDate;

    // On génère une notification après tOut ms
    if (tOut > 0) {
      // On utilise setTimeout pour planifier la creation de la notification et l'evoie de la popup
      // qu'au jour d'expiration du produit
      setTimeout(async () => {
        const notification = new Notification({
          notificationType: "expiration",
          product,
        });
        await notification.save();
        // Send popup to UI
        const { nom, dateExp } = req.body;
        const description = `Le produit ${nom} est périmé. Date d'expiration (${dateExp}) `;
        req.app.io.emit("popup", { title: "Alerte Expiration", description });
      }, tOut);
    } else {
      // On crée directement la notuf si tOut < 0
      const notification = new Notification({
        notificationType: "expiration",
        product,
      });
      await notification.save();
      const { nom, dateExp } = req.body;
      const description = `Le produit ${nom} est périmé. Date d'expiration (${dateExp}) `;
      req.app.io.emit("popup", { title: "Alerte Expiration", description });
    }
    res.status(201).send({ product });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// Route pour avoir la liste des produits
router.get("/products", async (req, res) => {
  try {
    const produits = await Product.find({}).lean();
    res.status(201).send(produits);
  } catch (e) {
    res.status(500).send();
  }
});

// Route pour effacer un produit à partir de son id
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
    });

    const notification = await Notification.findOneAndDelete({
      product: req.params.id,
      notificationType: "expiration",
    });

    if (!product) {
      res.status(404).send();
    }
    res.send(product);
    res.send(notification);
  } catch (e) {
    res.status(500).send();
  }
});

// Route pour get un produit avec son id
router.get("/products/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).send();
    }

    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Route pour avoir la liste des notifications de temperature 
router.get("/notifications/temperature", async (req, res) => {
  try {
    const notifications = await Notification.find({
      notificationType: "temperature",
    }).lean();
    res.status(201).send(notifications);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Route pour avoir la liste des notifications d'expiration 
router.get("/notifications/expiration", async (req, res) => {
  try {
    const notifications = await Notification.find({
      notificationType: "expiration",
    })
      .populate("product")
      .lean();
    console.log(notifications);
    res.status(201).send(notifications);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Route pour avoir la liste de toutes les notifications 
router.get("/notifications/", async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate("product")
      .lean();
    res.status(201).send(notifications);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Route pour supprimer une notification par son id
router.delete("/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
    });

    if (!notification) {
      res.status(404).send();
    }

    res.send(notification);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
