import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Gamepad2, Volume2, VolumeX, Settings, Sparkles, Play, RotateCcw, 
  Filter, Trophy, Clock, ExternalLink, Plus, Trash2, Download, 
  CheckCircle2, AlertCircle, Search, Dices, Flame, ShieldAlert
} from 'lucide-react';

const RARITY_TIERS = {
  GOLD: {
    id: 'GOLD',
    name: '★ Especial (Sin tocar · 0h)',
    label: '★ RARE SPECIAL',
    color: '#eab308',
    bgGradient: 'from-yellow-500/30 via-amber-600/10 to-slate-950',
    border: 'border-yellow-400',
    glow: 'shadow-[0_0_35px_rgba(234,179,8,0.5)]',
  },
  COVERT: {
    id: 'COVERT',
    name: 'Covert (Casi nuevo · < 2h)',
    label: 'COVERT',
    color: '#ef4444',
    bgGradient: 'from-red-600/30 via-red-900/10 to-slate-950',
    border: 'border-red-500',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.45)]',
  },
  CLASSIFIED: {
    id: 'CLASSIFIED',
    name: 'Classified (Pendiente · 2h - 10h)',
    label: 'CLASSIFIED',
    color: '#d946ef',
    bgGradient: 'from-fuchsia-600/30 via-fuchsia-900/10 to-slate-950',
    border: 'border-fuchsia-500',
    glow: 'shadow-[0_0_25px_rgba(217,70,239,0.4)]',
  },
  RESTRICTED: {
    id: 'RESTRICTED',
    name: 'Restricted (Jugado · 10h - 40h)',
    label: 'RESTRICTED',
    color: '#8b5cf6',
    bgGradient: 'from-violet-600/30 via-violet-900/10 to-slate-950',
    border: 'border-violet-500',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.35)]',
  },
  MILSPEC: {
    id: 'MILSPEC',
    name: 'Mil-Spec (Veterano · +40h)',
    label: 'MIL-SPEC',
    color: '#3b82f6',
    bgGradient: 'from-blue-600/30 via-blue-900/10 to-slate-950',
    border: 'border-blue-500',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
  }
};

const getRarityByHours = (hours) => {
  if (hours === 0) return RARITY_TIERS.GOLD;
  if (hours < 2) return RARITY_TIERS.COVERT;
  if (hours < 10) return RARITY_TIERS.CLASSIFIED;
  if (hours < 40) return RARITY_TIERS.RESTRICTED;
  return RARITY_TIERS.MILSPEC;
};

const DEFAULT_GAMES = [
  { appid: 1091500, name: "Cyberpunk 2077", hours: 0 },
  { appid: 1245620, name: "ELDEN RING", hours: 0 },
  { appid: 1174180, name: "Red Dead Redemption 2", hours: 1.2 },
  { appid: 292030, name: "The Witcher 3: Wild Hunt", hours: 0.5 },
  { appid: 1086940, name: "Baldur's Gate 3", hours: 0 },
  { appid: 2050650, name: "Resident Evil 4", hours: 4.5 },
  { appid: 271590, name: "Grand Theft Auto V", hours: 145.0 },
  { appid: 381210, name: "Dead by Daylight", hours: 68.5 },
  { appid: 1426210, name: "It Takes Two", hours: 14.0 },
  { appid: 367520, name: "Hollow Knight", hours: 0 },
  { appid: 1145360, name: "Hades", hours: 3.2 },
  { appid: 814380, name: "Sekiro: Shadows Die Twice", hours: 0 },
  { appid: 1593500, name: "God of War", hours: 8.5 },
  { appid: 582010, name: "Monster Hunter: World", hours: 22.0 },
  { appid: 413150, name: "Stardew Valley", hours: 19.4 },
  { appid: 105600, name: "Terraria", hours: 1.5 },
  { appid: 2358720, name: "Black Myth: Wukong", hours: 0 },
  { appid: 553850, name: "HELLDIVERS 2", hours: 31.0 }
];

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.028);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.028);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {}
  }

  playWin(isGold = false) {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = isGold ? [523.25, 659.25, 783.99, 1046.50, 1318.51] : [440, 554.37, 659.25, 880];
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = isGold ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        
        gain.gain.setValueAtTime(0.15, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.9);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.95);
      });
    } catch {}
  }
}

