#!/usr/bin/env python3
"""
chapters/*.md 문서를 파싱하여 웹사이트용 정적 데이터(website/chapters-data.js)를 생성합니다.
- file:// 프로토콜 및 HTTP 서버 모두에서 CORS 없이 즉시 동작합니다.
- Mermaid 다이어그램을 외부 CDN 없이 동작하는 반응형 HTML/SVG 다이어그램으로 변환합니다.
- 원문 본문과 '추가 설명자료'를 구조적으로 분리해 읽기 모드 전환을 지원합니다.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
import markdown
from bs4 import BeautifulSoup, Tag

ROOT = Path(__file__).resolve().parent
CHAPTERS_DIR = ROOT / "chapters"
WEBSITE_DIR = ROOT / "website"

CHAPTER_MANIFEST = [
    {
        "id": "overview",
        "num": "00",
        "part": "Overview",
        "partLabel": "전체 지도 & 학습 가이드",
        "title": "미국 자본시장 구조 전체 가이드",
        "shortTitle": "전체 아키텍처 & 로드맵",
        "sourceRef": "전체 개관 (원문 4파트 85쪽 종합)",
        "readMin": 5,
        "file": "README.md",
    },
    {
        "id": "ch01",
        "num": "01",
        "part": "Part I",
        "partLabel": "파트 I. 자본시장 관련 법규",
        "title": "법규 체계: 의회 제정법(U.S.C.)과 행정규칙(C.F.R.)",
        "shortTitle": "1. 법규 체계",
        "sourceRef": "파트 I > 1. 법규 체계 (원문 p.2~3)",
        "readMin": 6,
        "file": "part1-regulations/01-legal-framework.md",
    },
    {
        "id": "ch02",
        "num": "02",
        "part": "Part I",
        "partLabel": "파트 I. 자본시장 관련 법규",
        "title": "주요 연방 증권법 (1933년 · 1934년 · 1940년 법)",
        "shortTitle": "2.1~2.3 연방 증권법",
        "sourceRef": "파트 I > 2.1, 2.2 개요, 2.3 (원문 p.4~5, p.13)",
        "readMin": 7,
        "file": "part1-regulations/02-securities-acts.md",
    },
    {
        "id": "ch03",
        "num": "03",
        "part": "Part I",
        "partLabel": "파트 I. 자본시장 관련 법규",
        "title": "핵심 행정규칙: Regulation NMS & Regulation ATS",
        "shortTitle": "2.2 Reg NMS & Reg ATS",
        "sourceRef": "파트 I > 2.2 Regulation NMS & ATS (원문 p.6~12)",
        "readMin": 14,
        "file": "part1-regulations/03-reg-nms-and-reg-ats.md",
    },
    {
        "id": "ch04",
        "num": "04",
        "part": "Part II",
        "partLabel": "파트 II. 시장참여자",
        "title": "규제기관: 연방 감독기구(SEC·CFTC)와 자율규제기구(FINRA·SRO)",
        "shortTitle": "1. 규제기관",
        "sourceRef": "파트 II > 1. 규제기관 (원문 p.15~16)",
        "readMin": 6,
        "file": "part2-participants/04-regulators-and-sros.md",
    },
    {
        "id": "ch05",
        "num": "05",
        "part": "Part II",
        "partLabel": "파트 II. 시장참여자",
        "title": "정규 거래소: SIP/NBBO, 4대 그룹, 수익모델 및 2024년 실적",
        "shortTitle": "2.1 정규 거래소",
        "sourceRef": "파트 II > 2.1 정규 거래소 (원문 p.17~28)",
        "readMin": 18,
        "file": "part2-participants/05-national-exchanges.md",
    },
    {
        "id": "ch06",
        "num": "06",
        "part": "Part II",
        "partLabel": "파트 II. 시장참여자",
        "title": "대체거래소(ATS)와 정규거래소 간 경쟁 및 점유율",
        "shortTitle": "2.2~2.3 ATS와 시장 점유율",
        "sourceRef": "파트 II > 2.2~2.3 ATS & 경쟁 (원문 p.28~33)",
        "readMin": 12,
        "file": "part2-participants/06-ats-and-competition.md",
    },
    {
        "id": "ch07",
        "num": "07",
        "part": "Part II",
        "partLabel": "파트 II. 시장참여자",
        "title": "청산결제 기관(DTCC·NSCC·FICC·DTC)과 시장 회원",
        "shortTitle": "3~4. 청산결제 기관 및 회원",
        "sourceRef": "파트 II > 3~4. 청산결제 및 회원 (원문 p.34~38)",
        "readMin": 10,
        "file": "part2-participants/07-clearing-and-members.md",
    },
    {
        "id": "ch08",
        "num": "08",
        "part": "Part III",
        "partLabel": "파트 III. Order Flow",
        "title": "Retail Order Flow: PFOF와 Wholesaler의 Cream-Skimming",
        "shortTitle": "1. Retail Order Flow",
        "sourceRef": "파트 III > 1. Retail Order Flow (원문 p.40~43)",
        "readMin": 10,
        "file": "part3-order-flow/08-retail-order-flow.md",
    },
    {
        "id": "ch09",
        "num": "09",
        "part": "Part III",
        "partLabel": "파트 III. Order Flow",
        "title": "Institution Algorithmic Order Flow: Slicing, Dark-First & ISO",
        "shortTitle": "2. 기관 Algo Order Flow",
        "sourceRef": "파트 III > 2. Institution Algo Flow (원문 p.44~49)",
        "readMin": 14,
        "file": "part3-order-flow/09-institutional-algo-flow.md",
    },
    {
        "id": "ch10",
        "num": "10",
        "part": "Part III",
        "partLabel": "파트 III. Order Flow",
        "title": "Passive & Benchmark Flow와 Proprietary & HFT Flow",
        "shortTitle": "3~4. Passive & HFT Flow",
        "sourceRef": "파트 III > 3~4. Passive & HFT (원문 p.50~55)",
        "readMin": 12,
        "file": "part3-order-flow/10-passive-and-hft-flow.md",
    },
    {
        "id": "ch11",
        "num": "11",
        "part": "Part III",
        "partLabel": "파트 III. Order Flow",
        "title": "참고: SOR (Smart Order Routing) — Taker vs Maker 전략",
        "shortTitle": "5. SOR 라우팅 전략",
        "sourceRef": "파트 III > 5. 참고: SOR (원문 p.56~59)",
        "readMin": 9,
        "file": "part3-order-flow/11-smart-order-routing.md",
    },
    {
        "id": "ch12",
        "num": "12",
        "part": "Part IV",
        "partLabel": "파트 IV. 주요 Trading Rule",
        "title": "가격안정화 장치: MWCB, LULD 및 거래소별 안정화 룰",
        "shortTitle": "1. 가격안정화 장치",
        "sourceRef": "파트 IV > 1. 가격안정화 장치 (원문 p.61~62 통합)",
        "readMin": 8,
        "file": "part4-trading-rules/12-price-stabilization.md",
    },
    {
        "id": "ch13",
        "num": "13",
        "part": "Part IV",
        "partLabel": "파트 IV. 주요 Trading Rule",
        "title": "미국 시가·종가 특징 및 Nasdaq 사례 (Opening & Closing Cross)",
        "shortTitle": "2.1~2.2 미국 특징 & Nasdaq",
        "sourceRef": "파트 IV > 2.1~2.2 Nasdaq 사례 (원문 p.63~72)",
        "readMin": 18,
        "file": "part4-trading-rules/13-opening-closing-nasdaq.md",
    },
    {
        "id": "ch14",
        "num": "14",
        "part": "Part IV",
        "partLabel": "파트 IV. 주요 Trading Rule",
        "title": "NYSE 사례: DMM 주도 하이브리드 옥션 (D-Order & Parity 배분)",
        "shortTitle": "2.3 NYSE 하이브리드 옥션",
        "sourceRef": "파트 IV > 2.3 NYSE 사례 (원문 p.73~85)",
        "readMin": 20,
        "file": "part4-trading-rules/14-opening-closing-nyse.md",
    },
]

# 오프라인 환경에서도 선명하게 동작하도록 Mermaid 다이어그램을 반응형 HTML/SVG 플로우 차트로 매핑
DIAGRAM_HTML_MAP = {
    ("overview", 0): """
    <div class="diagram-card" role="figure" aria-label="미국 자본시장 4파트 아키텍처">
      <div class="diagram-title">미국 자본시장 4단계 아키텍처 흐름</div>
      <div class="flow-stack">
        <div class="flow-node node-blue"><strong>파트 I. 자본시장 관련 법규</strong><span>1933 / 1934 / 1940 Act · Reg NMS · Reg ATS</span></div>
        <div class="flow-arrow">↓ 규칙과 의무 부여</div>
        <div class="flow-node node-teal"><strong>파트 II. 시장참여자 및 인프라</strong><span>SEC·CFTC·FINRA · 정규거래소 · ATS · DTCC · 회원(GCM/DCM/NCM)</span></div>
        <div class="flow-arrow">↓ 플랫폼·인프라 위에서 작동</div>
        <div class="flow-node node-amber"><strong>파트 III. Order Flow (주문 흐름)</strong><span>Retail(PFOF) · 기관 Algo(Slicing/ISO) · 패시브 종가 · HFT · SOR</span></div>
        <div class="flow-arrow">↓ 급변동 제어 및 시·종가 형성</div>
        <div class="flow-node node-purple"><strong>파트 IV. 주요 Trading Rule</strong><span>MWCB · LULD · Nasdaq Cross · NYSE Hybrid Auction</span></div>
      </div>
    </div>""",
    ("ch01", 0): """
    <div class="diagram-card" role="figure" aria-label="미국 증권 법규 3단 계층">
      <div class="diagram-title">미국 증권 법규의 3단 계층 구조</div>
      <div class="flow-stack">
        <div class="flow-node node-blue"><strong>1층: 의회 제정법 (Statutes)</strong><span>U.S.C. Title 15 — 1933년·1934년·1940년 법</span></div>
        <div class="flow-arrow">↓ 위임 (Delegation)</div>
        <div class="flow-node node-teal"><strong>2층: 행정규칙 (Regulations / Rules)</strong><span>17 C.F.R. Part 230 / 240 / 242 — SEC Rules (파생상품은 CFTC)</span></div>
        <div class="flow-arrow">↓ 감독 및 승인 (Oversight)</div>
        <div class="flow-node node-slate"><strong>3층: 자율규제 하위 규정 (SRO Rulebooks)</strong><span>FINRA / Nasdaq / NYSE 자체 규정집</span></div>
      </div>
    </div>""",
    ("ch04", 0): """
    <div class="diagram-card" role="figure" aria-label="2층 감독 체계">
      <div class="diagram-title">미국 자본시장 2층 감독 체계</div>
      <div class="flow-stack">
        <div class="flow-node node-blue"><strong>1층: 연방 규제기관 (국가 경찰 &amp; 입법자)</strong><span>SEC (주식·채권·거래소) / CFTC (선물·파생) · 형사 사건은 DOJ 연계</span></div>
        <div class="flow-arrow">↓ 규정 승인 및 감독</div>
        <div class="flow-split">
          <div class="flow-node node-teal"><strong>FINRA (비영리 협회)</strong><span>3,400+ 브로커·장외(OTC/ATS) 감시</span></div>
          <div class="flow-node node-teal"><strong>SROs (NYSE · Nasdaq 등)</strong><span>자사 오더북 · 회원 회선 실시간 통제</span></div>
        </div>
        <div class="flow-arrow">↓ 실시간 감시 · 벌금 · 자격 박탈</div>
        <div class="flow-node node-slate"><strong>시장 현장</strong><span>브로커-딜러 · ATS · Wholesaler · 투자자</span></div>
      </div>
    </div>""",
    ("ch05", 0): """
    <div class="diagram-card" role="figure" aria-label="SIP 메시지 처리 구조">
      <div class="diagram-title">SIP 피드의 실제 메시지 처리 구조 (Participant BBO vs NBBO)</div>
      <div class="flow-stack">
        <div class="flow-node node-slate"><strong>특정 거래소 호가 변경 발생</strong><span>예: Cboe BYX에서 매수/매도 1등 호가 변경</span></div>
        <div class="flow-arrow">↓ SIP 프로세서로 인바운드 전송</div>
        <div class="flow-node node-blue"><strong>① Participant BBO Message (개별 거래소 갱신)</strong><span>Exchange: BYX | Bid $99.80 (200주) / Offer $100.20 (400주)<br/>NBBO 밖 가격이라도 무조건 실시간 브로드캐스팅</span></div>
        <div class="flow-arrow">↓ SIP 내부 NBBO 재연산 엔진 가동</div>
        <div class="flow-split">
          <div class="flow-node node-slate"><strong>Case A: 전체 1등(NBBO) 무변동</strong><span>NBBO 메시지 미발행 · ①번 개별 피드만 배포</span></div>
          <div class="flow-node node-emerald"><strong>Case B: 전체 NBBO 갱신됨</strong><span>①번 배포 + ②번 신규 NBBO 요약 메시지 즉시 배포</span></div>
        </div>
      </div>
    </div>""",
    ("ch05", 1): """
    <div class="diagram-card" role="figure" aria-label="거래소 비거래 수익 구조">
      <div class="diagram-title">Non-Transaction Revenue (비거래 수익) 아키텍처</div>
      <div class="flow-split">
        <div class="flow-col">
          <div class="flow-node node-blue"><strong>Market Data (시세·지수)</strong><span>거래소의 정보 독점 수익</span></div>
          <div class="flow-sublist">
            <div>• <strong>Proprietary Feeds</strong>: L2/L3 TotalView, OpenBook</div>
            <div>• <strong>SIP Tape 분배금</strong>: CTA/CQ, UTP 수익 정산</div>
            <div>• <strong>Index Licensing</strong>: QQQ, SPX 등 지수 AUM 사용료</div>
          </div>
        </div>
        <div class="flow-col">
          <div class="flow-node node-teal"><strong>Connectivity (인프라·접속)</strong><span>초저지연 물리·논리 통행료</span></div>
          <div class="flow-sublist">
            <div>• <strong>Co-location</strong>: NJ 데이터센터 랙 캐비닛·전력</div>
            <div>• <strong>Physical Ports</strong>: 10Gb / 40Gb 초저지연 광회선</div>
            <div>• <strong>Logical Ports</strong>: FIX / OUCH / ITCH 세션 과금</div>
          </div>
        </div>
      </div>
    </div>""",
    ("ch07", 0): """
    <div class="diagram-card" role="figure" aria-label="DTCC 지배구조 및 3대 자회사">
      <div class="diagram-title">DTCC 지주회사와 3대 청산·예탁 자회사</div>
      <div class="flow-stack">
        <div class="flow-node node-blue"><strong>DTCC (Depository Trust &amp; Clearing Corporation)</strong><span>월가 금융기관 분산 소유 지주회사 (User-Owned, User-Governed)</span></div>
        <div class="flow-arrow">↓ 3대 핵심 인프라 자회사</div>
        <div class="flow-split flow-split-3">
          <div class="flow-node node-emerald"><strong>NSCC</strong><span>주식·ETF·회사채 청산(CCP)<br/>T일 Novation · CNS 98% 상쇄 · VaR</span></div>
          <div class="flow-node node-amber"><strong>FICC</strong><span>미국 국채(Treasury) ·<br/>MBS 청산 전담</span></div>
          <div class="flow-node node-teal"><strong>DTC</strong><span>중앙예탁기관(CSD)<br/>전자등록 · Book-entry · DVP</span></div>
        </div>
      </div>
    </div>""",
    ("ch08", 0): """
    <div class="diagram-card" role="figure" aria-label="Wholesaler Cream-Skimming 분기 구조">
      <div class="diagram-title">Wholesaler의 Cream-Skimming: Clean Flow vs Toxic Flow</div>
      <div class="flow-stack">
        <div class="flow-node node-slate"><strong>인바운드 리테일 주문 인입</strong><span>Retail Broker → Wholesaler (수 마이크로초 내 독성 평가)</span></div>
        <div class="flow-arrow">↓ Toxicity Scoring 분기</div>
        <div class="flow-split">
          <div class="flow-col">
            <div class="flow-node node-emerald"><strong>조건 A: 무정보성 (Clean Flow)</strong><span>· 100주 이하 소액 (Odd-lot)<br/>· 밈 주식 군집 매수<br/>· E-mini 선물 급변과 무관</span></div>
            <div class="flow-arrow">↓ Internalization (내부화)</div>
            <div class="flow-node node-blue"><strong>딜러 자기자본 100% 흡수</strong><span>안전한 스프레드 + Price Improvement + PFOF 지출</span></div>
          </div>
          <div class="flow-col">
            <div class="flow-node node-amber"><strong>조건 B: 독성 호가 (Toxic Flow)</strong><span>· 마감 직전 비정상 대량 주문<br/>· 호가창을 한 방향으로 깰 크기<br/>· 기관 블록 파편으로 의심</span></div>
            <div class="flow-arrow">↓ Externalization (외부화)</div>
            <div class="flow-node node-slate"><strong>거부 또는 Lit 거래소 라우팅</strong><span>역선택 위험 회피 (Lit 호가장 독성 전이)</span></div>
          </div>
        </div>
      </div>
    </div>""",
    ("ch09", 0): """
    <div class="diagram-card" role="figure" aria-label="기관 모주문 Slicing 흐름">
      <div class="diagram-title">모 주문(Parent Order) → 자 주문(Child Order) 분할 파이프라인</div>
      <div class="flow-stack">
        <div class="flow-node node-blue"><strong>포트폴리오 매니저 (PM)</strong><span>"Buy 500,000 AAPL (Full-Day VWAP, Max Participation: 15%)"</span></div>
        <div class="flow-arrow">↓ FIX Protocol</div>
        <div class="flow-node node-slate"><strong>브로커 OMS / 전자 집행 데스크</strong><span>Parent Order 접수</span></div>
        <div class="flow-arrow">↓ 알고리즘 트레이딩 엔진</div>
        <div class="flow-node node-teal"><strong>Volume Profile 예측 및 시간/구간 슬라이스 계산</strong><span>VWAP · TWAP · POV · Implementation Shortfall</span></div>
        <div class="flow-arrow">↓ 수백~수천 개로 분할</div>
        <div class="flow-split flow-split-3">
          <div class="flow-node node-slate"><strong>Child #1</strong><span>1,200주</span></div>
          <div class="flow-node node-slate"><strong>Child #2</strong><span>800주</span></div>
          <div class="flow-node node-slate"><strong>Child #n</strong><span>...</span></div>
        </div>
        <div class="flow-arrow">↓</div>
        <div class="flow-node node-emerald"><strong>Smart Order Router (SOR)</strong><span>다계층 집행 (Dark-First → Lit Sweep)</span></div>
      </div>
    </div>""",
    ("ch09", 1): """
    <div class="diagram-card" role="figure" aria-label="자주문 다계층 Waterfall Routing">
      <div class="diagram-title">자 주문(Child Order) 2단계 Waterfall Routing</div>
      <div class="flow-stack">
        <div class="flow-node node-slate"><strong>Child Order 인입</strong><span>예: 2,000주 매수 주문</span></div>
        <div class="flow-arrow">↓ Stage 1</div>
        <div class="flow-node node-purple"><strong>Stage 1: Dark Sweep (비공개 다크풀 동시 타격)</strong><span>· UBS ATS, MS Pool, Liquidnet, JPM-X<br/>· Midpoint Peg + MinQty 설정 · 공개 호가창에 흔적 미노출</span></div>
        <div class="flow-arrow">↓ 800주 체결 / 미체결 잔량 1,200주 이관</div>
        <div class="flow-node node-blue"><strong>Stage 2: Lit Routing (정규 거래소 오더북 공략)</strong><span>· 잔여 1,200주를 16개 정규 거래소로 분할<br/>· Case A: 패시브(Maker) — Iceberg로 Maker-Taker 거래소에 깔기<br/>· Case B: 적극적(Taker) — ISO 주문으로 NBBO 동시 격파</span></div>
      </div>
    </div>""",
    ("ch09", 2): """
    <div class="diagram-card" role="figure" aria-label="ISO 매칭 엔진 처리 시퀀스">
      <div class="diagram-title">매칭 엔진 내부의 ISO 주문 처리 시퀀스</div>
      <div class="flow-stack">
        <div class="flow-node node-amber"><strong>Inbound ISO Order 도착</strong><span>"Buy 1,000 AAPL @ $100.02 (ISO)" (FIX 40=d / OUCH 플래그)</span></div>
        <div class="flow-arrow">↓</div>
        <div class="flow-node node-blue"><strong>거래소 매칭 엔진 (Match Engine)</strong><span>1. 타 거래소 NBBO 검증 루틴 바이패스 (Bypass)<br/>2. 자체 오더북 매도 호가를 $100.02 한도까지 즉시 Sweep<br/>3. 타 거래소로 아웃바운드 라우팅 절대 안 함</span></div>
        <div class="flow-arrow">↓ 주문 유효기간(TIF) 결합 분기</div>
        <div class="flow-split">
          <div class="flow-node node-emerald"><strong>IOC 조건 결합 (Sweep &amp; Clear)</strong><span>Sweep 후 미체결 잔량 즉시 취소</span></div>
          <div class="flow-node node-teal"><strong>DAY 조건 결합 (Display ISO)</strong><span>$100.02 가격에 즉시 오더북 Display 게시</span></div>
        </div>
      </div>
    </div>""",
    ("ch10", 0): """
    <div class="diagram-card" role="figure" aria-label="SIP vs Direct Feed 지연시간 차익거래">
      <div class="diagram-title">SIP vs. Direct Feed 지연시간 차익거래 (Latency Arbitrage)</div>
      <div class="flow-stack">
        <div class="flow-node node-blue"><strong>Nasdaq 매칭 엔진 (Carteret, NJ)</strong><span>체결 및 호가 변동 발생 ($100 → $101)</span></div>
        <div class="flow-arrow">↓ 데이터 전파 속도 격차</div>
        <div class="flow-split">
          <div class="flow-col">
            <div class="flow-node node-emerald"><strong>Direct Feed (ITCH 멀티캐스트)</strong><span>나노초 단위 직결 송출</span></div>
            <div class="flow-arrow">↓</div>
            <div class="flow-node node-emerald"><strong>HFT 서버 (Co-located + FPGA)</strong><span>Synthetic NBBO 선제 산출 완료</span></div>
            <div class="flow-arrow">↓ 초고속 마이크로웨이브 회선</div>
            <div class="flow-node node-amber"><strong>타 거래소(NYSE Mahwah) 타격</strong><span>아직 남아있는 $100.00 지체 호가 ISO 스나이핑</span></div>
          </div>
          <div class="flow-col">
            <div class="flow-node node-slate"><strong>SIP 집계 엔진 (SIAC / Nasdaq)</strong><span>수백 μs ~ 수 ms 물리적 지연 발생</span></div>
            <div class="flow-arrow">↓</div>
            <div class="flow-node node-slate"><strong>느린 브로커 / 일반 참여자</strong><span>늦게 도착한 SIP NBBO를 현재 시세로 인지</span></div>
          </div>
        </div>
      </div>
    </div>""",
    ("ch10", 1): """
    <div class="diagram-card" role="figure" aria-label="시카고-뉴저지 마이크로웨이브 선물현물 차익거래">
      <div class="diagram-title">선물-현물 (Cash-Futures) 1,200km 초고속 마이크로웨이브 차익 구조</div>
      <div class="flow-split">
        <div class="flow-node node-amber"><strong>시카고 CME (Aurora, IL)</strong><span>E-mini S&amp;P 500 / NQ 선물 엔진<br/>뉴스·지표에 수 밀리초 선행 반응</span></div>
        <div class="flow-node node-blue"><strong>뉴저지 현물 거래소군 (NJ)</strong><span>NYSE(Mahwah) · Nasdaq(Carteret) · Cboe(Secaucus)<br/>선물 상승분 미반영 우량주 즉시 매수</span></div>
      </div>
      <div class="flow-bridge">⇄ 초고속 마이크로웨이브 무선망 (~1,200km · 빛 속도의 99% · 편도 4.0~4.1ms) ⇄</div>
    </div>""",
    ("ch11", 0): """
    <div class="diagram-card" role="figure" aria-label="SOR Taker vs Maker 라우팅 의사결정">
      <div class="diagram-title">SOR 의사결정 트리: Taker Order vs Maker Order</div>
      <div class="flow-stack">
        <div class="flow-node node-slate"><strong>매수 주문 인입</strong><span>타방 NBO와 즉시 체결 가능한가?</span></div>
        <div class="flow-split">
          <div class="flow-col">
            <div class="flow-node node-amber"><strong>Yes: Taker Order (IOC/FAK)</strong><span>Dark-First → Lit Sweep (Rule 611)</span></div>
            <div class="flow-sublist">
              <div>1순위: <strong>Inverted</strong> (Taker 리베이트 수취)</div>
              <div>2순위: <strong>Flat-Fee</strong> (저가 고정 수수료)</div>
              <div>3순위: <strong>Maker-Taker</strong> (최고 3밀 지불)</div>
            </div>
          </div>
          <div class="flow-col">
            <div class="flow-node node-blue"><strong>No: Maker Order (Post-Only)</strong><span>Routing Score = 체결확률 - 역선택 - 비용</span></div>
            <div class="flow-sublist">
              <div>• <strong>자방 동일가</strong>: 큐 짧은 곳·Taker 유입 많은 곳</div>
              <div>• <strong>자방 우선가</strong>: 단독 NBBO 형성·유입속도 기준</div>
              <div>• <strong>자방 열위가</strong>: Maker-Taker 리베이트 최대처</div>
            </div>
          </div>
        </div>
      </div>
    </div>""",
}

# 핵심 통합 용어 사전 (70+ 핵심 용어)
GLOSSARY_DATA = [
    {"term": "U.S.C.", "full": "United States Code", "cat": "법규", "ch": "ch01", "desc": "미국 연방의회가 제정한 법률(Statutes)을 54개 주제(Title)별로 묶어 정리한 공식 연방 법전. 증권법은 Title 15에 수록됩니다."},
    {"term": "C.F.R.", "full": "Code of Federal Regulations", "cat": "법규", "ch": "ch01", "desc": "SEC·CFTC 등 행정기관이 법률 위임을 받아 만든 세부 행정규칙집. 증권 규칙은 Title 17(Part 230/240/242 등)에 수록됩니다."},
    {"term": "Securities Act of 1933", "full": "1933년 증권법 ('33 Act)", "cat": "법규", "ch": "ch02", "desc": "기업이 신주·채권을 발행해 자금을 조달하는 발행시장(Primary Market)을 규율하는 법. 등록 의무(Section 5), 사모 면제(Reg D), 역외 발행(Reg S)이 핵심입니다."},
    {"term": "Exchange Act of 1934", "full": "1934년 증권거래소법 ('34 Act)", "cat": "법규", "ch": "ch02", "desc": "이미 발행된 증권이 거래되는 유통시장, 거래소(Section 6), 브로커-딜러(Section 15), 불공정거래 금지(Section 10(b)), FINRA(Section 15A)를 규율합니다."},
    {"term": "Rule 10b-5", "full": "Exchange Act Rule 10b-5", "cat": "법규", "ch": "ch02", "desc": "Section 10(b)에 근거한 증권 사기·시세조종 포괄 금지 조항. 내부자거래, 허위 공시, Form ATS-N 위반 등 제재의 핵심 근거입니다."},
    {"term": "Regulation D / S", "full": "17 C.F.R. Part 230 Reg D & S", "cat": "법규", "ch": "ch02", "desc": "1933년 법상 까다로운 공모 증권 등록을 면제해 주는 조항. Reg D는 미국 내 사모 자금조달, Reg S는 미국 밖 해외 역외발행 면제입니다."},
    {"term": "Regulation SHO", "full": "17 C.F.R. §§242.200~204", "cat": "법규", "ch": "ch02", "desc": "공매도(Short Sale) 규율 규칙. 무차입 공매도 방지(Locate 의무) 및 결제 불이행 시 강제 청산(Close-out)을 규정합니다."},
    {"term": "Regulation SCI", "full": "System Compliance and Integrity", "cat": "법규", "ch": "ch02", "desc": "거래소, 청산소(DTCC), 점유율 20% 초과 대형 ATS 등 핵심 인프라의 전산 안정성·보안·장애 보고를 강제하는 규정입니다."},
    {"term": "The 1940 Act / Advisers Act", "full": "Investment Company / Advisers Act of 1940", "cat": "법규", "ch": "ch02", "desc": "투자회사법(뮤추얼펀드·ETF 지배구조 규율)과 투자자문업법(운용사·자문사의 수탁자 의무 Fiduciary Duty 규율)입니다."},
    {"term": "Regulation NMS", "full": "National Market System (17 C.F.R. §§242.600~614)", "cat": "법규", "ch": "ch03", "desc": "여러 거래소·ATS로 쪼개진 미국 시장을 하나의 가상 단일 시장으로 묶기 위한 SEC의 핵심 시장미시구조 규정(Rule 602~613)입니다."},
    {"term": "Rule 602 (Quote Rule)", "full": "Reg NMS Rule 602", "cat": "법규", "ch": "ch03", "desc": "브로커-딜러의 확정 호가(Firm Quote) 체결 의무와 SRO의 BBO 산출·SIP 실시간 전송 의무를 규정합니다."},
    {"term": "Rule 605 / Rule 606", "full": "Execution Quality / Order Routing Disclosure", "cat": "법규", "ch": "ch03", "desc": "Rule 605는 체결 속도·가격 개선율·유효 스프레드를 월간 공시하게 하고, Rule 606은 리테일 증권사의 주문 라우팅 비율 및 PFOF 수취 금액을 분기 공시하게 합니다."},
    {"term": "Rule 610 (Access Rule)", "full": "Reg NMS Rule 610", "cat": "법규", "ch": "ch03", "desc": "거래소/ATS의 공정 접근 보장, Taker 수수료 상한(주당 30밀 = $0.0030), Locked/Crossed Market 방지를 규정합니다."},
    {"term": "Rule 611 (Order Protection)", "full": "Trade-through 금지 규칙", "cat": "법규", "ch": "ch03", "desc": "타 거래소에 더 유리한 보호호가(NBBO)가 있는데도 이를 무시하고 열위한 가격에 체결(Trade-through)하는 것을 금지합니다. 예외로 ISO가 있습니다."},
    {"term": "Rule 612 (Sub-Penny Rule)", "full": "최소 호가단위 규정", "cat": "법규", "ch": "ch03", "desc": "$1 이상 주식은 $0.01(1센트) 미만 호가 게시를 금지해 큐 새치기를 막습니다($1 미만은 $0.0001 허용). 단, 도매상 내부화 체결 시엔 Sub-penny 허용으로 논란이 됩니다."},
    {"term": "CAT", "full": "Consolidated Audit Trail (Rule 613)", "cat": "법규", "ch": "ch03", "desc": "2010 플래시 크래시 이후 도입된 통합 감사 추적 시스템. 전 미국의 호가 접수·정정·취소·라우팅·체결 데이터를 나노/마이크로초 타임스탬프로 매일 수집합니다."},
    {"term": "Regulation ATS (5% Rule)", "full": "Reg ATS Rule 301(b)(3)/(5)", "cat": "법규", "ch": "ch03", "desc": "특정 종목 거래량이 직전 6개월 중 4개월 이상 ADTV의 5%를 넘으면(2인 이상 Display 시) 호가 공개 의무와 Fair Access 의무가 발동됩니다."},
    {"term": "Form ATS-N", "full": "Reg ATS Rule 304 공시 서식", "cat": "법규", "ch": "ch03", "desc": "NMS 주식을 다루는 ATS가 EDGAR에 100% 공개 제출해야 하는 운영 설명서(이해상충, 매칭로직, 데이터피드, 주문 세그멘테이션 공시)."},
    {"term": "Slippage (슬리피지)", "full": "Expected Price vs Executed Price", "cat": "주문/체결", "ch": "ch03", "desc": "기대가격과 실제 체결가격의 오차. Rule 605에서는 2×|체결가-기대가|를 유효 스프레드로 공시하며, 기관 TCA에서는 미체결 기회비용과 역선택 손실까지 포함합니다."},
    {"term": "PFOF", "full": "Payment for Order Flow", "cat": "주문/체결", "ch": "ch08", "desc": "리테일 증권사(Robinhood 등)가 개인 주문을 도매 마켓메이커(Citadel 등)에 넘겨주는 대가로 받는 현금 리베이트. 미국 주식 수수료 무료화의 원천입니다."},
    {"term": "SEC / CFTC", "full": "연방 증권거래위원회 / 상품선물거래위원회", "cat": "참여자", "ch": "ch04", "desc": "연방 독립 규제기관. SEC는 주식·채권·거래소를, CFTC는 CME 지수선물·원자재·스왑과 DCO를 감독합니다."},
    {"term": "SRO / FINRA", "full": "Self-Regulatory Organization / 금융산업규제당국", "cat": "참여자", "ch": "ch04", "desc": "FINRA는 3,400+ 브로커-딜러 및 장외(OTC/ATS)를 감시하는 비영리 자율규제기구, SRO는 자사 오더북을 감시하는 영리 상장거래소입니다."},
    {"term": "Lit vs Dark", "full": "Displayed vs Non-Displayed Market", "cat": "거래소", "ch": "ch05", "desc": "Lit은 호가창 가격·수량이 시장 전체에 밝게 공개된 정규거래소/ECN, Dark는 호가창을 가리고 비공개 매칭하는 다크풀을 뜻합니다."},
    {"term": "NBBO", "full": "National Best Bid and Offer", "cat": "시세/데이터", "ch": "ch05", "desc": "모든 공개 거래소의 최우선 호가 중 가장 높은 매수가(NBB)와 가장 낮은 매도가(NBO)를 조합한 전국 최우선 호가입니다."},
    {"term": "SIP", "full": "Securities Information Processor", "cat": "시세/데이터", "ch": "ch05", "desc": "모든 거래소 BBO를 모아 전국 통합 시세와 NBBO를 배포하는 인프라. Tape A/B는 SIAC(NYSE), Tape C는 Nasdaq이 운영합니다."},
    {"term": "MDI Rule", "full": "Market Data Infrastructure Rule", "cat": "시세/데이터", "ch": "ch05", "desc": "단일 SIP 독점과 지연을 줄이기 위해 경쟁 통합자(Competing Consolidator), 고가주 Round Lot 축소(40/10/1주), Depth 5단계 확대를 추진하는 개혁안입니다."},
    {"term": "Tied Quote / Consolidated Montage", "full": "동호가 처리 및 통합 호가 테이블", "cat": "시세/데이터", "ch": "ch05", "desc": "여러 거래소가 같은 1등 가격을 낼 때 단일 NBBO 요약은 시간 우선 1곳만 표기하지만, Quote Feed 전체를 받아 로컬에 조립한 Montage에서는 거래소별 잔량을 분리 인식합니다."},
    {"term": "Synthetic NBBO", "full": "Direct Feed 기반 자체 연산 NBBO", "cat": "시세/데이터", "ch": "ch10", "desc": "기관·HFT가 느린 SIP를 기다리지 않고 각 거래소 독자 직결 피드(ITCH, Pillar)를 직접 받아 FPGA로 나노초 단위에 자체 계산한 최우선 호가입니다."},
    {"term": "MIC", "full": "Market Identifier Code", "cat": "거래소", "ch": "ch05", "desc": "국제 표준 거래소 식별 4자리 코드 (XNYS=NYSE, ARCX=NYSE Arca, XNAS=Nasdaq, BATS=Cboe BZX, IEXG=IEX 등)."},
    {"term": "Mil (밀)", "full": "1/1000 Dollar ($0.001)", "cat": "수수료", "ch": "ch05", "desc": "미국 거래소 수수료 기본 단위. 1밀 = $0.001 (0.1센트). 법정 Take Fee 상한 30밀은 주당 $0.0030입니다."},
    {"term": "Maker-Taker", "full": "유동성 공급 보상형 가격 모델", "cat": "수수료", "ch": "ch05", "desc": "지정가 대기자(Maker)에게 리베이트를 주고, 시장가 체결자(Taker)에게 수수료(최대 3밀)를 받는 전통 Lit 거래소(Nasdaq, NYSE, BZX) 모델입니다."},
    {"term": "Inverted (Taker-Maker)", "full": "역방향 가격 모델", "cat": "수수료", "ch": "ch05", "desc": "Taker에게 리베이트를 주고 Maker에게 수수료를 받는 모델(Nasdaq BX, Cboe BYX, EDGA). 대기열(Queue)이 짧아 빠른 체결을 원하는 Maker가 찾습니다."},
    {"term": "Flat-Fee / Speed-Bump", "full": "고정 요율 및 물리 지연 거래소", "cat": "수수료", "ch": "ch05", "desc": "리베이트 없이 단일 수수료(예: IEX 0.9밀)를 받는 모델. IEX는 38마일(350μs) 광케이블 코일과 CQI로 HFT 시차 공격을 막습니다."},
    {"term": "Co-location & Ports", "full": "코로케이션 및 포트 접속료", "cat": "인프라", "ch": "ch05", "desc": "거래소 매칭엔진 옆 데이터센터(Mahwah, Carteret, Secaucus)에 서버 랙을 임대하고 10G/40G 광포트 및 FIX/OUCH/ITCH 세션당 월정액을 받는 핵심 비거래 수익입니다."},
    {"term": "ATS / ECN / Dark Pool", "full": "대체거래시스템 유형", "cat": "거래소", "ch": "ch06", "desc": "Section 15 브로커-딜러 기반 거래소. ECN은 Lit 연속매매, Dark Pool은 비공개 NBBO 중간가 매칭, Crossing Network는 주기적 블록 배치 매칭입니다."},
    {"term": "TRF", "full": "Trade Reporting Facility", "cat": "인프라", "ch": "ch06", "desc": "장외(OTC 도매상, 다크풀 ATS)에서 일어난 체결 내역을 10초 이내(실제 1~2ms)에 보고해 SIP에 Venue Code 'D'로 찍히게 하는 FINRA 보고 시설입니다."},
    {"term": "Blue Ocean ATS (BOATS)", "full": "야간 시간대 특화 ATS", "cat": "거래소", "ch": "ch06", "desc": "미국 동부 20:00~04:00(한국 주간) Overnight 세션을 단독 제공해 높은 고정 체결수수료($0.0015~$0.0025)를 받는 틈새 ATS입니다."},
    {"term": "IntelligentCross", "full": "지능형 지연 매칭 ATS", "cat": "거래소", "ch": "ch06", "desc": "AI 알고리즘으로 수 밀리초 단위 미세 랜덤 지연을 적용해 유동성 공급자의 역선택을 방지하는 독립 ATS입니다."},
    {"term": "DTCC / NSCC / FICC / DTC", "full": "미국 중앙 청산·결제·예탁 그룹", "cat": "청산결제", "ch": "ch07", "desc": "서류 위기 이후 설립된 지주회사 DTCC 산하에서 NSCC(주식 청산), FICC(국채·MBS 청산), DTC(예탁 및 DVP 최종 소유권 이전)가 작동합니다."},
    {"term": "Novation (채무인수)", "full": "Central Counter Party Novation", "cat": "청산결제", "ch": "ch07", "desc": "거래일(T일) 체결 대사 즉시 NSCC가 매도자·매수자 사이에 끼어들어 상대방 파산 시에도 결제를 100% 보증하는 법적 장치입니다."},
    {"term": "CNS", "full": "Continuous Net Settlement", "cat": "청산결제", "ch": "ch07", "desc": "전 시장 체결을 다자간 상계해 일일 거래량의 98%+를 없애고 약 2%만 실제 이동시키는 NSCC의 핵심 차감 시스템입니다."},
    {"term": "GCM / DCM / NCM", "full": "종합 / 직접 / 비청산 회원", "cat": "청산결제", "ch": "ch07", "desc": "타사 대행 청산까지 하는 GCM(Pershing, JPM), 자사 계정만 직접 청산하는 DCM(Robinhood, Vanguard), GCM을 거치는 NCM으로 구분됩니다."},
    {"term": "Broker / Dealer / 복합형", "full": "Agency vs Principal", "cat": "참여자", "ch": "ch07", "desc": "고객 주문 대행(Agency)은 Broker, 자기자본 매매(Principal)는 Dealer, 둘 다 하면 차이니즈 월이 필수인 복합형(GS, MS, JPM)입니다."},
    {"term": "Cream-Skimming", "full": "Clean Flow vs Toxic Flow 선별", "cat": "주문/체결", "ch": "ch08", "desc": "도매상이 소액 무정보성 개인 주문(Clean Flow)만 내부화로 흡수하고, 선물 급변과 맞물린 독성 주문(Toxic Flow)은 Lit 거래소로 뱉어내는 전략입니다."},
    {"term": "Internalization & 독성 오염", "full": "장외 자체 체결의 구조적 딜레마", "cat": "주문/체결", "ch": "ch08", "desc": "무정보 주문 80~90%가 도매상에 흡수되고 정보성 주문 10~20%만 정규거래소에 남아, 거래소 마켓메이커가 스프레드를 넓히고 호가를 얇게 까는 현상입니다."},
    {"term": "Parent / Child Order", "full": "모 주문 및 자 주문 분할", "cat": "알고리즘", "ch": "ch09", "desc": "기관의 대량 원주문을 시장 충격·정보 누출 없이 집행하기 위해 VWAP·TWAP·POV·IS 알고리즘으로 수백~수천 개로 쪼갠 단위입니다."},
    {"term": "Adverse Selection (역선택)", "full": "정보 비대칭 체결 손실", "cat": "주문/체결", "ch": "ch09", "desc": "내 지정가 호가가 더 빠르고 정보력이 강한 공격적 Taker에게 먹힌 직후 시장 가격이 불리하게 급변해 평가손이 발생하는 위험입니다."},
    {"term": "Waterfall Routing", "full": "Dark-First → Lit 다계층 집행", "cat": "알고리즘", "ch": "ch09", "desc": "자 주문을 흔적이 남는 정규 거래소에 바로 보내지 않고 다크풀 스윕을 먼저 훑은 뒤 잔량만 정규 거래소로 넘기는 순차 라우팅입니다."},
    {"term": "Iceberg / Ping Order", "full": "숨은 잔량 vs 탐침 호가", "cat": "알고리즘", "ch": "ch09", "desc": "Iceberg는 수량을 숨겨 노출을 막는 기관 호가이고, Ping Order(100주)는 다크풀 속 대형 기관 존재를 탐지하려는 HFT의 정찰 주문입니다."},
    {"term": "ISO", "full": "Intermarket Sweep Order (Rule 611 예외)", "cat": "알고리즘", "ch": "ch09", "desc": "발주자가 타 시장 NBBO를 소진시킬 주문을 동시 발송했음을 법적으로 선언하고, 수신 거래소가 자체 오더북을 즉시 긁도록(Sweep) 허용하는 주문 플래그입니다."},
    {"term": "Display ISO vs Sweep & Clear", "full": "ISO 파생 유형", "cat": "알고리즘", "ch": "ch09", "desc": "Sweep & Clear(ISO IOC)는 한도까지 긁고 잔량을 취소하며, Display ISO는 타 시장 소진 후 대상 거래소 최우선 큐에 호가를 즉시 게시합니다."},
    {"term": "Pacing (지연 동기화)", "full": "Latency Floor 조절", "cat": "알고리즘", "ch": "ch09", "desc": "데이터센터 간 거리 차이로 한 거래소가 먼저 체결돼 타 거래소 호가가 도망가는 Race Condition을 막기 위해 발주 시점을 마이크로초 단위로 맞추는 기법입니다."},
    {"term": "Tracking Error = 0", "full": "패시브 펀드 장마감 집중 이유", "cat": "주문/체결", "ch": "ch10", "desc": "지수 종가가 주상장 거래소 단일가 종가로 산출되므로, 패시브 ETF가 오차 없이 체결하기 위해 전체 거래량의 6.5~8.5%(만기일 20%+)가 16:00에 몰립니다."},
    {"term": "Mid-day Liquidity Slump", "full": "장중 공동화 (Crowding-out)", "cat": "주문/체결", "ch": "ch10", "desc": "주문들이 슬리피지를 피해 16:00 종가 옥션으로 대거 미뤄지면서 14:00~15:30 장중 연속매매 유동성이 마르는 현상입니다."},
    {"term": "Closing Imbalance Arbitrage", "full": "종가 불균형 차익거래", "cat": "주문/체결", "ch": "ch10", "desc": "15:50 이후 NOII에서 대규모 Buy Imbalance가 공시되면 장중 Lit 시장에서 미리 사고 종가 경매에 매도 LOC/IO로 팔아 스프레드를 먹는 전략입니다."},
    {"term": "Stale Quote Sniping", "full": "지체 호가 타격 (Latency Arbitrage)", "cat": "HFT", "ch": "ch10", "desc": "FPGA와 Direct Feed로 만든 Synthetic NBBO를 통해 시세가 이미 변했음에도 SIP 지연으로 남아있는 타 거래소 호가를 낚아채는 전략입니다."},
    {"term": "Post-Only / Pegged / Mass Cancel", "full": "HFT 특수 호가 제어 3종", "cat": "HFT", "ch": "ch10", "desc": "Post-Only는 무조건 Maker로만 안착시키고, Pegged는 NBBO/중간가를 1μs 단위로 추종하며, Mass Cancel은 위험 감지 시 98%+ 주문을 나노초 만에 취소합니다."},
    {"term": "CME-NJ Microwave", "full": "선물-현물 베이시스 차익 통신망", "cat": "HFT", "ch": "ch10", "desc": "시카고 CME(선물)와 뉴저지(현물) 사이 1,200km를 빛 속도의 99%인 마이크로웨이브 무선망(편도 4.0~4.1ms)으로 연결해 선행 신호를 선점합니다."},
    {"term": "SOR (Taker vs Maker)", "full": "Smart Order Routing", "cat": "알고리즘", "ch": "ch11", "desc": "Taker(IOC)는 Dark-First 후 Inverted→Flat→Maker-Taker 순으로 비용을 최소화하고, Maker(Post-Only)는 Routing Score(체결확률-역선택-비용)를 극대화합니다."},
    {"term": "MWCB", "full": "Market-Wide Circuit Breakers", "cat": "트레이딩 룰", "ch": "ch12", "desc": "S&P 500 전일 대비 -7%(1단계, 15분 정지, 15:25전), -13%(2단계, 15분 정지, 15:25전), -20%(3단계, 당일 종료) 시 전 시장 거래를 정지하는 서킷브레이커입니다."},
    {"term": "LULD", "full": "Limit-Up / Limit-Down", "cat": "트레이딩 룰", "ch": "ch12", "desc": "정규장 중 SIP가 산출한 직전 5분 VWAP 기준 가격 밴드 경계에 15초간 머물면 5분간 Trading Pause가 걸리고 상장거래소 단일가로 재개하는 장치입니다."},
    {"term": "MOO / LOO / MOC / LOC", "full": "Market/Limit on Open & Close", "cat": "트레이딩 룰", "ch": "ch13", "desc": "시가(Opening) 또는 종가(Closing) 단일가 경매에만 참여하는 시장가·지정가 전용 주문입니다."},
    {"term": "IO / OIO / CIO / CO", "full": "Imbalance Only / Closing Offset", "cat": "트레이딩 룰", "ch": "ch13", "desc": "균형가격(EP) 결정에는 참여하지 않고, EP 확정 후 발생한 매수·매도 불균형 잔량을 반대편에서 0이 될 때까지 흡수하는 조건부 지정가 주문(NYSE는 CO)입니다."},
    {"term": "NOII / OIB / CIB", "full": "Net Order Imbalance Information", "cat": "트레이딩 룰", "ch": "ch13", "desc": "경매 전(Opening 09:25/08:00, Closing 15:50) 매 1초마다 Paired Shares, Imbalance 수량·방향, Near/Far Price 등을 공표하는 실시간 불균형 피드입니다."},
    {"term": "Price Sliding (Late LOO/LOC)", "full": "나스닥 컷오프 이후 가격 강제 재조정", "cat": "트레이딩 룰", "ch": "ch13", "desc": "09:28 또는 15:55 이후 진입한 공격적 Late LOO/LOC가 시·종가를 흔들지 못하게 기준 상·하한선 안쪽으로 주문 가격을 강제 밀어 넣는 안전장치입니다."},
    {"term": "EP (Equilibrium Price)", "full": "균형가격 결정 4단계 규칙", "cat": "트레이딩 룰", "ch": "ch13", "desc": "① 최대 체결량 → ② 최소 불균형 → ③ 불균형 방향(매수우위 고가/매도우위 저가) → ④ Benchmark(전일종가 또는 직전체결가) 최단거리 순으로 결정됩니다."},
    {"term": "Cross/Halt Merger", "full": "장 마감 직전 LULD 병합 연장", "cat": "트레이딩 룰", "ch": "ch13", "desc": "15:50~16:00 사이 LULD 정지가 걸리면 장중 재개를 생략하고 종가 경매와 합쳐서 16:00 이후(5분 정지 만료·Collar 초과 시 추가 5분 연장) 마감하는 규칙입니다."},
    {"term": "DMM", "full": "Designated Market Maker (NYSE)", "cat": "트레이딩 룰", "ch": "ch14", "desc": "NYSE 종목별 전담 마켓메이커. Direct Open/Close 조건 미달 시 재량으로 시간을 지연시키며 DMM Interest를 투입해 시·종가를 결정합니다."},
    {"term": "D-Order (Discretionary Order)", "full": "NYSE Floor Broker 전용 재량 주문", "cat": "트레이딩 룰", "ch": "ch14", "desc": "표면 지정가(Floor)와 재량 한도(Cap)를 설정해 평소엔 불균형 상쇄 방향으로만 스텔스 작동하다가, 마감 5초/10초 전(09:29:55 / 15:59:50)에 확정 지정가로 공개 전환됩니다."},
    {"term": "Parity (1/N 배분)", "full": "NYSE 경매 동가격대 균등 배분", "cat": "트레이딩 룰", "ch": "ch14", "desc": "시간 우선 대신 Book 전체(1단위), 각 Floor Broker(각 1단위), Manual 시 DMM(1단위)에게 잔여 수량을 1/N로 반복 균등 배분하는 NYSE 고유 규칙입니다."},
]

QUIZ_DATA = {
    "ch01": [
        {
            "q": "`17 C.F.R. §242.611`은 실무에서 어떤 명칭으로 주로 불립니까?",
            "opts": ["Exchange Act Section 10(b)", "Regulation NMS Rule 611", "Securities Act Section 5"],
            "ans": 1,
            "exp": "17 C.F.R. Part 242의 600번대 규정이 Regulation NMS이므로 실무에서는 'Regulation NMS Rule six-eleven'이라 부릅니다."
        }
    ],
    "ch02": [
        {
            "q": "발행시장(IPO·공모 등록)을 규율하는 법률과 유통시장(거래소·불공정거래)을 규율하는 법률의 짝은?",
            "opts": ["발행: 1934년 법 / 유통: 1933년 법", "발행: 1933년 법 / 유통: 1934년 법", "발행: 1940년 법 / 유통: 1933년 법"],
            "ans": 1,
            "exp": "1933년 증권법('33 Act)은 발행시장, 1934년 증권거래소법('34 Act)은 유통시장과 거래소·불공정거래를 규율합니다."
        }
    ],
    "ch03": [
        {
            "q": "Reg NMS Rule 610 기준, $1 이상 주식에서 거래소가 Taker에게 부과할 수 있는 법정 수수료 상한선은?",
            "opts": ["주당 10밀 ($0.0010)", "주당 30밀 ($0.0030)", "주당 100밀 ($0.0100)"],
            "ans": 1,
            "exp": "Take-Fee Cap은 주당 30밀($0.0030, 즉 100주당 30센트)로 제한되어 있습니다."
        },
        {
            "q": "특정 ATS의 거래량이 ADTV 5%를 넘더라도 '호가 공시 의무(Order Display Rule)'가 면제되는 경우는?",
            "opts": ["ECN처럼 2인 이상에게 호가를 보여줄 때", "오더북을 누구에게도 보여주지 않고(Zero display) NBBO 중간가로만 매칭할 때", "SRO 라이선스를 취득했을 때"],
            "ans": 1,
            "exp": "순수 Dark Pool은 'Display to any person' 요건에 해당하지 않아 5%를 넘더라도 호가 공시 의무가 면제됩니다."
        }
    ],
    "ch04": [
        {
            "q": "미국에서 3,400개 이상의 브로커-딜러와 장외(OTC·ATS·Wholesaler) 시장을 직접 감시하는 민간 비영리 자율규제기구는?",
            "opts": ["CFTC", "FINRA", "DTCC"],
            "ans": 1,
            "exp": "Exchange Act Section 15A에 근거한 FINRA가 전 브로커-딜러 및 장외시장 감시, Rule 605/606/5310 집행을 맡습니다."
        }
    ],
    "ch05": [
        {
            "q": "Nasdaq BX, Cboe BYX 같은 인버티드(Inverted) 거래소에 트레이더가 수수료를 내면서까지 Maker 호가를 제출하는 핵심 이유는?",
            "opts": ["상장 수수료를 면제받기 위해", "대기열(Queue)이 짧고 Taker 유입이 빨라 체결 우선순위(Fill Priority)를 확보하기 위해", "LULD 정지를 회피하기 위해"],
            "ans": 1,
            "exp": "Inverted 거래소는 Maker 수수료 때문에 호가 대기열이 짧고, 리베이트를 노린 Taker 주문이 가장 먼저 라우팅되어 빠른 체결이 가능합니다."
        },
        {
            "q": "2024년 기준 ICE(NYSE) 및 Nasdaq의 주식거래소 사업부 수익에서 가장 큰 비중(60%+ 합산)을 차지하는 축은?",
            "opts": ["순수 주식 체결 수수료", "마켓 데이터·접속/코로케이션·상장 등 비거래 수익", "야간 거래 수수료"],
            "ans": 1,
            "exp": "표 2-4 기준 주식 순거래 체결은 30~36% 수준이며, 자체 마켓 데이터·접속료/코로케이션·상장 수수료가 합산 64~70%를 차지합니다."
        }
    ],
    "ch06": [
        {
            "q": "2024~2025년 누적 거래대금 기준, 정규거래소 밖(OTC Internalization + ATS) 체결 비중의 합계는 대략 어느 수준인가요?",
            "opts": ["약 10~15%", "약 25~30%", "약 46~52% (거의 절반 수준)"],
            "ans": 2,
            "exp": "표 2-8 기준 OTC Internalization 약 35~38% + ATS 약 11~14%로 전체 거래의 절반 가까이가 정규거래소 밖에서 체결됩니다."
        }
    ],
    "ch07": [
        {
            "q": "NSCC의 연속 다자간 차감(CNS)을 통해 일일 체결 건수 중 상쇄되는 비중과 실제 결제일에 이동하는 비중은?",
            "opts": ["50% 상쇄 / 50% 이동", "98% 이상 상쇄 / 약 2%만 이동", "10% 상쇄 / 90% 이동"],
            "ans": 1,
            "exp": "일일 체결 건수의 98% 이상이 CNS를 통해 상쇄되며, 실제 DTC 장부상 증권·현금 이동 규모는 약 2% 수준에 불과합니다."
        }
    ],
    "ch08": [
        {
            "q": "NBBO가 $50.00 x $50.04일 때 도매상이 개인 매수자에게 $50.025에 체결하고 $0.0015를 PFOF로 주었다면 도매상의 순마진은?",
            "opts": ["주당 $0.0035", "주당 $0.0150", "주당 $0.0250"],
            "ans": 0,
            "exp": "이론 중간가($50.020) 대비 $0.0050의 엣지를 확보한 뒤 브로커에 $0.0015를 PFOF로 떼어주므로 도매상 순마진은 $0.0035입니다."
        }
    ],
    "ch09": [
        {
            "q": "ISO(Intermarket Sweep Order)를 사용했으나 실제로 타 거래소의 최우선 보호호가를 소진시키지 못해 Trade-Through가 발생한 경우 법적 책임은 누구에게 있나요?",
            "opts": ["주문을 받은 거래소 매칭 엔진", "발주한 증권사(Broker-Dealer)에 100% 귀속", "SIP 운영기관"],
            "ans": 1,
            "exp": "ISO 사용 시 거래소는 검증 의무를 면제받는 대신, 타 거래소 호가 미소진으로 인한 Trade-Through 책임은 100% 발주 증권사에 귀속되며 FINRA가 CAT로 사후 검증합니다."
        }
    ],
    "ch10": [
        {
            "q": "시카고 CME(Aurora)의 선물 신호가 뉴저지 현물 거래소군까지 약 4.0~4.1ms 만에 도달할 수 있게 해주는 통신 수단은?",
            "opts": ["해저 광섬유 케이블", "대기 중을 가로지르는 초고속 마이크로웨이브 무선망", "공공 SIP 테이프"],
            "ans": 1,
            "exp": "광섬유(유리 속 빛)보다 빠른 빛 속도의 99%에 근접한 초고속 마이크로웨이브 안테나 타워 망을 통해 편도 ~4.0ms 만에 전송됩니다."
        }
    ],
    "ch11": [
        {
            "q": "타방 NBBO와 즉시 체결할 수 있는 Taker Order가 Dark Pool 이후 Lit 거래소를 Sweep할 때 SOR의 1순위 선택지는?",
            "opts": ["메이커-테이커 거래소 (Nasdaq/NYSE)", "플랫 피 거래소 (IEX)", "인버티드 거래소 (Nasdaq BX/Cboe BYX)"],
            "ans": 2,
            "exp": "Taker 입장에서는 리베이트를 수취할 수 있는 인버티드 거래소가 순체결 비용 면에서 가장 유리하므로 1순위입니다."
        }
    ],
    "ch12": [
        {
            "q": "미국 시장 전체 서킷브레이커(MWCB) Level 1(-7%) 및 Level 2(-13%)가 발동될 수 있는 시간 제한은?",
            "opts": ["시간 무관 종일 발동", "15:25 ET 이전에만 발동 (이후엔 Closing 직행)", "프리마켓에만 발동"],
            "ans": 1,
            "exp": "Level 1(-7%)과 Level 2(-13%)는 15:25 이전에만 발동되며 15분간 매매 정지 후 단일가 재개됩니다. Level 3(-20%)는 시간 불문 당일 종료입니다."
        }
    ],
    "ch13": [
        {
            "q": "나스닥 Closing Cross에서 모든 주문의 취소·정정이 잠기고(Lock-in) NOII 불균형 정보 송출이 시작되는 시각은?",
            "opts": ["15:50:00", "15:55:00", "15:58:00"],
            "ans": 0,
            "exp": "15:50:00에 전 주문 취소·정정이 잠기고 NOII가 초당 1회 송출됩니다. 15:55엔 MOC 차단 및 Late LOC Sliding, 15:58엔 LOC 차단 후 CIO만 허용됩니다."
        }
    ],
    "ch14": [
        {
            "q": "NYSE 종가 경매에서 Closing D-Order가 '조건부 스텔스' 상태에서 '확정 지정가(Firm Limit)'로 승격되어 OIB 피드에 공개(Unmasked)되는 시점은?",
            "opts": ["15:50:00", "15:58:00", "15:59:50"],
            "ans": 2,
            "exp": "15:59:50(2차 컷오프)에 D-Order 취소·정정·신규가 전면 차단되면서 재량 한도 가격의 확정 지정가 주문으로 승격되어 최종 OIB 피드에 투명 반영됩니다."
        }
    ],
}


def slugify_heading(text: str, idx: int) -> str:
    clean = re.sub(r"[^\w가-힣\s-]", "", text).strip().lower()
    clean = re.sub(r"\s+", "-", clean)
    return f"sec-{idx}-{clean[:32]}" if clean else f"sec-{idx}"


def preprocess_markdown(raw_md: str, chapter_id: str) -> tuple[str, list[str], str, str]:
    """
    원문 마크다운에서 제목, 핵심 질문, 원문 섹션 마크다운, 추가 설명자료 마크다운을 분리합니다.
    """
    lines = raw_md.splitlines()
    title = ""
    if lines and lines[0].startswith("# "):
        title = lines[0][2:].strip()
        lines = lines[1:]

    # 상단 메타 blockquote (> **원문 위치** ...) 추출
    meta_lines = []
    body_start = 0
    in_meta = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not in_meta and stripped == "":
            continue
        if stripped.startswith(">"):
            in_meta = True
            meta_lines.append(stripped.lstrip(">").strip())
            body_start = i + 1
        elif in_meta and stripped == "---":
            body_start = i + 1
            break
        elif in_meta:
            break
        else:
            body_start = i
            break

    questions = []
    for ml in meta_lines:
        m = re.match(r"^\d+\.\s+(.*)$", ml)
        if m:
            questions.append(m.group(1))

    rest_md = "\n".join(lines[body_start:]).strip()

    # '## 추가 설명자료' 기준으로 분리
    split_marker = "\n## 추가 설명자료"
    if split_marker in rest_md:
        core_md, supp_md = rest_md.split(split_marker, 1)
        supp_md = "## 추가 설명자료" + supp_md
    elif rest_md.startswith("## 추가 설명자료"):
        core_md = ""
        supp_md = rest_md
    else:
        core_md = rest_md
        supp_md = ""

    return title, questions, core_md.strip(), supp_md.strip()


def md_to_rich_html(md_text: str, chapter_id: str, diagram_counter: list[int]) -> str:
    if not md_text.strip():
        return ""

    # 1. $$ ... $$ 수식 블록을 플레이스홀더로 보호
    math_blocks: list[str] = []

    def replace_math(match: re.Match) -> str:
        expr = match.group(1).strip()
        # 가벼운 LaTeX 명령을 깔끔한 텍스트/HTML 표기로 정리
        expr = expr.replace(r"\text{", "").replace("}", "")
        expr = expr.replace(r"\times", "×").replace(r"\div", "÷")
        idx = len(math_blocks)
        math_blocks.append(f'<div class="math-formula"><code>{expr}</code></div>')
        return f"\n\n@@MATH_{idx}@@\n\n"

    processed = re.sub(r"\$\$(.*?)\$\$", replace_math, md_text, flags=re.DOTALL)

    # 2. ```mermaid ... ``` 블록을 커스텀 반응형 HTML 다이어그램으로 보호
    diagram_blocks: list[str] = []

    def replace_mermaid(match: re.Match) -> str:
        d_idx = diagram_counter[0]
        diagram_counter[0] += 1
        html_diag = DIAGRAM_HTML_MAP.get((chapter_id, d_idx))
        if not html_diag:
            code_raw = match.group(1).strip()
            html_diag = f'<pre class="diagram-fallback"><code>{code_raw}</code></pre>'
        idx = len(diagram_blocks)
        diagram_blocks.append(html_diag)
        return f"\n\n@@DIAG_{idx}@@\n\n"

    processed = re.sub(r"```mermaid\s*(.*?)```", replace_mermaid, processed, flags=re.DOTALL)

    # 3. Markdown -> HTML 변환
    html = markdown.markdown(
        processed,
        extensions=["tables", "fenced_code", "sane_lists"],
    )

    # 플레이스홀더 복원
    for i, diag in enumerate(diagram_blocks):
        html = html.replace(f"<p>@@DIAG_{i}@@</p>", diag).replace(f"@@DIAG_{i}@@", diag)
    for i, math_html in enumerate(math_blocks):
        html = html.replace(f"<p>@@MATH_{i}@@</p>", math_html).replace(f"@@MATH_{i}@@", math_html)

    # 4. BeautifulSoup 후처리 (콜아웃 카드, 테이블 반응형 래퍼, 헤딩 ID)
    soup = BeautifulSoup(html, "html.parser")

    for bq in soup.find_all("blockquote"):
        text_preview = bq.get_text(" ", strip=True)
        cls = "callout callout-note"
        if text_preview.startswith("💡") or "팁" in text_preview[:25]:
            cls = "callout callout-tip"
        elif text_preview.startswith("📌") or "보충 해설" in text_preview[:30]:
            cls = "callout callout-supplement"
        elif text_preview.startswith("📝") or "원문 노트" in text_preview[:25] or "문서 구성 안내" in text_preview[:25]:
            cls = "callout callout-note"
        bq["class"] = cls

    for tbl in soup.find_all("table"):
        wrapper = soup.new_tag("div", attrs={"class": "table-scroll"})
        tbl.wrap(wrapper)

    return str(soup)


def assign_heading_ids_and_extract_toc(html_core: str, html_supp: str) -> tuple[str, str, list[dict]]:
    toc: list[dict] = []
    idx = 0

    def process_fragment(fragment: str, section_type: str) -> str:
        nonlocal idx
        if not fragment:
            return ""
        soup = BeautifulSoup(fragment, "html.parser")
        for h in soup.find_all(["h2", "h3"]):
            idx += 1
            text = h.get_text(" ", strip=True)
            hid = slugify_heading(text, idx)
            h["id"] = hid
            toc.append({
                "id": hid,
                "level": 2 if h.name == "h2" else 3,
                "text": text,
                "section": section_type,
            })
        return str(soup)

    core_out = process_fragment(html_core, "core")
    supp_out = process_fragment(html_supp, "supp")
    return core_out, supp_out, toc


def build() -> None:
    WEBSITE_DIR.mkdir(parents=True, exist_ok=True)
    chapters_out = []

    for entry in CHAPTER_MANIFEST:
        md_path = CHAPTERS_DIR / entry["file"]
        raw_md = md_path.read_text(encoding="utf-8")
        parsed_title, questions, core_md, supp_md = preprocess_markdown(raw_md, entry["id"])

        diagram_counter = [0]
        core_html = md_to_rich_html(core_md, entry["id"], diagram_counter)
        supp_html = md_to_rich_html(supp_md, entry["id"], diagram_counter)
        core_html, supp_html, toc = assign_heading_ids_and_extract_toc(core_html, supp_html)

        plain_text = BeautifulSoup(core_html + " " + supp_html, "html.parser").get_text(" ", strip=True)
        plain_text = re.sub(r"\s+", " ", plain_text)

        chapters_out.append({
            "id": entry["id"],
            "num": entry["num"],
            "part": entry["part"],
            "partLabel": entry["partLabel"],
            "title": entry["title"],
            "shortTitle": entry["shortTitle"],
            "sourceRef": entry["sourceRef"],
            "readMin": entry["readMin"],
            "mdPath": f"chapters/{entry['file']}",
            "questions": questions,
            "coreHtml": core_html,
            "suppHtml": supp_html,
            "toc": toc,
            "searchText": plain_text,
            "quizzes": QUIZ_DATA.get(entry["id"], []),
        })

    payload = {
        "meta": {
            "sourcePdf": "[20261113]_미국_자본시장구조.pdf",
            "totalPages": 85,
            "totalChapters": 14,
        },
        "chapters": chapters_out,
        "glossary": GLOSSARY_DATA,
    }

    js_path = WEBSITE_DIR / "chapters-data.js"
    json_str = json.dumps(payload, ensure_ascii=False, indent=None)
    js_path.write_text(f"window.US_CAPITAL_MARKET_DATA = {json_str};\n", encoding="utf-8")
    print(f"Generated {js_path} ({len(chapters_out)} chapters, {len(GLOSSARY_DATA)} glossary terms, {len(json_str):,} bytes)")


if __name__ == "__main__":
    build()
