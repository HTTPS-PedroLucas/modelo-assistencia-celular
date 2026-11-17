# Modelo — site para assistência técnica e loja de celulares

Modelo de site completo para lojas de celular e assistências técnicas: vitrine com carrinho que fecha o pedido pelo WhatsApp, pedido de orçamento de reparo, páginas de garantia, pagamento e entrega, mural de fotos de clientes e painel administrativo.

A marca "Sua Cell", o endereço, a cidade e o telefone são fictícios. Nome, contato, horários, textos, serviços e fotos são editados pelo painel; o logo é uma assinatura gerada a partir do nome cadastrado.

## Rodar a prévia

```bash
npm install
npm run preview
```

A prévia usa banco em memória (pg-mem) e imprime o login de administrador local no terminal.

## Produção

1. Crie um PostgreSQL e preencha `.env` a partir de `.env.example`.
2. `npm run db:migrate` e depois `npm run db:seed` para criar o administrador.
3. Configure o Cloudinary (uploads) e `SITE_URL` com o domínio da loja.
4. `npm start`. O `render.yaml` já descreve o serviço e o banco no Render.

## O que tem

- **Vitrine**: celulares, acessórios e películas com filtro por marca e categoria; o carrinho registra o pedido e abre o WhatsApp com a lista.
- **Assistência técnica**: serviços cadastráveis e formulário de orçamento que vira ordem de reparo no painel.
- **Mural de clientes**: fotos aprovadas no painel passam na tela em duas faixas (grade fixa com menos de 6 fotos, nada com zero). Pausa por botão, ao passar o mouse e fora da tela; respeita `prefers-reduced-motion`.
- **Painel**: produtos, serviços, campanhas, depoimentos, mural, pedidos, reparos, configuração da loja.
- **Paleta**: preto, cinza e branco, com contraste AA medido. O vermelho fica só para erro de formulário.

## Regras do conteúdo

Nada de preço, estoque ou depoimento inventado: seções sem conteúdo aprovado não aparecem. Foto de cliente só entra com autorização da pessoa.

## Testes

```bash
npm test
```

Integração com pg-mem e Supertest: migrações, páginas e sitemap, proteção do painel, login, CRUD, cálculo de pedidos, orçamentos e o mural.
