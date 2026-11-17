-- Banco exclusivo da Sua Cell.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_type_check;
ALTER TABLE leads ADD CONSTRAINT suacell_lead_type CHECK (type IN ('pedido', 'orcamento'));
CREATE UNIQUE INDEX IF NOT EXISTS suacell_product_slug_unique ON products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS suacell_repair_source_unique ON repair_orders(source_lead_id);
