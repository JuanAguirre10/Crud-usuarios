require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DB ─────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── Helpers ────────────────────────────────────────────────
const query = (text, params) => pool.query(text, params);

// ── Init tabla ─────────────────────────────────────────────
async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id         SERIAL PRIMARY KEY,
      nombre     VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      rol        VARCHAR(50)  NOT NULL DEFAULT 'user',
      activo     BOOLEAN      NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ Tabla usuarios lista');
}

// ══════════════════════════════════════════════════════════
//  RUTAS CRUD
// ══════════════════════════════════════════════════════════

// GET /api/usuarios  — listar todos
app.get('/api/usuarios', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM usuarios ORDER BY created_at DESC'
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/usuarios/:id  — obtener uno
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/usuarios  — crear
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, rol = 'user', activo = true } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ ok: false, error: 'nombre y email son requeridos' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO usuarios (nombre, email, rol, activo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, email, rol, activo]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'El email ya está registrado' });
    }
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/usuarios/:id  — actualizar
app.put('/api/usuarios/:id', async (req, res) => {
  const { nombre, email, rol, activo } = req.body;
  try {
    const { rows } = await query(
      `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           email  = COALESCE($2, email),
           rol    = COALESCE($3, rol),
           activo = COALESCE($4, activo)
       WHERE id = $5 RETURNING *`,
      [nombre, email, rol, activo, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/usuarios/:id  — eliminar
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Fallback → frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}).catch(err => {
  console.error('Error conectando a la BD:', err);
  process.exit(1);
});
