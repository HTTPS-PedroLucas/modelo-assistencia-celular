const { e, money, whatsapp } = require('../lib/helpers');
const { icon } = require('./icons');

/** Moldura para foto ainda não enviada — deixa claro o que falta, sem stock. */
function fotoVazia(texto) {
  return `<div class="foto-vazia">
    ${icon('imagem')}
    <strong>${e(texto)}</strong>
  </div>`;
}

function imagemOu(src, alt, texto, extra = '') {
  if (!src) return fotoVazia(texto);
  return `<img src="${e(src)}" alt="${e(alt)}" loading="lazy" decoding="async"${extra}>`;
}

function cabecaSecao({ rotulo, titulo, texto, id, marca = true }) {
  return `<div class="secao-cabeca" data-revelar>
    ${rotulo ? `<p class="rotulo">${e(rotulo)}</p>` : ''}
    <h2${id ? ` id="${e(id)}"` : ''}${marca ? ' class="titulo-marca"' : ''}>${e(titulo)}</h2>
    <span class="filete-marca" aria-hidden="true"></span>
    ${texto ? `<p class="lead">${e(texto)}</p>` : ''}
  </div>`;
}

/**
 * Card de produto no padrão de ficha técnica que a marca já usa nas artes.
 * Preço sempre visível — "consulte valores" é o maior ponto de abandono.
 */
function cardProduto(produto, config, pagamento) {
  const desconto =
    produto.precoAntigo && produto.precoAntigo > produto.preco
      ? Math.round((1 - produto.preco / produto.precoAntigo) * 100)
      : 0;

  const vezes = Math.min(produto.parcelas || 1, pagamento.maxParcelas || 1);
  return `<article class="produto">
  <div class="produto__midia">
    <a href="/produto/${e(produto.slug)}" aria-label="Ver detalhes de ${e(produto.nome)}">
      ${imagemOu(produto.imagem, produto.nome, 'Envie a foto real do produto no painel', ' width="600" height="600"')}
    </a>
    <div class="produto__selos">
      ${
        produto.disponibilidade === 'estoque'
          ? '<span class="selo selo--estoque">Em estoque</span>'
          : '<span class="selo selo--encomenda">Sob encomenda</span>'
      }
      ${desconto ? `<span class="selo selo--desconto">-${desconto}%</span>` : ''}
      ${produto.condicao ? `<span class="selo selo--condicao">${produto.condicao === 'novo' ? 'Novo' : 'Seminovo'}</span>` : ''}
    </div>
  </div>

  <div class="produto__corpo">
    <p class="produto__marca">${e(produto.marca)}</p>
    <h3 class="produto__nome"><a href="/produto/${e(produto.slug)}">${e(produto.nome)}</a></h3>

    ${
      produto.ficha && produto.ficha.length
        ? `<ul class="ficha">${produto.ficha
            .slice(0, 4)
            .map((f) => `<li>${e(f)}</li>`)
            .join('')}</ul>`
        : ''
    }

    <div class="preco">
      ${produto.precoAntigo ? `<p class="preco__antigo">De ${money(produto.precoAntigo)}</p>` : ''}
      <p class="preco__valor">${money(produto.preco)}</p>
      <p class="preco__parcela">${vezes > 1 ? `parcelamento em até ${vezes}x no cartão` : 'valor à vista'}</p>
    </div>

    <button class="btn btn--primario btn--bloco btn--sm" type="button" data-add-cart="${produto.id}">
      ${icon('caixa', 'btn__icone')} Adicionar ao carrinho
    </button>
  </div>
</article>`;
}

function cardServico(servico, config) {
  const mensagem = `Olá! Quero um orçamento de ${servico.nome.toLowerCase()}.`;
  return `<article class="cartao cartao--servico">
    <h3 class="cartao__titulo">${e(servico.nome)}</h3>
    <p class="muted">${e(servico.descricao)}</p>
    <p class="servico__faixa">${e(servico.faixa)}</p>
    <dl class="servico__meta">
      <div><dt>Prazo médio</dt><dd>${e(servico.prazo)}</dd></div>
      <div><dt>Garantia</dt><dd>${e(servico.garantia)}</dd></div>
    </dl>
    <a class="btn btn--contorno btn--bloco btn--sm" href="${whatsapp(config.whatsapp, mensagem)}" rel="noopener">
      ${icon('whatsapp', 'btn__icone')} Pedir orçamento
    </a>
  </article>`;
}

function estadoVazio(titulo, texto, acao = '') {
  return `<div class="vazio">
    ${icon('busca')}
    <h3>${e(titulo)}</h3>
    <p>${e(texto)}</p>
    ${acao}
  </div>`;
}

