const { e, sigla, whatsapp } = require('../lib/helpers');
const { icon } = require('./icons');

const NAV = [
  { href: '/', rotulo: 'Início' },
  { href: '/vitrine', rotulo: 'Catálogo' },
  { href: '/assistencia-tecnica', rotulo: 'Assistência' },

  { href: '/a-loja', rotulo: 'A loja' },
  { href: '/#como-chegar', rotulo: 'Onde estamos' }
];

function structuredStore(config) {
  return {
    '@context': 'https://schema.org', '@type': 'ElectronicsStore', name: config.nome,
    description: config.propostaValor, telephone: `+${config.whatsapp}`,
    address: {
      '@type': 'PostalAddress', streetAddress: config.endereco, addressLocality: config.cidade,
      addressRegion: config.estado, postalCode: config.cep, addressCountry: 'BR'
    },
    sameAs: config.instagram ? [`https://www.instagram.com/${config.instagram}/`] : []
  };
}

/** Assinatura tipográfica gerada do nome cadastrado no painel: troque por <img> quando a loja tiver logo. */
function logoMarkup(config) {
  return `<span class="loja-logo"><span class="loja-logo__selo" aria-hidden="true">${e(sigla(config.nome))}</span>${e(config.nome)}</span>`;
}

function layout({ titulo, descricao, conteudo, ativo = '', config, horarios = [], jsonLd = [], canonical = '/' }) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');
  const canonicalUrl = base ? `${base}${canonical}` : canonical;
  const waHome = whatsapp(config.whatsapp, `Olá, ${config.nome}! Vim pelo site e preciso de ajuda.`);
  const schemas = [structuredStore(config), ...jsonLd];
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#111112">
${!config.conteudoValidado ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta name="description" content="${e(descricao)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${e(config.nome)}">
<meta property="og:title" content="${e(titulo)}">
<meta property="og:description" content="${e(descricao)}">
<meta property="og:url" content="${e(canonicalUrl)}">
<meta name="twitter:card" content="summary">
<title>${e(titulo)}</title>
<link rel="canonical" href="${e(canonicalUrl)}">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap">
<script>document.documentElement.classList.add('anim')</script>
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/tema.css">
${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="site-publico">
<a class="pular-para-conteudo" href="#conteudo">Pular para o conteúdo</a>
<header class="cabecalho" id="cabecalho">
  <div class="container cabecalho__barra">
    <a class="logo" href="/" aria-label="${e(config.nome)} — início">${logoMarkup(config)}</a>
    <button class="nav-toggle" id="navToggle" type="button" aria-controls="navPrincipal" aria-expanded="false" aria-label="Abrir menu">${icon('menu')}</button>
    <nav class="nav" id="navPrincipal" aria-label="Navegação principal">
      <ul class="nav__lista">${NAV.map((item) => `<li><a class="nav__link" href="${item.href}"${ativo === item.href ? ' aria-current="page"' : ''}>${item.rotulo}</a></li>`).join('')}</ul>
    </nav>
    <a class="carrinho-link" href="/carrinho" aria-label="Abrir carrinho">${icon('caixa')}<span>Carrinho</span><b data-cart-count>0</b></a>
  </div>
</header>
<main id="conteudo">${conteudo}</main>
<footer class="rodape">
  <div class="container rodape__grid">
    <div><a class="logo logo--rodape" href="/">${logoMarkup(config)}</a><p>${e(config.propostaValor)}</p></div>
    <div><h2>Visite a loja</h2><p>${e(config.endereco)}<br>${e(config.bairro)} — ${e(config.cidade)}/${e(config.estado)}</p></div>
    <div><h2>Atendimento</h2>${horarios.map((h) => `<p><strong>${e(h.dia)}:</strong> ${e(h.hora)}</p>`).join('')}</div>
    <div><h2>Links úteis</h2><p><a href="/pagamento">Pagamento</a> · <a href="/garantia">Garantia</a> · <a href="/entrega">Entrega</a></p>${config.instagram ? `<p><a href="https://instagram.com/${e(config.instagram)}" rel="noopener">@${e(config.instagram)}</a></p>` : `<p><a href="${waHome}">${e(config.whatsappExibicao)}</a></p>`}</div>
  </div>
  <div class="container rodape__base"><span>© ${new Date().getFullYear()} ${e(config.nome)}</span><a href="/admin" rel="nofollow">Administração</a></div>
</footer>
<a class="whatsapp-flutuante" href="${waHome}" rel="noopener" aria-label="Falar com a ${e(config.nome)} no WhatsApp">${icon('whatsapp')}<span>WhatsApp</span></a>
<div class="toast-site" id="toastSite" role="status" aria-live="polite" hidden></div>
<script src="/js/site.js" defer></script>
</body>
</html>`;
}

module.exports = { layout, logoMarkup };
