// main.js
import { obtenerCotizacionCripto } from './cotizacion-api.js';
import { calcularCuotas, ocultarCuotas } from './cuotas-api.js';
import { fetchJSON } from './utils.js';

// Hacemos las funciones de cuotas disponibles globalmente para los eventos onclick
window.calcularCuotas = calcularCuotas;
window.ocultarCuotas = ocultarCuotas;

async function actualizarPrecios() {
  const elementoValorUSDT = document.getElementById('valor-usdt');
  
  const productos = await fetchJSON('productos.json');

  for (const producto of productos) {
    const el = document.getElementById(producto.id + '-ars');
    if (el && (el.textContent === '' || el.textContent === '—')) el.textContent = '...';
  }

  const cotizacion = await obtenerCotizacionCripto();

  if (!cotizacion) {
    elementoValorUSDT.innerHTML = `<div class="alert-error">❌ No se pudo conectar para cotizar el Dólar Cripto.</div>`;
    for (const producto of productos) {
      const el = document.getElementById(producto.id + '-ars');
      if (el) el.textContent = '—';
    }
    return;
  }

  elementoValorUSDT.textContent = `Dólar Cripto: AR$ ${cotizacion.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const tablaNuevosBody = document.getElementById('tabla-nuevos-body');
  const tablaUsadosBody = document.getElementById('tabla-usados-body');
  
  tablaNuevosBody.innerHTML = '';
  tablaUsadosBody.innerHTML = '';

  for (const producto of productos) {
    const ars = producto.usdt * cotizacion;
    const precioARSFormateado = ars.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const filaHTML = `
      <tr>
        <td>${producto.modelo}</td>
        <td>${producto.usdt}</td>
        <td id="${producto.id}-ars">${precioARSFormateado}</td>
        <td>
          <button class="button small" onclick="calcularCuotas('${producto.id}-ars')">
            <i class="material-icons">paid</i> Cuotas
          </button>
        </td>
      </tr>
    `;

    if (producto.estado === 'nuevo') {
      tablaNuevosBody.innerHTML += filaHTML;
    } else if (producto.estado === 'usado') {
      tablaUsadosBody.innerHTML += filaHTML;
    }
  }
}

document.addEventListener('DOMContentLoaded', actualizarPrecios);
setInterval(actualizarPrecios, 300000);