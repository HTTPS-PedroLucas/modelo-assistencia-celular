const { e } = require('../lib/helpers');
const { icon } = require('./icons');
const { layout } = require('./layout');

function carrinhoPagina(db) {
  const { config, produtos } = db;
  const catalogo = produtos.map((p) => ({ id: p.id, nome: p.nome, preco: p.preco, imagem: p.imagem, disponibilidade: p.disponibilidade, slug: p.slug }));
  const conteudo = `<section class="secao"><div class="container carrinho-layout">
    <div>
      <p class="rotulo">Seu pedido</p><h1>Carrinho</h1>
      <p class="lead">Revise itens e quantidades. A disponibilidade e as condições finais são confirmadas pela equipe.</p>
      <div id="cartItems" class="carrinho-itens" aria-live="polite"></div>
      <div id="cartEmpty" class="vazio" hidden>${icon('caixa')}<h2>Seu carrinho está vazio</h2><p>Escolha produtos no catálogo para montar o pedido.</p><a class="btn btn--primario" href="/vitrine">Ver catálogo</a></div>
    </div>
    <aside class="carrinho-resumo">
      <h2>Enviar para a loja</h2>
      <p class="carrinho-total">Total estimado <strong id="cartTotal">R$ 0,00</strong></p>
      <form class="form" id="formPedido" novalidate>
        <div class="campo"><label for="pedidoNome">Seu nome</label><input id="pedidoNome" name="nome" autocomplete="name" required><span class="campo__erro" data-erro="nome"></span></div>
        <div class="campo"><label for="pedidoTelefone">WhatsApp com DDD</label><input id="pedidoTelefone" name="telefone" inputmode="tel" autocomplete="tel" required><span class="campo__erro" data-erro="telefone"></span></div>
        <div class="campo"><label for="pedidoObservacao">Observação <span class="muted">(opcional)</span></label><textarea id="pedidoObservacao" name="observacao" rows="3" maxlength="500"></textarea></div>
        <span class="campo__erro" data-erro="itens"></span>
        <button class="btn btn--wa btn--bloco" type="submit">${icon('whatsapp', 'btn__icone')} Registrar e abrir WhatsApp</button>
        <div id="respostaPedido" role="status" aria-live="polite"></div>
      </form>
      <p class="small muted">Nome, telefone e itens são registrados para a equipe responder. Pedidos encerrados são removidos após 180 dias.</p>
    </aside>
  </div></section><script id="cartProducts" type="application/json">${JSON.stringify(catalogo).replace(/</g, '\\u003c')}</script>`;
  return layout({ titulo: `Carrinho | ${config.nome}`, descricao: `Revise seu carrinho, registre o pedido e envie a lista completa para a ${config.nome} pelo WhatsApp.`, conteudo, ativo: '/vitrine', config, horarios: config.horarios, canonical: '/carrinho' });
}

module.exports = { carrinhoPagina };

