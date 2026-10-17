/**
 * ====================================================================
 * LOGICA INTERATIVA - FUNIL DE VENDAS LOW TICKET
 * ====================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializa Injeção de Dados do SITE_CONFIG
  applySiteConfig();

  // 2. Pixel da Meta (PageView, ViewContent e InitiateCheckout)
  initMetaPixel();

  // 3. Inicializa Accordion do FAQ
  initFaqAccordion();

  // 4. Confete para a Página de Obrigado (se estiver nela)
  if (document.getElementById("confetti-canvas")) {
    initConfettiCelebration();
  }
});

/**
 * Aplica automaticamente as configurações do config.js no HTML
 * e repassa parâmetros UTM para os links de checkout.
 */
function applySiteConfig() {
  if (typeof window.SITE_CONFIG === "undefined") return;
  const config = window.SITE_CONFIG;

  // Repasse de UTMs da URL atual para os botões de checkout
  const currentParams = window.location.search;

  function appendUtm(url) {
    if (!url || !currentParams) return url;
    const separator = url.includes("?") ? "&" : "?";
    return url + separator + currentParams.substring(1);
  }

  // Preço de lançamento: depois da data, o preço exibido volta ao normal
  // e os avisos de lançamento somem.
  const product = config.product || {};
  const launchEnd = product.launchEndsAt ? new Date(product.launchEndsAt) : null;
  const launchActive = Boolean(launchEnd && product.regularPrice && Date.now() < launchEnd.getTime());
  if (!launchActive && product.regularPrice) {
    product.salePrice = product.regularPrice;
  }
  document.querySelectorAll("[data-launch-only]").forEach(el => {
    el.hidden = !launchActive;
  });
  if (launchActive) {
    const dateText = launchEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
    document.querySelectorAll("[data-launch-date]").forEach(el => { el.textContent = dateText; });
    startLaunchCountdown(launchEnd);
  }

  // Preenche textos simples marcados com data-config
  document.querySelectorAll("[data-config]").forEach(el => {
    const key = el.getAttribute("data-config");
    const val = getNestedValue(config, key);
    if (val !== undefined) {
      el.textContent = val;
    }
  });

  // Preço por modelo (salePrice dividido pelos 10 modelos)
  document.querySelectorAll("[data-price-per-model]").forEach(el => {
    const n = parsePrice(config.product && config.product.salePrice);
    if (n) el.textContent = "R$ " + (n / 10).toFixed(2).replace(".", ",");
  });

  // Preenche links de checkout
  document.querySelectorAll("[data-checkout-btn]").forEach(btn => {
    btn.setAttribute("href", appendUtm(config.product.checkoutUrl));
  });

  // Preenche botões de E-mail de Suporte
  document.querySelectorAll("[data-support-email]").forEach(btn => {
    if (config.support && config.support.email) {
      btn.setAttribute("href", `mailto:${config.support.email}?subject=Dúvida%20sobre%20o%20Kit%20Currículo%20ATS`);
      btn.textContent = config.support.email;
    }
  });

  // Ano atual no rodapé
  document.querySelectorAll(".current-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Preenche links de Acesso Direto / Área de Membros Cakto
  document.querySelectorAll("[data-members-btn]").forEach(btn => {
    if (config.support && config.support.membersAreaUrl) {
      btn.setAttribute("href", config.support.membersAreaUrl);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    }
  });
}

/**
 * Contagem regressiva até o fim do preço de lançamento.
 * Quando chega a zero, recarrega a página para mostrar o preço normal.
 */
function startLaunchCountdown(endDate) {
  const els = document.querySelectorAll("[data-countdown]");
  if (!els.length) return;
  const pad = n => String(n).padStart(2, "0");

  function tick() {
    const left = endDate.getTime() - Date.now();
    if (left <= 0) {
      clearInterval(timer);
      window.location.reload();
      return;
    }
    const s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400);
    const text = (d > 0 ? d + "d " : "") + pad(Math.floor(s % 86400 / 3600)) + "h " + pad(Math.floor(s % 3600 / 60)) + "m " + pad(s % 60) + "s";
    els.forEach(el => { el.textContent = text; });
  }

  const timer = setInterval(tick, 1000);
  tick();
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

/**
 * Pixel da Meta
 * A compra (Purchase) é registrada pela Cakto, que tem o mesmo Pixel configurado.
 * Aqui medimos a página: PageView, ViewContent e InitiateCheckout no clique do botão.
 */
function initMetaPixel() {
  const config = window.SITE_CONFIG || {};
  const pixelId = String(config.metaPixelId || "").trim();
  if (!pixelId) return;

  /* Código base oficial do Pixel da Meta */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,"script","https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");

  const price = parsePrice(config.product && config.product.salePrice);
  const productName = (config.product && config.product.name) || "";

  // ViewContent só na página de vendas
  if (document.querySelector("[data-checkout-btn]")) {
    window.fbq("track", "ViewContent", { content_name: productName, value: price, currency: "BRL" });
  }

  document.querySelectorAll("[data-checkout-btn]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.fbq("track", "InitiateCheckout", { content_name: productName, value: price, currency: "BRL" });
    });
  });
}

function parsePrice(text) {
  if (!text) return 0;
  const n = parseFloat(String(text).replace(/[^0-9,]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

/**
 * FAQ Accordion Interativo
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  function setOpen(item, open) {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    item.classList.toggle("active", open);
    if (question) question.setAttribute("aria-expanded", open ? "true" : "false");
    // Altura real do conteúdo: respostas longas não ficam cortadas no celular
    if (answer) answer.style.maxHeight = open ? answer.scrollHeight + 40 + "px" : "0px";
  }

  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Fecha todos os outros para manter a tela limpa
      faqItems.forEach(other => setOpen(other, false));

      // Alterna o clicado
      if (!isActive) {
        setOpen(item, true);
      }
    });
  });
}

/**
 * Animação de Confetes em Canvas para a Página de Obrigado
 */
function initConfettiCelebration() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const pieces = [];
  const numberOfPieces = 60;
  const colors = ["#10B981", "#34D399", "#F59E0B", "#FBBF24", "#3B82F6", "#8B5CF6", "#EC4899"];

  function Piece(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 6;
    this.gravity = Math.random() * 2 + 1.5;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speedX = Math.random() * 6 - 3;
  }

  Piece.prototype.update = function() {
    this.y += this.gravity;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    if (this.y > height) {
      this.y = -20;
      this.x = Math.random() * width;
    }
  };

  Piece.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  };

  for (let i = 0; i < numberOfPieces; i++) {
    pieces.push(new Piece(Math.random() * width, Math.random() * height - height));
  }

  let animationFrame;
  let duration = 0;

  function animate() {
    ctx.clearRect(0, 0, width, height);
    pieces.forEach(p => {
      p.update();
      p.draw();
    });

    duration++;
    // Confete ativo por ~3,5 segundos (mais discreto)
    if (duration < 210) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  animate();
}
