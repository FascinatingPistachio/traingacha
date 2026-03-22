import { fetchWikiThumbnail } from '../utils/wikiImage.js';
import { useState, useEffect, useCallback, useRef } from 'react';
import { STAT_CONFIG, generateCardStats, statPercent, formatStat } from '../utils/stats.js';
import { BATTLE_WIN_TICKETS, BATTLE_LOSS_TICKETS, RARITY } from '../constants.js';
import RailCard from './RailCard.jsx';
import TrainVFX, { burstVFX } from './TrainVFX.jsx';
import { detectTrainType, trainTypeEmoji } from '../utils/trainType.js';
import {
  soundPlayCard, soundStatWin, soundStatLose, soundStatDraw,
  soundBattleVictory, soundBattleDefeat, soundLegendaryBoom,
  soundChugChug, soundValveClank,
} from '../utils/sounds.js';
import RaidScreen from './RaidScreen.jsx';

// ── Bot definitions ─────────────────────────────────────────────────────────
const BOT_DEFS = [
  { id:'easy',   name:'Rusty Rob',   emoji:'🤖', tagline:'Forgets which stat to pick',       difficulty:'easy',   color:'#4caf50', reward:3  },
  { id:'medium', name:'Diesel Dave', emoji:'⚙️',  tagline:'Plays second-best — usually',      difficulty:'medium', color:'#ff9800', reward:6  },
  { id:'hard',   name:'Iron Ivan',   emoji:'🔩', tagline:'Picks the strongest stat every time',difficulty:'hard',   color:'#ef5350', reward:12 },
];

const BOT_CARDS_RAW = {
  easy: [
    { title:'British Rail Class 08',    views:5200,  rarity:'C' },
    { title:'GWR 5700 class',           views:7800,  rarity:'C' },
    { title:'LBSCR A1X class',          views:4100,  rarity:'C' },
    { title:'British Rail Class 25',    views:5500,  rarity:'C' },
    { title:'LNER Class J70',           views:3800,  rarity:'C' },
  ],
  medium: [
    { title:'LNER Class A3',            views:42000, rarity:'E' },
    { title:'Stirling Single',          views:19000, rarity:'E' },
    { title:'LMS Fowler 4F',            views:14000, rarity:'E' },
    { title:'LNER Class A4',            views:55000, rarity:'E' },
    { title:'LMS Stanier Class 5',      views:21000, rarity:'E' },
  ],
  hard: [
    { title:'Flying Scotsman',          views:195000,rarity:'L' },
    { title:'Shinkansen',               views:210000,rarity:'L' },
    { title:'LMS Princess Coronation class',views:48000,rarity:'E' },
    { title:"Stephenson's Rocket",      views:180000,rarity:'L' },
    { title:'ETR 300',                  views:72000, rarity:'L' },
  ],
};

