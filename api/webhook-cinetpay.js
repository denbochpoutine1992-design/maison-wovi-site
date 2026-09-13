// api/webhook-cinetpay.js  (format Vercel Serverless Function)
//
// CinetPay appelle cette URL automatiquement après une tentative de paiement.
// On ne fait jamais confiance au contenu du webhook seul : on revérifie
// le statut réel auprès de l'API CinetPay avant de valider la commande.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  try {
    const body = req.body || {};
    const transactionId = body.cpm_trans_id || body.transaction_id;

    if (!transactionId) {
      return res.status(400).send("transaction_id manquant");
    }

    const checkResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: transactionId,
      }),
    });

    const result = await checkResponse.json();
    const isPaid = result.data && result.data.status === "ACCEPTED";

    if (isPaid) {
      // TODO production :
      // 1. Marquer la commande "payée" dans votre base de données
      // 2. Envoyer une confirmation au client (email ou WhatsApp Business API)
      // 3. Notifier votre équipe
      console.log("Paiement confirmé :", transactionId);
    } else {
      console.log("Paiement non confirmé ou échoué :", transactionId, result);
    }

    return res.status(200).send("OK");
  } catch (err) {
    return res.status(500).send("Erreur serveur : " + err.message);
  }
}
