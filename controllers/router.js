const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Notification = require('../models/notification');
const cron = require('node-cron');

router.get('/', (req, res) => {
    res.send("Hello from server !");
});

router.post('/products', async (req, res) => {
    console.log(req.body);
    const product = new Product(req.body);

    try {
        await product.save();
        const alertDate = new Date(req.body.dateExp);
        const onloadDate = Date.now();
        const tOut = alertDate - onloadDate;

        if (tOut > 0) {
            setTimeout(async ()=>{ 
                const notification = new Notification({notificationType: 'expiration', product});
                await notification.save();
             }, tOut )
        } else {
            const notification = new Notification({notificationType: 'expiration', product});
            await notification.save();
        }
        res.status(201).send({ product })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/products', async (req, res) => {
    try {
        const produits = await Product.find({}).lean();
        res.status(201).send(produits);
    } catch (e) {
        res.status(500).send();
    }
})

router.get('/products/:id', async (req,res) => {
    const _id = req.params.id
    try {
        const product = await Product.findById(_id);
         
        if (!product) {
            return res.status(404).send()
        }

        console.log(product)
        res.send(product)
    } catch (e) {
        res.status(500).send(e)
    }
})


// Method: POST
// The arduino card send a post request to the server in order to notify the user of a change in the temperature

router.post('/notifications/temperature', async (req, res) => {
    const {temperatureActuelle, differenceTemperature} = req.body;
    const notification = new Notification({notificationType: 'temperature'});

    try {
        await notification.save()
        res.status(201).send({ notification })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/notifications/expiration', async (req, res) => {
    const notification = new Notification({notificationType: 'expiration'});
    const expirationDate = req.body

    try {
        await notification.save()
        res.status(201).send({ notification })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/notifications/temperature', async (req, res) => {
    try {
        const notifications = await Notification.find({notificationType: 'temperature'}).lean();
        res.status(201).send({ notifications })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/notifications/expiration', async (req, res) => {
    try {
        const notifications = await Notification.find({notificationType: 'expiration'}).populate('product').lean();
        res.status(201).send({ notifications })
    } catch (e) {
        res.status(400).send(e)
    }
})

console.log("Hello from router.js")

module.exports = router;