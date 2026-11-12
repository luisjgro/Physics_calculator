/* Pruebas básicas de las utilidades de vectores (sin dependencias). */

var resultados = [];
var fallos = 0;

// Comprueba si un número está dentro de una tolerancia.
function cerca(actual, esperado, tolerancia) {
  var margen = tolerancia === undefined ? 0.0001 : tolerancia;
  return Math.abs(actual - esperado) <= margen;
}

// Registra el resultado de una comprobación.
function comprobar(nombre, condicion) {
  resultados.push({ nombre: nombre, ok: Boolean(condicion) });
  if (!condicion) fallos++;
}

// Caso 1: un vector de magnitud 10 a 30°.
var c1 = calcularComponentes(10, 30);
comprobar('10 a 30° → Vx ≈ 8.6603', cerca(c1.vx, 8.6603, 0.00005));
comprobar('10 a 30° → Vy ≈ 5', cerca(c1.vy, 5));

// Caso 2: dos vectores iguales y opuestos.
var r2 = sumarVectores([
  { magnitud: 10, angulo: 0 },
  { magnitud: 10, angulo: 180 },
]);
comprobar('Vectores opuestos → resultante nula', r2.esNulo && cerca(r2.magnitud, 0));
comprobar('Resultante nula → dirección no definida', r2.direccion === null);

// Caso 3: dos vectores de 5 a 0° y 5 a 90°.
var r3 = sumarVectores([
  { magnitud: 5, angulo: 0 },
  { magnitud: 5, angulo: 90 },
]);
comprobar('5@0° + 5@90° → R ≈ 7.0711', cerca(r3.magnitud, 7.0711, 0.00005));
comprobar('5@0° + 5@90° → θ = 45°', cerca(r3.direccion, 45));

// Caso 4: tercer cuadrante.
var r4 = sumarVectores([
  { magnitud: 3, angulo: 180 },
  { magnitud: 4, angulo: 270 },
]);
comprobar('3@180° + 4@270° → θ ≈ 233.13°', cerca(r4.direccion, 233.13, 0.005));

// Cuadrantes 2 y 4.
var r5 = sumarVectores([{ magnitud: 10, angulo: 135 }]);
comprobar('10 a 135° → segundo cuadrante', cerca(r5.direccion, 135));

var r6 = sumarVectores([{ magnitud: 10, angulo: 315 }]);
comprobar('10 a 315° → cuarto cuadrante', cerca(r6.direccion, 315));

// Normalización de ángulos y formato de números.
comprobar('Normaliza -90° a 270°', normalizarAngulo(-90) === 270);
comprobar('Normaliza 450° a 90°', normalizarAngulo(450) === 90);
comprobar('Redondea a 4 decimales', formatear(8.660254) === '8.6603');
comprobar('Evita mostrar -0.0000', formatear(-0.00001) === '0.0000');

// Muestra los resultados en la página.
var lista = document.getElementById('resultados');
lista.innerHTML = resultados
  .map(function (resultado) {
    return (
      '<li class="' + (resultado.ok ? 'ok' : 'error') + '">' +
      (resultado.ok ? '✓' : '✗') + ' ' + resultado.nombre +
      '</li>'
    );
  })
  .join('');

document.getElementById('resumen').textContent =
  resultados.length - fallos + ' de ' + resultados.length + ' pruebas pasaron.';
