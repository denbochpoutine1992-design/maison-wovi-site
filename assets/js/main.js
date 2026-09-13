// ============================================================
// Etat de marché en mémoire (pas de localStorage — état de session)
// ============================================================
let CURRENT_MARKET = "local"; // "local" (CEDEAO / FCFA) ou "intl" (EUR)

function formatPrice(fcfa, eur){
  if (CURRENT_MARKET === "local"){
    return Number(fcfa).toLocaleString("fr-FR") + " FCFA";
  }
  return eur;
}

function applyMarket(market){
  CURRENT_MARKET = market;
  document.body.classList.toggle("market-local", market === "local");
  document.body.classList.toggle("market-intl", market === "intl");

  document.querySelectorAll("[data-fcfa]").forEach(function(el){
    var fcfa = el.getAttribute("data-fcfa");
    var eur  = el.getAttribute("data-eur");
    var oldFcfa = el.getAttribute("data-old-fcfa");
    var oldEur  = el.getAttribute("data-old-eur");
    var html = "";
    if (oldFcfa && oldEur){
      html += '<span class="old">' + formatPrice(oldFcfa, oldEur) + "</span>";
    }
    html += formatPrice(fcfa, eur);
    el.innerHTML = html;
  });

  document.querySelectorAll(".market-toggle button").forEach(function(btn){
    btn.classList.toggle("active", btn.getAttribute("data-market") === market);
  });
}

document.addEventListener("DOMContentLoaded", function(){
  // Marché : bouton switch
  document.querySelectorAll(".market-toggle button").forEach(function(btn){
    btn.addEventListener("click", function(){
      applyMarket(btn.getAttribute("data-market"));
    });
  });
  applyMarket(CURRENT_MARKET);

  // Nav mobile
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav){
    toggle.addEventListener("click", function(){
      nav.classList.toggle("open");
    });
  }

  // Sélecteur de taille (page produit)
  document.querySelectorAll(".size-select button").forEach(function(btn){
    btn.addEventListener("click", function(){
      document.querySelectorAll(".size-select button").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });

  // Galerie produit : clic vignette -> visuel principal
  document.querySelectorAll(".gallery-thumbs .swatch").forEach(function(thumb){
    thumb.addEventListener("click", function(){
      var main = document.querySelector(".gallery-main");
      if (!main) return;
      main.className = "swatch gallery-main " + thumb.getAttribute("data-swatch-class");
      main.setAttribute("data-label", thumb.getAttribute("data-label"));
    });
  });

  // Formulaire de contact (démo — pas de backend connecté)
  var form = document.querySelector(".contact-form");
  if (form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var note = document.querySelector(".form-note");
      if (note){
        note.textContent = "Message prêt à être envoyé — connectez ce formulaire à votre messagerie ou à WhatsApp pour le rendre fonctionnel.";
      }
    });
  }
});
