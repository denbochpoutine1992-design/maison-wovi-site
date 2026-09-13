# Déployer Maison Wovi avec Termux + GitHub + Vercel

Ce site est un front-end statique (HTML/CSS/JS) accompagné de fonctions serverless
dans le dossier `api/`, au format attendu nativement par Vercel — aucune conversion
supplémentaire n'est nécessaire de votre côté, c'est déjà prêt pour ce workflow.

## 1. Préparer Termux

```bash
pkg update && pkg upgrade
pkg install git nodejs
```

Vérifiez que tout est bien installé :

```bash
git --version
node --version
npm --version
```

## 2. Placer le site dans Termux

Si vous avez reçu le dossier `maison-wovi-site` (par exemple via le zip téléchargé
dans l'app Claude), déplacez-le dans le stockage accessible à Termux :

```bash
termux-setup-storage
cp -r /sdcard/Download/maison-wovi-site ~/maison-wovi-site
cd ~/maison-wovi-site
```

## 3. Initialiser le dépôt Git et pousser sur GitHub

```bash
git init
git add .
git commit -m "Premier import du site Maison Wovi"
```

Créez un nouveau dépôt vide sur [github.com/new](https://github.com/new) (ne cochez
aucune case d'initialisation — README, .gitignore, licence — pour éviter les conflits),
puis :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/maison-wovi-site.git
git branch -M main
git push -u origin main
```

Termux vous demandera votre identifiant GitHub et un **token d'accès personnel**
(pas votre mot de passe habituel) — générez-en un sur
[github.com/settings/tokens](https://github.com/settings/tokens) avec la permission
`repo` si vous n'en avez pas déjà un.

## 4. Connecter le dépôt à Vercel

Deux façons de faire, la première est la plus simple depuis un téléphone :

### Option A — via le site vercel.com (recommandé depuis Termux/mobile)
1. Allez sur [vercel.com](https://vercel.com), connectez-vous avec votre compte GitHub
2. **Add New → Project**
3. Sélectionnez le dépôt `maison-wovi-site`
4. Laissez les réglages par défaut (Vercel détecte automatiquement le dossier `api/`
   comme des fonctions serverless et sert le reste comme fichiers statiques)
5. Cliquez sur **Deploy**

### Option B — via la CLI Vercel dans Termux
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 5. Configurer les variables d'environnement

Dans le tableau de bord Vercel : **Project → Settings → Environment Variables**,
ajoutez (voir aussi `.env.example`) :

```
CINETPAY_API_KEY
CINETPAY_SITE_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SITE_URL          → l'URL Vercel de votre site, ex: https://maison-wovi.vercel.app
```

Après ajout des variables, redéployez (**Deployments → ⋯ → Redeploy**) pour qu'elles
soient prises en compte.

## 6. Configurer le webhook Stripe

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL : `https://votre-site.vercel.app/api/webhook-stripe`
3. Événement : `checkout.session.completed`
4. Copiez le secret généré (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET` sur Vercel

CinetPay n'a rien à configurer manuellement : l'URL de notification est déjà transmise
automatiquement par `api/create-payment-local.js`.

## 7. Mettre à jour le site plus tard (nouveau produit, texte, numéro WhatsApp...)

Le cycle devient très simple une fois tout branché :

```bash
cd ~/maison-wovi-site
# modifiez vos fichiers HTML/CSS/JS ici
git add .
git commit -m "Mise à jour du catalogue"
git push
```

Vercel redéploie automatiquement à chaque `git push` sur la branche `main` — rien
d'autre à faire.

## 8. Tester avant la mise en production réelle

- Stripe propose un mode test avec des cartes factices avant de basculer les clés
  en `sk_live_...`
- CinetPay propose également un environnement de test — vérifiez la documentation
  liée à votre compte

## Ce qui reste à faire ensuite

Comme évoqué précédemment, chaque fonction contient un commentaire `// TODO production`
à l'endroit où il faudra brancher l'enregistrement des commandes et les notifications
automatiques (email / WhatsApp) — vous avez indiqué que ce n'est pas prioritaire pour
l'instant, donc rien à faire ici tant que vous n'êtes pas prêt.