/** Faixa de endereço + mapa, repetida no fim das páginas de conversão. */
function faixaContato(config, horarios) {
  const mapa = `https://www.google.com/maps?q=${encodeURIComponent(config.mapsQuery)}&output=embed`;
  const mensagem = `Olá! Queria confirmar o horário de funcionamento de vocês.`;

  return `<section class="secao secao--escura" aria-labelledby="como-chegar">
  <div class="container">
    ${cabecaSecao({
      rotulo: 'Onde a gente fica',
      titulo: 'Como chegar na loja',
      texto: `${config.endereco}, ${config.bairro} — ${config.cidade}/${config.estado}.`,
      id: 'como-chegar'
    })}

    <div class="grid grid--2">
      <div class="pilha" data-revelar="esquerda">
        <div class="cartao">
          <h3 class="cartao__titulo">Endereço</h3>
          <p>${e(config.endereco)}<br>${e(config.bairro)} — ${e(config.cidade)}/${e(config.estado)}</p>
          <a class="btn btn--contorno btn--sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            config.mapsQuery
          )}" rel="noopener">${icon('pin', 'btn__icone')} Abrir no Google Maps</a>
        </div>

        <div class="cartao">
          <h3 class="cartao__titulo">Horário</h3>
          <div class="tabela-rolagem">
            <table>
              <caption class="sr-only">Horário de funcionamento</caption>
              <tbody>
                ${horarios
                  .map((h) => `<tr><td>${e(h.dia)}</td><td><strong>${e(h.hora)}</strong></td></tr>`)
                  .join('')}
              </tbody>
            </table>
          </div>
          <a class="btn btn--wa btn--sm" href="${whatsapp(config.whatsapp, mensagem)}" rel="noopener">
            ${icon('whatsapp', 'btn__icone')} ${e(config.whatsappExibicao)}
          </a>
        </div>
      </div>

      <iframe
        class="mapa" data-revelar="direita"
        src="${mapa}"
        title="Mapa com a localização da ${e(config.nome)} em ${e(config.cidade)}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen></iframe>
    </div>
  </div>
</section>`;
}

/**
 * Mural #SouCliente: a foto de cliente que a loja já publica no Instagram,
 * agora passando na tela. Prova social real — a seção desaparece se não houver
 * foto aprovada, porque cliente inventado não é prova de nada.
 *
 * Movimento contínuo é decorativo, e decoração que se move sem freio é barreira
 * de acessibilidade. Por isso vem com botão de pausa, para na tecla de foco,
 * para fora da tela e, em quem pede menos movimento, vira faixa de rolagem.
 */
function cartaoCliente(cliente, { clone = false } = {}) {
  const nome = String(cliente.nome || '').trim();
  const legenda = String(cliente.legenda || '').trim();
  const alt = legenda || (nome ? `${nome} na loja` : 'Cliente na loja');
  const rodape = nome || legenda
    ? `<figcaption class="loja-mural__legenda">${nome ? `<strong>${e(nome)}</strong>` : ''}${legenda ? `<span>${e(legenda)}</span>` : ''}</figcaption>`
    : '';

  const foto = `<img src="${e(cliente.foto)}" alt="${e(clone ? '' : alt)}" width="420" height="525" loading="lazy" decoding="async">`;
  const miolo = cliente.instagram
    ? `<a class="loja-mural__link" href="${e(cliente.instagram)}" rel="noopener"${clone ? ' tabindex="-1"' : ''}>${foto}<span class="loja-mural__selo">${icon('instagram')}<span class="sr-only">Ver no Instagram</span></span></a>`
    : foto;

  return `<li class="loja-mural__item"><figure>${miolo}${rodape}</figure></li>`;
}

/* Todos os trilhos andam juntos, cada um deslocando a própria largura. No fim
   do ciclo o trilho i ocupa o lugar do i-1, então o laço fecha sem salto desde
   que os trilhos somados passem da tela: (k-1) larguras >= tela. 2600px cobre
   monitor grande com folga. */
const CARTAO = 212;
const VAO = 16;
const TELA_MAX = 2600;

function trilhos(quantidade) {
  const largura = quantidade * CARTAO + (quantidade - 1) * VAO;
  return Math.max(2, Math.ceil(TELA_MAX / largura) + 1);
}

/**
 * Só o primeiro trilho é conteúdo; os demais são cópia para fechar o laço.
 * Marcá-los como cópia (aria-hidden + tabindex -1) é o que faz cada cliente ser
 * lido e focado uma única vez — e é o que permite, em movimento reduzido,
 * esconder as cópias e deixar a faixa rolável com cada foto aparecendo uma vez.
 */
