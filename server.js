const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 👉 ¡Esta es la línea clave que falta!
app.use(express.static('.'));

const ACCESS_TOKEN = "TEST-aa51e05b-71d4-4e03-a2b8-19088568b9c4";

// Endpoint para obtener las cuotas de Mercado Pago
app.post('/api/cuotas', async (req, res) => {
  const { payment_method_id, bin, amount } = req.body;

  if (!payment_method_id || !bin || !amount) {
    return res.status(400).json({ error: 'Faltan parámetros: payment_method_id, bin, y amount son requeridos.' });
  }

  try {
    const url = 'https://api.mercadopago.com/v1/payment_methods/installments';
    const response = await axios.get(url, {
      params: {
        public_key: ACCESS_TOKEN,
        payment_method_id,
        bin,
        amount
      }
    });

    const data = response.data;
    // La respuesta de la API es un array, accedemos al primer elemento
    const payerCosts = data[0]?.payer_costs;

    if (payerCosts && payerCosts.length > 0) {
      const cuotas = payerCosts.map(costo => ({
        installments: costo.installments,
        total_amount: costo.total_amount,
        installment_amount: costo.installment_amount
      }));
      return res.json({ cuotas });
    }
    res.status(404).json({ error: 'No se encontraron cuotas.' });
  } catch (error) {
    console.error('Error al obtener las cuotas:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
  }
});

// Endpoint para obtener la cotización del dólar cripto (proxy)
app.get('/api/cotizacion', async (req, res) => {
  try {
    const response = await axios.get('https://dolarapi.com/v1/dolares/cripto');
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener la cotización del Dólar Cripto:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la cotización.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
});