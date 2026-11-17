ALTER TABLE leads ADD COLUMN IF NOT EXISTS customization jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS repair_orders (
  id bigserial PRIMARY KEY,
  source_lead_id bigint REFERENCES leads(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  device text NOT NULL,
  reported_problem text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  quoted_price numeric(12, 2),
  internal_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'recebido'
    CHECK (status IN ('recebido', 'em_reparo', 'pronto', 'entregue', 'cancelado')),
  received_at timestamptz NOT NULL DEFAULT now(),
  ready_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS repair_orders_status_updated_idx
  ON repair_orders(status, updated_at DESC);

