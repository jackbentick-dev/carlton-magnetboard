// ============================================================
// carlton-magnetboard: APP (compiled from app.src.jsx — edit the
// .jsx and recompile with Babel rather than editing this file)
// ============================================================
const {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo
} = React;
const calculateAge = dob => {
  const birth = new Date(dob);
  const today = new Date('2026-01-31');
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) age--;
  return age;
};

// Carlton color palette
const CARLTON_NAVY = '#0d1c36';
const CARLTON_NAVY_LIGHT = '#162850';
const CARLTON_NAVY_DARK = '#060d1a';
const posColors = {
  DEF: {
    bg: '#0f766e',
    light: '#14b8a6',
    glow: 'rgba(20,184,166,0.4)'
  },
  MID: {
    bg: '#1d4ed8',
    light: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)'
  },
  RUCK: {
    bg: '#7c3aed',
    light: '#a78bfa',
    glow: 'rgba(167,139,250,0.4)'
  },
  FWD: {
    bg: '#dc2626',
    light: '#f87171',
    glow: 'rgba(248,113,113,0.4)'
  }
};
const scoreColors = {
  0: {
    bg: 'rgba(239,68,68,0.2)',
    text: '#f87171',
    border: 'rgba(239,68,68,0.4)'
  },
  1: {
    bg: 'rgba(251,191,36,0.1)',
    text: '#fbbf24',
    border: 'rgba(251,191,36,0.3)'
  },
  2: {
    bg: 'rgba(251,191,36,0.2)',
    text: '#fbbf24',
    border: 'rgba(251,191,36,0.4)'
  },
  3: {
    bg: 'rgba(34,197,94,0.2)',
    text: '#22c55e',
    border: 'rgba(34,197,94,0.4)'
  },
  4: {
    bg: 'rgba(59,130,246,0.25)',
    text: '#60a5fa',
    border: 'rgba(59,130,246,0.5)'
  }
};

// Real club logos (Squiggle-hosted), falling back to two-tone circle offline
const ClubLogo = ({
  team,
  size = 24
}) => {
  const [err, setErr] = useState(false);
  const club = AFL_CLUBS[team];
  if (!club) return null;
  const file = CLUB_LOGO_FILES[team];
  if (err || !file) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${club.primary} 0%, ${club.primary} 50%, ${club.secondary} 50%, ${club.secondary} 100%)`,
        border: '2px solid rgba(255,255,255,0.2)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.32,
        fontWeight: '800',
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }
    }, club.abbr.charAt(0));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `https://squiggle.com.au/wp-content/themes/squiggle/assets/images/${file}.png`,
    alt: team,
    onError: () => setErr(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }
  }));
};
const PHOTO_EXTS = ['png', 'jpg', 'webp'];
const PlayerPhoto = ({
  player,
  size = 36
}) => {
  const [srcIdx, setSrcIdx] = useState(0);
  const sources = PHOTO_EXTS.map(ext => `players/${player.number}.${ext}`);
  if (PLAYER_PHOTOS[player.number]) sources.push(PLAYER_PHOTOS[player.number]);
  if (srcIdx >= sources.length) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size * 0.44,
        fontWeight: '600',
        fontFamily: "'Oswald', 'Inter', sans-serif",
        boxShadow: `0 2px 8px rgba(13,28,54,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
        border: '2px solid rgba(255,255,255,0.2)',
        flexShrink: 0
      }
    }, player.number);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
      boxShadow: `0 2px 8px rgba(13,28,54,0.5)`,
      border: '2px solid rgba(255,255,255,0.2)',
      flexShrink: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: sources[srcIdx],
    alt: player.name,
    onError: () => setSrcIdx(i2 => i2 + 1),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }));
};

// Player Number Badge Component (simplified, always shows number)
const PlayerBadge = ({
  player,
  size = 36
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
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
      flexShrink: 0
    }
  }, player.number);
};

// Glass Card Component
const GlassCard = ({
  children,
  style,
  ...props
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
    ...style
  },
  ...props
}, children);

// Fixture Panel
const FixturePanel = ({
  results,
  onSync,
  syncState
}) => {
  const res = results || {};
  const isPlayed = g => g.played || !!res[g.round];
  const nextRound = (FIXTURE_2026.find(g => !isPlayed(g) && g.opponent !== 'BYE') || {}).round;
  const wins = Object.values(res).filter(r => r.result === 'W').length;
  const losses = Object.values(res).filter(r => r.result === 'L').length;
  const draws = Object.values(res).filter(r => r.result === 'D').length;
  return /*#__PURE__*/React.createElement(GlassCard, {
    style: {
      padding: '18px',
      maxHeight: 'calc(100vh - 200px)',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '3px',
      height: '14px',
      background: 'linear-gradient(180deg, #60a5fa, #1d4ed8)',
      borderRadius: '2px',
      display: 'inline-block'
    }
  }), "2026 FIXTURE", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.45)',
      fontWeight: '700',
      letterSpacing: '1px'
    }
  }, wins, "–", losses, draws ? `–${draws}` : '')), /*#__PURE__*/React.createElement("button", {
    onClick: onSync,
    disabled: syncState === 'syncing',
    style: {
      background: syncState === 'ok' ? 'rgba(34,197,94,0.15)' : syncState === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: '9px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      color: syncState === 'ok' ? '#22c55e' : syncState === 'fail' ? '#f87171' : 'rgba(255,255,255,0.55)',
      cursor: syncState === 'syncing' ? 'wait' : 'pointer'
    }
  }, syncState === 'syncing' ? 'SYNCING…' : syncState === 'ok' ? '✓ UPDATED' : syncState === 'fail' ? '✗ OFFLINE' : '⟳ SYNC')), FIXTURE_2026.map((game, i) => {
    const isNext = game.round === nextRound;
    const played = isPlayed(game);
    const r = res[game.round];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: isNext ? '12px' : '12px 4px',
        margin: isNext ? '6px 0' : 0,
        borderRadius: isNext ? '12px' : 0,
        background: isNext ? 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 100%)' : 'transparent',
        border: isNext ? '1px solid rgba(96,165,250,0.35)' : 'none',
        borderBottom: isNext ? '1px solid rgba(96,165,250,0.35)' : i < FIXTURE_2026.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        transition: 'background 0.15s ease',
        opacity: played && !isNext ? 0.55 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: played ? 'rgba(255,255,255,0.12)' : game.opponent === 'BYE' ? 'rgba(255,255,255,0.08)' : game.home ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.08)',
        color: played ? 'rgba(255,255,255,0.5)' : '#fff',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px',
        letterSpacing: '0.5px',
        textDecoration: 'none'
      }
    }, game.round), isNext && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
        color: '#fff',
        fontSize: '9px',
        fontWeight: '800',
        padding: '4px 9px',
        borderRadius: '5px',
        letterSpacing: '1.5px',
        boxShadow: '0 2px 8px rgba(59,130,246,0.4)'
      }
    }, "NEXT UP"), r ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '0.5px',
        color: r.result === 'W' ? '#22c55e' : r.result === 'D' ? '#fbbf24' : '#f87171'
      }
    }, r.result, " ", r.for, "–", r.against) : played ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '10px',
        color: 'rgba(255,255,255,0.35)',
        fontWeight: '600',
        fontStyle: 'italic'
      }
    }, "Played") : null, game.tag && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)',
        color: '#fbbf24',
        fontSize: '10px',
        fontWeight: '600',
        padding: '4px 8px',
        borderRadius: '4px'
      }
    }, game.tag)), game.opponent === 'BYE' ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: '14px',
        fontStyle: 'italic',
        paddingLeft: '2px'
      }
    }, "Bye Week") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement(ClubLogo, {
      team: game.opponent,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#fff',
        fontSize: '15px',
        fontWeight: '700',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: game.home ? '#22c55e' : '#f59e0b',
        fontWeight: '600'
      }
    }, game.home ? 'vs' : '@'), " ", game.opponent), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px'
      }
    }, game.date, " • ", game.time), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: '11px'
      }
    }, game.venue))));
  }));
};

// B&F race chart — cumulative votes per round, top 5
const RACE_COLORS = ['#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#c084fc'];
const RaceChart = ({
  votes,
  playableRounds,
  playerTotals
}) => {
  const roundsWithVotes = playableRounds.map(g => g.round).filter(r => CARLTON_PLAYERS.some(pl => {
    const v = votes[pl.id]?.[r];
    return v !== undefined && v !== null;
  }));
  if (roundsWithVotes.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px',
        textAlign: 'center',
        padding: '40px 20px'
      }
    }, "No votes recorded yet — the race chart builds as you vote each round.");
  }
  const top5 = playerTotals.filter(pl => pl.games > 0).slice(0, 5);
  const series = top5.map((pl, i) => {
    let c = 0;
    const pts = roundsWithVotes.map(r => {
      const v = votes[pl.id]?.[r];
      if (v !== undefined && v !== null) c += v;
      return c;
    });
    return {
      player: pl,
      pts,
      color: RACE_COLORS[i % RACE_COLORS.length]
    };
  });
  const maxY = Math.max(1, ...series.map(sr => sr.pts[sr.pts.length - 1]));
  const CW = 380,
    CH = 250,
    L = 34,
    R = 12,
    T = 14,
    B = 34;
  const xFor = i => roundsWithVotes.length === 1 ? L + (CW - L - R) / 2 : L + i / (roundsWithVotes.length - 1) * (CW - L - R);
  const yFor = v => T + (1 - v / maxY) * (CH - T - B);
  const labelEvery = Math.max(1, Math.ceil(roundsWithVotes.length / 8));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${CW} ${CH}`,
    style: {
      width: '100%'
    }
  }, [0.25, 0.5, 0.75, 1].map(f => /*#__PURE__*/React.createElement("g", {
    key: f
  }, /*#__PURE__*/React.createElement("line", {
    x1: L,
    y1: yFor(maxY * f),
    x2: CW - R,
    y2: yFor(maxY * f),
    stroke: "rgba(255,255,255,0.07)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: L - 5,
    y: yFor(maxY * f) + 3,
    textAnchor: "end",
    fill: "rgba(255,255,255,0.35)",
    fontSize: "8",
    fontFamily: "Inter"
  }, Math.round(maxY * f)))), roundsWithVotes.map((r, i) => i % labelEvery === 0 ? /*#__PURE__*/React.createElement("text", {
    key: r,
    x: xFor(i),
    y: CH - B + 14,
    textAnchor: "middle",
    fill: "rgba(255,255,255,0.35)",
    fontSize: "8",
    fontFamily: "Inter"
  }, r) : null), series.map(sr => /*#__PURE__*/React.createElement("g", {
    key: sr.player.id
  }, /*#__PURE__*/React.createElement("polyline", {
    points: sr.pts.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' '),
    fill: "none",
    stroke: sr.color,
    strokeWidth: "2",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: xFor(sr.pts.length - 1),
    cy: yFor(sr.pts[sr.pts.length - 1]),
    r: "3",
    fill: sr.color
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 2px 10px'
    }
  }, series.map(sr => /*#__PURE__*/React.createElement("div", {
    key: sr.player.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '5px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '10px',
      height: '10px',
      borderRadius: '3px',
      background: sr.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontSize: '12px',
      fontWeight: '600',
      flex: 1
    }
  }, sr.player.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: sr.color,
      fontSize: '13px',
      fontWeight: '800'
    }
  }, sr.pts[sr.pts.length - 1])))));
};

