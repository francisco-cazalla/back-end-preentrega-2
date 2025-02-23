
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const { readJSON, writeJSON } = require('./utils/fileManager');


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;


app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


const productsRouter = require('./routers/products.router');
const cartsRouter = require('./routers/carts.router');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);




app.get('/', async (req, res) => {
  const products = await readJSON(path.join(__dirname, 'productos.json'));
  res.render('home', { products });
});


app.get('/realtimeproducts', async (req, res) => {
  const products = await readJSON(path.join(__dirname, 'productos.json'));
  res.render('realTimeProducts', { products });
});

app.get('/cart', async (req, res) => {
  const carts = await readJSON(path.join(__dirname, 'carrito.json'));
  const cart = carts.find(c => c.id === 1) || null;

  let cartProducts = [];
  if (cart && cart.products && cart.products.length > 0) {
    const products = await readJSON(path.join(__dirname, 'productos.json'));
    cartProducts = cart.products.map(item => {
      const prodDetail = products.find(p => p.id === item.product);
      return {
        id: item.product,
        quantity: item.quantity,
        title: prodDetail ? prodDetail.title : 'Producto no encontrado',
        description: prodDetail ? prodDetail.description : '',
        price: prodDetail ? prodDetail.price : 0
      };
    });
  }
  res.render('cart', { cart, cartProducts, title: "Tu Carrito de Compras" });
});




io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  
  const productsFile = path.join(__dirname, 'productos.json');
  readJSON(productsFile).then(products => {
    socket.emit('updateProducts', products);
  });

  
  socket.on('addProduct', async (data) => {
    const productsFile = path.join(__dirname, 'productos.json');
    const products = await readJSON(productsFile);
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title: data.title,
      description: data.description,
      price: Number(data.price),
      code: data.code || 'N/A',
      stock: data.stock || 0,
      category: data.category || 'General',
      status: true,
      thumbnails: data.thumbnails || []
    };
    products.push(newProduct);
    await writeJSON(productsFile, products);
    io.emit('updateProducts', products);
  });

  
  socket.on('deleteProduct', async (id) => {
    id = Number(id);
    const productsFile = path.join(__dirname, 'productos.json');
    let products = await readJSON(productsFile);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      await writeJSON(productsFile, products);
      io.emit('updateProducts', products);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
