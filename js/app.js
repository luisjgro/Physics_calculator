/* Lógica principal: estado, validaciones y eventos de la interfaz. */

// Referencias a los elementos del DOM.
var entradaCantidad = document.getElementById('cantidad');
var errorCantidad = document.getElementById('error-cantidad');
var seccionFormulario = document.getElementById('seccion-formulario');
var filasVectores = document.getElementById('filas-vectores');
var seccionTabla = document.getElementById('seccion-tabla');
var seccionGrafico = document.getElementById('seccion-grafico');
var seccionResultado = document.getElementById('seccion-resultado');

var vectores = []; // Filas: { magnitud: texto, direccion: texto }
var errores = []; // Errores por fila y campo

// Valida que un campo no esté vacío y sea un número finito.
function validarNumero(valor, etiqueta) {
  if (!valor.trim()) return { error: etiqueta + ' es obligatoria.' };

  var numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return { error: etiqueta + ' debe ser un número.' };
  }

  return { valor: numero, error: '' };
}

// Oculta la tabla, el gráfico y el resultado.
function ocultarResultados() {
  seccionTabla.hidden = true;
  seccionGrafico.hidden = true;
  seccionResultado.hidden = true;
}

// Genera dinámicamente las filas según la cantidad indicada.
function generarFilas() {
  var texto = entradaCantidad.value;
  var numero = Number(texto);
  var valido =
    texto.trim() !== '' &&
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 20;

  if (!valido) {
    errorCantidad.textContent = 'Introduce un número entero entre 1 y 20.';
    return;
  }

  errorCantidad.textContent = '';
  vectores = Array.from({ length: numero }, function () {
    return { magnitud: '', direccion: '' };
  });
  errores = Array.from({ length: numero }, function () {
    return {};
  });

  renderFormulario(vectores);
  mostrarErrores(errores);
  seccionFormulario.hidden = false;
  ocultarResultados();
}

// Actualiza el estado al escribir en un campo y limpia su error.
function alEscribir(evento) {
  var input = evento.target;
  if (!input.dataset.campo) return;

  var indice = Number(input.dataset.indice);
  var campo = input.dataset.campo;
  vectores[indice][campo] = input.value;

  var span = document.getElementById('error-' + campo + '-' + indice);
  if (span) span.textContent = '';
}

// Valida todas las filas y calcula la suma si no hay errores.
function calcular() {
  var nuevosErrores = vectores.map(function () {
    return {};
  });
  var hayErrores = false;

  var datos = vectores.map(function (vector, i) {
    var magnitud = validarNumero(vector.magnitud, 'La magnitud');
    var direccion = validarNumero(vector.direccion, 'La dirección');

    if (magnitud.error) {
      nuevosErrores[i].magnitud = magnitud.error;
      hayErrores = true;
    } else if (magnitud.valor < 0) {
      nuevosErrores[i].magnitud = 'La magnitud no puede ser negativa.';
      hayErrores = true;
    }

    if (direccion.error) {
      nuevosErrores[i].direccion = direccion.error;
      hayErrores = true;
    }

    return { magnitud: magnitud.valor, angulo: direccion.valor };
  });

  errores = nuevosErrores;
  mostrarErrores(errores);

  if (hayErrores) {
    ocultarResultados();
    return;
  }

  // Calcula las componentes de cada vector para la tabla.
  var filas = datos.map(function (dato, i) {
    var componentes = calcularComponentes(dato.magnitud, dato.angulo);
    return {
      numero: i + 1,
      magnitud: dato.magnitud,
      angulo: dato.angulo,
      vx: componentes.vx,
      vy: componentes.vy,
    };
  });

  var resultado = sumarVectores(datos);

  renderTabla(filas);
  renderGrafico(filas, resultado);
  renderResultado(resultado);

  seccionTabla.hidden = false;
  seccionGrafico.hidden = false;
  seccionResultado.hidden = false;
}

// Reinicia toda la interfaz.
function limpiar() {
  entradaCantidad.value = '';
  errorCantidad.textContent = '';
  vectores = [];
  errores = [];
  filasVectores.innerHTML = '';
  seccionFormulario.hidden = true;
  ocultarResultados();
}

// Asocia los eventos de la interfaz.
document.getElementById('btn-generar').addEventListener('click', generarFilas);
document.getElementById('btn-calcular').addEventListener('click', calcular);
document.getElementById('btn-limpiar').addEventListener('click', limpiar);
filasVectores.addEventListener('input', alEscribir);

// Permite generar las filas presionando Enter en el campo de cantidad.
entradaCantidad.addEventListener('keydown', function (evento) {
  if (evento.key === 'Enter') generarFilas();
});