// B&F Panel
const BFPanel = ({
  votes,
  setVotes,
  selectedRound,
  setSelectedRound,
  view,
  setView,
  ratings,
  setRatings
}) => {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const playableRounds = FIXTURE_2026.filter(g => g.opponent !== 'BYE');
  const currentGame = playableRounds.find(g => g.round === selectedRound) || playableRounds[0];
  const playerTotals = CARLTON_PLAYERS.map(player => {
    const roundVotes = votes[player.id] || {};
    // Only count rounds where score is explicitly set (not undefined) — blank = DNP
    const playedEntries = Object.entries(roundVotes).filter(([_, v]) => v !== undefined && v !== null);
    const total = playedEntries.reduce((sum, [_, v]) => sum + v, 0);
    const games = playedEntries.length;
    return {
      ...player,
      total,
      games
    };
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
          if (el && el.scrollIntoView) el.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
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
        const lastName = playerName.split(' ').pop().toLowerCase();
        const player = CARLTON_PLAYERS.find(p => p.name.toLowerCase().includes(lastName) || p.name.split(' ').pop().toLowerCase() === lastName);
        if (player) {
          newRatings[player.id] = {
            rating,
            tog
          };
        }
      }
    });
    if (Object.keys(newRatings).length > 0) {
      setRatings(prev => ({
        ...prev,
        [selectedRound]: newRatings
      }));
      setShowImport(false);
      setImportText('');
    }
  };
  const getPlayerStats = playerId => ratings[selectedRound]?.[playerId];
  const hasRatings = ratings[selectedRound] && Object.keys(ratings[selectedRound]).length > 0;
  const voteList = [...CARLTON_PLAYERS].sort((a, b) => {
    const statsA = getPlayerStats(a.id);
    const statsB = getPlayerStats(b.id);
    if (statsA?.rating !== undefined && statsB?.rating !== undefined) return statsB.rating - statsA.rating;
    if (statsA?.rating !== undefined) return -1;
    if (statsB?.rating !== undefined) return 1;
    return a.number - b.number;
  });
  const voteRowRefs = useRef({});
  const scoredCount = CARLTON_PLAYERS.filter(p2 => {
    const v = votes[p2.id]?.[selectedRound];
    return v !== undefined && v !== null;
  }).length;
  const playedCount = ratings[selectedRound] ? Object.values(ratings[selectedRound]).filter(r2 => r2 && r2.rating !== null && r2.rating !== undefined).length : 0;
  return /*#__PURE__*/React.createElement(GlassCard, {
    style: {
      padding: '16px',
      maxHeight: 'calc(100vh - 200px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontSize: '11px',
      fontWeight: '800',
      letterSpacing: '2px',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '3px',
      height: '14px',
      background: 'linear-gradient(180deg, #fbbf24, #b45309)',
      borderRadius: '2px',
      display: 'inline-block'
    }
  }), " BEST & FAIREST"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowImport(!showImport),
    style: {
      background: hasRatings ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)' : 'rgba(255,255,255,0.08)',
      border: hasRatings ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '6px',
      padding: '4px 8px',
      fontSize: '9px',
      color: hasRatings ? '#22c55e' : 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      fontWeight: '700',
      transition: 'all 0.15s ease'
    }
  }, hasRatings ? '✓ Wheelo' : '+ Wheelo')), showImport && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '12px',
      border: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#fff',
      marginBottom: '8px',
      fontWeight: '700'
    }
  }, "Import Wheelo Ratings for ", selectedRound), /*#__PURE__*/React.createElement("textarea", {
    value: importText,
    onChange: e => setImportText(e.target.value),
    placeholder: "Paste: Name, Team, Rating, TOG...",
    style: {
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
      fontFamily: 'Inter, sans-serif'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: parseRatings,
    style: {
      flex: 1,
      padding: '8px',
      background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '10px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'transform 0.1s ease'
    }
  }, "Import"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowImport(false);
      setImportText('');
    },
    style: {
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.6)',
      border: 'none',
      borderRadius: '8px',
      fontSize: '10px',
      cursor: 'pointer'
    }
  }, "Cancel"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      marginBottom: '12px'
    }
  }, ['vote', 'leaderboard', 'race'].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setView(v),
    style: {
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
      transition: 'all 0.15s ease'
    }
  }, v === 'vote' ? 'Vote' : v === 'leaderboard' ? 'Leaderboard' : 'Race'))), view === 'race' ? /*#__PURE__*/React.createElement(RaceChart, {
    votes: votes,
    playableRounds: playableRounds,
    playerTotals: playerTotals
  }) : view === 'vote' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("select", {
    value: selectedRound,
    onChange: e => setSelectedRound(e.target.value),
    style: {
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
      fontWeight: '600'
    }
  }, playableRounds.map(game => /*#__PURE__*/React.createElement("option", {
    key: game.round,
    value: game.round
  }, game.round, ": ", game.home ? 'vs' : '@', " ", game.opponent))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      marginBottom: '8px',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.4)',
      fontWeight: '600'
    }
  }, ['0=Bad', '1=OK', '2=Good', '3=V.Good', '4=Great'].map(l => /*#__PURE__*/React.createElement("span", {
    key: l
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      padding: '0 2px',
      fontSize: '11px',
      fontWeight: '700'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: scoredCount > 0 ? '#22c55e' : 'rgba(255,255,255,0.35)'
    }
  }, scoredCount, " scored", playedCount > 0 ? ` of ${playedCount} played` : ''), playedCount > 0 && scoredCount < playedCount && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fbbf24',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#fbbf24',
      display: 'inline-block'
    }
  }), playedCount - scoredCount, " to go")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, voteList.map(player => {
    const score = votes[player.id]?.[selectedRound];
    const stats = getPlayerStats(player.id);
    return /*#__PURE__*/React.createElement("div", {
      key: player.id,
      ref: el => {
        voteRowRefs.current[player.id] = el;
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }
    }, /*#__PURE__*/React.createElement(PlayerPhoto, {
      player: player,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff',
        fontSize: '13px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, player.name), stats?.rating !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        background: stats.rating >= 15 ? 'rgba(34,197,94,0.25)' : stats.rating >= 8 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.1)',
        color: stats.rating >= 15 ? '#22c55e' : stats.rating >= 8 ? '#fbbf24' : 'rgba(255,255,255,0.5)',
        fontSize: '9px',
        fontWeight: '700',
        padding: '2px 5px',
        borderRadius: '4px'
      }
    }, stats.rating.toFixed(1)), stats?.tog && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: '8px'
      }
    }, Math.round(stats.tog), "%"))), stats?.rating != null && (score === undefined || score === null) && /*#__PURE__*/React.createElement("span", {
      title: "Played this round — no vote yet",
      style: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#fbbf24',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '4px'
      }
    }, [0, 1, 2, 3, 4].map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => setScore(player.id, s),
      style: {
        width: '28px',
        height: '28px',
        background: score === s ? scoreColors[s].bg : 'rgba(255,255,255,0.03)',
        color: score === s ? scoreColors[s].text : 'rgba(255,255,255,0.25)',
        border: `1px solid ${score === s ? scoreColors[s].border : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.1s ease'
      }
    }, s))));
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, (() => {
    const ranked = playerTotals.filter(p => p.games > 0);
    const ranks = ranked.map((player, i) => {
      if (i === 0) return 1;
      return ranked[i].total === ranked[i - 1].total ? null // will be filled below
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
      const avgRating = ratingEntries.length > 0 ? ratingEntries.reduce((s, d) => s + d.rating, 0) / ratingEntries.length : null;
      const avgTog = ratingEntries.length > 0 ? ratingEntries.reduce((s, d) => s + d.tog, 0) / ratingEntries.length : null;
      return /*#__PURE__*/React.createElement("div", {
        key: player.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.03)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: '24px',
          color: rank <= 3 ? '#fbbf24' : 'rgba(255,255,255,0.35)',
          fontSize: medal ? '14px' : '13px',
          fontWeight: '800',
          textAlign: 'center'
        }
      }, medal || rank), /*#__PURE__*/React.createElement(PlayerPhoto, {
        player: player,
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#fff',
          fontSize: '14px',
          fontWeight: '700'
        }
      }, player.name), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '11px'
        }
      }, player.games, " gm • ", player.games > 0 ? (player.total / player.games).toFixed(2) : '0', " avg", avgRating !== null ? ` • ${avgRating.toFixed(1)} rtg` : '', avgTog !== null ? ` • ${Math.round(avgTog)}% TOG` : '')), /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          padding: '6px 14px',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: '800',
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
        }
      }, player.total));
    });
  })(), playerTotals.filter(p => p.games > 0).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: '12px',
      textAlign: 'center',
      padding: '40px 20px'
    }
  }, "No votes recorded yet")));
};

// History Panel Component
const HistoryPanel = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const years = Object.keys(BF_HISTORY).map(Number).sort((a, b) => b - a);
  const data = (BF_HISTORY[selectedYear] || []).slice().sort((a, b) => b.total - a.total);
  return /*#__PURE__*/React.createElement(GlassCard, {
    style: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontSize: '15px',
      fontWeight: '800',
      marginBottom: '10px'
    }
  }, "B&F History"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '4px',
      flexWrap: 'wrap'
    }
  }, years.map(y => /*#__PURE__*/React.createElement("button", {
    key: y,
    onClick: () => setSelectedYear(y),
    style: {
      padding: '5px 10px',
      background: selectedYear === y ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.05)',
      color: selectedYear === y ? CARLTON_NAVY : 'rgba(255,255,255,0.4)',
      border: selectedYear === y ? 'none' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '700',
      cursor: 'pointer'
    }
  }, y)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '8px 16px'
    }
  }, data.map((player, i) => {
    const rank = (() => {
      const firstIdx = data.findIndex(p => p.total === player.total);
      return firstIdx + 1;
    })();
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
    const maxTotal = data[0]?.total || 1;
    return /*#__PURE__*/React.createElement("div", {
      key: player.name,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '22px',
        textAlign: 'center',
        color: rank <= 3 ? '#fbbf24' : 'rgba(255,255,255,0.35)',
        fontSize: medal ? '13px' : '11px',
        fontWeight: '800'
      }
    }, medal || rank), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600'
      }
    }, player.name), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '3px',
        borderRadius: '2px',
        marginTop: '3px',
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        borderRadius: '2px',
        width: `${player.total / maxTotal * 100}%`,
        background: rank <= 3 ? 'linear-gradient(90deg, #1d4ed8, #3b82f6)' : 'rgba(255,255,255,0.15)'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: rank <= 3 ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
        padding: '3px 10px',
        borderRadius: '8px',
        color: rank <= 3 ? '#fff' : 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        fontWeight: '800'
      }
    }, player.total));
  })));
};

// Stats Panel Component
const StatsPanel = () => {
  const [selRound, setSelRound] = useState('ALL');
  const [selCat, setSelCat] = useState('Rating');
  const [selStat, setSelStat] = useState('rating');
  const rounds = ['ALL', ...Object.keys(MATCH_STATS)];
  const statDef = Object.values(STAT_CATEGORIES).flat().find(s => s.key === selStat) || {
    label: selStat,
    color: '#3b82f6'
  };

  // Aggregate player data
  const playerData = (() => {
    const map = {};
    const activeRounds = selRound === 'ALL' ? Object.keys(MATCH_STATS) : [selRound];
    activeRounds.forEach(r => {
      const rd = MATCH_STATS[r];
      if (!rd) return;
      rd.players.forEach(p => {
        if (!map[p.name]) map[p.name] = {
          name: p.name,
          values: [],
          rounds: 0
        };
        map[p.name].values.push(p[selStat] || 0);
        map[p.name].rounds++;
      });
    });
    return Object.values(map).map(p => ({
      name: p.name,
      value: selRound === 'ALL' ? +(p.values.reduce((a, b) => a + b, 0) / p.rounds).toFixed(1) : p.values[0] || 0,
      rounds: p.rounds
    })).sort((a, b) => b.value - a.value);
  })();
  const maxVal = Math.max(...playerData.map(p => Math.abs(p.value)), 1);
  const hasNegative = playerData.some(p => p.value < 0);
  return /*#__PURE__*/React.createElement(GlassCard, {
    style: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 8px',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '3px',
      marginBottom: '8px'
    }
  }, rounds.map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setSelRound(r),
    style: {
      flex: 1,
      padding: '5px 0',
      background: selRound === r ? 'linear-gradient(135deg, #ffffff 0%, #dce5f2 100%)' : 'rgba(255,255,255,0.05)',
      color: selRound === r ? CARLTON_NAVY : 'rgba(255,255,255,0.4)',
      border: selRound === r ? 'none' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '700',
      cursor: 'pointer'
    }
  }, r === 'ALL' ? 'AVG' : r))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '3px',
      marginBottom: '8px'
    }
  }, Object.keys(STAT_CATEGORIES).map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat,
    onClick: () => {
      setSelCat(cat);
      setSelStat(STAT_CATEGORIES[cat][0].key);
    },
    style: {
      flex: 1,
      padding: '5px 0',
      background: selCat === cat ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
      color: selCat === cat ? '#fff' : 'rgba(255,255,255,0.35)',
      border: '1px solid ' + (selCat === cat ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'),
      borderRadius: '6px',
      fontSize: '9px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, cat))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '3px',
      flexWrap: 'wrap'
    }
  }, STAT_CATEGORIES[selCat].map(s => /*#__PURE__*/React.createElement("button", {
    key: s.key,
    onClick: () => setSelStat(s.key),
    style: {
      padding: '4px 8px',
      background: selStat === s.key ? s.color + '33' : 'rgba(255,255,255,0.03)',
      color: selStat === s.key ? s.color : 'rgba(255,255,255,0.35)',
      border: '1px solid ' + (selStat === s.key ? s.color + '66' : 'rgba(255,255,255,0.06)'),
      borderRadius: '6px',
      fontSize: '9px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, s.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 14px 2px',
      color: 'rgba(255,255,255,0.3)',
      fontSize: '9px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  }, statDef.label, " ", selRound === 'ALL' ? '(season avg)' : `— ${MATCH_STATS[selRound]?.opponent || ''}`), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '4px 14px 8px'
    }
  }, playerData.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100px',
      color: i < 3 ? '#fff' : 'rgba(255,255,255,0.5)',
      fontSize: '10px',
      fontWeight: i < 3 ? '700' : '500',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name.split(' ').pop()), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: '14px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '3px',
      overflow: 'hidden',
      position: 'relative'
    }
  }, hasNegative ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: '1px',
      background: 'rgba(255,255,255,0.15)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderRadius: '3px',
      background: p.value >= 0 ? statDef.color : '#ef4444',
      opacity: 0.7,
      ...(p.value >= 0 ? {
        left: '50%',
        width: `${p.value / maxVal * 50}%`
      } : {
        right: '50%',
        width: `${Math.abs(p.value) / maxVal * 50}%`
      })
    }
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: '3px',
      width: `${p.value / maxVal * 100}%`,
      background: `linear-gradient(90deg, ${statDef.color}88, ${statDef.color})`,
      transition: 'width 0.3s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '36px',
      textAlign: 'right',
      color: p.value > 0 ? statDef.color : p.value < 0 ? '#ef4444' : 'rgba(255,255,255,0.3)',
      fontSize: '10px',
      fontWeight: '700'
    }
  }, p.value)))));
};

// Head-to-head player comparison
const H2H_STATS = [['rating', 'Rating', 1], ['d', 'Disposals', 1], ['k', 'Kicks', 1], ['hb', 'Handballs', 1], ['m', 'Marks', 1], ['tk', 'Tackles', 1], ['g', 'Goals', 1], ['i50', 'Inside 50s', 1], ['cp', 'Contested', 1], ['mg', 'Metres gained', 0], ['tog', 'TOG %', 0]];
const ComparePanel = ({
  ratings
}) => {
  const [aId, setAId] = useState(1);
  const [bId, setBId] = useState(2);
  const A = CARLTON_PLAYERS.find(pl => pl.id === aId);
  const B = CARLTON_PLAYERS.find(pl => pl.id === bId);
  const roster = [...CARLTON_PLAYERS].sort((x, y) => x.number - y.number);
  const playable = FIXTURE_2026.filter(g => g.opponent !== 'BYE').map(g => g.round);
  const seriesFor = id => playable.map(r => {
    const e = ratings[r]?.[id];
    return e && e.rating !== null && e.rating !== undefined ? e.rating : null;
  });
  const avgFor = pl => {
    const acc = {};
    let games = 0;
    Object.values(MATCH_STATS).forEach(rd => {
      const rec = rd.players.find(x => x.name === pl.name) || rd.players.find(x => x.name.split(' ').pop() === pl.name.split(' ').pop());
      if (!rec) return;
      games++;
      H2H_STATS.forEach(([k]) => {
        acc[k] = (acc[k] || 0) + (rec[k] || 0);
      });
    });
    if (!games) return null;
    const out = {};
    H2H_STATS.forEach(([k]) => {
      out[k] = acc[k] / games;
    });
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
  const CW = 380,
    CH = 190,
    L = 30,
    R = 10,
    T = 10,
    Bm = 26;
  const xFor = i => L + i / Math.max(1, playable.length - 1) * (CW - L - R);
  const yFor = v => T + (1 - (v - minY) / (maxY - minY)) * (CH - T - Bm);
  const ptsOf = series => series.map((v, i) => v === null ? null : `${xFor(i)},${yFor(v)}`).filter(Boolean).join(' ');
  const labelEvery = Math.max(1, Math.ceil(playable.length / 8));
  const selStyle = {
    flex: 1,
    padding: '10px 8px',
    background: CARLTON_NAVY,
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    minWidth: 0
  };
  const PlayerHead = ({
    pl,
    color,
    avg
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(PlayerPhoto, {
    player: pl,
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: color,
      fontSize: '13px',
      fontWeight: '800',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "#", pl.number, " ", pl.name.split(' ').pop()), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: '10px'
    }
  }, avg ? `${avg.games} games` : 'no stats', " • ", pl.height, "cm • ", calculateAge(pl.dob), "y")));
  return /*#__PURE__*/React.createElement(GlassCard, {
    style: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 14px 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: aId,
    onChange: e => setAId(parseInt(e.target.value)),
    style: selStyle
  }, roster.map(pl => /*#__PURE__*/React.createElement("option", {
    key: pl.id,
    value: pl.id
  }, "#", pl.number, " ", pl.name))), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.35)',
      fontSize: '11px',
      fontWeight: '800',
      alignSelf: 'center'
    }
  }, "VS"), /*#__PURE__*/React.createElement("select", {
    value: bId,
    onChange: e => setBId(parseInt(e.target.value)),
    style: selStyle
  }, roster.map(pl => /*#__PURE__*/React.createElement("option", {
    key: pl.id,
    value: pl.id
  }, "#", pl.number, " ", pl.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(PlayerHead, {
    pl: A,
    color: "#60a5fa",
    avg: aAvg
  }), /*#__PURE__*/React.createElement(PlayerHead, {
    pl: B,
    color: "#f87171",
    avg: bAvg
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: '9px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px'
    }
  }, "Wheelo rating by round"), /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${CW} ${CH}`,
    style: {
      width: '100%'
    }
  }, minY < 0 && /*#__PURE__*/React.createElement("line", {
    x1: L,
    y1: yFor(0),
    x2: CW - R,
    y2: yFor(0),
    stroke: "rgba(255,255,255,0.15)",
    strokeWidth: "1"
  }), [0.5, 1].map(f => /*#__PURE__*/React.createElement("g", {
    key: f
  }, /*#__PURE__*/React.createElement("line", {
    x1: L,
    y1: yFor(maxY * f),
    x2: CW - R,
    y2: yFor(maxY * f),
    stroke: "rgba(255,255,255,0.06)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: L - 4,
    y: yFor(maxY * f) + 3,
    textAnchor: "end",
    fill: "rgba(255,255,255,0.35)",
    fontSize: "8",
    fontFamily: "Inter"
  }, Math.round(maxY * f)))), playable.map((r, i) => i % labelEvery === 0 ? /*#__PURE__*/React.createElement("text", {
    key: r,
    x: xFor(i),
    y: CH - Bm + 13,
    textAnchor: "middle",
    fill: "rgba(255,255,255,0.3)",
    fontSize: "8",
    fontFamily: "Inter"
  }, r) : null), /*#__PURE__*/React.createElement("polyline", {
    points: ptsOf(aSeries),
    fill: "none",
    stroke: "#60a5fa",
    strokeWidth: "2",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: ptsOf(bSeries),
    fill: "none",
    stroke: "#f87171",
    strokeWidth: "2",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), aSeries.map((v, i) => v === null ? null : /*#__PURE__*/React.createElement("circle", {
    key: 'a' + i,
    cx: xFor(i),
    cy: yFor(v),
    r: "2.4",
    fill: "#60a5fa"
  })), bSeries.map((v, i) => v === null ? null : /*#__PURE__*/React.createElement("circle", {
    key: 'b' + i,
    cx: xFor(i),
    cy: yFor(v),
    r: "2.4",
    fill: "#f87171"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: '9px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      margin: '10px 0 4px'
    }
  }, "Season averages"), H2H_STATS.map(([key, label, dec]) => {
    const av = aAvg ? aAvg[key] : null;
    const bv = bAvg ? bAvg[key] : null;
    const fmt = v => v === null || v === undefined ? '—' : v.toFixed(dec);
    const aBest = av !== null && bv !== null && av > bv;
    const bBest = av !== null && bv !== null && bv > av;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '64px',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '800',
        color: aBest ? '#60a5fa' : 'rgba(255,255,255,0.55)'
      }
    }, fmt(av)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: 'center',
        fontSize: '10px',
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.5px'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '64px',
        textAlign: 'right',
        fontSize: '13px',
        fontWeight: '800',
        color: bBest ? '#f87171' : 'rgba(255,255,255,0.55)'
      }
    }, fmt(bv)));
  })));
};

