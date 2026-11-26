const turnosService = require('../services/turnos.service');

/**
 * GET /api/turnos
 * Retorna la lista completa de turnos almacenados (200 OK).
 */
function listarTurnos(req, res) {
  try {
    const turnos = turnosService.obtenerTodosLosTurnos();
    return res.status(200).json({
      totalRegistros: turnos.length,
      data: turnos
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No fue posible consultar la lista de turnos.'
    });
  }
}

/**
 * GET /api/turnos/:id
 * Retorna un turno específico por su ID (200 OK) o 404 Not Found si no existe.
 */
function obtenerTurnoPorId(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({
        error: 'Turno no encontrado',
        mensaje: `No existe un turno registrado con el id '${req.params.id}'.`
      });
    }

    const turno = turnosService.obtenerTurnoPorId(id);

    if (!turno) {
      return res.status(404).json({
        error: 'Turno no encontrado',
        mensaje: `No existe un turno registrado con el id ${id}.`
      });
    }

    return res.status(200).json({
      data: turno
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No fue posible consultar el turno solicitado.'
    });
  }
}

/**
 * POST /api/turnos
 * Valida los datos de entrada, delega la creación y cálculo de tarifa al servicio
 * y retorna el objeto creado (201 Created) o errores de validación (400 Bad Request).
 */
function crearTurno(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'Solicitud inválida',
        mensaje: 'El cuerpo de la petición debe ser un objeto JSON con los datos del turno.'
      });
    }

    const {
      nombreCliente,
      nombreMascota,
      especie,
      tipoServicio,
      fechaHora,
      precioBase,
      prioritario
    } = req.body;

    const errores = [];

    // Validación de campos de texto obligatorios
    if (typeof nombreCliente !== 'string' || nombreCliente.trim() === '') {
      errores.push('El campo "nombreCliente" es obligatorio y debe ser una cadena de texto no vacía.');
    }

    if (typeof nombreMascota !== 'string' || nombreMascota.trim() === '') {
      errores.push('El campo "nombreMascota" es obligatorio y debe ser una cadena de texto no vacía.');
    }

    if (typeof especie !== 'string' || especie.trim() === '') {
      errores.push('El campo "especie" es obligatorio y debe ser una cadena de texto no vacía.');
    }

    if (typeof tipoServicio !== 'string' || tipoServicio.trim() === '') {
      errores.push('El campo "tipoServicio" es obligatorio y debe ser una cadena de texto no vacía.');
    }

    if (typeof fechaHora !== 'string' || fechaHora.trim() === '') {
      errores.push('El campo "fechaHora" es obligatorio y debe ser una cadena de texto no vacía.');
    }

    // Validación de precioBase (numérico y mayor a cero)
    if (precioBase === undefined || precioBase === null) {
      errores.push('El campo "precioBase" es obligatorio.');
    } else if (typeof precioBase !== 'number' || !Number.isFinite(precioBase) || precioBase <= 0) {
      errores.push('El campo "precioBase" debe ser un valor numérico válido mayor a cero.');
    }

    // Validación de prioritario (opcional, pero si se envía debe ser booleano)
    if (prioritario !== undefined && typeof prioritario !== 'boolean') {
      errores.push('El campo "prioritario" debe ser un valor booleano (true o false).');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Error de validación',
        mensaje: 'Los datos enviados no cumplen con los requisitos obligatorios.',
        detalles: errores
      });
    }

    const nuevoTurno = turnosService.registrarTurno({
      nombreCliente: nombreCliente.trim(),
      nombreMascota: nombreMascota.trim(),
      especie: especie.trim(),
      tipoServicio: tipoServicio.trim(),
      fechaHora: fechaHora.trim(),
      precioBase,
      prioritario: prioritario === true
    });

    return res.status(201).json({
      mensaje: 'Turno registrado exitosamente.',
      data: nuevoTurno
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No fue posible registrar el turno.'
    });
  }
}

module.exports = {
  listarTurnos,
  obtenerTurnoPorId,
  crearTurno
};
