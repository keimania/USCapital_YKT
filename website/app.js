(function () {
  'use strict';

  const DATA = window.US_CAPITAL_MARKET_DATA;
  if (!DATA || !Array.isArray(DATA.chapters)) {
    console.error('US_CAPITAL_MARKET_DATA가 로드되지 않았습니다.');
    return;
  }

  /* =========================================================
     CONSTANTS & STORAGE KEYS
     ========================================================= */
  const STORAGE = {
    theme: 'uscm-theme',
    fontSize: 'uscm-font-size',
    completed: 'uscm-completed',
    bookmarks: 'uscm-bookmarks',
    readMode: 'uscm-read-mode',
    quizAnswers: 'uscm-quiz-answers',
    lastChapter: 'uscm-last-chapter',
    flashKnown: 'uscm-flash-known'
  };

  const PART_META = [
    {
      key: 'Part I',
      layerNum: 'LAYER 01',
      layerClass: 'layer-1',
      title: 'Part I · 법규 및 시장 규제 체계',
      shortTitle: '법규 및 규제 체계',
      badgeClass: 'badge-blue',
      desc: 'U.S.C.·C.F.R. 위계, 4대 연방 증권법, Reg NMS 4대 조항 및 Reg ATS 공시'
    },
    {
      key: 'Part II',
      layerNum: 'LAYER 02',
      layerClass: 'layer-2',
      title: 'Part II · 시장 참여자 및 거래 인프라',
      shortTitle: '참여자 · 거래소 · 청산',
      badgeClass: 'badge-teal',
      desc: 'SEC·CFTC·FINRA 감독 구도, 17개 정규거래소·SIP, ATS·Dark Pool, DTCC 청산결제'
    },
    {
      key: 'Part III',
      layerNum: 'LAYER 03',
      layerClass: 'layer-3',
      title: 'Part III · Order Flow 및 SOR 라우팅',
      shortTitle: 'Order Flow & SOR',
      badgeClass: 'badge-purple',
      desc: '리테일 PFOF·내부화, 기관 Algo·ISO, 패시브 ETF·HFT 레이턴시 전쟁, SOR 엔진'
    },
    {
      key: 'Part IV',
      layerNum: 'LAYER 04',
      layerClass: 'layer-4',
      title: 'Part IV · 트레이딩 룰 및 시·종가 결정',
      shortTitle: '안정장치 & 시·종가 경매',
      badgeClass: 'badge-amber',
      desc: 'MWCB·LULD 가격안정장치, Nasdaq Opening/Closing Cross, NYSE D-Order·Parity'
    }
  ];

  const LAB_CATALOG = [
    {
      id: 'lab-pfof',
      title: '1. PFOF · 거래소 수수료 구조 계산기',
      desc: 'NBBO 스프레드 위에서 도매상 내부화, Maker-Taker, Inverted, Flat-Fee(IEX)의 비용·수익을 비교합니다.',
      chapters: ['ch03', 'ch05', 'ch08']
    },
    {
      id: 'lab-auction',
      title: '2. Nasdaq · NYSE 시·종가 경매 시뮬레이터',
      desc: 'Nasdaq Late LOC Price Sliding·EP 4단계와 NYSE D-Order 스텔스·Parity 1/N 배분을 실험합니다.',
      chapters: ['ch13', 'ch14']
    },
    {
      id: 'lab-flow',
      title: '3. Order Flow · SOR 경로 추적기',
      desc: '리테일 Clean Flow, 기관 Dark-First, ISO 동시 타격, 패시브 MOC, HFT 선물-현물 차익 경로를 추적합니다.',
      chapters: ['ch09', 'ch10', 'ch11']
    },
    {
      id: 'lab-stability',
      title: '4. MWCB · LULD 가격안정장치 시뮬레이터',
      desc: 'S&P 500 급락 단계(MWCB)와 개별 종목 5분 VWAP 동적 가격 밴드(LULD) 발동 조건을 확인합니다.',
      chapters: ['ch12']
    }
  ];

  const FLOW_SCENARIOS = {
    'retail-clean': {
      title: '시나리오 1: 리테일 개인 투자자 소량 시장가 매수 (Clean Flow)',
      summary: 'Robinhood·Schwab 등 리테일 주문은 독성(Adverse Selection)이 낮아 정규 거래소(Lit)로 가지 않고 도매상(Wholesaler)에게 PFOF를 받고 넘겨져 장외 내부화(OTC)로 체결됩니다.',
      chapterId: 'ch08',
      steps: [
        { step: 'STEP 1 · 주문 접수', title: '개인 투자자 → Retail Broker', desc: '앱에서 Apple 100주 시장가 매수 제출. 고객 수수료 $0(Zero-Commission) 모델.', meta: 'Rule 606 공시 대상' },
        { step: 'STEP 2 · 독성 평가', title: 'Toxicity Scoring (Clean 판정)', desc: '소액·비정보성(Uninformed) 주문으로 판정되어 Cream-Skimming 필터를 통과(Clean Flow).', meta: 'Adverse Selection 극저' },
        { step: 'STEP 3 · 도매상 경매', title: 'Citadel · Virtu 라우팅 경쟁', desc: '수 밀리초 안에 복수 Wholesaler에 라우팅. 가장 큰 Price Improvement와 PFOF 제시처 낙찰.', meta: 'Sub-penny PI + PFOF' },
        { step: 'STEP 4 · OTC 내부화', title: '도매상 자기재고(Principal) 체결', desc: '정규 거래소 없이 NBBO Midpoint 부근 센트 미만 가격($50.025 등)으로 즉시 체결 후 마진 흡수.', meta: '장외 비중 35~38%' },
        { step: 'STEP 5 · 보고 및 청산', title: 'TRF 10초 보고 → SIP · NSCC', desc: 'FINRA TRF에 즉시 보고되어 Consolidated Tape에 기록되고, T+1 기준 NSCC CNS로 98%+ 상쇄 결제.', meta: 'DTCC CNS 98% 상쇄' }
      ]
    },
    'inst-dark': {
      title: '시나리오 2: 대형 기관(연기금) 10만 주 분할 매수 (Dark-First Waterfall)',
      summary: '시장 충격과 HFT 정보 누출을 막기 위해 Parent Order를 쪼갠 뒤 Dark Pool Midpoint에서 먼저 소진하고 남은 물량만 Lit 거래소에 분산합니다.',
      chapterId: 'ch09',
      steps: [
        { step: 'STEP 1 · 모주문 분할', title: 'Parent Order → EMS Algo 분할', desc: '10만 주를 VWAP/IS 알고리즘으로 수백 개의 소형 Child Order(100~300주)로 시간·거래량 분산.', meta: 'Information Leakage 차단' },
        { step: 'STEP 2 · Dark-First', title: 'IEX · ATS Dark Pool 중간가 탐색', desc: 'Lit 호가창에 올리기 전 UBS ATS, Sigma X2, IEX Midpoint 등에서 NBBO 중간가로 조용히 스윕.', meta: '0 슬리피지 · 비공개 체결' },
        { step: 'STEP 3 · Fee Waterfall', title: 'Inverted → Flat → Maker-Taker', desc: '남은 IOC 잔량은 Taker 리베이트를 주는 Inverted(BX·BYX)부터 훑은 뒤 Flat·전통 거래소 타격.', meta: 'Rule 610 Cap 30mil 준수' },
        { step: 'STEP 4 · Passive 대기', title: 'Post-Only / Midpoint Peg 안착', desc: '미체결 잔량은 Post-Only로 Maker 리베이트를 노리거나 IEX 350μs 보호막 아래 Midpoint Peg 대기.', meta: 'Routing Score 최적화' },
        { step: 'STEP 5 · 감사 추적', title: 'CAT (Consolidated Audit Trail)', desc: '모주문 생성부터 분할, 라우팅, 취소, 체결까지 나노/마이크로초 타임스탬프가 Rule 613 CAT DB에 기록.', meta: 'Reg NMS Rule 613' }
      ]
    },
    'inst-iso': {
      title: '시나리오 3: 호가 얇은 급등주 즉시 Sweep (ISO 동시 타격)',
      summary: '타 거래소 최우선 호가가 도망가는(Quote Fading) 위험 없이 여러 거래소의 복수 가격대를 동시에 쓸어 담기 위해 Rule 611(b)(5) 예외 주문인 ISO를 발사합니다.',
      chapterId: 'ch09',
      steps: [
        { step: 'STEP 1 · Direct 스캔', title: '다중 Lit 거래소 호가 잔량 파악', desc: '현재 NBO가 Nasdaq $100.00(300주), NYSE Arca $100.00(200주), Cboe BZX $100.01(500주)임을 SOR이 파악.', meta: 'Proprietary L2/L3 피드' },
        { step: 'STEP 2 · ISO 슬라이스', title: '거래소별 독립 Child ISO 생성', desc: '$100.02까지 1,000주 즉시 확보를 위해 3개 거래소로 보낼 독립 ISO 패킷을 1μs 내 생성.', meta: 'Intermarket Sweep Order' },
        { step: 'STEP 3 · Pacing 발사', title: '지연 동기화 동시 도착 전송', desc: '데이터센터 거리 차이를 보정(Pacing)해 3개 거래소 매칭 엔진에 동시 도착시켜 Quote Fading 차단.', meta: 'Race Condition 방지' },
        { step: 'STEP 4 · Rule 611 면제', title: '수신 거래소 Trade-Through 생략', desc: 'Cboe BZX는 ISO 플래그를 신뢰해 자체 라우팅 없이 $100.01을 즉시 Sweep. 법적 책임은 발주자 100%.', meta: 'Rule 611(b)(5)' },
        { step: 'STEP 5 · 잔량 즉시 취소', title: 'IOC (Sweep & Clear) 마무리', desc: '타 HFT에게 먼저 먹힌 잔량은 호가창에 남기지 않고 즉시 Cancel하여 흔적 최소화.', meta: 'Immediate-or-Cancel' }
      ]
    },
    'passive-moc': {
      title: '시나리오 4: 패시브 인덱스 ETF의 종가 추적 오차 0% 집행 (Closing Auction)',
      summary: 'S&P 500·Nasdaq 100 추종 ETF는 정확히 주상장 거래소 공식 종가(NOCP / NYSE Close)에 100% 체결되어야 Tracking Error가 0이 됩니다.',
      chapterId: 'ch13',
      steps: [
        { step: 'STEP 1 · 종가 주문 집결', title: 'MOC / LOC / Floor Broker D-Order', desc: '대량 설정·환매 물량을 장중 거래 대신 15:50 Lock-in 전 MOC 또는 NYSE Closing D-Order로 집결.', meta: '일거래 6.5~8.5% 집중' },
        { step: 'STEP 2 · 15:50 Lock-in', title: 'NOII / CIB 1초 송출 & 취소 잠금', desc: '15:50부터 매 1초 불균형·Paired Shares·예상 종가 공표. 스푸핑 차단을 위해 취소·정정 전면 잠금.', meta: 'NYSE D-Order 스텔스 유지' },
        { step: 'STEP 3 · 불균형 해소', title: 'Late LOC Sliding · CIO/CO 유입', desc: '불균형이 크면 차익거래자들이 잠금 이후 CIO(Nasdaq)·CO(NYSE)로 반대 물량을 공급해 스프레드 수취.', meta: 'Closing Imbalance Arb' },
        { step: 'STEP 4 · 15:59:50 전이', title: 'NYSE D-Order Unmasked & DMM', desc: 'NYSE는 15:59:50에 D-Order가 확정 지정가로 공개 전환되고, 불균형 심화 시 DMM이 Manual Close 지연.', meta: 'Nasdaq 정각 체결 원칙' },
        { step: 'STEP 5 · 16:00 단일가', title: '공식 종가 확정 및 Parity/시간 배분', desc: 'EP 4단계로 단일 종가 산출. 동일가 내 Nasdaq은 시간 우선, NYSE는 Book·각 Broker·DMM 간 Parity 1/N.', meta: 'Tracking Error = 0%' }
      ]
    },
    'hft-arbitrage': {
      title: '시나리오 5: CME 선물 급등에 반응한 HFT 150μs 현물 선행 매매',
      summary: '시카고(CME) 선물 급등 신호가 마이크로웨이브로 4.0ms 만에 뉴저지로 도착해, SIP보다 빠른 Direct Feed로 지체 호가(Stale Quote)를 타격합니다.',
      chapterId: 'ch10',
      steps: [
        { step: 'STEP 1 · CME 트리거', title: '시카고 Aurora 선물 엔진 급등', desc: '거시 지표·호재로 E-mini S&P 500 선물이 급등. CME 체결 패킷을 HFT 수신기가 즉각 포착.', meta: '1,200km 레이스 시작' },
        { step: 'STEP 2 · Microwave', title: '직선 마이크로웨이브 무선망 (4.0ms)', desc: '광케이블(6.5~7.0ms) 대신 빛 속도의 99%인 대기 중 직선 마이크로웨이브로 2.5ms 먼저 뉴저지 도착.', meta: '편도 4.0~4.1ms' },
        { step: 'STEP 3 · Direct Feed', title: 'Co-location + FPGA Synthetic NBBO', desc: 'SIP 지연(수백 μs~수 ms)을 기다리지 않고 거래소 직결 바이너리 피드로 지체 호가(Stale Quote) 탐지.', meta: 'ITCH / Pillar 직결' },
        { step: 'STEP 4 · 타격 vs 방어', title: '일반 Lit 스나이핑 vs IEX 350μs 차단', desc: '일반 Lit 거래소의 낡은 호가는 ISO로 즉시 먹히지만, IEX에서는 350μs 광케이블 지연 동안 CQI가 방어.', meta: 'IEX Speed Bump' },
        { step: 'STEP 5 · 98% 취소', title: 'Mass Cancel & 장 마감 재고 0', desc: '목표 물량 확보 후 타 거래소 대기 호가 98%+를 나노초 만에 취소하고 16:00 전 포지션 Flat 마감.', meta: 'HFT 취소율 ~98%' }
      ]
    }
  };

  /* =========================================================
     STORAGE HELPERS & APP STATE
     ========================================================= */
  function readStorage(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStorage(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) {}
  }
  function parseJsonStorage(key, fallback) {
    const raw = readStorage(key);
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed !== null && typeof parsed === typeof fallback ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  const state = {
    view: 'home',
    chapterId: readStorage(STORAGE.lastChapter) || 'ch01',
    hasVisitedChapter: Boolean(readStorage(STORAGE.lastChapter)),
    readMode: readStorage(STORAGE.readMode) || 'all',
    fontSize: readStorage(STORAGE.fontSize) || 'md',
    completed: new Set(Array.isArray(parseJsonStorage(STORAGE.completed, [])) ? parseJsonStorage(STORAGE.completed, []) : []),
    bookmarks: new Set(Array.isArray(parseJsonStorage(STORAGE.bookmarks, [])) ? parseJsonStorage(STORAGE.bookmarks, []) : []),
    quizAnswers: parseJsonStorage(STORAGE.quizAnswers, {}),
    flashKnown: new Set(Array.isArray(parseJsonStorage(STORAGE.flashKnown, [])) ? parseJsonStorage(STORAGE.flashKnown, []) : []),
    homePartFilter: 'all',
    lab: 'lab-pfof',
    sublab: 'nasdaq-ep',
    flowScenario: 'retail-clean',
    flowStepIdx: 0,
    flowTimer: null,
    glossaryMode: 'grid',
    glossaryCat: '전체',
    glossaryQuery: '',
    flashIndex: 0,
    flashFlipped: false,
    flashOnlyUnknown: false,
    quizFilter: 'all',
    searchSelectedIndex: 0,
    searchResults: [],
    activePopoverTermIdx: null
  };

  let tocObserver = null;
  let scrollRaf = null;
  let glossaryAliasMap = null;

  /* =========================================================
     UTILITIES
     ========================================================= */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatUsd(val, decimals) {
    const num = Number(val) || 0;
    return (num < 0 ? '-' : '') + '$' + Math.abs(num).toFixed(decimals);
  }

  function formatSignedUsd(val, decimals) {
    const num = Number(val) || 0;
    if (Math.abs(num) < Math.pow(10, -(decimals + 1))) return '$0.' + '0'.repeat(decimals);
    return (num > 0 ? '+' : '-') + '$' + Math.abs(num).toFixed(decimals);
  }

  function getChapterById(id) {
    return DATA.chapters.find((c) => c.id === id) || DATA.chapters[1] || DATA.chapters[0];
  }

  function isNumberedChapter(ch) {
    return Boolean(ch && Number(ch.num) > 0);
  }

  function formatChapterNum(ch) {
    return isNumberedChapter(ch) ? String(ch.num).padStart(2, '0') : 'ALL';
  }

  function formatChapterPrefixedTitle(ch, useShort) {
    const label = useShort ? ch.shortTitle : ch.title;
    return isNumberedChapter(ch) ? `Ch ${formatChapterNum(ch)}. ${label}` : label;
  }

  function getQuizStats() {
    let total = 0;
    let answered = 0;
    let correct = 0;
    DATA.chapters.forEach((ch) => {
      const qzs = ch.quizzes || [];
      const ansMap = state.quizAnswers[ch.id] || {};
      qzs.forEach((qz, qi) => {
        total += 1;
        if (typeof ansMap[qi] === 'number') {
          answered += 1;
          if (ansMap[qi] === qz.ans) correct += 1;
        }
      });
    });
    return { total, answered, correct, wrong: answered - correct };
  }

  /* =========================================================
     GLOSSARY ALIAS INDEX (FOR INLINE READER POPOVERS)
     ========================================================= */
  function buildGlossaryAliasMap() {
    const map = new Map();
    const addKey = (k, idx) => {
      const clean = k.trim().toLowerCase();
      if (clean.length < 2) return;
      if (!map.has(clean)) map.set(clean, idx);
    };

    DATA.glossary.forEach((g, idx) => {
      addKey(g.term, idx);
      const base = g.term.replace(/\([^)]*\)/g, '').trim();
      addKey(base, idx);
      base.split('/').forEach((part) => {
        const p = part.trim();
        if (p.length >= 2 && p !== '복합형' && p !== '독성 오염') addKey(p, idx);
      });
      // Extract parenthetical aliases like (BOATS), (Order Protection), (5% Rule)
      const parens = g.term.match(/\(([^)]+)\)/g) || [];
      parens.forEach((pr) => {
        const inner = pr.slice(1, -1).trim();
        if (/^[A-Za-z0-9\s\-&./%]+$/.test(inner) && inner.length >= 2) {
          addKey(inner, idx);
        }
      });
    });

    // High-value domain aliases matching exact <code> tokens in chapters
    const manualAliases = {
      'sros': 'sro',
      'reg nms': 'regulation nms',
      'reg ats': 'regulation ats',
      'reg sho': 'regulation sho',
      'reg sci': 'regulation sci',
      'reg d': 'regulation d',
      'reg s': 'regulation s',
      'trade-through': 'rule 611',
      'sub-penny': 'rule 612',
      'closing d-order': 'd-order',
      'opening d-order': 'd-order',
      'd-quote': 'd-order',
      'lit market': 'lit vs dark',
      'dark pool': 'dark pool',
      'parent order': 'parent',
      'child order': 'child order',
      'co-location': 'co-location & ports',
      'speed bump': 'speed-bump',
      'price sliding': 'price sliding',
      'late loo': 'price sliding',
      'late loc': 'price sliding',
      'closing cross': 'moc',
      'opening cross': 'moo',
      'dmm interest': 'dmm',
      'trading pause': 'luld',
      'limit state': 'luld',
      'internalization': 'internalization & 독성 오염'
    };

    Object.entries(manualAliases).forEach(([alias, target]) => {
      if (map.has(target) && !map.has(alias)) {
        map.set(alias, map.get(target));
      }
    });

    return map;
  }

  function lookupGlossaryIndex(rawText) {
    if (!glossaryAliasMap) glossaryAliasMap = buildGlossaryAliasMap();
    const cleaned = String(rawText || '').trim().toLowerCase();
    if (!cleaned) return -1;
    if (glossaryAliasMap.has(cleaned)) return glossaryAliasMap.get(cleaned);
    // Strip trailing punctuation/parentheses for codes like `Rule 611(b)(5)` or `Reg NMS Rule 611`
    const noParen = cleaned.replace(/\([^)]*\)/g, '').trim();
    if (glossaryAliasMap.has(noParen)) return glossaryAliasMap.get(noParen);
    const ruleMatch = cleaned.match(/rule\s+\d+[a-z0-9-]*/i);
    if (ruleMatch && glossaryAliasMap.has(ruleMatch[0].toLowerCase())) {
      return glossaryAliasMap.get(ruleMatch[0].toLowerCase());
    }
    return -1;
  }

  function annotateGlossaryCodes(container) {
    if (!container) return 0;
    let count = 0;
    container.querySelectorAll('code').forEach((codeEl) => {
      if (codeEl.closest('pre') || codeEl.closest('.math-formula')) return;
      const idx = lookupGlossaryIndex(codeEl.textContent);
      if (idx !== -1) {
        codeEl.classList.add('term-code');
        codeEl.setAttribute('data-term-idx', String(idx));
        codeEl.setAttribute('role', 'button');
        codeEl.setAttribute('tabindex', '0');
        codeEl.setAttribute('title', `${DATA.glossary[idx].term} — 클릭하여 용어 해설 보기`);
        count += 1;
      }
    });
    return count;
  }

  /* =========================================================
     INLINE TERM POPOVER / MOBILE BOTTOM SHEET
     ========================================================= */
  function openTermPopover(termIdx, anchorEl) {
    const g = DATA.glossary[termIdx];
    const pop = document.getElementById('term-popover');
    const backdrop = document.getElementById('term-popover-backdrop');
    if (!g || !pop || !backdrop) return;

    state.activePopoverTermIdx = termIdx;
    const chObj = getChapterById(g.ch);
    const chLabel = isNumberedChapter(chObj) ? `Ch ${formatChapterNum(chObj)} 원문 보기 →` : '관련 챕터 보기 →';

    document.getElementById('term-popover-cat').textContent = g.cat;
    document.getElementById('term-popover-title').textContent = g.term;
    document.getElementById('term-popover-full').textContent = g.full;
    document.getElementById('term-popover-desc').textContent = g.desc;

    const chBtn = document.getElementById('term-popover-chapter-btn');
    chBtn.textContent = chLabel;
    chBtn.setAttribute('data-popover-ch', g.ch);

    const glBtn = document.getElementById('term-popover-glossary-btn');
    glBtn.setAttribute('data-popover-term', g.term);

    pop.hidden = false;
    backdrop.hidden = false;

    if (window.innerWidth > 768 && anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
      const rect = anchorEl.getBoundingClientRect();
      const popW = Math.min(390, window.innerWidth - 24);
      const popH = pop.offsetHeight || 220;
      let left = Math.min(Math.max(12, rect.left), window.innerWidth - popW - 12);
      let top = rect.bottom + 10;
      if (top + popH > window.innerHeight - 16) {
        top = Math.max(12, rect.top - popH - 10);
      }
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      pop.style.bottom = 'auto';
      pop.style.right = 'auto';
    } else {
      pop.style.left = '';
      pop.style.top = '';
      pop.style.bottom = '';
      pop.style.right = '';
    }
  }

  function closeTermPopover() {
    const pop = document.getElementById('term-popover');
    const backdrop = document.getElementById('term-popover-backdrop');
    if (pop) pop.hidden = true;
    if (backdrop) backdrop.hidden = true;
    state.activePopoverTermIdx = null;
  }

  /* =========================================================
     THEME, FONT SIZE & GLOBAL BADGES
     ========================================================= */
  function syncThemeButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('title', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      writeStorage(STORAGE.theme, 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      writeStorage(STORAGE.theme, 'dark');
    }
    syncThemeButton();
  }

  function applyFontSize(size) {
    state.fontSize = size === 'sm' || size === 'lg' ? size : 'md';
    document.documentElement.setAttribute('data-font-size', state.fontSize);
    writeStorage(STORAGE.fontSize, state.fontSize);
    document.querySelectorAll('.fz-btn[data-font-size]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-font-size') === state.fontSize);
    });
  }

  function updateGlobalTelemetry() {
    const numbered = DATA.chapters.filter(isNumberedChapter);
    const totalCh = numbered.length;
    const doneCount = numbered.filter((c) => state.completed.has(c.id)).length;
    const pct = totalCh > 0 ? Math.round((doneCount / totalCh) * 100) : 0;
    const qz = getQuizStats();

    const progText = document.getElementById('global-progress-text');
    if (progText) progText.textContent = `${doneCount} / ${totalCh} 완료`;

    const navQuiz = document.getElementById('nav-quiz-badge');
    if (navQuiz) navQuiz.textContent = `${qz.correct}/${qz.total}`;

    const gTotal = document.getElementById('glossary-total-num');
    const navCount = document.getElementById('nav-glossary-count');
    if (gTotal) gTotal.textContent = String(DATA.glossary.length);
    if (navCount) navCount.textContent = String(DATA.glossary.length);

    // Hero Telemetry Ring
    const ring = document.getElementById('hero-progress-ring');
    const ringPct = document.getElementById('hero-progress-pct');
    const telTitle = document.getElementById('hero-telemetry-title');
    const telSub = document.getElementById('hero-telemetry-sub');
    if (ring) {
      const circ = 2 * Math.PI * 26;
      ring.style.strokeDasharray = circ.toFixed(2);
      ring.style.strokeDashoffset = (circ * (1 - pct / 100)).toFixed(2);
    }
    if (ringPct) ringPct.textContent = pct + '%';
    if (telTitle) telTitle.textContent = `${totalCh}개 챕터 중 ${doneCount}개 완료`;
    if (telSub) telSub.textContent = `퀴즈 ${qz.correct}/${qz.total} 정답 · 북마크 ${state.bookmarks.size}개`;

    const sidebarFill = document.getElementById('sidebar-progress-fill');
    if (sidebarFill) sidebarFill.style.width = pct + '%';
  }

  /* =========================================================
     ROUTING & VIEW SWITCHING
     ========================================================= */
  function switchView(viewName, opts) {
    const options = opts || {};
    state.view = viewName;
    closeTermPopover();
    stopFlowAutoPlay();

    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.toggle('is-active', sec.id === 'view-' + viewName);
    });

    document.querySelectorAll('.nav-tab[data-view], .bottom-tab[data-view]').forEach((tab) => {
      const active = tab.getAttribute('data-view') === viewName;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.hidden = viewName !== 'reader';
    }
    if (viewName !== 'reader') {
      closeMobileSidebar();
    }

    if (viewName === 'reader') {
      const targetId = options.chapterId || state.chapterId || 'ch01';
      renderReader(targetId);
    } else if (viewName === 'labs') {
      renderLabs();
    } else if (viewName === 'glossary') {
      renderGlossary();
    } else if (viewName === 'quiz') {
      renderQuizChallenge();
    } else if (viewName === 'home') {
      renderHome();
    }

    if (!options.fromHash) {
      let nextHash = '#' + viewName;
      if (viewName === 'reader') nextHash = '#reader/' + state.chapterId;
      else if (viewName === 'labs' && state.lab) nextHash = '#labs/' + state.lab;
      if (window.location.hash !== nextHash) {
        try {
          history.pushState(null, '', nextHash);
        } catch (e) {
          window.location.hash = nextHash;
        }
      }
    }

    if (!options.preserveScroll) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    updateReadingProgress();
  }

  function applyHashRoute() {
    const raw = (window.location.hash || '#home').replace(/^#/, '');
    const parts = raw.split('/');
    const head = parts[0] || 'home';

    if (head === 'reader') {
      const chId = parts[1] && DATA.chapters.some((c) => c.id === parts[1]) ? parts[1] : state.chapterId;
      switchView('reader', { chapterId: chId, fromHash: true });
    } else if (head === 'labs') {
      if (parts[1] && document.getElementById(parts[1])) state.lab = parts[1];
      switchView('labs', { fromHash: true });
    } else if (head === 'glossary') {
      switchView('glossary', { fromHash: true });
    } else if (head === 'quiz') {
      switchView('quiz', { fromHash: true });
    } else {
      switchView('home', { fromHash: true });
    }
  }

  /* =========================================================
     VIEW 1: HOME / INTERACTIVE ATLAS
     ========================================================= */
  function renderHome() {
    updateGlobalTelemetry();
    renderResumeStrip();
    renderInteractiveAtlasMap();
    renderHomeCharts();
    renderHomeFiltersAndGrid();
  }

  function renderResumeStrip() {
    const strip = document.getElementById('resume-strip');
    const heroBtn = document.getElementById('hero-start-btn');
    if (!strip) return;

    if (!state.hasVisitedChapter || !state.chapterId || state.chapterId === 'overview') {
      strip.hidden = true;
      if (heroBtn) heroBtn.textContent = 'Ch 01부터 학습 시작';
      return;
    }

    const ch = getChapterById(state.chapterId);
    const label = formatChapterPrefixedTitle(ch, false);
    if (heroBtn) heroBtn.textContent = `이어서 학습하기 (Ch ${formatChapterNum(ch)})`;

    strip.hidden = false;
    strip.innerHTML = `
      <div class="resume-strip-copy">
        <span class="resume-strip-kicker">CONTINUE READING · 최근 학습 위치</span>
        <span class="resume-strip-title">${escapeHtml(label)}</span>
      </div>
      <button type="button" class="btn btn-sm btn-primary" data-open-chapter="${escapeHtml(ch.id)}">이어서 읽기 →</button>
    `;
  }

  function renderInteractiveAtlasMap() {
    const wrap = document.getElementById('interactive-atlas-map');
    if (!wrap) return;

    wrap.innerHTML = PART_META.map((part) => {
      const chs = DATA.chapters.filter((c) => c.part === part.key);
      const done = chs.filter((c) => state.completed.has(c.id)).length;
      const nodes = chs
        .map((ch) => {
          const isDone = state.completed.has(ch.id);
          return `
            <button type="button" class="atlas-node-btn" data-open-chapter="${escapeHtml(ch.id)}">
              <span class="atlas-node-num">${formatChapterNum(ch)}</span>
              <span class="atlas-node-label">${escapeHtml(ch.shortTitle)}</span>
              ${isDone ? '<span class="atlas-node-done" aria-label="완료">✓</span>' : ''}
            </button>`;
        })
        .join('');
      return `
        <div class="atlas-layer-card ${part.layerClass}">
          <div class="atlas-layer-top">
            <span class="atlas-layer-num">${part.layerNum}</span>
            <span class="badge ${part.badgeClass}">${done}/${chs.length}</span>
          </div>
          <h3>${escapeHtml(part.shortTitle)}</h3>
          <p class="atlas-layer-desc">${escapeHtml(part.desc)}</p>
          <div class="atlas-nodes">${nodes}</div>
        </div>`;
    }).join('');
  }

  function renderHomeCharts() {
    const shareRibbon = document.getElementById('home-share-ribbon');
    const shareEl = document.getElementById('home-share-chart');
    const shareDetail = document.getElementById('home-share-detail');

    const shareRows = [
      { label: 'OTC 내부화 (도매상)', mid: 36.5, range: '35~38%', color: 'var(--amber)', note: 'Citadel·Virtu 등 Wholesaler가 리테일 Clean Flow를 장외에서 자기자본으로 직접 체결하는 비중(35~38%)입니다.' },
      { label: 'NYSE Group (정규)', mid: 19.5, range: '18~21%', color: 'var(--primary)', note: 'NYSE·NYSE Arca·American·National·Chicago 5개 거래소 합산 점유율(18~21%)로 정규 거래소 1위 그룹입니다.' },
      { label: 'Nasdaq Group (정규)', mid: 17.0, range: '16~18%', color: 'var(--teal)', note: 'Nasdaq(XNAS)·BX(인버티드)·PSX 3개 거래소 합산 점유율(16~18%)이며 테크주·ETF Closing Cross 핵심 거점입니다.' },
      { label: 'ATS (다크풀·ECN)', mid: 12.5, range: '11~14%', color: 'var(--purple)', note: 'UBS ATS, MS Pool, IntelligentCross, Blue Ocean 등 40여 개 대체거래시스템 합산 비중(11~14%)입니다.' },
      { label: 'Cboe Group (정규)', mid: 11.5, range: '10~13%', color: '#4f46e5', note: 'BZX·BYX·EDGA·EDGX 4개 멀티 북 체제로 ETP 상장 및 메이커-테이커/인버티드 혼합 점유율(10~13%)을 기록합니다.' },
      { label: '독립 Lit (IEX·MEMX)', mid: 6.0, range: '5~7%', color: 'var(--emerald)', note: 'IEX(350μs 스피드 범프), MEMX(월가 컨소시엄), MIAX Pearl 등 독립 정규거래소 합산 비중(5~7%)입니다.' }
    ];

    if (shareRibbon) {
      shareRibbon.innerHTML = shareRows
        .map((r, i) => `<div class="share-ribbon-seg" data-share-idx="${i}" style="width:${r.mid}%;background:${r.color};" title="${escapeHtml(r.label)}: ${r.range}"></div>`)
        .join('');
    }
    if (shareEl) {
      shareEl.innerHTML = shareRows
        .map(
          (row, i) => `
          <div class="bar-row" data-share-idx="${i}" tabindex="0">
            <span class="bar-label" title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</span>
            <div class="bar-track" aria-hidden="true">
              <div class="bar-fill" style="width:${row.mid * 2.2}%;max-width:100%;background:${row.color};"></div>
            </div>
            <span class="bar-val">${escapeHtml(row.range)}</span>
          </div>`
        )
        .join('');

      const updateShareNote = (idx) => {
        const row = shareRows[idx];
        if (!row || !shareDetail) return;
        shareEl.querySelectorAll('.bar-row').forEach((el, j) => el.classList.toggle('is-focused', j === idx));
        shareDetail.innerHTML = `<strong>${escapeHtml(row.label)} (${escapeHtml(row.range)})</strong> — ${escapeHtml(row.note)}`;
      };
      shareEl.onmouseover = (e) => {
        const rowEl = e.target.closest('[data-share-idx]');
        if (rowEl) updateShareNote(Number(rowEl.getAttribute('data-share-idx')));
      };
      shareEl.onclick = (e) => {
        const rowEl = e.target.closest('[data-share-idx]');
        if (rowEl) updateShareNote(Number(rowEl.getAttribute('data-share-idx')));
      };
    }

    const revEl = document.getElementById('home-rev-chart');
    const revDetail = document.getElementById('home-rev-detail');
    const revRows = [
      { label: 'ICE / NYSE (~$2.8B)', trading: 30, data: 28, conn: 22, list: 20, tag: '비거래 70%', note: '순거래 체결 30% · 마켓 데이터 28% · 코로케이션/접속 22% · 상장/기타 20%' },
      { label: 'Nasdaq (~$2.5B)', trading: 36, data: 29, conn: 17, list: 18, tag: '비거래 64%', note: '순거래 체결 36% · 마켓 데이터 29% · 코로케이션/접속 17% · 상장/기타 18%' },
      { label: 'Cboe 4사 (~$0.42B)', trading: 33, data: 38, conn: 27, list: 2, tag: '비거래 67%', note: '순거래 체결 33% · 마켓 데이터 38% · 접속료 27% · 상장 2% (데이터·접속 비중 65%)' },
      { label: 'IEX (~$0.11B)', trading: 78, data: 9, conn: 13, list: 0, tag: '체결 78%', note: 'Flat-Fee 단일 요율 기반 순체결 78% · 데이터 9% · 접속료 13% (상장 수익 없음)' }
    ];

    if (revEl) {
      const legend = `
        <div class="stacked-legend">
          <span><i class="legend-dot" style="background:var(--primary)"></i>순거래 체결</span>
          <span><i class="legend-dot" style="background:var(--teal)"></i>마켓 데이터</span>
          <span><i class="legend-dot" style="background:var(--purple)"></i>접속·코로케이션</span>
          <span><i class="legend-dot" style="background:var(--amber)"></i>상장·기타</span>
        </div>`;
      const bars = revRows
        .map(
          (r, i) => `
          <div class="bar-row" data-rev-idx="${i}" tabindex="0">
            <span class="bar-label" title="${escapeHtml(r.label)}">${escapeHtml(r.label)}</span>
            <div class="bar-track">
              <div style="width:${r.trading}%;background:var(--primary);height:100%"></div>
              <div style="width:${r.data}%;background:var(--teal);height:100%"></div>
              <div style="width:${r.conn}%;background:var(--purple);height:100%"></div>
              <div style="width:${r.list}%;background:var(--amber);height:100%"></div>
            </div>
            <span class="bar-val">${escapeHtml(r.tag)}</span>
          </div>`
        )
        .join('');
      revEl.innerHTML = legend + bars;

      const updateRevNote = (idx) => {
        const r = revRows[idx];
        if (!r || !revDetail) return;
        revEl.querySelectorAll('.bar-row').forEach((el, j) => el.classList.toggle('is-focused', j === idx));
        revDetail.innerHTML = `<strong>${escapeHtml(r.label)}</strong> — ${escapeHtml(r.note)}`;
      };
      revEl.onmouseover = (e) => {
        const rowEl = e.target.closest('[data-rev-idx]');
        if (rowEl) updateRevNote(Number(rowEl.getAttribute('data-rev-idx')));
      };
      revEl.onclick = (e) => {
        const rowEl = e.target.closest('[data-rev-idx]');
        if (rowEl) updateRevNote(Number(rowEl.getAttribute('data-rev-idx')));
      };
    }
  }

  function renderHomeFiltersAndGrid() {
    const filterEl = document.getElementById('home-part-filters');
    const grid = document.getElementById('home-parts-grid');
    if (!filterEl || !grid) return;

    const numbered = DATA.chapters.filter(isNumberedChapter);
    const todoCount = numbered.filter((c) => !state.completed.has(c.id)).length;
    const bmCount = numbered.filter((c) => state.bookmarks.has(c.id)).length;

    const filters = [
      { key: 'all', label: `전체 (${numbered.length})` },
      { key: 'Part I', label: 'Part I 법규' },
      { key: 'Part II', label: 'Part II 참여자' },
      { key: 'Part III', label: 'Part III Order Flow' },
      { key: 'Part IV', label: 'Part IV Trading Rule' },
      { key: 'todo', label: `미완료 (${todoCount})` },
      { key: 'bookmarks', label: `북마크 (${bmCount})` }
    ];

    filterEl.innerHTML = filters
      .map(
        (f) =>
          `<button type="button" class="filter-chip${state.homePartFilter === f.key ? ' is-active' : ''}" data-home-filter="${escapeHtml(f.key)}">${escapeHtml(f.label)}</button>`
      )
      .join('');

    const sectionsHtml = PART_META.map((part) => {
      if (state.homePartFilter.startsWith('Part ') && state.homePartFilter !== part.key) return '';
      let partChapters = DATA.chapters.filter((c) => c.part === part.key);
      const totalInPart = partChapters.length;
      const doneInPart = partChapters.filter((c) => state.completed.has(c.id)).length;

      if (state.homePartFilter === 'todo') {
        partChapters = partChapters.filter((c) => !state.completed.has(c.id));
      } else if (state.homePartFilter === 'bookmarks') {
        partChapters = partChapters.filter((c) => state.bookmarks.has(c.id));
      }
      if (!partChapters.length) return '';

      const pct = totalInPart > 0 ? Math.round((doneInPart / totalInPart) * 100) : 0;

      const cards = partChapters
        .map((ch) => {
          const isDone = state.completed.has(ch.id);
          const isBm = state.bookmarks.has(ch.id);
          const qzs = ch.quizzes || [];
          const ansMap = state.quizAnswers[ch.id] || {};
          const qzCorrect = qzs.filter((q, i) => ansMap[i] === q.ans).length;
          const qzBadge = qzs.length
            ? `<span class="badge ${qzCorrect === qzs.length ? 'badge-emerald' : 'badge-blue'}">퀴즈 ${qzCorrect}/${qzs.length}</span>`
            : '';

          return `
            <button type="button" class="chapter-card" data-open-chapter="${escapeHtml(ch.id)}">
              <div>
                <div class="chapter-card-top">
                  <div class="chapter-card-badges">
                    <span class="ch-num-pill">Ch ${formatChapterNum(ch)}</span>
                    ${isDone ? '<span class="ch-done-pill">✓ 완료</span>' : ''}
                    ${qzBadge}
                  </div>
                  ${isBm ? '<span class="ch-bm-star" title="북마크됨">★</span>' : ''}
                </div>
                <h4>${escapeHtml(ch.title)}</h4>
              </div>
              <div class="chapter-card-meta">
                <span>${escapeHtml(ch.sourceRef || '')}</span>
                <span>약 ${ch.readMin}분</span>
              </div>
            </button>`;
        })
        .join('');

      return `
        <section class="part-block">
          <div class="part-block-head">
            <div>
              <h3>${escapeHtml(part.title)}</h3>
              <p class="muted-small" style="margin:4px 0 0">${escapeHtml(part.desc)}</p>
            </div>
            <div class="part-progress-wrap">
              <span class="badge ${part.badgeClass}">${doneInPart}/${totalInPart} 완료</span>
              <div class="part-progress-bar" aria-hidden="true"><div class="part-progress-fill" style="width:${pct}%"></div></div>
            </div>
          </div>
          <div class="part-chapters-row">${cards}</div>
        </section>`;
    })
      .filter(Boolean)
      .join('');

    grid.innerHTML =
      sectionsHtml ||
      '<div class="surface-card"><p class="muted-small" style="margin:0">선택한 필터 조건에 해당하는 챕터가 없습니다.</p></div>';
  }

  /* =========================================================
     VIEW 2: INTELLIGENT CHAPTER READER
     ========================================================= */
  function openMobileSidebar() {
    const sidebar = document.getElementById('reader-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btn = document.getElementById('mobile-menu-btn');
    if (sidebar) sidebar.classList.add('is-open');
    if (backdrop) backdrop.hidden = false;
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('reader-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btn = document.getElementById('mobile-menu-btn');
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  }

  function renderSidebar() {
    const navList = document.getElementById('sidebar-nav-list');
    if (!navList) return;

    const groups = [
      { key: 'Overview', label: '전체 안내' },
      ...PART_META.map((p) => ({ key: p.key, label: p.key }))
    ];

    navList.innerHTML = groups
      .map((grp) => {
        const items = DATA.chapters.filter((c) => c.part === grp.key);
        if (!items.length) return '';
        const doneInGrp = items.filter((c) => state.completed.has(c.id)).length;
        const countTag = grp.key === 'Overview' ? '' : `<span>${doneInGrp}/${items.length}</span>`;
        const itemsHtml = items
          .map((ch) => {
            const active = ch.id === state.chapterId;
            const done = state.completed.has(ch.id);
            const bm = state.bookmarks.has(ch.id);
            return `
              <button type="button" class="sidebar-item" data-open-chapter="${escapeHtml(ch.id)}" ${active ? 'aria-current="page"' : ''}>
                <span class="sidebar-item-left">
                  <span class="sidebar-num">${formatChapterNum(ch)}</span>
                  <span class="sidebar-label">${escapeHtml(ch.shortTitle)}</span>
                </span>
                <span class="sidebar-flags">
                  ${bm ? '<span class="sidebar-star" aria-label="북마크">★</span>' : ''}
                  ${done ? '<span class="sidebar-check" aria-label="완료">✓</span>' : ''}
                </span>
              </button>`;
          })
          .join('');
        return `
          <div class="sidebar-group">
            <div class="sidebar-group-title"><span>${escapeHtml(grp.label)}</span>${countTag}</div>
            ${itemsHtml}
          </div>`;
      })
      .join('');
  }

  function applyReadMode(chapter) {
    const coreEl = document.getElementById('chapter-body-core');
    const bannerEl = document.getElementById('chapter-supp-banner');
    const suppEl = document.getElementById('chapter-body-supp');
    const hasSupp = Boolean(chapter.suppHtml && chapter.suppHtml.trim().length > 0);

    document.querySelectorAll('.mode-btn[data-read-mode]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-read-mode') === state.readMode);
    });

    if (coreEl) coreEl.classList.toggle('is-hidden', state.readMode === 'supp' && hasSupp);
    if (bannerEl) bannerEl.hidden = !(hasSupp && state.readMode === 'all');

    if (suppEl) {
      if (state.readMode === 'core') {
        suppEl.classList.add('is-hidden');
      } else if (!hasSupp && state.readMode === 'supp') {
        suppEl.classList.remove('is-hidden');
        suppEl.innerHTML =
          '<p class="muted-small">이 문서는 전체 구조 안내 가이드이므로 별도 추가 설명 구분 없이 통합 구성되어 있습니다. 상단 <strong>전체 보기</strong> 모드로 읽어보세요.</p>';
      } else {
        suppEl.classList.toggle('is-hidden', !hasSupp);
        suppEl.innerHTML = hasSupp ? chapter.suppHtml : '';
        if (hasSupp) annotateGlossaryCodes(suppEl);
      }
    }
  }

  function renderChapterToc(chapter) {
    const tocList = document.getElementById('chapter-toc-list');
    const tocGlossary = document.getElementById('toc-glossary-box');
    const mobileTocPanel = document.getElementById('mobile-toc-panel');
    const mobileTocList = document.getElementById('mobile-toc-list');
    const mobileTocGlossary = document.getElementById('mobile-toc-glossary');
    const hasSupp = Boolean(chapter.suppHtml && chapter.suppHtml.trim().length > 0);

    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = null;
    }
    if (mobileTocPanel) mobileTocPanel.open = false;

    const visibleToc = (chapter.toc || []).filter((item) => {
      if (state.readMode === 'core') return item.section === 'core';
      if (state.readMode === 'supp' && hasSupp) return item.section === 'supp';
      return true;
    });

    const tocHtml = !visibleToc.length
      ? '<span class="muted-small">표시할 하위 목차가 없습니다.</span>'
      : visibleToc
          .map(
            (item, idx) => `
            <a href="#${escapeHtml(item.id)}" class="toc-link level-${item.level}${idx === 0 ? ' is-active' : ''}" data-toc-target="${escapeHtml(item.id)}">
              ${escapeHtml(item.text)}
            </a>`
          )
          .join('');

    if (tocList) tocList.innerHTML = tocHtml;
    if (mobileTocList) mobileTocList.innerHTML = tocHtml;

    if (visibleToc.length) {
      const targets = visibleToc.map((item) => document.getElementById(item.id)).filter(Boolean);
      if ('IntersectionObserver' in window && targets.length) {
        tocObserver = new IntersectionObserver(
          (entries) => {
            const visible = entries.filter((e) => e.isIntersecting);
            if (visible.length) {
              const activeId = visible[0].target.id;
              document.querySelectorAll('.toc-link[data-toc-target]').forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('data-toc-target') === activeId);
              });
            }
          },
          { rootMargin: '-84px 0px -70% 0px', threshold: 0.01 }
        );
        targets.forEach((el) => tocObserver.observe(el));
      }
    }

    const matched = DATA.glossary
      .map((g, idx) => ({ g, idx }))
      .filter((item) => item.g.ch === chapter.id);

    const glossaryHtml = !matched.length
      ? ''
      : `
        <div class="toc-title">이 챕터 핵심 용어 (${matched.length})</div>
        <div class="toc-chip-wrap">
          ${matched
            .map(
              ({ g, idx }) =>
                `<button type="button" class="toc-chip" data-term-idx="${idx}" title="${escapeHtml(g.full)}">${escapeHtml(g.term)}</button>`
            )
            .join('')}
        </div>`;

    if (tocGlossary) tocGlossary.innerHTML = glossaryHtml;
    if (mobileTocGlossary) mobileTocGlossary.innerHTML = glossaryHtml;
    if (mobileTocPanel) mobileTocPanel.hidden = !visibleToc.length && !matched.length;
  }

  function renderLabBridge(chapter) {
    const bridge = document.getElementById('chapter-lab-bridge');
    if (!bridge) return;
    const matchedLab = LAB_CATALOG.find((lab) => lab.chapters.includes(chapter.id));
    if (!matchedLab) {
      bridge.hidden = true;
      bridge.innerHTML = '';
      return;
    }
    bridge.hidden = false;
    bridge.innerHTML = `
      <div class="lab-bridge-copy">
        <span class="card-kicker" style="margin-bottom:2px">INTERACTIVE LAB · 직접 실험하기</span>
        <strong>${escapeHtml(matchedLab.title)}</strong>
        <span>${escapeHtml(matchedLab.desc)}</span>
      </div>
      <button type="button" class="btn btn-sm btn-primary" data-jump-lab="${escapeHtml(matchedLab.id)}">시뮬레이터 열기 →</button>
    `;
  }

  function renderQuizBox(chapter) {
    const quizBox = document.getElementById('chapter-quiz-box');
    if (!quizBox) return;
    const quizzes = chapter.quizzes || [];
    if (!quizzes.length) {
      quizBox.hidden = true;
      quizBox.innerHTML = '';
      return;
    }
    quizBox.hidden = false;
    const chosenMap = state.quizAnswers[chapter.id] || {};

    quizBox.innerHTML =
      `<div class="quiz-box-head">
         <h3>이해도 점검 퀴즈 (${quizzes.length}문항)</h3>
         <button type="button" class="link-chip" data-jump-view="quiz">전체 퀴즈 챌린지 →</button>
       </div>` +
      quizzes
        .map((qz, qi) => {
          const picked = chosenMap[qi];
          const answered = typeof picked === 'number';
          const optsHtml = qz.opts
            .map((opt, oi) => {
              let cls = 'quiz-opt-btn';
              if (answered) {
                if (oi === qz.ans) cls += ' is-correct';
                else if (oi === picked) cls += ' is-wrong';
              }
              const optContent = (qz.optsHtml && qz.optsHtml[oi]) || escapeHtml(opt);
              return `<button type="button" class="${cls}" data-quiz-ch="${escapeHtml(chapter.id)}" data-quiz-idx="${qi}" data-opt-idx="${oi}">${optContent}</button>`;
            })
            .join('');
          const expContent = qz.expHtml || escapeHtml(qz.exp);
          const expHtml = answered
            ? `<div class="quiz-exp"><strong>${picked === qz.ans ? '정답!' : '오답입니다.'}</strong> ${expContent}</div>`
            : '';
          const qContent = qz.qHtml || escapeHtml(qz.q);
          return `
            <div class="quiz-item">
              <div class="quiz-q">Q${qi + 1}. ${qContent}</div>
              <div class="quiz-opts">${optsHtml}</div>
              ${expHtml}
            </div>`;
        })
        .join('');
  }

  function syncReaderActionButtons() {
    const compBtn = document.getElementById('toggle-complete-btn');
    if (compBtn) {
      const isDone = state.completed.has(state.chapterId);
      compBtn.classList.toggle('btn-completed', isDone);
      compBtn.textContent = isDone ? '✓ 완료됨' : '✓ 학습 완료';
      compBtn.hidden = state.chapterId === 'overview';
    }
    const bmBtn = document.getElementById('toggle-bookmark-btn');
    if (bmBtn) {
      const isBm = state.bookmarks.has(state.chapterId);
      bmBtn.classList.toggle('is-bookmarked', isBm);
      bmBtn.setAttribute('aria-pressed', String(isBm));
      bmBtn.setAttribute('title', isBm ? '북마크 해제' : '북마크 추가');
      bmBtn.hidden = state.chapterId === 'overview';
    }
  }

  function renderReader(chapterId) {
    const ch = getChapterById(chapterId);
    state.chapterId = ch.id;
    if (ch.id !== 'overview') {
      state.hasVisitedChapter = true;
      writeStorage(STORAGE.lastChapter, ch.id);
    }

    renderSidebar();

    const headerCard = document.getElementById('chapter-header-card');
    if (headerCard) {
      const partCfg = PART_META.find((p) => p.key === ch.part);
      const badgeCls = partCfg ? partCfg.badgeClass : 'badge-emerald';
      const numLabel = isNumberedChapter(ch) ? `Chapter ${formatChapterNum(ch)}` : 'Guide';
      const qItems =
        ch.questionsHtml && ch.questionsHtml.length
          ? ch.questionsHtml
          : (ch.questions || []).map((q) => escapeHtml(q));
      const questionsHtml = qItems.length
        ? `<div class="ch-questions-box">
             <strong>핵심 질문 · KEY QUESTIONS</strong>
             <ol>${qItems.map((qHtml) => `<li>${qHtml}</li>`).join('')}</ol>
           </div>`
        : '';

      headerCard.innerHTML = `
        <div class="ch-header-badges">
          <span class="badge ${badgeCls}">${escapeHtml(ch.partLabel || ch.part)}</span>
          <span class="badge badge-blue">${escapeHtml(numLabel)}</span>
          <span class="ch-source-ref">${escapeHtml(ch.sourceRef || '')} · 약 ${ch.readMin}분 · <code>${escapeHtml(ch.mdPath)}</code></span>
        </div>
        <h1>${escapeHtml(ch.title)}</h1>
        ${questionsHtml}
      `;
    }

    const coreEl = document.getElementById('chapter-body-core');
    const suppEl = document.getElementById('chapter-body-supp');
    if (coreEl) {
      coreEl.innerHTML = ch.coreHtml || '';
      const taggedCore = annotateGlossaryCodes(coreEl);
      const hintStrip = document.getElementById('term-hint-strip');
      if (hintStrip) hintStrip.hidden = taggedCore === 0;
    }
    if (suppEl) suppEl.innerHTML = ch.suppHtml || '';

    applyReadMode(ch);
    syncReaderActionButtons();
    renderChapterToc(ch);
    renderLabBridge(ch);
    renderQuizBox(ch);

    const footerNav = document.getElementById('chapter-footer-nav');
    if (footerNav) {
      const idx = DATA.chapters.findIndex((c) => c.id === ch.id);
      const prevCh = idx > 0 ? DATA.chapters[idx - 1] : null;
      const nextCh = idx >= 0 && idx < DATA.chapters.length - 1 ? DATA.chapters[idx + 1] : null;

      footerNav.innerHTML = `
        ${
          prevCh
            ? `<button type="button" class="ch-nav-card prev" data-open-chapter="${escapeHtml(prevCh.id)}">
                 <span class="ch-nav-dir">← 이전 챕터</span>
                 <span class="ch-nav-title">${escapeHtml(formatChapterPrefixedTitle(prevCh, true))}</span>
               </button>`
            : '<div></div>'
        }
        ${
          nextCh
            ? `<button type="button" class="ch-nav-card next" data-open-chapter="${escapeHtml(nextCh.id)}">
                 <span class="ch-nav-dir">다음 챕터 →</span>
                 <span class="ch-nav-title">${escapeHtml(formatChapterPrefixedTitle(nextCh, true))}</span>
               </button>`
            : '<div></div>'
        }
      `;
    }
  }

  function updateReadingProgress() {
    const topBtn = document.getElementById('back-to-top-btn');
    if (topBtn) topBtn.hidden = window.scrollY < 360;

    const bar = document.getElementById('reading-progress-bar');
    const pctEl = document.getElementById('toc-read-pct');
    if (!bar) return;
    if (state.view !== 'reader') {
      bar.style.width = '0%';
      return;
    }
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll <= 0 ? 100 : Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
    bar.style.width = pct.toFixed(1) + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  }

  /* =========================================================
     VIEW 3: INTERACTIVE LABS (4 VISUAL SIMULATORS)
     ========================================================= */
  function renderLabs() {
    document.querySelectorAll('.lab-tab[data-lab]').forEach((tab) => {
      const active = tab.getAttribute('data-lab') === state.lab;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.lab-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === state.lab);
    });
    document.querySelectorAll('.mode-btn[data-sublab]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-sublab') === state.sublab);
    });
    document.querySelectorAll('.sublab-box').forEach((box) => {
      box.classList.toggle('is-active', box.id === 'sublab-' + state.sublab);
    });

    calculateLab1();
    calculateLab2Nasdaq();
    calculateLab2NyseDorder();
    calculateLab2Parity();
    renderLab3();
    calculateLab4Mwcb();
    calculateLab4Luld();
  }

  /* LAB 1: PFOF & Fee Structure Economics + Visual Spread Ruler */
  function calculateLab1() {
    const out = document.getElementById('lab1-results');
    if (!out) return;

    const shares = Math.max(1, Number(document.getElementById('lab1-shares')?.value || 1000));
    const nbb = Math.max(0.01, Number(document.getElementById('lab1-nbb')?.value || 50));
    const rawNbo = Math.max(0.01, Number(document.getElementById('lab1-nbo')?.value || 50.04));
    const nbo = Math.max(nbb, rawNbo);
    const spread = Math.max(0, nbo - nbb);
    const mid = (nbb + nbo) / 2;
    const spreadBps = mid > 0 ? (spread / mid) * 10000 : 0;

    const piInput = Math.max(0, Number(document.getElementById('lab1-pi')?.value || 0));
    const pi = Math.min(piInput, spread);
    const pfof = Math.max(0, Number(document.getElementById('lab1-pfof')?.value || 0));
    const rawTakeMil = Math.max(0, Number(document.getElementById('lab1-take')?.value || 0));
    const takeMil = Math.min(3.0, rawTakeMil);
    const rebateMil = Math.max(0, Number(document.getElementById('lab1-rebate')?.value || 0));
    const invFeeMil = Math.max(0, Number(document.getElementById('lab1-inv-fee')?.value || 0));
    const invRebMil = Math.max(0, Number(document.getElementById('lab1-inv-reb')?.value || 0));
    const iexFeeMil = 0.9;

    const wsBuyPrice = nbo - pi;
    const wsSellPrice = nbb + pi;
    const investorSavedVsNbo = pi * shares;
    const brokerPfofTotal = pfof * shares;
    const wsEdgeVsMid = (wsBuyPrice - mid) * shares;
    const wsRoundTripCapture = (spread - 2 * pi - 2 * pfof) * shares;

    const litTakerFee = -(takeMil * 0.001) * shares;
    const litMakerReb = rebateMil * 0.001 * shares;
    const litNetCap = (takeMil - rebateMil) * 0.001 * shares;

    const invTakerReb = invRebMil * 0.001 * shares;
    const invMakerFee = -(invFeeMil * 0.001) * shares;
    const invNetCap = (invFeeMil - invRebMil) * 0.001 * shares;

    const iexTakerFee = -(iexFeeMil * 0.001) * shares;
    const iexNetCap = (iexFeeMil * 2 * 0.001) * shares;

    // Spread Ruler positions (0% = NBB, 50% = Mid, 100% = NBO)
    const wsPos = spread > 0 ? Math.min(100, Math.max(0, ((wsBuyPrice - nbb) / spread) * 100)) : 50;
    const piLeft = wsPos;
    const piWidth = Math.max(0, 100 - wsPos);
    const edgeLeft = Math.min(50, wsPos);
    const edgeWidth = Math.abs(wsPos - 50);

    const rule610Warn =
      rawTakeMil > 3.0
        ? `<div class="callout callout-tip" style="margin:0 0 12px"><strong>Reg NMS Rule 610 상한 적용:</strong> 입력한 ${rawTakeMil.toFixed(1)}밀은 법정 상한(3.0밀 = $0.0030)을 초과하여 <strong>3.0밀</strong>로 제한 계산되었습니다.</div>`
        : '';

    out.innerHTML = `
      ${rule610Warn}
      <div class="ruler-box">
        <div class="ruler-title">NBBO 스프레드 체결 위치 시각화 (매수 주문 기준)</div>
        <div class="ruler-track">
          <div class="ruler-fill-edge" style="left:${edgeLeft.toFixed(1)}%;width:${edgeWidth.toFixed(1)}%" title="도매상 Mid 대비 엣지"></div>
          <div class="ruler-fill-pi" style="left:${piLeft.toFixed(1)}%;width:${piWidth.toFixed(1)}%" title="투자자 가격 개선 구간"></div>
          <div class="ruler-pin" style="left:50%;background:var(--muted)"><span class="ruler-pin-label bottom" style="color:var(--muted)">Mid ${formatUsd(mid, 3)}</span></div>
          <div class="ruler-pin" style="left:${wsPos.toFixed(1)}%;background:var(--emerald)"><span class="ruler-pin-label top" style="color:var(--emerald)">체결 ${formatUsd(wsBuyPrice, 4)}</span></div>
        </div>
        <div class="ruler-ends">
          <span>NBB ${formatUsd(nbb, 2)}</span>
          <span style="color:var(--emerald)">가격 개선 -${formatUsd(pi, 4)}/주</span>
          <span>NBO ${formatUsd(nbo, 2)}</span>
        </div>
      </div>

      <div class="lab-metric-grid">
        <div class="lab-metric">
          <small>NBBO 스프레드 · Midpoint</small>
          <strong>${formatUsd(spread, 2)} (${spreadBps.toFixed(1)}bp)</strong>
          <small>중간가 ${formatUsd(mid, 4)}</small>
        </div>
        <div class="lab-metric">
          <small>도매상 매수 체결가 (Sub-penny)</small>
          <strong>${formatUsd(wsBuyPrice, 4)}</strong>
          <small>투자자 NBO 대비 ${formatSignedUsd(investorSavedVsNbo, 2)} 절감</small>
        </div>
        <div class="lab-metric">
          <small>리테일 브로커 PFOF 수취</small>
          <strong>${formatSignedUsd(brokerPfofTotal, 2)}</strong>
          <small>주당 $${pfof.toFixed(4)} (${(pfof * 1000).toFixed(2)}밀)</small>
        </div>
        <div class="lab-metric">
          <small>도매상 단방향 vs 양방향 순캡처</small>
          <strong>${formatSignedUsd(wsEdgeVsMid, 2)} / ${formatSignedUsd(wsRoundTripCapture, 2)}</strong>
          <small>Mid 엣지 / 매수·매도 상계 후</small>
        </div>
      </div>

      <div class="table-scroll">
        <table class="lab-table">
          <thead>
            <tr>
              <th>체결 경로 (${shares.toLocaleString()}주)</th>
              <th>실체결 가격</th>
              <th>Taker 손익/비용</th>
              <th>Maker · 브로커</th>
              <th>플랫폼 순마진</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Wholesaler (OTC)</strong></td>
              <td>${formatUsd(wsBuyPrice, 4)}<br><small>(매도 ${formatUsd(wsSellPrice, 4)})</small></td>
              <td>NBO 대비 <strong>${formatSignedUsd(investorSavedVsNbo, 2)}</strong> 개선</td>
              <td>PFOF ${formatSignedUsd(brokerPfofTotal, 2)}</td>
              <td>왕복 ${formatSignedUsd(wsRoundTripCapture, 2)}</td>
            </tr>
            <tr>
              <td><strong>Lit Maker-Taker</strong></td>
              <td>${formatUsd(nbo, 2)}</td>
              <td>${formatSignedUsd(litTakerFee, 2)} (-${takeMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(litMakerReb, 2)} (+${rebateMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(litNetCap, 2)}</td>
            </tr>
            <tr>
              <td><strong>Inverted (BX·BYX)</strong></td>
              <td>${formatUsd(nbo, 2)}</td>
              <td>${formatSignedUsd(invTakerReb, 2)} (+${invRebMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(invMakerFee, 2)} (-${invFeeMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(invNetCap, 2)}</td>
            </tr>
            <tr>
              <td><strong>Flat-Fee (IEX)</strong></td>
              <td>${formatUsd(nbo, 2)}</td>
              <td>${formatSignedUsd(iexTakerFee, 2)} (-${iexFeeMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(iexTakerFee, 2)} (-${iexFeeMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(iexNetCap, 2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /* LAB 2A: Nasdaq Late LOC Sliding & EP 4-Step */
  function calculateLab2Nasdaq() {
    const slidBox = document.getElementById('lab2-sliding-result');
    const tableWrap = document.getElementById('lab2-ep-table-wrap');
    const summaryEl = document.getElementById('lab2-ep-summary');
    if (!slidBox || !tableWrap || !summaryEl) return;

    const bid = Number(document.getElementById('lab2-bid')?.value || 99.9);
    const ask = Number(document.getElementById('lab2-ask')?.value || 100.1);
    const last = Number(document.getElementById('lab2-last')?.value || 100.05);
    const locPrice = Number(document.getElementById('lab2-loc-price')?.value || 100.5);
    const locQty = Math.max(0, Number(document.getElementById('lab2-loc-qty')?.value || 0));

    const isCrossed = bid > ask;
    const refCap = isCrossed ? last : Math.max(ask, last);
    const effectiveLoc = Math.min(locPrice, refCap);
    const wasSlid = locPrice > refCap;

    slidBox.innerHTML = `
      <strong>15:55 Late LOC Price Sliding 판정 (${isCrossed ? 'Crossed 예외' : '정상/Locked 시장'})</strong><br>
      매수 상한(Reference Price) = ${isCrossed ? `Last Sale $${last.toFixed(2)}` : `Max(Best Offer $${ask.toFixed(2)}, Last Sale $${last.toFixed(2)})`} = <strong>$${refCap.toFixed(2)}</strong><br>
      제출가 <code>$${locPrice.toFixed(2)}</code> → 최종 유효가 <strong><code>$${effectiveLoc.toFixed(2)}</code></strong>
      (${wasSlid ? '상한 초과로 강제 Sliding 재조정됨!' : '상한 이하이므로 원 제출 가격 유지'})
    `;

    const nearHundred = Math.abs(last - 100.0) <= 2.0;
    const baseLevels = nearHundred
      ? [
          { price: 100.2, baseBuy: 5000, baseSell: 9000 },
          { price: 100.1, baseBuy: 7000, baseSell: 7500 },
          { price: 100.0, baseBuy: 8000, baseSell: 7000 },
          { price: 99.9, baseBuy: 9000, baseSell: 4000 }
        ]
      : [
          { price: Number((last + 0.15).toFixed(2)), baseBuy: 5000, baseSell: 9000 },
          { price: Number((last + 0.05).toFixed(2)), baseBuy: 7000, baseSell: 7500 },
          { price: Number((last - 0.05).toFixed(2)), baseBuy: 8000, baseSell: 7000 },
          { price: Number((last - 0.15).toFixed(2)), baseBuy: 9000, baseSell: 4000 }
        ];

    const rows = baseLevels.map((lvl) => {
      const addedBuy = effectiveLoc + 1e-9 >= lvl.price ? locQty : 0;
      const totalBuy = lvl.baseBuy + addedBuy;
      const totalSell = lvl.baseSell;
      const paired = Math.min(totalBuy, totalSell);
      const imbSigned = totalBuy - totalSell;
      const imbAbs = Math.abs(imbSigned);
      const side = imbSigned > 0 ? '매수 우위' : imbSigned < 0 ? '매도 우위' : '균형 (0)';
      const dist = Math.abs(lvl.price - last);
      return { price: lvl.price, addedBuy, totalBuy, totalSell, paired, imbSigned, imbAbs, side, dist };
    });

    const maxQty = Math.max(1, ...rows.map((r) => Math.max(r.totalBuy, r.totalSell)));
    const maxPaired = Math.max(...rows.map((r) => r.paired));
    let cands = rows.filter((r) => r.paired === maxPaired);
    let decidedStep = 'Step 1 (최대 체결 수량 단독 1위)';

    if (cands.length > 1) {
      const minImb = Math.min(...cands.map((r) => r.imbAbs));
      cands = cands.filter((r) => r.imbAbs === minImb);
      decidedStep = 'Step 2 (동률 최대 체결 후 최소 불균형으로 확정)';
    }
    if (cands.length > 1) {
      const allBuyImb = cands.every((r) => r.imbSigned > 0);
      const allSellImb = cands.every((r) => r.imbSigned < 0);
      if (allBuyImb) {
        const hi = Math.max(...cands.map((r) => r.price));
        cands = cands.filter((r) => r.price === hi);
        decidedStep = 'Step 3 (매수 우위 지속 시 더 높은 가격 선택)';
      } else if (allSellImb) {
        const lo = Math.min(...cands.map((r) => r.price));
        cands = cands.filter((r) => r.price === lo);
        decidedStep = 'Step 3 (매도 우위 지속 시 더 낮은 가격 선택)';
      }
    }
    if (cands.length > 1) {
      const minDist = Math.min(...cands.map((r) => r.dist));
      cands = cands.filter((r) => Math.abs(r.dist - minDist) < 1e-6);
      decidedStep = 'Step 4 (Last Sale / Reference Price에 가장 가까운 가격)';
    }
    const winner = cands[0];

    tableWrap.innerHTML = `
      <div class="table-scroll">
        <table class="lab-table">
          <thead>
            <tr>
              <th>후보가</th>
              <th>누적 매수 (내 주문)</th>
              <th>누적 매도</th>
              <th>Step 1 체결</th>
              <th>Step 2 불균형</th>
              <th>Step 4 거리</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr class="${r.price === winner.price ? 'ep-winner-row' : ''}">
                <td>$${r.price.toFixed(2)} ${r.price === winner.price ? '★' : ''}</td>
                <td>
                  ${r.totalBuy.toLocaleString()}주 <small>(+${r.addedBuy.toLocaleString()})</small>
                  <div class="mini-bar-wrap"><div class="mini-bar" style="width:${((r.totalBuy / maxQty) * 100).toFixed(0)}%"></div></div>
                </td>
                <td>
                  ${r.totalSell.toLocaleString()}주
                  <div class="mini-bar-wrap"><div class="mini-bar sell" style="width:${((r.totalSell / maxQty) * 100).toFixed(0)}%"></div></div>
                </td>
                <td><strong>${r.paired.toLocaleString()}주</strong></td>
                <td>${r.imbAbs.toLocaleString()}주<br><small>${r.side}</small></td>
                <td>$${r.dist.toFixed(2)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    summaryEl.innerHTML = `
      <strong>최종 확정 EP (NOCP): $${winner.price.toFixed(2)}</strong> · 체결량 <strong>${winner.paired.toLocaleString()}주</strong><br>
      <small>결정 근거: ${escapeHtml(decidedStep)} | 잔여 불균형: ${winner.imbAbs.toLocaleString()}주 (${winner.side})</small>
    `;
  }

  /* LAB 2B: NYSE D-Order Stealth Zone Track & Parity 1/N */
  function calculateLab2NyseDorder() {
    const trackEl = document.getElementById('lab2-dorder-track');
    const out = document.getElementById('lab2-dorder-result');
    const pValLabel = document.getElementById('lab2-p-val');
    const slider = document.getElementById('lab2-p-slider');
    const imbDirEl = document.getElementById('lab2-imb-dir');
    const phaseEl = document.getElementById('lab2-nyse-phase');
    if (!out || !slider || !imbDirEl || !phaseEl) return;

    const p = Number(slider.value);
    if (pValLabel) pValLabel.textContent = '$' + p.toFixed(2);

    const imbDir = imbDirEl.value;
    const phase = phaseEl.value;
    const floor = 99.5;
    const cap = 100.5;
    const totalOrder = 100000;
    const imbQty = imbDir === 'sell' ? 60000 : 40000;

    // Position on [98.5, 101.0] range -> 0..100%
    const pct = Math.min(100, Math.max(0, ((p - 98.5) / (101.0 - 98.5)) * 100));
    if (trackEl) {
      trackEl.innerHTML = `
        <div class="zone-track-card">
          <div class="ruler-title">D-Order 가격 구간 맵 ($98.50 ~ $101.00)</div>
          <div class="zone-segments">
            <div class="zone-seg floor">기본 지정가 ≤$99.50</div>
            <div class="zone-seg discretion">재량 스텔스 $99.51~$100.50</div>
            <div class="zone-seg above">&gt;$100.50 제외</div>
          </div>
          <div class="zone-pointer-rail">
            <div class="zone-pointer" style="left:${pct.toFixed(1)}%">▲ P=$${p.toFixed(2)}</div>
          </div>
        </div>
      `;
    }

    let activeQty = 0;
    let statusBadge = '';
    let explanation = '';
    let calloutCls = 'callout-note';

    if (phase === 'unmasked') {
      if (p > cap) {
        activeQty = 0;
        statusBadge = '한도 초과 · 0주 제외';
        explanation = `15:59:50 이후 Firm Limit ($${cap.toFixed(2)})로 공개 전이되었으나, 잠정가 $${p.toFixed(2)}가 상한을 넘어 체결 풀에서 제외됩니다.`;
      } else {
        activeQty = totalOrder;
        statusBadge = 'Unmasked · 100,000주 전량 공개';
        calloutCls = 'callout-tip';
        explanation = `15:59:50 State Transition 완료! 이제 재량 조건과 무관하게 <strong>$${cap.toFixed(2)} 일반 확정 LOC 100,000주</strong>로 전환되어 CIB와 매칭에 100% 공개 참여합니다.`;
      }
    } else {
      if (p > cap) {
        activeQty = 0;
        statusBadge = '재량 한도 초과 · 0주';
        explanation = `잠정가 $${p.toFixed(2)} > 재량 상한 $${cap.toFixed(2)}. 한도를 초과하여 0주(OIB 미반영)입니다.`;
      } else if (p <= floor) {
        activeQty = totalOrder;
        statusBadge = '기본 지정가 구간 · 100,000주 전량';
        calloutCls = 'callout-supplement';
        explanation = `잠정가 $${p.toFixed(2)} ≤ 기본 지정가 $${floor.toFixed(2)}. 일반 LOC와 동일하게 불균형 방향과 무관하게 100,000주 전량 참여합니다.`;
      } else if (imbDir === 'sell') {
        activeQty = imbQty;
        statusBadge = `스텔스 발동 · 딱 ${imbQty.toLocaleString()}주 동원`;
        calloutCls = 'callout-tip';
        explanation = `잠정가 $${p.toFixed(2)}는 재량 구간입니다. 매도 초과(${imbQty.toLocaleString()}주)를 줄이기 위해 엔진이 <strong>${imbQty.toLocaleString()}주만 조용히 동원</strong>해 불균형을 0주로 만들고 나머지 ${(totalOrder - imbQty).toLocaleString()}주는 숨깁니다.`;
      } else {
        activeQty = 0;
        statusBadge = '스텔스 침묵 · 0주 (비활성)';
        explanation = `잠정가 $${p.toFixed(2)}는 재량 구간이지만 이미 <strong>매수 초과(${imbQty.toLocaleString()}주)</strong> 상태입니다. 추가 참여 시 가격만 급등하므로 15:59:50 전까지는 단 1주도 OIB에 노출하지 않습니다.`;
      }
    }

    out.innerHTML = `
      <div class="callout ${calloutCls}" style="margin:0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <strong>현재 D-Order 유효 참여 수량: ${activeQty.toLocaleString()}주</strong>
          <span class="badge badge-blue">${escapeHtml(statusBadge)}</span>
        </div>
        <p style="margin:0;font-size:13.5px">${explanation}</p>
      </div>
    `;
  }

  function calculateLab2Parity() {
    const out = document.getElementById('lab2-parity-result');
    if (!out) return;

    const supply = Math.max(0, Math.floor(Number(document.getElementById('lab2-par-supply')?.value || 0)));
    const participants = [
      { name: 'Book Participant', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-book')?.value || 0))) },
      { name: 'Floor Broker A', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-ba')?.value || 0))) },
      { name: 'Floor Broker B', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-bb')?.value || 0))) },
      { name: 'DMM Interest', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-dmm')?.value || 0))) }
    ].map((p) => ({ ...p, filled: 0 }));

    let remaining = supply;
    const rounds = [];
    let roundNo = 1;

    while (remaining > 0) {
      const active = participants.filter((p) => p.demand > p.filled);
      if (!active.length) break;
      const base = Math.floor(remaining / active.length);
      let rem = remaining % active.length;
      let distributedThisRound = 0;
      const details = [];

      if (base === 0) {
        for (let i = 0; i < active.length && remaining > 0; i++) {
          active[i].filled += 1;
          remaining -= 1;
          distributedThisRound += 1;
          details.push(`${active[i].name.split(' ')[0]}+1`);
        }
        rounds.push({ round: roundNo++, units: active.length, quota: '잔여 1주씩', note: details.join(', ') });
        break;
      }

      active.forEach((p) => {
        const extra = rem > 0 ? 1 : 0;
        if (rem > 0) rem -= 1;
        const target = base + extra;
        const need = p.demand - p.filled;
        const give = Math.min(need, target);
        p.filled += give;
        distributedThisRound += give;
        details.push(`${p.name} +${give.toLocaleString()}${give < target ? ' (완전 체결)' : ''}`);
      });

      remaining -= distributedThisRound;
      rounds.push({
        round: roundNo++,
        units: active.length,
        quota: `1/${active.length} (~${base.toLocaleString()}주)`,
        note: details.join(' · ')
      });
    }

    const totalDemand = participants.reduce((acc, p) => acc + p.demand, 0);
    const totalFilled = participants.reduce((acc, p) => acc + p.filled, 0);

    out.innerHTML = `
      <div class="table-scroll">
        <table class="lab-table">
          <thead>
            <tr>
              <th>참여 단위</th>
              <th>제출 수량</th>
              <th>Parity 배분</th>
              <th>체결률</th>
            </tr>
          </thead>
          <tbody>
            ${participants
              .map((p) => {
                const pct = p.demand > 0 ? (p.filled / p.demand) * 100 : 0;
                return `
                  <tr>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td>${p.demand.toLocaleString()}주</td>
                    <td><strong>${p.filled.toLocaleString()}주</strong></td>
                    <td>
                      ${pct.toFixed(1)}%
                      <div class="mini-bar-wrap"><div class="mini-bar" style="width:${pct.toFixed(0)}%;background:var(--emerald)"></div></div>
                    </td>
                  </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="ep-summary-box" style="margin-top:10px">
        <strong>총 체결: ${totalFilled.toLocaleString()}주</strong> (공급 ${supply.toLocaleString()}주 / 대기 ${totalDemand.toLocaleString()}주 · 미체결 ${(totalDemand - totalFilled).toLocaleString()}주)
        <div style="margin-top:6px;font-size:12.5px;color:var(--text-secondary)">
          ${rounds.map((r) => `<div>• <strong>${r.round}차 배분</strong> (${r.units}단위, ${r.quota}): ${escapeHtml(r.note)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  /* LAB 3: Interactive Order Flow & SOR Step-by-Step Pipeline */
  function stopFlowAutoPlay() {
    if (state.flowTimer) {
      window.clearInterval(state.flowTimer);
      state.flowTimer = null;
    }
    const playBtn = document.getElementById('lab3-play-btn');
    if (playBtn) playBtn.textContent = '▶ 단계 재생';
  }

  function toggleFlowAutoPlay() {
    if (state.flowTimer) {
      stopFlowAutoPlay();
      return;
    }
    const sc = FLOW_SCENARIOS[state.flowScenario];
    const maxLen = sc ? sc.steps.length : 5;
    const playBtn = document.getElementById('lab3-play-btn');
    if (playBtn) playBtn.textContent = '⏸ 일시정지';
    state.flowTimer = window.setInterval(() => {
      state.flowStepIdx = (state.flowStepIdx + 1) % maxLen;
      renderLab3();
    }, 1600);
  }

  function renderLab3() {
    const btnsEl = document.getElementById('lab3-scenarios');
    const timelineEl = document.getElementById('lab3-timeline');
    if (!btnsEl || !timelineEl) return;

    const keys = Object.keys(FLOW_SCENARIOS);
    btnsEl.innerHTML = keys
      .map(
        (key) => `
        <button type="button" class="scenario-btn${key === state.flowScenario ? ' is-active' : ''}" data-scenario="${escapeHtml(key)}">
          ${escapeHtml(FLOW_SCENARIOS[key].title.replace(/^시나리오 \d+:\s*/, ''))}
        </button>`
      )
      .join('');

    const sc = FLOW_SCENARIOS[state.flowScenario] || FLOW_SCENARIOS[keys[0]];
    if (state.flowStepIdx >= sc.steps.length) state.flowStepIdx = 0;

    timelineEl.innerHTML = `
      <div class="callout callout-note" style="margin-top:0">
        <strong>${escapeHtml(sc.title)}</strong>
        <p style="margin:6px 0 10px">${escapeHtml(sc.summary)}</p>
        <button type="button" class="btn btn-sm btn-outline" data-open-chapter="${escapeHtml(sc.chapterId)}">관련 챕터(Ch ${sc.chapterId.replace('ch', '')}) 원문 읽기 →</button>
      </div>
      <div class="flow-step-list">
        ${sc.steps
          .map((st, idx) => {
            const cls = idx === state.flowStepIdx ? ' is-current' : idx < state.flowStepIdx ? ' is-passed' : '';
            return `
              <div class="flow-step-card${cls}" data-flow-step="${idx}" role="button" tabindex="0">
                <div class="flow-step-num">${escapeHtml(st.step)}</div>
                <h4>${escapeHtml(st.title)}</h4>
                <p>${escapeHtml(st.desc)}</p>
                <div class="flow-step-meta">${escapeHtml(st.meta)}</div>
              </div>`;
          })
          .join('')}
      </div>
    `;
  }

  /* LAB 4 (NEW): MWCB & LULD Price Stabilization Simulator */
  function calculateLab4Mwcb() {
    const out = document.getElementById('lab4-mwcb-result');
    const spSlider = document.getElementById('lab4-sp-slider');
    const timeSlider = document.getElementById('lab4-time-slider');
    const spVal = document.getElementById('lab4-sp-val');
    const timeVal = document.getElementById('lab4-time-val');
    if (!out || !spSlider || !timeSlider) return;

    const drop = Number(spSlider.value); // -25 to 0
    const mins = Number(timeSlider.value); // 570 (09:30) to 960 (16:00)
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    const before1525 = mins < 15 * 60 + 25;

    if (spVal) spVal.textContent = drop.toFixed(1) + '%';
    if (timeVal) timeVal.textContent = `${hh}:${mm} ET`;

    let badge = '정상 거래 (발동 없음)';
    let badgeCls = 'badge-emerald';
    let calloutCls = 'callout-note';
    let detail = 'S&P 500 하락률이 -7.0% 미만이므로 전 시장 서킷브레이커가 발동하지 않고 모든 거래소·ATS가 정상 거래됩니다.';
    let l1Cls = '', l2Cls = '', l3Cls = '';

    if (drop <= -20) {
      l1Cls = 'is-warn'; l2Cls = 'is-warn'; l3Cls = 'is-hit';
      badge = 'Level 3 발동 · 당일 정규장 즉시 종료';
      badgeCls = 'badge-danger';
      calloutCls = 'callout-tip';
      detail = `시간(${hh}:${mm} ET)과 무관하게 S&P 500이 <strong>-20% 이하(${drop.toFixed(1)}%)</strong>로 급락해 미국 전 거래소·ATS의 <strong>당일 정규장이 즉시 종료</strong>됩니다 (당일 거래 재개 없음).`;
    } else if (drop <= -13) {
      l1Cls = 'is-warn'; l2Cls = before1525 ? 'is-hit' : 'is-warn';
      if (before1525) {
        badge = 'Level 2 발동 · 전 시장 15분 매매 정지';
        badgeCls = 'badge-danger';
        calloutCls = 'callout-tip';
        detail = `<strong>15:25 ET 이전(${hh}:${mm})</strong>에 -13% 임계치를 돌파해 전 정규거래소·ATS가 <strong>15분간 동시 중단</strong>되며, 15분 후 상장거래소 단일가 경매(Reopening Auction)로 재개됩니다.`;
      } else {
        badge = '15:25 이후 예외 · Level 2 미발동';
        badgeCls = 'badge-amber';
        calloutCls = 'callout-supplement';
        detail = `하락률(${drop.toFixed(1)}%)은 -13%에 도달했으나 <strong>15:25 ET 이후(${hh}:${mm})</strong>이므로 Closing Cross 방해를 막기 위해 MWCB가 발동하지 않고 정규 마감으로 직행합니다 (단, -20% 도달 시 즉시 종료).`;
      }
    } else if (drop <= -7) {
      l1Cls = before1525 ? 'is-hit' : 'is-warn';
      if (before1525) {
        badge = 'Level 1 발동 · 전 시장 15분 매매 정지';
        badgeCls = 'badge-amber';
        calloutCls = 'callout-tip';
        detail = `<strong>15:25 ET 이전(${hh}:${mm})</strong>에 S&P 500이 -7% 이하(${drop.toFixed(1)}%)로 하락해 NYSE 공표로 미국 전 시장이 <strong>15분간 정지</strong>된 뒤 상장거래소 단일가로 재개됩니다.`;
      } else {
        badge = '15:25 이후 예외 · Level 1 미발동';
        badgeCls = 'badge-amber';
        calloutCls = 'callout-supplement';
        detail = `하락률(${drop.toFixed(1)}%)은 -7% 이하이나 <strong>15:25 ET 이후(${hh}:${mm})</strong>이므로 Level 1 서킷브레이커가 발동하지 않습니다.`;
      }
    }

    out.innerHTML = `
      <div class="mwcb-levels">
        <div class="mwcb-lvl ${l1Cls}"><strong>Level 1 (-7%)</strong><span>15:25 전 · 15분 정지</span></div>
        <div class="mwcb-lvl ${l2Cls}"><strong>Level 2 (-13%)</strong><span>15:25 전 · 15분 정지</span></div>
        <div class="mwcb-lvl ${l3Cls}"><strong>Level 3 (-20%)</strong><span>시간 무관 · 당일 종료</span></div>
      </div>
      <div class="callout ${calloutCls}" style="margin:0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <strong>MWCB 판정 결과</strong>
          <span class="badge ${badgeCls}">${escapeHtml(badge)}</span>
        </div>
        <p style="margin:0;font-size:13.5px">${detail}</p>
      </div>
    `;
  }

  function calculateLab4Luld() {
    const out = document.getElementById('lab4-luld-result');
    const tierEl = document.getElementById('lab4-tier');
    const sessEl = document.getElementById('lab4-session');
    const refEl = document.getElementById('lab4-ref');
    const curEl = document.getElementById('lab4-cur');
    const durEl = document.getElementById('lab4-dur-slider');
    const durVal = document.getElementById('lab4-dur-val');
    if (!out || !tierEl || !sessEl || !refEl || !curEl || !durEl) return;

    const tier = tierEl.value;
    const sess = sessEl.value;
    const ref = Math.max(1, Number(refEl.value || 100));
    const cur = Math.max(0.01, Number(curEl.value || 94.5));
    const dur = Number(durEl.value || 0);
    if (durVal) durVal.textContent = dur + '초';

    if (sess === 'extended') {
      out.innerHTML = `
        <div class="callout callout-note" style="margin:0">
          <strong>LULD 미적용 시간대 (프리마켓 · 애프터마켓)</strong>
          <p style="margin:6px 0 0;font-size:13.5px">LULD 가격제한 밴드는 <strong>정규장(09:30 ~ 16:00 ET)</strong>에만 적용됩니다. 시간외 거래에서는 급등락 시에도 LULD Trading Pause가 발동하지 않습니다.</p>
        </div>
      `;
      return;
    }

    const basePct = tier === 'tier1' ? 5 : 10;
    const mult = sess === 'regular' ? 1 : 2;
    const bandPct = basePct * mult;
    const ld = ref * (1 - bandPct / 100);
    const lu = ref * (1 + bandPct / 100);
    const devPct = ((cur - ref) / ref) * 100;
    const isAtOrOutside = cur <= ld + 1e-6 || cur >= lu - 1e-6;

    // Gauge position: map [ld - 0.5*band, lu + 0.5*band] -> [0%, 100%] where LD=20%, Ref=50%, LU=80%
    const halfBand = lu - ref;
    const norm = halfBand > 0 ? (cur - ref) / halfBand : 0; // -1 at LD, +1 at LU
    const gaugePos = Math.min(96, Math.max(4, 50 + norm * 30));

    let statusBadge = '정상 구간 (밴드 내부)';
    let badgeCls = 'badge-emerald';
    let calloutCls = 'callout-note';
    let msg = `현재가 $${cur.toFixed(2)} (${devPct >= 0 ? '+' : ''}${devPct.toFixed(2)}%)는 허용 밴드(<code>$${ld.toFixed(2)} ~ $${lu.toFixed(2)}</code>) 내부이므로 연속매매가 정상 진행됩니다.`;

    if (isAtOrOutside && dur < 15) {
      statusBadge = `Limit State 진입 (${dur}초 / 15초)`;
      badgeCls = 'badge-amber';
      calloutCls = 'callout-tip';
      msg = `주가가 ${cur <= ld ? '하한(LD)' : '상한(LU)'} 경계에 도달해 <strong>Limit State</strong>가 진행 중입니다. 15초 안에 밴드 안으로 복귀하면 매매 정지 없이 거래가 계속됩니다.`;
    } else if (isAtOrOutside && dur >= 15) {
      if (sess === 'merger') {
        statusBadge = 'LULD Pause + Closing Cross 병합!';
        badgeCls = 'badge-danger';
        calloutCls = 'callout-supplement';
        msg = `<strong>15:50~16:00 ET 특례 (Cross/Halt Merger)</strong>: 마감 10분 이내에 15초 경계 지속으로 LULD 정지가 발동해 장중 재개를 생략하고 <strong>종가 경매(Closing Cross/Auction)와 병합</strong> 처리됩니다 (Collar 이탈 시 5분 단위 연장).`;
      } else {
        statusBadge = 'LULD Trading Pause (5분 정지)';
        badgeCls = 'badge-danger';
        calloutCls = 'callout-tip';
        msg = `경계 상태가 <strong>${dur}초(≥15초)</strong> 지속되어 전 거래소·ATS에서 해당 종목이 <strong>5분간 거래 정지</strong>됩니다. 5분 후 상장거래소(Prime Listing Venue) 단일가 경매 및 새 밴드 공표와 함께 재개됩니다.`;
      }
    }

    out.innerHTML = `
      <div class="luld-gauge">
        <div class="ruler-title">LULD 동적 가격 밴드 (±${bandPct}% · ${mult === 2 ? '2배 완화 구간' : '정규 1배 구간'})</div>
        <div class="luld-bar">
          <div class="luld-marker" style="left:${gaugePos.toFixed(1)}%"></div>
        </div>
        <div class="ruler-ends">
          <span style="color:var(--danger)">LD $${ld.toFixed(2)} (-${bandPct}%)</span>
          <span>VWAP $${ref.toFixed(2)}</span>
          <span style="color:var(--danger)">LU $${lu.toFixed(2)} (+${bandPct}%)</span>
        </div>
      </div>
      <div class="callout ${calloutCls}" style="margin:0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <strong>LULD 판정 (현재가 $${cur.toFixed(2)})</strong>
          <span class="badge ${badgeCls}">${escapeHtml(statusBadge)}</span>
        </div>
        <p style="margin:0;font-size:13.5px">${msg}</p>
      </div>
    `;
  }

  /* =========================================================
     VIEW 4: GLOSSARY & FLASHCARD TRAINER
     ========================================================= */
  function getFilteredGlossary() {
    const q = state.glossaryQuery.trim().toLowerCase();
    return DATA.glossary
      .map((g, idx) => ({ g, idx }))
      .filter(({ g }) => {
        if (state.glossaryCat !== '전체' && g.cat !== state.glossaryCat) return false;
        if (!q) return true;
        return (
          g.term.toLowerCase().includes(q) ||
          g.full.toLowerCase().includes(q) ||
          g.desc.toLowerCase().includes(q) ||
          g.cat.toLowerCase().includes(q)
        );
      });
  }

  function renderGlossary() {
    const catsEl = document.getElementById('glossary-cats');
    const gridEl = document.getElementById('glossary-grid');
    const flashWrap = document.getElementById('glossary-flashcard-wrap');
    const filterInput = document.getElementById('glossary-filter-input');
    const clearBtn = document.getElementById('glossary-clear-btn');
    const countEl = document.getElementById('glossary-match-count');
    if (!catsEl || !gridEl || !flashWrap) return;

    document.querySelectorAll('.mode-btn[data-glossary-mode]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-glossary-mode') === state.glossaryMode);
    });

    const uniqueCats = ['전체', ...Array.from(new Set(DATA.glossary.map((g) => g.cat)))];
    catsEl.innerHTML = uniqueCats
      .map(
        (cat) =>
          `<button type="button" class="cat-pill${cat === state.glossaryCat ? ' is-active' : ''}" data-glossary-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
      )
      .join('');

    if (filterInput && filterInput.value !== state.glossaryQuery) {
      filterInput.value = state.glossaryQuery;
    }
    if (clearBtn) clearBtn.hidden = !state.glossaryQuery.trim();

    const filtered = getFilteredGlossary();
    if (countEl) {
      countEl.textContent = `${DATA.glossary.length}개 중 ${filtered.length}개 · 암기 ${state.flashKnown.size}개`;
    }

    if (state.glossaryMode === 'flashcards') {
      gridEl.hidden = true;
      flashWrap.hidden = false;
      renderFlashcards(filtered);
      return;
    }

    gridEl.hidden = false;
    flashWrap.hidden = true;

    if (!filtered.length) {
      gridEl.innerHTML = '<div class="surface-card"><p class="muted-small" style="margin:0">검색 조건에 맞는 용어가 없습니다.</p></div>';
      return;
    }

    gridEl.innerHTML = filtered
      .map(({ g }) => {
        const chObj = getChapterById(g.ch);
        const chBadge = isNumberedChapter(chObj) ? `Ch ${formatChapterNum(chObj)}` : '안내';
        const isKnown = state.flashKnown.has(g.term);
        return `
          <article class="glossary-card">
            <div>
              <div class="glossary-card-top">
                <div>
                  <h3>${escapeHtml(g.term)}</h3>
                  <div class="glossary-full">${escapeHtml(g.full)}</div>
                </div>
                <button type="button" class="link-chip" data-open-chapter="${escapeHtml(g.ch)}" title="관련 챕터로 이동">${escapeHtml(chBadge)} →</button>
              </div>
              <p>${escapeHtml(g.desc)}</p>
            </div>
            <div class="glossary-card-foot">
              <span class="badge badge-teal">${escapeHtml(g.cat)}</span>
              ${isKnown ? '<span class="badge badge-emerald">✓ 암기 완료</span>' : ''}
            </div>
          </article>`;
      })
      .join('');
  }

  function renderFlashcards(filteredItems) {
    const wrap = document.getElementById('glossary-flashcard-wrap');
    if (!wrap) return;

    const deck = state.flashOnlyUnknown
      ? filteredItems.filter(({ g }) => !state.flashKnown.has(g.term))
      : filteredItems;

    if (!deck.length) {
      wrap.innerHTML = `
        <div class="surface-card" style="text-align:center;padding:32px 20px">
          <h3 style="margin:0 0 8px">모든 카드를 암기했습니다!</h3>
          <p class="muted-small">현재 필터에서 복습할 미암기 용어가 없습니다.</p>
          <button type="button" class="btn btn-sm btn-primary" data-flash-action="toggle-unknown">전체 카드 다시 보기</button>
        </div>`;
      return;
    }

    if (state.flashIndex >= deck.length) state.flashIndex = 0;
    if (state.flashIndex < 0) state.flashIndex = deck.length - 1;

    const current = deck[state.flashIndex].g;
    const isKnown = state.flashKnown.has(current.term);
    const chObj = getChapterById(current.ch);
    const chLabel = isNumberedChapter(chObj) ? `Ch ${formatChapterNum(chObj)} 원문 →` : '안내 →';

    wrap.innerHTML = `
      <div class="flashcard-meta-bar">
        <span>카드 <strong>${state.flashIndex + 1} / ${deck.length}</strong> · 전체 암기 <strong>${state.flashKnown.size}/${DATA.glossary.length}</strong></span>
        <button type="button" class="filter-chip${state.flashOnlyUnknown ? ' is-active' : ''}" data-flash-action="toggle-unknown">미암기만 보기</button>
      </div>
      <div class="flashcard-card${state.flashFlipped ? ' is-flipped' : ''}" data-flash-action="flip" role="button" tabindex="0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span class="badge badge-teal">${escapeHtml(current.cat)}</span>
          ${isKnown ? '<span class="badge badge-emerald">✓ 암기 완료</span>' : '<span class="badge badge-blue">복습 대상</span>'}
        </div>
        ${
          !state.flashFlipped
            ? `<div class="flashcard-front">
                 <h2>${escapeHtml(current.term)}</h2>
                 <div class="glossary-full">${escapeHtml(current.full)}</div>
               </div>
               <div class="flashcard-tap-hint">카드를 클릭(탭)하여 뜻을 확인하세요</div>`
            : `<div class="flashcard-back">
                 <h3>${escapeHtml(current.term)}</h3>
                 <p>${escapeHtml(current.desc)}</p>
               </div>
               <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
                 <span class="muted-small" style="margin:0">${escapeHtml(current.full)}</span>
                 <button type="button" class="link-chip" data-open-chapter="${escapeHtml(current.ch)}">${escapeHtml(chLabel)}</button>
               </div>`
        }
      </div>
      <div class="flashcard-actions">
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-sm btn-outline" data-flash-action="prev">← 이전</button>
          <button type="button" class="btn btn-sm btn-outline" data-flash-action="next">다음 →</button>
        </div>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-sm ${isKnown ? 'btn-completed' : 'btn-primary'}" data-flash-action="mark-known">
            ${isKnown ? '✓ 암기 해제' : '✓ 암기 완료로 표시'}
          </button>
        </div>
      </div>
    `;
  }

  /* =========================================================
     VIEW 5: ALL-CHAPTER QUIZ CHALLENGE
     ========================================================= */
  function renderQuizChallenge() {
    const board = document.getElementById('quiz-scoreboard');
    const filterEl = document.getElementById('quiz-part-filters');
    const listEl = document.getElementById('quiz-challenge-list');
    if (!board || !filterEl || !listEl) return;

    const stats = getQuizStats();
    const acc = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

    board.innerHTML = `
      <div class="score-tile"><span>정답률</span><strong style="color:var(--primary)">${acc}%</strong></div>
      <div class="score-tile"><span>맞힌 문항</span><strong style="color:var(--emerald)">${stats.correct} / ${stats.total}</strong></div>
      <div class="score-tile"><span>틀린 문항</span><strong style="color:var(--danger)">${stats.wrong}</strong></div>
      <div class="score-tile"><span>남은 문항</span><strong>${stats.total - stats.answered}</strong></div>
    `;

    const filters = [
      { key: 'all', label: `전체 (${stats.total})` },
      { key: 'Part I', label: 'Part I' },
      { key: 'Part II', label: 'Part II' },
      { key: 'Part III', label: 'Part III' },
      { key: 'Part IV', label: 'Part IV' },
      { key: 'unanswered', label: `미응시 (${stats.total - stats.answered})` },
      { key: 'wrong', label: `오답 복습 (${stats.wrong})` }
    ];

    filterEl.innerHTML = filters
      .map(
        (f) =>
          `<button type="button" class="filter-chip${state.quizFilter === f.key ? ' is-active' : ''}" data-quiz-filter="${escapeHtml(f.key)}">${escapeHtml(f.label)}</button>`
      )
      .join('');

    const cards = [];
    DATA.chapters.forEach((ch) => {
      if (state.quizFilter.startsWith('Part ') && ch.part !== state.quizFilter) return;
      const ansMap = state.quizAnswers[ch.id] || {};
      (ch.quizzes || []).forEach((qz, qi) => {
        const picked = ansMap[qi];
        const answered = typeof picked === 'number';
        const isCorrect = answered && picked === qz.ans;
        if (state.quizFilter === 'unanswered' && answered) return;
        if (state.quizFilter === 'wrong' && (!answered || isCorrect)) return;

        const optsHtml = qz.opts
          .map((opt, oi) => {
            let cls = 'quiz-opt-btn';
            if (answered) {
              if (oi === qz.ans) cls += ' is-correct';
              else if (oi === picked) cls += ' is-wrong';
            }
            const optContent = (qz.optsHtml && qz.optsHtml[oi]) || escapeHtml(opt);
            return `<button type="button" class="${cls}" data-quiz-ch="${escapeHtml(ch.id)}" data-quiz-idx="${qi}" data-opt-idx="${oi}">${optContent}</button>`;
          })
          .join('');
        const expContent = qz.expHtml || escapeHtml(qz.exp);
        const expHtml = answered
          ? `<div class="quiz-exp"><strong>${isCorrect ? '정답!' : '오답입니다.'}</strong> ${expContent}</div>`
          : '';
        const qContent = qz.qHtml || escapeHtml(qz.q);
        const partCfg = PART_META.find((p) => p.key === ch.part);

        cards.push(`
          <article class="quiz-challenge-card">
            <div class="quiz-challenge-meta">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span class="badge ${partCfg ? partCfg.badgeClass : 'badge-blue'}">${escapeHtml(ch.part)}</span>
                <span class="ch-num-pill">Ch ${formatChapterNum(ch)}</span>
                ${answered ? (isCorrect ? '<span class="badge badge-emerald">✓ 정답</span>' : '<span class="badge badge-danger">✕ 오답</span>') : ''}
              </div>
              <button type="button" class="link-chip" data-open-chapter="${escapeHtml(ch.id)}">Ch ${formatChapterNum(ch)} 원문 복습 →</button>
            </div>
            <div class="quiz-q">${qContent}</div>
            <div class="quiz-opts">${optsHtml}</div>
            ${expHtml}
          </article>
        `);
      });
    });

    listEl.innerHTML =
      cards.join('') ||
      '<div class="surface-card"><p class="muted-small" style="margin:0">선택한 필터에 해당하는 퀴즈 문항이 없습니다.</p></div>';
  }

  /* =========================================================
     GLOBAL COMMAND SEARCH MODAL
     ========================================================= */
  function openSearchModal() {
    const dlg = document.getElementById('search-dialog');
    const input = document.getElementById('global-search-input');
    if (!dlg) return;
    closeTermPopover();
    if (typeof dlg.showModal === 'function') {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.setAttribute('open', '');
    }
    if (input) {
      input.focus();
      input.select();
    }
    renderSearchResults();
  }

  function closeSearchModal() {
    const dlg = document.getElementById('search-dialog');
    if (!dlg) return;
    if (typeof dlg.close === 'function' && dlg.open) dlg.close();
    else dlg.removeAttribute('open');
  }

  function highlightEscapedSnippet(text, query) {
    if (!query) return escapeHtml(text);
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    const start = Math.max(0, idx - 32);
    const end = Math.min(text.length, idx + query.length + 68);
    return (
      (start > 0 ? '...' : '') +
      escapeHtml(text.slice(start, idx)) +
      `<mark>${escapeHtml(text.slice(idx, idx + query.length))}</mark>` +
      escapeHtml(text.slice(idx + query.length, end)) +
      (end < text.length ? '...' : '')
    );
  }

  function renderSearchResults() {
    const input = document.getElementById('global-search-input');
    const resultsEl = document.getElementById('global-search-results');
    if (!resultsEl) return;

    const rawQ = (input ? input.value : '').trim();
    const q = rawQ.toLowerCase();
    const results = [];

    if (!q) {
      LAB_CATALOG.forEach((lab) => {
        results.push({ kind: 'lab', id: lab.id, title: lab.title, badge: '시뮬레이터', snippetHtml: escapeHtml(lab.desc) });
      });
      DATA.chapters.slice(1, 6).forEach((ch) => {
        results.push({
          kind: 'chapter',
          id: ch.id,
          title: formatChapterPrefixedTitle(ch, false),
          badge: ch.part,
          snippetHtml: escapeHtml((ch.questions && ch.questions[0]) || ch.shortTitle)
        });
      });
      DATA.glossary.slice(0, 4).forEach((g) => {
        results.push({ kind: 'glossary', term: g.term, ch: g.ch, title: `${g.term} (${g.full})`, badge: `용어 · ${g.cat}`, snippetHtml: escapeHtml(g.desc) });
      });
    } else {
      LAB_CATALOG.forEach((lab) => {
        if (`${lab.title} ${lab.desc}`.toLowerCase().includes(q)) {
          results.push({ kind: 'lab', id: lab.id, title: lab.title, badge: '시뮬레이터', snippetHtml: highlightEscapedSnippet(lab.desc, rawQ), score: 11 });
        }
      });
      DATA.glossary.forEach((g) => {
        if (`${g.term} ${g.full} ${g.desc}`.toLowerCase().includes(q)) {
          results.push({
            kind: 'glossary',
            term: g.term,
            ch: g.ch,
            title: `${g.term} — ${g.full}`,
            badge: `용어 · ${g.cat}`,
            snippetHtml: highlightEscapedSnippet(g.desc, rawQ),
            score: g.term.toLowerCase().includes(q) ? 10 : 5
          });
        }
      });
      DATA.chapters.forEach((ch) => {
        const titleMatch = ch.title.toLowerCase().includes(q) || ch.shortTitle.toLowerCase().includes(q);
        const bodyIdx = (ch.searchText || '').toLowerCase().indexOf(q);
        if (titleMatch || bodyIdx !== -1) {
          const textSource = bodyIdx !== -1 ? ch.searchText : (ch.questions && ch.questions[0]) || ch.shortTitle;
          results.push({
            kind: 'chapter',
            id: ch.id,
            title: formatChapterPrefixedTitle(ch, false),
            badge: ch.part,
            snippetHtml: highlightEscapedSnippet(textSource, rawQ),
            score: titleMatch ? 9 : 4
          });
        }
      });
      results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    state.searchResults = results.slice(0, 20);
    state.searchSelectedIndex = 0;

    if (!state.searchResults.length) {
      resultsEl.innerHTML = '<div class="muted-small" style="padding:18px;text-align:center">검색 결과가 없습니다.</div>';
      return;
    }

    resultsEl.innerHTML = state.searchResults
      .map((res, idx) => {
        const badgeCls = res.kind === 'lab' ? 'badge-amber' : res.kind === 'glossary' ? 'badge-teal' : 'badge-blue';
        return `
          <button type="button" class="search-res-item${idx === 0 ? ' is-selected' : ''}" data-search-idx="${idx}">
            <div class="search-res-top">
              <span class="badge ${badgeCls}">${escapeHtml(res.badge)}</span>
              <span>${escapeHtml(res.title)}</span>
            </div>
            <div class="search-res-snippet">${res.snippetHtml}</div>
          </button>`;
      })
      .join('');
  }

  function executeSearchSelection(idx) {
    const item = state.searchResults[idx];
    if (!item) return;
    closeSearchModal();
    if (item.kind === 'chapter') {
      switchView('reader', { chapterId: item.id });
    } else if (item.kind === 'lab') {
      state.lab = item.id;
      switchView('labs');
    } else if (item.kind === 'glossary') {
      state.glossaryMode = 'grid';
      state.glossaryCat = '전체';
      state.glossaryQuery = item.term;
      switchView('glossary');
    }
  }

  /* =========================================================
     EVENT WIRING
     ========================================================= */
  function bindEvents() {
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });
    document.getElementById('hero-start-btn')?.addEventListener('click', () => {
      const target = state.hasVisitedChapter && state.chapterId !== 'overview' ? state.chapterId : 'ch01';
      switchView('reader', { chapterId: target });
    });
    document.getElementById('open-overview-btn')?.addEventListener('click', () => {
      switchView('reader', { chapterId: 'overview' });
    });

    document.getElementById('mobile-menu-btn')?.addEventListener('click', openMobileSidebar);
    document.getElementById('sidebar-close-btn')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('back-to-top-btn')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Popover close / actions
    document.getElementById('term-popover-close')?.addEventListener('click', closeTermPopover);
    document.getElementById('term-popover-backdrop')?.addEventListener('click', closeTermPopover);
    document.getElementById('term-popover-chapter-btn')?.addEventListener('click', (e) => {
      const chId = e.currentTarget.getAttribute('data-popover-ch');
      closeTermPopover();
      if (chId) switchView('reader', { chapterId: chId });
    });
    document.getElementById('term-popover-glossary-btn')?.addEventListener('click', (e) => {
      const term = e.currentTarget.getAttribute('data-popover-term') || '';
      closeTermPopover();
      state.glossaryMode = 'grid';
      state.glossaryCat = '전체';
      state.glossaryQuery = term;
      switchView('glossary');
    });

    // Complete & Bookmark buttons
    document.getElementById('toggle-complete-btn')?.addEventListener('click', () => {
      if (state.chapterId === 'overview') return;
      if (state.completed.has(state.chapterId)) state.completed.delete(state.chapterId);
      else state.completed.add(state.chapterId);
      writeStorage(STORAGE.completed, JSON.stringify(Array.from(state.completed)));
      updateGlobalTelemetry();
      syncReaderActionButtons();
      renderSidebar();
    });

    document.getElementById('toggle-bookmark-btn')?.addEventListener('click', () => {
      if (state.chapterId === 'overview') return;
      if (state.bookmarks.has(state.chapterId)) state.bookmarks.delete(state.chapterId);
      else state.bookmarks.add(state.chapterId);
      writeStorage(STORAGE.bookmarks, JSON.stringify(Array.from(state.bookmarks)));
      updateGlobalTelemetry();
      syncReaderActionButtons();
      renderSidebar();
    });

    // Quiz Reset
    document.getElementById('quiz-reset-all-btn')?.addEventListener('click', () => {
      state.quizAnswers = {};
      writeStorage(STORAGE.quizAnswers, '{}');
      updateGlobalTelemetry();
      renderQuizChallenge();
    });

    // Global delegated clicks
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const termTrigger = target.closest('[data-term-idx]');
      if (termTrigger) {
        e.preventDefault();
        const idx = Number(termTrigger.getAttribute('data-term-idx'));
        openTermPopover(idx, termTrigger);
        return;
      }

      const viewTab = target.closest('[data-view], [data-jump-view]');
      if (viewTab) {
        const nextView = viewTab.getAttribute('data-view') || viewTab.getAttribute('data-jump-view');
        if (nextView) switchView(nextView);
        return;
      }

      const jumpLab = target.closest('[data-jump-lab]');
      if (jumpLab) {
        state.lab = jumpLab.getAttribute('data-jump-lab') || 'lab-pfof';
        switchView('labs');
        return;
      }

      const openCh = target.closest('[data-open-chapter]');
      if (openCh) {
        e.preventDefault();
        const chId = openCh.getAttribute('data-open-chapter');
        if (chId) {
          closeMobileSidebar();
          switchView('reader', { chapterId: chId });
        }
        return;
      }

      const homeFilter = target.closest('[data-home-filter]');
      if (homeFilter) {
        state.homePartFilter = homeFilter.getAttribute('data-home-filter') || 'all';
        renderHomeFiltersAndGrid();
        return;
      }

      const fzBtn = target.closest('.fz-btn[data-font-size]');
      if (fzBtn) {
        applyFontSize(fzBtn.getAttribute('data-font-size') || 'md');
        return;
      }

      const modeBtn = target.closest('.mode-btn[data-read-mode]');
      if (modeBtn) {
        state.readMode = modeBtn.getAttribute('data-read-mode') || 'all';
        writeStorage(STORAGE.readMode, state.readMode);
        const ch = getChapterById(state.chapterId);
        applyReadMode(ch);
        renderChapterToc(ch);
        updateReadingProgress();
        return;
      }

      const tocLink = target.closest('[data-toc-target]');
      if (tocLink) {
        e.preventDefault();
        const mobileTocPanel = document.getElementById('mobile-toc-panel');
        if (mobileTocPanel && mobileTocPanel.contains(tocLink)) mobileTocPanel.open = false;
        const headingId = tocLink.getAttribute('data-toc-target');
        const headingEl = headingId ? document.getElementById(headingId) : null;
        if (headingEl) {
          headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelectorAll('.toc-link[data-toc-target]').forEach((l) => {
            l.classList.toggle('is-active', l.getAttribute('data-toc-target') === headingId);
          });
        }
        return;
      }

      const quizBtn = target.closest('.quiz-opt-btn[data-quiz-ch]');
      if (quizBtn) {
        const qCh = quizBtn.getAttribute('data-quiz-ch');
        const qi = Number(quizBtn.getAttribute('data-quiz-idx'));
        const oi = Number(quizBtn.getAttribute('data-opt-idx'));
        if (!state.quizAnswers[qCh]) state.quizAnswers[qCh] = {};
        state.quizAnswers[qCh][qi] = oi;
        writeStorage(STORAGE.quizAnswers, JSON.stringify(state.quizAnswers));
        updateGlobalTelemetry();
        if (state.view === 'reader') renderQuizBox(getChapterById(state.chapterId));
        if (state.view === 'quiz') renderQuizChallenge();
        return;
      }

      const quizFilter = target.closest('[data-quiz-filter]');
      if (quizFilter) {
        state.quizFilter = quizFilter.getAttribute('data-quiz-filter') || 'all';
        renderQuizChallenge();
        return;
      }

      const labTab = target.closest('.lab-tab[data-lab]');
      if (labTab) {
        stopFlowAutoPlay();
        state.lab = labTab.getAttribute('data-lab') || 'lab-pfof';
        renderLabs();
        return;
      }

      const sublabBtn = target.closest('.mode-btn[data-sublab]');
      if (sublabBtn) {
        state.sublab = sublabBtn.getAttribute('data-sublab') || 'nasdaq-ep';
        renderLabs();
        return;
      }

      const scenarioBtn = target.closest('.scenario-btn[data-scenario]');
      if (scenarioBtn) {
        stopFlowAutoPlay();
        state.flowScenario = scenarioBtn.getAttribute('data-scenario') || 'retail-clean';
        state.flowStepIdx = 0;
        renderLab3();
        return;
      }

      const flowStep = target.closest('[data-flow-step]');
      if (flowStep) {
        stopFlowAutoPlay();
        state.flowStepIdx = Number(flowStep.getAttribute('data-flow-step') || 0);
        renderLab3();
        return;
      }

      const gMode = target.closest('.mode-btn[data-glossary-mode]');
      if (gMode) {
        state.glossaryMode = gMode.getAttribute('data-glossary-mode') || 'grid';
        state.flashFlipped = false;
        renderGlossary();
        return;
      }

      const catBtn = target.closest('.cat-pill[data-glossary-cat]');
      if (catBtn) {
        state.glossaryCat = catBtn.getAttribute('data-glossary-cat') || '전체';
        state.flashIndex = 0;
        state.flashFlipped = false;
        renderGlossary();
        return;
      }

      const flashAct = target.closest('[data-flash-action]');
      if (flashAct) {
        const act = flashAct.getAttribute('data-flash-action');
        if (act === 'flip') {
          state.flashFlipped = !state.flashFlipped;
        } else if (act === 'prev') {
          state.flashIndex -= 1;
          state.flashFlipped = false;
        } else if (act === 'next') {
          state.flashIndex += 1;
          state.flashFlipped = false;
        } else if (act === 'toggle-unknown') {
          state.flashOnlyUnknown = !state.flashOnlyUnknown;
          state.flashIndex = 0;
          state.flashFlipped = false;
        } else if (act === 'mark-known') {
          const filtered = getFilteredGlossary();
          const deck = state.flashOnlyUnknown ? filtered.filter(({ g }) => !state.flashKnown.has(g.term)) : filtered;
          const item = deck[state.flashIndex];
          if (item) {
            if (state.flashKnown.has(item.g.term)) state.flashKnown.delete(item.g.term);
            else state.flashKnown.add(item.g.term);
            writeStorage(STORAGE.flashKnown, JSON.stringify(Array.from(state.flashKnown)));
          }
        }
        renderGlossary();
        return;
      }

      const searchItem = target.closest('.search-res-item[data-search-idx]');
      if (searchItem) {
        executeSearchSelection(Number(searchItem.getAttribute('data-search-idx')));
      }
    });

    // Lab 1 presets & inputs
    const setLab1Values = (vals) => {
      Object.entries(vals).forEach(([id, v]) => {
        const el = document.getElementById(id);
        if (el) el.value = String(v);
      });
      calculateLab1();
    };
    document.getElementById('lab1-preset-pdf')?.addEventListener('click', () =>
      setLab1Values({ 'lab1-shares': 1000, 'lab1-nbb': '50.00', 'lab1-nbo': '50.04', 'lab1-pi': '0.015', 'lab1-pfof': '0.0015', 'lab1-take': '3.0', 'lab1-rebate': '2.5', 'lab1-inv-fee': '2.0', 'lab1-inv-reb': '1.5' })
    );
    document.getElementById('lab1-preset-tight')?.addEventListener('click', () =>
      setLab1Values({ 'lab1-shares': 1000, 'lab1-nbb': '100.00', 'lab1-nbo': '100.01', 'lab1-pi': '0.002', 'lab1-pfof': '0.0008', 'lab1-take': '3.0', 'lab1-rebate': '2.5', 'lab1-inv-fee': '2.0', 'lab1-inv-reb': '1.5' })
    );
    document.getElementById('lab1-preset-wide')?.addEventListener('click', () =>
      setLab1Values({ 'lab1-shares': 500, 'lab1-nbb': '200.00', 'lab1-nbo': '200.10', 'lab1-pi': '0.035', 'lab1-pfof': '0.0020', 'lab1-take': '3.0', 'lab1-rebate': '2.6', 'lab1-inv-fee': '2.0', 'lab1-inv-reb': '1.5' })
    );

    ['lab1-shares', 'lab1-nbb', 'lab1-nbo', 'lab1-pi', 'lab1-pfof', 'lab1-take', 'lab1-rebate', 'lab1-inv-fee', 'lab1-inv-reb'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', calculateLab1);
    });
    ['lab2-bid', 'lab2-ask', 'lab2-last', 'lab2-loc-price', 'lab2-loc-qty'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', calculateLab2Nasdaq);
    });
    ['lab2-p-slider', 'lab2-imb-dir', 'lab2-nyse-phase'].forEach((id) => {
      document.getElementById(id)?.addEventListener(id === 'lab2-p-slider' ? 'input' : 'change', calculateLab2NyseDorder);
    });
    ['lab2-par-supply', 'lab2-par-book', 'lab2-par-ba', 'lab2-par-bb', 'lab2-par-dmm'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', calculateLab2Parity);
    });

    // Lab 3 playback controls
    document.getElementById('lab3-play-btn')?.addEventListener('click', toggleFlowAutoPlay);
    document.getElementById('lab3-prev-step')?.addEventListener('click', () => {
      stopFlowAutoPlay();
      const len = (FLOW_SCENARIOS[state.flowScenario]?.steps || []).length || 5;
      state.flowStepIdx = (state.flowStepIdx - 1 + len) % len;
      renderLab3();
    });
    document.getElementById('lab3-next-step')?.addEventListener('click', () => {
      stopFlowAutoPlay();
      const len = (FLOW_SCENARIOS[state.flowScenario]?.steps || []).length || 5;
      state.flowStepIdx = (state.flowStepIdx + 1) % len;
      renderLab3();
    });

    // Lab 4 MWCB & LULD inputs
    ['lab4-sp-slider', 'lab4-time-slider'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', calculateLab4Mwcb);
    });
    ['lab4-tier', 'lab4-session', 'lab4-ref', 'lab4-cur', 'lab4-dur-slider'].forEach((id) => {
      document.getElementById(id)?.addEventListener(id.includes('tier') || id.includes('session') ? 'change' : 'input', calculateLab4Luld);
    });

    // Glossary search & clear
    document.getElementById('glossary-filter-input')?.addEventListener('input', (e) => {
      state.glossaryQuery = e.target.value || '';
      state.flashIndex = 0;
      renderGlossary();
    });
    document.getElementById('glossary-clear-btn')?.addEventListener('click', () => {
      state.glossaryQuery = '';
      renderGlossary();
      document.getElementById('glossary-filter-input')?.focus();
    });

    // Search Dialog
    document.getElementById('open-search-btn')?.addEventListener('click', openSearchModal);
    document.getElementById('close-search-btn')?.addEventListener('click', closeSearchModal);
    const searchDlg = document.getElementById('search-dialog');
    searchDlg?.addEventListener('click', (e) => {
      if (e.target === searchDlg) closeSearchModal();
    });

    const searchInput = document.getElementById('global-search-input');
    searchInput?.addEventListener('input', renderSearchResults);
    searchInput?.addEventListener('keydown', (e) => {
      const items = document.querySelectorAll('#global-search-results .search-res-item');
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.searchSelectedIndex = (state.searchSelectedIndex + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.searchSelectedIndex = (state.searchSelectedIndex - 1 + items.length) % items.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSearchSelection(state.searchSelectedIndex);
        return;
      } else return;
      items.forEach((el, idx) => {
        const sel = idx === state.searchSelectedIndex;
        el.classList.toggle('is-selected', sel);
        if (sel) el.scrollIntoView({ block: 'nearest' });
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const inInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
        return;
      }
      if (e.key === '/' && !searchDlg?.open && !inInput) {
        e.preventDefault();
        openSearchModal();
        return;
      }
      if (e.key === 'Escape') {
        closeMobileSidebar();
        closeTermPopover();
        return;
      }
      if (!inInput && !searchDlg?.open && state.view === 'reader') {
        if (e.key === '[' || (e.altKey && e.key === 'ArrowLeft')) {
          const idx = DATA.chapters.findIndex((c) => c.id === state.chapterId);
          if (idx > 0) switchView('reader', { chapterId: DATA.chapters[idx - 1].id });
        } else if (e.key === ']' || (e.altKey && e.key === 'ArrowRight')) {
          const idx = DATA.chapters.findIndex((c) => c.id === state.chapterId);
          if (idx >= 0 && idx < DATA.chapters.length - 1) switchView('reader', { chapterId: DATA.chapters[idx + 1].id });
        }
      }
      // Enter/Space on interactive term-code spans
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.hasAttribute('data-term-idx')) {
        e.preventDefault();
        openTermPopover(Number(document.activeElement.getAttribute('data-term-idx')), document.activeElement);
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        if (scrollRaf) return;
        scrollRaf = window.requestAnimationFrame(() => {
          scrollRaf = null;
          updateReadingProgress();
        });
      },
      { passive: true }
    );

    window.addEventListener('hashchange', applyHashRoute);
  }

  /* =========================================================
     INIT
     ========================================================= */
  function init() {
    syncThemeButton();
    applyFontSize(state.fontSize);
    updateGlobalTelemetry();
    bindEvents();
    applyHashRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
