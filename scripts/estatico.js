/**
 * Gera a vitrine estática em dist/ para hospedagem sem servidor (Netlify).
 * shortcut: carrinho, orçamento e painel dependem da API e não funcionam aqui; para o site completo use o render.yaml.
 */
const fs = require('node:fs');
const path = require('node:path');
const { prepararApp } = require('./preview');

const PAGINAS = ['/', '/vitrine', '/assistencia-tecnica', '/a-loja', '/garantia', '/pagamento', '/entrega', '/carrinho'];
const dist = path.join(__dirname, '../dist');

(async () => {
  const { app } = await prepararApp();
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((ok) => servidor.once('listening', ok));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  try {
    fs.rmSync(dist, { recursive: true, force: true });
    fs.cpSync(path.join(__dirname, '../public'), dist, { recursive: true });
    for (const pagina of PAGINAS) {
      const resp = await fetch(base + pagina);
      if (!resp.ok) throw new Error(`${pagina} respondeu ${resp.status}`);
      // /vitrine -> vitrine.html: o Netlify serve sem redirecionar para barra final.
      fs.writeFileSync(path.join(dist, pagina === '/' ? 'index.html' : `${pagina.slice(1)}.html`), await resp.text());
    }
    console.log(`${PAGINAS.length} páginas geradas em dist/`);
  } finally {
    servidor.close();
  }
})().catch((err) => { console.error(err); process.exitCode = 1; });
