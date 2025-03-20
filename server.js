

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');


const Product = require('./models/Product');
const Cart = require('./models/Cart');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miProyectoFinal';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 8080;


app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    multiply: (a, b) => a * b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const productsRouter = require('./routers/products.router');
const cartsRouter = require('./routers/carts.router');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.get('/', (req, res) => res.redirect('/products'));


app.get('/products', async (req, res) => {
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

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevLink = hasPrevPage ? `/products?limit=${limit}&page=${page - 1}&sort=${sort || ''}&query=${query || ''}` : null;
    const nextLink = hasNextPage ? `/products?limit=${limit}&page=${page + 1}&sort=${sort || ''}&query=${query || ''}` : null;

   
    res.render('home', {
      products,
      totalPages,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
      title: 'Lista de Productos'
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');
    res.render('productDetail', { product, title: product.title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get('/cart', async (req, res) => {
  let cart = await Cart.findOne().populate('products.product').lean();
  if (!cart) cart = { products: [] };
  res.render('cart', { cart, title: 'Tu Carrito de Compras' });
});


io.on('connection', (socket) => {
  console.log('🔵 Cliente conectado');

  Product.find().lean().then(products => socket.emit('updateProducts', products));

  socket.on('addProduct', async (data) => {
    try {
      const newProduct = new Product(data);
      await newProduct.save();
      const products = await Product.find().lean();
      io.emit('updateProducts', products);
    } catch (err) {
      console.error('❌ Error al agregar producto:', err);
    }
  });

  socket.on('disconnect', () => console.log('🔴 Cliente desconectado'));
});


httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
