// api/create-payment-local.js  (format Vercel Serverless Function)
//
// Initie un paiement Mobile Money (Orange Money, MTN Money, Wave, Moov)
// via CinetPay pour une commande passée depuis la zone Afrique de l'Ouest.
//
// Variables d'environnement à définir dans Vercel > Project > Settings > Environment Variables :
//   CINETPAY_API_KEY
//   CINETPAY_SITE_ID
//   SITE_URL   (ex: https://maison-wovi.vercel.app)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { amountFcfa, description, customerName, customerPhone } = req.body || {};

    if (!amountFcfa || !description) {
      return res.status(400).json({ error: "amountFcfa et description sont requis" });
    }

    const transactionId = "WOVI-" + Date.now();

    const payload = {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: amountFcfa,
      currency: "XOF",
      description,
      customer_name: customerName || "Client",
      customer_phone_number: customerPhone || "",
      notify_url: `${process.env.SITE_URL}/api/webhook-cinetpay`,
      return_url: `${process.env.SITE_URL}/confirmation.html?ref=${transactionId}`,
      channels: "ALL", // laisse le client choisir Orange/MTN/Moov/Wave
    };

    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.code !== "201" && data.code !== 201) {
      return res.status(400).json({ error: "Échec de création du paiement CinetPay", details: data });
    }

    // TODO production : enregistrer la commande (transactionId, montant, produits,
    // coordonnées client) avant de renvoyer l'URL de paiement.

    return res.status(200).json({
      paymentUrl: data.data.payment_url,
      transactionId,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
}
