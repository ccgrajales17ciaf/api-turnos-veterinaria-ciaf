const fs = require('fs');
const path = require('path');

/**
 * Regla de negocio parametrizada por equipo:
 * Integrantes (Grupo jueves, ordenados alfabéticamente por apellido):
 *  1. #2  - Arevalo Quimbay, Karoll Juliana  -> Primer integrante: N = 2
 *  2. #11 - Grajales Castillo, Cristian Camilo
 *  3. #17 - Moreno Alvarez, Alexander
 *
 * porcentajeRecargo = N * 2% = 2 * 2% = 4%
 */
const PARAMETRO_N = 2;
const PORCENTAJE_RECARGO_EQUIPO = PARAMETRO_N * 2; // 4%

const DATA_FILE = path.join(__dirname, '..', 'data', 'turnos.json');

/**
 * Asegura que el archivo local JSON exista antes de leer o escribir.
 */
function asegurarArchivoDatos() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

/**
 * Lee todos los turnos almacenados en el archivo JSON local.
 */
function leerTurnos() {
  asegurarArchivoDatos();
  const contenido = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(contenido);
}

/**
 * Persiste el arreglo de turnos en el archivo JSON local.
 */
function guardarTurnos(turnos) {
  asegurarArchivoDatos();
  fs.writeFileSync(DATA_FILE, JSON.stringify(turnos, null, 2), 'utf8');
}

/**
 * Redondea un número a 2 decimales para evitar imprecisiones de punto flotante.
 */
function redondearDosDecimales(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula la tarifa final aplicando la regla de negocio del equipo (N = 2 -> 4%).
 * Si prioritario es true:
 *   totalPagar = precioBase + (precioBase * (porcentajeRecargo / 100))
 * Si prioritario es false o no se especifica:
 *   totalPagar = precioBase
 */
function calcularTarifa(precioBase, prioritario) {
  if (prioritario === true) {
    const valorRecargo = redondearDosDecimales(precioBase * (PORCENTAJE_RECARGO_EQUIPO / 100));
    const totalPagar = redondearDosDecimales(precioBase + valorRecargo);
    return {
      porcentajeRecargo: PORCENTAJE_RECARGO_EQUIPO,
      valorRecargo,
      totalPagar
    };
  }

  return {
    porcentajeRecargo: 0,
    valorRecargo: 0,
    totalPagar: redondearDosDecimales(precioBase)
  };
}

/**
 * Retorna la lista completa de turnos almacenados.
 */
function obtenerTodosLosTurnos() {
  return leerTurnos();
}

/**
 * Busca y retorna un turno por su identificador numérico, o null si no existe.
 */
function obtenerTurnoPorId(id) {
  const turnos = leerTurnos();
  return turnos.find((turno) => turno.id === id) || null;
}

/**
 * Registra un nuevo turno aplicando el cálculo de tarifa y lo persiste en data/turnos.json.
 */
function registrarTurno(datosTurno) {
  const turnos = leerTurnos();
  const siguienteId = turnos.length > 0
    ? Math.max(...turnos.map((t) => t.id)) + 1
    : 1;

  const esPrioritario = datosTurno.prioritario === true;
  const calculo = calcularTarifa(datosTurno.precioBase, esPrioritario);

  const nuevoTurno = {
    id: siguienteId,
    nombreCliente: datosTurno.nombreCliente,
    nombreMascota: datosTurno.nombreMascota,
    especie: datosTurno.especie,
    tipoServicio: datosTurno.tipoServicio,
    fechaHora: datosTurno.fechaHora,
    precioBase: datosTurno.precioBase,
    prioritario: esPrioritario,
    porcentajeRecargo: calculo.porcentajeRecargo,
    valorRecargo: calculo.valorRecargo,
    totalPagar: calculo.totalPagar,
    fechaRegistro: new Date().toISOString()
  };

  turnos.push(nuevoTurno);
  guardarTurnos(turnos);

  return nuevoTurno;
}

module.exports = {
  PARAMETRO_N,
  PORCENTAJE_RECARGO_EQUIPO,
  calcularTarifa,
  obtenerTodosLosTurnos,
  obtenerTurnoPorId,
  registrarTurno
};
