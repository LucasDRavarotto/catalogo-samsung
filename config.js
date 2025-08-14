// config.js
// URL de tu servicio de backend desplegado en Render
const RENDER_BACKEND_URL = 'https://catalogo-samsung.onrender.com';

export function getBackendBase() {
  // En producción, usamos la URL de Render
  return RENDER_BACKEND_URL;
}