function buildBotCard(raw, i, diff) {
  return {
    id: `bot_${diff}_${i}`,
    title: raw.title,
    image: null,  // loaded lazily via wikiImage
    extract: `${raw.title} — a real locomotive.`,
    rarity: raw.rarity,
    views: raw.views,
    stats: generateCardStats(raw.title, raw.views, raw.rarity),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(raw.title.replace(/ /g,'_'))}`,
  };
}

function botPickStat(card, difficulty) {
  const stats = card.stats;
  if (!stats) return STAT_CONFIG[0].key;
  const sorted = [...STAT_CONFIG].sort((a,b) =>
    statPercent(b.key, stats[b.key]??0) - statPercent(a.key, stats[a.key]??0)
  );
  if (difficulty === 'easy')   return STAT_CONFIG[Math.floor(Math.random()*STAT_CONFIG.length)].key;
  if (difficulty === 'medium') return sorted[Math.min(1, sorted.length-1)].key;
  return sorted[0].key;
}

// Fake live activity feed
const FEED = [
  '🇬🇧 SteamFan_UK beat Rusty Rob with Flying Scotsman!',
  '🇯🇵 TrainNerd99 pulled a Legendary Shinkansen!',
  '🇺🇸 RailRoader drafted British Rail Class 08 from Iron Ivan',
  '🏆 BrEze won 5 battles in a row!',
  '⚔️ BlazeTrack challenged Iron Ivan',
  '🎯 PercyLover beat Diesel Dave with SPEED stat',
  '✨ MightyMacFan pulled an Epic Stirling Single!',
  '🔥 GordonFan on a 3-battle streak!',
  '⚡ Duchess12 just cleared the Flying Scotsman raid!',
  '🚂 TalylynFan drafted Talyllyn Spirit Card!',
];

export default function BattleScreen({ collection, onEarn }) {
  const [tab, setTab]               = useState('battle'); // 'battle' | 'raid'
  const [phase, setPhase]           = useState('lobby');
  const [selectedBot, setBot]       = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [botCards, setBotCards]     = useState([]);
  const [round, setRound]           = useState(0);
  const [scores, setScores]         = useState({ player:0, bot:0 });
  const [playerCard, setPlayerCard] = useState(null);
  const [botCard, setBotCard]       = useState(null);
  const [chosenStat, setChosenStat] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [draftedCard, setDraftedCard] = useState(null);
  const [feedIdx, setFeedIdx]       = useState(0);
  const [feedKey, setFeedKey]       = useState(0);

  useEffect(() => {
    const t = setInterval(() => { setFeedIdx(i => (i+1)%FEED.length); setFeedKey(k=>k+1); }, 3500);
    return () => clearInterval(t);
  }, []);

  const collCards = Object.values(collection ?? {}).filter(c => c.stats);

  const startBattle = (bot) => {
    const shuffled = [...collCards].sort(()=>Math.random()-0.5);
    const pool = shuffled.length >= 5 ? shuffled : [...shuffled,...shuffled,...shuffled].slice(0,5);
    setPlayerCards(pool);
    setBotCards(BOT_CARDS_RAW[bot.id].map((r,i)=>buildBotCard(r,i,bot.id)).sort(()=>Math.random()-0.5));
    setBot(bot);
    setRound(0);
    setScores({player:0,bot:0});
    setDraftedCard(null);
    setPhase('pre');
  };

  const nextRound = useCallback(() => {
    const pCard = playerCards[round] ?? playerCards[playerCards.length-1];
    const bCard = botCards[round] ?? botCards[botCards.length-1];
    setPlayerCard(pCard);
    setBotCard(bCard);
    setChosenStat(null);
    setRoundResult(null);
    setPhase('battle');
  }, [round, playerCards, botCards]);

  useEffect(() => { if (phase === 'pre') nextRound(); }, [phase, nextRound]);

  const pickStat = (statKey) => {
    if (chosenStat) return;
    setChosenStat(statKey);

    // Play player's train sound
    const playerTrainType = detectTrainType(playerCard?.title ?? '');
    const botTrainType    = detectTrainType(botCard?.title ?? '');
    soundPlayCard(playerTrainType);
    setTimeout(() => soundPlayCard(botTrainType), 400);

    const pVal    = playerCard?.stats?.[statKey] ?? 0;
    const bValSame = botCard?.stats?.[statKey] ?? 0;
    const res = pVal > bValSame ? 'win' : pVal < bValSame ? 'lose' : 'draw';
    const newScores = { player: scores.player+(res==='win'?1:0), bot: scores.bot+(res==='lose'?1:0) };
    setRoundResult(res);
    setScores(newScores);

    // Result SFX
    setTimeout(() => {
      if (res === 'win')  soundStatWin();
      else if (res === 'lose') soundStatLose();
      else soundStatDraw();
    }, 500);

    // 8% chance to draft bot card on win
    if (res === 'win' && Math.random() < 0.08 && botCard && !draftedCard) setDraftedCard(botCard);

    setTimeout(() => {
      const nr = round+1;
      if (nr >= 5 || newScores.player >= 3 || newScores.bot >= 3) {
        setPhase('result');
        setTimeout(() => {
          if (newScores.player > newScores.bot) soundBattleVictory();
          else soundBattleDefeat();
        }, 200);
      } else { setRound(nr); setPhase('pre'); }
    }, 2000);
  };

  const claimReward = () => {
    const won = scores.player > scores.bot;
    const tickets = won ? (BATTLE_WIN_TICKETS[selectedBot?.id] ?? 3) : BATTLE_LOSS_TICKETS;
    onEarn?.(tickets, won && draftedCard ? draftedCard : null);
    
    setPhase('lobby');
  };

  // ── Sub-nav ─────────────────────────────────────────────────────────────
  const SubNav = () => (
    <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:0 }}>
      {[['battle','⚔️ Battle'],['raid','🔥 Raid']].map(([t,label]) => (
        <button key={t} onClick={()=>{setTab(t);setPhase('lobby');}} style={{
          flex:1, padding:'10px 0', background:'transparent',
          border:'none', cursor:'pointer', fontSize:10,
          color: tab===t ? '#c9a833':'rgba(255,255,255,0.3)',
          fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em',
          borderBottom: tab===t ? '2px solid #c9a833':'2px solid transparent',
          transition:'all 0.15s',
        }}>{label}</button>
      ))}
    </div>
  );

  if (tab === 'raid') return (
    <div>
      <SubNav />
      <RaidScreen collection={collection} onEarn={onEarn} />
    </div>
  );

  // ── Battle tab ──────────────────────────────────────────────────────────
  if (phase === 'lobby') return (
    <div>
      <SubNav />
      <div style={{ padding:'14px 12px 80px', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Live feed */}
        <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:8, padding:'8px 12px',
          border:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
            letterSpacing:'.12em', marginBottom:4 }}>🔴 LIVE</div>
          <div key={feedKey} style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontFamily:'monospace',
            animation:'fadeUp 0.35s ease-out' }}>
            {FEED[feedIdx]}
          </div>
        </div>

        {/* Your deck summary */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
          borderRadius:8, padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
              letterSpacing:'.1em', marginBottom:3 }}>YOUR DECK</div>
            <div style={{ fontSize:12, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>
              {collCards.length} cards ready
            </div>
          </div>
          {collCards.length > 0 && (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontFamily:'monospace' }}>BEST SCORE</div>
              <div style={{ fontSize:14, color:'#e8c040', fontFamily:'monospace', fontWeight:700 }}>
                {Math.max(...collCards.map(c=>c.stats?.overall??0))}
              </div>
            </div>
          )}
        </div>

        {collCards.length < 3 ? (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
            fontSize:10, padding:20, border:'1px dashed rgba(255,255,255,0.08)', borderRadius:8 }}>
            Pull at least 3 cards to enter battle!
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {BOT_DEFS.map(bot => (
              <button key={bot.id} onClick={() => startBattle(bot)} style={{
                background:'rgba(255,255,255,0.02)', border:`1px solid ${bot.color}33`,
                borderRadius:10, padding:'13px 15px', cursor:'pointer', textAlign:'left',
                display:'flex', alignItems:'center', gap:12,
              }}>
                <span style={{ fontSize:26 }}>{bot.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#f0e8d8', fontFamily:'Georgia,serif', fontWeight:700, fontSize:13 }}>
                    {bot.name}
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontFamily:'monospace', fontSize:9, marginTop:2 }}>
                    {bot.tagline}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:9, color:bot.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em' }}>
                    {bot.id.toUpperCase()}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', marginTop:2 }}>
                    +{bot.reward} 🎫
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Battle round ────────────────────────────────────────────────────────
  if ((phase === 'battle' || phase === 'pre') && playerCard && botCard) {
    const pStats = playerCard.stats ?? {};
    const bStats = botCard.stats ?? {};
    const playerTrainType = detectTrainType(playerCard.title ?? '');
    const botTrainType    = detectTrainType(botCard.title ?? '');

    return (
      <div>
        <SubNav />
        <div
          className={roundResult === 'win' ? 'flash-win' : roundResult === 'lose' ? 'flash-lose' : ''}
          style={{ padding:'10px 8px', display:'flex', flexDirection:'column', gap:10, position:'relative' }}>

          {/* Ambient track lines VFX */}
          <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', opacity:0.06 }}>
            {[15,35,55,75,90].map(pct => (
              <div key={pct} style={{
                position:'absolute', left:0, right:0, top:`${pct}%`, height:1,
                background:'linear-gradient(90deg, transparent, rgba(201,168,51,0.8), transparent)',
              }} />
            ))}
          </div>

          {/* Scoreboard */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'rgba(255,255,255,0.02)', borderRadius:8, padding:'8px 12px',
            border:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.5)' }}>
              vs {selectedBot?.name}
            </div>
            <div style={{ fontFamily:'monospace', fontSize:12, color:'#c9a833', fontWeight:700 }}>
              Round {round+1}/5
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#4caf50', fontFamily:'monospace' }}>{scores.player}</span>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>—</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#ef5350', fontFamily:'monospace' }}>{scores.bot}</span>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', alignItems:'flex-start' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.4)', fontFamily:'monospace', letterSpacing:'.1em' }}>YOU</div>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', marginBottom:2 }}>
                {trainTypeEmoji(playerCard.title)}
              </div>
              <div style={{ position:'relative' }}>
                {/* Steam wisps on player card */}
                {playerTrainType === 'steam' && (
                  <div style={{ position:'absolute', top:-8, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:5 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ position:'absolute', width:8+j*4, height:8+j*4, borderRadius:'50%',
                        background:'rgba(210,230,255,0.2)', filter:'blur(4px)', left:(j-1)*12,
                        animation:`steamPuff ${1.3+j*0.3}s ease-out infinite`, animationDelay:`${j*0.4}s` }} />
                    ))}
                  </div>
                )}
                {playerTrainType === 'electric' && (
                  <div style={{ position:'absolute', inset:0, borderRadius:8, pointerEvents:'none', zIndex:5,
                    boxShadow:'0 0 16px rgba(80,160,255,0.25)', animation:'epicGlow 1.5s ease-in-out infinite' }} />
                )}
                <RailCard card={playerCard} size="md" />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              paddingTop:50, gap:6, minWidth:32 }}>
              {roundResult ? (
                <div style={{ fontSize:26, animation:'popIn 0.3s ease-out' }}>
                  {roundResult==='win'?'✅':roundResult==='lose'?'❌':'🤝'}
                </div>
              ) : (
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>VS</div>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{ fontSize:7.5, color:selectedBot?.color, fontFamily:'monospace', letterSpacing:'.1em' }}>
                {selectedBot?.emoji}
              </div>
              {chosenStat && (
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', marginBottom:2 }}>
                  {trainTypeEmoji(botCard.title)}
                </div>
              )}
              {chosenStat ? (
                <div style={{ position:'relative' }}>
                  {botTrainType === 'steam' && (
                    <div style={{ position:'absolute', top:-8, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:5 }}>
                      {[0,1].map(j => (
                        <div key={j} style={{ position:'absolute', width:8+j*4, height:8+j*4, borderRadius:'50%',
                          background:'rgba(200,220,255,0.2)', filter:'blur(4px)', left:(j-0.5)*10,
                          animation:`steamPuff ${1.2+j*0.3}s ease-out infinite`, animationDelay:`${j*0.5}s` }} />
                      ))}
                    </div>
                  )}
                  {botTrainType === 'diesel' && (
                    <div style={{ position:'absolute', top:-6, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:5 }}>
                      {[0,1].map(j => (
                        <div key={j} style={{ position:'absolute', width:10+j*5, height:10+j*5, borderRadius:'50%',
                          background:'rgba(60,50,35,0.4)', filter:'blur(6px)', left:(j-0.5)*12,
                          animation:`smokeBillow ${1.8+j*0.4}s ease-out infinite`, animationDelay:`${j*0.6}s` }} />
                      ))}
                    </div>
                  )}
                  <RailCard card={botCard} size="md" />
                </div>
              ) : (
                <div style={{ width:162, height:243, borderRadius:8,
                  background:'linear-gradient(145deg,#0a1218,#060e16)',
                  border:'1.5px solid rgba(201,168,51,0.12)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexDirection:'column', gap:6, position:'relative', overflow:'hidden' }}>
                  {/* Animated track pattern */}
                  <div style={{ position:'absolute', inset:0, opacity:0.04,
                    backgroundImage:'repeating-linear-gradient(90deg,#c9a833 0,#c9a833 1px,transparent 0,transparent 20px)',
                  }} />
                  <div style={{ fontSize:32, animation:'packBob 1.5s ease-in-out infinite' }}>🚂</div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.18)', fontFamily:'monospace',
                    letterSpacing:'.15em', animation:'pulse 1.5s ease-in-out infinite' }}>HIDDEN</div>
                  {/* Steam leaking out */}
                  <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ position:'absolute', width:6+j*3, height:6+j*3, borderRadius:'50%',
                        background:'rgba(200,220,255,0.12)', filter:'blur(3px)', left:(j-1)*8,
                        animation:`steamPuff ${1+j*0.25}s ease-out infinite`, animationDelay:`${j*0.35}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison result */}
          {chosenStat && roundResult && (() => {
            const cfg = STAT_CONFIG.find(s=>s.key===chosenStat);
            const pv  = pStats[chosenStat]??0;
            const bv  = bStats[chosenStat]??0;
            return (
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'10px 14px',
                border:`1px solid ${roundResult==='win'?'rgba(76,175,80,0.3)':'rgba(239,83,80,0.3)'}` }}>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
                  letterSpacing:'.12em', marginBottom:6 }}>
                  {cfg?.icon} {cfg?.label} BATTLE
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'monospace', fontSize:16, fontWeight:700,
                    color:pv>=bv?'#4caf50':'#ef5350' }}>{formatStat(chosenStat,pv)}</span>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontFamily:'monospace' }}>vs</span>
                  <span style={{ fontFamily:'monospace', fontSize:16, fontWeight:700,
                    color:bv>=pv?'#4caf50':'#ef5350' }}>{formatStat(chosenStat,bv)}</span>
                </div>
              </div>
            );
          })()}

          {/* Stat picker */}
          {!chosenStat && (
            <div>
              <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace',
                letterSpacing:'.1em', textAlign:'center', marginBottom:8 }}>PICK YOUR STAT</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                {STAT_CONFIG.map(cfg => {
                  const val = pStats[cfg.key] ?? 0;
                  const pct = statPercent(cfg.key, val);
                  return (
                    <button key={cfg.key} onClick={() => pickStat(cfg.key)} style={{
                      background:`linear-gradient(135deg,${cfg.color}18,${cfg.color}08)`,
                      border:`1px solid ${cfg.color}55`, borderRadius:8, padding:'9px 11px',
                      cursor:'pointer', textAlign:'left',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                        <span style={{ fontSize:14 }}>{cfg.icon}</span>
                        <span style={{ fontSize:8, color:cfg.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em' }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#f0e8d8', marginBottom:3 }}>
                        {formatStat(cfg.key, val)}
                      </div>
                      <div style={{ height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:cfg.color, borderRadius:2 }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const won = scores.player > scores.bot;
    const tickets = won ? (BATTLE_WIN_TICKETS[selectedBot?.id] ?? 3) : BATTLE_LOSS_TICKETS;
    return (
      <div>
        <SubNav />
        <div style={{ padding:'24px 16px', display:'flex', flexDirection:'column', gap:18, alignItems:'center' }}>
          <div style={{ fontSize:52, animation:'popIn 0.4s ease-out' }}>{won?'🏆':'💔'}</div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:20, color:won?'#e8c040':'#ef5350', fontFamily:'Georgia,serif', fontWeight:700, marginBottom:4 }}>
              {won ? 'VICTORY!' : 'DEFEATED'}
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'monospace' }}>
              vs {selectedBot?.name} — {scores.player}:{scores.bot}
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:10, padding:'14px 20px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', letterSpacing:'.12em', marginBottom:6 }}>
              REWARD
            </div>
            <div style={{ fontSize:18, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>+{tickets} 🎫</div>
            {won && draftedCard && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:8, color:'rgba(76,175,80,0.7)', fontFamily:'monospace', letterSpacing:'.1em', marginBottom:8 }}>
                  🎁 DRAFTED FROM OPPONENT
                </div>
                <div style={{ display:'flex', justifyContent:'center' }}>
                  <RailCard card={draftedCard} size="sm" />
                </div>
              </div>
            )}
            {won && !draftedCard && (
              <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:6 }}>
                No draft this time — 8% chance per win
              </div>
            )}
          </div>
          <button onClick={claimReward} style={{
            background: won ? 'linear-gradient(135deg,#c9a833,#8a6d1a)' : 'rgba(255,255,255,0.08)',
            border:'none', borderRadius:10, padding:'14px', cursor:'pointer', width:'100%',
            color: won ? '#1a0e00' : 'rgba(255,255,255,0.5)',
            fontFamily:'monospace', fontWeight:700, fontSize:12, letterSpacing:'.12em',
          }}>
            CLAIM & CONTINUE
          </button>
          <button onClick={() => setPhase('lobby')} style={{
            background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
            padding:'9px', color:'rgba(255,255,255,0.3)', fontFamily:'monospace', fontSize:9,
            cursor:'pointer', width:'100%',
          }}>
            BACK TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  return <div><SubNav /></div>;
}