// Left Panel
const LeftPanel = ({
  votes,
  setVotes,
  selectedRound,
  setSelectedRound,
  bfView,
  setBfView,
  ratings,
  setRatings,
  results,
  onSyncResults,
  syncState
}) => {
  const [activeTab, setActiveTab] = useState('bf');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '16px',
      top: '60px',
      bottom: '16px',
      width: '420px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, [{
    key: 'bf',
    label: 'B&F'
  }, {
    key: 'stats',
    label: 'Stats'
  }, {
    key: 'h2h',
    label: 'H2H'
  }, {
    key: 'fixture',
    label: 'Fixture'
  }, {
    key: 'history',
    label: 'History'
  }].map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.key,
    onClick: () => setActiveTab(tab.key),
    style: {
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
      gap: '4px'
    }
  }, tab.label))), activeTab === 'bf' ? /*#__PURE__*/React.createElement(BFPanel, {
    votes: votes,
    setVotes: setVotes,
    selectedRound: selectedRound,
    setSelectedRound: setSelectedRound,
    view: bfView,
    setView: setBfView,
    ratings: ratings,
    setRatings: setRatings
  }) : activeTab === 'stats' ? /*#__PURE__*/React.createElement(StatsPanel, null) : activeTab === 'h2h' ? /*#__PURE__*/React.createElement(ComparePanel, {
    ratings: ratings
  }) : activeTab === 'history' ? /*#__PURE__*/React.createElement(HistoryPanel, null) : /*#__PURE__*/React.createElement(FixturePanel, {
    results: results,
    onSync: onSyncResults,
    syncState: syncState
  }));
};

