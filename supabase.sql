CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  rol        VARCHAR(50)  NOT NULL DEFAULT 'user',
  activo     BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO usuarios (nombre, email, rol) VALUES
  ('Juan Aguirre', 'juan@ejemplo.com', 'admin'),
  ('Ana García',   'ana@ejemplo.com',  'user'),
  ('Luis Torres',  'luis@ejemplo.com', 'user')
ON CONFLICT (email) DO NOTHING;
