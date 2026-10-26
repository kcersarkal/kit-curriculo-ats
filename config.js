/**
 * ====================================================================
 * CONFIGURAÇÃO CENTRAL DO SITE: KIT CURRÍCULO ATS
 * ====================================================================
 * Edite apenas os valores abaixo. O site atualiza preços, links e Pixel sozinho.
 */

const SITE_CONFIG = {
  // Pixel da Meta (Gerenciador de Eventos > Conectar dados > Web).
  // Cole só o número do ID. Deixe vazio ("") para desligar.
  metaPixelId: "2119939941945793",

  product: {
    name: "Kit Currículo ATS",
    // Preço de lançamento, cobrado até launchEndsAt.
    salePrice: "R$ 27,90",

    // Preço normal. Depois de launchEndsAt o site passa a mostrar só este preço.
    regularPrice: "R$ 38,90",

    // Fim do preço de lançamento (horário de Brasília). Deixe "" para desligar a promoção.
    launchEndsAt: "2026-10-31T23:59:59-03:00",

    // Links do checkout na Cakto: cada oferta tem o seu preço.
    // Até launchEndsAt os botões usam launchCheckoutUrl (oferta de R$ 27,90);
    // depois, checkoutUrl (oferta de R$ 38,90). A troca é automática.
    // O order bump de R$ 14,90 (scripts do LinkedIn) é configurado dentro da Cakto.
    launchCheckoutUrl: "https://pay.cakto.com.br/mofs5mf",
    checkoutUrl: "https://pay.cakto.com.br/ru957qu",

    // Garantia incondicional (em dias), obrigatória pelo CDC (Art. 49)
    guaranteeDays: 7
  },

  // Suporte 100% automático por e-mail (sem WhatsApp)
  support: {
    email: "prime.contatos.negocios@gmail.com",
    membersAreaUrl: "https://aluno.cakto.com.br/auth/login" // área do comprador na Cakto
  },

  // Dados que aparecem nos Termos e na Política de Privacidade
  legal: {
    ownerName: "Julio Souza",
    document: "" // CPF ou CNPJ (opcional; hoje não aparece no site)
  }
};

// Exporta globalmente para uso no browser e em ambientes de teste
if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_CONFIG;
}