function faixaMural(fotos, indice) {
  const conteudo = fotos.map((f) => cartaoCliente(f)).join('');
  const copia = fotos.map((f) => cartaoCliente(f, { clone: true })).join('');
  // A duração acompanha a largura do trilho: a velocidade na tela fica igual
  // com 6 fotos ou com 60.
  const estilo = `--fotos:${fotos.length}`;
  const fitas = [`<ul class="loja-mural__fita" style="${estilo}">${conteudo}</ul>`];
  for (let i = 1; i < trilhos(fotos.length); i++) {
    fitas.push(`<ul class="loja-mural__fita" style="${estilo}" aria-hidden="true">${copia}</ul>`);
  }
  return `<div class="loja-mural__pista loja-mural__pista--${indice}" data-mural-pista>
      ${fitas.join('')}
    </div>`;
}

/* Grade parada, para quando ainda há pouca foto: repetir três clientes em laço
   infinito chama atenção para a escassez e cobra da pessoa um movimento que não
   informa nada. A grade mostra o que existe, sem encenação. */
function gradeMural(fotos) {
  return `<div class="container loja-mural__grade">
      <ul>${fotos.map((f) => cartaoCliente(f)).join('')}</ul>
    </div>`;
}

function muralClientes(clientes, config, { rotulo = 'QUEM JÁ É DE CASA', titulo = 'Cada foto aqui<br>é uma história nossa.' } = {}) {
  const fotos = (clientes || []).filter((c) => c.aprovado && c.foto);
  if (!fotos.length) return '';

  const mensagem = `Olá, ${config.nome}! Comprei com vocês e quero mandar minha foto para o mural.`;
  // Seis é o ponto em que duas faixas em sentidos opostos preenchem a tela sem
  // repetir o mesmo cliente a cada segundo.
  const emMovimento = fotos.length >= 6;
  const faixas = emMovimento
    ? [faixaMural(fotos.filter((_, i) => i % 2 === 0), 'a'), faixaMural(fotos.filter((_, i) => i % 2 === 1), 'b')]
    : [gradeMural(fotos)];

  return `<section class="secao loja-mural${emMovimento ? '' : ' loja-mural--parado'}" id="sou-cliente" aria-labelledby="mural-titulo"${emMovimento ? ' data-mural' : ''}>
  <div class="container loja-section-head">
    <div>
      <p class="rotulo">${e(rotulo)}</p>
      <h2 id="mural-titulo">${titulo}<br><em>#SouCliente</em></h2>
    </div>
    <div class="loja-mural__acoes">
      <p class="loja-mural__nota">${fotos.length} ${fotos.length === 1 ? 'foto publicada' : 'fotos publicadas'} com autorização de quem aparece.</p>
      ${emMovimento ? `<button class="loja-mural__botao" type="button" data-mural-alternar aria-pressed="false">
        <span class="loja-mural__botao-icone" aria-hidden="true">${icon('pausar')}${icon('tocar')}</span>
        <span data-mural-rotulo>Pausar o mural</span>
      </button>` : ''}
    </div>
  </div>
  ${faixas.join('\n  ')}
  <div class="container loja-mural__convite">
    <p><strong>Comprou com a gente?</strong> Manda a foto que a gente publica aqui.</p>
    <a class="loja-text-link" href="${whatsapp(config.whatsapp, mensagem)}" rel="noopener">Mandar minha foto ${icon('whatsapp')}</a>
  </div>
</section>`;
}

/** Bloco final de conversão — toda página termina com um caminho claro. */
function chamadaFinal(config, { titulo, texto, mensagem }) {
  return `<section class="secao">
  <div class="container">
    <div class="cartao" style="border-color:var(--border-strong);text-align:center" data-revelar="zoom">
      <h2>${e(titulo)}</h2>
      <p class="lead" style="margin-inline:auto;max-width:52ch">${e(texto)}</p>
      <div class="hero__acoes" style="justify-content:center;margin-top:var(--s-6)">
        <a class="btn btn--wa" href="${whatsapp(config.whatsapp, mensagem)}" rel="noopener">
          ${icon('whatsapp', 'btn__icone')} Chamar no WhatsApp
        </a>
        <a class="btn btn--contorno" href="/vitrine">${icon('busca', 'btn__icone')} Ver a vitrine</a>
      </div>
    </div>
  </div>
</section>`;
}

module.exports = {
  fotoVazia,
  imagemOu,
  cabecaSecao,
  cardProduto,
  cardServico,
  estadoVazio,
  muralClientes,
  faixaContato,
  chamadaFinal
};
