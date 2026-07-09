# 🎪 Le Pendu — Multijoueur

Jeu du Pendu multijoueur en temps reel, en francais, pense pour etre partage entre camarades de classe via un simple lien. Aucune base de donnees : tout est stocke en memoire cote serveur, les salles sont ephemeres.

## Architecture

Le jeu est deploye en **deux services separes** :

```
Vercel (Next.js, app/, TypeScript)  <—— socket.io-client ——>  Railway/Fly.io/Render (server/, Express + socket.io)
        frontend / UI                                              logique de jeu + etat des salles (en memoire)
```

**Pourquoi pas "tout sur Vercel" ?** Vercel ne fait pas tourner de vrai serveur Socket.IO persistant dans une fonction serverless : son support WebSocket est une API experimentale (`experimental_upgradeWebSocket`, base sur `ws`, pas sur le protocole Socket.IO), et une connexion y meurt de toute facon a chaque redemarrage de fonction (quelques minutes max). Heberger la partie temps reel sur un petit service Node persistant (Railway/Fly.io/Render, gratuit pour un usage de classe) et ne mettre que l'interface Next.js sur Vercel est l'architecture que Vercel recommande lui-meme pour ce type d'usage — et ca reutilise sans modification le serveur Express/socket.io deja construit et teste.

- **`web/`** — Frontend **Next.js 15 (App Router, TypeScript, Tailwind, Framer Motion)**, deploye sur **Vercel**.
- **`server/`** — Backend **Node.js/Express/socket.io**, deploye sur **Railway/Fly.io/Render** (ou tout hebergeur Node classique).
- **`client/`** — Ancienne interface React/Vite (conservee telle quelle, non utilisee par le deploiement Vercel ; peut servir pour du dev 100% local sans Next.js).

## Installation locale

```bash
cd server && npm install
cd ../web && npm install
```

## Developpement local

Terminal 1 — le serveur temps reel :
```bash
cd server
npm run dev
# -> http://localhost:3001
```

Terminal 2 — le frontend Next.js :
```bash
cd web
npm run dev
# -> http://localhost:3000
```

`web/.env.local` pointe deja vers `http://localhost:3001`. Ouvre `http://localhost:3000` dans plusieurs onglets/navigateurs pour tester le multijoueur.

> Astuce : si `next dev` affiche une erreur webpack liee aux "dev tools" apres plusieurs hot-reloads (bug connu de Next 15.x en dev), supprime le dossier `web/.next` et relance — ou utilise directement `npm run build && npm start` qui n'a pas ce probleme (et qui est plus proche de ce qui tourne reellement sur Vercel).

## Deploiement

### 1. Le serveur temps reel (`server/`) — Railway (ou Fly.io / Render)

