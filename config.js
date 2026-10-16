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
    salePrice: "R$ 39,90",

    // Link do checkout do produto principal na Kiwify (ou Cakto).
    // O order bump de R$ 14,90 é configurado dentro da própria Kiwify.
    checkoutUrl: "https://pay.kiwify.com.br/SEU-LINK",

    // Garantia incondicional (em dias), obrigatória pelo CDC (Art. 49)
    guaranteeDays: 7
  },

  // Suporte 100% automático por e-mail (sem WhatsApp)
  support: {
    email: "suporte@seudominio.com",
    membersAreaUrl: "https://dashboard.kiwify.com.br" // área de membros da Kiwify
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
