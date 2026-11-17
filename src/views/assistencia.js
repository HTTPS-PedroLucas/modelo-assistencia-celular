const { e, whatsapp } = require('../lib/helpers');
const { icon } = require('./icons');
const { layout } = require('./layout');
const { cabecaSecao, cardServico, imagemOu, faixaContato } = require('./components');

function assistencia(db) {
  const { config, servicos, assistenciaInfo, garantia, sobreLoja } = db;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Assistência técnica de celulares',
      provider: { '@type': 'ElectronicsStore', name: config.nome },
      areaServed: { '@type': 'City', name: config.cidade },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Serviços de assistência técnica',
        itemListElement: servicos.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.nome, description: s.descricao }
        }))
      }
    }
  ];

  const conteudo = `
<section class="hero">
  <div class="container hero__grade">
    <div class="hero__conteudo">
      <p class="rotulo">Assistência técnica &middot; ${e(config.cidade)} — ${e(config.estado)}</p>
      <h1>${e(assistenciaInfo.chamada)}</h1>
      <p class="lead">${e(assistenciaInfo.texto)}</p>

      <ul class="lista-check">
        ${assistenciaInfo.diferenciais.map((d) => `<li>${icon('check')}<span>${e(d)}</span></li>`).join('\n        ')}
      </ul>

      <div class="hero__acoes">
        <a class="btn btn--primario" href="#orcamento">${icon('chave', 'btn__icone')} Pedir orçamento agora</a>
        <a class="btn btn--wa" href="${whatsapp(
          config.whatsapp,
          'Olá! Meu aparelho está com problema e queria um orçamento.'
        )}" rel="noopener">${icon('whatsapp', 'btn__icone')} Falar direto</a>
      </div>
    </div>

    <div class="hero__foto">
      ${imagemOu(
        sobreLoja.fotos && sobreLoja.fotos[1],
        'Bancada de assistência técnica da loja',
        'Foto do balcão e da bancada — mostra que existe estrutura de verdade',
        ' width="800" height="600"'
      )}
    </div>
  </div>
</section>

<section class="secao" aria-labelledby="servicos">
  <div class="container">
    ${cabecaSecao({
      rotulo: 'O que a gente conserta',
      titulo: 'Serviços, prazo e garantia',
      texto: 'Conheça nossos serviços. Prazos, valores e garantia são definidos após avaliação.',
      id: 'servicos'
    })}
    <div class="grid grid--3" data-revelar-grupo>
      ${servicos.map((s) => cardServico(s, config)).join('\n      ')}
    </div>
  </div>
</section>

<section class="secao secao--escura" id="orcamento" aria-labelledby="tit-orcamento">
  <div class="container">
    ${cabecaSecao({
      rotulo: 'FALE COM A ASSISTÊNCIA',
      titulo: 'Peça seu orçamento',
      texto: 'Conte o que aconteceu. Nossa equipe orienta os próximos passos pelo WhatsApp.',
      id: 'tit-orcamento'
    })}

    <div class="grid grid--2">
      <form class="form cartao" id="formOrcamento" novalidate>
        <div class="campo">
          <label for="aparelho">Aparelho <span class="muted small">(obrigatório)</span></label>
          <input type="text" id="aparelho" name="aparelho" required autocomplete="off"
                 placeholder="Ex.: iPhone 11, Xiaomi, Realme">
          <p class="campo__erro" id="erro-aparelho" role="alert"></p>
        </div>

        <div class="campo">
          <label for="problema">Qual é o problema? <span class="muted small">(obrigatório)</span></label>
          <textarea id="problema" name="problema" required
                    placeholder="Ex.: caiu e a tela trincou, ainda liga mas não responde ao toque"></textarea>
          <p class="campo__dica">Quanto mais detalhe, mais certeiro fica o orçamento.</p>
          <p class="campo__erro" id="erro-problema" role="alert"></p>
        </div>

        <div class="campo">
          <label for="nome">Seu nome <span class="muted small">(obrigatório)</span></label>
          <input type="text" id="nome" name="nome" required autocomplete="name">
          <p class="campo__erro" id="erro-nome" role="alert"></p>
        </div>

        <div class="campo">
          <label for="telefone">WhatsApp <span class="muted small">(obrigatório)</span></label>
          <input type="tel" id="telefone" name="telefone" required autocomplete="tel"
                 inputmode="numeric" placeholder="(00) 9 9999-9999">
          <p class="campo__erro" id="erro-telefone" role="alert"></p>
        </div>

        <button class="btn btn--wa btn--bloco" type="submit">
          ${icon('whatsapp', 'btn__icone')} Enviar e abrir o WhatsApp
        </button>

        <p class="campo__dica">
          Ao enviar, o pedido fica registrado no painel da loja e o WhatsApp abre com a mensagem pronta.
        </p>

        <div id="respostaOrcamento" role="status" aria-live="polite"></div>
      </form>

      <div class="pilha">
        <div class="cartao">
          <h3 class="cartao__titulo">Como funciona</h3>
          <ol class="lista-passos">
            <li><span><strong>Você descreve o problema</strong><br><span class="muted small">Pelo formulário ou direto no WhatsApp.</span></span></li>
            <li><span><strong>A gente dá valor e prazo</strong><br><span class="muted small">Após avaliar o aparelho, antes de iniciar o reparo.</span></span></li>
            <li><span><strong>Você aprova — ou não</strong><br><span class="muted small">Se não valer a pena consertar, a gente fala.</span></span></li>
            <li><span><strong>Conheça a garantia do serviço</strong><br><span class="muted small">${e(
              garantia.itens.find((i) => /assistência/i.test(i.categoria))?.prazo || '90 dias sobre o reparo'
            )}.</span></span></li>
          </ol>
        </div>

        <div class="aviso">
          ${icon('alerta')}
          <span><strong>Antes de trazer:</strong> faça um backup quando possível. Não envie senhas pelo formulário.</span>
        </div>
      </div>
    </div>
  </div>
</section>

${faixaContato(config, config.horarios)}
`;

  return layout({
    titulo: `Assistência técnica de celulares em ${config.cidade} — ${config.estado} | ${config.nome}`,
    descricao: `Reparo de placa e manutenção especializada de celulares em ${config.cidade}/${config.estado}. Registre seu orçamento e acompanhe pelo WhatsApp.`,
    conteudo,
    ativo: '/assistencia-tecnica',
    config,
    horarios: config.horarios,
    jsonLd,
    canonical: '/assistencia-tecnica'
  });
}

module.exports = { assistencia };