1. Cree un nouveau projet sur [railway.app](https://railway.app), "Deploy from GitHub repo", et choisis ce repo.
2. Dans les parametres du service, mets le **Root Directory** sur `server`.
3. Railway detecte Node automatiquement (`npm install` puis `npm start`) et fournit `PORT` tout seul.
4. Ajoute la variable d'environnement :
   - `CLIENT_ORIGIN` = `https://ton-projet.vercel.app` (ajoute aussi `http://localhost:3000` en dev, separes par une virgule)
5. Note l'URL publique generee (ex: `https://pendu-server.up.railway.app`) — c'est ton `NEXT_PUBLIC_SOCKET_URL`.

Fly.io et Render fonctionnent sur le meme principe : dossier racine `server/`, commande de demarrage `npm start`, variable `CLIENT_ORIGIN`.

### 2. Le frontend (`web/`) — Vercel

Via le dashboard :
1. [vercel.com/new](https://vercel.com/new) → importer ce repo GitHub.
2. **Root Directory** : `web`
3. Vercel detecte Next.js automatiquement.
4. Variables d'environnement (Project Settings → Environment Variables) :
   - `NEXT_PUBLIC_SOCKET_URL` = l'URL du serveur deploye a l'etape 1 (ex: `https://pendu-server.up.railway.app`)
5. Deploy.

Ou via la CLI :
```bash
npm i -g vercel
cd web
vercel login
vercel            # preview
vercel --prod     # production
```

Une fois les deux services en ligne, retourne dans Railway/Fly/Render et mets a jour `CLIENT_ORIGIN` avec l'URL Vercel definitive, puis redeploie le serveur.

### Lien de partage

```
https://ton-projet.vercel.app/room/ABC123
```

Un joueur qui ouvre ce lien sans avoir encore de session voit un **modal de saisie de pseudo**, puis rejoint directement la salle. Le pseudo/token de session sont stockes en `sessionStorage` (par onglet) pour permettre une reconnexion automatique (jusqu'a 30s de coupure, score conserve) apres un rechargement de page ou une perte reseau.

## Comment jouer

1. Un joueur clique sur **Creer une partie** (depuis l'accueil), choisit les reglages (categorie, difficulte, nombre de manches, temps par tour, nombre de joueurs) et obtient un **code de salle**.
2. Il partage le lien `/room/CODE` ou le code a ses camarades.
3. Chaque joueur rejoint avec un pseudo, puis l'hote clique sur **Lancer la partie** (2 joueurs minimum).
4. A chacun son tour de proposer une lettre (ou de tenter le mot entier). Le pendu se dessine progressivement en cas d'erreur.
5. A la fin des manches, un podium anime recompense les meilleurs scores.

## Structure du projet

```
1Pendu/
├── web/                        # Frontend Next.js (deploye sur Vercel)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Accueil (Creer / Rejoindre)
│   │   ├── globals.css
│   │   └── room/[code]/page.tsx
│   ├── components/              # Home, CreateRoom, JoinModal, Lobby, Game,
│   │                             # HangmanDrawing, Keyboard, Scoreboard, Podium,
│   │                             # Chat, Timer, Toasts, TopControls, Providers, RoomClient
│   ├── lib/                     # types.ts, socket-client.ts, GameContext.tsx, sounds.ts
│   ├── next.config.js, tailwind.config.ts, tsconfig.json, vercel.json
│   └── package.json
├── server/                      # Backend Express + socket.io (deploye sur Railway/Fly/Render)
│   ├── index.js
│   ├── game/ (Room.js, GameEngine.js, WordBank.js)
│   └── utils/generateCode.js
└── client/                      # Ancienne interface Vite (conservee, non deployee)
```

## Evenements socket.io

```
Client -> Serveur : create-room, join-room, start-game, guess-letter, guess-word, chat-message, leave-room
Serveur -> Client  : room-update, room-created, player-joined, player-left, game-started, game-state,
                      letter-result, word-result, round-end, game-over, new-message, tick
```

`join-room` accepte un `token` optionnel : s'il correspond a un joueur deja present dans la salle (deconnexion recente), le serveur le reconnecte a la place de creer un nouveau joueur, et lui renvoie l'etat courant adapte (ecran de jeu en cours, ecran de fin de manche, ou podium final selon l'etat de la salle).

## Notes techniques

- Les joueurs sont identifies par un **token** stable, distinct du `socket.id` (qui change a chaque reconnexion). Stocke en `sessionStorage` cote client. Permet a un joueur deconnecte de retrouver sa place et son score dans les 30 secondes suivant une deconnexion.
- La banque de mots contient au moins 50 mots par categorie (Animaux, Pays, Metiers, Nourriture, Films, Jeux video), sans accents mais en francais.
- Score : +10 points par lettre correcte (+ bonus de rapidite si un timer est actif), +50 points pour la lettre/le mot qui termine la manche, -5 points par erreur (double si mauvaise proposition de mot entier).
- Etat des salles **en memoire** (`Map` cote serveur) : simple, sans dependance externe, adapte a un usage de classe (< 50 joueurs simultanes). Si le serveur redemarre, les parties en cours sont perdues — acceptable pour un jeu ephemere. Pour une utilisation plus critique, remplacer la `Map` par Redis (ex: Upstash) suivrait le meme decoupage (`Room`/`GameEngine` restent identiques, seul le stockage change).
