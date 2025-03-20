const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');


router.post('/', async (req, res) => {
  try {
    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ products: [] });
    }
    const { productId, quantity } = req.body;
    cart.products.push({ product: productId, quantity });
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    cart.products = cart.products.filter(item => item.product.toString() !== req.params.pid);
    await cart.save();
    res.json({ message: 'Producto eliminado del carrito', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    const cart = await Cart.findByIdAndUpdate(req.params.cid, { products }, { new: true }).populate('products.product').lean();
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json({ message: 'Carrito actualizado', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    const item = cart.products.find(item => item.product.toString() === req.params.pid);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    item.quantity = quantity;
    await cart.save();
    res.json({ message: 'Cantidad actualizada', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    cart.products = [];
    await cart.save();
    res.json({ message: 'Carrito vacío', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
