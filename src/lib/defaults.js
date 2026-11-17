/** Conteúdo-modelo. Sem preços, estoque ou depoimentos inventados. */
module.exports = {
 config: {
  nome:'Sua Cell', assinatura:'Sempre conectando você', propostaValor:'Mais que celular, conectamos pessoas.',
  subtitulo:'Celulares, acessórios e assistência especializada. Uma equipe perto de você, no centro de Sua Cidade.',
  whatsapp:'5500900000000', whatsappExibicao:'(00) 9 0000-0000', instagram:'',
  endereco:'Rua Exemplo, 100', bairro:'Centro', cidade:'Sua Cidade', estado:'UF', cep:'',
  mapsQuery:'Rua Exemplo, 100, Centro, Sua Cidade - UF', conteudoValidado:false,
  horarios:[{dia:'Segunda a sexta',hora:'7h30 às 18h'},{dia:'Sábado',hora:'7h30 às 14h30'}],
  pendencias:['Cadastrar catálogo real com modelos, fotos autorizadas, preços e disponibilidade.','Enviar o logo da loja; o site usa uma assinatura tipográfica gerada a partir do nome.','Confirmar Instagram, condições de pagamento, garantia e entrega.','Cadastrar fotos da loja, consultoras e depoimentos autorizados.','Validar contato, horários e a história da loja.']
 },
 pagamento:{resumo:'Pagamento seguro e parcelamento facilitado. Consulte as condições para o aparelho escolhido.',formas:[{nome:'Parcelamento facilitado',detalhe:'A equipe informa parcelas, entrada e valor final antes da compra.'}],maxParcelas:1,parcelasSemJuros:0,jurosMes:0,carne:{disponivel:false,texto:'Consulte as opções com a equipe.'},aceitaUsado:{disponivel:false,texto:'Condições confirmadas no atendimento.'},documentos:[]},
 garantia:{resumo:'Aparelhos originais com garantia. A equipe explica a cobertura de cada produto e serviço.',itens:[{categoria:'Celulares',prazo:'Conforme o produto',detalhe:'Confirme prazo e cobertura antes da compra.'},{categoria:'Acessórios',prazo:'Conforme o item',detalhe:'Consulte as condições do acessório escolhido.'},{categoria:'Assistência técnica',prazo:'Informado no orçamento',detalhe:'Diagnóstico, prazo e garantia apresentados antes da aprovação.'}],comoAcionar:['Fale com a Sua Cell pelo WhatsApp.','Informe o produto ou serviço e tenha o comprovante em mãos.','A equipe orienta os próximos passos.'],politicaTroca:'Consulte a equipe para conhecer as condições de troca aplicáveis à sua compra.'},
 entrega:{resumo:'Entrega em Sua Cidade e região, com disponibilidade, taxa e prazo confirmados no atendimento.',local:{prazo:'Prazo a combinar',taxa:'Taxa conforme endereço',bairros:['Centro']},cidades:['Sua Cidade'],cidadesTexto:'Informe sua cidade e endereço para confirmar cobertura e valor da entrega.',retirada:'Rua Exemplo, 100, Centro, Sua Cidade – UF.'},
 categorias:[{slug:'celulares',nome:'Celulares',descricao:'Encontre seu próximo Apple, Xiaomi ou Realme.',destaque:true},{slug:'acessorios',nome:'Acessórios',descricao:'Cases e acessórios para acompanhar seu dia.',destaque:true},{slug:'peliculas',nome:'Películas',descricao:'Proteção para a tela do seu aparelho.',destaque:true}],
 marcas:['Apple','Xiaomi','Realme','Outras'], produtos:[],
 servicos:[{id:1,nome:'Reparo de placa',descricao:'Avaliação especializada para falhas na placa do aparelho, incluindo iPhone.',prazo:'Após diagnóstico',garantia:'Informada no orçamento',faixa:'Solicite uma avaliação'},{id:2,nome:'Reparo e manutenção',descricao:'Conte o que aconteceu com seu celular. Nossa equipe avalia o problema e apresenta as opções de reparo.',prazo:'Após diagnóstico',garantia:'Informada no orçamento',faixa:'Consulte a equipe'}],
 assistenciaInfo:{chamada:'Seu celular merece uma nova chance.',texto:'Do diagnóstico ao reparo de placa, conte com assistência especializada e um atendimento transparente.',diferenciais:['Assistência especializada em Sua Cidade','Diagnóstico antes da aprovação','Prazo e valor explicados pela equipe','Acompanhamento pelo WhatsApp']},
 sobreLoja:{titulo:'Conectando histórias.',texto:'A Sua Cell faz parte do dia a dia de Sua Cidade com celulares, acessórios e assistência técnica. Acreditamos em atendimento próximo, transparência e uma experiência que continua depois da compra.',fotos:[]},
 tips:[],campanhas:[],equipe:[],depoimentos:[],clientes:[],leads:[],reparos:[],usuarios:[]
};
