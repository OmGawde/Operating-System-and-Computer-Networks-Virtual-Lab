import { useState } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const ENCRYPTION_QUIZ = [
  { q: 'What does symmetric encryption mean?', options: ['Uses the same key for both encryption and decryption', 'Uses a public key to encrypt and a private key to decrypt', 'Does not use a key', 'Only encrypts text, not files'], answer: 0, difficulty: 'easy' },
  { q: 'What does asymmetric encryption mean?', options: ['Uses one key for everything', 'Uses a mathematically linked key pair: Public and Private', 'Hashes data so it cannot be recovered', 'Encrypts faster than symmetric'], answer: 1, difficulty: 'easy' },
  { q: 'The Caesar Cipher is an example of a...', options: ['Block cipher', 'Substitution cipher', 'Public key algorithm', 'Transposition cipher'], answer: 1, difficulty: 'medium' },
  { q: 'In XOR encryption, if you XOR the ciphertext with the original key, you get...', options: ['A hash', 'A random string', 'The original plaintext', 'An error'], answer: 2, difficulty: 'medium' },
  { q: 'Which of the following is a modern, highly secure symmetric encryption algorithm?', options: ['AES (Advanced Encryption Standard)', 'Caesar Cipher', 'MD5', 'RSA'], answer: 0, difficulty: 'hard' },
  { q: 'Which of the following is an asymmetric encryption algorithm?', options: ['DES', 'AES', 'RSA', 'XOR'], answer: 2, difficulty: 'hard' },
  { q: 'What is the fundamental problem with symmetric encryption over the internet?', options: ['It is too slow', 'Securely sharing the secret key (Key Distribution Problem)', 'It uses too much bandwidth', 'It only works for short messages'], answer: 1, difficulty: 'medium' },
  { q: 'How is Hashing different from Encryption?', options: ['Hashing is one-way (irreversible), encryption is two-way (decryptable)', 'Hashing is faster', 'Encryption is only for passwords', 'They are the exact same thing'], answer: 0, difficulty: 'medium' },
  { q: 'A "salt" is used in password cryptography to...', options: ['Make the encryption reversible', 'Add random data before hashing to defeat precomputed rainbow tables', 'Speed up the algorithm', 'Compress the database'], answer: 1, difficulty: 'hard' },
  { q: 'TLS (HTTPS) uses which types of cryptography?', options: ['Symmetric only', 'Asymmetric only', 'Asymmetric for the initial handshake, then symmetric for bulk data transfer', 'Hashing only'], answer: 2, difficulty: 'hard' },
];