// Premium Magnet Component
const Magnet = ({
  player,
  style,
  onMouseDown,
  onDoubleClick,
  onDragStart,
  onPointerDown,
  isDragging
}) => {
  const age = calculateAge(player.dob);
  return /*#__PURE__*/React.createElement("div", {
    draggable: true,
    onDragStart: onDragStart,
    onMouseDown: onMouseDown,
    onPointerDown: onPointerDown,
    onDoubleClick: onDoubleClick,
    style: {
      position: 'absolute',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      touchAction: 'none',
      transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
      transform: isDragging ? 'scale(1.08)' : 'scale(1)',
      zIndex: isDragging ? 1000 : 10,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "magnet-enter",
    style: {
      background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 50%, ${CARLTON_NAVY_DARK} 100%)`,
      border: player.captain ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
      borderRadius: '14px',
      padding: '8px 12px',
      minWidth: '150px',
      boxShadow: isDragging ? `0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)` : `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
      borderRadius: '14px',
      pointerEvents: 'none'
    }
  }), player.captain && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -8,
      right: -8,
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#000',
      fontSize: '11px',
      fontWeight: '900',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(251,191,36,0.4)',
      border: '2px solid rgba(255,255,255,0.3)'
    }
  }, "C"), player.recruit && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -6,
      left: 12,
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: '#fff',
      fontSize: '8px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '6px',
      boxShadow: '0 2px 6px rgba(34,197,94,0.4)',
      letterSpacing: '0.5px'
    }
  }, "NEW"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(PlayerPhoto, {
    player: player,
    size: 42
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontWeight: '600',
      fontSize: '25px',
      fontFamily: "'Oswald', 'Inter', sans-serif",
      lineHeight: 1,
      letterSpacing: '0.5px',
      textShadow: '0 2px 5px rgba(0,0,0,0.55)',
      minWidth: '28px',
      textAlign: 'center',
      flexShrink: 0
    }
  }, player.number), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontWeight: '700',
      fontSize: '13px',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      letterSpacing: '0.3px'
    }
  }, player.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      marginTop: '3px',
      color: 'rgba(255,255,255,0.55)',
      fontSize: '10px',
      fontWeight: '500'
    }
  }, /*#__PURE__*/React.createElement("span", null, player.height, "cm"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.4
    }
  }, "•"), /*#__PURE__*/React.createElement("span", null, age, "y"))))));
};

