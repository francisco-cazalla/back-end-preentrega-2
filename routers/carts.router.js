
const express = require('express');
const router = express.Router();
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileManager');

const cartsFile = path.join(__dirname, '../carrito.json');


router.get('/', async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:cid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  try {
    const carts = await readJSON(cartsFile);
    const cart = carts.find(c => c.id === cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);
    const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
    const newCart = { id: newId, products: [] };
    carts.push(newCart);
    await writeJSON(cartsFile, carts);
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:cid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  const updateData = req.body;
  try {
    const carts = await readJSON(cartsFile);
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return res.status(404).json({ error: 'Carrito no encontrado' });
    carts[index] = { ...carts[index], ...updateData };
    await writeJSON(cartsFile, carts);
    res.json(carts[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:cid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  try {
    const carts = await readJSON(cartsFile);
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return res.status(404).json({ error: 'Carrito no encontrado' });
    const deleted = carts.splice(index, 1);
    await writeJSON(cartsFile, carts);
    res.json({ message: 'Carrito eliminado', cart: deleted[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/:cid/product/:pid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  try {
    const carts = await readJSON(cartsFile);
    const productsFile = path.join(__dirname, '../productos.json');
    const products = await readJSON(productsFile);
    
    const cartIndex = carts.findIndex(c => c.id === cid);
    if (cartIndex === -1) return res.status(404).json({ error: 'Carrito no encontrado' });
    
    const productExists = products.find(p => p.id === pid);
    if (!productExists) return res.status(404).json({ error: 'Producto no encontrado' });
    
    let productInCart = carts[cartIndex].products.find(item => item.product === pid);
    if (productInCart) {
      productInCart.quantity++;
    } else {
      carts[cartIndex].products.push({ product: pid, quantity: 1 });
    }
    await writeJSON(cartsFile, carts);
    res.json(carts[cartIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
