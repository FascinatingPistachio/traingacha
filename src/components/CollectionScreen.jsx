import { useState } from 'react';
import RailCard from './RailCard.jsx';
import CardDetailModal from './CardDetailModal.jsx';
import { RARITY } from '../constants.js';

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      color: '#1e3050', fontFamily: 'monospace', fontSize: 11,
      lineHeight: 1.8,
    }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
      <div>Your collection is empty.</div>
      <div>Open a pack to get started!</div>
    </div>
  );
}

export default function CollectionScreen({ collection }) {
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('rarity');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const entries = Object.values(collection);

  const filtered = entries
    .filter((e) => filter === 'ALL' || e.rarity === filter)
    .filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rarity') return (RARITY[b.rarity]?.rank ?? 0) - (RARITY[a.rarity]?.rank ?? 0);
      if (sort === 'views')  return (b.views ?? 0) - (a.views ?? 0);
      if (sort === 'name')   return a.title.localeCompare(b.title);
      if (sort === 'newest') return new Date(b.addedAt) - new Date(a.addedAt);
      return 0;
    });

  const byRarity = entries.reduce((acc, e) => {
    acc[e.rarity] = (acc[e.rarity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '14px 10px', maxWidth: 540, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h2 style={{
          color: '#c9a833', margin: '0 0 3px', fontSize: 13,
          fontFamily: 'monospace', letterSpacing: '.2em',
        }}>
          COLLECTION
        </h2>
        <p style={{ fontSize: 8, color: '#1a3050', margin: 0, fontFamily: 'monospace' }}>
          {entries.length} UNIQUE CARDS · TAP TO EXPAND
        </p>
      </div>

      {/* Rarity counts */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          {['L', 'E', 'R', 'C'].map((r) => (
            <span key={r} style={{ fontSize: 8.5, fontFamily: 'monospace', color: RARITY[r].color }}>
              {RARITY[r].short}: {byRarity[r] ?? 0}
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search cards…"
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(201,168,51,0.15)',
          borderRadius: 7, padding: '8px 12px',
          color: '#e8e0d0', fontSize: 11.5, outline: 'none',
          fontFamily: 'monospace', marginBottom: 10,
        }}
      />

      {/* Filters + sort */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['ALL', 'L', 'E', 'R', 'C'].map((r) => {
          const rs = r === 'ALL'
            ? { color: '#4fa8e8', bg: '#07182a', border: 'rgba(79,168,232,0.4)' }
            : RARITY[r];
          const active = filter === r;
          return (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{
                padding: '4px 10px',
                background: active ? rs.bg : 'transparent',
                border: `1px solid ${active ? rs.border : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 5,
                color: active ? rs.color : '#1e3a5a',
                fontSize: 8, cursor: 'pointer',
                fontFamily: 'monospace', letterSpacing: '.1em',
              }}
            >
              {r === 'ALL' ? 'ALL' : RARITY[r].short}
            </button>
          );
        })}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: '4px 8px',
            background: '#0c1825',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 5, color: '#2a4a6a',
            fontSize: 8, cursor: 'pointer',
            fontFamily: 'monospace', outline: 'none',
          }}
        >
          <option value="rarity">RARITY</option>
          <option value="views">MOST FAMOUS</option>
          <option value="newest">NEWEST</option>
          <option value="name">NAME</option>
        </select>
      </div>

      {/* Grid */}
      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 10,
        }}>
          {filtered.map((card) => (
            <div key={card.id} style={{ display: 'flex', justifyContent: 'center' }}>
              <RailCard
                card={card}
                size="sm"
                count={card.count}
                onClick={() => setSelected(card)}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{
              gridColumn: '1 / -1', textAlign: 'center',
              color: '#1e3050', fontFamily: 'monospace',
              fontSize: 10, padding: '30px 0',
            }}>
              No cards match that filter.
            </p>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <CardDetailModal
          card={selected}
          count={selected.count}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