const sound = new SoundEngine();

export default function App() {
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('steam_case_games');
    return saved ? JSON.parse(saved) : DEFAULT_GAMES;
  });
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quickSpin, setQuickSpin] = useState(false);

  const [tapeItems, setTapeItems] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState('none');
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [importTab, setImportTab] = useState('API');
  const [steamApiKey, setSteamApiKey] = useState(() => localStorage.getItem('steam_api_key') || '');
  const [steamId, setSteamId] = useState(() => localStorage.getItem('steam_id') || '');
  const [jsonInput, setJsonInput] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualAppId, setManualAppId] = useState('');
  const [manualHours, setManualHours] = useState('0');
  const [importStatus, setImportStatus] = useState({ type: '', msg: '' });
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const viewportRef = useRef(null);
  const stripRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTickIndexRef = useRef(-1);

  const CARD_WIDTH = 210;
  const CARD_GAP = 12;
  const STEP_SIZE = CARD_WIDTH + CARD_GAP;
  const WINNING_INDEX = 62;
  const TOTAL_TAPE_CARDS = 75;

  useEffect(() => {
    localStorage.setItem('steam_case_games', JSON.stringify(games));
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterMode === 'UNPLAYED') return g.hours === 0;
      if (filterMode === 'BACKLOG') return g.hours < 2;
      if (filterMode === 'UNDER10') return g.hours < 10;
      return true;
    });
  }, [games, filterMode, searchQuery]);

  useEffect(() => {
    if (!isSpinning) {
      const pool = filteredGames.length > 0 ? filteredGames : games;
      if (pool.length === 0) return;
      const initialStrip = Array.from({ length: 25 }, (_, idx) => {
        const g = pool[idx % pool.length];
        return { ...g, rarity: getRarityByHours(g.hours), uid: `init-${idx}` };
      });
      setTapeItems(initialStrip);
      setTransitionStyle('none');
      setTranslateX(0);
    }
  }, [filteredGames.length, filterMode, games, isSpinning]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleOpenCase = () => {
    if (isSpinning || filteredGames.length === 0) return;

    setWinner(null);
    setIsSpinning(true);

    const newTape = [];
    for (let i = 0; i < TOTAL_TAPE_CARDS; i++) {
      const randomGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
      newTape.push({
        ...randomGame,
        rarity: getRarityByHours(randomGame.hours),
        uid: `spin-${Date.now()}-${i}`
      });
    }

    const chosenWinner = newTape[WINNING_INDEX];
    setTapeItems(newTape);

    setTransitionStyle('none');
    setTranslateX(0);
    lastTickIndexRef.current = -1;

    const viewportWidth = viewportRef.current ? viewportRef.current.offsetWidth : 900;
    const centerOfViewport = viewportWidth / 2;
    const cardStart = WINNING_INDEX * STEP_SIZE;
    const cardCenter = cardStart + CARD_WIDTH / 2;

    const maxJitter = (CARD_WIDTH / 2) - 18;
    const randomJitter = (Math.random() * 2 - 1) * maxJitter;

    const finalOffset = -(cardCenter - centerOfViewport + randomJitter);
    const spinDurationMs = quickSpin ? 2400 : 6200;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionStyle(`transform ${spinDurationMs}ms cubic-bezier(0.08, 0.82, 0.17, 1)`);
        setTranslateX(finalOffset);

        const startTime = performance.now();
        const trackTicks = (now) => {
          if (stripRef.current && viewportRef.current) {
            const style = window.getComputedStyle(stripRef.current);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const currentX = matrix.m41;
            const needlePosInStrip = Math.abs(currentX) + (viewportRef.current.offsetWidth / 2);
            const currentCardIdx = Math.floor(needlePosInStrip / STEP_SIZE);

            if (currentCardIdx !== lastTickIndexRef.current && currentCardIdx >= 0) {
              lastTickIndexRef.current = currentCardIdx;
              if (soundEnabled) sound.playTick();
            }
          }

          if (now - startTime < spinDurationMs) {
            animFrameRef.current = requestAnimationFrame(trackTicks);
          }
        };

        animFrameRef.current = requestAnimationFrame(trackTicks);

        setTimeout(() => {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          setIsSpinning(false);
          setWinner(chosenWinner);
          setHistory((prev) => [chosenWinner, ...prev.slice(0, 14)]);
          if (soundEnabled) {
            sound.playWin(chosenWinner.rarity.id === 'GOLD' || chosenWinner.rarity.id === 'COVERT');
          }
        }, spinDurationMs + 80);
      });
    });
  };

  const fetchSteamLibrary = async () => {
    if (!steamApiKey.trim() || !steamId.trim()) {
      setImportStatus({ type: 'error', msg: 'Introduce tanto tu API Key como tu SteamID64.' });
      return;
    }

    setIsLoadingApi(true);
    setImportStatus({ type: 'info', msg: 'Conectando con tu cuenta de Steam...' });

    localStorage.setItem('steam_api_key', steamApiKey.trim());
    localStorage.setItem('steam_id', steamId.trim());

    const queryParams = `IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey.trim()}&steamid=${steamId.trim()}&include_appinfo=true&include_played_free_games=true&format=json`;
    const steamTargetUrl = `https://api.steampowered.com/${queryParams}`;

    const endpointsToTry = [
      `/steam-api/${queryParams}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(steamTargetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(steamTargetUrl)}`
    ];

    let loadedGames = null;

    for (const endpoint of endpointsToTry) {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.response && Array.isArray(data.response.games)) {
          loadedGames = data.response.games;
          break;
        }
      } catch {}
    }

    setIsLoadingApi(false);

    if (loadedGames && loadedGames.length > 0) {
      const formatted = loadedGames
        .map((g) => ({
          appid: g.appid,
          name: g.name,
          hours: Math.round(((g.playtime_forever || 0) / 60) * 10) / 10
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setGames(formatted);
      setImportStatus({
        type: 'success',
        msg: `¡Éxito! Se han importado ${formatted.length} juegos de tu cuenta de Steam.`
      });
    } else {
      setImportStatus({
        type: 'error',
        msg: 'No se pudo leer la biblioteca. Asegúrate de que tu perfil de Steam tenga "Detalles de los juegos: Público" o usa la pestaña "Pegar JSON".'
      });
    }
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const rawList = parsed?.response?.games || parsed?.games || (Array.isArray(parsed) ? parsed : null);

      if (!rawList || !Array.isArray(rawList)) {
        setImportStatus({ type: 'error', msg: 'El JSON no tiene el formato de Steam esperado.' });
        return;
      }

      const formatted = rawList
        .filter((g) => g.appid && g.name)
        .map((g) => ({
          appid: Number(g.appid),
          name: g.name,
          hours: g.hours !== undefined ? Number(g.hours) : Math.round(((g.playtime_forever || 0) / 60) * 10) / 10
        }));

      if (formatted.length === 0) {
        setImportStatus({ type: 'error', msg: 'No se encontraron juegos válidos en el JSON.' });
        return;
      }

      setGames(formatted);
      setJsonInput('');
      setImportStatus({
        type: 'success',
        msg: `¡Importados ${formatted.length} juegos correctamente desde el JSON!`
      });
    } catch {
      setImportStatus({ type: 'error', msg: 'JSON inválido. Asegúrate de copiar todo el texto que te devuelve Steam.' });
    }
  };

  const handleAddManualGame = (e) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    const newGame = {
      appid: manualAppId.trim() ? Number(manualAppId.trim()) : Math.floor(Math.random() * 900000),
      name: manualName.trim(),
      hours: Math.max(0, Number(manualHours) || 0)
    };
    setGames((prev) => [newGame, ...prev]);
    setManualName('');
    setManualAppId('');
    setManualHours('0');
    setImportStatus({ type: 'success', msg: `"${newGame.name}" añadido a tu caja.` });
  };

  const removeGame = (appid) => {
    setGames((prev) => prev.filter((g) => g.appid !== appid));
  };

  const resetToDefault = () => {
    setGames(DEFAULT_GAMES);
    setImportStatus({ type: 'info', msg: 'Biblioteca restaurada a los juegos de prueba.' });
  };

  const getSteamImageUrl = (appid) =>
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans selection:bg-amber-500 selection:text-black pb-16 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[130px]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[400px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <header className="relative z-10 border-b border-slate-800/80 bg-[#0f131c]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-yellow-300/30">
              <Gamepad2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                  Steam Case Opener
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CS2 Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Decide a qué jugar abriendo cajas de tu propio backlog de Steam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setQuickSpin(!quickSpin)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition flex items-center gap-1.5 ${
                quickSpin
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Acorta la animación de 6s a 2.4s"
            >
              <Flame className="w-4 h-4" />
              Giro Rápido
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-lg border transition ${
                soundEnabled
                  ? 'bg-slate-900/80 border-slate-700 text-amber-400 hover:border-amber-500/50'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos de sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setImportStatus({ type: '', msg: '' });
                setShowModal(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 border border-blue-400/30 transition"
            >
              <Settings className="w-4 h-4" />
              Importar mi Steam ({games.length})
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <section className="bg-gradient-to-b from-[#131924] to-[#0d1119] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-slate-300">
                Contenedor de Biblioteca · {filteredGames.length} juegos en el pool actual
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {Object.values(RARITY_TIERS).map((tier) => (
                <span
                  key={tier.id}
                  className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-slate-300"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  {tier.name.split(' (')[0]}
                </span>
              ))}
            </div>
          </div>

          <div
            ref={viewportRef}
            className="relative w-full h-[230px] bg-[#07090e] rounded-xl border-2 border-slate-800/90 overflow-hidden flex items-center shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]"
          >
            <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#07090e] via-[#07090e]/80 to-transparent z-20 pointer-events-none" />

            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between">
              <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
              <div className="w-[3px] flex-1 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_15px_#fbbf24]" />
              <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[14px] border-b-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
            </div>

            {filteredGames.length === 0 ? (
              <div className="w-full text-center text-slate-400 text-sm px-4">
                No hay juegos que coincidan con este filtro. Cambia el filtro abajo o añade juegos.
              </div>
            ) : (
              <div
                ref={stripRef}
                style={{
                  transform: `translate3d(${translateX}px, 0, 0)`,
                  transition: transitionStyle,
                  gap: `${CARD_GAP}px`
                }}
                className="flex items-center pl-4 will-change-transform select-none"
              >
                {tapeItems.map((item) => (
                  <div
                    key={item.uid}
                    style={{ width: `${CARD_WIDTH}px`, minWidth: `${CARD_WIDTH}px` }}
                    className={`h-[186px] rounded-lg bg-gradient-to-b ${item.rarity.bgGradient} border border-slate-800/90 flex flex-col justify-between overflow-hidden relative group shadow-lg`}
                  >
                    <div className="relative h-[105px] w-full bg-slate-950 overflow-hidden">
                      <img
                        src={getSteamImageUrl(item.appid)}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-slate-200 flex items-center gap-1 border border-white/10">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        {item.hours === 0 ? 'SIN JUGAR' : `${item.hours}h`}
                      </div>
                    </div>

                    <div className="p-2.5 flex-1 flex flex-col justify-between bg-slate-950/60">
                      <p className="text-xs font-bold text-white truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold">
                        <span style={{ color: item.rarity.color }}>{item.rarity.label}</span>
                        <span className="text-slate-500">#{item.appid}</span>
                      </div>
                    </div>

                    <div
                      className="h-[6px] w-full"
                      style={{
                        backgroundColor: item.rarity.color,
                        boxShadow: `0 -2px 12px ${item.rarity.color}`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                Modo Caja:
              </span>
              {[
                { id: 'ALL', label: 'Toda la Biblioteca' },
                { id: 'UNPLAYED', label: '★ Solo 0 Horas (Intocables)' },
                { id: 'BACKLOG', label: 'Backlog (< 2h)' },
                { id: 'UNDER10', label: 'Pendientes (< 10h)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  disabled={isSpinning}
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    filterMode === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
                  } disabled:opacity-50`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenCase}
              disabled={isSpinning || filteredGames.length === 0}
              className="w-full md:w-auto min-w-[250px] py-3.5 px-8 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.65)] transition-all transform active:scale-95 flex items-center justify-center gap-2.5 border border-emerald-300/50"
            >
              <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Abriendo Caja...' : 'Abrir Caja de Steam'}
            </button>
          </div>
        </section>

        {history.length > 0 && (
          <section className="mt-6 bg-[#10141d] border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Historial de Drops de esta sesión
              </h2>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Limpiar historial
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {history.map((h, i) => (
                <div
                  key={`${h.uid}-${i}`}
                  onClick={() => setWinner(h)}
                  className="cursor-pointer flex-shrink-0 w-44 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-600 transition overflow-hidden"
                >
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-white truncate">{h.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.hours} horas jugadas</p>
                  </div>
                  <div className="h-1 w-full" style={{ backgroundColor: h.rarity.color }} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                Inventario de la Caja ({filteredGames.length} juegos)
              </h2>
              <p className="text-xs text-slate-400">
                Haz clic en cualquier juego si quieres forzar su inspección o abrirlo directamente en Steam
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar juego en tu inventario..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredGames.slice(0, 60).map((game) => {
              const rarity = getRarityByHours(game.hours);
              return (
                <div
                  key={game.appid}
                  className={`group rounded-xl bg-gradient-to-b ${rarity.bgGradient} border border-slate-800/90 hover:border-slate-600 transition-all overflow-hidden flex flex-col justify-between relative shadow-md`}
                >
                  <div className="relative h-24 bg-slate-950 overflow-hidden">
                    <img
                      src={getSteamImageUrl(game.appid)}
                      alt={game.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => removeGame(game.appid)}
                      title="Quitar de la ruleta"
                      className="opacity-0 group-hover:opacity-100 transition absolute top-1.5 right-1.5 p-1 rounded bg-black/80 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div
                    onClick={() => setWinner({ ...game, rarity })}
                    className="p-2.5 cursor-pointer flex-1 flex flex-col justify-between bg-slate-950/70"
                  >
                    <p className="text-xs font-bold text-slate-100 truncate" title={game.name}>
                      {game.name}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px]">
                      <span className="font-bold" style={{ color: rarity.color }}>
                        {rarity.label}
                      </span>
                      <span className="text-slate-400">{game.hours}h</span>
                    </div>
                  </div>

                  <div className="h-1 w-full" style={{ backgroundColor: rarity.color }} />
                </div>
              );
            })}
          </div>
          {filteredGames.length > 60 && (
            <p className="text-center text-xs text-slate-500 mt-4">
              Mostrando 60 de {filteredGames.length} juegos en la vista previa (todos los {filteredGames.length} entran en la ruleta al girar).
            </p>
          )}
        </section>
      </main>

      {winner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`relative max-w-lg w-full rounded-2xl bg-gradient-to-b ${winner.rarity.bgGradient} bg-[#111622] border-2 ${winner.rarity.border} ${winner.rarity.glow} p-6 sm:p-8 text-center overflow-hidden`}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border mb-4"
              style={{ borderColor: winner.rarity.color, color: winner.rarity.color, backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {winner.rarity.name}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
              {winner.name}
            </h2>

            <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-2xl mb-6 bg-slate-950 aspect-[460/215] flex items-center justify-center">
              <img
                src={getSteamImageUrl(winner.appid)}
                alt={winner.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/10">
                Tiempo jugado: {winner.hours} horas
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`steam://run/${winner.appid}`}
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                Jugar Ahora en Steam
              </a>

              <a
                href={`https://store.steampowered.com/app/${winner.appid}`}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Tienda
              </a>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setWinner(null)}
                className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition"
              >
                Cerrar inspección
              </button>

              <button
                onClick={() => {
                  setWinner(null);
                  setTimeout(handleOpenCase, 100);
                }}
                className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Abrir otra caja
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                  Conectar Biblioteca de Steam
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Importa todos tus juegos reales y horas jugadas automáticamente
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              {[
                { id: 'API', label: '1. Automático (API Key)' },
                { id: 'JSON', label: '2. Pegar JSON (Sin bloqueos)' },
                { id: 'MANUAL', label: '3. Añadir a mano' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setImportTab(t.id);
                    setImportStatus({ type: '', msg: '' });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                    importTab === t.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {importTab === 'API' && (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 leading-relaxed">
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    Requisitos rápidos de Steam:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      Consigue tu API Key en{' '}
                      <a
                        href="https://steamcommunity.com/dev/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 underline font-semibold"
                      >
                        steamcommunity.com/dev/apikey
                      </a>
                    </li>
                    <li>
                      Tu <strong>SteamID64</strong> son los 17 números que salen en la URL de tu perfil o en "Detalles de la cuenta".
                    </li>
                    <li>
                      En tu perfil de Steam &gt; Privacidad, pon <strong>Detalles de los juegos: Público</strong>.
                    </li>
                  </ul>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Tu Steam Web API Key
                    </label>
                    <input
                      type="password"
                      value={steamApiKey}
                      onChange={(e) => setSteamApiKey(e.target.value)}
                      placeholder="Ej: 4A8B9C1D2E3F..."
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Tu SteamID64 (17 dígitos)
                    </label>
                    <input
                      type="text"
                      value={steamId}
                      onChange={(e) => setSteamId(e.target.value)}
                      placeholder="Ej: 76561198012345678"
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={fetchSteamLibrary}
                  disabled={isLoadingApi}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isLoadingApi ? 'Descargando tus juegos...' : 'Cargar todos mis juegos de Steam'}
                </button>
              </div>
            )}

            {importTab === 'JSON' && (
              <div className="space-y-4 text-xs text-slate-300">
                <p className="text-slate-400 leading-relaxed">
                  Si el navegador bloquea la conexión directa por seguridad (CORS), rellena tu API Key y SteamID en la pestaña anterior, abre este enlace directo en una pestaña nueva, copia todo el texto que sale y pégalo aquí abajo:
                </p>

                {steamApiKey && steamId ? (
                  <a
                    href={`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey.trim()}&steamid=${steamId.trim()}&include_appinfo=true&include_played_free_games=true&format=json`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir mi JSON oficial de Steam en otra pestaña
                  </a>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                    Escribe primero tu API Key y SteamID64 en la Pestaña 1 para que te generemos tu enlace directo aquí.
                  </div>
                )}

                <textarea
                  rows={5}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Pega aquí el contenido JSON completo ({"response":{"game_count":...}})'
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />

                <button
                  onClick={handleJsonImport}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black uppercase tracking-wider text-slate-950 transition"
                >
                  Procesar JSON e Importar Juegos
                </button>
              </div>
            )}

            {importTab === 'MANUAL' && (
              <form onSubmit={handleAddManualGame} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Nombre del Juego
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Ej: Hollow Knight: Silksong"
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Horas Jugadas
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Steam AppID (Opcional, para cargar la carátula oficial y abrir el juego)
                  </label>
                  <input
                    type="number"
                    value={manualAppId}
                    onChange={(e) => setManualAppId(e.target.value)}
                    placeholder="Ej: 1030300 (lo ves en la URL de la tienda de Steam)"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Juego a la Caja
                </button>
              </form>
            )}

            {importStatus.msg && (
              <div
                className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : importStatus.type === 'error'
                    ? 'bg-red-950/50 border-red-500/40 text-red-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span>{importStatus.msg}</span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Tus juegos quedan guardados automáticamente en tu navegador.</span>
              <button
                onClick={resetToDefault}
                className="text-slate-400 hover:text-amber-400 underline transition"
              >
                Restaurar los 18 juegos de prueba
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}