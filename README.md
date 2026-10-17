# Site do Kit Currículo ATS

Este repositório tem só a pasta `site`. Ele está ligado à Cloudflare Pages: cada envio para a branch `main` atualiza o site sozinho.

- Endereço: https://curriculo.prime.blog.br (também em https://kit-curriculo-ats.pages.dev)

1. Em `config.js`, preencha `metaPixelId`, `product.checkoutUrl`, `support.email` e `legal`.
2. Envie a mudança e confira o Pixel com a extensão Meta Pixel Helper (PageView, ViewContent e InitiateCheckout).

O passo a passo completo está no documento "Plano de lançamento: Kit Currículo ATS".

**Importante:** o navegador guarda `config.js`, `script.js` e `style.css` por até 4 horas. Depois de mudar qualquer um deles, troque o número em `?v=...` nas tags `<script>`/`<link>` de todas as páginas `.html`, para os visitantes receberem a versão nova na hora.
