const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const { newDb, DataType } = require('pg-mem');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres';

const memory = newDb({ autoCreateForeignKeyIndices: true });
memory.public.registerFunction({ name: 'jsonb_typeof', args: [DataType.jsonb], returns: DataType.text, implementation: (v) => Array.isArray(v) ? 'array' : typeof v });
const adapter = memory.adapters.createPg();
const pool = new adapter.Pool();

const database = require('../src/lib/db');
database.setPoolForTests(pool);
const store = require('../src/lib/store');
const auth = require('../src/lib/auth');
const defaults = require('../src/lib/defaults');
const { app } = require('../src/server');

function withoutIds(snapshot) {
  const copy = structuredClone(snapshot);
  for (const name of ['produtos', 'servicos', 'campanhas', 'equipe', 'depoimentos', 'clientes']) {
    for (const item of copy[name] || []) delete item.id;
  }
  return copy;
}

test('fluxos públicos e administrativos da Sua Cell', async (t) => {
  const migrationDir = path.join(__dirname, '..', 'migrations');
  for (const name of fs.readdirSync(migrationDir).filter((file) => file.endsWith('.sql')).sort()) {
    memory.public.none(fs.readFileSync(path.join(migrationDir, name), 'utf8'));
    // pg-mem não preserva o nome automático que o PostgreSQL atribui a leads.type.
    // A migração 002 remove leads_type_check no PostgreSQL real; aqui removemos o alias do emulador.
    if (name === '001_initial.sql') memory.public.none('ALTER TABLE leads DROP CONSTRAINT leads_constraint_1');
  }
  assert.equal(defaults.produtos.length, 0);
  const fixture = withoutIds(defaults);
  fixture.produtos = [
    {nome:'iPhone teste',slug:'iphone-teste',categoria:'celulares',marca:'Apple',condicao:'novo',preco:2499,precoAntigo:null,parcelas:1,disponibilidade:'estoque',destaque:true,imagem:'',descricao:'Fixture de teste',ficha:['128 GB']},
    {nome:'Realme teste',slug:'realme-teste',categoria:'celulares',marca:'Realme',condicao:'novo',preco:1299,precoAntigo:null,parcelas:1,disponibilidade:'estoque',destaque:true,imagem:'',descricao:'Fixture de teste',ficha:[]}
  ];
  await store.importSnapshot(fixture);
  await auth.criarUsuario('admin@suacell.test', 'SenhaForte123!', 'Admin Teste');
  const agent = request.agent(app);

  await t.test('catálogo público filtra Realme e não expõe dados privados', async () => {
    const result = await request(app).get('/api/catalogo?marca=Realme').expect(200);
    assert.equal(result.body.produtos.length,1);
    assert.equal(result.body.produtos[0].marca,'Realme');
    assert.equal(result.body.leads,undefined);
    assert.equal(result.body.usuarios,undefined);
    assert.equal(result.body.categorias.some(c=>c.slug==='personalizados'),false);
    await request(app).post('/api/personalizacoes').send({}).expect(404);
  });

  await t.test('páginas e sitemap refletem somente a Sua Cell', async()=>{
    for(const route of ['/','/vitrine','/assistencia-tecnica','/a-loja','/pagamento','/garantia','/entrega','/carrinho','/produto/iphone-teste','/admin']) {
      const result=await request(app).get(route).expect(200);
      assert.match(result.text,/Sua Cell/);
      assert.doesNotMatch(result.text,/prefeitura|PlayStation|personalizados|18x/);
    }
    await request(app).get('/personalizados').expect(404);
    const sitemap=await request(app).get('/sitemap.xml').expect(200);
    assert.doesNotMatch(sitemap.text,/personalizados/);
    const vitrine=await request(app).get('/vitrine?marca=Realme').expect(200);
    assert.match(vitrine.text,/Realme teste/);
    assert.doesNotMatch(vitrine.text,/iPhone teste/);
  });
  await t.test('API do painel bloqueia acesso sem sessão', async () => {
    await request(app).get('/api/admin/dados').expect(401);
  });

  await t.test('login rejeita senha incorreta e cria sessão segura', async () => {
    await agent.post('/api/admin/login').send({ email: 'admin@suacell.test', senha: 'errada' }).expect(401);
    const login = await agent.post('/api/admin/login').send({ email: 'admin@suacell.test', senha: 'SenhaForte123!' }).expect(200);
    assert.equal(login.body.usuario.email, 'admin@suacell.test');
    const dados = await agent.get('/api/admin/dados').expect(200);
    assert.ok(dados.body.produtos.length > 0);
    assert.ok(Array.isArray(dados.body.campanhas));
    assert.ok(Array.isArray(dados.body.reparos));
    assert.equal(dados.body.usuarios, undefined);
  });

  await t.test('produto com condição e campanha têm CRUD completo', async () => {
    const product = await agent.post('/api/admin/produtos').send({
      nome: 'Celular de teste', categoria: 'celulares', marca: 'Realme', condicao: 'novo',
      preco: 999.9, parcelas: 18, disponibilidade: 'estoque', destaque: true, ficha: ['128 GB']
    }).expect(201);
    assert.equal(product.body.condicao, 'novo');
    const updated = await agent.put(`/api/admin/produtos/${product.body.id}`).send({ ...product.body, nome: 'Celular editado', preco: 899.9 }).expect(200);
    assert.equal(updated.body.nome, 'Celular editado');
    await agent.delete(`/api/admin/produtos/${product.body.id}`).expect(200);

    const campaign = await agent.post('/api/admin/campanhas').send({ titulo: 'Campanha teste', texto: 'Oferta', ctaRotulo: 'Ver', ctaUrl: '/vitrine', ativo: true, ordem: 9 }).expect(201);
    assert.equal(campaign.body.ativo, true);
    await agent.put(`/api/admin/campanhas/${campaign.body.id}`).send({ ...campaign.body, ativo: false }).expect(200);
    await agent.delete(`/api/admin/campanhas/${campaign.body.id}`).expect(200);
  });

  await t.test('pedido valida o carrinho e recalcula preços no servidor', async () => {
    await request(app).post('/api/pedidos').send({ nome: 'A', telefone: '123', itens: [] }).expect(400);
    await request(app).post('/api/pedidos').send({ nome: 'Cliente', telefone: '(11) 99999-0000', itens: [{ produtoId: 99999, quantidade: 1 }] }).expect(400);
    const pedido = await request(app).post('/api/pedidos').send({
      nome: 'Cliente Pedido', telefone: '(11) 99999-0000', observacao: 'Separar na cor preta',
      itens: [{ produtoId: 1, quantidade: 2, preco: 1 }]
    }).expect(201);
    assert.equal(pedido.body.totalEstimado, 4998);
    assert.match(pedido.body.whatsappUrl, /^https:\/\/wa\.me\/5500900000000/);
    const leads = await agent.get('/api/admin/lista/leads').expect(200);
    const salvo = leads.body.find((item) => item.id === pedido.body.id);
    assert.equal(salvo.tipo, 'pedido');
    assert.equal(salvo.itens[0].precoUnitario, 2499);
  });

  let quoteId;
  await t.test('orçamento vira ordem de reparo e segue transições válidas', async () => {
    const lead = await request(app).post('/api/orcamento').send({ aparelho: 'iPhone 13', problema: 'Tela quebrada', nome: 'Cliente Reparo', telefone: '(11) 99999-0001' }).expect(201);
    quoteId = lead.body.id;
    const repair = await agent.post(`/api/admin/lista/reparos/converter/${quoteId}`).send({}).expect(201);
    assert.equal(repair.body.status, 'recebido');
    assert.equal(repair.body.problema, 'Tela quebrada');
    const working = await agent.put(`/api/admin/lista/reparos/${repair.body.id}`).send({ ...repair.body, status: 'em_reparo', diagnostico: 'Display danificado', observacoesInternas: 'Peça separada' }).expect(200);
    assert.equal(working.body.status, 'em_reparo');
    await agent.put(`/api/admin/lista/reparos/${repair.body.id}`).send({ ...working.body, status: 'entregue' }).expect(400);
    const ready = await agent.put(`/api/admin/lista/reparos/${repair.body.id}`).send({ ...working.body, status: 'pronto' }).expect(200);
    assert.ok(ready.body.prontoEm);
  });

  await t.test('categorias de outra loja e preços ausentes são rejeitados',async()=>{
    await agent.post('/api/admin/produtos').send({nome:'Capa personalizada',categoria:'personalizados',marca:'Outras',preco:50}).expect(400);
    await agent.post('/api/admin/produtos').send({nome:'Celular',categoria:'celulares',marca:'Realme'}).expect(400);
  });
  await t.test('conversão duplicada de orçamento é rejeitada',async()=>{
    await agent.post('/api/admin/lista/reparos/converter/'+quoteId).send({}).expect(409);
  });
  await t.test('JSON malformado retorna 400',async()=>{
    await request(app).post('/api/pedidos').set('Content-Type','application/json').send('{').expect(400);
  });

  await t.test('mural de clientes exige foto e só publica o que foi aprovado', async () => {
    await agent.post('/api/admin/clientes').send({ nome: 'Sem foto', aprovado: true }).expect(400);
    await agent.post('/api/admin/clientes')
      .send({ foto: '/img/c.webp', nome: 'Link errado', instagram: 'http://instagram.com/x', aprovado: true })
      .expect(400);

    const publicada = await agent.post('/api/admin/clientes')
      .send({ foto: '/img/publicada.webp', nome: 'Ana Cláudia', legenda: 'Primeiro iPhone dela', instagram: 'https://instagram.com/suacell', aprovado: true, ordem: 1 })
      .expect(201);
    assert.equal(publicada.body.nome, 'Ana Cláudia');
    assert.equal(publicada.body.aprovado, true);

    const rascunho = await agent.post('/api/admin/clientes')
      .send({ foto: '/img/rascunho.webp', nome: 'Sem autorização ainda', aprovado: false })
      .expect(201);

    // Home e /a-loja mostram a aprovada e nunca a que não tem autorização.
    for (const rota of ['/', '/a-loja']) {
      const pagina = await request(app).get(rota).expect(200);
      assert.match(pagina.text, /#SouCliente/);
      assert.match(pagina.text, /publicada\.webp/);
      assert.equal(pagina.text.includes('rascunho.webp'), false);
      // Com menos de 6 fotos o mural fica parado: sem faixa animada nem botão de pausa.
      assert.equal(pagina.text.includes('loja-mural__fita'), false);
      assert.match(pagina.text, /loja-mural__grade/);
    }

    // A partir de 6 aprovadas o mural entra em movimento — e com freio.
    for (let i = 0; i < 5; i++) {
      await agent.post('/api/admin/clientes').send({ foto: `/img/lote-${i}.webp`, nome: `Cliente ${i}`, aprovado: true }).expect(201);
    }
    const home = await request(app).get('/').expect(200);
    assert.match(home.text, /loja-mural__fita/);
    assert.match(home.text, /data-mural-alternar/);
    assert.match(home.text, /aria-pressed="false"/);
    // A cópia que fecha o laço não pode ser lida nem focada duas vezes.
    assert.match(home.text, /aria-hidden="true"><li class="loja-mural__item"/);
    assert.match(home.text, /tabindex="-1"/);

    await agent.delete(`/api/admin/clientes/${rascunho.body.id}`).expect(200);
    await agent.delete(`/api/admin/clientes/${rascunho.body.id}`).expect(404);
  });

  await t.test('upload usa a pasta isolada da Sua Cell', async () => {
    const uploaded = await agent.post('/api/admin/upload').attach('imagem', Buffer.from('imagem-webp-de-teste'), { filename: 'produto.webp', contentType: 'image/webp' }).expect(201);
    assert.match(uploaded.body.url, /^https:\/\/res\.cloudinary\.com\/test\/image\/upload\/suacell\//);
  });

  await t.test('logout invalida o acesso subsequente', async () => {
    await agent.post('/api/admin/logout').expect(200);
    await agent.get('/api/admin/dados').expect(401);
  });
});
