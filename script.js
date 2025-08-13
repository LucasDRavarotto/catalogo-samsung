// =========================
// Utilidades
// =========================
function getBackendBase() {
  const { protocol, hostname } = window.location;
  const isCodespaces = /\.app\.github\.dev$/.test(hostname);
  if (isCodespaces) {
    const backendHost = hostname.replace(/-\d+\.app\.github\.dev$/, '-3000.app.github.dev');
    return `${protocol}//${backendHost}`;
  }
  return 'http://localhost:3000';
}

const BACKEND_BASE = getBackendBase();

// Fetch con timeout y sin cache para evitar respuestas viejas
async function fetchJSON(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: 'no-store', ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

// =========================
// Cotización USDT → ARS
// =========================
async function obtenerCotizacionCripto() {
  try {
    // La API de Dólar Cripto se obtiene ahora a través de nuestro propio backend (proxy)
    const d = await fetchJSON(`${BACKEND_BASE}/api/cotizacion`);
    const venta = typeof d?.venta === 'number' ? d.venta : Number(d?.venta);
    if (!venta || Number.isNaN(venta)) throw new Error('Formato inesperado de la API');
    return venta;
  } catch (err) {
    console.error('Error al obtener la cotización del Dólar Cripto:', err);
    return null;
  }
}

async function actualizarPrecios() {
  const elementoValorUSDT = document.getElementById('valor-usdt');

  // Precios en USDT
  const precios = {
    s25u: 1250, s25: 850, a56: 490, a55: 440, a36: 355, a16: 200,
    a54: 330, s23u: 580
  };

  for (const id of Object.keys(precios)) {
    const el = document.getElementById(id);
    if (el && (el.textContent === '' || el.textContent === '—')) el.textContent = '...';
  }

  const cotizacion = await obtenerCotizacionCripto();

  if (!cotizacion) {
    elementoValorUSDT.innerHTML = `<div class="alert-error">❌ No se pudo conectar para cotizar el Dólar Cripto.</div>`;
    for (const id in precios) {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    }
    return;
  }

  elementoValorUSDT.textContent = `Dólar Cripto: AR$ ${cotizacion.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  for (const [id, usdt] of Object.entries(precios)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const ars = usdt * cotizacion;
    el.textContent = ars.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

document.addEventListener('DOMContentLoaded', actualizarPrecios);
setInterval(actualizarPrecios, 300000);

// =========================
// Cuotas con backend (Mercado Pago)
// =========================
async function calcularCuotas(productoId) {
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

function ocultarCuotas() {
  document.getElementById('cuotas-backdrop').style.display = 'none';
}