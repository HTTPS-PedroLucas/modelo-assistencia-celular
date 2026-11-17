ALTER TABLE products
  ADD COLUMN IF NOT EXISTS condition text;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_condition_check;
ALTER TABLE products
  ADD CONSTRAINT products_condition_check CHECK (condition IS NULL OR condition IN ('novo', 'seminovo'));

CREATE TABLE IF NOT EXISTS campaigns (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Ver ofertas',
  cta_url text NOT NULL DEFAULT '/vitrine',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_type_check;
ALTER TABLE leads
  ADD CONSTRAINT leads_type_check CHECK (type IN ('orcamento', 'pedido', 'personalizacao'));

ALTER TABLE leads ADD COLUMN IF NOT EXISTS order_items jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_total numeric(12, 2);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_order_items_check;
ALTER TABLE leads
  ADD CONSTRAINT leads_order_items_check CHECK (jsonb_typeof(order_items) = 'array');

