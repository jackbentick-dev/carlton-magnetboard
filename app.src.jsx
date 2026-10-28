    // ---- Season context: one season renders at a time (App is re-keyed on switch) ----
    let S_YEAR = 2026, S_PLAYERS, S_FIXTURE, S_RESULTS, S_STATS, S_SEEDS, S_SEED_KEY, S_LIST;
    const applySeason = (y) => {
      const sz = SEASONS[y] || SEASONS[2026];
      S_YEAR = sz.year; S_PLAYERS = sz.players; S_FIXTURE = sz.fixture; S_RESULTS = sz.results;
      S_STATS = sz.stats; S_SEEDS = sz.seeds; S_SEED_KEY = sz.seedKey; S_LIST = sz.listChanges;
    };
    applySeason(2026);
    const numLabel = (pl) => (pl.number === null || pl.number === undefined) ? '–' : pl.number;
    // 'Lewis Young' -> 'L. Young' (the list has several shared surnames: Young, Camporeale, Hollands)
    const shortName = (name) => { const pts = name.split(' '); return pts.length > 1 ? `${pts[0][0]}. ${pts.slice(1).join(' ')}` : name; };
    const normName = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
    const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');


    const { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } = React;

    const calculateAge = (dob) => {
      const birth = new Date(dob);
      const today = new Date(`${S_YEAR}-01-31`);
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
      return age;
    };

    // Carlton color palette
    const CARLTON_NAVY = '#0d1c36';
    const CARLTON_NAVY_LIGHT = '#162850';
    const CARLTON_NAVY_DARK = '#060d1a';

    const posColors = {
      DEF: { bg: '#0f766e', light: '#14b8a6', glow: 'rgba(20,184,166,0.4)' },
      MID: { bg: '#1d4ed8', light: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
      RUCK: { bg: '#7c3aed', light: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
      FWD: { bg: '#dc2626', light: '#f87171', glow: 'rgba(248,113,113,0.4)' },
    };

    const scoreColors = {
      0: { bg: 'rgba(239,68,68,0.2)', text: '#f87171', border: 'rgba(239,68,68,0.4)' },
      1: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
      2: { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24', border: 'rgba(251,191,36,0.4)' },
      3: { bg: 'rgba(34,197,94,0.2)', text: '#22c55e', border: 'rgba(34,197,94,0.4)' },
      4: { bg: 'rgba(59,130,246,0.25)', text: '#60a5fa', border: 'rgba(59,130,246,0.5)' },
    };

    // Real club logos (Squiggle-hosted), falling back to two-tone circle offline
    const ClubLogo = ({ team, size = 24 }) => {
      const [err, setErr] = useState(false);
      const club = AFL_CLUBS[team];
      if (!club) return null;
      const file = CLUB_LOGO_FILES[team];

      if (err || !file) {
        return (
          <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${club.primary} 0%, ${club.primary} 50%, ${club.secondary} 50%, ${club.secondary} 100%)`,
            border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.32, fontWeight: '800',
            color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}>{club.abbr.charAt(0)}</div>
        );
      }

      return (
        <div style={{
          width: size, height: size, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
        }}>
          <img
            src={`https://squiggle.com.au/wp-content/themes/squiggle/assets/images/${file}.png`}
            alt={team}
            onError={() => setErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      );
    };

    const PHOTO_EXTS = ['png', 'jpg', 'webp'];
    // Local copies (players/, from get_photos.py) are for opening the page from disk. Online, the
    // AFL CDN goes first: on the phone the local tries were three 404s per face before every photo.
    const LOCAL_PHOTOS_FIRST = location.protocol === 'file:';
    const deadPhotoSrc = new Set();   // sources that failed once this visit; never retried

    const PlayerPhoto = ({ player, size = 36 }) => {
      const [, bump] = useState(0);
      const local = player.number == null ? [] : PHOTO_EXTS.map(ext => `players/${player.number}.${ext}`);
      const cdn = PLAYER_PHOTOS[player.number] ? [PLAYER_PHOTOS[player.number]] : [];
      const src = (LOCAL_PHOTOS_FIRST ? [...local, ...cdn] : [...cdn, ...local]).find(s => !deadPhotoSrc.has(s));

      if (!src) {
        return (
          <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: size * (player.number == null ? 0.36 : 0.44), fontWeight: '600',
            fontFamily: "'Oswald', 'Inter', sans-serif",
            boxShadow: `0 2px 8px rgba(13,28,54,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
            border: '2px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
          }}>
            {player.number == null ? player.name.split(' ').map(w => w[0]).join('').slice(0, 2) : numLabel(player)}
          </div>
        );
      }

      return (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
          boxShadow: `0 2px 8px rgba(13,28,54,0.5)`,
          border: '2px solid rgba(255,255,255,0.2)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <img
            src={src}
            alt={player.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => { deadPhotoSrc.add(src); bump(n => n + 1); }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
        </div>
      );
    };

    // Player Number Badge Component (simplified, always shows number)
    const PlayerBadge = ({ player, size = 36 }) => {
      return (
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: size * 0.45,
          fontWeight: '800',
          boxShadow: `0 2px 8px rgba(13,28,54,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
          border: '2px solid rgba(255,255,255,0.15)',
          flexShrink: 0,
        }}>
          {numLabel(player)}
        </div>
      );
    };

    // Glass Card Component
    const GlassCard = ({ children, style, ...props }) => (
      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        ...style,
      }} {...props}>{children}</div>
    );

    // Fixture Panel
    const FixturePanel = ({ results, onSync, syncState }) => {
      const res = results || {};
      const isPlayed = (g) => g.played || !!res[g.round];
      const nextRound = (S_FIXTURE.find(g => !isPlayed(g) && g.opponent !== 'BYE') || {}).round;
      const wins = Object.values(res).filter(r => r.result === 'W').length;
      const losses = Object.values(res).filter(r => r.result === 'L').length;
      const draws = Object.values(res).filter(r => r.result === 'D').length;
      return (
      <GlassCard style={{ padding: '18px', flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{
          color: '#fff',
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '2px',
          marginBottom: '18px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '3px', height: '14px', background: 'linear-gradient(180deg, #60a5fa, #1d4ed8)', borderRadius: '2px', display: 'inline-block' }}></span>
            {S_YEAR} FIXTURE
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: '700', letterSpacing: '1px' }}>
              {wins}–{losses}{draws ? `–${draws}` : ''}
            </span>
          </span>
          <button
            onClick={onSync}
            disabled={syncState === 'syncing'}
            style={{
              background: syncState === 'ok' ? 'rgba(34,197,94,0.15)' : syncState === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px', padding: '4px 10px',
              fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px',
              color: syncState === 'ok' ? '#22c55e' : syncState === 'fail' ? '#f87171' : 'rgba(255,255,255,0.55)',
              cursor: syncState === 'syncing' ? 'wait' : 'pointer',
            }}
          >{syncState === 'syncing' ? 'SYNCING…' : syncState === 'ok' ? '✓ UPDATED' : syncState === 'fail' ? '✗ OFFLINE' : '⟳ SYNC'}</button>
        </div>
        {S_FIXTURE.map((game, i) => { const isNext = game.round === nextRound; const played = isPlayed(game); const r = res[game.round]; return (
          <div key={i} style={{
            padding: isNext ? '12px' : '12px 4px',
            margin: isNext ? '6px 0' : 0,
            borderRadius: isNext ? '12px' : 0,
            background: isNext ? 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 100%)' : 'transparent',
            border: isNext ? '1px solid rgba(96,165,250,0.35)' : 'none',
            borderBottom: isNext ? '1px solid rgba(96,165,250,0.35)' : (i < S_FIXTURE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'),
            transition: 'background 0.15s ease',
            opacity: played && !isNext ? 0.55 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                background: played ? 'rgba(255,255,255,0.12)' : game.opponent === 'BYE' ? 'rgba(255,255,255,0.08)' : (game.home ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.08)'),
                color: played ? 'rgba(255,255,255,0.5)' : '#fff',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
                textDecoration: 'none',
              }}>{game.round}</span>
              {isNext && (
                <span style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                  color: '#fff', fontSize: '9px', fontWeight: '800',
                  padding: '4px 9px', borderRadius: '5px', letterSpacing: '1.5px',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                }}>NEXT UP</span>
              )}
              {r ? (
                <span style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  color: r.result === 'W' ? '#22c55e' : r.result === 'D' ? '#fbbf24' : '#f87171',
                }}>{r.result} {r.for}–{r.against}</span>
              ) : played ? (
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: '600',
                  fontStyle: 'italic',
                }}>Played</span>
              ) : null}
              {game.tag && (
                <span style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)',
                  color: '#fbbf24',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}>{game.tag}</span>
              )}
            </div>
            {game.opponent === 'BYE' ? (
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', fontStyle: 'italic', paddingLeft: '2px' }}>Bye Week</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClubLogo team={game.opponent} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '700',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ color: game.home ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>{game.home ? 'vs' : '@'}</span> {game.opponent}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                  }}>
                    {game.date} • {game.time}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '11px',
                  }}>{game.venue}</div>
                </div>
              </div>
            )}
          </div>
        ); })}
      </GlassCard>
      );
    };

    // B&F race chart — cumulative votes per round, top 5
    const RACE_COLORS = ['#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#c084fc'];

    const RaceChart = ({ votes, playableRounds, playerTotals }) => {
      const roundsWithVotes = playableRounds
        .map(g => g.round)
        .filter(r => S_PLAYERS.some(pl => {
          const v = votes[pl.id]?.[r];
          return v !== undefined && v !== null;
        }));

      if (roundsWithVotes.length === 0) {
        return (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', padding: '40px 20px' }}>
            No votes recorded yet — the race chart builds as you vote each round.
          </div>
        );
      }

      const top5 = playerTotals.filter(pl => pl.games > 0).slice(0, 5);
      const series = top5.map((pl, i) => {
        let c = 0;
        const pts = roundsWithVotes.map(r => {
          const v = votes[pl.id]?.[r];
          if (v !== undefined && v !== null) c += v;
          return c;
        });
        return { player: pl, pts, color: RACE_COLORS[i % RACE_COLORS.length] };
      });
      const maxY = Math.max(1, ...series.map(sr => sr.pts[sr.pts.length - 1]));

      const CW = 380, CH = 250, L = 34, R = 12, T = 14, B = 34;
      const xFor = (i) => roundsWithVotes.length === 1
        ? (L + (CW - L - R) / 2)
        : L + (i / (roundsWithVotes.length - 1)) * (CW - L - R);
      const yFor = (v) => T + (1 - v / maxY) * (CH - T - B);
      const labelEvery = Math.max(1, Math.ceil(roundsWithVotes.length / 8));

      return (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <svg viewBox={`0 0 ${CW} ${CH}`} style={{ width: '100%' }}>
            {[0.25, 0.5, 0.75, 1].map(f => (
              <g key={f}>
                <line x1={L} y1={yFor(maxY * f)} x2={CW - R} y2={yFor(maxY * f)}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                <text x={L - 5} y={yFor(maxY * f) + 3} textAnchor="end"
                  fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="Inter">{Math.round(maxY * f)}</text>
              </g>
            ))}
            {roundsWithVotes.map((r, i) => (
              i % labelEvery === 0 ? (
                <text key={r} x={xFor(i)} y={CH - B + 14} textAnchor="middle"
                  fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="Inter">{r}</text>
              ) : null
            ))}
            {series.map(sr => (
              <g key={sr.player.id}>
                <polyline
                  points={sr.pts.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ')}
                  fill="none" stroke={sr.color} strokeWidth="2"
                  strokeLinejoin="round" strokeLinecap="round"/>
                <circle cx={xFor(sr.pts.length - 1)} cy={yFor(sr.pts[sr.pts.length - 1])} r="3" fill={sr.color}/>
              </g>
            ))}
          </svg>
          <div style={{ padding: '4px 2px 10px' }}>
            {series.map(sr => (
              <div key={sr.player.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: sr.color, flexShrink: 0 }}></span>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600', flex: 1 }}>{sr.player.name}</span>
                <span style={{ color: sr.color, fontSize: '13px', fontWeight: '800' }}>{sr.pts[sr.pts.length - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    // B&F Panel
    const BFPanel = ({ votes, setVotes, selectedRound, setSelectedRound, view, setView, ratings, setRatings }) => {
      const [showImport, setShowImport] = useState(false);
      const [importText, setImportText] = useState('');
      const playableRounds = S_FIXTURE.filter(g => g.opponent !== 'BYE');
      const currentGame = playableRounds.find(g => g.round === selectedRound) || playableRounds[0];

      const playerTotals = S_PLAYERS.map(player => {
        const roundVotes = votes[player.id] || {};
        // Only count rounds where score is explicitly set (not undefined) — blank = DNP
        const playedEntries = Object.entries(roundVotes).filter(([_, v]) => v !== undefined && v !== null);
        const total = playedEntries.reduce((sum, [_, v]) => sum + v, 0);
        const games = playedEntries.length;
        return { ...player, total, games };
      }).sort((a, b) => b.total - a.total);

      const setScore = (playerId, score) => {
        const wasToggleOff = votes[playerId]?.[selectedRound] === score;
        setVotes(prev => ({
          ...prev,
          [playerId]: {
            ...prev[playerId],
            [selectedRound]: prev[playerId]?.[selectedRound] === score ? undefined : score
          }
        }));
        if (!wasToggleOff) {
          const idx = voteList.findIndex(p2 => p2.id === playerId);
          const next = voteList.slice(idx + 1).find(p2 => {
            const v = votes[p2.id]?.[selectedRound];
            return v === undefined || v === null;
          });
          if (next) {
            setTimeout(() => {
              const el = voteRowRefs.current[next.id];
              if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
          }
        }
      };

      const parseRatings = () => {
        const lines = importText.split('\n');
        const newRatings = {};
        lines.forEach(line => {
          const parts = line.split(/\t|,/).map(s => s.trim());
          if (parts.length < 3) return;
          const playerName = parts[0]?.replace(/^[🔵🟡⚫🔴🟤🟢🟠⚪]+\s*/, '');
          const team = parts[1];
          const rating = parseFloat(parts[2]);
          let tog = null;
          for (let i = 3; i < parts.length; i++) {
            const val = parseFloat(parts[i]);
            if (!isNaN(val) && val >= 50 && val <= 100) {
              tog = val;
              break;
            }
          }
          if (team === 'Carl' && playerName && !isNaN(rating)) {
            // Exact name first; a surname only counts if it's unique (or unique with the first initial)
            const surname = normName(playerName.split(' ').pop());
            const initial = normName(playerName)[0];
            const sameSurname = S_PLAYERS.filter(p => normName(p.name.split(' ').pop()) === surname);
            const sameInitial = sameSurname.filter(p => normName(p.name)[0] === initial);
            const player = S_PLAYERS.find(p => normName(p.name) === normName(playerName))
              || (sameSurname.length === 1 ? sameSurname[0] : sameInitial.length === 1 ? sameInitial[0] : null);
            if (player) {
              newRatings[player.id] = { rating, tog };
            }
          }
        });
        if (Object.keys(newRatings).length > 0) {
          setRatings(prev => ({ ...prev, [selectedRound]: newRatings }));
          setShowImport(false);
          setImportText('');
        }
      };

      const getPlayerStats = (playerId) => ratings[selectedRound]?.[playerId];
      const hasRatings = ratings[selectedRound] && Object.keys(ratings[selectedRound]).length > 0;

      const voteList = [...S_PLAYERS].sort((a, b) => {
        const statsA = getPlayerStats(a.id);
        const statsB = getPlayerStats(b.id);
        if (statsA?.rating !== undefined && statsB?.rating !== undefined) return statsB.rating - statsA.rating;
        if (statsA?.rating !== undefined) return -1;
        if (statsB?.rating !== undefined) return 1;
        return a.number - b.number;
      });
      const voteRowRefs = useRef({});
      const scoredCount = S_PLAYERS.filter(p2 => {
        const v = votes[p2.id]?.[selectedRound];
        return v !== undefined && v !== null;
      }).length;
      const playedCount = ratings[selectedRound]
        ? Object.values(ratings[selectedRound]).filter(r2 => r2 && r2.rating !== null && r2.rating !== undefined).length
        : 0;

      return (
        <GlassCard style={{ padding: '16px', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            color: '#fff',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '2px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '14px', background: 'linear-gradient(180deg, #fbbf24, #b45309)', borderRadius: '2px', display: 'inline-block' }}></span> BEST & FAIREST
            </span>
            <button
              onClick={() => setShowImport(!showImport)}
              style={{
                background: hasRatings ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)' : 'rgba(255,255,255,0.08)',
                border: hasRatings ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '9px',
                color: hasRatings ? '#22c55e' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.15s ease',
              }}
            >{hasRatings ? '✓ Wheelo' : '+ Wheelo'}</button>
          </div>

          {showImport && (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '11px', color: '#fff', marginBottom: '8px', fontWeight: '700' }}>
                Import Wheelo Ratings for {selectedRound}
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste: Name, Team, Rating, TOG..."
                style={{
                  width: '100%',
                  height: '70px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '8px',
                  resize: 'none',
                  marginBottom: '8px',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={parseRatings}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                >Import</button>
                <button
                  onClick={() => { setShowImport(false); setImportText(''); }}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {['vote', 'leaderboard', 'race'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: view === v ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.05)',
                  color: view === v ? CARLTON_NAVY : 'rgba(255,255,255,0.5)',
                  boxShadow: view === v ? '0 2px 10px rgba(0,0,0,0.35)' : 'none',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >{v === 'vote' ? 'Vote' : v === 'leaderboard' ? 'Leaderboard' : 'Race'}</button>
            ))}
          </div>

          {view === 'race' ? (
            <RaceChart votes={votes} playableRounds={playableRounds} playerTotals={playerTotals} />
          ) : view === 'vote' ? (
            <>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: CARLTON_NAVY,
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                }}
              >
                {playableRounds.map(game => (
                  <option key={game.round} value={game.round}>
                    {game.round}: {game.home ? 'vs' : '@'} {game.opponent}
                  </option>
                ))}
              </select>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                marginBottom: '8px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: '600',
              }}>
                {['0=Bad', '1=OK', '2=Good', '3=V.Good', '4=Great'].map(l => (
                  <span key={l}>{l}</span>
                ))}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '10px', padding: '0 2px',
                fontSize: '11px', fontWeight: '700',
              }}>
                <span style={{ color: scoredCount > 0 ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
                  {scoredCount} scored{playedCount > 0 ? ` of ${playedCount} played` : ''}
                </span>
                {playedCount > 0 && scoredCount < playedCount && (
                  <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }}></span>
                    {playedCount - scoredCount} to go
                  </span>
                )}
              </div>

              <div style={{ flex: 1, overflow: 'auto' }}>
                {voteList.map(player => {
                  const score = votes[player.id]?.[selectedRound];
                  const stats = getPlayerStats(player.id);
                  return (
                    <div key={player.id} ref={el => { voteRowRefs.current[player.id] = el; }} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                      <PlayerPhoto player={player} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>{player.name}</span>
                          {stats?.rating !== undefined && (
                            <span style={{
                              background: stats.rating >= 15 ? 'rgba(34,197,94,0.25)' : stats.rating >= 8 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.1)',
                              color: stats.rating >= 15 ? '#22c55e' : stats.rating >= 8 ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                              fontSize: '9px',
                              fontWeight: '700',
                              padding: '2px 5px',
                              borderRadius: '4px',
                            }}>{stats.rating.toFixed(1)}</span>
                          )}
                          {stats?.tog && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px' }}>{Math.round(stats.tog)}%</span>
                          )}
                        </div>
                      </div>
                      {stats?.rating != null && (score === undefined || score === null) && (
                        <span title="Played this round — no vote yet" style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#fbbf24', flexShrink: 0,
                        }}></span>
                      )}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2, 3, 4].map(s => (
                          <button
                            key={s}
                            onClick={() => setScore(player.id, s)}
                            style={{
                              width: '28px',
                              height: '28px',
                              background: score === s ? scoreColors[s].bg : 'rgba(255,255,255,0.03)',
                              color: score === s ? scoreColors[s].text : 'rgba(255,255,255,0.25)',
                              border: `1px solid ${score === s ? scoreColors[s].border : 'rgba(255,255,255,0.06)'}`,
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.1s ease',
                            }}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>
              {(() => {
                const ranked = playerTotals.filter(p => p.games > 0);
                const ranks = ranked.map((player, i) => {
                  if (i === 0) return 1;
                  return ranked[i].total === ranked[i - 1].total
                    ? null // will be filled below
                    : i + 1;
                });
                // Fill ranks: for each player, find the first player with same total and use its rank
                const finalRanks = ranked.map((player, i) => {
                  const firstIdx = ranked.findIndex(p => p.total === player.total);
                  return firstIdx + 1;
                });
                return ranked.map((player, i) => {
                  const rank = finalRanks[i];
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                  // Compute rating & TOG averages from Wheelo data
                  const ratingEntries = Object.entries(ratings || {}).reduce((acc, [round, roundData]) => {
                    const d = roundData[player.id];
                    if (d && d.rating !== null && d.rating !== undefined) acc.push(d);
                    return acc;
                  }, []);
                  const avgRating = ratingEntries.length > 0 ? (ratingEntries.reduce((s, d) => s + d.rating, 0) / ratingEntries.length) : null;
                  const togEntries = ratingEntries.filter(d => d.tog !== null && d.tog !== undefined);
                  const avgTog = togEntries.length > 0 ? (togEntries.reduce((s, d) => s + d.tog, 0) / togEntries.length) : null;
                  return (
                <div key={player.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    width: '24px',
                    color: rank <= 3 ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                    fontSize: medal ? '14px' : '13px',
                    fontWeight: '800',
                    textAlign: 'center',
                  }}>{medal || rank}</div>
                  <PlayerPhoto player={player} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>{player.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                      {player.games} gm • {player.games > 0 ? (player.total / player.games).toFixed(2) : '0'} avg
                      {avgRating !== null ? ` • ${avgRating.toFixed(1)} rtg` : ''}
                      {avgTog !== null ? ` • ${Math.round(avgTog)}% TOG` : ''}
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '800',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                  }}>{player.total}</div>
                </div>
                  );
                });
              })()}
              {playerTotals.filter(p => p.games > 0).length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', padding: '40px 20px' }}>
                  No votes recorded yet
                </div>
              )}
            </div>
          )}
        </GlassCard>
      );
    };

    // History Panel Component
    const HistoryPanel = () => {
      const [selectedYear, setSelectedYear] = useState(2025);
      const years = Object.keys(BF_HISTORY).map(Number).sort((a, b) => b - a);
      const data = (BF_HISTORY[selectedYear] || []).slice().sort((a, b) => b.total - a.total);

      return (
        <GlassCard style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: '800', marginBottom: '10px' }}>B&F History</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {years.map(y => (
                <button key={y} onClick={() => setSelectedYear(y)} style={{
                  padding: '5px 10px',
                  background: selectedYear === y ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.05)',
                  color: selectedYear === y ? CARLTON_NAVY : 'rgba(255,255,255,0.4)',
                  border: selectedYear === y ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}>{y}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
            {data.map((player, i) => {
              const rank = (() => { const firstIdx = data.findIndex(p => p.total === player.total); return firstIdx + 1; })();
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
              const maxTotal = data[0]?.total || 1;
              return (
                <div key={player.name} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    width: '22px', textAlign: 'center',
                    color: rank <= 3 ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                    fontSize: medal ? '13px' : '11px', fontWeight: '800',
                  }}>{medal || rank}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>{player.name}</div>
                    <div style={{
                      height: '3px', borderRadius: '2px', marginTop: '3px',
                      background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${(player.total / maxTotal) * 100}%`,
                        background: rank <= 3 ? 'linear-gradient(90deg, #1d4ed8, #3b82f6)' : 'rgba(255,255,255,0.15)',
                      }} />
                    </div>
                  </div>
                  <div style={{
                    background: rank <= 3 ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
                    padding: '3px 10px', borderRadius: '8px',
                    color: rank <= 3 ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '12px', fontWeight: '800',
                  }}>{player.total}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      );
    };

    // Stats Panel Component
    const StatsPanel = () => {
      const [selRound, setSelRound] = useState('ALL');
      const [selCat, setSelCat] = useState('Rating');
      const [selStat, setSelStat] = useState('rating');
      const rounds = ['ALL', ...Object.keys(S_STATS)];

      const statDef = Object.values(STAT_CATEGORIES).flat().find(s => s.key === selStat) || { label: selStat, color: '#3b82f6' };

      // Aggregate player data
      const playerData = (() => {
        const map = {};
        const activeRounds = selRound === 'ALL' ? Object.keys(S_STATS) : [selRound];
        activeRounds.forEach(r => {
          const rd = S_STATS[r];
          if (!rd) return;
          rd.players.forEach(p => {
            if (!map[p.name]) map[p.name] = { name: p.name, values: [], rounds: 0 };
            map[p.name].values.push(p[selStat] || 0);
            map[p.name].rounds++;
          });
        });
        return Object.values(map).map(p => ({
          name: p.name,
          value: selRound === 'ALL' ? +(p.values.reduce((a,b) => a+b, 0) / p.rounds).toFixed(1) : p.values[0] || 0,
          rounds: p.rounds,
        })).sort((a, b) => b.value - a.value);
      })();

      const maxVal = Math.max(...playerData.map(p => Math.abs(p.value)), 1);
      const hasNegative = playerData.some(p => p.value < 0);

      const roundIdx = rounds.indexOf(selRound);
      const stepRound = (d) => setSelRound(rounds[Math.max(0, Math.min(rounds.length - 1, roundIdx + d))]);
      const roundLabel = (r) => {
        if (r === 'ALL') return `Season average (${rounds.length - 1} games)`;
        const g = S_FIXTURE.find(f => f.round === r);
        const res = S_RESULTS[r];
        return `${r}  ${g ? (g.home ? 'vs' : '@') : 'v'} ${S_STATS[r].opponent}${res ? `  (${res.result} ${res.for}–${res.against})` : ''}`;
      };
      const arrowStyle = (off) => ({
        width: '34px', flexShrink: 0,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: '700',
        cursor: off ? 'default' : 'pointer', opacity: off ? 0.3 : 1,
      });

      return (
        <GlassCard style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <button onClick={() => stepRound(-1)} disabled={roundIdx <= 0} title="Previous" style={arrowStyle(roundIdx <= 0)}>‹</button>
              <select value={selRound} onChange={(e) => setSelRound(e.target.value)} style={{
                flex: 1, minWidth: 0, padding: '8px 10px',
                background: CARLTON_NAVY, color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                {rounds.map(r => <option key={r} value={r}>{roundLabel(r)}</option>)}
              </select>
              <button onClick={() => stepRound(1)} disabled={roundIdx >= rounds.length - 1} title="Next" style={arrowStyle(roundIdx >= rounds.length - 1)}>›</button>
            </div>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {Object.keys(STAT_CATEGORIES).map(cat => (
                <button key={cat} onClick={() => { setSelCat(cat); setSelStat(STAT_CATEGORIES[cat][0].key); }} style={{
                  flex: 1, padding: '5px 0',
                  background: selCat === cat ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color: selCat === cat ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: '1px solid ' + (selCat === cat ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'),
                  borderRadius: '6px', fontSize: '9px', fontWeight: '600', cursor: 'pointer',
                }}>{cat}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              {STAT_CATEGORIES[selCat].map(s => (
                <button key={s.key} onClick={() => setSelStat(s.key)} style={{
                  padding: '4px 8px',
                  background: selStat === s.key ? s.color + '33' : 'rgba(255,255,255,0.03)',
                  color: selStat === s.key ? s.color : 'rgba(255,255,255,0.35)',
                  border: '1px solid ' + (selStat === s.key ? s.color + '66' : 'rgba(255,255,255,0.06)'),
                  borderRadius: '6px', fontSize: '9px', fontWeight: '600', cursor: 'pointer',
                }}>{s.label}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: '6px 14px 2px', color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {statDef.label} {selRound === 'ALL' ? '(season avg)' : `— ${S_STATS[selRound]?.opponent || ''}`}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '4px 14px 8px' }}>
            {playerData.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
                <div title={p.name} style={{ width: '100px', color: i < 3 ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: i < 3 ? '700' : '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {shortName(p.name)}
                </div>
                <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                  {hasNegative ? (
                    <>
                      <div style={{
                        position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px',
                        background: 'rgba(255,255,255,0.15)',
                      }} />
                      <div style={{
                        position: 'absolute', top: 0, bottom: 0, borderRadius: '3px',
                        background: p.value >= 0 ? statDef.color : '#ef4444',
                        opacity: 0.7,
                        ...(p.value >= 0
                          ? { left: '50%', width: `${(p.value / maxVal) * 50}%` }
                          : { right: '50%', width: `${(Math.abs(p.value) / maxVal) * 50}%` }),
                      }} />
                    </>
                  ) : (
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${(p.value / maxVal) * 100}%`,
                      background: `linear-gradient(90deg, ${statDef.color}88, ${statDef.color})`,
                      transition: 'width 0.3s ease',
                    }} />
                  )}
                </div>
                <div style={{ width: '36px', textAlign: 'right', color: p.value > 0 ? statDef.color : p.value < 0 ? '#ef4444' : 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '700' }}>
                  {p.value}
                </div>
                {selRound === 'ALL' && (
                  <div title={`${p.rounds} games`} style={{ width: '22px', textAlign: 'right', color: 'rgba(255,255,255,0.28)', fontSize: '9px', fontWeight: '600' }}>
                    {p.rounds}g
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      );
    };

    // Head-to-head player comparison
    const H2H_STATS = [
      ['rating', 'Rating', 1],
      ['d', 'Disposals', 1],
      ['k', 'Kicks', 1],
      ['hb', 'Handballs', 1],
      ['m', 'Marks', 1],
      ['tk', 'Tackles', 1],
      ['g', 'Goals', 1],
      ['i50', 'Inside 50s', 1],
      ['cp', 'Contested', 1],
      ['mg', 'Metres gained', 0],
      ['tog', 'TOG %', 0],
    ];

    const ComparePanel = ({ ratings }) => {
      const [aId, setAId] = useState(1);
      const [bId, setBId] = useState(2);
      const A = S_PLAYERS.find(pl => pl.id === aId);
      const B = S_PLAYERS.find(pl => pl.id === bId);
      const roster = [...S_PLAYERS].sort((x, y) => x.number - y.number);
      const playable = S_FIXTURE.filter(g => g.opponent !== 'BYE').map(g => g.round);

      const seriesFor = (id) => playable.map(r => {
        const e = ratings[r]?.[id];
        return e && e.rating !== null && e.rating !== undefined ? e.rating : null;
      });

      const avgFor = (pl) => {
        const acc = {};
        let games = 0;
        Object.values(S_STATS).forEach(rd => {
          // Exact name only: a surname fallback credited e.g. Flynn Young with Lewis Young's games
          const rec = rd.players.find(x => x.name === pl.name);
          if (!rec) return;
          games++;
          H2H_STATS.forEach(([k]) => { acc[k] = (acc[k] || 0) + (rec[k] || 0); });
        });
        if (!games) return null;
        const out = {};
        H2H_STATS.forEach(([k]) => { out[k] = acc[k] / games; });
        out.games = games;
        return out;
      };

      const aAvg = avgFor(A);
      const bAvg = avgFor(B);
      const aSeries = seriesFor(aId);
      const bSeries = seriesFor(bId);
      const allVals = [...aSeries, ...bSeries].filter(v => v !== null);
      const maxY = Math.max(5, ...allVals.map(v => Math.abs(v)));
      const minY = Math.min(0, ...allVals);

      const CW = 380, CH = 190, L = 30, R = 10, T = 10, Bm = 26;
      const xFor = (i) => L + (i / Math.max(1, playable.length - 1)) * (CW - L - R);
      const yFor = (v) => T + (1 - (v - minY) / (maxY - minY)) * (CH - T - Bm);
      const ptsOf = (series) => series
        .map((v, i) => v === null ? null : `${xFor(i)},${yFor(v)}`)
        .filter(Boolean).join(' ');
      const labelEvery = Math.max(1, Math.ceil(playable.length / 8));

      const selStyle = {
        flex: 1, padding: '10px 8px',
        background: CARLTON_NAVY, color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', minWidth: 0,
      };

      const PlayerHead = ({ pl, color, avg }) => (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <PlayerPhoto player={pl} size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: color, fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              #{numLabel(pl)} {pl.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
              {avg ? `${avg.games} games` : 'no stats'} • {pl.height}cm • {calculateAge(pl.dob)}y
            </div>
          </div>
        </div>
      );

      return (
        <GlassCard style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <select value={aId} onChange={(e) => setAId(parseInt(e.target.value))} style={selStyle}>
                {roster.map(pl => <option key={pl.id} value={pl.id}>#{numLabel(pl)} {pl.name}</option>)}
              </select>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: '800', alignSelf: 'center' }}>VS</span>
              <select value={bId} onChange={(e) => setBId(parseInt(e.target.value))} style={selStyle}>
                {roster.map(pl => <option key={pl.id} value={pl.id}>#{numLabel(pl)} {pl.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <PlayerHead pl={A} color="#60a5fa" avg={aAvg} />
              <PlayerHead pl={B} color="#f87171" avg={bAvg} />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Wheelo rating by round
            </div>
            <svg viewBox={`0 0 ${CW} ${CH}`} style={{ width: '100%' }}>
              {minY < 0 && (
                <line x1={L} y1={yFor(0)} x2={CW - R} y2={yFor(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              )}
              {[0.5, 1].map(f => (
                <g key={f}>
                  <line x1={L} y1={yFor(maxY * f)} x2={CW - R} y2={yFor(maxY * f)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <text x={L - 4} y={yFor(maxY * f) + 3} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="Inter">{Math.round(maxY * f)}</text>
                </g>
              ))}
              {playable.map((r, i) => (
                i % labelEvery === 0 ? (
                  <text key={r} x={xFor(i)} y={CH - Bm + 13} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter">{r}</text>
                ) : null
              ))}
              <polyline points={ptsOf(aSeries)} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
              <polyline points={ptsOf(bSeries)} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
              {aSeries.map((v, i) => v === null ? null : <circle key={'a' + i} cx={xFor(i)} cy={yFor(v)} r="2.4" fill="#60a5fa"/>)}
              {bSeries.map((v, i) => v === null ? null : <circle key={'b' + i} cx={xFor(i)} cy={yFor(v)} r="2.4" fill="#f87171"/>)}
            </svg>

            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '10px 0 4px' }}>
              Season averages
            </div>
            {H2H_STATS.map(([key, label, dec]) => {
              const av = aAvg ? aAvg[key] : null;
              const bv = bAvg ? bAvg[key] : null;
              const fmt = (v) => v === null || v === undefined ? '—' : v.toFixed(dec);
              const aBest = av !== null && bv !== null && av > bv;
              const bBest = av !== null && bv !== null && bv > av;
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', padding: '7px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    width: '64px', textAlign: 'left', fontSize: '13px', fontWeight: '800',
                    color: aBest ? '#60a5fa' : 'rgba(255,255,255,0.55)',
                  }}>{fmt(av)}</div>
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{
                    width: '64px', textAlign: 'right', fontSize: '13px', fontWeight: '800',
                    color: bBest ? '#f87171' : 'rgba(255,255,255,0.55)',
                  }}>{fmt(bv)}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      );
    };

    // 2027 list changes: who's gone, who's in, what's still to come
    const ListPanel = () => {
      const L = S_LIST;
      const prev = SEASONS[2026].players;
      const outs = L.out.map(o => ({ ...o, player: prev.find(pl => pl.name === o.name) }));
      const groups = [
        ['Delisted / not offered', outs.filter(o => o.how !== 'Traded' && o.how !== 'Departed')],
        ['Traded / departed', outs.filter(o => o.how === 'Traded' || o.how === 'Departed')],
      ];
      const sectionHead = (label, color, count) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 6px' }}>
          <span style={{ width: '3px', height: '13px', background: color, borderRadius: '2px', display: 'inline-block' }}></span>
          <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px' }}>{label}</span>
          {count !== undefined && <span style={{ color, fontSize: '11px', fontWeight: '800' }}>{count}</span>}
        </div>
      );
      const row = (key, pl, title, sub, accent, tag) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {pl ? <PlayerPhoto player={pl} size={34} /> : <div style={{ width: 34 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{title}</div>
            {sub && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10.5px', marginTop: '2px' }}>{sub}</div>}
          </div>
          {tag && <span style={{ color: accent, fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}>{tag}</span>}
        </div>
      );
      return (
        <GlassCard style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800', letterSpacing: '2px' }}>2027 LIST CHANGES</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: '600' }}>as at {L.asAt}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', padding: '12px 16px 0' }}>
            {[['ON LIST', S_PLAYERS.length, '#fff'], ['IN', L.in.length, '#4ade80'], ['OUT', L.out.length, '#f87171']].map(([lab, v, c]) => (
              <div key={lab} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '8px 0' }}>
                <div style={{ color: c, fontSize: '22px', fontWeight: '600', fontFamily: "'Oswald', 'Inter', sans-serif" }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: '700', letterSpacing: '1px' }}>{lab}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 12px' }}>
            {sectionHead('ARRIVALS', '#4ade80', L.in.length)}
            {L.in.map(r => row('in' + r.id, r, r.name, `${r.how} from ${r.from}${r.note ? ' • ' + r.note : ''}`, '#4ade80', 'NEW'))}
            {groups.map(([label, items]) => (
              <React.Fragment key={label}>
                {sectionHead(label.toUpperCase(), '#f87171', items.length)}
                {items.map(o => row('out' + o.name, o.player, o.name, `${o.how}${o.note ? ' • ' + o.note : ''}`, 'rgba(255,255,255,0.4)', o.date))}
              </React.Fragment>
            ))}
            {L.pending && L.pending.length > 0 && sectionHead('STILL TO COME', '#fbbf24')}
            {(L.pending || []).map((pd, i) => row('pd' + i, null, pd.what, pd.note, '#fbbf24', 'PENDING'))}
          </div>
        </GlassCard>
      );
    };

    // Shown for match-based tabs before a season has a fixture
    const EmptySeasonCard = ({ what }) => (
      <GlassCard style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' }}>{S_YEAR} {what}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.5 }}>
            The {S_YEAR} fixture hasn't been released yet. This fills in once the fixture is added to data.js.
          </div>
        </div>
      </GlassCard>
    );

    // Left Panel
    const LeftPanel = ({ votes, setVotes, selectedRound, setSelectedRound, bfView, setBfView, ratings, setRatings, results, onSyncResults, syncState }) => {
      const [activeTab, setActiveTab] = useState(S_LIST ? 'list' : 'bf');
      const noFixture = S_FIXTURE.length === 0;

      return (
        <div style={{
          width: '420px',
          flexShrink: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[...(S_LIST ? [{ key: 'list', label: 'List' }] : []), { key: 'bf', label: 'B&F' }, { key: 'stats', label: 'Stats' }, { key: 'h2h', label: 'H2H' }, { key: 'fixture', label: 'Fixture' }, { key: 'history', label: 'History' }].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === tab.key ? CARLTON_NAVY : 'rgba(255,255,255,0.5)',
                  boxShadow: activeTab === tab.key ? '0 2px 10px rgba(0,0,0,0.35)' : 'none',
                  border: activeTab === tab.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >{tab.label}</button>
            ))}
          </div>

          {activeTab === 'list' && S_LIST ? (
            <ListPanel />
          ) : noFixture && activeTab === 'bf' ? (
            <EmptySeasonCard what="BEST & FAIREST" />
          ) : noFixture && activeTab === 'stats' ? (
            <EmptySeasonCard what="MATCH STATS" />
          ) : noFixture && activeTab === 'fixture' ? (
            <EmptySeasonCard what="FIXTURE" />
          ) : activeTab === 'bf' ? (
            <BFPanel
              votes={votes} setVotes={setVotes}
              selectedRound={selectedRound} setSelectedRound={setSelectedRound}
              view={bfView} setView={setBfView}
              ratings={ratings} setRatings={setRatings}
            />
          ) : activeTab === 'stats' ? (
            <StatsPanel />
          ) : activeTab === 'h2h' ? (
            <ComparePanel ratings={ratings} />
          ) : activeTab === 'history' ? (
            <HistoryPanel />
          ) : (
            <FixturePanel results={results} onSync={onSyncResults} syncState={syncState} />
          )}
        </div>
      );
    };

    // Premium Magnet Component
    const Magnet = ({ player, style, onMouseDown, onClick, onDoubleClick, onDragStart, onPointerDown, isDragging }) => {
      const age = calculateAge(player.dob);

      return (
        <div
          draggable
          onDragStart={onDragStart}
          onMouseDown={onMouseDown}
          onPointerDown={onPointerDown}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          style={{
            position: 'absolute',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
            transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
            transform: isDragging ? 'scale(1.08)' : 'scale(1)',
            zIndex: isDragging ? 1000 : 10,
            ...style,
          }}
        >
          <div className="magnet-enter" style={{
            background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 50%, ${CARLTON_NAVY_DARK} 100%)`,
            border: player.captain ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '14px',
            padding: '8px 12px',
            minWidth: '150px',
            boxShadow: isDragging
              ? `0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
              : `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
            position: 'relative',
          }}>
            {/* Subtle gradient overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
              borderRadius: '14px',
              pointerEvents: 'none',
            }}/>


            {player.captain && (
              <div style={{
                position: 'absolute', top: -8, right: -8,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#000',
                fontSize: '11px', fontWeight: '900',
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(251,191,36,0.4)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>C</div>
            )}

            {player.recruit && (
              <div style={{
                position: 'absolute', top: -6, left: 12,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                fontSize: '8px', fontWeight: '700',
                padding: '2px 6px', borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(34,197,94,0.4)',
                letterSpacing: '0.5px',
              }}>NEW</div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', position: 'relative' }}>
              <PlayerPhoto player={player} size={42} />
              <span style={{
                color: '#fff', fontWeight: '600', fontSize: '25px',
                fontFamily: "'Oswald', 'Inter', sans-serif",
                lineHeight: 1, letterSpacing: '0.5px',
                textShadow: '0 2px 5px rgba(0,0,0,0.55)',
                minWidth: '28px', textAlign: 'center', flexShrink: 0,
              }}>{numLabel(player)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    color: '#fff', fontWeight: '700', fontSize: '13px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    letterSpacing: '0.3px',
                  }}>{player.name}</span>
                </div>
                <div style={{
                  display: 'flex', gap: '6px', marginTop: '3px',
                  color: 'rgba(255,255,255,0.55)', fontSize: '10px',
                  fontWeight: '500',
                }}>
                  <span>{player.height}cm</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{age}y</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // AFL field — bird's-eye oval at true proportions (165m x 138m, 1m ≈ 3px)
    const Field = () => (
      <svg viewBox="0 0 480 560" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="fieldGlow" cx="50%" cy="44%" r="74%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.09)"/>
            <stop offset="55%" stopColor="rgba(255,255,255,0.02)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)"/>
          </radialGradient>
          <radialGradient id="towerGlow">
            <stop offset="0%" stopColor="rgba(255,255,235,0.28)"/>
            <stop offset="45%" stopColor="rgba(255,255,235,0.08)"/>
            <stop offset="100%" stopColor="rgba(255,255,235,0)"/>
          </radialGradient>
          <clipPath id="fieldClip">
            <ellipse cx="240" cy="280" rx="206" ry="246"/>
          </clipPath>
        </defs>

        {/* Crowd ring — dark stands around the oval */}
        <ellipse cx="240" cy="280" rx="231" ry="271" fill="none" stroke="rgba(4,8,16,0.85)" strokeWidth="15"/>
        <ellipse cx="240" cy="280" rx="224" ry="264" fill="none" stroke="rgba(148,163,184,0.10)" strokeWidth="3"/>

        {/* Light-tower glow */}
        <circle cx="36" cy="64" r="46" fill="url(#towerGlow)"/>
        <circle cx="444" cy="64" r="46" fill="url(#towerGlow)"/>
        <circle cx="36" cy="496" r="46" fill="url(#towerGlow)"/>
        <circle cx="444" cy="496" r="46" fill="url(#towerGlow)"/>
        {[[36, 64], [444, 64], [36, 496], [444, 496]].map(([tx, ty], ti) => (
          <g key={ti}>
            <circle cx={tx - 5} cy={ty} r="1.6" fill="rgba(255,255,240,0.9)"/>
            <circle cx={tx} cy={ty - 4} r="1.6" fill="rgba(255,255,240,0.9)"/>
            <circle cx={tx + 5} cy={ty} r="1.6" fill="rgba(255,255,240,0.9)"/>
          </g>
        ))}

        {/* Turf: concentric mowing rings, outside-in */}
        <ellipse cx="240" cy="280" rx="222" ry="262" fill="#0f4a26"/>
        {[1, 0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125].map((f, bi) => (
          <ellipse key={bi} cx="240" cy="280" rx={218 * f} ry={258 * f}
            fill={bi % 2 === 0 ? '#1a7a3c' : '#1f8945'}/>
        ))}
        <ellipse cx="240" cy="280" rx="218" ry="258" fill="url(#fieldGlow)"/>

        {/* Boundary line */}
        <ellipse cx="240" cy="280" rx="208" ry="248" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="2"/>

        {/* 50m arcs — true 50m radius from each goal line, clipped to the field */}
        <g clipPath="url(#fieldClip)">
          <circle cx="240" cy="32" r="150" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2"/>
          <circle cx="240" cy="528" r="150" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2"/>
        </g>

        {/* Painted 50s on the arcs */}
        {[[134, 148], [346, 148], [134, 432], [346, 432]].map(([lx, ly], li) => (
          <text key={li} x={lx} y={ly} textAnchor="middle"
            fill="rgba(255,255,255,0.75)" fontSize="15" fontWeight="600"
            fontFamily="Oswald, Inter, sans-serif" letterSpacing="1">50</text>
        ))}

        {/* Centre square — 50m x 50m */}
        <rect x="165" y="205" width="150" height="150" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2"/>

        {/* Centre circles (3m + 10m) with wrestle line */}
        <circle cx="240" cy="280" r="15" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"/>
        <circle cx="240" cy="280" r="4.5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
        <line x1="225" y1="280" x2="255" y2="280" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>

        {/* Goal square + posts — top (6.4m wide, 9m deep) */}
        <rect x="230" y="32" width="20" height="27" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="1.6"/>
        <line x1="230" y1="32" x2="230" y2="16" stroke="#f5f5f5" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="250" y1="32" x2="250" y2="16" stroke="#f5f5f5" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="211" y1="34" x2="211" y2="24" stroke="rgba(245,245,245,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="269" y1="34" x2="269" y2="24" stroke="rgba(245,245,245,0.7)" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Goal square + posts — bottom */}
        <rect x="230" y="501" width="20" height="27" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="1.6"/>
        <line x1="230" y1="528" x2="230" y2="544" stroke="#f5f5f5" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="250" y1="528" x2="250" y2="544" stroke="#f5f5f5" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="211" y1="526" x2="211" y2="536" stroke="rgba(245,245,245,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="269" y1="526" x2="269" y2="536" stroke="rgba(245,245,245,0.7)" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Interchange gates on the members' wing */}
        <line x1="33" y1="252" x2="23" y2="252" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
        <line x1="33" y1="308" x2="23" y2="308" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
      </svg>
    );

    // Position Labels
    const PositionLabels = () => (
      <div style={{
        position: 'absolute',
        left: '-55px',
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6% 0',
      }}>
        {['FB', 'HB', 'C', 'HF', 'FF'].map(label => (
          <div key={label} style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            fontWeight: '800',
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>{label}</div>
        ))}
      </div>
    );

    // Premium Sidebar
    const Sidebar = ({ players, selected, onDragStart, onRemovePlayer, onPointerStart, onOpenCard, filter, setFilter, query, setQuery, fieldCount, interchangeCount }) => {
      const totalSelected = fieldCount + interchangeCount;
      const isComplete = fieldCount === 18 && interchangeCount === 5;
      const searchRef = useRef(null);

      // '/' jumps to the search box, like most sites
      useEffect(() => {
        const key = (e) => {
          if (e.key === '/' && !isTyping(e.target) && searchRef.current) { e.preventDefault(); searchRef.current.focus(); }
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
      }, []);

      const { comp, warnings } = teamBalance(selected, fieldCount);

      const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('player');
        if (!data) return;
        const player = JSON.parse(data);
        onRemovePlayer(player);
      };

      return (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            width: '300px', height: '100%',
            background: `linear-gradient(180deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 50%, ${CARLTON_NAVY_DARK} 100%)`,
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column',
          }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Carlton Logo & Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{
                width: '52px', height: '52px',
                background: 'linear-gradient(145deg, #fff 0%, #e8e8e8 100%)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
              }}>
                <ClubLogo team="Carlton" size={40} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '20px', letterSpacing: '2px' }}>CARLTON</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '500', letterSpacing: '1px' }}>{S_YEAR} TEAM SELECTION</div>
              </div>
            </div>

            {/* Stats Card */}
            <GlassCard style={{ padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                {[
                  { label: 'ON FIELD', value: fieldCount, target: 18, color: fieldCount === 18 ? '#22c55e' : '#3b82f6' },
                  { label: 'BENCH', value: interchangeCount, target: 5, color: interchangeCount === 5 ? '#22c55e' : '#f59e0b' },
                  { label: 'TOTAL', value: totalSelected, target: 23, color: isComplete ? '#22c55e' : 'rgba(255,255,255,0.7)' },
                ].map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    {i > 0 && <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}/>}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ color: stat.color, fontWeight: '800', fontSize: '24px' }}>{stat.value}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: '700', letterSpacing: '1px' }}>{stat.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {isComplete && (
                <div style={{
                  background: 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.25) 50%, rgba(34,197,94,0.15) 100%)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                  color: '#22c55e',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}>✓ TEAM COMPLETE (18 + 5)</div>
              )}
              {comp && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: isComplete ? '10px' : 0, paddingTop: '10px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {[
                    ['AVG AGE', comp.age.toFixed(1), 'Average age of the selected players'],
                    ['AVG HT', `${Math.round(comp.height)}`, 'Average height (cm)'],
                    ['TALLS', comp.talls, 'Non-midfielders 193cm or taller, rucks included'],
                    ['RUCKS', comp.rucks, 'Players listed as rucks'],
                  ].map(([label, v, tip]) => (
                    <div key={label} title={tip} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '700' }}>{v}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', fontWeight: '700', letterSpacing: '0.8px', marginTop: '1px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
              {warnings.map(w => (
                <div key={w} style={{
                  marginTop: '8px', padding: '6px 9px',
                  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: '7px', color: '#fbbf24', fontSize: '10.5px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }}></span>
                  {w}
                </div>
              ))}
            </GlassCard>

            {/* Position Filters */}
            <div style={{ display: 'flex', gap: '5px' }}>
              {['ALL', 'DEF', 'MID', 'RCK', 'FWD'].map(pos => {
                const key = pos === 'RCK' ? 'RUCK' : pos;
                return (
                  <button
                    key={pos}
                    onClick={() => setFilter(key)}
                    style={{
                      flex: 1, padding: '10px 4px',
                      background: filter === key
                        ? 'linear-gradient(135deg, #fff 0%, #e8e8e8 100%)'
                        : 'rgba(255,255,255,0.05)',
                      color: filter === key ? CARLTON_NAVY : 'rgba(255,255,255,0.4)',
                      border: filter === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '10px', fontWeight: '700', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: filter === key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >{pos}</button>
                );
              })}
            </div>

            {/* Quick find */}
            <div style={{ position: 'relative', marginTop: '10px' }}>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.6)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                placeholder="Find a player or number"
                spellCheck={false}
                style={{
                  width: '100%', padding: '9px 34px 9px 12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '500',
                  fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.15s ease',
                }}
              />
              <div style={{ position: 'absolute', right: '6px', top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
                {query ? (
                  <button onClick={() => setQuery('')} title="Clear search (Esc)" style={{
                    width: '22px', height: '22px', borderRadius: '6px', border: 'none',
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                    fontSize: '11px', cursor: 'pointer',
                  }}>✕</button>
                ) : (
                  <span title="Press / to search" style={{
                    padding: '1px 7px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '700',
                  }}>/</span>
                )}
              </div>
            </div>
          </div>

          {/* Player List */}
          <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
            {players.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', padding: '40px 20px' }}>
                {query.trim() ? `No available player matches “${query.trim()}”` : filter === 'ALL' ? 'All players on field!' : `No ${filter} available`}
              </div>
            ) : (
              players.map(player => {
                return (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, player)}
                    onPointerDown={(e) => onPointerStart && onPointerStart(e, player, 'sidebar')}
                    onClick={(e) => onOpenCard && onOpenCard(e, player)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '8px',
                      cursor: 'grab',
                      touchAction: 'pan-y',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.15s ease',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <PlayerPhoto player={player} size={44} />
                    <span style={{
                      color: '#fff', fontWeight: '600', fontSize: '23px',
                      fontFamily: "'Oswald', 'Inter', sans-serif",
                      lineHeight: 1, letterSpacing: '0.5px',
                      textShadow: '0 2px 5px rgba(0,0,0,0.55)',
                      minWidth: '26px', textAlign: 'center', flexShrink: 0,
                    }}>{numLabel(player)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#fff', fontSize: '14px', fontWeight: '700',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {player.name}
                        </span>
                        {player.captain && <span style={{ color: '#fbbf24', fontSize: '12px' }}>©</span>}
                        {player.recruit && (
                          <span style={{
                            background: 'rgba(34,197,94,0.2)',
                            color: '#22c55e',
                            fontSize: '8px',
                            fontWeight: '700',
                            padding: '2px 5px',
                            borderRadius: '4px',
                          }}>NEW</span>
                        )}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                        {player.height}cm • {calculateAge(player.dob)}yo
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    };

    const POS_NAMES = { DEF: 'Defender', MID: 'Midfielder', RUCK: 'Ruck', FWD: 'Forward' };

    // This season's numbers for the player card, or last season's before the first bounce
    const seasonSummary = (player, votes) => {
      let year = S_YEAR, stats = S_STATS;
      if (!Object.keys(stats).length && SEASONS[S_YEAR - 1]) { year = S_YEAR - 1; stats = SEASONS[year].stats; }
      const games = Object.entries(stats)
        .map(([r, rd]) => ({ r, opp: rd.opponent, rec: rd.players.find(x => x.name === player.name) }))
        .filter(g => g.rec);
      let bf = votes;
      if (year !== S_YEAR) {
        try { bf = JSON.parse(localStorage.getItem(`carlton-bf-${year}`)) || {}; } catch { bf = {}; }
      }
      const pv = Object.values(bf[player.id] || {}).filter(v => v !== undefined && v !== null);
      const avgOf = (k) => games.reduce((s, g) => s + (g.rec[k] || 0), 0) / games.length;
      return {
        year, games,
        rating: games.length ? avgOf('rating') : null,
        disp: games.length ? avgOf('d') : null,
        goals: games.reduce((s, g) => s + (g.rec.g || 0), 0),
        votes: pv.length ? pv.reduce((s, v) => s + v, 0) : null,
      };
    };

    // Who they are and how their season's going: shared by the desktop card and the mobile sheet
    const PlayerSummary = ({ player, votes }) => {
      const s = seasonSummary(player, votes);
      const vals = s.games.map(g => g.rec.rating);
      const SW = 276, SH = 46;
      const hi = Math.max(1, ...vals), lo = Math.min(0, ...vals);
      const sx = (i) => vals.length === 1 ? SW / 2 : 4 + i * (SW - 8) / (vals.length - 1);
      const sy = (v) => 5 + (1 - (v - lo) / (hi - lo)) * (SH - 10);

      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '24px' }}>
            <PlayerPhoto player={player} size={52} />
            <span style={{
              color: '#fff', fontWeight: '600', fontSize: '32px',
              fontFamily: "'Oswald', 'Inter', sans-serif", lineHeight: 1,
              textShadow: '0 2px 5px rgba(0,0,0,0.55)', minWidth: '30px', textAlign: 'center',
            }}>{numLabel(player)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: '800', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {player.name}
                {player.captain && <span style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#000', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '5px' }}>CAPTAIN</span>}
                {player.recruit && <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '5px' }}>NEW</span>}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '3px' }}>
                {POS_NAMES[player.position] || player.position} • {player.height}cm • {calculateAge(player.dob)}y
              </div>
            </div>
          </div>

          <div style={{ margin: '14px 0 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px' }}>{s.year} SEASON</span>
            {s.year !== S_YEAR && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9.5px' }}>no {S_YEAR} games yet</span>}
          </div>

          {s.games.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11.5px', padding: '6px 0 4px' }}>
              {player.recruit ? `No Carlton games yet: recruited ${S_YEAR > s.year ? 'for ' + S_YEAR : 'this season'}.` : `No senior games in ${s.year}.`}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[['GAMES', s.games.length], ['RATING', s.rating.toFixed(1)], ['DISP', s.disp.toFixed(1)], ['GOALS', s.goals]].map(([l, v]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '7px 0' }}>
                    <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600', fontFamily: "'Oswald', 'Inter', sans-serif" }}>{v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '8px', fontWeight: '700', letterSpacing: '0.8px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: '600', margin: '10px 0 2px' }}>Wheelo rating by game</div>
              <svg viewBox={`0 0 ${SW} ${SH}`} style={{ width: '100%', display: 'block' }}>
                {lo < 0 && <line x1="0" x2={SW} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>}
                {vals.length > 1 && (
                  <polyline points={vals.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')}
                    fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
                )}
                {s.games.map((g, i) => (
                  <circle key={g.r} cx={sx(i)} cy={sy(g.rec.rating)} r="2.4" fill="#60a5fa">
                    <title>{`${g.r} v ${g.opp}: ${g.rec.rating.toFixed(1)}`}</title>
                  </circle>
                ))}
              </svg>
              {s.votes !== null && (
                <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                  Your B&F votes: <span style={{ color: '#fbbf24', fontWeight: '800' }}>{s.votes}</span>
                </div>
              )}
            </>
          )}
        </>
      );
    };

    // Click a magnet, bench card or list row: the summary plus quick moves
    const PlayerCard = ({ player, rect, votes, status, benchFull, onClose, onBench, onRemove }) => {
      const ref = useRef(null);
      const [pos, setPos] = useState({ left: -9999, top: 0 });

      useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const w = el.offsetWidth, h = el.offsetHeight, gap = 12, pad = 8;
        let left = rect.right + gap;
        if (left + w > window.innerWidth - pad) left = rect.left - w - gap;
        left = Math.max(pad, Math.min(window.innerWidth - w - pad, left));
        const top = Math.max(pad, Math.min(window.innerHeight - h - pad, rect.top));
        setPos({ left, top });
      }, [rect, player.id]);

      useEffect(() => {
        const down = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        const key = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', down, true);
        document.addEventListener('keydown', key);
        return () => {
          document.removeEventListener('mousedown', down, true);
          document.removeEventListener('keydown', key);
        };
      }, [onClose]);

      const actionBtn = (label, onClick, tone, disabled) => (
        <button key={label} onClick={onClick} disabled={disabled} style={{
          flex: 1, padding: '8px 6px', borderRadius: '8px',
          background: tone === 'red' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${tone === 'red' ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.12)'}`,
          color: tone === 'red' ? '#f87171' : '#fff',
          fontSize: '11px', fontWeight: '700', cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.35 : 1,
        }}>{label}</button>
      );

      return (
        <div ref={ref} style={{
          position: 'fixed', left: pos.left, top: pos.top, width: '304px', zIndex: 3000,
          background: `linear-gradient(160deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 55%, ${CARLTON_NAVY_DARK} 100%)`,
          border: '1px solid rgba(255,255,255,0.14)', borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          padding: '14px', animation: 'float-in 0.16s ease',
        }}>
          <button onClick={onClose} title="Close (Esc)" style={{
            position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px',
            borderRadius: '7px', border: 'none', background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)', fontSize: '11px', cursor: 'pointer',
          }}>✕</button>

          <PlayerSummary player={player} votes={votes} />

          <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
            {status === 'field' && actionBtn('Move to bench', onBench, null, benchFull)}
            {status === 'none' && actionBtn(benchFull ? 'Bench is full' : 'Add to bench', onBench, null, benchFull)}
            {status !== 'none' && actionBtn('Remove from board', onRemove, 'red')}
          </div>
        </div>
      );
    };

    // ---- Shared by the desktop board and the mobile app ----

    const SEED_VERSION = '2';
    const loadJSON = (key) => {
      try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
    };
    // Wheelo ratings: bundled seed rounds are written once per SEED_VERSION;
    // after that, user-imported data is never clobbered on load.
    const loadRatings = () => {
      try {
        const saved = localStorage.getItem(`carlton-wheelo-${S_YEAR}`);
        if (!saved) return S_SEEDS();
        const parsed = JSON.parse(saved);
        const seeds = S_SEEDS();
        let storedVer = null;
        try { storedVer = localStorage.getItem(S_SEED_KEY); } catch {}
        if (storedVer !== SEED_VERSION) {
          Object.keys(seeds).forEach(r => { parsed[r] = seeds[r]; });
          try { localStorage.setItem(S_SEED_KEY, SEED_VERSION); } catch {}
        } else {
          Object.keys(seeds).forEach(r => { if (!parsed[r]) parsed[r] = seeds[r]; });
        }
        return parsed;
      } catch { return S_SEEDS(); }
    };

    // Undo toast (clear, remove). ⌘Z/Ctrl+Z undoes while it's showing.
    const useUndoToast = () => {
      const [toast, setToast] = useState(null);
      const timer = useRef(null);
      const showToast = (msg, undo) => {
        clearTimeout(timer.current);
        setToast({ msg, undo, id: Date.now() });
        timer.current = setTimeout(() => setToast(null), 8000);
      };
      const runUndo = () => {
        if (toast && toast.undo) toast.undo();
        clearTimeout(timer.current);
        setToast(null);
      };
      useEffect(() => {
        if (!toast || !toast.undo) return;
        const key = (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !isTyping(e.target)) { e.preventDefault(); runUndo(); }
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
      }, [toast]);
      return { toast, showToast, runUndo };
    };

    const ToastPill = ({ toast, onUndo }) => (
      <div key={toast.id} style={{
        pointerEvents: 'auto', animation: 'float-in 0.18s ease',
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '9px 10px 9px 16px',
        background: 'rgba(13,28,54,0.97)', border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
        color: '#fff', fontSize: '12.5px', fontWeight: '600',
      }}>
        {toast.msg}
        {toast.undo && (
          <button onClick={onUndo} title="Undo (⌘Z)" style={{
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)',
            color: '#60a5fa', fontSize: '12px', fontWeight: '800',
          }}>Undo</button>
        )}
      </div>
    );

    // Team balance: talls = non-midfielders 193cm+ (rucks included)
    const teamBalance = (selected, fieldCount) => {
      const avg = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
      const comp = selected.length ? {
        age: avg(selected.map(p => calculateAge(p.dob))),
        height: avg(selected.map(p => p.height)),
        talls: selected.filter(p => p.height >= 193 && p.position !== 'MID').length,
        rucks: selected.filter(p => p.position === 'RUCK').length,
      } : null;
      const warnings = [];
      if (fieldCount > 18) warnings.push(`${fieldCount} on the field (max 18)`);
      if (comp && selected.length >= 18 && comp.rucks === 0) warnings.push('No ruck selected');
      if (comp && comp.rucks >= 3) warnings.push(`${comp.rucks} rucks selected`);
      if (comp && comp.talls >= 9) warnings.push(`${comp.talls} talls: top-heavy`);
      return { comp, warnings };
    };

    // Named team-sheet slots. x/y are board percentages (FB end at the top), so a team picked
    // on the phone lands sensibly on the magnet board and vice versa. Followers sit just above
    // the centre line on the board but are listed last, the way team sheets read.
    const TEAM_LINES = [
      { key: 'B', label: 'BACKS', short: 'B', slots: [{ key: 'LBP', pos: 'BP', x: 15, y: 10 }, { key: 'FB', pos: 'FB', x: 50, y: 8 }, { key: 'RBP', pos: 'BP', x: 85, y: 10 }] },
      { key: 'HB', label: 'HALF BACKS', short: 'HB', slots: [{ key: 'LHB', pos: 'HBF', x: 13, y: 26 }, { key: 'CHB', pos: 'CHB', x: 50, y: 24 }, { key: 'RHB', pos: 'HBF', x: 87, y: 26 }] },
      { key: 'C', label: 'CENTRES', short: 'C', slots: [{ key: 'LW', pos: 'W', x: 11, y: 56 }, { key: 'C', pos: 'C', x: 50, y: 57 }, { key: 'RW', pos: 'W', x: 89, y: 56 }] },
      { key: 'HF', label: 'HALF FORWARDS', short: 'HF', slots: [{ key: 'LHF', pos: 'HFF', x: 13, y: 74 }, { key: 'CHF', pos: 'CHF', x: 50, y: 76 }, { key: 'RHF', pos: 'HFF', x: 87, y: 74 }] },
      { key: 'F', label: 'FORWARDS', short: 'F', slots: [{ key: 'LFP', pos: 'FP', x: 15, y: 90 }, { key: 'FF', pos: 'FF', x: 50, y: 92 }, { key: 'RFP', pos: 'FP', x: 85, y: 90 }] },
      { key: 'FOL', label: 'FOLLOWERS', short: 'FOL', slots: [{ key: 'R', pos: 'R', x: 50, y: 39 }, { key: 'RR', pos: 'RR', x: 19, y: 41 }, { key: 'ROV', pos: 'ROV', x: 81, y: 41 }] },
    ];
    const TEAM_SLOTS = TEAM_LINES.flatMap(l => l.slots);
    const BENCH_SIZE = 5;
    const playerById = (id) => S_PLAYERS.find(p => p.id === id);
    const surname = (p) => p.name.split(' ').slice(1).join(' ') || p.name;

    // Board -> named slots: each field magnet takes the nearest free slot, closest pairs first.
    // More than 18 on the field (possible on the desktop board) leaves the rest in `extra`.
    const slotsFromBoard = (board) => {
      const field = Object.entries(board)
        .filter(([id, p]) => !p.isInterchange && playerById(+id))
        .map(([id, p]) => ({ id: +id, x: p.x, y: p.y }));
      const pairs = [];
      field.forEach(f => TEAM_SLOTS.forEach(s => pairs.push([Math.hypot(f.x - s.x, (f.y - s.y) * 1.17), f.id, s.key])));
      pairs.sort((a, b) => a[0] - b[0]);
      const slots = {}, placed = new Set();
      pairs.forEach(([, id, key]) => { if (!slots[key] && !placed.has(id)) { slots[key] = id; placed.add(id); } });
      const bench = Array.from({ length: BENCH_SIZE }, (_, i) => {
        const hit = Object.entries(board).find(([id, p]) => p.isInterchange && p.slot === i && playerById(+id));
        return hit ? +hit[0] : null;
      });
      return { slots, bench, extra: field.filter(f => !placed.has(f.id)).map(f => f.id) };
    };

    // Named slots -> board, snapping everyone to their slot's spot on the ground
    const boardFromSlots = ({ slots, bench, extra }, prev) => {
      const b = {};
      TEAM_SLOTS.forEach(s => { if (slots[s.key]) b[slots[s.key]] = { x: s.x, y: s.y }; });
      bench.forEach((id, i) => { if (id) b[id] = { isInterchange: true, slot: i }; });
      extra.forEach(id => { if (prev[id]) b[id] = prev[id]; });
      return b;
    };

    const teamSheetLines = (board) => {
      const { slots, bench, extra } = slotsFromBoard(board);
      return {
        lines: TEAM_LINES.map(l => ({ label: l.label, short: l.short, players: l.slots.map(s => playerById(slots[s.key])).filter(Boolean) })),
        bench: bench.map(playerById).filter(Boolean),
        extra: extra.map(playerById).filter(Boolean),
      };
    };

    // 'B: Saad, Weitering, Newman' etc., for pasting into a group chat
    const teamText = (board) => {
      const { lines, bench } = teamSheetLines(board);
      const nm = (p) => surname(p) + (p.captain ? ' (c)' : '');
      return [
        `Carlton ${S_YEAR}: my best 23`,
        ...lines.filter(l => l.players.length).map(l => `${l.short}: ${l.players.map(nm).join(', ')}`),
        bench.length ? `I/C: ${bench.map(nm).join(', ')}` : null,
      ].filter(Boolean).join('\n');
    };

    const downloadBlob = (blob, name) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const drawTeamSheet = (lines, benchPlayers) => {
      const W = 1000, H = 340 + lines.length * 130 + (benchPlayers.length ? 170 : 60);
      const scale = 2;
      const cv = document.createElement('canvas');
      cv.width = W * scale; cv.height = H * scale;
      const ctx = cv.getContext('2d');
      ctx.scale(scale, scale);

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0b1729'); bg.addColorStop(1, '#04080f');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, W - 48, H - 48);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 48px Oswald, Inter, sans-serif';
      ctx.fillText('C A R L T O N', W / 2, 112);
      ctx.font = '700 19px Inter, sans-serif';
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`${String(S_YEAR).split('').join(' ')}   T E A M   S H E E T`, W / 2, 148);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.moveTo(90, 180); ctx.lineTo(W - 90, 180); ctx.stroke();

      const drawPlayer = (pl, cx, cy) => {
        const num = String(numLabel(pl));
        const name = pl.name + (pl.captain ? ' (c)' : '');
        ctx.font = '600 23px Oswald, Inter, sans-serif';
        const numW = ctx.measureText(num).width;
        ctx.font = '700 21px Inter, sans-serif';
        const nameW = ctx.measureText(name).width;
        const gap = 9;
        let x = cx - (numW + gap + nameW) / 2;
        ctx.textAlign = 'left';
        ctx.font = '600 23px Oswald, Inter, sans-serif';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText(num, x, cy);
        ctx.font = '700 21px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, x + numW + gap, cy);
        ctx.textAlign = 'center';
      };

      let y = 245;
      lines.forEach(line => {
        ctx.font = '800 13px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(line.label.split('').join(' '), W / 2, y);
        const cols = line.players.length;
        line.players.forEach((pl, i) => {
          const cx = W * (i + 1) / (cols + 1);
          drawPlayer(pl, cx, y + 42);
        });
        y += 130;
      });

      if (benchPlayers.length) {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.moveTo(90, y - 20); ctx.lineTo(W - 90, y - 20); ctx.stroke();
        ctx.font = '800 13px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('I N T E R C H A N G E', W / 2, y + 18);
        benchPlayers.forEach((pl, i) => {
          const cx = W * (i + 1) / (benchPlayers.length + 1);
          drawPlayer(pl, cx, y + 62);
        });
        y += 110;
      }

      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillText(new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, H - 44);
      return cv;
    };

    // Team-sheet PNG. Lines come from the named slots, so followers around the centre square
    // are labelled followers (the old top-to-bottom split called them half forwards).
    // share=true uses the phone's share sheet where it takes files, else it downloads.
    const saveTeamSheet = (board, share) => {
      const { lines, bench } = teamSheetLines(board);
      const drawn = lines.filter(l => l.players.length);
      if (!drawn.length && !bench.length) {
        alert('Pick some players first — the team sheet is built from your selection.');
        return;
      }
      const cv = drawTeamSheet(drawn, bench);
      const name = `carlton-team-sheet-${new Date().toISOString().slice(0, 10)}.png`;
      // Built synchronously so navigator.share still counts as part of the tap (Safari insists)
      const bin = atob(cv.toDataURL('image/png').split(',')[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'image/png' });
      const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
      if (share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: `Carlton ${S_YEAR} team` })
          .catch(err => { if (!err || err.name !== 'AbortError') downloadBlob(blob, name); });
        return;
      }
      downloadBlob(blob, name);
    };

    // v2 backs up every season (v1 only saved the one on screen, so backing up from 2027
    // silently skipped 2026's votes). Top-level votes/ratings/board stay as v1 had them.
    const downloadBackup = (current) => {
      const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
      const seasons = {};
      Object.keys(SEASONS).forEach(y => {
        seasons[y] = String(S_YEAR) === y
          ? current
          : { votes: read(`carlton-bf-${y}`), ratings: read(`carlton-wheelo-${y}`), board: read(`carlton-board-${y}`) };
      });
      const data = {
        app: 'carlton-magnetboard', version: 2,
        exported: new Date().toISOString(),
        season: S_YEAR,
        votes: current.votes, ratings: current.ratings, board: current.board,
        seasons,
      };
      downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        `carlton-backup-${new Date().toISOString().slice(0, 10)}.json`);
    };

    // File-input change handler. applyHere(d) loads the on-screen season's part into state.
    const restoreBackupFile = (e, applyHere) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let data;
        try {
          data = JSON.parse(reader.result);
          if (!data || (!data.votes && !data.ratings && !data.board && !data.seasons)) throw new Error('empty');
        } catch {
          alert('Could not read that file — expected a Carlton magnetboard backup (.json).');
          return;
        }
        const when = data.exported
          ? new Date(data.exported).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'unknown date';
        if (data.seasons) {
          const years = Object.keys(data.seasons).filter(y => SEASONS[y]);
          if (!confirm(`Restore votes, ratings and boards for ${years.join(' and ')} from this backup (saved ${when})?\n\nThis replaces what's currently saved in this browser for those seasons.`)) return;
          years.forEach(y => {
            const d = data.seasons[y];
            if (y === String(S_YEAR)) { applyHere(d); return; }
            try {
              if (d.votes) {
                const st = loadJSON(stampsKey(y));
                stampChanges(loadJSON(`carlton-bf-${y}`), d.votes, st, Date.now());
                localStorage.setItem(stampsKey(y), JSON.stringify(st));
                localStorage.setItem(`carlton-bf-${y}`, JSON.stringify(d.votes));
              }
              if (d.ratings) localStorage.setItem(`carlton-wheelo-${y}`, JSON.stringify(d.ratings));
              if (d.board) localStorage.setItem(`carlton-board-${y}`, JSON.stringify(d.board));
            } catch {}
          });
        } else {
          // v1 files don't say which season they hold
          if (!confirm(`This backup (saved ${when}) doesn't record which season it's from.\n\nRestore it into ${S_YEAR}, replacing your current ${S_YEAR} votes, ratings and board? If it's from another season, cancel and switch seasons first.`)) return;
          applyHere(data);
        }
        alert('Backup restored.');
      };
      reader.readAsText(file);
      e.target.value = '';
    };

    // ---- Vote sync between devices (phone ⇄ Mac) through a private GitHub gist ----
    // Votes stay in localStorage exactly as before. Sync also keeps the time every vote was
    // last set or cleared (carlton-bf-stamps-<year>) and merges vote by vote, newest wins, so
    // voting on both devices between syncs loses nothing. Needs a token with only `gist` scope.
    const SYNC_KEY = 'carlton-sync';
    const SYNC_FILE = 'carlton-votes.json';
    const GH_API = 'https://api.github.com';
    const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=Carlton%20Magnetboard%20vote%20sync';
    const stampsKey = (y) => `carlton-bf-stamps-${y}`;
    const loadSync = () => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || null; } catch { return null; } };
    const saveSync = (cfg) => {
      try { if (cfg) localStorage.setItem(SYNC_KEY, JSON.stringify(cfg)); else localStorage.removeItem(SYNC_KEY); } catch {}
    };
    // JSON with sorted keys, so "nothing changed" checks don't depend on key order
    const stableJSON = (o) => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v)
      ? Object.keys(v).sort().reduce((acc, key) => { acc[key] = v[key]; return acc; }, {}) : v);

    const ghFetch = async (token, path, opts = {}) => {
      const res = await fetch(GH_API + path, {
        method: opts.method || 'GET', cache: 'no-store',
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'GitHub didn’t accept the token (expired or revoked?)'
          : res.status === 404 ? 'The sync gist is gone, or this token can’t see it'
          : `GitHub error ${res.status}`);
      }
      return res.json();
    };

    // Vote cells: { 'playerId|round': [score, or null once cleared, lastChangedMs] }.
    // Votes made before sync existed have no stamp (0).
    const voteKeys = (votes) => {
      const ks = [];
      Object.entries(votes || {}).forEach(([pid, rs]) => Object.keys(rs || {}).forEach(r => ks.push(`${pid}|${r}`)));
      return ks;
    };
    const cellVal = (votes, k) => {
      const [pid, r] = k.split('|');
      const v = votes && votes[pid] ? votes[pid][r] : undefined;
      return v === undefined ? null : v;
    };
    const stampChanges = (before, after, stamps, now) => {
      let changed = false;
      new Set([...voteKeys(before), ...voteKeys(after)]).forEach(k => {
        if (cellVal(before, k) !== cellVal(after, k)) { stamps[k] = now; changed = true; }
      });
      return changed;
    };
    const toCells = (votes, stamps) => {
      const cells = {};
      voteKeys(votes).forEach(k => { const v = cellVal(votes, k); if (v !== null) cells[k] = [v, stamps[k] || 0]; });
      Object.keys(stamps).forEach(k => { if (!cells[k]) cells[k] = [null, stamps[k]]; });
      return cells;
    };
    const fromCells = (cells) => {
      const votes = {}, stamps = {};
      Object.entries(cells).forEach(([k, [v, ts]]) => {
        if (ts) stamps[k] = ts;
        if (v === null) return;
        const [pid, r] = k.split('|');
        (votes[pid] = votes[pid] || {})[r] = v;
      });
      return { votes, stamps };
    };
    // Newest wins per vote. On a tie (both unstamped) `b` wins unless `strict`.
    const mergeCells = (a, b, strict) => {
      const out = { ...a };
      Object.entries(b || {}).forEach(([k, c]) => {
        if (!out[k] || c[1] > out[k][1] || (!strict && c[1] === out[k][1])) out[k] = c;
      });
      return out;
    };

    // Reuse the gist another device made (same GitHub account), or make one. Returns the login.
    const connectSync = async (rawToken) => {
      const token = rawToken.trim();
      const user = await ghFetch(token, '/user');
      const mine = await ghFetch(token, '/gists?per_page=100');
      let gist = mine.find(g => g.files && g.files[SYNC_FILE]);
      if (!gist) {
        gist = await ghFetch(token, '/gists', { method: 'POST', body: {
          description: 'Carlton Magnetboard B&F votes (synced by the app)', public: false,
          files: { [SYNC_FILE]: { content: JSON.stringify({ app: 'carlton-magnetboard', version: 1, seasons: {} }) } },
        } });
      }
      saveSync({ token, gistId: gist.id, login: user.login, last: 0 });
      return user.login;
    };

    // Pull, merge, push if anything's new. `cur` is the on-screen season's live { votes, stamps };
    // other seasons merge straight into localStorage. Returns the merged cells for `cur`.
    // Unstamped ties go to the gist, so set up the device holding the real votes first.
    const syncVotes = async (cur) => {
      const cfg = loadSync();
      if (!cfg) return null;
      const gist = await ghFetch(cfg.token, `/gists/${cfg.gistId}`);
      let remote = {};
      try { remote = JSON.parse(gist.files[SYNC_FILE].content).seasons || {}; } catch {}
      const seasons = { ...remote };
      let dirty = false, curCells = null;
      Object.keys(SEASONS).forEach(y => {
        const here = String(S_YEAR) === y;
        const local = here ? toCells(cur.votes, cur.stamps) : toCells(loadJSON(`carlton-bf-${y}`), loadJSON(stampsKey(y)));
        const merged = mergeCells(local, remote[y]);
        if (stableJSON(merged) !== stableJSON(remote[y] || {})) dirty = true;
        seasons[y] = merged;
        if (here) { curCells = merged; return; }
        const { votes, stamps } = fromCells(merged);
        try {
          localStorage.setItem(`carlton-bf-${y}`, JSON.stringify(votes));
          localStorage.setItem(stampsKey(y), JSON.stringify(stamps));
        } catch {}
      });
      if (dirty) {
        await ghFetch(cfg.token, `/gists/${cfg.gistId}`, { method: 'PATCH', body: {
          files: { [SYNC_FILE]: { content: JSON.stringify({ app: 'carlton-magnetboard', version: 1, updated: new Date().toISOString(), seasons }) } },
        } });
      }
      saveSync({ ...loadSync(), last: Date.now() });
      return curCells;
    };

    // Stamps this device's vote changes, pushes ~1.5s after them, and pulls on open/foreground
    const useVoteSync = (votes, setVotes) => {
      const [status, setStatus] = useState(() => { const c = loadSync(); return c ? { state: 'idle', last: c.last } : null; });
      const stamps = useRef(loadJSON(stampsKey(S_YEAR)));
      const prev = useRef(votes);
      const live = useRef(votes);
      live.current = votes;
      const fromSync = useRef(false);
      const busy = useRef(false), again = useRef(false), timer = useRef(null);

      const run = async () => {
        if (!loadSync()) { setStatus(null); return; }
        if (busy.current) { again.current = true; return; }
        busy.current = true;
        setStatus(s => ({ ...(s || {}), state: 'syncing' }));
        try {
          const merged = await syncVotes({ votes: live.current, stamps: stamps.current });
          // Votes made while that request was out are newer than anything it brought back
          const { votes: nv, stamps: ns } = fromCells(mergeCells(merged, toCells(live.current, stamps.current), true));
          stamps.current = ns;
          try { localStorage.setItem(stampsKey(S_YEAR), JSON.stringify(ns)); } catch {}
          if (stableJSON(nv) !== stableJSON(fromCells(toCells(live.current, {})).votes)) { fromSync.current = true; setVotes(nv); }
          setStatus({ state: 'ok', last: Date.now() });
        } catch (e) {
          const msg = e && e.message === 'Failed to fetch' ? 'Couldn’t reach GitHub (offline?)' : (e && e.message) || 'Sync failed';
          setStatus({ state: 'error', msg, last: (loadSync() || {}).last });
        }
        busy.current = false;
        if (again.current) { again.current = false; run(); }
      };
      const runRef = useRef(run);
      runRef.current = run;

      useEffect(() => {
        const before = prev.current;
        prev.current = votes;
        if (fromSync.current) { fromSync.current = false; return; }
        if (before === votes) return;
        if (stampChanges(before, votes, stamps.current, Date.now())) {
          try { localStorage.setItem(stampsKey(S_YEAR), JSON.stringify(stamps.current)); } catch {}
          if (loadSync()) { clearTimeout(timer.current); timer.current = setTimeout(() => runRef.current(), 1500); }
        }
      }, [votes]);

      // Pull on open, on coming back to the front, and every minute while on screen
      // (a board left open on the Mac never gets a focus event)
      useEffect(() => {
        runRef.current();
        const wake = () => { if (document.visibilityState === 'visible') runRef.current(); };
        document.addEventListener('visibilitychange', wake);
        window.addEventListener('focus', wake);
        const tick = setInterval(wake, 60000);
        return () => {
          document.removeEventListener('visibilitychange', wake);
          window.removeEventListener('focus', wake);
          clearInterval(tick);
          clearTimeout(timer.current);
        };
      }, []);

      const refresh = () => { const c = loadSync(); setStatus(c ? { state: 'idle', last: c.last } : null); };
      return { status, syncNow: () => runRef.current(), refresh };
    };

    const ago = (ms) => {
      if (!ms) return 'not yet';
      const s = Math.round((Date.now() - ms) / 1000);
      if (s < 45) return 'just now';
      if (s < 3600) return `${Math.round(s / 60)} min ago`;
      if (s < 86400) return `${Math.round(s / 3600)} h ago`;
      return new Date(ms).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    };
    const syncColor = (st) => !st ? 'rgba(255,255,255,0.55)' : st.state === 'error' ? '#f87171' : st.state === 'syncing' ? '#fbbf24' : '#4ade80';
    const syncLabel = (st) => !st ? 'Sync votes' : st.state === 'error' ? 'Sync failed' : st.state === 'syncing' ? 'Syncing…' : 'Synced';

    // Connect / status / disconnect. Shared by the desktop modal and the phone sheet.
    const SyncPanel = ({ sync }) => {
      const cfg = loadSync();
      const [token, setToken] = useState('');
      const [busy, setBusy] = useState(false);
      const [err, setErr] = useState('');
      const st = sync.status;
      const para = { color: 'rgba(255,255,255,0.65)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '12px' };
      const btn = (primary) => ({
        padding: '11px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
        background: primary ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.08)',
        color: primary ? CARLTON_NAVY : '#fff', border: primary ? 'none' : '1px solid rgba(255,255,255,0.14)',
      });

      const connect = async () => {
        if (!token.trim()) return;
        setBusy(true); setErr('');
        try {
          await connectSync(token);
          setToken('');
          sync.refresh();
          sync.syncNow();
        } catch (e) {
          setErr(e && e.message === 'Failed to fetch' ? 'Couldn’t reach GitHub. Check your connection.' : (e && e.message) || 'Couldn’t connect');
        }
        setBusy(false);
      };

      if (cfg) {
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: syncColor(st) }}></span>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>Connected as @{cfg.login}</span>
            </div>
            <div style={{ ...para, color: st && st.state === 'error' ? '#f87171' : para.color }}>
              {st && st.state === 'error' ? st.msg : st && st.state === 'syncing' ? 'Syncing…' : `Last synced ${ago(st ? st.last : cfg.last)}`}
            </div>
            <div style={para}>
              Votes sync automatically: a moment after you vote, when the app opens or comes back to the
              front, and every minute while it's on screen. Every season syncs, not just the one showing.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => sync.syncNow()} style={{ ...btn(true), flex: 1 }}>Sync now</button>
              <button onClick={() => {
                if (!confirm('Stop syncing on this device? Votes already here stay here.')) return;
                saveSync(null); sync.refresh();
              }} style={btn(false)}>Disconnect</button>
            </div>
            <div style={{ ...para, fontSize: '12px', marginTop: '12px', marginBottom: 0, color: 'rgba(255,255,255,0.4)' }}>
              The votes live in a private gist on your GitHub account (gist.github.com).
            </div>
          </div>
        );
      }

      return (
        <div>
          <div style={para}>
            Keep B&F votes the same on your phone and computer. They're stored in a private gist on your
            GitHub account, and each device needs a GitHub token that can only read and write gists.
          </div>
          <div style={{ color: '#fff', fontSize: '13.5px', fontWeight: '700', marginBottom: '6px' }}>1. Make a gist-only token</div>
          <div style={para}>
            <a href={TOKEN_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontWeight: '700' }}>Open GitHub’s token page ↗</a>.
            Only “gist” is ticked: leave it that way, pick an expiry, then Generate token and copy it.
          </div>
          <div style={{ color: '#fff', fontSize: '13.5px', fontWeight: '700', marginBottom: '6px' }}>2. Paste it here</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="password" value={token} onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') connect(); }}
              placeholder="ghp_…" autoComplete="off" spellCheck={false}
              onBlur={unshiftAfterKeyboard}
              style={{
                flex: 1, minWidth: 0, padding: '11px 12px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff', fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
            <button onClick={connect} disabled={busy || !token.trim()} style={{ ...btn(true), opacity: busy || !token.trim() ? 0.5 : 1 }}>
              {busy ? 'Connecting…' : 'Connect'}
            </button>
          </div>
          {err && <div style={{ ...para, color: '#f87171' }}>{err}</div>}
          <div style={{ color: '#fff', fontSize: '13.5px', fontWeight: '700', marginBottom: '6px' }}>3. Repeat on your other device</div>
          <div style={{ ...para, marginBottom: 0 }}>
            Same token or a second one: both find the same gist. Connect the computer first so the votes
            already on it go up first.
          </div>
        </div>
      );
    };

    // Centred dialog for the desktop board
    const Modal = ({ title, onClose, children }) => {
      useEffect(() => {
        const key = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
      }, [onClose]);
      return (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(2,6,14,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fade-in 0.15s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '460px', maxWidth: 'calc(100% - 32px)', padding: '20px 22px 22px',
            background: `linear-gradient(160deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 55%, ${CARLTON_NAVY_DARK} 100%)`,
            border: '1px solid rgba(255,255,255,0.14)', borderRadius: '18px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)', animation: 'float-in 0.18s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>{title}</span>
              <button onClick={onClose} style={{
                padding: '6px 13px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', fontWeight: '700',
              }}>Done</button>
            </div>
            {children}
          </div>
        </div>
      );
    };

    function App({ onSeason }) {
      const [fieldPlayers, setFieldPlayers] = useState(() => loadJSON(`carlton-board-${S_YEAR}`));
      const [dragging, setDragging] = useState(null);
      const [filter, setFilter] = useState('ALL');
      const fieldRef = useRef(null);
      const dragRef = useRef(false);

      const [votes, setVotes] = useState(() => loadJSON(`carlton-bf-${S_YEAR}`));
      const [selectedRound, setSelectedRound] = useState('OR');
      const [bfView, setBfView] = useState('vote');
      const [ratings, setRatings] = useState(loadRatings);

      useEffect(() => {
        try { localStorage.setItem(`carlton-bf-${S_YEAR}`, JSON.stringify(votes)); } catch {}
      }, [votes]);

      useEffect(() => {
        try { localStorage.setItem(`carlton-board-${S_YEAR}`, JSON.stringify(fieldPlayers)); } catch {}
      }, [fieldPlayers]);

      useEffect(() => {
        try { localStorage.setItem(`carlton-wheelo-${S_YEAR}`, JSON.stringify(ratings)); } catch {}
      }, [ratings]);

      const [query, setQuery] = useState('');
      const q = query.trim();
      const matchesQuery = (p) => !q || (/^\d+$/.test(q) ? String(p.number) === q : normName(p.name).includes(normName(q)));
      const filtered = S_PLAYERS.filter(p => (filter === 'ALL' || p.position === filter) && matchesQuery(p));
      const bench = filtered.filter(p => !fieldPlayers[p.id]).sort((a, b) => a.number - b.number);
      const selectedPlayers = S_PLAYERS.filter(p => fieldPlayers[p.id]);
      const interchangeCount = Object.values(fieldPlayers).filter(p => p.isInterchange).length;
      const onFieldCount = Object.keys(fieldPlayers).length - interchangeCount;

      // --- Undo toast (clear board, remove player) ---
      const { toast, showToast, runUndo } = useUndoToast();

      // --- Vote sync with the phone ---
      const sync = useVoteSync(votes, setVotes);
      const [syncOpen, setSyncOpen] = useState(false);
      const closeSync = useCallback(() => setSyncOpen(false), []);

      // Board edits that touch-drag handlers (registered once) can call: read live state via ref
      const boardRef = useRef(fieldPlayers);
      boardRef.current = fieldPlayers;
      const freeBenchSlot = (fp) => [0, 1, 2, 3, 4].find(sl => !Object.values(fp).some(pp => pp.isInterchange && pp.slot === sl));

      const removePlayer = (player) => {
        const was = boardRef.current[player.id];
        if (!was) return;
        setFieldPlayers(prev => { const n = { ...prev }; delete n[player.id]; return n; });
        showToast(`${player.name} removed`, () => setFieldPlayers(prev => {
          if (prev[player.id]) return prev;
          if (was.isInterchange && freeBenchSlot(prev) === undefined) return prev;
          const slotTaken = was.isInterchange && Object.values(prev).some(pp => pp.isInterchange && pp.slot === was.slot);
          return { ...prev, [player.id]: slotTaken ? { isInterchange: true, slot: freeBenchSlot(prev) } : was };
        }));
      };

      const moveToBench = (player) => setFieldPlayers(prev => {
        const slot = freeBenchSlot(prev);
        if (slot === undefined) return prev;
        return { ...prev, [player.id]: { isInterchange: true, slot } };
      });

      const clearBoard = () => {
        const snapshot = fieldPlayers;
        const n = Object.keys(snapshot).length;
        if (!n) return;
        setFieldPlayers({});
        showToast(`Board cleared (${n} player${n === 1 ? '' : 's'})`, () => setFieldPlayers(snapshot));
      };

      // --- Player card (single click; a double-click still removes) ---
      const [card, setCard] = useState(null);
      const cardTimer = useRef(null);
      const downAt = useRef(null);
      const closeCard = useCallback(() => setCard(null), []);
      const openCard = (e, player, delay = 0) => {
        if (e.detail > 1) return;
        // Field magnets follow the mouse while held, so a click that moved was really a nudge
        if (delay && downAt.current && Math.hypot(e.clientX - downAt.current.x, e.clientY - downAt.current.y) > 4) return;
        const rect = e.currentTarget.getBoundingClientRect();
        clearTimeout(cardTimer.current);
        cardTimer.current = setTimeout(() => setCard({ player, rect }), delay);
      };
      const removeOnDblClick = (player) => {
        clearTimeout(cardTimer.current);
        setCard(null);
        removePlayer(player);
      };

      const handleMouseMove = useCallback((e) => {
        if (!dragRef.current || !dragging || !fieldRef.current) return;
        const rect = fieldRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setFieldPlayers(prev => ({
          ...prev,
          [dragging.id]: { x: Math.max(6, Math.min(94, x)), y: Math.max(3, Math.min(97, y)) }
        }));
      }, [dragging]);

      const handleMouseUp = useCallback(() => {
        dragRef.current = false;
        setDragging(null);
      }, []);

      useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }, [handleMouseMove, handleMouseUp]);

      // --- Results (baked into data.js, refreshed via Squiggle) ---
      const [results, setResults] = useState(() => {
        try {
          const saved = localStorage.getItem(`carlton-results-${S_YEAR}`);
          return saved ? { ...S_RESULTS, ...JSON.parse(saved) } : S_RESULTS;
        } catch { return S_RESULTS; }
      });
      const [syncState, setSyncState] = useState('');

      const parseSquiggleGames = (games) => {
        const merged = {};
        const taken = {};
        games
          .filter(g => g.complete === 100)
          .sort((a, b) => (a.unixtime || 0) - (b.unixtime || 0))
          .forEach(g => {
            const carltonHome = g.hteam === 'Carlton';
            const oppRaw = carltonHome ? g.ateam : g.hteam;
            const opp = SQUIGGLE_NAMES[oppRaw] || oppRaw;
            const fx = S_FIXTURE.find(f => f.opponent === opp && !taken[f.round]);
            if (!fx) return;
            taken[fx.round] = true;
            const forScore = carltonHome ? g.hscore : g.ascore;
            const against = carltonHome ? g.ascore : g.hscore;
            merged[fx.round] = {
              for: forScore, against,
              result: forScore === against ? 'D' : (g.winner === 'Carlton' ? 'W' : 'L'),
            };
          });
        return merged;
      };

      const syncResults = async () => {
        setSyncState('syncing');
        const api = `https://api.squiggle.com.au/?q=games;year=${S_YEAR};team=3`;
        const attempts = [api, 'https://api.allorigins.win/raw?url=' + encodeURIComponent(api)];
        for (const url of attempts) {
          try {
            const resp = await fetch(url);
            if (!resp.ok) continue;
            const data = await resp.json();
            const merged = parseSquiggleGames(data.games || []);
            if (Object.keys(merged).length === 0) continue;
            setResults(prev => {
              const next = { ...prev, ...merged };
              try { localStorage.setItem(`carlton-results-${S_YEAR}`, JSON.stringify(next)); } catch {}
              return next;
            });
            setSyncState('ok');
            setTimeout(() => setSyncState(''), 3000);
            return;
          } catch {}
        }
        setSyncState('fail');
        setTimeout(() => setSyncState(''), 4000);
      };

      // --- Team sheet PNG export ---
      const exportTeamSheet = () => saveTeamSheet(fieldPlayers, false);

      // --- Backup / restore ---
      const fileInputRef = useRef(null);
      const exportBackup = () => downloadBackup({ votes, ratings, board: fieldPlayers });
      const importBackup = (e) => restoreBackupFile(e, (d) => {
        if (d.votes) setVotes(d.votes);
        if (d.ratings) setRatings(d.ratings);
        if (d.board) setFieldPlayers(d.board);
      });

      const handleSidebarDrag = (e, player) => {
        e.dataTransfer.setData('player', JSON.stringify(player));
      };

      const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('player');
        if (!data || !fieldRef.current) return;
        const player = JSON.parse(data);
        const rect = fieldRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setFieldPlayers(prev => ({
          ...prev,
          [player.id]: { x: Math.max(6, Math.min(94, x)), y: Math.max(3, Math.min(97, y)) }
        }));
      };

      // --- Touch drag (pointer events; desktop mouse path unchanged) ---
      const [touchDrag, setTouchDrag] = useState(null);
      const touchRef = useRef(null);
      const benchRef = useRef(null);

      const startTouchDrag = (e, player, source) => {
        if (e.pointerType === 'mouse') return;
        touchRef.current = { player, source, startX: e.clientX, startY: e.clientY, active: source === 'field' };
        if (source === 'field') {
          setTouchDrag({ player, source, x: e.clientX, y: e.clientY });
        }
      };

      useEffect(() => {
        const move = (e) => {
          const t = touchRef.current;
          if (!t) return;
          if (!t.active) {
            const dx = e.clientX - t.startX, dy = e.clientY - t.startY;
            if (Math.hypot(dx, dy) < 8) return;
            if (t.source === 'sidebar' && Math.abs(dy) > Math.abs(dx) * 1.4) {
              touchRef.current = null; // vertical intent: let the list scroll
              return;
            }
            t.active = true;
          }
          setTouchDrag({ player: t.player, source: t.source, x: e.clientX, y: e.clientY });
        };
        const up = (e) => {
          const t = touchRef.current;
          touchRef.current = null;
          setTouchDrag(null);
          if (!t || !t.active) return;
          const fr = fieldRef.current && fieldRef.current.getBoundingClientRect();
          const br = benchRef.current && benchRef.current.getBoundingClientRect();
          const inside = (r) => r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (inside(fr)) {
            const x = ((e.clientX - fr.left) / fr.width) * 100;
            const y = ((e.clientY - fr.top) / fr.height) * 100;
            setFieldPlayers(prev => ({
              ...prev,
              [t.player.id]: { x: Math.max(6, Math.min(94, x)), y: Math.max(3, Math.min(97, y)) }
            }));
          } else if (inside(br)) {
            setFieldPlayers(prev => {
              const usedSlots = Object.values(prev).filter(pp => pp.isInterchange).map(pp => pp.slot);
              const nextSlot = [0, 1, 2, 3, 4].find(sl => !usedSlots.includes(sl));
              if (nextSlot === undefined) return prev;
              return { ...prev, [t.player.id]: { isInterchange: true, slot: nextSlot } };
            });
          } else if (t.source !== 'sidebar') {
            removePlayer(t.player);
          }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        return () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
        };
      }, []);

      const handleMagnetDown = (e, player) => {
        downAt.current = { x: e.clientX, y: e.clientY };
        dragRef.current = true;
        setDragging(player);
      };

      const cardStatus = card ? (!fieldPlayers[card.player.id] ? 'none' : fieldPlayers[card.player.id].isInterchange ? 'bench' : 'field') : null;

      return (
        <div style={{ display: 'flex', height: '100vh', background: 'transparent' }}>
          <div style={{
            flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px',
            padding: '60px 16px 16px', position: 'relative',
          }}>
            {/* Title + form strip */}
            <div style={{
              position: 'absolute', top: '14px', left: '18px', zIndex: 50,
              display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ color: '#fff', fontWeight: '900', fontSize: '16px', letterSpacing: '4px' }}>CARLTON</span>
                <span style={{ display: 'inline-flex', gap: '4px', alignSelf: 'center' }}>
                  {Object.keys(SEASONS).map(y => (
                    <button key={y} onClick={() => onSeason && onSeason(y)} style={{
                      padding: '3px 9px', borderRadius: '7px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '800', letterSpacing: '1px',
                      background: String(S_YEAR) === y ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.05)',
                      color: String(S_YEAR) === y ? CARLTON_NAVY : 'rgba(255,255,255,0.5)',
                      border: String(S_YEAR) === y ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}>{y}</button>
                  ))}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '600', fontSize: '10px', letterSpacing: '2px' }}>SEASON HUB</span>
              </div>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {S_FIXTURE.filter(g => results[g.round]).map(g => {
                  const r = results[g.round];
                  return (
                    <span
                      key={g.round}
                      title={`${g.round} ${g.home ? 'vs' : '@'} ${g.opponent}: ${r.result} ${r.for}–${r.against}`}
                      style={{
                        width: '11px', height: '11px', borderRadius: '3px',
                        background: r.result === 'W' ? 'rgba(34,197,94,0.85)' : r.result === 'D' ? 'rgba(251,191,36,0.85)' : 'rgba(239,68,68,0.55)',
                        display: 'inline-block',
                      }}
                    ></span>
                  );
                })}
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ position: 'absolute', top: '16px', left: '452px', zIndex: 100, display: 'flex', gap: '8px' }}>
              <button
                onClick={clearBoard}
                title="Take every player off the board (you can undo)"
                style={{
                  padding: '10px 13px',
                  background: 'rgba(239,68,68,0.1)', color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              >✕ Clear board</button>
              <button
                onClick={exportBackup}
                title="Download all votes, ratings and the board layout as a JSON file"
                style={{
                  padding: '10px 13px',
                  background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
              >⭳ Backup</button>
              <button
                onClick={exportTeamSheet}
                title="Export the current board as a classic team-sheet PNG (lines read top-to-bottom off the board)"
                style={{
                  padding: '10px 13px',
                  background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                  border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
              >⭳ Team sheet</button>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Restore votes, ratings and board layout from a backup file"
                style={{
                  padding: '10px 13px',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >⭱ Restore</button>
              <button
                onClick={() => setSyncOpen(true)}
                title={sync.status ? (sync.status.state === 'error' ? sync.status.msg : `Votes last synced ${ago(sync.status.last)}`) : 'Sync B&F votes with your phone'}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)', color: syncColor(sync.status),
                  border: `1px solid ${sync.status && sync.status.state === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                }}
              >☁ {syncLabel(sync.status)}</button>
              {window.CARLTON_PHONE && (
                <button
                  onClick={() => { try { localStorage.setItem('carlton-view', 'mobile'); } catch {} location.reload(); }}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.9)', color: CARLTON_NAVY,
                    border: 'none', borderRadius: '10px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '800',
                  }}
                >Mobile view</button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={importBackup}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '16px' }}>
            <LeftPanel
              votes={votes} setVotes={setVotes}
              selectedRound={selectedRound} setSelectedRound={setSelectedRound}
              bfView={bfView} setBfView={setBfView}
              ratings={ratings} setRatings={setRatings}
              results={results} onSyncResults={syncResults} syncState={syncState}
            />

            {/* Field: sized to its column (container units), leaving room for the line labels */}
            <div style={{ flex: 1, minWidth: 0, containerType: 'size', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              ref={fieldRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                height: 'min(100cqh, calc((100cqw - 120px) * 1.1667))',
                aspectRatio: '480/560',
                position: 'relative',
                filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))',
                borderRadius: '50%',
              }}
            >
              <PositionLabels />
              <Field />

              {Object.keys(fieldPlayers).length === 0 && (
                <div style={{
                  position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap',
                  background: 'rgba(6,13,26,0.72)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px', padding: '10px 16px', backdropFilter: 'blur(4px)',
                  color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', lineHeight: 1.6,
                }}>
                  Drag players from the list onto the ground or bench
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: '500' }}>
                    Click a player for their card • Double-click to remove
                  </div>
                </div>
              )}

              {Object.entries(fieldPlayers).map(([id, pos]) => {
                if (pos.isInterchange) return null;
                const player = S_PLAYERS.find(p => p.id === parseInt(id));
                if (!player) return null;
                const dimmed = filter !== 'ALL' && player.position !== filter;
                return (
                  <Magnet
                    key={id}
                    player={player}
                    isDragging={dragging?.id === player.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('player', JSON.stringify(player));
                      e.dataTransfer.setData('source', 'field');
                      dragRef.current = false;
                      setDragging(null);
                      setCard(null);
                    }}
                    onMouseDown={(e) => handleMagnetDown(e, player)}
                    onPointerDown={(e) => startTouchDrag(e, player, 'field')}
                    onClick={(e) => openCard(e, player, 250)}
                    onDoubleClick={() => removeOnDblClick(player)}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      opacity: dimmed ? 0.22 : 1,
                      filter: dimmed ? 'saturate(0.3)' : 'none',
                      pointerEvents: dimmed ? 'none' : 'auto',
                      transition: 'opacity 0.2s ease, filter 0.2s ease',
                    }}
                  />
                );
              })}
            </div>
            </div>
            </div>

            {/* Interchange bench: full-width strip under the panel and field */}
            <div
              ref={benchRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('player');
                if (!data) return;
                const player = JSON.parse(data);
                const usedSlots = Object.values(fieldPlayers).filter(p => p.isInterchange).map(p => p.slot);
                const nextSlot = [0,1,2,3,4].find(s => !usedSlots.includes(s));
                if (nextSlot !== undefined) {
                  setFieldPlayers(prev => ({
                    ...prev,
                    [player.id]: { isInterchange: true, slot: nextSlot }
                  }));
                }
              }}
              style={{
                flexShrink: 0,
                background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '18px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ width: '58px', flexShrink: 0, textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '800', letterSpacing: '2px' }}>BENCH</div>
                <div style={{ color: interchangeCount === 5 ? '#22c55e' : 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: '700', marginTop: '3px' }}>{interchangeCount}/5</div>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '10px' }}>
                {[0, 1, 2, 3, 4].map(slot => {
                  const playerInSlot = Object.entries(fieldPlayers).find(
                    ([_, pos]) => pos.isInterchange && pos.slot === slot
                  );
                  const player = playerInSlot
                    ? S_PLAYERS.find(p => p.id === parseInt(playerInSlot[0]))
                    : null;

                  if (player) {
                    return (
                      <div
                        key={slot}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('player', JSON.stringify(player));
                          e.dataTransfer.setData('source', 'interchange');
                        }}
                        onPointerDown={(e) => startTouchDrag(e, player, 'bench')}
                        onClick={(e) => openCard(e, player, 250)}
                        onDoubleClick={() => removeOnDblClick(player)}
                        title={`${player.name} • ${player.height}cm • ${calculateAge(player.dob)}y`}
                        style={{
                          flex: '1 1 0', minWidth: 0, height: '58px',
                          background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
                          border: player.captain ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '12px',
                          padding: '0 12px',
                          display: 'flex', alignItems: 'center',
                          cursor: 'grab',
                          touchAction: 'none',
                          position: 'relative',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                      >
                        {player.captain && (
                          <div style={{
                            position: 'absolute', top: -6, right: -6,
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#000',
                            fontSize: '10px', fontWeight: '900',
                            width: '18px', height: '18px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>C</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, width: '100%' }}>
                          <PlayerPhoto player={player} size={38} />
                          <span style={{
                            color: '#fff', fontWeight: '600', fontSize: '21px',
                            fontFamily: "'Oswald', 'Inter', sans-serif",
                            lineHeight: 1, letterSpacing: '0.5px',
                            textShadow: '0 2px 5px rgba(0,0,0,0.55)',
                            minWidth: '24px', textAlign: 'center', flexShrink: 0,
                          }}>{numLabel(player)}</span>
                          <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10.5px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {player.name.split(' ')[0]}
                            </div>
                            <div style={{ color: '#fff', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {player.name.split(' ').slice(1).join(' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot}
                      style={{
                        flex: '1 1 0', minWidth: 0,
                        height: '58px',
                        border: '2px dashed rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.25)',
                        fontSize: '14px',
                        fontWeight: '700',
                        background: 'rgba(255,255,255,0.02)',
                      }}>{slot + 1}</div>
                  );
                })}
              </div>
            </div>
          </div>

          <Sidebar
            players={bench}
            selected={selectedPlayers}
            onDragStart={handleSidebarDrag}
            onPointerStart={startTouchDrag}
            onRemovePlayer={removePlayer}
            onOpenCard={openCard}
            filter={filter}
            setFilter={setFilter}
            query={query}
            setQuery={setQuery}
            fieldCount={onFieldCount}
            interchangeCount={interchangeCount}
          />

          {card && (
            <PlayerCard
              key={card.player.id}
              player={card.player}
              rect={card.rect}
              votes={votes}
              status={cardStatus}
              benchFull={freeBenchSlot(fieldPlayers) === undefined}
              onClose={closeCard}
              onBench={() => moveToBench(card.player)}
              onRemove={() => { setCard(null); removePlayer(card.player); }}
            />
          )}

          {syncOpen && (
            <Modal title="Sync votes" onClose={closeSync}>
              <SyncPanel sync={sync} />
            </Modal>
          )}

          {/* Undo toast, centred over the field column */}
          {toast && (
            <div style={{
              position: 'fixed', left: '452px', right: '316px', bottom: '104px', zIndex: 2500,
              display: 'flex', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <ToastPill toast={toast} onUndo={runUndo} />
            </div>
          )}

          {/* Touch drag ghost */}
          {touchDrag && (
            <div style={{
              position: 'fixed', left: touchDrag.x, top: touchDrag.y,
              transform: 'translate(-50%, -120%)', zIndex: 2000,
              pointerEvents: 'none', opacity: 0.95,
            }}>
              <div style={{
                background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
                border: `1px solid ${(posColors[touchDrag.player.position] || {}).light || 'rgba(255,255,255,0.3)'}`,
                borderRadius: '12px', padding: '8px 14px',
                color: '#fff', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              }}>
                #{numLabel(touchDrag.player)} {touchDrag.player.name}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ============================ MOBILE ============================
    // Phones get their own layout (the head script in the HTML decides): a tap-to-pick team
    // sheet and one-round-at-a-time B&F voting. Same localStorage keys as the desktop board.

    const OSWALD = "'Oswald', 'Inter', sans-serif";
    const LINE_FILTER = { B: 'DEF', HB: 'DEF', C: 'MID', HF: 'FWD', F: 'FWD', FOL: 'MID' };
    const sameTarget = (a, b) => !!a && !!b && a.key === b.key && a.bench === b.bench;
    const POS_LONG = {
      BP: 'Back pocket', FB: 'Full back', HBF: 'Half-back flank', CHB: 'Centre half-back',
      W: 'Wing', C: 'Centre', HFF: 'Half-forward flank', CHF: 'Centre half-forward',
      FP: 'Forward pocket', FF: 'Full forward', R: 'Ruck', RR: 'Ruck-rover', ROV: 'Rover',
    };
    const targetLabel = (t) => t.bench !== undefined ? `Interchange ${t.bench + 1}` : POS_LONG[TEAM_SLOTS.find(s => s.key === t.key).pos];

    // Average Wheelo rating by name: this season, or last season before the first game
    const ratingAverages = () => {
      let year = S_YEAR, stats = S_STATS;
      if (!Object.keys(stats).length && SEASONS[S_YEAR - 1]) { year = S_YEAR - 1; stats = SEASONS[year].stats; }
      const acc = {};
      Object.values(stats).forEach(rd => rd.players.forEach(p => {
        const a = acc[p.name] || (acc[p.name] = { sum: 0, games: 0 });
        a.sum += p.rating; a.games++;
      }));
      const avg = {};
      Object.entries(acc).forEach(([n, a]) => { avg[n] = a.sum / a.games; });
      return { year, avg };
    };

    const chipStyle = (on) => ({
      padding: '8px 13px', borderRadius: '999px', flexShrink: 0,
      background: on ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.06)',
      color: on ? CARLTON_NAVY : 'rgba(255,255,255,0.6)',
      border: on ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
      fontSize: '13px', fontWeight: '700', cursor: 'pointer',
    });

    // Visible part of the screen in px. On iPhones it shrinks while the keyboard is up.
    const useVisibleViewport = () => {
      const read = () => {
        const vv = window.visualViewport;
        return vv ? { height: Math.round(vv.height), top: Math.round(vv.offsetTop) } : { height: window.innerHeight, top: 0 };
      };
      const [view, setView] = useState(read);
      useEffect(() => {
        const vv = window.visualViewport;
        const update = () => setView(read());
        (vv || window).addEventListener('resize', update);
        if (vv) vv.addEventListener('scroll', update);
        window.addEventListener('orientationchange', update);
        return () => {
          (vv || window).removeEventListener('resize', update);
          if (vv) vv.removeEventListener('scroll', update);
          window.removeEventListener('orientationchange', update);
        };
      }, []);
      return view;
    };

    // After the iPhone keyboard closes, Safari can leave the page shifted up; put it back
    const unshiftAfterKeyboard = () => setTimeout(() => window.scrollTo(0, 0), 60);

    // Bottom sheet: tap the backdrop or Done to close. It renders into <body> (a portal): left inside
    // the page's scroll area, iPhone Safari hands a swipe that hits the end of the list to the page
    // behind it, so the list feels stuck. Heights are explicit pixels from the visible screen rather
    // than flexbox shrinking, which older Safari gets wrong, so the list always fits above the keyboard.
    // `pinned` stays above the scrolling part (e.g. the picker's search and filters). Changing
    // `scrollKey` puts the list back at the top. Swipe the top of the sheet down (or tap the
    // backdrop / Done) to close; it slides away rather than vanishing.
    const Sheet = ({ title, onClose, children, pinned, scrollKey }) => {
      const view = useVisibleViewport();
      const headRef = useRef(null);
      const bodyRef = useRef(null);
      const [headH, setHeadH] = useState(64);
      const [drag, setDrag] = useState(0);
      const [dragging, setDragging] = useState(false);
      const [closing, setClosing] = useState(false);
      const start = useRef(null);
      useLayoutEffect(() => { if (headRef.current) setHeadH(headRef.current.offsetHeight); });
      useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [scrollKey]);
      const panelMax = Math.max(240, view.height - 44);

      const close = () => {
        if (closing) return;
        setClosing(true);
        setTimeout(onClose, 200);
      };
      const down = (e) => {
        if (e.target.closest('input, button, select')) return;
        start.current = { y: e.clientY, t: performance.now() };
        setDragging(true);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
      };
      const move = (e) => { if (start.current) setDrag(Math.max(0, e.clientY - start.current.y)); };
      const up = (e) => {
        if (!start.current) return;
        const dy = Math.max(0, e.clientY - start.current.y);
        const speed = dy / Math.max(1, performance.now() - start.current.t);
        start.current = null;
        setDragging(false);
        if (dy > 120 || (dy > 50 && speed > 0.8)) close(); else setDrag(0);
      };

      return ReactDOM.createPortal(
        <div onClick={close} style={{
          position: 'fixed', left: 0, right: 0, top: view.top, height: view.height, zIndex: 4000,
          background: 'rgba(2,6,14,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          animation: 'fade-in 0.15s ease',
          opacity: closing ? 0 : 1 - Math.min(drag / 500, 0.5), transition: 'opacity 0.2s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            maxHeight: panelMax, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: `linear-gradient(180deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 35%, ${CARLTON_NAVY_DARK} 100%)`,
            borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.12)', borderBottom: 'none',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
            animation: 'sheet-up 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: closing ? 'translateY(100%)' : `translateY(${drag}px)`,
            transition: dragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}>
            <div ref={headRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              style={{ flexShrink: 0, touchAction: 'none', cursor: 'grab' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px' }}>
                <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.22)' }}></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 10px' }}>
                <span style={{ color: '#fff', fontSize: '17px', fontWeight: '800' }}>{title}</span>
                <button onClick={close} style={{
                  padding: '7px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', fontWeight: '700',
                }}>Done</button>
              </div>
              {pinned && <div style={{ padding: '0 16px' }}>{pinned}</div>}
            </div>
            <div ref={bodyRef} style={{
              maxHeight: panelMax - headH, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch',
              padding: '0 16px calc(18px + env(safe-area-inset-bottom))',
            }}>
              {children}
            </div>
          </div>
        </div>,
        document.body
      );
    };

    const SlotTile = ({ label, player, onTap, highlight }) => (
      <button onClick={onTap} style={{
        position: 'relative', minWidth: 0, height: '88px', padding: '16px 6px 8px', borderRadius: '13px',
        background: player ? `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)` : 'rgba(255,255,255,0.025)',
        border: highlight ? '2px solid #60a5fa'
          : player ? (player.captain ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.14)')
          : '1.5px dashed rgba(255,255,255,0.14)',
        boxShadow: highlight ? '0 0 0 4px rgba(96,165,250,0.18)' : player ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
        color: '#fff', cursor: 'pointer', textAlign: 'center',
      }}>
        <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '9.5px', fontWeight: '800', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.38)' }}>{label}</span>
        {player && player.captain && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px', width: '19px', height: '19px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#000',
            fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>C</span>
        )}
        {player ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlayerPhoto player={player} size={30} />
              <span style={{ fontFamily: OSWALD, fontSize: '21px', fontWeight: '600', lineHeight: 1 }}>{numLabel(player)}</span>
            </span>
            <span style={{ fontSize: '12.5px', fontWeight: '700', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {surname(player)}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '24px', fontWeight: '300', color: 'rgba(255,255,255,0.28)', lineHeight: 1 }}>+</span>
        )}
      </button>
    );

    // Pick a player for one slot. Opens filtered to the slot's line; only unpicked players.
    // When `onSkip` is set the picker is filling empty slots in a row: after each pick the parent
    // hands it the next empty slot, and the filter resets to suit that slot.
    const slotFilter = (t) => {
      if (t.bench !== undefined) return 'ALL';
      if (t.key === 'R') return 'RUCK';
      return LINE_FILTER[TEAM_LINES.find(l => l.slots.some(s => s.key === t.key)).key];
    };
    const targetKey = (t) => t.bench !== undefined ? `IC${t.bench}` : t.key;

    const PickerSheet = ({ target, board, onPick, onClose, onSkip, picked }) => {
      const [pos, setPos] = useState(() => slotFilter(target));
      const [query, setQuery] = useState('');
      useEffect(() => { setPos(slotFilter(target)); setQuery(''); }, [targetKey(target)]);
      const [byRating, setByRating] = useState(false);
      const ra = useMemo(ratingAverages, []);
      const q = query.trim();
      const avail = S_PLAYERS
        .filter(p => !board[p.id])
        .filter(p => pos === 'ALL' || p.position === pos)
        .filter(p => !q || (/^\d+$/.test(q) ? String(p.number) === q : normName(p.name).includes(normName(q))))
        .sort((a, b) => byRating ? (ra.avg[b.name] ?? -99) - (ra.avg[a.name] ?? -99) : a.number - b.number);

      return (
        <Sheet title={targetLabel(target)} onClose={onClose} scrollKey={targetKey(target)} pinned={<>
          {onSkip && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '-2px 0 10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12.5px', fontWeight: '600' }}>
                {picked} of 23 picked • moves to the next empty spot
              </span>
              <button onClick={onSkip} style={{ ...chipStyle(false), padding: '6px 12px', fontSize: '12.5px' }}>Skip ›</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or number"
              spellCheck={false}
              onBlur={unshiftAfterKeyboard}
              style={{
                flex: 1, minWidth: 0, padding: '11px 14px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: '#fff', fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
            <button onClick={() => setByRating(!byRating)} title="Sort order" style={{ ...chipStyle(byRating), borderRadius: '10px', padding: '0 12px' }}>
              {byRating ? 'Rating ↓' : 'No. ↑'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px', paddingBottom: '10px' }}>
            {['ALL', 'DEF', 'MID', 'RUCK', 'FWD'].map(k => (
              <button key={k} onClick={() => setPos(k)} style={{ ...chipStyle(pos === k), flex: 1, padding: '8px 0' }}>{k === 'ALL' ? 'All' : k}</button>
            ))}
          </div>
        </>}>
          {avail.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', textAlign: 'center', padding: '28px 10px' }}>
              {q ? `Nobody left matching “${q}”` : `No ${pos === 'ALL' ? '' : pos + ' '}players left to pick`}
              {pos !== 'ALL' && <div><button onClick={() => setPos('ALL')} style={{ ...chipStyle(true), marginTop: '12px' }}>Show everyone</button></div>}
            </div>
          )}
          {avail.map(p => (
            <button key={p.id} onClick={() => onPick(p.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
              padding: '10px 4px', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', textAlign: 'left',
            }}>
              <PlayerPhoto player={p} size={42} />
              <span style={{ fontFamily: OSWALD, fontSize: '22px', fontWeight: '600', minWidth: '28px', textAlign: 'center' }}>{numLabel(p)}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}{p.captain ? ' ©' : ''}
                </span>
                <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                  {p.position} • {p.height}cm • {calculateAge(p.dob)}y
                </span>
              </span>
              {ra.avg[p.name] !== undefined && (
                <span style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: '#60a5fa', fontSize: '14px', fontWeight: '800' }}>{ra.avg[p.name].toFixed(1)}</span>
                  <span style={{ display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: '700' }}>{ra.year === S_YEAR ? 'AVG' : `${ra.year} AVG`}</span>
                </span>
              )}
            </button>
          ))}
        </Sheet>
      );
    };

    const MobileTeam = ({ board, setBoard, votes, showToast }) => {
      const a = slotsFromBoard(board);
      const [picker, setPicker] = useState(null);
      const [detail, setDetail] = useState(null);
      const [moving, setMoving] = useState(null);

      const getT = (as, t) => t.bench !== undefined ? as.bench[t.bench] : as.slots[t.key];
      const setT = (as, t, id) => {
        if (t.bench !== undefined) as.bench[t.bench] = id || null;
        else if (id) as.slots[t.key] = id;
        else delete as.slots[t.key];
      };
      const draft = () => ({ slots: { ...a.slots }, bench: [...a.bench], extra: [...a.extra] });
      const commit = (next) => setBoard(prev => boardFromSlots(next, prev));

      const place = (t, id) => { const n = draft(); setT(n, t, id); commit(n); return n; };
      // Team-sheet order for filling: B, HB, C, HF, F, FOL, then interchange
      const ORDER = [...TEAM_SLOTS.map(s => ({ key: s.key })), ...[0, 1, 2, 3, 4].map(i => ({ bench: i }))];
      const nextEmpty = (as, after) => {
        const i = ORDER.findIndex(t => sameTarget(t, after));
        for (let k = 1; k < ORDER.length; k++) {
          const t = ORDER[(i + k) % ORDER.length];
          if (!getT(as, t)) return t;
        }
        return null;
      };
      const swap = (from, to) => { const n = draft(); const x = getT(n, from), y = getT(n, to); setT(n, to, x); setT(n, from, y); commit(n); };
      const remove = (t) => {
        const pl = playerById(getT(a, t));
        const before = board;
        const n = draft(); setT(n, t, null); commit(n);
        showToast(`${pl ? pl.name : 'Player'} removed`, () => setBoard(before));
      };
      const removeExtra = (id) => {
        const before = board;
        setBoard(prev => { const n = { ...prev }; delete n[id]; return n; });
        showToast(`${playerById(id).name} removed`, () => setBoard(before));
      };
      const clearAll = () => {
        const before = board;
        const n = Object.keys(before).length;
        if (!n) return;
        setBoard({});
        showToast(`Team cleared (${n} player${n === 1 ? '' : 's'})`, () => setBoard(before));
      };

      const tap = (t) => {
        if (moving) {
          if (!sameTarget(moving.target, t)) swap(moving.target, t);
          setMoving(null);
          return;
        }
        const id = getT(a, t);
        if (id) setDetail({ target: t, id }); else setPicker({ target: t, chain: true });
      };

      const fieldCount = TEAM_SLOTS.filter(s => a.slots[s.key]).length + a.extra.length;
      const benchCount = a.bench.filter(Boolean).length;
      const selected = S_PLAYERS.filter(p => board[p.id]);
      const { comp, warnings } = teamBalance(selected, fieldCount);
      const complete = fieldCount === 18 && benchCount === 5;
      const detailPlayer = detail && playerById(detail.id);

      const tile = (t, label) => {
        const pl = playerById(getT(a, t));
        return <SlotTile key={t.key || 'b' + t.bench} label={label} player={pl} onTap={() => tap(t)} highlight={moving && sameTarget(moving.target, t)} />;
      };
      const rowLabel = (txt) => (
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textAlign: 'center' }}>{txt}</span>
      );
      const grid = { display: 'grid', gridTemplateColumns: '34px repeat(3, minmax(0, 1fr))', gap: '7px', alignItems: 'center' };

      return (
        <div style={{ padding: '12px 14px 24px' }}>
          {/* Summary: counts, balance, warnings */}
          <GlassCard style={{ padding: '12px 14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {[['ON FIELD', fieldCount, 18], ['BENCH', benchCount, 5]].map(([l, v, max]) => (
                <div key={l}>
                  <div style={{ fontFamily: OSWALD, fontSize: '22px', fontWeight: '600', lineHeight: 1.1, color: v === max ? '#22c55e' : '#fff' }}>
                    {v}<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}>/{max}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: '700', letterSpacing: '1px' }}>{l}</div>
                </div>
              ))}
              <span style={{ flex: 1 }}></span>
              <button onClick={() => saveTeamSheet(board, true)} style={{ ...chipStyle(complete), padding: '9px 14px' }}>Share</button>
              <button onClick={clearAll} disabled={!selected.length} style={{
                ...chipStyle(false), padding: '9px 12px', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.3)', opacity: selected.length ? 1 : 0.35,
              }}>Clear</button>
            </div>
            {comp && (
              <div style={{ display: 'flex', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[['AVG AGE', comp.age.toFixed(1)], ['AVG HT', Math.round(comp.height)], ['TALLS', comp.talls], ['RUCKS', comp.rucks]].map(([l, v]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '700' }}>{v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8.5px', fontWeight: '700', letterSpacing: '0.8px', marginTop: '1px' }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
            {warnings.map(w => (
              <div key={w} style={{
                marginTop: '8px', padding: '7px 10px', borderRadius: '8px',
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                color: '#fbbf24', fontSize: '12px', fontWeight: '700',
              }}>{w}</div>
            ))}
          </GlassCard>

          {moving && (
            <div style={{
              position: 'sticky', top: 0, zIndex: 5, marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              background: 'rgba(29,78,216,0.95)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              color: '#fff', fontSize: '13.5px', fontWeight: '600',
            }}>
              <span style={{ flex: 1 }}>Tap where {surname(playerById(moving.id))} should go</span>
              <button onClick={() => setMoving(null)} style={{ ...chipStyle(true), padding: '7px 12px' }}>Cancel</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TEAM_LINES.map(line => (
              <div key={line.key} style={grid}>
                {rowLabel(line.short)}
                {line.slots.map(s => tile({ key: s.key }, s.pos))}
              </div>
            ))}
          </div>

          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', margin: '18px 0 8px' }}>INTERCHANGE</div>
          <div style={grid}>
            {rowLabel('I/C')}
            {[0, 1, 2].map(i => tile({ bench: i }, `IC${i + 1}`))}
            <span></span>
            {[3, 4].map(i => tile({ bench: i }, `IC${i + 1}`))}
          </div>

          {a.extra.length > 0 && (
            <div style={{ marginTop: '16px', color: 'rgba(255,255,255,0.55)', fontSize: '12.5px' }}>
              Also on the field from the desktop board:
              {a.extra.map(id => (
                <button key={id} onClick={() => removeExtra(id)} style={{ ...chipStyle(false), margin: '6px 6px 0 0' }}>
                  {playerById(id).name} ✕
                </button>
              ))}
            </div>
          )}

          {picker && (
            <PickerSheet
              target={picker.target}
              board={board}
              picked={selected.length}
              onClose={() => setPicker(null)}
              onSkip={picker.chain ? () => {
                const nxt = nextEmpty(a, picker.target);
                setPicker(nxt && !sameTarget(nxt, picker.target) ? { target: nxt, chain: true } : null);
              } : null}
              onPick={(id) => {
                const n = place(picker.target, id);
                const nxt = picker.chain ? nextEmpty(n, picker.target) : null;
                setPicker(nxt ? { target: nxt, chain: true } : null);
              }}
            />
          )}

          {detailPlayer && (
            <Sheet title={targetLabel(detail.target)} onClose={() => setDetail(null)}>
              <PlayerSummary player={detailPlayer} votes={votes} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '18px' }}>
                {[
                  ['Move', () => { setMoving({ target: detail.target, id: detail.id }); setDetail(null); }, false],
                  ['Change', () => { setPicker({ target: detail.target, chain: false }); setDetail(null); }, false],
                  ['Remove', () => { remove(detail.target); setDetail(null); }, true],
                ].map(([label, fn, red]) => (
                  <button key={label} onClick={fn} style={{
                    padding: '13px 6px', borderRadius: '11px', cursor: 'pointer',
                    background: red ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${red ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.14)'}`,
                    color: red ? '#f87171' : '#fff', fontSize: '14px', fontWeight: '700',
                  }}>{label}</button>
                ))}
              </div>
            </Sheet>
          )}
        </div>
      );
    };

    const MobileVotes = ({ votes, setVotes, ratings }) => {
      const playable = S_FIXTURE.filter(g => g.opponent !== 'BYE');
      const playedIn = (r) => Object.entries(ratings[r] || {})
        .filter(([, d]) => d && d.rating !== null && d.rating !== undefined)
        .map(([id, d]) => ({ player: playerById(+id), rating: d.rating, tog: d.tog }))
        .filter(x => x.player)
        .sort((x, y) => y.rating - x.rating);
      const scoredIn = (r) => S_PLAYERS.filter(p => votes[p.id]?.[r] !== undefined && votes[p.id]?.[r] !== null).length;

      // Opens on the latest round with ratings: the one you most likely want to vote on
      const [round, setRound] = useState(() => {
        const rated = playable.filter(g => playedIn(g.round).length > 0);
        return (rated[rated.length - 1] || playable[0] || {}).round;
      });
      const [view, setView] = useState('vote');
      const [showAll, setShowAll] = useState(false);
      const rowRefs = useRef({});

      if (!playable.length) return <div style={{ padding: '14px' }}><EmptySeasonCard what="BEST & FAIREST" /></div>;

      const idx = playable.findIndex(g => g.round === round);
      const game = playable[idx];
      const res = S_RESULTS[round];
      const played = playedIn(round);
      const playedIds = new Set(played.map(x => x.player.id));
      const others = S_PLAYERS.filter(p => !playedIds.has(p.id)).sort((a, b) => a.number - b.number).map(p => ({ player: p }));
      const list = played.length ? (showAll ? [...played, ...others] : played) : others;
      const scored = scoredIn(round);
      const target = played.length || null;

      const setScore = (pid, s) => {
        const off = votes[pid]?.[round] === s;
        setVotes(prev => ({ ...prev, [pid]: { ...prev[pid], [round]: off ? undefined : s } }));
        if (navigator.vibrate) navigator.vibrate(8);
        if (off) return;
        const at = list.findIndex(x => x.player.id === pid);
        const next = list.slice(at + 1).find(x => votes[x.player.id]?.[round] === undefined || votes[x.player.id]?.[round] === null);
        if (next) setTimeout(() => {
          const el = rowRefs.current[next.player.id];
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      };

      const roundStatus = (r) => {
        const n = playedIn(r).length, s = scoredIn(r);
        return !n ? '' : s >= n ? '  ✓' : s ? `  (${n - s} left)` : '';
      };
      const arrow = (d) => {
        const off = idx + d < 0 || idx + d >= playable.length;
        return (
          <button onClick={() => !off && setRound(playable[idx + d].round)} disabled={off} style={{
            width: '44px', flexShrink: 0, borderRadius: '11px', fontSize: '20px', fontWeight: '700',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', opacity: off ? 0.25 : 1, cursor: 'pointer',
          }}>{d < 0 ? '‹' : '›'}</button>
        );
      };

      // Leaderboard (same tie-aware ranking as the desktop)
      const totals = S_PLAYERS.map(p => {
        const vs = Object.values(votes[p.id] || {}).filter(v => v !== undefined && v !== null);
        return { player: p, total: vs.reduce((s, v) => s + v, 0), games: vs.length };
      }).filter(x => x.games > 0).sort((a, b) => b.total - a.total);

      return (
        <div style={{ padding: '12px 14px 24px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
            {[['vote', 'Vote'], ['board', 'Leaderboard']].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} style={{ ...chipStyle(view === k), flex: 1, padding: '10px' }}>{l}</button>
            ))}
          </div>

          {view === 'board' ? (
            totals.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', padding: '40px 10px' }}>No votes yet</div>
            ) : totals.map((x, i) => {
              const rank = totals.findIndex(y => y.total === x.total) + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
              return (
                <div key={x.player.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ width: '26px', textAlign: 'center', color: rank <= 3 ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontSize: medal ? '17px' : '14px', fontWeight: '800' }}>{medal || rank}</span>
                  <PlayerPhoto player={x.player} size={38} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', color: '#fff', fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.player.name}</span>
                    <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{x.games} gm • {(x.total / x.games).toFixed(2)} avg</span>
                  </span>
                  <span style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', color: '#fff',
                    padding: '6px 13px', borderRadius: '10px', fontSize: '17px', fontWeight: '800',
                  }}>{x.total}</span>
                </div>
              );
            })
          ) : (
            <>
              <div style={{
                position: 'sticky', top: 0, zIndex: 3, margin: '0 -14px', padding: '8px 14px 6px',
                background: '#08111f', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {arrow(-1)}
                <select value={round} onChange={(e) => setRound(e.target.value)} style={{
                  flex: 1, minWidth: 0, padding: '12px', borderRadius: '11px',
                  background: CARLTON_NAVY, color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
                }}>
                  {playable.map(g => (
                    <option key={g.round} value={g.round}>{g.round} {g.home ? 'vs' : '@'} {g.opponent}{roundStatus(g.round)}</option>
                  ))}
                </select>
                {arrow(1)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontSize: '12.5px' }}>
                {res && (
                  <span style={{ fontWeight: '800', color: res.result === 'W' ? '#22c55e' : res.result === 'D' ? '#fbbf24' : '#f87171' }}>
                    {res.result} {res.for}–{res.against}
                  </span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.45)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game && game.venue}</span>
                <span style={{ fontWeight: '700', color: target && scored >= target ? '#22c55e' : 'rgba(255,255,255,0.7)' }}>
                  {scored}{target ? `/${target}` : ''} voted
                </span>
              </div>
              {target && (
                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.07)', marginBottom: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (scored / target) * 100)}%`, background: scored >= target ? '#22c55e' : '#60a5fa', transition: 'width 0.25s ease' }}></div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.35)', fontSize: '10.5px', fontWeight: '600', marginBottom: '4px' }}>
                {['0 Bad', '1 OK', '2 Good', '3 V.Good', '4 Great'].map(l => <span key={l}>{l}</span>)}
              </div>
              </div>
              {!played.length && (
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12.5px', padding: '8px 0' }}>
                  No Wheelo ratings for {round} yet, so everyone's listed.
                </div>
              )}

              {list.map(({ player: p, rating, tog }) => {
                const score = votes[p.id]?.[round];
                return (
                  <div key={p.id} ref={el => { rowRefs.current[p.id] = el; }} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                      <PlayerPhoto player={p} size={36} />
                      <span style={{ fontFamily: OSWALD, fontSize: '20px', fontWeight: '600', minWidth: '26px', textAlign: 'center', color: '#fff' }}>{numLabel(p)}</span>
                      <span style={{ flex: 1, minWidth: 0, color: '#fff', fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      {rating !== undefined && (
                        <span style={{
                          background: rating >= 15 ? 'rgba(34,197,94,0.22)' : rating >= 8 ? 'rgba(251,191,36,0.22)' : 'rgba(255,255,255,0.08)',
                          color: rating >= 15 ? '#22c55e' : rating >= 8 ? '#fbbf24' : 'rgba(255,255,255,0.55)',
                          fontSize: '12px', fontWeight: '800', padding: '3px 7px', borderRadius: '6px',
                        }}>{rating.toFixed(1)}</span>
                      )}
                      {tog ? <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', minWidth: '30px', textAlign: 'right' }}>{Math.round(tog)}%</span> : null}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                      {[0, 1, 2, 3, 4].map(s => (
                        <button key={s} onClick={() => setScore(p.id, s)} style={{
                          height: '44px', borderRadius: '10px', cursor: 'pointer',
                          background: score === s ? scoreColors[s].bg : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${score === s ? scoreColors[s].border : 'rgba(255,255,255,0.08)'}`,
                          color: score === s ? scoreColors[s].text : 'rgba(255,255,255,0.4)',
                          fontSize: '17px', fontWeight: '800',
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {played.length > 0 && (
                <button onClick={() => setShowAll(!showAll)} style={{ ...chipStyle(false), width: '100%', marginTop: '14px', padding: '12px' }}>
                  {showAll ? 'Hide players who didn’t play' : `Show the other ${others.length} players`}
                </button>
              )}
            </>
          )}
        </div>
      );
    };

    function MobileApp({ onSeason }) {
      const [tab, setTab] = useState(() => { try { return localStorage.getItem('carlton-mobile-tab') || 'team'; } catch { return 'team'; } });
      const [board, setBoard] = useState(() => loadJSON(`carlton-board-${S_YEAR}`));
      const [votes, setVotes] = useState(() => loadJSON(`carlton-bf-${S_YEAR}`));
      const [ratings, setRatings] = useState(loadRatings);
      const [menu, setMenu] = useState(false);
      const fileRef = useRef(null);
      const { toast, showToast, runUndo } = useUndoToast();
      const sync = useVoteSync(votes, setVotes);
      const [syncOpen, setSyncOpen] = useState(false);

      useEffect(() => { try { localStorage.setItem('carlton-mobile-tab', tab); } catch {} }, [tab]);
      useEffect(() => { try { localStorage.setItem(`carlton-board-${S_YEAR}`, JSON.stringify(board)); } catch {} }, [board]);
      useEffect(() => { try { localStorage.setItem(`carlton-bf-${S_YEAR}`, JSON.stringify(votes)); } catch {} }, [votes]);
      useEffect(() => { try { localStorage.setItem(`carlton-wheelo-${S_YEAR}`, JSON.stringify(ratings)); } catch {} }, [ratings]);

      const copyText = async () => {
        const text = teamText(board);
        try { await navigator.clipboard.writeText(text); showToast('Team copied'); return; } catch {}
        if (navigator.share) { try { await navigator.share({ text }); return; } catch {} }
        window.prompt('Copy your team:', text);
      };

      const menuItem = (label, sub, fn) => (
        <button key={label} onClick={() => { setMenu(false); fn(); }} style={{
          width: '100%', textAlign: 'left', padding: '14px 4px', background: 'transparent', border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer',
        }}>
          <span style={{ display: 'block', fontSize: '16px', fontWeight: '700' }}>{label}</span>
          <span style={{ display: 'block', fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{sub}</span>
        </button>
      );

      const tabs = [
        ['team', 'Best 23', 'M7 3 3 6l2 4 2-1v11h10V9l2 1 2-4-4-3c-.6 1.5-2.6 2.6-5 2.6S7.6 4.5 7 3z'],
        ['bf', 'B&F votes', 'M8 2h8l-2.5 6.5h-3zM12 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12z'],
      ];

      // The shell is exactly the viewport. Don't make it taller to cover iOS 26's home-screen strip:
      // iPhones then shift the page and taps land above the finger (28 Oct 2026). The strip shows
      // the page's navy base colour (see the HTML) instead.
      return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px',
            padding: 'calc(env(safe-area-inset-top) + 10px) 14px 10px',
            background: 'rgba(6,13,26,0.88)', borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ color: '#fff', fontWeight: '900', fontSize: '16px', letterSpacing: '3px' }}>CARLTON</span>
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              {Object.keys(SEASONS).map(y => (
                <button key={y} onClick={() => onSeason && onSeason(y)} style={{ ...chipStyle(String(S_YEAR) === y), padding: '6px 11px' }}>{y}</button>
              ))}
            </span>
            <span style={{ flex: 1 }}></span>
            <button onClick={() => setSyncOpen(true)} aria-label={syncLabel(sync.status)} style={{
              position: 'relative', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M7 18h10.5a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.34 9.1 4.5 4.5 0 0 0 7 18z" />
              </svg>
              {sync.status && (
                <span style={{
                  position: 'absolute', right: '6px', bottom: '6px', width: '9px', height: '9px', borderRadius: '50%',
                  background: syncColor(sync.status), border: '2px solid #0b1424',
                }}></span>
              )}
            </button>
            <button onClick={() => setMenu(true)} aria-label="More" style={{
              width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '20px', fontWeight: '800', lineHeight: 1,
            }}>⋯</button>
          </div>

          {/* Both tabs stay mounted, each with its own scroll area, so switching keeps your place */}
          {[['team', <MobileTeam board={board} setBoard={setBoard} votes={votes} showToast={showToast} />],
            ['bf', <MobileVotes votes={votes} setVotes={setVotes} ratings={ratings} />]].map(([k, el]) => (
            <div key={k} style={{
              flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch',
              display: tab === k ? 'block' : 'none',
            }}>
              {el}
            </div>
          ))}

          <div style={{
            flexShrink: 0, display: 'flex',
            background: 'rgba(6,13,26,0.94)', borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {tabs.map(([k, label, d]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                flex: 1, padding: '9px 0 8px', background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                color: tab === k ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '700',
                borderTop: `2px solid ${tab === k ? '#fff' : 'transparent'}`,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d={d} /></svg>
                {label}
              </button>
            ))}
          </div>

          {toast && (
            <div style={{
              position: 'fixed', left: '12px', right: '12px', bottom: 'calc(env(safe-area-inset-bottom) + 74px)', zIndex: 3500,
              display: 'flex', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <ToastPill toast={toast} onUndo={runUndo} />
            </div>
          )}

          {menu && (
            <Sheet title="More" onClose={() => setMenu(false)}>
              {menuItem('Sync votes', sync.status ? `${syncLabel(sync.status)} • last ${ago(sync.status.last)}` : 'Keep votes the same on your phone and computer', () => setSyncOpen(true))}
              {menuItem('Share team sheet', 'Image of your best 23 for messages or socials', () => saveTeamSheet(board, true))}
              {menuItem('Copy team as text', 'B: … HB: … for pasting into a chat', copyText)}
              {menuItem('Back up', 'Download all votes and teams (every season) as a file', () => downloadBackup({ votes, ratings, board }))}
              {menuItem('Restore from backup', 'Load a backup file, e.g. one made on your computer', () => fileRef.current && fileRef.current.click())}
              {menuItem('Desktop view', 'The full magnet board, stats, H2H and fixture', () => {
                try { localStorage.setItem('carlton-view', 'desktop'); } catch {}
                location.reload();
              })}
            </Sheet>
          )}
          {syncOpen && (
            <Sheet title="Sync votes" onClose={() => setSyncOpen(false)}>
              <SyncPanel sync={sync} />
            </Sheet>
          )}
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
            onChange={(e) => restoreBackupFile(e, (d) => {
              if (d.votes) setVotes(d.votes);
              if (d.ratings) setRatings(d.ratings);
              if (d.board) setBoard(d.board);
            })} />
        </div>
      );
    }

    function Root() {
      const [year, setYear] = useState(() => {
        try { return localStorage.getItem('carlton-season') || '2027'; } catch { return '2027'; }
      });
      applySeason(year);
      const switchSeason = (y) => {
        try { localStorage.setItem('carlton-season', y); } catch {}
        setYear(y);
      };
      return window.CARLTON_MOBILE
        ? <MobileApp key={year} onSeason={switchSeason} />
        : <App key={year} onSeason={switchSeason} />;
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<Root />);