// routers/products.router.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');


router.get('/', async (req, res) => {
  try {
    let { limit, page, sort, query } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    
    
    let filter = {};
    if (query) {
      
      const [field, value] = query.split(':');
      if (field === 'category') {
        filter.category = value;
      } else if (field === 'available' && value === 'true') {
        filter.stock = { $gt: 0 };
      }
    }
    
    
    let sortOption = {};
    if (sort) {
      sortOption.price = sort.toLowerCase() === 'asc' ? 1 : -1;
    }
    
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    
    const baseUrl = `/api/products?limit=${limit}`;
    const prevLink = page > 1 ? `${baseUrl}&page=${page - 1}` : null;
    const nextLink = page < totalPages ? `${baseUrl}&page=${page + 1}` : null;
    
    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink,
      nextLink
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
