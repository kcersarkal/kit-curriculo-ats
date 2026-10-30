/**
 * MetaFlow Tracker - Script Oficial de Rastreamento & Atribuição de Tráfego
 * Equivalente Enterprise ao script de atribuição da Utmify.
 *
 * Funcionalidades:
 * 1. Captura dinâmica de parâmetros: utm_source, utm_medium, utm_campaign, utm_content, utm_term, placement, fbclid, gclid, ttclid, src, sck.
 * 2. Persistência em First-Party Cookies (30 dias) e LocalStorage (garante atribuição mesmo se o cliente navegar ou fechar e voltar).
 * 3. Decoração Automática de Links de Checkout (Kiwify, Cakto, Hotmart, Eduzz, Braip, PerfectPay, Kirvano, Greenn, etc.).
 * 4. Suporte a botões atrasados em VSL / Elementos dinâmicos via MutationObserver.
 * 5. Injeção automática em formulários de captura de leads (<form>).
 * 6. Disparo não-bloqueante de pageview/clique via sendBeacon / fetch keepalive.
 *
 * Como usar:
 * <script src="https://SEU-DOMINIO/server/track.js" defer></script>
 * ou
 * <script src="https://SEU-DOMINIO/tracker.js" defer></script>
 */

(function () {
  'use strict';

  var COOKIE_EXPIRY_DAYS = 30;
  var STORAGE_KEY = 'metaflow_utm_params';
  var UTM_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'placement',
    'fbclid',
    'gclid',
    'ttclid',
    'src',
    'sck'
  ];

  var CHECKOUT_DOMAINS = [
    'kiwify.com.br',
    'pay.kiwify.com.br',
    'cakto.com.br',
    'pay.cakto.com.br',
    'hotmart.com',
    'pay.hotmart.com',
    'eduzz.com',
    'sun.eduzz.com',
    'braip.com',
    'checkout.perfectpay.com.br',
    'perfectpay.com.br',
    'monetizze.com.br',
    'kirvano.com',
    'greenn.com.br',
    'ticto.com.br',
    'checkout.ticto.app',
    'pag.ae',
    'mercadopago.com',
    'stripe.com'
  ];

  // Identifica o endpoint do servidor de rastreamento
  function getEndpoint() {
    try {
      if (window.SITE_CONFIG && window.SITE_CONFIG.trackerUrl) return window.SITE_CONFIG.trackerUrl;
      if (window.TRACKER_ENDPOINT) return window.TRACKER_ENDPOINT;
      var current = document.currentScript;
      if (current && current.src) {
        var base = current.src.split('?')[0];
        var resolved = base.replace(/\/server\/track\.js$|\/tracker\.js$/, '') + '/api/track/click';
        if (!resolved.includes(window.location.hostname)) return resolved;
      }
    } catch (e) {}
    return 'http://207.180.246.115:3333/api/track/click';
  }

  // Utilitários de Cookies
  function setCookie(name, value, days) {
    try {
      var d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = 'expires=' + d.toUTCString();
      document.cookie = name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/;SameSite=Lax';
    } catch (e) {}
  }

  function getCookie(name) {
    try {
      var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    } catch (e) {
      return null;
    }
  }

  // Utilitários de Armazenamento Local
  function getStoredUtms() {
    var data = {};
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw) || {};
    } catch (e) {}

    // Fallback para Cookies caso localStorage esteja limpo
    UTM_KEYS.forEach(function (k) {
      if (!data[k]) {
        var c = getCookie('mf_' + k);
        if (c) data[k] = c;
      }
    });

    return data;
  }

  function saveUtms(utms) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
    } catch (e) {}

    UTM_KEYS.forEach(function (k) {
      if (utms[k]) {
        setCookie('mf_' + k, utms[k], COOKIE_EXPIRY_DAYS);
      }
    });
  }

  // Captura os parâmetros da URL atual
  function extractCurrentParams() {
    var params = {};
    try {
      var search = window.location.search;
      if (search) {
        var query = new URLSearchParams(search);
        UTM_KEYS.forEach(function (key) {
          var val = query.get(key);
          if (val) params[key] = val.trim();
        });
      }
    } catch (e) {}
    return params;
  }

  // Combina UTMs novas com UTMs salvas anteriormente
  function resolveUtms() {
    var stored = getStoredUtms();
    var current = extractCurrentParams();
    var merged = Object.assign({}, stored, current);

    // Mapeamento automático de placement se não vier explícito
    if (!merged.placement && merged.utm_medium) {
      merged.placement = merged.utm_medium;
    }

    // Se tiver novas UTMs válidas, persiste
    if (Object.keys(current).length > 0) {
      saveUtms(merged);
    }

    return merged;
  }

  var activeUtms = resolveUtms();

  // Decora links de checkout com os parâmetros UTM
  function decorateUrl(rawUrl, utms) {
    if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
    if (rawUrl.startsWith('#') || rawUrl.startsWith('javascript:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('mailto:')) {
      return rawUrl;
    }

    try {
      var url = new URL(rawUrl, window.location.origin);
      var isCheckout = CHECKOUT_DOMAINS.some(function (domain) {
        return url.hostname === domain || url.hostname.endsWith('.' + domain);
      });

      var hasExplicitAttr = false;

      if (!isCheckout && !hasExplicitAttr) {
        return rawUrl;
      }

      // Injeta os parâmetros na URL de destino se ainda não existirem
      Object.keys(utms).forEach(function (k) {
        if (utms[k] && !url.searchParams.has(k)) {
          url.searchParams.set(k, utms[k]);
        }
      });

      // Parâmetros especiais de afiliado/origem Kiwify & Hotmart
      if (!url.searchParams.has('src') && utms.utm_source) {
        url.searchParams.set('src', utms.utm_source);
      }
      if (!url.searchParams.has('sck') && utms.utm_campaign) {
        url.searchParams.set('sck', utms.utm_campaign);
      }

      return url.toString();
    } catch (e) {
      return rawUrl;
    }
  }

  // Aplica a decoração em todos os links e botões da página
  function decorateAllLinks() {
    if (!activeUtms || Object.keys(activeUtms).length === 0) return;

    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href');
      if (href) {
        var decorated = decorateUrl(href, activeUtms);
        if (decorated !== href) {
          a.setAttribute('href', decorated);
        }
      }
    }

    // Formulários: adiciona campos hidden para submissão
    var forms = document.querySelectorAll('form');
    for (var j = 0; j < forms.length; j++) {
      var form = forms[j];
      Object.keys(activeUtms).forEach(function (k) {
        if (!form.querySelector('input[name="' + k + '"]')) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = activeUtms[k];
          form.appendChild(input);
        }
      });
    }
  }

  // Disparo de notificação de acesso ao servidor MetaFlow
  function sendTrackEvent() {
    if (!activeUtms.utm_source && !activeUtms.utm_campaign && !activeUtms.placement && !activeUtms.fbclid) {
      return; // Acesso direto orgânico sem tráfego pago associado
    }

    var endpoint = getEndpoint();
    var payload = {
      name: 'Visitante Anônimo',
      utm_source: activeUtms.utm_source || 'facebook',
      utm_campaign: activeUtms.utm_campaign || 'Tráfego Pago',
      utm_content: activeUtms.utm_content || 'Criativo Meta',
      utm_medium: activeUtms.utm_medium || '',
      utm_term: activeUtms.utm_term || '',
      placement: activeUtms.placement || activeUtms.utm_medium || 'Feed/Reels',
      fbclid: activeUtms.fbclid || '',
      url: window.location.href,
      referrer: document.referrer || ''
    };

    var bodyString = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([bodyString], { type: 'text/plain;charset=UTF-8' });
        if (navigator.sendBeacon(endpoint, blob)) return;
      } catch (e) {}
    }

    if (window.fetch) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: bodyString,
        keepalive: true
      }).catch(function () {});
    }
  }

  // Observador de mutações para elementos dinâmicos (ex: botões de VSL atrasados)
  function setupMutationObserver() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      var shouldDecorate = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          shouldDecorate = true;
          break;
        }
      }
      if (shouldDecorate) {
        decorateAllLinks();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Inicialização
  function init() {
    decorateAllLinks();
    setupMutationObserver();
    sendTrackEvent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API Global disponível para desenvolvedor ou scripts de terceiros
  var api = {
    getUtms: function () {
      return Object.assign({}, activeUtms);
    },
    decorateLinks: decorateAllLinks,
    decorateUrl: function (url) {
      return decorateUrl(url, activeUtms);
    },
    setUtm: function (key, val) {
      activeUtms[key] = val;
      saveUtms(activeUtms);
      decorateAllLinks();
    }
  };

  window.MetaTracker = api;
  window.utmify = api; // Compatibilidade com chamadas legado Utmify
})();
