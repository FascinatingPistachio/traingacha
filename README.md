# 🚂 Rail Gacha

A gacha card game where every card is a real train, locomotive, or railway pulled live from Wikipedia. Rarity is determined by how famous the article is — measured by monthly Wikipedia page views.

## Features

- **Unlimited cards** — any train on Wikipedia can become a card
- **Rarity from pageviews** — Legendary cards are globally iconic trains (120k+ views/month); Common cards are niche regional services
- **Real images** — pulled directly from Wikipedia's thumbnail API (cards without images are skipped)
- **Full Wikipedia extracts** — 2-sentence description + link to read more
- **Pity system** — the longer you go without a high-rarity card, the more pulls come from famous-train categories
- **Daily bonus** — 150 tickets every 24 hours
- **Save codes** — export/import your collection across devices via a base64 code
- **No database** — all data lives in the browser's `localStorage`; cards come from Wikipedia APIs

## Rarity tiers

| Rarity    | Monthly Wikipedia views   | Examples                                  |
|-----------|---------------------------|-------------------------------------------|
| Legendary | ≥ 120,000                 | Flying Scotsman, Shinkansen, Orient Express |
| Epic      | 30,000 – 120,000          | Eurostar, ICE 3, TGV                      |
| Rare      | 6,000 – 30,000            | California Zephyr, Blue Train             |
| Common    | < 6,000                   | Regional DMUs, freight locomotives        |

## Tech stack

- **React 18** + **Vite**
- **Wikipedia REST API** — article summaries, images, extracts
- **Wikimedia Pageviews API** — monthly view counts for rarity calculation
- **localStorage** — save data (no server needed)
- Deployable to **Vercel** with zero config

## Local development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite — no settings needed
4. Deploy

The included `vercel.json` handles SPA client-side routing.

## Wikipedia categories used

Cards are pulled from ~26 Wikipedia categories covering:
- Named passenger trains (US, UK, Europe, Japan, India, Australia, South Africa)
- High-speed trains (Japan, France, Germany, China, South Korea)
- Steam locomotives (UK, US, Germany)
- Diesel and electric multiple units
- Heritage railways
- Maglev trains
- Luxury trains

The pity system biases toward the "famous" category pool after extended dry streaks, increasing the chance of well-known trains appearing.

## File structure

```
railgacha/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── constants.js
    ├── styles/
    │   └── global.css
    ├── utils/
    │   ├── wikipedia.js   # All Wikipedia + pageviews API logic
    │   ├── gacha.js       # Pack drawing + pity system
    │   └── storage.js     # localStorage save/load/export/import
    └── components/
        ├── RailCard.jsx
        ├── CardBack.jsx
        ├── CardDetailModal.jsx
        ├── Toast.jsx
        ├── BottomNav.jsx
        ├── LoginScreen.jsx
        ├── HomeScreen.jsx
        ├── ShopScreen.jsx
        ├── OpeningScreen.jsx
        ├── CollectionScreen.jsx
        └── AccountScreen.jsx
```
