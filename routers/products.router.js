
const express = require('express');
const router = express.Router();
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileManager');

const productsFile = path.join(__dirname, '../productos.json');


router.get('/', async (req, res) => {
  try {
    const products = await readJSON(productsFile);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:pid', async (req, res) => {
  try {
    const products = await readJSON(productsFile);
    const pid = parseInt(req.params.pid);
    const product = products.find(p => p.id === pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || price === undefined || stock === undefined || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const products = await readJSON(productsFile);
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title,
      description,
      code,
      price,
      status: true,
      stock,
      category,
      thumbnails: thumbnails || []
    };
    products.push(newProduct);
    await writeJSON(productsFile, products);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:pid', async (req, res) => {
  const pid = parseInt(req.params.pid);
  const updateData = req.body;
  delete updateData.id; 
  try {
    const products = await readJSON(productsFile);
    const index = products.findIndex(p => p.id === pid);
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    products[index] = { ...products[index], ...updateData };
    await writeJSON(productsFile, products);
    res.json(products[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:pid', async (req, res) => {
  const pid = parseInt(req.params.pid);
  try {
    const products = await readJSON(productsFile);
    const index = products.findIndex(p => p.id === pid);
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    const deleted = products.splice(index, 1);
    await writeJSON(productsFile, products);
    res.json({ message: 'Producto eliminado', product: deleted[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
