// server.js

// Importamos las librerías necesarias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Creamos la instancia de la aplicación de Express
const app = express();

// Middleware (para que Express pueda entender JSON y evitar problemas de CORS)
app.use(cors());
app.use(express.json());

// URL de conexión a tu base de datos de MongoDB Atlas
// ¡IMPORTANTE!: Reemplaza <tu_url_de_conexion> con la URL que te da MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://lucasdavid:<asd147258>@basededatos.oizq3h3.mongodb.net/?retryWrites=true&w=majority&appName=basededatos';

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conexión exitosa a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Definimos el puerto en el que correrá el servidor
const PORT = process.env.PORT || 3000;

// Iniciamos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// A continuación, crearemos el modelo de datos y las rutas (endpoints) de la API

// Definimos el esquema del modelo de Producto
const productoSchema = new mongoose.Schema({
    modelo: {
        type: String,
        required: true
    },
    precio_usdt: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['nuevo', 'usado'] // Para asegurar que solo se usen estos dos valores
    }
});

// Creamos el modelo a partir del esquema
const Producto = mongoose.model('Producto', productoSchema);

// Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los productos', error: err });
    }
});