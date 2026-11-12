/* Componentes de la interfaz: generan y actualizan el DOM con JavaScript básico. */

// Colores distintos para cada vector; el resultante usa un color propio.
var PALETA = [
  '#5b8cff',
  '#22d3ee',
  '#34d399',
  '#f472b6',
  '#fbbf24',
  '#a78bfa',
  '#fb7185',
  '#4ade80',
  '#38bdf8',
  '#facc15',
];
var COLOR_RESULTANTE = '#f8fafc';

var ANCHO = 600;
var ALTO = 600;
var MARGEN = 48;
var CENTRO_X = ANCHO / 2;
var CENTRO_Y = ALTO / 2;
var RADIO_UTIL = Math.min(ANCHO, ALTO) / 2 - MARGEN;

// Dibuja una fila de entrada por cada vector.
function renderFormulario(vectores) {
  var contenedor = document.getElementById('filas-vectores');

  contenedor.innerHTML = vectores
    .map(function (_vector, i) {
      return (
        '<div class="vector-row">' +
        '<span class="vector-num">Vector ' + (i + 1) + '</span>' +
        '<div class="field">' +
        '<label for="magnitud-' + i + '">Magnitud</label>' +
        '<input id="magnitud-' + i + '" data-indice="' + i + '" data-campo="magnitud" type="text" inputmode="text" autocomplete="off" placeholder="Ej. 10" />' +
        '<span class="error" id="error-magnitud-' + i + '"></span>' +
        '</div>' +
        '<div class="field">' +
        '<label for="direccion-' + i + '">Dirección (°)</label>' +
        '<input id="direccion-' + i + '" data-indice="' + i + '" data-campo="direccion" type="text" inputmode="text" autocomplete="off" placeholder="Ej. 30" />' +
        '<span class="error" id="error-direccion-' + i + '"></span>' +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

// Muestra los mensajes de error junto a cada campo.
function mostrarErrores(errores) {
  errores.forEach(function (fila, i) {
    var errorMagnitud = document.getElementById('error-magnitud-' + i);
    var errorDireccion = document.getElementById('error-direccion-' + i);

    if (errorMagnitud) errorMagnitud.textContent = fila.magnitud || '';
    if (errorDireccion) errorDireccion.textContent = fila.direccion || '';
  });
}

// Rellena la tabla con las componentes de cada vector.
function renderTabla(filas) {
  var cuerpo = document.getElementById('tabla-cuerpo');

  cuerpo.innerHTML = filas
    .map(function (fila) {
      return (
        '<tr>' +
        '<td>' + fila.numero + '</td>' +
        '<td>' + formatear(fila.magnitud) + '</td>' +
        '<td>' + formatear(fila.angulo) + '</td>' +
        '<td>' + formatear(fila.vx) + '</td>' +
        '<td>' + formatear(fila.vy) + '</td>' +
        '</tr>'
      );
    })
    .join('');
}

// Rellena el bloque destacado con los resultados finales.
function renderResultado(resultado) {
  document.getElementById('res-rx').textContent = formatear(resultado.rx);
  document.getElementById('res-ry').textContent = formatear(resultado.ry);
  document.getElementById('res-magnitud').textContent = formatear(
    resultado.magnitud
  );
  document.getElementById('res-direccion').textContent = resultado.esNulo
    ? 'No definida'
    : formatear(resultado.direccion) + '°';
  document.getElementById('res-nulo').hidden = !resultado.esNulo;
}

// Dibuja el gráfico SVG y su leyenda.
function renderGrafico(filas, resultado) {
  // Escala automática: el vector de mayor magnitud ocupa el radio útil.
  var magnitudes = filas.map(function (fila) {
    return fila.magnitud;
  });
  magnitudes.push(resultado.magnitud);

  var magnitudMayor = Math.max.apply(null, magnitudes);
  var escala = magnitudMayor > 0 ? RADIO_UTIL / magnitudMayor : 1;

  // Convierte coordenadas matemáticas a SVG (eje Y invertido).
  function aSvg(vx, vy) {
    return {
      x: CENTRO_X + vx * escala,
      y: CENTRO_Y - vy * escala,
    };
  }

  // Una punta de flecha por color de vector.
  var marcadores = filas
    .map(function (_fila, i) {
      return (
        '<marker id="flecha-vector-' + i + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + PALETA[i % PALETA.length] + '" />' +
        '</marker>'
      );
    })
    .join('');

  // Líneas de cada vector.
  var lineas = filas
    .map(function (fila, i) {
      var fin = aSvg(fila.vx, fila.vy);
      return (
        '<line x1="' + CENTRO_X + '" y1="' + CENTRO_Y + '" x2="' + fin.x + '" y2="' + fin.y + '" ' +
        'stroke="' + PALETA[i % PALETA.length] + '" stroke-width="2.5" ' +
        'marker-end="url(#flecha-vector-' + i + ')" />'
      );
    })
    .join('');

  // Vector resultante (solo si no es nulo).
  var lineaResultado = '';
  if (!resultado.esNulo) {
    var finResultado = aSvg(resultado.rx, resultado.ry);
    lineaResultado =
      '<line x1="' + CENTRO_X + '" y1="' + CENTRO_Y + '" x2="' + finResultado.x + '" y2="' + finResultado.y + '" ' +
      'stroke="' + COLOR_RESULTANTE + '" stroke-width="4" ' +
      'marker-end="url(#flecha-resultante)" />';
  }

  document.getElementById('grafico-contenedor').innerHTML =
    '<svg viewBox="0 0 ' + ANCHO + ' ' + ALTO + '" class="grafico" role="img" aria-label="Gráfico de vectores y resultante">' +
    '<defs>' +
    marcadores +
    '<marker id="flecha-resultante" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
    '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + COLOR_RESULTANTE + '" />' +
    '</marker>' +
    '</defs>' +
    // Ejes X e Y
    '<line x1="' + MARGEN / 2 + '" y1="' + CENTRO_Y + '" x2="' + (ANCHO - MARGEN / 2) + '" y2="' + CENTRO_Y + '" class="eje" />' +
    '<line x1="' + CENTRO_X + '" y1="' + (ALTO - MARGEN / 2) + '" x2="' + CENTRO_X + '" y2="' + MARGEN / 2 + '" class="eje" />' +
    '<text x="' + (ANCHO - MARGEN / 2) + '" y="' + (CENTRO_Y - 10) + '" class="eje-label" text-anchor="end">X</text>' +
    '<text x="' + (CENTRO_X + 10) + '" y="' + (MARGEN / 2 + 8) + '" class="eje-label">Y</text>' +
    lineas +
    lineaResultado +
    '<circle cx="' + CENTRO_X + '" cy="' + CENTRO_Y + '" r="4" class="origen" />' +
    '</svg>';

  // Leyenda de colores.
  var itemsVectores = filas
    .map(function (fila, i) {
      return (
        '<li>' +
        '<span class="swatch" style="background:' + PALETA[i % PALETA.length] + '"></span>' +
        'Vector ' + (i + 1) + ': magnitud ' + formatear(fila.magnitud, 2) + ', ángulo ' + formatear(fila.angulo, 2) + '°' +
        '</li>'
      );
    })
    .join('');

  var direccionResultado = resultado.esNulo
    ? '—'
    : formatear(resultado.direccion, 2) + '°';

  document.getElementById('leyenda').innerHTML =
    itemsVectores +
    '<li>' +
    '<span class="swatch" style="background:' + COLOR_RESULTANTE + '"></span>' +
    'Resultante: magnitud ' + formatear(resultado.magnitud, 2) + ', ángulo ' + direccionResultado +
    '</li>';
}
