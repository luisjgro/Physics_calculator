/* Utilidades puras para sumar vectores 2D expresados en magnitud y dirección. */

var TOLERANCIA_NULO = 1e-9; // Umbral para considerar la resultante nula
var DECIMALES = 4; // Decimales usados solo al mostrar

// Convierte un ángulo en grados a radianes.
function gradosARadianes(grados) {
  return (grados * Math.PI) / 180;
}

// Devuelve las componentes Vx y Vy de un vector.
function calcularComponentes(magnitud, anguloGrados) {
  var rad = gradosARadianes(anguloGrados);
  return {
    vx: magnitud * Math.cos(rad),
    vy: magnitud * Math.sin(rad),
  };
}

// Normaliza un ángulo al rango [0, 360).
function normalizarAngulo(grados) {
  var normalizado = grados % 360;
  return normalizado < 0 ? normalizado + 360 : normalizado;
}

// Suma una lista de vectores { magnitud, angulo } y devuelve el resultante.
function sumarVectores(vectores) {
  var rx = 0;
  var ry = 0;

  // Acumula las componentes de todos los vectores.
  for (var i = 0; i < vectores.length; i++) {
    var componentes = calcularComponentes(
      vectores[i].magnitud,
      vectores[i].angulo
    );
    rx += componentes.vx;
    ry += componentes.vy;
  }

  var magnitud = Math.hypot(rx, ry);
  var esNulo =
    Math.abs(rx) < TOLERANCIA_NULO && Math.abs(ry) < TOLERANCIA_NULO;

  // atan2 devuelve el cuadrante correcto; se normaliza a 0°-360°.
  var direccion = esNulo
    ? null
    : normalizarAngulo((Math.atan2(ry, rx) * 180) / Math.PI);

  return { rx: rx, ry: ry, magnitud: magnitud, direccion: direccion, esNulo: esNulo };
}

// Redondea solo para mostrar y convierte -0 en 0.
function redondear(valor, decimales) {
  var cifras = decimales === undefined ? DECIMALES : decimales;
  var redondeado = Number(valor.toFixed(cifras));
  return Object.is(redondeado, -0) ? 0 : redondeado;
}

// Formatea un número con decimales fijos y sin "-0.0000".
function formatear(valor, decimales) {
  var cifras = decimales === undefined ? DECIMALES : decimales;
  return redondear(valor, cifras).toFixed(cifras);
}
