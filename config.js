/**
 * ====================================================================
 * CONFIGURAÇÃO CENTRAL DO SITE: KIT CURRÍCULO ATS
 * ====================================================================
 * Edite apenas os valores abaixo. O site atualiza preços, links e Pixel sozinho.
 */

const SITE_CONFIG = {
  // Pixel da Meta (Gerenciador de Eventos > Conectar dados > Web).
  // Cole só o número do ID. Deixe vazio ("") para desligar.
  metaPixelId: "",

  product: {
    name: "Kit Currículo ATS",
    // Preço de lançamento, cobrado até launchEndsAt.
    salePrice: "R$ 27,90",

    // Preço normal. Depois de launchEndsAt o site passa a mostrar só este preço.
    // Lembre de mudar o preço na Cakto para este valor na mesma data.
    regularPrice: "R$ 39,90",

    // Fim do preço de lançamento (horário de Brasília). Deixe "" para desligar a promoção.
    launchEndsAt: "2026-10-23T23:59:59-03:00",

    // Link do checkout do produto principal na Cakto.
    // O order bump de R$ 14,90 (scripts do LinkedIn) é configurado dentro da Cakto.
    checkoutUrl: "https://pay.cakto.com.br/mofs5mf",

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
    ownerName: "Seu Nome Completo ou Razão Social",
    document: "CPF ou CNPJ: 00.000.000/0000-00"
  }
};

// Exporta globalmente para uso no browser e em ambientes de teste
if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_CONFIG;
}
