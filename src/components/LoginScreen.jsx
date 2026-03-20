import { useState } from 'react';
import { importCode } from '../utils/storage.js';

const cardStyle = {
  width: 340,
  padding: '38px 30px',
  background: 'linear-gradient(170deg, #0e1e30, #06101c)',
  border: '1px solid rgba(201,168,51,0.22)',
  borderRadius: 16,
  boxShadow: '0 0 80px rgba(201,168,51,0.06), 0 20px 60px rgba(0,0,0,0.6)',
  textAlign: 'center',
  fontFamily: 'Georgia, serif',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,51,0.22)',
  borderRadius: 8,
  padding: '11px 14px',
  color: '#e8e0d0',
  fontSize: 13.5,
  outline: 'none',
  fontFamily: 'Georgia, serif',
  marginBottom: 11,
};

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px',
        background: disabled ? '#121e2e' : 'linear-gradient(135deg, #c9a833, #8a6e1a)',
        border: 'none', borderRadius: 8,
        color: disabled ? '#2a4060' : '#06101c',
        fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '.1em', fontFamily: 'monospace',
        marginBottom: 14, transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('new');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleNew = () => {
    if (name.trim()) onLogin(name.trim());
  };

  const handleImport = () => {
    const data = importCode(code);
    if (!data || !data.username) {
      setError('Invalid save code — please check and try again.');
      return;
    }
    onLogin(data.username, data);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#06101c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 52, marginBottom: 4, filter: 'drop-shadow(0 0 12px rgba(201,168,51,0.5))' }}>
          🚂
        </div>
        <h1 style={{ fontSize: 30, color: '#c9a833', margin: '0 0 2px', fontWeight: 900, letterSpacing: '.04em' }}>
          RAIL GACHA
        </h1>
        <p style={{ fontSize: 9, color: '#1e2e3e', margin: '0 0 28px', letterSpacing: '.22em', fontFamily: 'monospace' }}>
          COLLECT · DISCOVER · COMPLETE
        </p>

        {mode === 'new' ? (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNew()}
              placeholder="Your conductor name…"
              style={inputStyle}
            />
            <PrimaryBtn onClick={handleNew} disabled={!name.trim()}>
              ALL ABOARD →
            </PrimaryBtn>
            <button
              onClick={() => { setMode('import'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#1e3050', fontSize: 10.5, cursor: 'pointer', fontFamily: 'monospace' }}
            >
              IMPORT SAVE CODE
            </button>
          </>
        ) : (
          <>
            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              placeholder="Paste your save code here…"
              style={{ ...inputStyle, height: 80, resize: 'none', fontFamily: 'monospace', fontSize: 10 }}
            />
            {error && (
              <p style={{ fontSize: 9, color: '#ef5350', margin: '-6px 0 10px', fontFamily: 'monospace' }}>{error}</p>
            )}
            <PrimaryBtn onClick={handleImport} disabled={!code.trim()}>
              IMPORT →
            </PrimaryBtn>
            <button
              onClick={() => setMode('new')}
              style={{ background: 'none', border: 'none', color: '#1e3050', fontSize: 10.5, cursor: 'pointer', fontFamily: 'monospace' }}
            >
              ← BACK
            </button>
          </>
        )}

        <p style={{ fontSize: 7.5, color: '#0e1e2e', marginTop: 20, fontFamily: 'monospace', lineHeight: 1.8 }}>
          Cards pulled live from Wikipedia.<br />
          Save stored in your browser.
        </p>
      </div>
    </div>
  );
}
