const express = require('express');
const contenedor = require('./../utils/contenedor');
const getRandomNumber = require('./../utils/getRandomNumber');
const router = express.Router();

router.get('/', function(req, res) {
    return res.send('server andando')
});

router.get('/productos', async function(req, res) {
    try {
        const productos = await contenedor.getAll();
        return res.send(productos);
    } catch (error) {
        return res.status(404).send("No products found");
    }
});

router.get('/productoRandom', async function(req, res) {
    try {
        const productos = await contenedor.getAll();
        const index = getRandomNumber(0, productos.length);
        const producto = productos[index];
        return res.send(producto);
    } catch (error) {
        return res.status(404).send("No products found");
    }
});

module.exports = router;