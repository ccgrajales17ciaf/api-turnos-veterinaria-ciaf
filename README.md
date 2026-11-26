# API REST por Capas — Clínica Veterinaria Huellas del Eje

Proyecto desarrollado para el **Taller Final de Arquitectura Cliente-Servidor** del programa **Profesional en Ingeniería de Software (CIAF)**. Implementa una API REST en **Node.js y Express** organizada estrictamente por capas (`index.js`, `routes/`, `controllers/`, `services/`) con persistencia en archivo JSON local (`data/turnos.json`) y regla de negocio parametrizada por equipo.

## Integrantes del Equipo (Grupo Jueves)

Ordenados alfabéticamente por apellido según el listado oficial de asistencia de la asignatura:

| N.º de Lista Oficial | Apellidos | Nombres |
| :---: | :--- | :--- |
| **2** | Arevalo Quimbay | Karoll Juliana |
| **11** | Grajales Castillo | Cristian Camilo |
| **17** | Moreno Alvarez | Alexander |

## Regla de Negocio Parametrizada (Parámetro N)

- **Valor de `N` asignado al equipo:** `N = 2` (corresponde al número de lista oficial del primer integrante al ordenar el equipo alfabéticamente por apellido: **Arevalo Quimbay, Karoll Juliana — #2**).
- **Porcentaje de recargo aplicable:**

**porcentajeRecargo = N × 2% = 2 × 2% = 4%**

- **Aplicación en la capa `services/turnos.service.js`:**
  - Si el turno enviado en `POST /api/turnos` incluye `"prioritario": true`:
    $$\text{totalPagar} = \text{precioBase} + \left(\text{precioBase} \times \frac{4}{100}\right)$$
    *Ejemplo real:* Para un servicio con `precioBase = 80000` y `prioritario = true`, el recargo es `80000 × 0.04 = 3200` y el `totalPagar` es **`83200`**.
  - Si `"prioritario"` es `false` o no se especifica:
    $$\text{totalPagar} = \text{precioBase}$$
    *Ejemplo real:* Para un servicio con `precioBase = 50000` y `prioritario = false`, el recargo es `0` y el `totalPagar` es **`50000`**.

## Caso de Negocio Elegido

- **Empresa / Servicio:** **Clínica Veterinaria Huellas del Eje**
- **Actividad principal:** Atención médica veterinaria integral para mascotas (consultas generales, vacunación, desparasitación, profilaxis dental, baño medicado y atención prioritaria de urgencias).
- **Datos requeridos por cada turno o solicitud:**

| Campo | Tipo | Obligatorio | Descripción |
| :--- | :--- | :---: | :--- |
| `nombreCliente` | `string` | Sí | Nombre completo del propietario de la mascota. |
| `nombreMascota` | `string` | Sí | Nombre de la mascota que recibirá el servicio. |
| `especie` | `string` | Sí | Especie de la mascota (ej. `Perro`, `Gato`, `Ave`). |
| `tipoServicio` | `string` | Sí | Servicio veterinario solicitado (ej. `Consulta general`, `Vacunación`). |
| `fechaHora` | `string` | Sí | Fecha y hora agendada para el turno (ej. `2026-11-28 10:30`). |
| `precioBase` | `number` | Sí | Tarifa base del servicio en COP (debe ser mayor a `0`). |
| `prioritario` | `boolean` | No | Indica si requiere atención prioritaria (`false` por defecto). |

El sistema calcula y agrega automáticamente en la capa de servicios los campos `id`, `porcentajeRecargo`, `valorRecargo`, `totalPagar` y `fechaRegistro`.

## Arquitectura por Capas

```text
api-turnos-veterinaria-ciaf/
├── index.js                         # Inicializa Express, middlewares (express.json), rutas y servidor
├── routes/
│   └── turnos.routes.js             # Define únicamente los endpoints y los asocia al controlador
├── controllers/
│   └── turnos.controller.js         # Gestiona req/res, valida datos de entrada y asigna códigos HTTP
├── services/
│   └── turnos.service.js            # Lógica de negocio, cálculo del recargo (N=2 -> 4%) y gestión de datos
├── data/
│   └── turnos.json                  # Almacenamiento local en formato JSON
├── package.json                     # Metadatos, scripts y dependencia de Express
├── .gitignore                       # Excluye node_modules/ y archivos temporales
└── README.md                        # Documentación del proyecto
```

## Instalación y Ejecución Local

1. Clonar el repositorio y entrar a la carpeta del proyecto:
   ```bash
   git clone [https://github.com/ccgrajales17ciaf/api-turnos-veterinaria-ciaf.git](https://github.com/ccgrajales17ciaf/api-turnos-veterinaria-ciaf.git)
   cd api-turnos-veterinaria-ciaf
   ```
2. Instalar las dependencias (Express):
   ```bash
   npm install
   ```
3. Iniciar el servidor:
   ```bash
   npm start
   ```
   El servidor quedará escuchando en `http://localhost:3000`.

## Endpoints Disponibles

| Método | Endpoint | Descripción | Códigos HTTP |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/turnos` | Retorna la lista completa de turnos registrados. | `200 OK` |
| `GET` | `/api/turnos/:id` | Retorna el detalle de un turno específico según su `id`. | `200 OK`, `404 Not Found` |
| `POST` | `/api/turnos` | Valida el cuerpo JSON, calcula el recargo (4% si es prioritario) y guarda el turno. | `201 Created`, `400 Bad Request` |

## Ejemplos de Pruebas JSON y Resultados Obtenidos

### 1. Caso Exitoso — `POST /api/turnos` con atención prioritaria (`201 Created`)

**Petición (`POST http://localhost:3000/api/turnos`):**
```json
{
  "nombreCliente": "Sofía Martínez",
  "nombreMascota": "Toby",
  "especie": "Perro",
  "tipoServicio": "Consulta de urgencia",
  "fechaHora": "2026-11-28 14:00",
  "precioBase": 100000,
  "prioritario": true
}
```

**Resultado obtenido (`201 Created`):**
```json
{
  "mensaje": "Turno registrado exitosamente.",
  "data": {
    "id": 3,
    "nombreCliente": "Sofía Martínez",
    "nombreMascota": "Toby",
    "especie": "Perro",
    "tipoServicio": "Consulta de urgencia",
    "fechaHora": "2026-11-28 14:00",
    "precioBase": 100000,
    "prioritario": true,
    "porcentajeRecargo": 4,
    "valorRecargo": 4000,
    "totalPagar": 104000,
    "fechaRegistro": "2026-11-26T20:15:00.000Z"
  }
}
```

*(Nota: Si se envía `"prioritario": false` o se omite el campo con `precioBase: 60000`, el servicio retorna `201 Created` con `porcentajeRecargo: 0`, `valorRecargo: 0` y `totalPagar: 60000`.)*

### 2. Caso de Error de Validación — `POST /api/turnos` (`400 Bad Request`)

**Petición (`POST http://localhost:3000/api/turnos`):**
```json
{
  "nombreCliente": "Andrés López",
  "nombreMascota": "",
  "tipoServicio": "Vacunación",
  "fechaHora": "2026-11-28 16:00",
  "precioBase": -15000,
  "prioritario": true
}
```

**Resultado obtenido (`400 Bad Request`):**
```json
{
  "error": "Error de validación",
  "mensaje": "Los datos enviados no cumplen con los requisitos obligatorios.",
  "detalles": [
    "El campo \"nombreMascota\" es obligatorio y debe ser una cadena de texto no vacía.",
    "El campo \"especie\" es obligatorio y debe ser una cadena de texto no vacía.",
    "El campo \"precioBase\" debe ser un valor numérico válido mayor a cero."
  ]
}
```

### 3. Consulta de ID Inexistente — `GET /api/turnos/999` (`404 Not Found`)

**Resultado obtenido (`404 Not Found`):**
```json
{
  "error": "Turno no encontrado",
  "mensaje": "No existe un turno registrado con el id 999."
}
```
