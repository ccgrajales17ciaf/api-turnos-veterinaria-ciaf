const express = require('express');
const turnosRoutes = require('./routes/turnos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar cuerpos JSON
app.use(express.json());

// Manejo de errores de sintaxis en JSON malformado (evita error 500)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON malformado',
      mensaje: 'El cuerpo de la petición no contiene un JSON válido.'
    });
  }
  return next(err);
});

// Rutas principales de la API
app.use('/api/turnos', turnosRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `El endpoint ${req.method} ${req.originalUrl} no existe en esta API.`
  });
});

// Inicio del servidor (solo si se ejecuta directamente)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de Clínica Veterinaria Huellas del Eje escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
