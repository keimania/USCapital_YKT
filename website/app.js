(function () {
  'use strict';

  const DATA = window.US_CAPITAL_MARKET_DATA;
  if (!DATA || !Array.isArray(DATA.chapters)) {
    console.error('US_CAPITAL_MARKET_DATA가 로드되지 않았습니다.');
    return;
  }

  const STORAGE_THEME = 'uscm-theme';
  const STORAGE_COMPLETED = 'uscm-completed';
  const STORAGE_READ_MODE = 'uscm-read-mode';

  const PART_META = [
    {
      key: 'Part I',
      title: 'Part I · 법규 및 시장 규제 체계',
      badgeClass: 'badge-blue',
      desc: 'U.S.C.·C.F.R. 위계, 4대 증권법, Reg NMS 4대 조항 및 Reg ATS 공시 체계'
    },
    {
      key: 'Part II',
      title: 'Part II · 시장 참여자 및 거래 플랫폼',
      badgeClass: 'badge-teal',
      desc: 'SEC·CFTC·FINRA 감독 구도, 17개 정규거래소와 SIP, Dark Pool·ECN, DTCC·NSCC 청산결제'
    },
    {
      key: 'Part III',
      title: 'Part III · Order Flow 및 SOR 라우팅',
      badgeClass: 'badge-purple',
      desc: '리테일 PFOF·내부화, 기관 알고리즘·ISO, 패시브 ETF·HFT 레이턴시 전쟁, SOR 엔진'
    },
    {
      key: 'Part IV',
      title: 'Part IV · 트레이딩 룰 및 시·종가 결정',
      badgeClass: 'badge-amber',
      desc: 'MWCB·LULD 가격안정장치, Nasdaq Opening/Closing Cross, NYSE D-Order·Parity 경매'
    }
  ];

  const FLOW_SCENARIOS = {
    'retail-clean': {
      title: '시나리오 1: 리테일 개인 투자자의 소량 시장가 매수 (Clean Flow)',
      summary: 'Robinhood·Schwab 등 리테일 주문은 정보 비대칭 독성이 낮아 정규 거래소(Lit)로 가지 않고 도매상(Wholesaler)에게 PFOF를 받고 팔려 장외 내부화(OTC)로 체결됩니다.',
      chapterId: 'ch08',
      steps: [
        {
          step: 'STEP 1 · 주문 접수',
          title: '개인 투자자 → Retail Broker',
          desc: '앱에서 Apple 100주 시장가 매수 제출. 수수료 $0(Zero-Commission) 모델.',
          meta: 'Rule 606 공시 대상'
        },
        {
          step: 'STEP 2 · Toxicity Scoring',
          title: '독성 필터링 (Clean Flow 판별)',
          desc: '단순 현금흐름·비정보성(Uninformed) 주문으로 판정되어 40~50% 확률의 무작위 방향성(Clean Flow) 등급 부여.',
          meta: 'Adverse Selection 극저'
        },
        {
          step: 'STEP 3 · Wholesaler 경매',
          title: 'Citadel · Virtu 등 도매상 라우팅',
          desc: '수 밀리초 안에 여러 Wholesaler에게 라우팅. 가장 큰 Price Improvement와 PFOF를 제시한 도매상이 낙찰.',
          meta: 'Sub-penny PI + PFOF'
        },
        {
          step: 'STEP 4 · OTC 내부화 체결',
          title: '도매상 자기재고(Principal) 직결제',
          desc: '정규 거래소를 거치지 않고 NBBO Midpoint 부근의 센트 미만 가격($50.025 등)으로 즉시 체결 후 잔여 스프레드 흡수.',
          meta: '장외 비중 35~38%'
        },
        {
          step: 'STEP 5 · 사후 보고 및 청산',
          title: 'TRF 10초 보고 → SIP · NSCC',
          desc: 'FINRA TRF에 10초 내 보고되어 Consolidated Tape에 Last Sale 찍히고, T+1 기준 NSCC CNS로 다자간 상쇄 결제.',
          meta: 'DTCC CNS 98% 상쇄'
        }
      ]
    },
    'inst-dark': {
      title: '시나리오 2: 대형 기관(연기금) 10만 주 분할 매수 (Dark-First Waterfall)',
      summary: '가격 충격과 HFT 정보 누출을 막기 위해 Parent Order를 쪼갠 뒤 Dark Pool Midpoint에서 먼저 소진하고 남은 물량만 Lit 거래소에 분산합니다.',
      chapterId: 'ch09',
      steps: [
        {
          step: 'STEP 1 · 모주문 분할',
          title: 'Parent Order → EMS Algo 분할',
          desc: '10만 주를 1일 VWAP/IS 알고리즘으로 수백 개의 소형 Child Order(100~300주)로 시간·거래량 분산.',
          meta: '정보 노출(Leakage) 차단'
        },
        {
          step: 'STEP 2 · Dark-First 스캔',
          title: 'IEX · ATS Dark Pool 중간가 탐색',
          desc: 'Lit 호가창에 올리기 전 UBS ATS, Sigma X2, IEX Midpoint 등에서 상대 기관 블록과 NBBO Midpoint로 조용히 핑(Ping).',
          meta: '거래 수수료 절감 + 0 슬리피지'
        },
        {
          step: 'STEP 3 · Dynamic Rebate Tier',
          title: 'Inverted → Flat → Maker-Taker 순 잔량 집행',
          desc: '남은 IOC 잔량은 Taker 리베이트를 주는 Inverted(BX·EDGA)부터 훑은 뒤, Take Fee가 싼 Flat·전통 거래소 잔량을 타격.',
          meta: 'Rule 610 Cap 30mil 준수'
        },
        {
          step: 'STEP 4 · Passive Resting',
          title: 'Post-Only / Midpoint Peg 대기',
          desc: '남은 물량은 Post-Only 옵션으로 Maker 리베이트를 노리거나 Midpoint Peg로 시세를 추종하며 IEX 350μs 보호막 아래 대기.',
          meta: 'Routing Score 우선순위'
        },
        {
          step: 'STEP 5 · 감사 추적',
          title: 'CAT (Consolidated Audit Trail) 기록',
          desc: '모주문 생성부터 분할, 라우팅, 취소, 최종 체결까지 밀리초·나노초 타임스탬프와 기관 ID가 Rule 613 CAT DB에 통합 저장.',
          meta: 'Reg NMS Rule 613'
        }
      ]
    },
    'inst-iso': {
      title: '시나리오 3: 호가 얇은 급등주 즉시 Sweep (ISO 6단계 동시 타격)',
      summary: '타 거래소 최우선 호가가 사라질(Fading) 위험 없이 여러 거래소의 복수 가격대를 동시에 쓸어 담기 위해 Rule 611(b)(5) 예외 주문인 ISO를 발사합니다.',
      chapterId: 'ch09',
      steps: [
        {
          step: 'STEP 1 · Direct Feed 스캔',
          title: '여러 Lit 거래소 호가 잔량 동시 파악',
          desc: '현재 NBO가 Nasdaq $100.00(300주), NYSE Arca $100.00(200주), Cboe BZX $100.01(500주)로 분포함을 SOR이 인지.',
          meta: 'Proprietary L2/L3 피드'
        },
        {
          step: 'STEP 2 · 다중 슬라이스 생성',
          title: '거래소별 독립 Child ISO 분할',
          desc: '목표가 $100.02까지 1,000주를 즉시 확보하기 위해 3개 거래소로 보낼 독립 ISO 패킷을 1마이크로초 내 생성.',
          meta: 'Intermarket Sweep Order'
        },
        {
          step: 'STEP 3 · 동시 일괄 발사',
          title: 'Nasdaq·Arca·BZX 동시 전송',
          desc: '순차 라우팅(Waterfall) 시 BZX가 시세 변동으로 도망가는 Quote Fading을 막기 위해 광케이블로 동시 전송.',
          meta: 'Quote Fading 원천 차단'
        },
        {
          step: 'STEP 4 · Rule 611 면제 직결',
          title: '수신 거래소 Trade-Through 검사 생략',
          desc: 'Cboe BZX는 $100.01 주문을 받았을 때 타 거래소에 $100.00이 보여도 ISO 플래그를 믿고 자체 라우팅 없이 즉시 체결.',
          meta: 'Rule 611(b)(5) 법적 책임은 발주자'
        },
        {
          step: 'STEP 5 · 잔량 즉시 취소',
          title: 'IOC 속성으로 미체결 소멸',
          desc: '타 HFT에게 먼저 먹힌 물량이 있다면 잔여 ISO는 호가창에 남지 않고 즉시 Cancel되어 정보 노출 최소화.',
          meta: 'Immediate-or-Cancel'
        }
      ]
    },
    'passive-moc': {
      title: '시나리오 4: 패시브 인덱스 ETF의 종가 추적 오차 0% 집행 (Closing Auction)',
      summary: 'S&P 500·Nasdaq 100 추종 ETF는 장중 가격이 아니라 정확히 공식 종가(NOCP/NYSE Close)에 100% 체결되어야 Tracking Error가 0이 됩니다.',
      chapterId: 'ch13',
      steps: [
        {
          step: 'STEP 1 · 종가 주문 집중',
          title: 'MOC / LOC / Floor Broker D-Order 제출',
          desc: '대량 설정·환매 물량을 장중 거래 대신 15:50 Lock-in 전 MOC 또는 NYSE Floor Broker를 통한 Closing D-Order로 집결.',
          meta: '전체 일거래의 6.5~8.5%'
        },
        {
          step: 'STEP 2 · 15:50 정보 공개 및 잠금',
          title: 'NOII / CIB 1초 간격 송출 & 취소 금지',
          desc: '15:50부터 매 1초 불균형(Imbalance)과 Paired Shares, Near/Far Price 공개. 스푸핑 방지를 위해 취소·정정 전면 잠금.',
          meta: 'NYSE D-Order는 15:59:50까지 스텔스'
        },
        {
          step: 'STEP 3 · 15:55 ~ 15:58 불균형 해소',
          title: 'Late LOC Sliding · CIO/CO 차익거래 유입',
          desc: '매수 불균형이 크면 퀀트·HFT 차익거래자들이 정정 불가 잠금 이후 CIO(Nasdaq)·CO(NYSE)로 반대 매도 호가를 공급해 이익 실현.',
          meta: 'In-line Balance 형성'
        },
        {
          step: 'STEP 4 · 15:59:50 NYSE 상태 전이',
          title: 'D-Order Unmasked & DMM 개입 판단',
          desc: 'NYSE 상장사는 15:59:50에 D-Order가 Firm Limit로 공개 전환되고, 불균형이 크면 DMM이 16:00을 수초~수분 지연(Manual Close).',
          meta: 'Nasdaq은 정각 체결 원칙'
        },
        {
          step: 'STEP 5 · 16:00 단일가 일괄 체결',
          title: '공식 종가 확정 및 Parity / 시간 배분',
          desc: 'EP 4단계 규칙으로 단일 종가 산출. 동일가 내 Nasdaq은 시간 우선, NYSE는 Book·각 Broker·DMM 간 Parity 1/N 배분.',
          meta: 'Tracking Error = 0%'
        }
      ]
    },
    'hft-arbitrage': {
      title: '시나리오 5: CME 선물 급등에 반응한 HFT의 150μs 현물 선행 매매',
      summary: '시카고(CME)에서 S&P 500 선물 가격이 움직이면 극초단파(Microwave)로 4.0ms 만에 뉴저지로 날아와 SIP보다 빠른 Direct Feed를 보고 타 HFT·기관의 낡은 호가를 먹습니다.',
      chapterId: 'ch10',
      steps: [
        {
          step: 'STEP 1 · CME 시세 트리거',
          title: '시카고 Aurora 데이터센터 선물 급등',
          desc: 'E-mini S&P 500 선물이 호재 뉴스로 급등. CME 매칭 엔진에서 나가는 체결 패킷을 HFT 수신기가 즉각 포착.',
          meta: '거리 1,200km 레이스 시작'
        },
        {
          step: 'STEP 2 · Microwave 초고속 전송',
          title: '직선 마이크로웨이브 타워 (4.0ms)',
          desc: '굴절률 1.47인 광케이블(6.5~7.0ms) 대신 굴절률 ~1.0 공기 중 직선 마이크로웨이브로 2.5~3.0ms 앞서 뉴저지 도착.',
          meta: '빛의 속도에 근접한 4.0ms'
        },
        {
          step: 'STEP 3 · Co-location & Direct Feed',
          title: 'Carteret·Mahwah 랙에서 Binary 주문',
          desc: 'SIP(80~150μs 지연)보다 수십 배 빠른 거래소 Direct Binary Feed로 현물 호가가 아직 안 바뀐 것(Stale Quote)을 확인.',
          meta: 'Co-location 랙 동일 길이 케이블'
        },
        {
          step: 'STEP 4 · Latency Arbitrage vs Speed Bump',
          title: '일반 Lit 즉시 체결 vs IEX 350μs 차단',
          desc: '일반 Lit 거래소에 남아있던 기관의 낡은 매도 호가는 즉시 먹히지만(Sniping), IEX에선 350μs 광케이블 지연 동안 CQI가 작동해 Midpoint를 방어.',
          meta: 'IEX Magic Shoebox 보호'
        },
        {
          step: 'STEP 5 · 98% 취소 & 리스크 제로화',
          title: '나머지 미체결 취소 및 장 마감 Flat',
          desc: '목표 물량 확보 후 타 거래소 20개에 걸었던 미끼/대기 호가 98%를 1밀리초 안에 Cancel하고, 16:00 전 재고 0 유지.',
          meta: 'HFT 취소율 ~98%'
        }
      ]
    }
  };

  const state = {
    view: 'home',
    chapterId: 'ch01',
    readMode: getStorage(STORAGE_READ_MODE) || 'all',
    completed: new Set(parseCompleted(getStorage(STORAGE_COMPLETED))),
    lab: 'lab-pfof',
    sublab: 'nasdaq-ep',
    flowScenario: 'retail-clean',
    glossaryCat: '전체',
    glossaryQuery: '',
    quizAnswers: {},
    searchSelectedIndex: 0,
    searchResults: []
  };

  let tocObserver = null;
  let scrollRaf = null;

  function getStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, val) {
    try {
      window.localStorage.setItem(key, val);
    } catch (e) {
      // file:// 등에서 storage가 비활성화된 경우 무시
    }
  }

  function parseCompleted(raw) {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

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
    const sign = num < 0 ? '-' : '';
    return sign + '$' + Math.abs(num).toFixed(decimals);
  }

  function formatSignedUsd(val, decimals) {
    const num = Number(val) || 0;
    if (Math.abs(num) < Math.pow(10, -(decimals + 1))) return '$0.' + '0'.repeat(decimals);
    const sign = num > 0 ? '+' : '-';
    return sign + '$' + Math.abs(num).toFixed(decimals);
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

  /* =========================================================
     THEME & PROGRESS BADGES
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
      setStorage(STORAGE_THEME, 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      setStorage(STORAGE_THEME, 'dark');
    }
    syncThemeButton();
  }

  function updateGlobalProgressBadge() {
    const badge = document.getElementById('global-progress-badge');
    const numberedTotal = DATA.chapters.filter(isNumberedChapter).length;
    const doneCount = DATA.chapters.filter((c) => isNumberedChapter(c) && state.completed.has(c.id)).length;
    if (badge) {
      badge.textContent = `${doneCount} / ${numberedTotal} 완료`;
    }
    const gTotal = document.getElementById('glossary-total-num');
    const navCount = document.getElementById('nav-glossary-count');
    if (gTotal) gTotal.textContent = String(DATA.glossary.length);
    if (navCount) navCount.textContent = String(DATA.glossary.length);
  }

  /* =========================================================
     ROUTING & VIEW SWITCHING
     ========================================================= */
  function switchView(viewName, opts) {
    const options = opts || {};
    state.view = viewName;

    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.toggle('is-active', sec.id === 'view-' + viewName);
    });

    document.querySelectorAll('.nav-tab[data-view]').forEach((tab) => {
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
    } else if (viewName === 'home') {
      renderHomePartsGrid();
    }

    if (!options.fromHash) {
      let nextHash = '#' + viewName;
      if (viewName === 'reader') {
        nextHash = '#reader/' + state.chapterId;
      } else if (viewName === 'labs' && state.lab) {
        nextHash = '#labs/' + state.lab;
      }
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
      if (parts[1] && document.getElementById(parts[1])) {
        state.lab = parts[1];
      }
      switchView('labs', { fromHash: true });
    } else if (head === 'glossary') {
      switchView('glossary', { fromHash: true });
    } else {
      switchView('home', { fromHash: true });
    }
  }

  /* =========================================================
     HOME VIEW: CHARTS & CURRICULUM GRID
     ========================================================= */
  function renderHomeCharts() {
    const shareEl = document.getElementById('home-share-chart');
    if (shareEl) {
      const shareRows = [
        { label: 'OTC 내부화 (도매상)', mid: 36.5, range: '35 ~ 38%', color: 'var(--amber)' },
        { label: 'NYSE Group (정규)', mid: 19.5, range: '18 ~ 21%', color: 'var(--primary)' },
        { label: 'Nasdaq Group (정규)', mid: 17.0, range: '16 ~ 18%', color: 'var(--teal)' },
        { label: 'ATS (40여 개 다크풀·ECN)', mid: 12.5, range: '11 ~ 14%', color: 'var(--purple)' },
        { label: 'Cboe Group (정규)', mid: 11.5, range: '10 ~ 13%', color: '#6366f1' },
        { label: 'Independent Lit (IEX·MEMX)', mid: 6.0, range: '5 ~ 7%', color: 'var(--emerald)' }
      ];
      shareEl.innerHTML = shareRows
        .map(
          (row) => `
          <div class="bar-row">
            <span class="bar-label" title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</span>
            <div class="bar-track" aria-hidden="true">
              <div class="bar-fill" style="width:${row.mid}%;background:${row.color};"></div>
            </div>
            <span class="bar-val">${escapeHtml(row.range)}</span>
          </div>`
        )
        .join('');
    }

    const revEl = document.getElementById('home-rev-chart');
    if (revEl) {
      const revRows = [
        { label: 'ICE (NYSE · ~$2.8B)', trading: 30, data: 28, conn: 22, list: 20, tag: '비거래 70%' },
        { label: 'Nasdaq (~$2.5B)', trading: 36, data: 29, conn: 17, list: 18, tag: '비거래 64%' },
        { label: 'Cboe 4개사 (~$0.42B)', trading: 33, data: 38, conn: 27, list: 2, tag: '비거래 67%' },
        { label: 'IEX (~$0.11B)', trading: 78, data: 9, conn: 13, list: 0, tag: '체결 78%' }
      ];
      const legend = `
        <div class="stacked-legend">
          <span><i class="legend-dot" style="background:var(--primary)"></i>순거래 체결</span>
          <span><i class="legend-dot" style="background:var(--teal)"></i>마켓 데이터 &amp; SIP</span>
          <span><i class="legend-dot" style="background:var(--purple)"></i>접속·코로케이션</span>
          <span><i class="legend-dot" style="background:var(--amber)"></i>상장·기타</span>
        </div>`;
      const bars = revRows
        .map(
          (r) => `
          <div class="bar-row">
            <span class="bar-label" title="${escapeHtml(r.label)}">${escapeHtml(r.label)}</span>
            <div class="bar-track" title="체결 ${r.trading}% / 데이터 ${r.data}% / 접속 ${r.conn}% / 상장·기타 ${r.list}%">
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
    }
  }

  function renderHomePartsGrid() {
    const grid = document.getElementById('home-parts-grid');
    if (!grid) return;

    grid.innerHTML = PART_META.map((part) => {
      const partChapters = DATA.chapters.filter((c) => c.part === part.key);
      const cards = partChapters
        .map((ch) => {
          const isDone = state.completed.has(ch.id);
          const numStr = 'Ch ' + formatChapterNum(ch);
          return `
            <button type="button" class="chapter-card" data-open-chapter="${escapeHtml(ch.id)}">
              <div>
                <div class="chapter-card-top">
                  <span class="ch-num-pill">${escapeHtml(numStr)}</span>
                  ${isDone ? '<span class="ch-done-pill">✓ 완료</span>' : ''}
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
            <span class="badge ${part.badgeClass}">${partChapters.length}개 챕터</span>
          </div>
          <div class="part-chapters-row">${cards}</div>
        </section>`;
    }).join('');
  }

  /* =========================================================
     READER VIEW
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
        const itemsHtml = items
          .map((ch) => {
            const active = ch.id === state.chapterId;
            const done = state.completed.has(ch.id);
            const numPrefix = formatChapterNum(ch);
            return `
              <button type="button" class="sidebar-item" data-open-chapter="${escapeHtml(ch.id)}" ${active ? 'aria-current="page"' : ''}>
                <span class="sidebar-item-left">
                  <span class="sidebar-num">${numPrefix}</span>
                  <span class="sidebar-label">${escapeHtml(ch.shortTitle)}</span>
                </span>
                ${done ? '<span class="sidebar-check" aria-label="완료">✓</span>' : ''}
              </button>`;
          })
          .join('');
        return `
          <div class="sidebar-group">
            <div class="sidebar-group-title">${escapeHtml(grp.label)}</div>
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

    if (coreEl) {
      coreEl.classList.toggle('is-hidden', state.readMode === 'supp' && hasSupp);
    }
    if (bannerEl) {
      bannerEl.hidden = !(hasSupp && state.readMode === 'all');
    }
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

    if (mobileTocPanel) {
      mobileTocPanel.open = false;
    }

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
      const targets = visibleToc
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);

      if ('IntersectionObserver' in window && targets.length) {
        const topOffset = window.innerWidth <= 900 ? '-124px' : '-84px';
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
          { rootMargin: `${topOffset} 0px -70% 0px`, threshold: 0.01 }
        );
        targets.forEach((el) => tocObserver.observe(el));
      }
    }

    const matched = DATA.glossary.filter((g) => g.ch === chapter.id);
    const glossaryHtml = !matched.length
      ? ''
      : `
        <div class="toc-title">이 챕터 핵심 용어 (${matched.length})</div>
        <div class="toc-chip-wrap">
          ${matched
            .map(
              (g) =>
                `<button type="button" class="toc-chip" data-jump-term="${escapeHtml(g.term)}" title="${escapeHtml(g.full)}">${escapeHtml(g.term)}</button>`
            )
            .join('')}
        </div>`;

    if (tocGlossary) tocGlossary.innerHTML = glossaryHtml;
    if (mobileTocGlossary) mobileTocGlossary.innerHTML = glossaryHtml;
    if (mobileTocPanel) {
      mobileTocPanel.hidden = !visibleToc.length && !matched.length;
    }
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
      `<h3>이해도 점검 퀴즈 (${quizzes.length}문항)</h3>` +
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
              return `<button type="button" class="${cls}" data-quiz-idx="${qi}" data-opt-idx="${oi}">${escapeHtml(opt)}</button>`;
            })
            .join('');
          const expHtml = answered
            ? `<div class="quiz-exp"><strong>${picked === qz.ans ? '정답!' : '오답입니다.'}</strong> ${escapeHtml(qz.exp)}</div>`
            : '';
          return `
            <div class="quiz-item">
              <div class="quiz-q">Q${qi + 1}. ${escapeHtml(qz.q)}</div>
              <div class="quiz-opts">${optsHtml}</div>
              ${expHtml}
            </div>`;
        })
        .join('');
  }

  function syncCompleteButton() {
    const btn = document.getElementById('toggle-complete-btn');
    if (!btn) return;
    const isDone = state.completed.has(state.chapterId);
    btn.classList.toggle('btn-completed', isDone);
    btn.textContent = isDone ? '✓ 학습 완료됨 (클릭 시 해제)' : '✓ 학습 완료 표시';
    if (state.chapterId === 'overview') {
      btn.hidden = true;
    } else {
      btn.hidden = false;
    }
  }

  function renderReader(chapterId) {
    const ch = getChapterById(chapterId);
    state.chapterId = ch.id;

    renderSidebar();

    const headerCard = document.getElementById('chapter-header-card');
    if (headerCard) {
      const partCfg = PART_META.find((p) => p.key === ch.part);
      const badgeCls = partCfg ? partCfg.badgeClass : 'badge-emerald';
      const numLabel = isNumberedChapter(ch) ? `Chapter ${formatChapterNum(ch)}` : 'Guide';
      const questionsHtml =
        ch.questions && ch.questions.length
          ? `<div class="ch-questions-box">
               <strong>핵심 질문 (Key Questions)</strong>
               <ol>${ch.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ol>
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
    if (coreEl) coreEl.innerHTML = ch.coreHtml || '';
    if (suppEl) suppEl.innerHTML = ch.suppHtml || '';

    applyReadMode(ch);
    syncCompleteButton();
    renderChapterToc(ch);
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
    if (topBtn) {
      topBtn.hidden = window.scrollY < 360;
    }
    const bar = document.getElementById('reading-progress-bar');
    if (!bar) return;
    if (state.view !== 'reader') {
      bar.style.width = '0%';
      return;
    }
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      bar.style.width = '100%';
      return;
    }
    const pct = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
    bar.style.width = pct.toFixed(1) + '%';
  }

  /* =========================================================
     INTERACTIVE LABS
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
  }

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

    const wsBuyPrice = nbo - pi;
    const wsSellPrice = nbb + pi;
    const investorSavedVsNbo = pi * shares;
    const brokerPfofTotal = pfof * shares;

    // 도매상: 매수 측 체결가와 Midpoint 차이(단방향 재고 기준) 및 양방향 유입 시 왕복 스프레드 마진
    const wsEdgeVsMid = (wsBuyPrice - mid) * shares;
    const wsRoundTripCapture = (spread - 2 * pi - 2 * pfof) * shares;

    const litTakerFee = -(takeMil * 0.001) * shares;
    const litMakerReb = rebateMil * 0.001 * shares;
    const litNetCap = (takeMil - rebateMil) * 0.001 * shares;

    const invTakerReb = invRebMil * 0.001 * shares;
    const invMakerFee = -(invFeeMil * 0.001) * shares;
    const invNetCap = (invFeeMil - invRebMil) * 0.001 * shares;

    const rule610Warn =
      rawTakeMil > 3.0
        ? `<div class="callout callout-tip" style="margin:0 0 12px"><strong>Reg NMS Rule 610 상한 적용:</strong> 입력한 ${rawTakeMil.toFixed(1)}밀은 법정 상한(3.0밀 = $0.0030)을 초과하여 <strong>3.0밀</strong>로 제한 계산되었습니다.</div>`
        : '';

    out.innerHTML = `
      ${rule610Warn}
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
          <small>도매상 단방향 마진 vs 양방향 순캡처</small>
          <strong>${formatSignedUsd(wsEdgeVsMid, 2)} / ${formatSignedUsd(wsRoundTripCapture, 2)}</strong>
          <small>Mid 대비 엣지 / 매수·매도 각 ${shares.toLocaleString()}주 상계 후</small>
        </div>
      </div>
      <div class="table-scroll">
        <table class="lab-table">
          <thead>
            <tr>
              <th>체결 경로 (${shares.toLocaleString()}주)</th>
              <th>실체결 가격</th>
              <th>수수료/리베이트 (Taker)</th>
              <th>Maker 측 손익</th>
              <th>거래소 순마진</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Wholesaler (OTC)</strong></td>
              <td>${formatUsd(wsBuyPrice, 4)}<br><small>(매도 유입 ${formatUsd(wsSellPrice, 4)})</small></td>
              <td>NBO 대비 <strong>${formatSignedUsd(investorSavedVsNbo, 2)}</strong> 개선</td>
              <td>브로커 PFOF ${formatSignedUsd(brokerPfofTotal, 2)}</td>
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
              <td><strong>Inverted (BX·EDGA)</strong></td>
              <td>${formatUsd(nbo, 2)}</td>
              <td>${formatSignedUsd(invTakerReb, 2)} (+${invRebMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(invMakerFee, 2)} (-${invFeeMil.toFixed(1)}밀)</td>
              <td>${formatSignedUsd(invNetCap, 2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

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
      <strong>15:55 Late LOC Price Sliding 판정 (${isCrossed ? 'Crossed 예외 적용' : '정상/Locked 시장'})</strong><br>
      매수 상한(Reference Price) = ${isCrossed ? `Last Sale $${last.toFixed(2)}` : `Max(Best Offer $${ask.toFixed(2)}, Last Sale $${last.toFixed(2)})`} = <strong>$${refCap.toFixed(2)}</strong><br>
      제출가 <code>$${locPrice.toFixed(2)}</code> → 최종 유효가 <strong><code>$${effectiveLoc.toFixed(2)}</code></strong>
      (${wasSlid ? '상한 초과로 강제 Sliding 재조정됨!' : '상한 이하이므로 원 제출 가격 유지'})
    `;

    // 기준 호가창(Ch 13 예시 기반, Last Sale이 크게 바뀌면 Last Sale 주변 4단계 그리드 생성)
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
      return {
        price: lvl.price,
        addedBuy,
        totalBuy,
        totalSell,
        paired,
        imbSigned,
        imbAbs,
        side,
        dist
      };
    });

    // Step 1: 최대 체결량
    const maxPaired = Math.max(...rows.map((r) => r.paired));
    let cands = rows.filter((r) => r.paired === maxPaired);
    let decidedStep = 'Step 1 (최대 체결 수량 단독 1위)';

    if (cands.length > 1) {
      // Step 2: 최소 불균형
      const minImb = Math.min(...cands.map((r) => r.imbAbs));
      cands = cands.filter((r) => r.imbAbs === minImb);
      decidedStep = 'Step 2 (동률 최대 체결 후 최소 불균형으로 확정)';
    }

    if (cands.length > 1) {
      // Step 3: 불균형 방향 우선
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
      // Step 4: Current Reference Price (Last Sale) 최단 거리
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
              <th>후보 가격</th>
              <th>누적 매수 (내 주문)</th>
              <th>누적 매도</th>
              <th>Step 1 체결량</th>
              <th>Step 2 불균형</th>
              <th>Step 4 |P - Last|</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr class="${r.price === winner.price ? 'ep-winner-row' : ''}">
                <td>$${r.price.toFixed(2)} ${r.price === winner.price ? '★' : ''}</td>
                <td>${r.totalBuy.toLocaleString()}주 ${r.addedBuy > 0 ? `<small>(+${r.addedBuy.toLocaleString()})</small>` : '<small>(+0)</small>'}</td>
                <td>${r.totalSell.toLocaleString()}주</td>
                <td><strong>${r.paired.toLocaleString()}주</strong></td>
                <td>${r.imbAbs.toLocaleString()}주 (${r.side})</td>
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

  function calculateLab2NyseDorder() {
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
        statusBadge = '기본 지정가 구간 · 100,000주 전량 참여';
        calloutCls = 'callout-supplement';
        explanation = `잠정가 $${p.toFixed(2)} ≤ 기본 지정가 $${floor.toFixed(2)}. 일반 LOC와 동일하게 불균형 방향과 무관하게 100,000주 전량 참여합니다.`;
      } else if (imbDir === 'sell') {
        activeQty = imbQty;
        statusBadge = `스텔스 발동 · 딱 ${imbQty.toLocaleString()}주만 동원`;
        calloutCls = 'callout-tip';
        explanation = `잠정가 $${p.toFixed(2)}는 재량 구간($99.51~$100.50)입니다. 매도 초과(${imbQty.toLocaleString()}주)를 줄이기 위해 엔진이 <strong>${imbQty.toLocaleString()}주만 조용히 동원</strong>해 불균형을 0주로 만들고, 나머지 ${(totalOrder - imbQty).toLocaleString()}주는 숨깁니다.`;
      } else {
        activeQty = 0;
        statusBadge = '스텔스 침묵 · 0주 (비활성)';
        explanation = `잠정가 $${p.toFixed(2)}는 재량 구간이지만 이미 시장이 <strong>매수 초과(${imbQty.toLocaleString()}주)</strong> 상태입니다. 매수 D-Order가 추가되면 가격만 급등하므로 15:59:50 전까지는 <strong>단 1주도 OIB에 노출하지 않습니다.</strong>`;
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
      { name: 'Book Participant (전자 호가장)', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-book')?.value || 0))) },
      { name: 'Floor Broker A (D-Order)', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-ba')?.value || 0))) },
      { name: 'Floor Broker B (D-Order)', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-bb')?.value || 0))) },
      { name: 'DMM Interest (Manual 시)', demand: Math.max(0, Math.floor(Number(document.getElementById('lab2-par-dmm')?.value || 0))) }
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
        // 남은 수량이 활성 참여자 수보다 적을 때 1주씩 순서대로 배정
        for (let i = 0; i < active.length && remaining > 0; i++) {
          active[i].filled += 1;
          remaining -= 1;
          distributedThisRound += 1;
          details.push(`${active[i].name.split(' ')[0]}+1`);
        }
        rounds.push({ round: roundNo++, units: active.length, quota: '잔여 1주씩', distributed: distributedThisRound, note: details.join(', ') });
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
        const capTag = give < target ? ' (완전 체결!)' : '';
        details.push(`${p.name.split(' ')[0]} +${give.toLocaleString()}${capTag}`);
      });

      remaining -= distributedThisRound;
      rounds.push({
        round: roundNo++,
        units: active.length,
        quota: `1/${active.length} (~${base.toLocaleString()}주)`,
        distributed: distributedThisRound,
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
              <th>최종 배분 (Parity 1/N)</th>
              <th>체결률</th>
            </tr>
          </thead>
          <tbody>
            ${participants
              .map((p) => {
                const pct = p.demand > 0 ? ((p.filled / p.demand) * 100).toFixed(1) : '0.0';
                return `
                  <tr>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td>${p.demand.toLocaleString()}주</td>
                    <td><strong>${p.filled.toLocaleString()}주</strong></td>
                    <td>${pct}%</td>
                  </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="ep-summary-box" style="margin-top:10px">
        <strong>총 체결: ${totalFilled.toLocaleString()}주</strong> (공급 ${supply.toLocaleString()}주 / 총 매수 대기 ${totalDemand.toLocaleString()}주 · 미체결 ${(totalDemand - totalFilled).toLocaleString()}주)
        <div style="margin-top:6px;font-size:12.5px;color:var(--text-secondary)">
          ${rounds.map((r) => `<div>• <strong>${r.round}차 배분</strong> (${r.units}단위, ${r.quota}): ${escapeHtml(r.note)}</div>`).join('')}
        </div>
      </div>
    `;
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
    timelineEl.innerHTML = `
      <div class="callout callout-note" style="margin-top:0">
        <strong>${escapeHtml(sc.title)}</strong>
        <p style="margin:6px 0 10px">${escapeHtml(sc.summary)}</p>
        <button type="button" class="btn btn-sm btn-outline" data-open-chapter="${escapeHtml(sc.chapterId)}">관련 챕터(Ch ${sc.chapterId.replace('ch', '')}) 원문 읽기 →</button>
      </div>
      <div class="flow-step-list">
        ${sc.steps
          .map(
            (st) => `
            <div class="flow-step-card">
              <div class="flow-step-num">${escapeHtml(st.step)}</div>
              <h4>${escapeHtml(st.title)}</h4>
              <p>${escapeHtml(st.desc)}</p>
              <div class="flow-step-meta">${escapeHtml(st.meta)}</div>
            </div>`
          )
          .join('')}
      </div>
    `;
  }

  /* =========================================================
     GLOSSARY VIEW
     ========================================================= */
  function renderGlossary() {
    const catsEl = document.getElementById('glossary-cats');
    const gridEl = document.getElementById('glossary-grid');
    const filterInput = document.getElementById('glossary-filter-input');
    if (!catsEl || !gridEl) return;

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

    const q = state.glossaryQuery.trim().toLowerCase();
    const filtered = DATA.glossary.filter((g) => {
      if (state.glossaryCat !== '전체' && g.cat !== state.glossaryCat) return false;
      if (!q) return true;
      return (
        g.term.toLowerCase().includes(q) ||
        g.full.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.cat.toLowerCase().includes(q)
      );
    });

    if (!filtered.length) {
      gridEl.innerHTML = '<div class="panel-card"><p class="muted-small" style="margin:0">검색 조건에 맞는 용어가 없습니다.</p></div>';
      return;
    }

    gridEl.innerHTML = filtered
      .map((g) => {
        const chObj = getChapterById(g.ch);
        const chBadge = isNumberedChapter(chObj) ? `Ch ${formatChapterNum(chObj)}` : '안내';
        return `
          <article class="glossary-card">
            <div>
              <div class="glossary-card-top">
                <div>
                  <h3>${escapeHtml(g.term)}</h3>
                  <div class="glossary-full">${escapeHtml(g.full)}</div>
                </div>
                <button type="button" class="badge badge-blue" style="border:0;cursor:pointer" data-open-chapter="${escapeHtml(g.ch)}" title="관련 챕터로 이동">${escapeHtml(chBadge)} →</button>
              </div>
              <p>${escapeHtml(g.desc)}</p>
            </div>
            <div>
              <span class="badge badge-teal">${escapeHtml(g.cat)}</span>
            </div>
          </article>`;
      })
      .join('');
  }

  /* =========================================================
     GLOBAL SEARCH MODAL (<dialog>)
     ========================================================= */
  function openSearchModal() {
    const dlg = document.getElementById('search-dialog');
    const input = document.getElementById('global-search-input');
    if (!dlg) return;
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
    if (typeof dlg.close === 'function' && dlg.open) {
      dlg.close();
    } else {
      dlg.removeAttribute('open');
    }
  }

  function highlightEscapedSnippet(text, query) {
    if (!query) return escapeHtml(text);
    const lowerText = text.toLowerCase();
    const lowerQ = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1) return escapeHtml(text);
    const start = Math.max(0, idx - 32);
    const end = Math.min(text.length, idx + query.length + 68);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';
    const before = escapeHtml(text.slice(start, idx));
    const match = escapeHtml(text.slice(idx, idx + query.length));
    const after = escapeHtml(text.slice(idx + query.length, end));
    return `${prefix}${before}<mark>${match}</mark>${after}${suffix}`;
  }

  function renderSearchResults() {
    const input = document.getElementById('global-search-input');
    const resultsEl = document.getElementById('global-search-results');
    if (!resultsEl) return;

    const rawQ = (input ? input.value : '').trim();
    const q = rawQ.toLowerCase();
    const results = [];

    if (!q) {
      // 기본 추천 챕터 & 핵심 용어
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
        results.push({
          kind: 'glossary',
          term: g.term,
          ch: g.ch,
          title: `${g.term} (${g.full})`,
          badge: g.cat,
          snippetHtml: escapeHtml(g.desc)
        });
      });
    } else {
      // 1) 용어 매칭
      DATA.glossary.forEach((g) => {
        const hay = `${g.term} ${g.full} ${g.desc}`.toLowerCase();
        if (hay.includes(q)) {
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

      // 2) 챕터 매칭
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

    state.searchResults = results.slice(0, 18);
    state.searchSelectedIndex = 0;

    if (!state.searchResults.length) {
      resultsEl.innerHTML = '<div class="muted-small" style="padding:18px;text-align:center">검색 결과가 없습니다.</div>';
      return;
    }

    resultsEl.innerHTML = state.searchResults
      .map(
        (res, idx) => `
        <button type="button" class="search-res-item${idx === 0 ? ' is-selected' : ''}" data-search-idx="${idx}">
          <div class="search-res-top">
            <span class="badge ${res.kind === 'glossary' ? 'badge-teal' : 'badge-blue'}">${escapeHtml(res.badge)}</span>
            <span>${escapeHtml(res.title)}</span>
          </div>
          <div class="search-res-snippet">${res.snippetHtml}</div>
        </button>`
      )
      .join('');
  }

  function executeSearchSelection(idx) {
    const item = state.searchResults[idx];
    if (!item) return;
    closeSearchModal();
    if (item.kind === 'chapter') {
      switchView('reader', { chapterId: item.id });
    } else if (item.kind === 'glossary') {
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
      switchView('reader', { chapterId: 'ch01' });
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

    document.getElementById('toggle-complete-btn')?.addEventListener('click', () => {
      if (state.chapterId === 'overview') return;
      if (state.completed.has(state.chapterId)) {
        state.completed.delete(state.chapterId);
      } else {
        state.completed.add(state.chapterId);
      }
      setStorage(STORAGE_COMPLETED, JSON.stringify(Array.from(state.completed)));
      updateGlobalProgressBadge();
      syncCompleteButton();
      renderSidebar();
      renderHomePartsGrid();
    });

    // Global delegated clicks
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const viewTab = target.closest('[data-view], [data-jump-view]');
      if (viewTab) {
        const nextView = viewTab.getAttribute('data-view') || viewTab.getAttribute('data-jump-view');
        if (nextView) switchView(nextView);
        return;
      }

      const openCh = target.closest('[data-open-chapter]');
      if (openCh) {
        const chId = openCh.getAttribute('data-open-chapter');
        if (chId) {
          closeMobileSidebar();
          switchView('reader', { chapterId: chId });
        }
        return;
      }

      const modeBtn = target.closest('.mode-btn[data-read-mode]');
      if (modeBtn) {
        state.readMode = modeBtn.getAttribute('data-read-mode') || 'all';
        setStorage(STORAGE_READ_MODE, state.readMode);
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
        if (mobileTocPanel && mobileTocPanel.contains(tocLink)) {
          mobileTocPanel.open = false;
        }
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

      const jumpTerm = target.closest('[data-jump-term]');
      if (jumpTerm) {
        state.glossaryCat = '전체';
        state.glossaryQuery = jumpTerm.getAttribute('data-jump-term') || '';
        switchView('glossary');
        return;
      }

      const quizBtn = target.closest('.quiz-opt-btn[data-quiz-idx]');
      if (quizBtn) {
        const qi = Number(quizBtn.getAttribute('data-quiz-idx'));
        const oi = Number(quizBtn.getAttribute('data-opt-idx'));
        if (!state.quizAnswers[state.chapterId]) {
          state.quizAnswers[state.chapterId] = {};
        }
        state.quizAnswers[state.chapterId][qi] = oi;
        renderQuizBox(getChapterById(state.chapterId));
        return;
      }

      const labTab = target.closest('.lab-tab[data-lab]');
      if (labTab) {
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
        state.flowScenario = scenarioBtn.getAttribute('data-scenario') || 'retail-clean';
        renderLab3();
        return;
      }

      const catBtn = target.closest('.cat-pill[data-glossary-cat]');
      if (catBtn) {
        state.glossaryCat = catBtn.getAttribute('data-glossary-cat') || '전체';
        renderGlossary();
        return;
      }

      const searchItem = target.closest('.search-res-item[data-search-idx]');
      if (searchItem) {
        executeSearchSelection(Number(searchItem.getAttribute('data-search-idx')));
      }
    });

    // Lab 1 presets & live inputs
    document.getElementById('lab1-preset-pdf')?.addEventListener('click', () => {
      document.getElementById('lab1-shares').value = '1000';
      document.getElementById('lab1-nbb').value = '50.00';
      document.getElementById('lab1-nbo').value = '50.04';
      document.getElementById('lab1-pi').value = '0.015';
      document.getElementById('lab1-pfof').value = '0.0015';
      document.getElementById('lab1-take').value = '3.0';
      document.getElementById('lab1-rebate').value = '2.5';
      document.getElementById('lab1-inv-fee').value = '2.0';
      document.getElementById('lab1-inv-reb').value = '1.5';
      calculateLab1();
    });

    document.getElementById('lab1-preset-tight')?.addEventListener('click', () => {
      document.getElementById('lab1-shares').value = '1000';
      document.getElementById('lab1-nbb').value = '100.00';
      document.getElementById('lab1-nbo').value = '100.01';
      document.getElementById('lab1-pi').value = '0.002';
      document.getElementById('lab1-pfof').value = '0.0008';
      document.getElementById('lab1-take').value = '3.0';
      document.getElementById('lab1-rebate').value = '2.5';
      document.getElementById('lab1-inv-fee').value = '2.0';
      document.getElementById('lab1-inv-reb').value = '1.5';
      calculateLab1();
    });

    ['lab1-shares', 'lab1-nbb', 'lab1-nbo', 'lab1-pi', 'lab1-pfof', 'lab1-take', 'lab1-rebate', 'lab1-inv-fee', 'lab1-inv-reb'].forEach(
      (id) => {
        document.getElementById(id)?.addEventListener('input', calculateLab1);
      }
    );

    ['lab2-bid', 'lab2-ask', 'lab2-last', 'lab2-loc-price', 'lab2-loc-qty'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', calculateLab2Nasdaq);
    });

    ['lab2-p-slider', 'lab2-imb-dir', 'lab2-nyse-phase'].forEach((id) => {
      const ev = id === 'lab2-p-slider' ? 'input' : 'change';
      document.getElementById(id)?.addEventListener(ev, calculateLab2NyseDorder);
    });

    ['lab2-par-supply', 'lab2-par-book', 'lab2-par-ba', 'lab2-par-bb', 'lab2-par-dmm'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', calculateLab2Parity);
    });

    // Glossary filter input
    document.getElementById('glossary-filter-input')?.addEventListener('input', (e) => {
      state.glossaryQuery = e.target.value || '';
      renderGlossary();
    });

    // Search dialog events
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
      } else {
        return;
      }
      items.forEach((el, idx) => {
        const sel = idx === state.searchSelectedIndex;
        el.classList.toggle('is-selected', sel);
        if (sel) el.scrollIntoView({ block: 'nearest' });
      });
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
        return;
      }
      if (e.key === '/' && !searchDlg?.open) {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          openSearchModal();
        }
      }
      if (e.key === 'Escape') {
        closeMobileSidebar();
      }
    });

    // Reading progress on scroll
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
    updateGlobalProgressBadge();
    renderHomeCharts();
    renderHomePartsGrid();
    bindEvents();
    applyHashRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
