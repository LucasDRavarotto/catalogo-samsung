// Función asíncrona para obtener la cotización del Dólar Cripto
async function obtenerCotizacionCripto() {
    try {
        const respuesta = await fetch("https://dolarapi.com/v1/dolares/cripto");
        const datos = await respuesta.json();
        // La API de Dolarapi.com devuelve la cotización de venta en 'venta'
        return datos.venta; 
    } catch (error) {
        console.error("Error al obtener la cotización del Dólar Cripto:", error);
        return null;
    }
}

// Función para actualizar todos los precios en la tabla
async function actualizarPrecios() {
    const cotizacion = await obtenerCotizacionCripto();
    const elementoValorUSDT = document.getElementById("valor-usdt");

    // Si no se pudo obtener la cotización, mostramos un error
    if (!cotizacion) {
        elementoValorUSDT.textContent = "USDT: Error de conexión";
        // Recorremos los IDs de los precios para mostrar el error en la tabla también
        const precios = {
            s25u: 1250, s25: 850, a56: 490, a55: 440, a36: 355, a16: 200,
            a54: 330, s23u: 580
        };
        for (const id in precios) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = "Error de conexión";
            }
        }
        return;
    }

    // Actualizamos el valor del Dólar Cripto en la página
    elementoValorUSDT.textContent = `Dólar Cripto: AR$ ${cotizacion.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    // Objeto con los precios en USDT de tus equipos
    const precios = {
        s25u: 1250, s25: 850, a56: 490, a55: 440, a36: 355, a16: 200,
        a54: 330, s23u: 580
    };

    // Recorremos el objeto de precios y actualizamos cada elemento
    for (const [id, usdt] of Object.entries(precios)) {
        const precioFinal = (usdt * cotizacion).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = precioFinal;
        }
    }
}

// Inicializamos la actualización de precios cuando la página carga
document.addEventListener("DOMContentLoaded", actualizarPrecios);

// Configuramos una actualización automática cada 5 minutos
setInterval(actualizarPrecios, 300000); // 300000 milisegundos = 5 minutos

// Objeto con los costos de financiamiento de Mercado Pago
// *** IMPORTANTE: DEBES ACTUALIZAR ESTOS VALORES CON LOS DE TU CUENTA ***

const costosFinanciacion = {
    '2': 12.0032, // Este es el valor que calculamos (9.92% + 21% de IVA)
    '3': 15.5485, // Ejemplo: 15.0% de recargo por 3 cuotas
    '6': 25.4826, // Ejemplo: 25.0% de recargo por 6 cuotas
    '9': 35.8402, // Ejemplo: 35.0% de recargo por 9 cuotas
    '12': 43.5479 // Ejemplo: 45.0% de recargo por 12 cuotas
};

// Función para calcular y mostrar las cuotas
function calcularCuotas(productoId) {
    // 1. Obtener el precio base en pesos
    const precioEnPesosTexto = document.getElementById(productoId).textContent;
    // Limpiamos el texto para obtener un número
    const precioBase = parseFloat(precioEnPesosTexto.replace('$', '').replace(/\./g, '').replace(',', '.'));
    
    // Si no hay un precio válido, salimos de la función
    if (isNaN(precioBase)) {
        document.getElementById('cuotas-container').innerHTML = `<p>Error: No se pudo obtener el precio del producto.</p>`;
        return;
    }

    let htmlCuotas = '';

    // 2. Iterar sobre los costos para cada plan de cuotas
    for (const cuotas in costosFinanciacion) {
        const porcentajeRecargo = costosFinanciacion[cuotas];
        const recargo = precioBase * (porcentajeRecargo / 100);
        const precioTotal = precioBase + recargo;
        const valorCuota = precioTotal / parseInt(cuotas);

        htmlCuotas += `
            <div class="s12 m6 l4">
                <div class="card padding">
                    <p class="h6">${cuotas} cuotas</p>
                    <p>Total: <b>AR$ ${precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></p>
                    <p>Cada cuota: <b>AR$ ${valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></p>
                </div>
            </div>
        `;
    }

    // 3. Insertar el HTML generado en el contenedor
    document.getElementById('cuotas-container').innerHTML = htmlCuotas;
}