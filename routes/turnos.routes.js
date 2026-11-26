const express = require('express');
const turnosController = require('../controllers/turnos.controller');

const router = express.Router();

// GET /api/turnos -> Lista completa de turnos
router.get('/', turnosController.listarTurnos);

// GET /api/turnos/:id -> Consulta de un turno específico por identificador
router.get('/:id', turnosController.obtenerTurnoPorId);

// POST /api/turnos -> Registro de un nuevo turno con cálculo de tarifa
router.post('/', turnosController.crearTurno);

module.exports = router;