// AFL field — bird's-eye oval at true proportions (165m x 138m, 1m ≈ 3px)
const Field = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 480 560",
  preserveAspectRatio: "xMidYMid meet",
  style: {
    width: '100%',
    height: '100%'
  }
}, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
  id: "fieldGlow",
  cx: "50%",
  cy: "44%",
  r: "74%"
}, /*#__PURE__*/React.createElement("stop", {
  offset: "0%",
  stopColor: "rgba(255,255,255,0.09)"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "55%",
  stopColor: "rgba(255,255,255,0.02)"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "100%",
  stopColor: "rgba(0,0,0,0.32)"
})), /*#__PURE__*/React.createElement("radialGradient", {
  id: "towerGlow"
}, /*#__PURE__*/React.createElement("stop", {
  offset: "0%",
  stopColor: "rgba(255,255,235,0.28)"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "45%",
  stopColor: "rgba(255,255,235,0.08)"
}), /*#__PURE__*/React.createElement("stop", {
  offset: "100%",
  stopColor: "rgba(255,255,235,0)"
})), /*#__PURE__*/React.createElement("clipPath", {
  id: "fieldClip"
}, /*#__PURE__*/React.createElement("ellipse", {
  cx: "240",
  cy: "280",
  rx: "206",
  ry: "246"
}))), /*#__PURE__*/React.createElement("ellipse", {
  cx: "240",
  cy: "280",
  rx: "231",
  ry: "271",
  fill: "none",
  stroke: "rgba(4,8,16,0.85)",
  strokeWidth: "15"
}), /*#__PURE__*/React.createElement("ellipse", {
  cx: "240",
  cy: "280",
  rx: "224",
  ry: "264",
  fill: "none",
  stroke: "rgba(148,163,184,0.10)",
  strokeWidth: "3"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "36",
  cy: "64",
  r: "46",
  fill: "url(#towerGlow)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "444",
  cy: "64",
  r: "46",
  fill: "url(#towerGlow)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "36",
  cy: "496",
  r: "46",
  fill: "url(#towerGlow)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "444",
  cy: "496",
  r: "46",
  fill: "url(#towerGlow)"
}), [[36, 64], [444, 64], [36, 496], [444, 496]].map(([tx, ty], ti) => /*#__PURE__*/React.createElement("g", {
  key: ti
}, /*#__PURE__*/React.createElement("circle", {
  cx: tx - 5,
  cy: ty,
  r: "1.6",
  fill: "rgba(255,255,240,0.9)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: tx,
  cy: ty - 4,
  r: "1.6",
  fill: "rgba(255,255,240,0.9)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: tx + 5,
  cy: ty,
  r: "1.6",
  fill: "rgba(255,255,240,0.9)"
}))), /*#__PURE__*/React.createElement("ellipse", {
  cx: "240",
  cy: "280",
  rx: "222",
  ry: "262",
  fill: "#0f4a26"
}), [1, 0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125].map((f, bi) => /*#__PURE__*/React.createElement("ellipse", {
  key: bi,
  cx: "240",
  cy: "280",
  rx: 218 * f,
  ry: 258 * f,
  fill: bi % 2 === 0 ? '#1a7a3c' : '#1f8945'
})), /*#__PURE__*/React.createElement("ellipse", {
  cx: "240",
  cy: "280",
  rx: "218",
  ry: "258",
  fill: "url(#fieldGlow)"
}), /*#__PURE__*/React.createElement("ellipse", {
  cx: "240",
  cy: "280",
  rx: "208",
  ry: "248",
  fill: "none",
  stroke: "rgba(255,255,255,0.88)",
  strokeWidth: "2"
}), /*#__PURE__*/React.createElement("g", {
  clipPath: "url(#fieldClip)"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "240",
  cy: "32",
  r: "150",
  fill: "none",
  stroke: "rgba(255,255,255,0.78)",
  strokeWidth: "2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "240",
  cy: "528",
  r: "150",
  fill: "none",
  stroke: "rgba(255,255,255,0.78)",
  strokeWidth: "2"
})), [[134, 148], [346, 148], [134, 432], [346, 432]].map(([lx, ly], li) => /*#__PURE__*/React.createElement("text", {
  key: li,
  x: lx,
  y: ly,
  textAnchor: "middle",
  fill: "rgba(255,255,255,0.75)",
  fontSize: "15",
  fontWeight: "600",
  fontFamily: "Oswald, Inter, sans-serif",
  letterSpacing: "1"
}, "50")), /*#__PURE__*/React.createElement("rect", {
  x: "165",
  y: "205",
  width: "150",
  height: "150",
  fill: "none",
  stroke: "rgba(255,255,255,0.75)",
  strokeWidth: "2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "240",
  cy: "280",
  r: "15",
  fill: "none",
  stroke: "rgba(255,255,255,0.8)",
  strokeWidth: "1.8"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "240",
  cy: "280",
  r: "4.5",
  fill: "none",
  stroke: "rgba(255,255,255,0.8)",
  strokeWidth: "1.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "225",
  y1: "280",
  x2: "255",
  y2: "280",
  stroke: "rgba(255,255,255,0.8)",
  strokeWidth: "1.5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "230",
  y: "32",
  width: "20",
  height: "27",
  fill: "none",
  stroke: "rgba(255,255,255,0.78)",
  strokeWidth: "1.6"
}), /*#__PURE__*/React.createElement("line", {
  x1: "230",
  y1: "32",
  x2: "230",
  y2: "16",
  stroke: "#f5f5f5",
  strokeWidth: "3.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "250",
  y1: "32",
  x2: "250",
  y2: "16",
  stroke: "#f5f5f5",
  strokeWidth: "3.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "211",
  y1: "34",
  x2: "211",
  y2: "24",
  stroke: "rgba(245,245,245,0.7)",
  strokeWidth: "2.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "269",
  y1: "34",
  x2: "269",
  y2: "24",
  stroke: "rgba(245,245,245,0.7)",
  strokeWidth: "2.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("rect", {
  x: "230",
  y: "501",
  width: "20",
  height: "27",
  fill: "none",
  stroke: "rgba(255,255,255,0.78)",
  strokeWidth: "1.6"
}), /*#__PURE__*/React.createElement("line", {
  x1: "230",
  y1: "528",
  x2: "230",
  y2: "544",
  stroke: "#f5f5f5",
  strokeWidth: "3.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "250",
  y1: "528",
  x2: "250",
  y2: "544",
  stroke: "#f5f5f5",
  strokeWidth: "3.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "211",
  y1: "526",
  x2: "211",
  y2: "536",
  stroke: "rgba(245,245,245,0.7)",
  strokeWidth: "2.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "269",
  y1: "526",
  x2: "269",
  y2: "536",
  stroke: "rgba(245,245,245,0.7)",
  strokeWidth: "2.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "33",
  y1: "252",
  x2: "23",
  y2: "252",
  stroke: "rgba(255,255,255,0.55)",
  strokeWidth: "2.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "33",
  y1: "308",
  x2: "23",
  y2: "308",
  stroke: "rgba(255,255,255,0.55)",
  strokeWidth: "2.5"
}));

