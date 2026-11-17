-- Mural #SouCliente: fotos de clientes autorizadas, a prova social que a loja
-- já produz no Instagram. Separado de testimonials porque foto e depoimento têm
-- ciclos diferentes: a foto chega no mesmo dia da compra, o texto raramente vem.
CREATE TABLE IF NOT EXISTS customer_photos (
  id bigserial PRIMARY KEY,
  image_url text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_photos_order ON customer_photos (sort_order, id);
