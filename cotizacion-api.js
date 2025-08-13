// cotizacion-api.js
import { fetchJSON } from './utils.js';
import { BACKEND_BASE } from './config.js'; // Importa la URL base del backend

export async function obtenerCotizacionCripto() {
  try {
    // Llama a tu backend para obtener la cotización
    const d = await fetchJSON(`${BACKEND_BASE}/api/cotizacion`);
    const venta = typeof d?.venta === 'number' ? d.venta : Number(d?.venta);
    if (!venta || Number.isNaN(venta)) throw new Error('Formato inesperado de la API');
    return venta;
  } catch (err) {
    console.error('Error al obtener la cotización del Dólar Cripto:', err);
    return null;
  }
}