// Position Labels
const PositionLabels = () => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: '-55px',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '6% 0'
  }
}, ['FB', 'HB', 'C', 'HF', 'FF'].map(label => /*#__PURE__*/React.createElement("div", {
  key: label,
  style: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '2px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  }
}, label)));

// Premium Sidebar
const Sidebar = ({
  players,
  onDragStart,
  onRemovePlayer,
  onPointerStart,
  filter,
  setFilter,
  fieldCount,
  interchangeCount
}) => {
  const totalSelected = fieldCount + interchangeCount;
  const isComplete = fieldCount === 18 && interchangeCount === 5;
  const handleDrop = e => {
    e.preventDefault();
    const data = e.dataTransfer.getData('player');
    if (!data) return;
    const player = JSON.parse(data);
    onRemovePlayer(player);
  };
  return /*#__PURE__*/React.createElement("div", {
    onDragOver: e => e.preventDefault(),
    onDrop: handleDrop,
    style: {
      width: '300px',
      height: '100%',
      background: `linear-gradient(180deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 50%, ${CARLTON_NAVY_DARK} 100%)`,
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '52px',
      height: '52px',
      background: 'linear-gradient(145deg, #fff 0%, #e8e8e8 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement(ClubLogo, {
    team: "Carlton",
    size: 40
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontWeight: '800',
      fontSize: '20px',
      letterSpacing: '2px'
    }
  }, "CARLTON"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: '11px',
      fontWeight: '500',
      letterSpacing: '1px'
    }
  }, "2026 TEAM SELECTION"))), /*#__PURE__*/React.createElement(GlassCard, {
    style: {
      padding: '16px',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px'
    }
  }, [{
    label: 'ON FIELD',
    value: fieldCount,
    target: 18,
    color: fieldCount === 18 ? '#22c55e' : '#3b82f6'
  }, {
    label: 'BENCH',
    value: interchangeCount,
    target: 5,
    color: interchangeCount === 5 ? '#22c55e' : '#f59e0b'
  }, {
    label: 'TOTAL',
    value: totalSelected,
    target: 23,
    color: isComplete ? '#22c55e' : 'rgba(255,255,255,0.7)'
  }].map((stat, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: stat.label
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '1px',
      background: 'rgba(255,255,255,0.08)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: stat.color,
      fontWeight: '800',
      fontSize: '24px'
    }
  }, stat.value), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: '9px',
      fontWeight: '700',
      letterSpacing: '1px'
    }
  }, stat.label))))), isComplete && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.25) 50%, rgba(34,197,94,0.15) 100%)',
      borderRadius: '8px',
      padding: '8px',
      textAlign: 'center',
      color: '#22c55e',
      fontSize: '11px',
      fontWeight: '700',
      border: '1px solid rgba(34,197,94,0.3)'
    }
  }, "✓ TEAM COMPLETE (18 + 5)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '5px'
    }
  }, ['ALL', 'DEF', 'MID', 'RCK', 'FWD'].map(pos => {
    const key = pos === 'RCK' ? 'RUCK' : pos;
    return /*#__PURE__*/React.createElement("button", {
      key: pos,
      onClick: () => setFilter(key),
      style: {
        flex: 1,
        padding: '10px 4px',
        background: filter === key ? 'linear-gradient(135deg, #fff 0%, #e8e8e8 100%)' : 'rgba(255,255,255,0.05)',
        color: filter === key ? CARLTON_NAVY : 'rgba(255,255,255,0.4)',
        border: filter === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: filter === key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
      }
    }, pos);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '10px'
    }
  }, players.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: '12px',
      textAlign: 'center',
      padding: '40px 20px'
    }
  }, filter === 'ALL' ? 'All players on field!' : `No ${filter} available`) : players.map(player => {
    return /*#__PURE__*/React.createElement("div", {
      key: player.id,
      draggable: true,
      onDragStart: e => onDragStart(e, player),
      onPointerDown: e => onPointerStart && onPointerStart(e, player, 'sidebar'),
      style: {
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '8px',
        cursor: 'grab',
        touchAction: 'pan-y',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.15s ease',
        border: '1px solid transparent'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'translateX(4px)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.transform = 'translateX(0)';
      }
    }, /*#__PURE__*/React.createElement(PlayerPhoto, {
      player: player,
      size: 44
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff',
        fontWeight: '600',
        fontSize: '23px',
        fontFamily: "'Oswald', 'Inter', sans-serif",
        lineHeight: 1,
        letterSpacing: '0.5px',
        textShadow: '0 2px 5px rgba(0,0,0,0.55)',
        minWidth: '26px',
        textAlign: 'center',
        flexShrink: 0
      }
    }, player.number), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, player.name), player.captain && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fbbf24',
        fontSize: '12px'
      }
    }, "©"), player.recruit && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'rgba(34,197,94,0.2)',
        color: '#22c55e',
        fontSize: '8px',
        fontWeight: '700',
        padding: '2px 5px',
        borderRadius: '4px'
      }
    }, "NEW")), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '11px',
        marginTop: '2px'
      }
    }, player.height, "cm • ", calculateAge(player.dob), "yo")));
  })));
};
function App() {
  const [fieldPlayers, setFieldPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('carlton-board-2026');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [dragging, setDragging] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const fieldRef = useRef(null);
  const dragRef = useRef(false);
  const [votes, setVotes] = useState(() => {
    try {
      const saved = localStorage.getItem('carlton-bf-2026');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedRound, setSelectedRound] = useState('OR');
  const [bfView, setBfView] = useState('vote');
  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('carlton-wheelo-2026');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge seed OR ratings if not already stored
        // Always overwrite seeded rounds with correct data
        const seeds = buildSeedRatings();
        // Versioned seeding: bundled rounds are written once per seed version,
        // after that user-imported data is never clobbered on load.
        const SEED_VERSION = '2';
        let storedVer = null;
        try {
          storedVer = localStorage.getItem('carlton-seed-version');
        } catch {}
        if (storedVer !== SEED_VERSION) {
          Object.keys(seeds).forEach(r => {
            parsed[r] = seeds[r];
          });
          try {
            localStorage.setItem('carlton-seed-version', SEED_VERSION);
          } catch {}
        } else {
          Object.keys(seeds).forEach(r => {
            if (!parsed[r]) parsed[r] = seeds[r];
          });
        }
        return parsed;
      }
      return buildSeedRatings();
    } catch {
      return buildSeedRatings();
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('carlton-bf-2026', JSON.stringify(votes));
    } catch {}
  }, [votes]);
  useEffect(() => {
    try {
      localStorage.setItem('carlton-board-2026', JSON.stringify(fieldPlayers));
    } catch {}
  }, [fieldPlayers]);
  useEffect(() => {
    try {
      localStorage.setItem('carlton-wheelo-2026', JSON.stringify(ratings));
    } catch {}
  }, [ratings]);
  const filtered = CARLTON_PLAYERS.filter(p => filter === 'ALL' || p.position === filter);
  const bench = filtered.filter(p => !fieldPlayers[p.id]).sort((a, b) => a.number - b.number);
  const interchangeCount = Object.values(fieldPlayers).filter(p => p.isInterchange).length;
  const onFieldCount = Object.keys(fieldPlayers).length - interchangeCount;
  const handleMouseMove = useCallback(e => {
    if (!dragRef.current || !dragging || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    setFieldPlayers(prev => ({
      ...prev,
      [dragging.id]: {
        x: Math.max(6, Math.min(94, x)),
        y: Math.max(3, Math.min(97, y))
      }
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
      const saved = localStorage.getItem('carlton-results-2026');
      return saved ? {
        ...RESULTS_2026,
        ...JSON.parse(saved)
      } : RESULTS_2026;
    } catch {
      return RESULTS_2026;
    }
  });
  const [syncState, setSyncState] = useState('');
  const parseSquiggleGames = games => {
    const merged = {};
    const taken = {};
    games.filter(g => g.complete === 100).sort((a, b) => (a.unixtime || 0) - (b.unixtime || 0)).forEach(g => {
      const carltonHome = g.hteam === 'Carlton';
      const oppRaw = carltonHome ? g.ateam : g.hteam;
      const opp = SQUIGGLE_NAMES[oppRaw] || oppRaw;
      const fx = FIXTURE_2026.find(f => f.opponent === opp && !taken[f.round]);
      if (!fx) return;
      taken[fx.round] = true;
      const forScore = carltonHome ? g.hscore : g.ascore;
      const against = carltonHome ? g.ascore : g.hscore;
      merged[fx.round] = {
        for: forScore,
        against,
        result: forScore === against ? 'D' : g.winner === 'Carlton' ? 'W' : 'L'
      };
    });
    return merged;
  };
  const syncResults = async () => {
    setSyncState('syncing');
    const api = 'https://api.squiggle.com.au/?q=games;year=2026;team=3';
    const attempts = [api, 'https://api.allorigins.win/raw?url=' + encodeURIComponent(api)];
    for (const url of attempts) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const data = await resp.json();
        const merged = parseSquiggleGames(data.games || []);
        if (Object.keys(merged).length === 0) continue;
        setResults(prev => {
          const next = {
            ...prev,
            ...merged
          };
          try {
            localStorage.setItem('carlton-results-2026', JSON.stringify(next));
          } catch {}
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
  const exportTeamSheet = () => {
    const onField = Object.entries(fieldPlayers).filter(([_, pos]) => !pos.isInterchange).map(([id, pos]) => ({
      player: CARLTON_PLAYERS.find(pl => pl.id === parseInt(id)),
      pos
    })).filter(e => e.player);
    const benchPlayers = Object.entries(fieldPlayers).filter(([_, pos]) => pos.isInterchange).sort((a, b) => a[1].slot - b[1].slot).map(([id]) => CARLTON_PLAYERS.find(pl => pl.id === parseInt(id))).filter(Boolean);
    if (onField.length === 0 && benchPlayers.length === 0) {
      alert('Put some players on the board first — the team sheet is built from the board.');
      return;
    }
    const sorted = onField.slice().sort((a, b) => a.pos.y - b.pos.y);
    const byX = arr => arr.slice().sort((a, b) => a.pos.x - b.pos.x).map(e => e.player);
    const lines = [{
      label: 'BACKS',
      players: byX(sorted.slice(0, 3))
    }, {
      label: 'HALF BACKS',
      players: byX(sorted.slice(3, 6))
    }, {
      label: 'CENTRES',
      players: byX(sorted.slice(6, 9))
    }, {
      label: 'HALF FORWARDS',
      players: byX(sorted.slice(9, 12))
    }, {
      label: 'FORWARDS',
      players: byX(sorted.slice(12, 15))
    }, {
      label: 'FOLLOWERS',
      players: byX(sorted.slice(15, 18))
    }].filter(l => l.players.length > 0);
    const W = 1000,
      H = 340 + lines.length * 130 + (benchPlayers.length ? 170 : 60);
    const scale = 2;
    const cv = document.createElement('canvas');
    cv.width = W * scale;
    cv.height = H * scale;
    const ctx = cv.getContext('2d');
    ctx.scale(scale, scale);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0b1729');
    bg.addColorStop(1, '#04080f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 48px Oswald, Inter, sans-serif';
    ctx.fillText('C A R L T O N', W / 2, 112);
    ctx.font = '700 19px Inter, sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('2 0 2 6   T E A M   S H E E T', W / 2, 148);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(90, 180);
    ctx.lineTo(W - 90, 180);
    ctx.stroke();
    const drawPlayer = (pl, cx, cy) => {
      const num = String(pl.number);
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
      ctx.beginPath();
      ctx.moveTo(90, y - 20);
      ctx.lineTo(W - 90, y - 20);
      ctx.stroke();
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
    ctx.fillText(new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }), W / 2, H - 44);
    cv.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carlton-team-sheet-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // --- Backup / restore ---
  const fileInputRef = useRef(null);
  const exportBackup = () => {
    const data = {
      app: 'carlton-magnetboard',
      version: 1,
      exported: new Date().toISOString(),
      votes,
      ratings,
      board: fieldPlayers
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carlton-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const importBackup = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !data.votes && !data.ratings && !data.board) throw new Error('empty');
        if (data.votes) setVotes(data.votes);
        if (data.ratings) setRatings(data.ratings);
        if (data.board) setFieldPlayers(data.board);
        alert('Backup restored.');
      } catch {
        alert('Could not read that file — expected a Carlton magnetboard backup (.json).');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const handleSidebarDrag = (e, player) => {
    e.dataTransfer.setData('player', JSON.stringify(player));
  };
  const handleDrop = e => {
    e.preventDefault();
    const data = e.dataTransfer.getData('player');
    if (!data || !fieldRef.current) return;
    const player = JSON.parse(data);
    const rect = fieldRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    setFieldPlayers(prev => ({
      ...prev,
      [player.id]: {
        x: Math.max(6, Math.min(94, x)),
        y: Math.max(3, Math.min(97, y))
      }
    }));
  };

  // --- Touch drag (pointer events; desktop mouse path unchanged) ---
  const [touchDrag, setTouchDrag] = useState(null);
  const touchRef = useRef(null);
  const benchRef = useRef(null);
  const startTouchDrag = (e, player, source) => {
    if (e.pointerType === 'mouse') return;
    touchRef.current = {
      player,
      source,
      startX: e.clientX,
      startY: e.clientY,
      active: source === 'field'
    };
    if (source === 'field') {
      setTouchDrag({
        player,
        source,
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  useEffect(() => {
    const move = e => {
      const t = touchRef.current;
      if (!t) return;
      if (!t.active) {
        const dx = e.clientX - t.startX,
          dy = e.clientY - t.startY;
        if (Math.hypot(dx, dy) < 8) return;
        if (t.source === 'sidebar' && Math.abs(dy) > Math.abs(dx) * 1.4) {
          touchRef.current = null; // vertical intent: let the list scroll
          return;
        }
        t.active = true;
      }
      setTouchDrag({
        player: t.player,
        source: t.source,
        x: e.clientX,
        y: e.clientY
      });
    };
    const up = e => {
      const t = touchRef.current;
      touchRef.current = null;
      setTouchDrag(null);
      if (!t || !t.active) return;
      const fr = fieldRef.current && fieldRef.current.getBoundingClientRect();
      const br = benchRef.current && benchRef.current.getBoundingClientRect();
      const inside = r => r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside(fr)) {
        const x = (e.clientX - fr.left) / fr.width * 100;
        const y = (e.clientY - fr.top) / fr.height * 100;
        setFieldPlayers(prev => ({
          ...prev,
          [t.player.id]: {
            x: Math.max(6, Math.min(94, x)),
            y: Math.max(3, Math.min(97, y))
          }
        }));
      } else if (inside(br)) {
        setFieldPlayers(prev => {
          const usedSlots = Object.values(prev).filter(pp => pp.isInterchange).map(pp => pp.slot);
          const nextSlot = [0, 1, 2, 3, 4].find(sl => !usedSlots.includes(sl));
          if (nextSlot === undefined) return prev;
          return {
            ...prev,
            [t.player.id]: {
              isInterchange: true,
              slot: nextSlot
            }
          };
        });
      } else if (t.source !== 'sidebar') {
        setFieldPlayers(prev => {
          const n = {
            ...prev
          };
          delete n[t.player.id];
          return n;
        });
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
    dragRef.current = true;
    setDragging(player);
  };
  const handleMagnetDblClick = player => {
    setFieldPlayers(prev => {
      const next = {
        ...prev
      };
      delete next[player.id];
      return next;
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      background: 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '14px',
      left: '18px',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontWeight: '900',
      fontSize: '16px',
      letterSpacing: '4px'
    }
  }, "CARLTON"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#60a5fa',
      fontWeight: '800',
      fontSize: '16px',
      letterSpacing: '2px'
    }
  }, "2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.35)',
      fontWeight: '600',
      fontSize: '10px',
      letterSpacing: '2px'
    }
  }, "SEASON HUB")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '3px',
      alignItems: 'center'
    }
  }, FIXTURE_2026.filter(g => results[g.round]).map(g => {
    const r = results[g.round];
    return /*#__PURE__*/React.createElement("span", {
      key: g.round,
      title: `${g.round} ${g.home ? 'vs' : '@'} ${g.opponent}: ${r.result} ${r.for}–${r.against}`,
      style: {
        width: '11px',
        height: '11px',
        borderRadius: '3px',
        background: r.result === 'W' ? 'rgba(34,197,94,0.85)' : r.result === 'D' ? 'rgba(251,191,36,0.85)' : 'rgba(239,68,68,0.55)',
        display: 'inline-block'
      }
    });
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '16px',
      left: '452px',
      zIndex: 100,
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setFieldPlayers({}),
    style: {
      padding: '10px 16px',
      background: 'rgba(239,68,68,0.1)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '700',
      transition: 'all 0.15s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
    }
  }, "✕ Clear board"), /*#__PURE__*/React.createElement("button", {
    onClick: exportBackup,
    title: "Download all votes, ratings and the board layout as a JSON file",
    style: {
      padding: '10px 16px',
      background: 'rgba(59,130,246,0.1)',
      color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.25)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '700',
      transition: 'all 0.15s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
    }
  }, "⭳ Backup"), /*#__PURE__*/React.createElement("button", {
    onClick: exportTeamSheet,
    title: "Export the current board as a classic team-sheet PNG (lines read top-to-bottom off the board)",
    style: {
      padding: '10px 16px',
      background: 'rgba(34,197,94,0.1)',
      color: '#4ade80',
      border: '1px solid rgba(34,197,94,0.25)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '700',
      transition: 'all 0.15s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'rgba(34,197,94,0.2)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
    }
  }, "⭳ Team sheet"), /*#__PURE__*/React.createElement("button", {
    onClick: () => fileInputRef.current && fileInputRef.current.click(),
    title: "Restore votes, ratings and board layout from a backup file",
    style: {
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '700',
      transition: 'all 0.15s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
    }
  }, "⭱ Restore"), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: ".json,application/json",
    onChange: importBackup,
    style: {
      display: 'none'
    }
  })), /*#__PURE__*/React.createElement(LeftPanel, {
    votes: votes,
    setVotes: setVotes,
    selectedRound: selectedRound,
    setSelectedRound: setSelectedRound,
    bfView: bfView,
    setBfView: setBfView,
    ratings: ratings,
    setRatings: setRatings,
    results: results,
    onSyncResults: syncResults,
    syncState: syncState
  }), /*#__PURE__*/React.createElement("div", {
    ref: fieldRef,
    onDragOver: e => e.preventDefault(),
    onDrop: handleDrop,
    style: {
      height: 'min(calc(100vh - 110px), calc((100vw - 912px) * 1.1667))',
      aspectRatio: '480/560',
      position: 'relative',
      filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))',
      marginLeft: '260px',
      borderRadius: '50%'
    }
  }, /*#__PURE__*/React.createElement(PositionLabels, null), /*#__PURE__*/React.createElement(Field, null), Object.entries(fieldPlayers).map(([id, pos]) => {
    if (pos.isInterchange) return null;
    const player = CARLTON_PLAYERS.find(p => p.id === parseInt(id));
    if (!player) return null;
    const dimmed = filter !== 'ALL' && player.position !== filter;
    return /*#__PURE__*/React.createElement(Magnet, {
      key: id,
      player: player,
      isDragging: dragging?.id === player.id,
      onDragStart: e => {
        e.dataTransfer.setData('player', JSON.stringify(player));
        e.dataTransfer.setData('source', 'field');
        dragRef.current = false;
        setDragging(null);
      },
      onMouseDown: e => handleMagnetDown(e, player),
      onPointerDown: e => startTouchDrag(e, player, 'field'),
      onDoubleClick: () => handleMagnetDblClick(player),
      style: {
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: dimmed ? 0.22 : 1,
        filter: dimmed ? 'saturate(0.3)' : 'none',
        pointerEvents: dimmed ? 'none' : 'auto',
        transition: 'opacity 0.2s ease, filter 0.2s ease'
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    ref: benchRef,
    onDragOver: e => e.preventDefault(),
    onDrop: e => {
      e.preventDefault();
      const data = e.dataTransfer.getData('player');
      if (!data) return;
      const player = JSON.parse(data);
      const usedSlots = Object.values(fieldPlayers).filter(p => p.isInterchange).map(p => p.slot);
      const nextSlot = [0, 1, 2, 3, 4].find(s => !usedSlots.includes(s));
      if (nextSlot !== undefined) {
        setFieldPlayers(prev => ({
          ...prev,
          [player.id]: {
            isInterchange: true,
            slot: nextSlot
          }
        }));
      }
    },
    style: {
      marginTop: '8px',
      background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '18px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontSize: '12px',
      fontWeight: '800',
      letterSpacing: '2px',
      opacity: 0.6
    }
  }, "BENCH"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px'
    }
  }, [0, 1, 2, 3, 4].map(slot => {
    const playerInSlot = Object.entries(fieldPlayers).find(([_, pos]) => pos.isInterchange && pos.slot === slot);
    const player = playerInSlot ? CARLTON_PLAYERS.find(p => p.id === parseInt(playerInSlot[0])) : null;
    if (player) {
      return /*#__PURE__*/React.createElement("div", {
        key: slot,
        draggable: true,
        onDragStart: e => {
          e.dataTransfer.setData('player', JSON.stringify(player));
          e.dataTransfer.setData('source', 'interchange');
        },
        onPointerDown: e => startTouchDrag(e, player, 'bench'),
        onDoubleClick: () => handleMagnetDblClick(player),
        style: {
          background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
          border: player.captain ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '8px 12px',
          minWidth: '145px',
          cursor: 'grab',
          touchAction: 'none',
          position: 'relative',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }
      }, player.captain && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: -6,
          right: -6,
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#000',
          fontSize: '10px',
          fontWeight: '900',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, "C"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '9px'
        }
      }, /*#__PURE__*/React.createElement(PlayerPhoto, {
        player: player,
        size: 38
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#fff',
          fontWeight: '600',
          fontSize: '21px',
          fontFamily: "'Oswald', 'Inter', sans-serif",
          lineHeight: 1,
          letterSpacing: '0.5px',
          textShadow: '0 2px 5px rgba(0,0,0,0.55)',
          minWidth: '24px',
          textAlign: 'center',
          flexShrink: 0
        }
      }, player.number), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#fff',
          fontWeight: '700',
          fontSize: '12px'
        }
      }, player.name)), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'rgba(255,255,255,0.5)',
          fontSize: '10px',
          marginTop: '2px'
        }
      }, player.height, "cm • ", calculateAge(player.dob), "y"))));
    }
    return /*#__PURE__*/React.createElement("div", {
      key: slot,
      style: {
        width: '145px',
        height: '58px',
        border: '2px dashed rgba(255,255,255,0.12)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '14px',
        fontWeight: '700',
        background: 'rgba(255,255,255,0.02)'
      }
    }, slot + 1);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: '12px',
      color: 'rgba(255,255,255,0.35)',
      fontSize: '11px',
      fontWeight: '500',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '999px',
      padding: '6px 16px',
      backdropFilter: 'blur(8px)'
    }
  }, "Drag players onto the field • Double-click to remove")), /*#__PURE__*/React.createElement(Sidebar, {
    players: bench,
    onDragStart: handleSidebarDrag,
    onPointerStart: startTouchDrag,
    onRemovePlayer: handleMagnetDblClick,
    filter: filter,
    setFilter: setFilter,
    fieldCount: onFieldCount,
    interchangeCount: interchangeCount
  }), touchDrag && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: touchDrag.x,
      top: touchDrag.y,
      transform: 'translate(-50%, -120%)',
      zIndex: 2000,
      pointerEvents: 'none',
      opacity: 0.95
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: `linear-gradient(145deg, ${CARLTON_NAVY_LIGHT} 0%, ${CARLTON_NAVY} 100%)`,
      border: `1px solid ${(posColors[touchDrag.player.position] || {}).light || 'rgba(255,255,255,0.3)'}`,
      borderRadius: '12px',
      padding: '8px 14px',
      color: '#fff',
      fontWeight: '700',
      fontSize: '13px',
      whiteSpace: 'nowrap',
      boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
    }
  }, "#", touchDrag.player.number, " ", touchDrag.player.name)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));