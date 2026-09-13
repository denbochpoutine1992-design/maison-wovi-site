// api/create-payment-intl.js  (format Vercel Serverless Function)
//
// Crée une session Stripe Checkout pour une commande internationale (EUR/USD).
//
// Variables d'environnement à définir dans Vercel :
//   STRIPE_SECRET_KEY
//   SITE_URL

import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { productName, amountCents, currency, quantity } = req.body || {};

    if (!productName || !amountCents || !currency) {
      return res.status(400).json({ error: "productName, amountCents et currency sont requis" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: productName },
            unit_amount: amountCents,
          },
          quantity: quantity || 1,
        },
      ],
      success_url: `${process.env.SITE_URL}/confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/produit.html`,
      custom_text: {
        submit: {
          message:
            "Des frais de douane peuvent s'appliquer à la réception selon votre pays. Ils ne sont pas inclus dans ce montant.",
        },
      },
    });

    // TODO production : enregistrer la commande (session.id, produit, montant)
    // avant de renvoyer l'URL de paiement.

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
}
