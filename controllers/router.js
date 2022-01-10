const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Notification = require("../models/notification");
const cron = require("node-cron");
const io = require('socket.io')

router.get("/", (req, res) => {
  res.send("Hello from server !");
});

// request body should be like this: {name, dateExp}
router.post("/products", async (req, res) => {
  const product = new Product(req.body);

  try {
    await product.save();
    const alertDate = new Date(req.body.dateExp);
    const onloadDate = Date.now();
    const tOut = alertDate - onloadDate;

    if (tOut > 0) {
      setTimeout(async () => {
        const notification = new Notification({
          notificationType: "expiration",
          product,
        });
        await notification.save();
        // Send popup to UI
        const { nom, dateExp } = req.body;
        const description = `Le produit ${nom} est périmé. Date d'expiration (${dateExp}) `
        req.app.io.emit('popup', {title: "Alerte Expiration", description});
      }, tOut);
    } else {
      const notification = new Notification({
        notificationType: "expiration",
        product,
      });
      await notification.save();
      const { nom, dateExp } = req.body;
      const description = `Le produit ${nom} est périmé. Date d'expiration (${dateExp}) `
      req.app.io.emit('popup', {title: "Alerte Expiration", description});

    }
    res.status(201).send({ product });
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
});

// To get all products
router.get("/products", async (req, res) => {
  try {
    const produits = await Product.find({}).lean(); 
    res.status(201).send(produits);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete("/products/:id", async (req, res) => {
    try {
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
      });

      const notification = await Notification.findOneAndDelete({
        product: req.params.id,
        notificationType: "expiration"
      });
  
      if (!product) {
        res.status(404).send();
      }
      console.log(product)
      res.send(product);
      res.send(notification);

    } catch (e) {
      res.status(500).send();
    }
  });

router.get("/products/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).send();
    }

    console.log(product);
    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});



// Method: POST
// The arduino card send a post request to the server in order to notify the user of a change in the temperature
// depricated
// router.post('/notifications/temperature', async (req, res) => {
//     const {temperatureActuelle, differenceTemperature} = req.body;
//     const notification = new Notification({notificationType: 'temperature'});
//     try {
//         await notification.save()
//         res.status(201).send({ notification })
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.post('/notifications/expiration', async (req, res) => {
//     const notification = new Notification({notificationType: 'expiration'});
//     const expirationDate = req.body

//     try {
//         await notification.save()
//         res.status(201).send({ notification })
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// To get all temperature notification
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

// To get all expiration notifications
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

// To get all notifications
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
