// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Requiere tu modelo de Producto
const Product = require('./models/Product');

// Usar la variable de entorno para conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miProyectoFinal';

// Definir 10 productos de ejemplo
const seedProducts = [
  {
    title: "Laptop X",
    description: "Laptop con 16GB RAM y 512GB SSD",
    code: "LAP001",
    price: 1200,
    stock: 5,
    category: "Tecnología",
    thumbnails: []
  },
  {
    title: "Smartphone Y",
    description: "Pantalla AMOLED y cámara de alta resolución",
    code: "PHONE002",
    price: 800,
    stock: 10,
    category: "Tecnología",
    thumbnails: []
  },
  {
    title: "Teclado Mecánico",
    description: "Teclado retroiluminado con switches azules",
    code: "TEC003",
    price: 60,
    stock: 15,
    category: "Accesorios",
    thumbnails: []
  },
  {
    title: "Mouse Gamer",
    description: "Mouse con sensor de alta precisión y luces RGB",
    code: "MOU004",
    price: 40,
    stock: 20,
    category: "Accesorios",
    thumbnails: []
  },
  {
    title: "Monitor Full HD",
    description: "Monitor de 24 pulgadas con panel IPS",
    code: "MON005",
    price: 150,
    stock: 8,
    category: "Tecnología",
    thumbnails: []
  },
  {
    title: "Auriculares Bluetooth",
    description: "Auriculares inalámbricos con cancelación de ruido",
    code: "AUD006",
    price: 100,
    stock: 12,
    category: "Accesorios",
    thumbnails: []
  },
  {
    title: "Cámara Web HD",
    description: "Cámara con micrófono integrado para videollamadas",
    code: "CAM007",
    price: 70,
    stock: 9,
    category: "Accesorios",
    thumbnails: []
  },
  {
    title: "Impresora Multifunción",
    description: "Impresora con escáner y WiFi integrado",
    code: "IMP008",
    price: 200,
    stock: 6,
    category: "Oficina",
    thumbnails: []
  },
  {
    title: "Silla Ergonómica",
    description: "Silla de oficina con soporte lumbar ajustable",
    code: "SIL009",
    price: 180,
    stock: 4,
    category: "Oficina",
    thumbnails: []
  },
  {
    title: "Tablet Z",
    description: "Tablet con pantalla de 10 pulgadas y 64GB de almacenamiento",
    code: "TAB010",
    price: 300,
    stock: 7,
    category: "Tecnología",
    thumbnails: []
  }
];

(async () => {
  try {
    
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    
    await Product.deleteMany({});
    console.log('Colección Product limpiada');

    
    await Product.insertMany(seedProducts);
    console.log('Productos de prueba insertados con éxito');

    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar productos:', error);
    process.exit(1);
  }
})();