function caesarEncrypt(text, shift) {
  return text.split('').map(c => {
    if (c.match(/[a-z]/i)) {
      const code = c.charCodeAt(0);
      const base = c >= 'a' ? 97 : 65;
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return c;
  }).join('');
}

function xorEncrypt(text, key) {
  return text.split('').map((c, i) => {
    const xored = c.charCodeAt(0) ^ key.charCodeAt(i % key.length);
    return xored.toString(16).padStart(2, '0');
  }).join(' ');
}

function xorDecrypt(hex, key) {
  return hex.split(' ').map((h, i) => {
    const xored = parseInt(h, 16) ^ key.charCodeAt(i % key.length);
    return String.fromCharCode(xored);
  }).join('');
}

const ALGORITHMS = [
  { id: 'caesar', name: 'Caesar Cipher (Shift)', type: 'Symmetric' },
  { id: 'xor', name: 'XOR Cipher', type: 'Symmetric' },
];

export default function EncryptionSimulation() {
  const [plaintext, setPlaintext] = useState('Hello World! This is a secret message.');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [algo, setAlgo] = useState('caesar');
  const [key, setKey] = useState('3');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [animating, setAnimating] = useState(false);
  const [tab, setTab] = useState('learn');

  const encrypt = () => {
    setAnimating(true);
    setTimeout(() => {
      let result;
      if (algo === 'caesar') result = caesarEncrypt(plaintext, parseInt(key) || 3);
      else result = xorEncrypt(plaintext, key || 'KEY');
      setCiphertext(result);
      setIsEncrypted(true);
      setDecrypted('');
      setAnimating(false);
    }, 800 / speed);
  };

  const decrypt = () => {
    setAnimating(true);
    setTimeout(() => {
      let result;
      if (algo === 'caesar') result = caesarEncrypt(ciphertext, 26 - (parseInt(key) || 3));
      else result = xorDecrypt(ciphertext, key || 'KEY');
      setDecrypted(result);
      setAnimating(false);
    }, 800 / speed);
  };

  const reset = () => { setCiphertext(''); setDecrypted(''); setIsEncrypted(false); setAnimating(false); };

  return (
    <div className="px-8 pb-12 min-h-[calc(100vh-4rem)]">
      <header className="mb-12 mt-8">
        <div className="flex items-end gap-4 mb-2">
          <h1 className="text-6xl font-black font-headline tracking-tighter text-on-surface">SECURITY</h1>
          <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-primary/20 mb-2">Encryption</div>
        </div>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">Encrypt and decrypt text with real cipher algorithms. Observe how plaintext transforms into ciphertext.</p>
      </header>

      <div className="grid grid-cols-12 gap-6 items-start">
        <section className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">
          <div className="flex bg-surface-container-low border-b border-outline-variant/10">
            <button className="px-8 py-5 text-primary border-b-2 border-primary font-headline text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">enhanced_encryption</span> Encryption
            </button>
          </div>

          <div className="p-8 min-h-[400px] flex flex-col justify-center relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7bd0ff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Plaintext Input</label>
                <div className="bg-surface-container-lowest p-6 rounded-lg border-l-4 border-primary">
                  <textarea value={plaintext} onChange={e => { setPlaintext(e.target.value); reset(); }} className="w-full bg-transparent border-none text-on-surface focus:ring-0 font-mono resize-none h-32 leading-relaxed" placeholder="Enter text..." />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-surface-container-highest text-[10px] text-primary font-mono rounded">UTF-8</span>
                    <span className="px-2 py-1 bg-surface-container-highest text-[10px] text-primary font-mono rounded">
                      Key: {algo === 'caesar' ? `Shift ${key}` : key}
                    </span>
                  </div>
                  <button onClick={encrypt} disabled={animating} className="bg-primary px-6 py-2 text-on-primary font-bold rounded flex items-center gap-2 text-sm active:translate-y-0.5 transition-all disabled:opacity-50">
                    Encrypt <span className="material-symbols-outlined text-sm">lock</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Ciphertext ({ALGORITHMS.find(a => a.id === algo)?.name})
                </label>
                <div className="bg-surface-container-lowest p-6 rounded-lg border-l-4 border-tertiary/40">
                  <div className={`w-full text-tertiary font-mono break-all h-32 overflow-auto ${ciphertext ? '' : 'opacity-30'}`}>
                    {animating ? '■'.repeat(40) : ciphertext || 'Ciphertext will appear here...'}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {decrypted && (
                    <div className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded border border-tertiary/20">
                      ✓ Decrypted: {decrypted.substring(0, 30)}...
                    </div>
                  )}
                  <button onClick={decrypt} disabled={!isEncrypted || animating} className="ml-auto bg-surface-container-highest px-6 py-2 text-on-surface font-bold rounded flex items-center gap-2 text-sm border border-outline-variant/20 hover:bg-surface-variant transition-all disabled:opacity-30">
                    Decrypt <span className="material-symbols-outlined text-sm">lock_open</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 mx-auto flex items-center gap-4 glass-panel p-2 rounded-full border border-white/5 px-6">
              <SimulationControls isPlaying={animating} onPlay={encrypt} onPause={() => {}} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
              <div className="h-6 w-px bg-outline-variant/30 mx-2" />
              <select value={algo} onChange={e => { setAlgo(e.target.value); reset(); }} className="bg-transparent border-none text-xs font-bold text-on-surface-variant uppercase tracking-widest focus:ring-0 cursor-pointer">
                {ALGORITHMS.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
            </div>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-5 flex flex-col">
          <div className="flex bg-surface-container-highest rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setTab('learn')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 ${tab === 'learn' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">school</span> Learn
            </button>
            <button onClick={() => setTab('quiz')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 ${tab === 'quiz' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">quiz</span> Self-Test
            </button>
          </div>
          {tab === 'learn' && (
            <>
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
                <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span> Core Concepts
                </h3>
                <div className="space-y-4">
                  {[['Confidentiality', 'Encryption ensures data remains unreadable to unauthorized parties.', 'text-primary'], ['Integrity', 'Hashing and MACs verify packet payload has not been modified.', 'text-tertiary'], ['Key Management', 'The security of any cipher depends entirely on key secrecy.', 'text-error']].map(([title, desc, color]) => (
                    <div key={title} className="p-4 bg-surface-container-highest rounded-lg">
                      <span className={`text-[10px] font-bold ${color} uppercase tracking-widest block mb-1`}>{title}</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
                <h3 className="font-headline text-sm font-bold text-white uppercase tracking-widest mb-4">Cipher Key</h3>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5 block font-bold">
                  {algo === 'caesar' ? 'Shift Amount (1-25)' : 'XOR Key String'}
                </label>
                <input type={algo === 'caesar' ? 'number' : 'text'} value={key} onChange={e => { setKey(e.target.value); reset(); }}
                  min={algo === 'caesar' ? 1 : undefined} max={algo === 'caesar' ? 25 : undefined}
                  className="w-full bg-surface-container-lowest border-none text-sm py-3 px-4 font-mono text-white focus:ring-1 focus:ring-primary rounded" />
              </div>
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="Cryptography Quiz" questions={ENCRYPTION_QUIZ} />}
        </aside>
      </div>
    </div>
  );
}
