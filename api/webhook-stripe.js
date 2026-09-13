// api/webhook-stripe.js  (format Vercel Serverless Function)
//
// Stripe exige le corps BRUT (non parsé) de la requête pour vérifier la
// signature — on désactive donc le bodyParser automatique de Vercel
// et on lit le flux manuellement.
//
// Variables d'environnement à définir dans Vercel :
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET

import Stripe from "stripe";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send("Signature webhook invalide : " + err.message);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // TODO production :
    // 1. Marquer la commande "payée" dans votre base de données (via session.id)
    // 2. Envoyer un email de confirmation avec le rappel sur les frais de douane
    // 3. Notifier votre équipe
    console.log("Paiement Stripe confirmé :", session.id, session.amount_total, session.currency);
  }

  return res.status(200).send("OK");
}
