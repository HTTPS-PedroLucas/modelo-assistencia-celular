const { e, sigla, whatsapp } = require('../lib/helpers');
const { icon } = require('./icons');
const { layout } = require('./layout');
const { cardProduto, faixaContato, muralClientes } = require('./components');
function home(db) {
 const {config,pagamento,produtos,servicos,campanhas,depoimentos,clientes}=db;
 const wa=whatsapp(config.whatsapp,`Olá, ${config.nome}! Quero ajuda para escolher meu próximo celular.`);
 const destaques=produtos.filter(p=>p.destaque).slice(0,4);
 const marcas=[['Apple','iPhone','Seu próximo capítulo.','apple'],['Xiaomi','Xiaomi','Tecnologia no seu ritmo.','xiaomi'],['Realme','realme','Mais possibilidades.','realme']];
 const conteudo=`
 <section class="loja-hero"><div class="container loja-hero__grid">
  <div class="loja-hero__copy"><p class="loja-eyebrow"><span></span> SUA CONEXÃO EM ${e(config.cidade.toUpperCase())} · ${e(config.estado)}</p>
   <h1>Mais que<br>celular.<br><em>Conexões.</em></h1>
   <p class="loja-hero__description">${e(config.subtitulo)}</p>
   <div class="hero__acoes"><a class="btn btn--primario" href="/vitrine">Encontre seu celular ${icon('seta')}</a><a class="loja-text-link" href="${wa}">Fale com a gente ${icon('whatsapp')}</a></div>
   <div class="loja-hero__foot"><span class="loja-monogram">${e(sigla(config.nome))}</span><p><strong>Tecnologia aproxima.</strong><br>O nosso atendimento também.</p></div>
  </div>
  <div class="loja-visual" aria-hidden="true"><div class="loja-orbit loja-orbit--one"></div><div class="loja-orbit loja-orbit--two"></div><span class="loja-visual__word">CONECTE.</span>
    <div class="loja-phone loja-phone--back"><div class="loja-cameras"><i></i><i></i><i></i><b></b></div><span>${e(sigla(config.nome))}</span></div>
    <div class="loja-phone loja-phone--front"><div class="loja-island"></div><div class="loja-screen-glow"></div><span class="loja-screen-title">O próximo<br>é seu.</span><span class="loja-screen-bottom">SEMPRE CONECTANDO VOCÊ ↗</span></div>
    <div class="loja-floating loja-floating--top">${icon('escudo')}<span>Originais.<br><strong>Com garantia.</strong></span></div>
    <div class="loja-floating loja-floating--bottom"><span class="loja-dot"></span> Sua próxima novidade está aqui.</div>
  </div>
 </div><div class="container loja-hero__bottom"><span>APPLE / XIAOMI / REALME</span><a href="#descubra">EXPLORE A ${e(config.nome.toUpperCase())} ↓</a><span>01 — CONECTAR</span></div></section>
 <section class="loja-trust"><div class="container">${[['escudo','Produtos originais','Com garantia'],['caminhao',config.cidade+' e região','Entrega a combinar'],['cartao','Compra facilitada','Consulte o parcelamento'],['usuarios','Atendimento próximo','Gente que entende você']].map(([i,t,d])=>`<div>${icon(i)}<p><strong>${t}</strong><span>${d}</span></p></div>`).join('')}</div></section>
 <section class="secao loja-discover" id="descubra"><div class="container"><div class="loja-section-head"><div><p class="rotulo">02 / ESCOLHA SUA CONEXÃO</p><h2>Tem um celular<br>com a sua cara.</h2></div><a class="loja-text-link" href="/vitrine">Explorar catálogo ${icon('seta')}</a></div>
  <div class="loja-brand-grid">${marcas.map(([marca,nome,texto,style],i)=>`<a class="loja-brand loja-brand--${style}" href="/vitrine?marca=${marca}"><span class="loja-brand__number">0${i+1}</span><h3>${nome}</h3><p>${texto}</p><div class="loja-mini-phone"><div></div></div><span class="loja-brand__link">Conhecer ${nome} <b>↗</b></span></a>`).join('')}</div>
  <a class="loja-accessories" href="/vitrine?categoria=acessorios"><span>${icon('fone')}</span><div><small>PEQUENHOS DETALHES. GRANDE DIFERENÇA.</small><h3>O toque final para o seu celular.</h3><p>Cases, películas e acessórios para o seu dia a dia.</p></div><b>Explorar acessórios ↗</b></a>
 </div></section>
 ${destaques.length?`<section class="secao"><div class="container"><div class="loja-section-head"><div><p class="rotulo">SELEÇÃO ${e(config.nome.toUpperCase())}</p><h2>Na nossa vitrine.</h2></div></div><div class="produtos produtos--4">${destaques.map(p=>cardProduto(p,config,pagamento)).join('')}</div></div></section>`:''}
 ${campanhas.some(c=>c.ativo)?`<section class="secao"><div class="container campanhas-grid">${campanhas.filter(c=>c.ativo).map(c=>`<article class="campanha-card">${c.imagem?`<img src="${e(c.imagem)}" alt="" loading="lazy">`:''}<div><h2>${e(c.titulo)}</h2><p>${e(c.texto)}</p><a class="btn btn--primario" href="${e(c.ctaUrl)}">${e(c.ctaRotulo)}</a></div></article>`).join('')}</div></section>`:''}
 <section class="secao loja-repair"><div class="container loja-repair__grid"><div class="loja-repair__art" aria-hidden="true"><span class="loja-repair__label">LAB / ASSISTÊNCIA</span><div class="loja-board"><i></i><i></i><i></i><i></i><span>${e(sigla(config.nome))}<br><small>TECH CARE</small></span></div><p>PRECISÃO EM CADA CONEXÃO.</p></div><div><p class="rotulo">03 / CUIDAR TAMBÉM É CONECTAR</p><h2>Uma nova chance<br>para o seu celular.</h2><p class="lead">Da avaliação ao reparo de placa, a gente cuida do que conecta você. Diagnóstico claro e serviço aprovado por você.</p><ul class="loja-service-list">${servicos.map(s=>`<li>${icon('check')}<span>${e(s.nome)}</span></li>`).join('')}</ul><a class="btn btn--primario" href="/assistencia-tecnica">Conheça nossa assistência ${icon('seta')}</a></div></div></section>
 <section class="secao loja-story"><div class="container"><p class="rotulo">04 / MUITO ALÉM DA COMPRA</p><div class="loja-story__grid"><h2>Você faz parte<br>da nossa história.<br><em>#SouCliente</em></h2><div><p class="lead">A ${e(config.nome)} conecta pessoas às novidades da tecnologia em ${e(config.cidade)}. Com transparência, proximidade e uma equipe que escuta você.</p><a class="loja-text-link" href="/a-loja">Conheça a ${e(config.nome)} ${icon('seta')}</a></div></div>
 ${depoimentos.filter(d=>d.aprovado).length?`<div class="grid grid--3">${depoimentos.filter(d=>d.aprovado).slice(0,3).map(d=>`<figure class="depoimento"><blockquote>“${e(d.texto)}”</blockquote><figcaption>${e(d.nome)} · ${e(d.cidade)}</figcaption></figure>`).join('')}</div>`:''}</div></section>
 ${muralClientes(clientes,config,{rotulo:'05 / QUEM JÁ É DE CASA'})}
 ${faixaContato(config,config.horarios)}`;
 return layout({titulo:`${config.nome} — Mais que celular, conectamos pessoas | ${config.cidade}`,descricao:`Apple, Xiaomi, Realme, acessórios e assistência técnica especializada em ${config.cidade}. Conheça a ${config.nome} e fale com nossa equipe.`,conteudo,ativo:'/',config,horarios:config.horarios});
}
module.exports={home};
