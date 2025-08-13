// cuotas-api.js
import { fetchJSON } from './utils.js';
import { BACKEND_BASE } from './config.js';

export async function calcularCuotas(productoId) {
  const precioTexto = document.getElementById(productoId)?.textContent ?? '';
  const precioBase = parseFloat(
    precioTexto.replace('$', '').replace(/\./g, '').replace(',', '.')
  );

  const cuotasContainer = document.getElementById('cuotas-container');
  const backdrop = document.getElementById('cuotas-backdrop');

  if (isNaN(precioBase)) {
    cuotasContainer.innerHTML = `<p class="padding">Error: precio inválido.</p>`;
    backdrop.style.display = 'flex';
    return;
  }

  const payload = {
    payment_method_id: 'visa',
    bin: '450995',
    amount: precioBase
  };

  cuotasContainer.innerHTML = `
    <div class="s12">
      <div class="card padding align-center">Calculando cuotas...</div>
    </div>
  `;
  backdrop.style.display = 'flex';

  try {
    const data = await fetchJSON(`${BACKEND_BASE}/api/cuotas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const { cuotas } = data || {};
    if (!Array.isArray(cuotas) || !cuotas.length) {
      throw new Error('Sin cuotas devueltas por el backend');
    }

    let html = '';
    for (const c of cuotas) {
      html += `
        <div class="s12 m6 l4">
          <div class="card padding">
            <p class="h6">${c.installments} cuotas</p>
            <p>Total: <b>AR$ ${Number(c.total_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</b></p>
            <p>Cada cuota: <b>AR$ ${Number(c.installment_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</b></p>
          </div>
        </div>
      `;
    }
    cuotasContainer.innerHTML = html;
  } catch (err) {
    console.error('No se pudieron obtener las cuotas:', err);
    cuotasContainer.innerHTML = `
      <div class="s12">
        <div class="card padding">
          <p class="h6">No se pudieron obtener las cuotas</p>
          <p>Verificá que el backend esté corriendo y el puerto 3000 esté público.</p>
          <p><code>BACKEND_BASE: ${BACKEND_BASE}</code></p>
        </div>
      </div>
    `;
  }
}

export function ocultarCuotas() {
  document.getElementById('cuotas-backdrop').style.display = 'none';
}