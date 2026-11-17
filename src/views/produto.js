const { e, money } = require('../lib/helpers');
const { icon } = require('./icons');
const { layout } = require('./layout');
const { imagemOu } = require('./components');

function produtoPagina(db, produto) {
  const { config, pagamento, categorias } = db;
  const categoria = categorias.find((c) => c.slug === produto.categoria);
  const conteudo = `<section class="secao"><div class="container produto-detalhe">
    <div class="produto-detalhe__midia">${imagemOu(produto.imagem, produto.nome, 'Adicione a foto real deste produto no painel', ' width="900" height="900"')}</div>
    <div class="produto-detalhe__info">
      <p class="rotulo">${e(categoria?.nome || produto.categoria)} · ${e(produto.marca)}</p>
      <h1>${e(produto.nome)}</h1>
      <div class="produto-detalhe__selos">
        <span class="selo ${produto.disponibilidade === 'estoque' ? 'selo--estoque' : 'selo--encomenda'}">${produto.disponibilidade === 'estoque' ? 'Em estoque' : 'Sob encomenda'}</span>
        ${produto.condicao ? `<span class="selo selo--condicao">${produto.condicao === 'novo' ? 'Novo' : 'Seminovo'}</span>` : ''}
      </div>
      <p class="lead">${e(produto.descricao)}</p>
      ${produto.ficha?.length ? `<ul class="ficha ficha--detalhe">${produto.ficha.map((item) => `<li>${icon('check')}<span>${e(item)}</span></li>`).join('')}</ul>` : ''}
      <div class="preco preco--detalhe">${produto.precoAntigo ? `<p class="preco__antigo">De ${money(produto.precoAntigo)}</p>` : ''}<p class="preco__valor">${money(produto.preco)}</p><p class="preco__parcela">${produto.parcelas > 1 ? `Em até ${Math.min(produto.parcelas, pagamento.maxParcelas || 1)}x; consulte as condições.` : 'Consulte as condições de pagamento com a equipe.'}</p></div>
      <div class="hero__acoes"><button class="btn btn--primario" type="button" data-add-cart="${produto.id}">${icon('caixa', 'btn__icone')} Adicionar ao carrinho</button><a class="btn btn--contorno" href="/carrinho">Ver carrinho</a></div>
      <p class="small muted">O total do carrinho é uma estimativa. A equipe confirma disponibilidade, parcelamento e condições pelo WhatsApp.</p>
    </div>
  </div></section>`;
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'Product', name: produto.nome, description: produto.descricao, brand: { '@type': 'Brand', name: produto.marca }, image: produto.imagem || undefined, offers: { '@type': 'Offer', price: produto.preco, priceCurrency: 'BRL', availability: produto.disponibilidade === 'estoque' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder' } }];
  return layout({ titulo: `${produto.nome} | ${config.nome}`, descricao: produto.descricao, conteudo, ativo: '/vitrine', config, horarios: config.horarios, jsonLd, canonical: `/produto/${produto.slug}` });
}

module.exports = { produtoPagina };

