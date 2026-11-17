const { e, whatsapp } = require('../lib/helpers');
const { icon } = require('./icons');
const { layout } = require('./layout');
const { cabecaSecao, faixaContato, imagemOu, chamadaFinal, muralClientes } = require('./components');

function pagamentoPagina(db) {
  const { config, pagamento } = db;
  const conteudo = `<section class="secao"><div class="container">
    ${cabecaSecao({ rotulo: 'Pagamento', titulo: 'Escolha o produto. A gente ajuda a fechar.', texto: pagamento.resumo })}
    <div class="grid grid--2">${pagamento.formas.map((f) => `<article class="cartao"><span class="icone-destaque">${icon('cartao')}</span><h3>${e(f.nome)}</h3><p>${e(f.detalhe)}</p></article>`).join('')}</div>
    <div class="nota-importante"><strong>Parcelamento facilitado</strong><p>O site não calcula juros nem cobra pagamentos. A equipe confirma entrada, parcelas e valor final antes da venda.</p></div>
  </div></section>${chamadaFinal(config, { titulo: 'Quer confirmar as condições?', texto: 'Envie o carrinho ou fale direto com a equipe.', mensagem: 'Olá! Quero confirmar as condições de pagamento de um produto.' })}`;
  return layout({ titulo: `Pagamento e parcelamento | ${config.nome}`, descricao: `Condições de pagamento e parcelamento na ${config.nome} em ${config.cidade}/${config.estado}.`, conteudo, ativo: '', config, horarios: config.horarios, canonical: '/pagamento' });
}

function garantiaPagina(db) {
  const { config, garantia } = db;
  const conteudo = `<section class="secao"><div class="container">
    ${cabecaSecao({ rotulo: 'Garantia', titulo: 'Condição clara antes de fechar', texto: garantia.resumo })}
    <div class="grid grid--2">${garantia.itens.map((i) => `<article class="cartao"><span class="icone-destaque">${icon('escudo')}</span><h3>${e(i.categoria)}</h3><strong>${e(i.prazo)}</strong><p>${e(i.detalhe)}</p></article>`).join('')}</div>
    <div class="grid grid--2 institucional-bloco"><div><h2>Como acionar</h2><ol class="lista-passos">${garantia.comoAcionar.map((p) => `<li>${e(p)}</li>`).join('')}</ol></div><div class="cartao"><h2>Trocas</h2><p>${e(garantia.politicaTroca)}</p></div></div>
  </div></section>`;
  return layout({ titulo: `Garantia | ${config.nome}`, descricao: `Informações de garantia de celulares, acessórios e assistência técnica da ${config.nome} em ${config.cidade}.`, conteudo, config, horarios: config.horarios, canonical: '/garantia' });
}

function entregaPagina(db) {
  const { config, entrega } = db;
  const conteudo = `<section class="secao"><div class="container">
    ${cabecaSecao({ rotulo: 'Retirada e entrega', titulo: `Pertinho de você, no centro de ${config.cidade}`, texto: entrega.resumo })}
    <div class="grid grid--3"><article class="cartao"><span class="icone-destaque">${icon('loja')}</span><h3>Retirada na loja</h3><p>${e(entrega.retirada)}</p></article><article class="cartao"><span class="icone-destaque">${icon('caminhao')}</span><h3>Entrega em ${e(config.cidade)}</h3><p>${e(entrega.local.prazo)} · ${e(entrega.local.taxa)}</p></article><article class="cartao"><span class="icone-destaque">${icon('pin')}</span><h3>Outras cidades</h3><p>${e(entrega.cidadesTexto)}</p></article></div>
  </div></section>${faixaContato(config, config.horarios)}`;
  return layout({ titulo: `Entrega e retirada | ${config.nome}`, descricao: `Retirada e informações de entrega da ${config.nome} em ${config.cidade} e região.`, conteudo, config, horarios: config.horarios, canonical: '/entrega' });
}

function lojaPagina(db) {
  const { config, sobreLoja, equipe, depoimentos, clientes } = db;
  const aprovados = depoimentos.filter((d) => d.aprovado);
  const conteudo = `<section class="secao"><div class="container loja-intro"><div><p class="rotulo">${e(config.nome)} · ${e(config.cidade)}</p><h1>${e(sobreLoja.titulo)}</h1><p class="lead">${e(sobreLoja.texto)}</p><a class="btn btn--wa" href="${whatsapp(config.whatsapp, `Olá! Quero visitar a ${config.nome}. Podem confirmar o horário?`)}" rel="noopener">${icon('whatsapp', 'btn__icone')} Confirmar horário</a></div><div>${imagemOu(sobreLoja.fotos[0], `Interior da ${config.nome}`, 'Importe uma foto autorizada da loja no painel', ' width="900" height="700"')}</div></div></section>
  ${sobreLoja.fotos.length > 1 ? `<section class="secao secao--escura"><div class="container galeria-loja">${sobreLoja.fotos.slice(1).map((foto, i) => `<img src="${e(foto)}" alt="${i === 0 ? 'Bancada de assistência da loja' : 'Ambiente da loja'}" width="800" height="600" loading="lazy">`).join('')}</div></section>` : ''}
  ${equipe.length ? `<section class="secao"><div class="container">${cabecaSecao({ rotulo: 'Atendimento humano', titulo: 'Quem recebe você na loja', texto: 'Gente que entende de tecnologia e de você.' })}<div class="grid grid--3">${equipe.map((p) => `<article class="cartao equipe-card">${imagemOu(p.foto, p.nome, 'Adicione a foto autorizada no painel')}<h3>${e(p.nome)}</h3><strong>${e(p.funcao)}</strong><p>${e(p.bio)}</p></article>`).join('')}</div></div></section>` : ''}
  ${aprovados.length ? `<section class="secao secao--escura"><div class="container">${cabecaSecao({ rotulo: 'Prova social', titulo: `Clientes ${config.nome}` })}<div class="grid grid--3">${aprovados.map((d) => `<figure class="depoimento"><blockquote>“${e(d.texto)}”</blockquote><figcaption><strong>${e(d.nome)}</strong><span>${e(d.cidade)}</span></figcaption></figure>`).join('')}</div></div></section>` : ''}
  ${muralClientes(clientes, config, { rotulo: 'Prova social', titulo: 'Quem já saiu daqui<br>conectado.' })}
  ${faixaContato(config, config.horarios)}`;
  return layout({ titulo: `A loja | ${config.nome}`, descricao: `Conheça a ${config.nome}, loja de celulares, acessórios e assistência técnica no centro de ${config.cidade}/${config.estado}.`, conteudo, ativo: '/a-loja', config, horarios: config.horarios, canonical: '/a-loja' });
}

module.exports = { pagamentoPagina, garantiaPagina, entregaPagina, lojaPagina };
