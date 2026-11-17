/* Site público — só o essencial. Tudo que dá para renderizar no servidor
   já vem pronto do servidor; aqui fica menu, simulador e os dois formulários. */
(() => {
  'use strict';

  const menosMovimento = matchMedia('(prefers-reduced-motion: reduce)');

  /* ================================================================
     Animação de entrada e de rolagem

     Sem biblioteca: IntersectionObserver + transição CSS dão o mesmo
     resultado que GSAP+ScrollTrigger para este caso, sem os ~50KB de
     CDN — e velocidade em 4G é requisito crítico do briefing.
     Só transform e opacity são animados (não disparam layout).
     ================================================================ */
  function iniciarAnimacoes() {
    const raiz = document.documentElement;
    if (!raiz.classList.contains('anim')) return;

    // Quem pedir menos movimento recebe o estado final, sem transição.
    if (menosMovimento.matches) {
      raiz.classList.remove('anim');
      return;
    }

    /* A entrada da primeira tela é 100% CSS (@keyframes com fill "backwards").
       Nada de classe via requestAnimationFrame: rAF não roda em aba oculta e
       deixaria o hero invisível para quem abre o link em segundo plano. */

    /* --- Cascata: numera os filhos dos grupos para escalonar o atraso --- */
    document.querySelectorAll('[data-revelar-grupo]').forEach((grupo) => {
      Array.from(grupo.children).forEach((filho, i) => {
        // Além de ~8 itens a cascata começa a parecer lenta; o resto entra junto.
        filho.style.setProperty('--i', Math.min(i, 7));
        if (!filho.hasAttribute('data-revelar')) filho.setAttribute('data-revelar', '');
      });
    });

    /* --- Revelação na rolagem --- */
    const alvos = document.querySelectorAll('[data-revelar], .filete-marca');
    if (!('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('visivel'));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('visivel');
          observador.unobserve(e.target); // anima uma vez só, não fica indo e voltando
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );

    alvos.forEach((el) => observador.observe(el));

    /* Rede de segurança: conteúdo escondido esperando um evento é a única forma
       de o site sumir da tela. Se em 2,5s algo dentro da janela ainda não foi
       revelado, revela na marra. Custa uma varredura e elimina a classe inteira
       de bug "a página abriu em branco". */
    setTimeout(() => {
      alvos.forEach((el) => {
        if (el.classList.contains('visivel')) return;
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          el.classList.add('visivel');
          observador.unobserve(el);
        }
      });
    }, 2500);
  }

  /* ================================================================
     Paralaxe dos elementos decorativos do hero
     Só enfeites — nunca texto ou controle, por conforto de leitura.
     ================================================================ */
  function iniciarParallax() {
    if (menosMovimento.matches) return;

    const camadas = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!camadas.length) return;

    let pendente = false;

    const atualizar = () => {
      pendente = false;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.5) return; // fora de vista, não gasta cálculo
      camadas.forEach((el) => {
        const fator = parseFloat(el.dataset.parallax) || 0;
        el.style.setProperty('--parallax-y', `${(y * fator).toFixed(1)}px`);
      });
    };

    // rAF evita rodar o cálculo mais de uma vez por quadro
    addEventListener(
      'scroll',
      () => {
        if (pendente) return;
        pendente = true;
        requestAnimationFrame(atualizar);
      },
      { passive: true }
    );

    atualizar();
  }

  /* ================================================================
     Cabeçalho ganha corpo depois de sair do topo
     ================================================================ */
  function iniciarCabecalho() {
    const cabecalho = document.querySelector('.cabecalho');
    if (!cabecalho) return;

    let pendente = false;
    let anterior = window.scrollY;
    const atualizar = () => {
      pendente = false;
      const atual = window.scrollY;
      const menuAberto = document.querySelector('.nav.aberto');
      cabecalho.classList.toggle('rolado', atual > 8);
      cabecalho.classList.toggle('cabecalho--oculto', atual > 180 && atual > anterior + 3 && !menuAberto);
      anterior = atual;
    };

    addEventListener(
      'scroll',
      () => {
        if (pendente) return;
        pendente = true;
        requestAnimationFrame(atualizar);
      },
      { passive: true }
    );

    atualizar();
  }

  /* ================================================================
     Progresso, palco do hero e transição de saída entre páginas
     ================================================================ */
  function iniciarProgresso() {
    const barra = document.querySelector('.progresso-scroll span');
    if (!barra) return;

    let pendente = false;
    const atualizar = () => {
      pendente = false;
      const total = document.documentElement.scrollHeight - innerHeight;
      const progresso = total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0;
      barra.style.transform = `scaleX(${progresso})`;
    };

    addEventListener('scroll', () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(atualizar);
    }, { passive: true });
    addEventListener('resize', atualizar, { passive: true });
    atualizar();
  }

  /* ================================================================
     Abertura: o scroll percorre o vídeo e revela a mensagem no final.
     O vídeo é mantido pausado; cada posição da página corresponde a
     um instante exato, então a pessoa pode avançar e voltar livremente.
     ================================================================ */
  function iniciarVideosScroll() {
    const secoes = document.querySelectorAll('[data-scroll-video]');
    if (!secoes.length) return;

    const limitar = (valor, min = 0, max = 1) => Math.min(max, Math.max(min, valor));
    const suavizar = (valor) => valor * valor * (3 - 2 * valor);

    // Onde o alto do aparelho começa dentro do quadro do vídeo, em fração da
    // altura do arquivo, do primeiro ao último instante. A animação levanta o
    // celular: ele sai de 39% do topo e termina colado nele, deixando a metade
    // de baixo do quadro vazia. Valores medidos em /video/abertura-scroll.mp4
    // — se o vídeo for trocado, remeça esta tabela.
    const TOPO_NO_QUADRO = [0.392, 0.2, 0.105, 0.051, 0.02, 0.005, 0.001];

    const topoNoQuadro = (progressoVideo) => {
      const posicao = limitar(progressoVideo) * (TOPO_NO_QUADRO.length - 1);
      const indice = Math.min(TOPO_NO_QUADRO.length - 2, Math.floor(posicao));
      const resto = posicao - indice;
      return TOPO_NO_QUADRO[indice] + (TOPO_NO_QUADRO[indice + 1] - TOPO_NO_QUADRO[indice]) * resto;
    };

    secoes.forEach((secao) => {
      const video = secao.querySelector('[data-scroll-video-media]');
      const sticky = secao.querySelector('.scroll-intro__sticky');
      const media = secao.querySelector('.scroll-intro__media');
      if (!video || !sticky || !media) return;

      let duracao = Number(video.dataset.duration) || 6;
      let quadro = 0;
      let seekAgendado = 0;
      let progressoSuave = null;
      let ultimoFrame = 0;
      let tempoDesejado = 0;

      secao.classList.add('scroll-intro--ativa');
      video.pause();

      const atualizarQuadroDoVideo = () => {
        seekAgendado = 0;
        if (video.readyState < 1 || video.seeking) return;

        // Um seek por quadro real do arquivo evita cancelar a decodificação
        // várias vezes no mesmo frame, principal causa dos trancos no scroll.
        const limiar = Math.max(1 / 30, duracao / 180);
        if (Math.abs(tempoDesejado - video.currentTime) <= limiar) return;
        video.currentTime = tempoDesejado;
      };

      const agendarSeek = () => {
        if (seekAgendado) return;
        seekAgendado = requestAnimationFrame(atualizarQuadroDoVideo);
      };

      const desenhar = (agora = performance.now()) => {
        quadro = 0;

        if (menosMovimento.matches) {
          secao.style.setProperty('--copy-opacity', '1');
          secao.style.setProperty('--copy-x', '0px');
          secao.style.setProperty('--media-x', '0vw');
          secao.style.setProperty('--media-y', '0px');
          secao.style.setProperty('--media-scale', '.94');
          secao.style.setProperty('--hint-opacity', '0');
          secao.classList.add('scroll-intro--texto-visivel');
          if (video.readyState >= 1) video.currentTime = Math.max(0, duracao - 0.04);
          return;
        }

        const retangulo = secao.getBoundingClientRect();
        const topoFixo = parseFloat(getComputedStyle(sticky).top) || 0;
        const percurso = Math.max(1, secao.offsetHeight - sticky.offsetHeight);
        const progressoAlvo = limitar((topoFixo - retangulo.top) / percurso);
        if (progressoSuave === null) progressoSuave = progressoAlvo;

        // Interpolação independente da taxa de atualização. A animação alcança
        // o scroll rapidamente, mas não salta entre posições quando a roda do
        // mouse ou o touchpad entrega eventos maiores e irregulares.
        const delta = ultimoFrame ? Math.min(64, agora - ultimoFrame) : 16.67;
        ultimoFrame = agora;
        const resposta = 1 - Math.exp(-delta * 0.018);
        progressoSuave += (progressoAlvo - progressoSuave) * resposta;
        if (Math.abs(progressoAlvo - progressoSuave) < 0.00015) progressoSuave = progressoAlvo;
        const progresso = progressoSuave;
        const progressoVideo = suavizar(limitar(progresso / 0.72));
        const progressoTexto = suavizar(limitar((progresso - 0.68) / 0.24));
        const recuoParaTexto = suavizar(limitar((progresso - 0.58) / 0.24));
        const zoomFinal = suavizar(limitar((progresso - 0.86) / 0.1));
        const celular = matchMedia('(max-width: 759px)').matches;
        const escalaInicial = celular ? 2.45 : 1.95;
        const escalaIntermediaria = celular ? 1.28 : 1.3;
        const escalaFinal = celular ? 1.62 : 1.58;
        const deslocamentoX = celular ? 0 : (1 - progressoTexto) * 25 - zoomFinal * 2.5;
        const escala = escalaInicial
          + (escalaIntermediaria - escalaInicial) * recuoParaTexto
          + (escalaFinal - escalaIntermediaria) * zoomFinal;

        // Ancoragem pelo topo. O quadro é maior que o palco, então sempre sobra
        // vídeo para fora; sem tratar isso, a sobra some por cima e come as
        // câmeras. Aqui fixamos onde o alto do aparelho deve aparecer e
        // calculamos o empurrão a partir disso — o que passar cai para a base.
        const proporcaoQuadro = video.videoWidth ? video.videoHeight / video.videoWidth : 1080 / 1920;
        const alturaQuadro = Math.min(media.offsetHeight, media.offsetWidth * proporcaoQuadro) * escala;
        let centroDaCaixa = media.offsetHeight / 2;
        for (let no = media; no && no !== sticky; no = no.offsetParent) centroDaCaixa += no.offsetTop;
        // No celular a margem encolhe no fim para o aparelho subir e liberar o
        // texto, que entra logo abaixo dele.
        const margemTopo = sticky.offsetHeight * (celular ? 0.26 - progressoTexto * 0.23 : 0.24);
        const deslocamentoY = margemTopo - centroDaCaixa
          + alturaQuadro * (0.5 - topoNoQuadro(progressoVideo));

        secao.style.setProperty('--copy-opacity', progressoTexto.toFixed(4));
        secao.style.setProperty('--copy-x', `${((1 - progressoTexto) * 34).toFixed(2)}px`);
        secao.style.setProperty('--media-x', `${deslocamentoX.toFixed(3)}vw`);
        secao.style.setProperty('--media-y', `${deslocamentoY.toFixed(2)}px`);
        secao.style.setProperty('--media-scale', escala.toFixed(4));
        secao.style.setProperty('--hint-opacity', limitar(1 - progresso / 0.14).toFixed(4));
        secao.classList.toggle('scroll-intro--texto-visivel', progressoTexto > 0.45);

        tempoDesejado = progressoVideo * Math.max(0, duracao - 0.04);
        agendarSeek();

        if (progressoSuave !== progressoAlvo) agendar();
      };

      const agendar = () => {
        if (quadro) return;
        quadro = requestAnimationFrame(desenhar);
      };

      video.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(video.duration) && video.duration > 0) duracao = video.duration;
        desenhar();
      }, { once: true });
      video.addEventListener('seeked', agendarSeek);
      addEventListener('scroll', agendar, { passive: true });
      addEventListener('resize', agendar, { passive: true });
      menosMovimento.addEventListener('change', agendar);
      desenhar();
    });
  }

  function iniciarPalcoHero() {
    if (menosMovimento.matches || !matchMedia('(pointer: fine)').matches) return;
    const palco = document.querySelector('[data-palco]');
    if (!palco) return;

    palco.addEventListener('pointermove', (ev) => {
      const r = palco.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      palco.style.setProperty('--palco-x', `${(x * 10).toFixed(2)}deg`);
      palco.style.setProperty('--palco-y', `${(-y * 8).toFixed(2)}deg`);
      palco.style.setProperty('--luz-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      palco.style.setProperty('--luz-y', `${((y + 0.5) * 100).toFixed(1)}%`);
    });

    palco.addEventListener('pointerleave', () => {
      palco.style.setProperty('--palco-x', '0deg');
      palco.style.setProperty('--palco-y', '0deg');
      palco.style.setProperty('--luz-x', '50%');
      palco.style.setProperty('--luz-y', '50%');
    });
  }

  function iniciarTransicoesPagina() {
    addEventListener('pageshow', () => document.body.classList.remove('saindo'));

    document.addEventListener('click', (ev) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const link = ev.target.closest('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;

      const destino = new URL(link.href, location.href);
      if (destino.origin !== location.origin || destino.protocol !== location.protocol) return;
      if (destino.pathname === location.pathname && destino.search === location.search && destino.hash) return;

      ev.preventDefault();
      document.body.classList.add('saindo');
      setTimeout(() => location.assign(destino.href), menosMovimento.matches ? 0 : 320);
    });
  }

  iniciarVideosScroll();
  iniciarAnimacoes();
  iniciarParallax();
  iniciarCabecalho();
  iniciarProgresso();
  iniciarPalcoHero();
  iniciarTransicoesPagina();
  iniciarMural();

  // Se a pessoa mudar a preferência de movimento com a página aberta, respeita na hora.
  menosMovimento.addEventListener('change', (ev) => {
    if (ev.matches) {
      document.documentElement.classList.remove('anim');
      document.querySelectorAll('[data-parallax]').forEach((el) => el.style.removeProperty('--parallax-y'));
    }
  });

  /* ================================================================
     Mural #SouCliente

     A animação é CSS; aqui só entram os freios. Três deles:
     o botão de pausa (escolha da pessoa), sair da tela e a aba ficar
     oculta (custo de bateria e CPU por decoração que ninguém está vendo).
     Cada freio é um atributo próprio: voltar a rolar não desfaz a pausa
     que a pessoa pediu.
     ================================================================ */
  function iniciarMural() {
    const murais = document.querySelectorAll('[data-mural]');
    if (!murais.length || menosMovimento.matches) return;

    murais.forEach((mural) => {
      const botao = mural.querySelector('[data-mural-alternar]');
      const rotulo = mural.querySelector('[data-mural-rotulo]');

      if (botao) {
        botao.addEventListener('click', () => {
          const parado = mural.toggleAttribute('data-mural-parado');
          botao.setAttribute('aria-pressed', String(parado));
          if (rotulo) rotulo.textContent = parado ? 'Voltar a passar' : 'Pausar o mural';
        });
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(
          (entradas) => entradas.forEach((entrada) => {
            mural.toggleAttribute('data-mural-fora', !entrada.isIntersecting);
          }),
          { threshold: 0 }
        ).observe(mural);
      }
    });

    document.addEventListener('visibilitychange', () => {
      const oculta = document.visibilityState === 'hidden';
      murais.forEach((mural) => mural.toggleAttribute('data-mural-fora', oculta));
    });
  }

  /* ---------------- Menu no celular ---------------- */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navPrincipal');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const aberto = nav.classList.toggle('aberto');
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    // Esc fecha e devolve o foco ao botão — navegação por teclado.
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && nav.classList.contains('aberto')) {
        nav.classList.remove('aberto');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------------- Utilidades ---------------- */
  const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function mostrarErros(erros, form) {
    form.querySelectorAll('.campo__erro').forEach((el) => {
      el.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));

    let primeiro = null;
    Object.entries(erros || {}).forEach(([campo, msg]) => {
      const alvo = document.getElementById(campo) || form.querySelector(`[name="${CSS.escape(campo)}"]`);
      const caixa = document.getElementById(`erro-${campo}`) || form.querySelector(`[data-erro="${CSS.escape(campo)}"]`);
      if (caixa) caixa.textContent = msg;
      if (alvo) {
        alvo.setAttribute('aria-invalid', 'true');
        if (!primeiro) primeiro = alvo;
      }
    });
    // Erro perto do campo e foco no primeiro problema — não só um resumo no topo.
    if (primeiro) primeiro.focus();
  }

  function aviso(destino, tipo, texto) {
    destino.innerHTML = `<div class="aviso aviso--${tipo}" style="margin-top:var(--s-4)"><span>${texto}</span></div>`;
  }

  async function enviar(url, dados) {
    try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const corpo = await resp.json().catch(() => ({}));
    return { ok: resp.ok, corpo };
    } catch { return { ok: false, corpo: { erro: 'Não foi possível conectar. Tente novamente em instantes.' } }; }
  }

  /* ---------------- Simulador de parcelas ---------------- */
  const sim = document.querySelector('.simulador');
  if (sim) {
    const valor = document.getElementById('simValor');
    const parcelas = document.getElementById('simParcelas');
    const saidaN = document.getElementById('simParcelasSaida');
    const saida = document.getElementById('simSaida');
    const total = document.getElementById('simTotal');
    const whats = document.getElementById('simWhats');

    const juros = Number(sim.dataset.juros) || 0;
    const semJuros = Number(sim.dataset.semJuros) || 0;
    const baseWhats = whats.href.split('?')[0];

    function calcular() {
      const v = Math.max(0, Number(valor.value) || 0);
      const n = Math.max(1, Number(parcelas.value) || 1);
      saidaN.textContent = n;

      let porMes;
      if (n <= semJuros || !juros) {
        porMes = v / n;
      } else {
        const i = juros / 100;
        porMes = (v * i) / (1 - Math.pow(1 + i, -n));
      }

      saida.textContent = `${n}x de ${reais.format(porMes)}`;
      total.textContent =
        n <= semJuros
          ? 'Sem juros. Total: ' + reais.format(v)
          : 'Total com juros: ' + reais.format(porMes * n);

      const msg = `Olá! Simulei no site: ${reais.format(v)} em ${n}x de ${reais.format(porMes)}. Confere?`;
      whats.href = `${baseWhats}?text=${encodeURIComponent(msg)}`;
    }

    valor.addEventListener('input', calcular);
    parcelas.addEventListener('input', calcular);
    calcular();
  }

  /* ---------------- Orçamento de assistência ---------------- */
  const formOrcamento = document.getElementById('formOrcamento');
  if (formOrcamento) {
    const resposta = document.getElementById('respostaOrcamento');
    const botao = formOrcamento.querySelector('button[type="submit"]');
    const textoOriginal = botao.innerHTML;

    formOrcamento.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      botao.disabled = true;
      botao.textContent = 'Enviando...';
      resposta.innerHTML = '';

      const dados = Object.fromEntries(new FormData(formOrcamento).entries());
      const { ok, corpo } = await enviar('/api/orcamento', dados);

      botao.disabled = false;
      botao.innerHTML = textoOriginal;

      if (!ok) {
        if (corpo.erros) mostrarErros(corpo.erros, formOrcamento);
        aviso(resposta, 'erro', corpo.erro || 'Confira os campos marcados acima.');
        return;
      }

      mostrarErros({}, formOrcamento);
      aviso(
        resposta,
        'ok',
        'Pedido registrado! Estamos abrindo seu WhatsApp com a mensagem pronta. ' +
          `Se não abrir, <a href="${corpo.whatsappUrl}" rel="noopener">toque aqui</a>.`
      );
      formOrcamento.reset();
      window.open(corpo.whatsappUrl, '_blank', 'noopener');
    });
  }

  /* ---------------- Carrinho persistente ---------------- */
  const escCart = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CART_KEY = 'suacell.cart.v1';
  const lerCarrinho = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(value)
        ? value.filter((item) => Number.isInteger(item.produtoId) && Number.isInteger(item.quantidade) && item.quantidade > 0).slice(0, 20)
        : [];
    } catch { return []; }
  };
  const salvarCarrinho = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items.slice(0, 20)));
    atualizarContadores();
  };
  function atualizarContadores() {
    const total = lerCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = total; el.hidden = total === 0; });
  }
  function toastSite(texto) {
    const el = document.getElementById('toastSite');
    if (!el) return;
    el.textContent = texto; el.hidden = false;
    clearTimeout(toastSite.timer); toastSite.timer = setTimeout(() => { el.hidden = true; }, 2400);
  }
  document.addEventListener('click', (ev) => {
    const add = ev.target.closest('[data-add-cart]');
    if (add) {
      const id = Number(add.dataset.addCart); const items = lerCarrinho();
      const atual = items.find((item) => item.produtoId === id);
      if (atual) atual.quantidade = Math.min(99, atual.quantidade + 1);
      else if (items.length < 20) items.push({ produtoId: id, quantidade: 1 });
      salvarCarrinho(items); toastSite('Produto adicionado ao carrinho.');
      return;
    }
    const action = ev.target.closest('[data-cart-action]');
    if (!action) return;
    const id = Number(action.dataset.cartId); const items = lerCarrinho(); const item = items.find((x) => x.produtoId === id);
    if (!item) return;
    if (action.dataset.cartAction === 'inc') item.quantidade = Math.min(99, item.quantidade + 1);
    if (action.dataset.cartAction === 'dec') item.quantidade -= 1;
    const next = action.dataset.cartAction === 'remove' ? items.filter((x) => x.produtoId !== id) : items.filter((x) => x.quantidade > 0);
    salvarCarrinho(next); renderCarrinho();
  });
  atualizarContadores();

  const catalogoEl = document.getElementById('cartProducts');
  const catalogo = catalogoEl ? JSON.parse(catalogoEl.textContent || '[]') : [];
  function renderCarrinho() {
    const destino = document.getElementById('cartItems'); if (!destino) return;
    const items = lerCarrinho().map((item) => ({ ...item, produto: catalogo.find((p) => p.id === item.produtoId) })).filter((item) => item.produto);
    const vazio = document.getElementById('cartEmpty'); const form = document.getElementById('formPedido');
    vazio.hidden = items.length > 0; form.closest('.carrinho-resumo').hidden = items.length === 0;
    destino.innerHTML = items.map(({ produto, quantidade }) => `<article class="carrinho-item">
      <div class="carrinho-item__foto">${produto.imagem ? `<img src="${escCart(produto.imagem)}" alt="" width="100" height="100">` : ''}</div>
      <div><a href="/produto/${encodeURIComponent(produto.slug)}"><strong>${escCart(produto.nome)}</strong></a><span>${reais.format(produto.preco)} cada</span></div>
      <div class="carrinho-item__controles">
        <div class="quantidade" aria-label="Quantidade de ${escCart(produto.nome)}"><button type="button" data-cart-action="dec" data-cart-id="${produto.id}" aria-label="Diminuir">−</button><output>${quantidade}</output><button type="button" data-cart-action="inc" data-cart-id="${produto.id}" aria-label="Aumentar">+</button></div>
        <strong>${reais.format(produto.preco * quantidade)}</strong>
        <button class="btn-icone" type="button" data-cart-action="remove" data-cart-id="${produto.id}">Remover</button>
      </div>
    </article>`).join('');
    document.getElementById('cartTotal').textContent = reais.format(items.reduce((s, item) => s + item.produto.preco * item.quantidade, 0));
  }
  renderCarrinho();

  const formPedido = document.getElementById('formPedido');
  if (formPedido) formPedido.addEventListener('submit', async (ev) => {
    ev.preventDefault(); const botao = formPedido.querySelector('button[type="submit"]'); const original = botao.innerHTML;
    botao.disabled = true; botao.textContent = 'Registrando...';
    const dados = Object.fromEntries(new FormData(formPedido).entries()); dados.itens = lerCarrinho();
    const { ok, corpo } = await enviar('/api/pedidos', dados); botao.disabled = false; botao.innerHTML = original;
    if (!ok) { if (corpo.erros) mostrarErros(corpo.erros, formPedido); aviso(document.getElementById('respostaPedido'), 'erro', corpo.erro || 'Confira os campos.'); return; }
    mostrarErros({}, formPedido); salvarCarrinho([]);
    aviso(document.getElementById('respostaPedido'), 'ok', `${corpo.mensagem} <a href="${corpo.whatsappUrl}" rel="noopener">Abrir agora</a>.`);
    window.open(corpo.whatsappUrl, '_blank', 'noopener');
  });

})();
