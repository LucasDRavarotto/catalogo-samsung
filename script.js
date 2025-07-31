// Función asíncrona para obtener la cotización del USDT
async function obtenerCotizacionUSDT() {
    try {
        const respuesta = await fetch("https://criptoya.com/api/lemoncash/usdt/ars");
        const datos = await respuesta.json();
        return datos.totalAsk;
    } catch (error) {
        console.error("Error al obtener la cotización del USDT:", error);
        return null; // Devuelve null en caso de error
    }
}

// Función para actualizar todos los precios en la tabla
async function actualizarPrecios() {
    const cotizacion = await obtenerCotizacionUSDT();
    const elementoValorUSDT = document.getElementById("valor-usdt");
    
    // Si no se pudo obtener la cotización, mostramos un error
    if (!cotizacion) {
        elementoValorUSDT.textContent = "USDT: Error de conexión";
        for (const id in precios) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = "Error de conexión";
            }
        }
        return; // Salimos de la función
    }

    // Actualizamos el valor del USDT en la página
    elementoValorUSDT.textContent = `USDT: AR$ ${cotizacion.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    // Recorremos el objeto de precios y actualizamos cada elemento
    const precios = {
        s25u: 1250, s25: 850, a56: 490, a55: 440, a36: 355, a16: 200,
        a54: 330, s23u: 580
    };

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
// 5 minutos = 5 * 60 * 1000 milisegundos = 300000
setInterval(actualizarPrecios, 300000);