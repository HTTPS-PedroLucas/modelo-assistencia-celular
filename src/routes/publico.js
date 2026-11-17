/** Rotas públicas de conversão: pedidos, orçamentos e personalizações. */
const express = require('express');
const store = require('../lib/store');
const { whatsapp, money } = require('../lib/helpers');

const router = express.Router();
const limite = new Map();

function throttle(req, res, next) {
  const ip = req.ip || 'desconhecido';
  const agora = Date.now();
  if (limite.size > 10000) for (const [key, times] of limite) if (times.every(t => agora - t >= 60_000)) limite.delete(key);
  const registros = (limite.get(ip) || []).filter((t) => agora - t < 60_000);
  if (registros.length >= 5) return res.status(429).json({ erro: 'Muitos envios seguidos. Espere um minuto e tente de novo.' });
  registros.push(agora); limite.set(ip, registros); next();
}

const texto = (valor, max = 500) => String(valor ?? '').trim().slice(0, max);
const telefoneValido = (valor) => /^(?:55)?[1-9][0-9][0-9]{8,9}$/.test(texto(valor, 30).replace(/\D/g, ''));
const registrarLead = (tipo, dados) => store.createLead({ tipo, ...dados, criadoEm: new Date().toISOString() });

router.get('/catalogo', async (req,res) => {
 const db = await store.read();
 const produtos = db.produtos.filter(p => (!req.query.categoria || p.categoria === req.query.categoria) && (!req.query.marca || p.marca === req.query.marca));
 res.json({categorias:db.categorias,marcas:db.marcas,produtos,servicos:db.servicos});
});
router.post('/pedidos', throttle, async (req, res) => {
  req.body = req.body || {};
  const nome = texto(req.body.nome, 80);
  const telefone = texto(req.body.telefone, 30);
  const observacao = texto(req.body.observacao, 500);
  const recebidos = Array.isArray(req.body.itens) ? req.body.itens.slice(0, 20) : [];
  const erros = {};
  if (nome.length < 2) erros.nome = 'Informe seu nome.';
  if (!telefoneValido(telefone)) erros.telefone = 'Informe um WhatsApp com DDD.';
  if (!recebidos.length) erros.itens = 'Seu carrinho está vazio.';
  if (Object.keys(erros).length) return res.status(400).json({ erros });

  const quantidades = new Map();
  for (const item of recebidos) {
    const id = Number(item.produtoId);
    const quantidade = Number(item.quantidade);
    if (!Number.isInteger(id) || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) {
      return res.status(400).json({ erro: 'Há um item inválido no carrinho.' });
    }
    quantidades.set(id, Math.min(99, (quantidades.get(id) || 0) + quantidade));
  }

  const db = await store.read();
  const itens = [];
  for (const [id, quantidade] of quantidades) {
    const produto = db.produtos.find((p) => p.id === id);
    if (!produto) return res.status(400).json({ erro: 'Um produto do carrinho não está mais disponível.' });
    itens.push({ produtoId: produto.id, nome: produto.nome, quantidade, precoUnitario: produto.preco, subtotal: Math.round(produto.preco * 100) * quantidade / 100, disponibilidade: produto.disponibilidade });
  }
  const totalEstimado = itens.reduce((total, item) => total + Math.round(item.subtotal * 100), 0) / 100;
  const lead = await registrarLead('pedido', { nome, telefone, observacao, itens, totalEstimado });
  const linhas = itens.map((item) => `• ${item.quantidade}x ${item.nome} — ${money(item.subtotal)}`).join('\n');
  const mensagem = `Olá, ${db.config.nome}! Montei o pedido #${lead.id} no site:\n${linhas}\n\nTotal estimado: ${money(totalEstimado)}${observacao ? `\nObservação: ${observacao}` : ''}\nMeu nome: ${nome}\nPodem confirmar disponibilidade e condições?`;
  return res.status(201).json({ ok: true, id: lead.id, totalEstimado, mensagem: 'Pedido registrado. Abrindo o WhatsApp...', whatsappUrl: whatsapp(db.config.whatsapp, mensagem) });
});

router.post('/orcamento', throttle, async (req, res) => {
  req.body = req.body || {};
  const aparelho = texto(req.body.aparelho, 120);
  const problema = texto(req.body.problema, 800);
  const nome = texto(req.body.nome, 80);
  const telefone = texto(req.body.telefone, 30);
  const erros = {};
  if (aparelho.length < 2) erros.aparelho = 'Diga qual é o aparelho.';
  if (problema.length < 5) erros.problema = 'Descreva o problema com um pouco mais de detalhe.';
  if (nome.length < 2) erros.nome = 'Informe seu nome.';
  if (!telefoneValido(telefone)) erros.telefone = 'Informe um WhatsApp com DDD.';
  if (Object.keys(erros).length) return res.status(400).json({ erros });
  const lead = await registrarLead('orcamento', { aparelho, problema, nome, telefone });
  const { config } = await store.read();
  const mensagem = `Olá, ${config.nome}! Pedi o orçamento #${lead.id} pelo site.\nAparelho: ${aparelho}\nProblema: ${problema}\nMeu nome: ${nome}`;
  return res.status(201).json({ ok: true, id: lead.id, mensagem: 'Orçamento registrado. Abrindo o WhatsApp...', whatsappUrl: whatsapp(config.whatsapp, mensagem) });
});

module.exports = router;
