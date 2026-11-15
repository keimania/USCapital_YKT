# Chapter 06. 대체거래소 (ATS)와 정규거래소 간 경쟁

> **원문 위치**: 파트 II. 시장참여자 > 2. 거래소 > 2.2 대체 거래소 (ATS) & 2.3 정규거래소 vs. ATS (원문 p.28~33)  
> **이 챕터의 핵심 질문**:
> 1. `ATS`(ECN · Dark Pool · Crossing Network)는 법적으로·기능적으로 정규 거래소와 무엇이 다른가?
> 2. 투자은행 계열 다크풀, 독립 블록 크로싱 네트워크, 마켓메이커 ATS, 야간 특화 ATS는 각각 어떻게 돈을 버는가?
> 3. 정규 거래소는 ATS에 맞서 어떻게 반격했으며, 현재 미국 주식시장 전체 점유율은 어떻게 나뉘어 있는가?

---

## 1. 대체거래소 (`ATS`; Alternative Trading System) 현황

`Exchange Act Rule 3b-16` 및 `Regulation ATS`에 따라 등록되는 거래 시스템입니다. 법적으로 거래소가 아닌 **브로커-딜러(Broker-Dealer)**로 등록되며 **FINRA**의 규제를 받습니다.

### 표 2-5. 정규 거래소 vs. 대체거래소 (ATS) 비교

| 비교 항목 | 정규 거래소 (`National Securities Exchanges`) | 대체거래소 (`ATS`) |
| :--- | :--- | :--- |
| **법적 등록 형태** | `Exchange Act Section 6` (국가 증권거래소) | `Exchange Act Section 15` (브로커-딜러) & `Regulation ATS` 준수 |
| **SRO(자율규제) 권한** | **보유함** (자체 상장 규정, 회원 징계권, 규칙 제정권 보유) | **없음** (FINRA 회원사로서 FINRA의 규제 감독을 받음) |
| **상장(`Listing`) 기능** | **가능** (IPO 주관, 공식 종가 형성) | **불가** (타 거래소 상장 주식의 유통/매칭만 가능) |
| **호가 공개 의무** (`Pre-trade Transparency`) | **원칙적 공개** (`Rule 611` / NBBO 표시, `Displayed Order Book` 운영) | **비공개 허용** (`Dark` 운영 가능, 단 시장 점유율 **5% 초과** 시 `Order Display Rule` 발동) |
| **체결 보고 의무** | 체결 즉시 SIP로 `Last Sale` 전송 | 체결 후 **10초 이내** FINRA `TRF`에 보고 → SIP 전송 |
| **운영 규정 공시** | `Form 19b-4` 제출 및 **SEC 사전 승인 필수** | `Form ATS-N` 제출을 통한 플랫폼 운영 규칙 공개 *(자유롭게 정할 수 있으나 사전 완전 공개 필요)* |

---

## 2. ATS의 3대 유형과 소유·운영 구조

ATS는 사전 투명성(`Lit vs. Dark`), 체결 시점(`연속 vs. 배치`), 가격 형성 메커니즘(`자체 발견 vs. 외부 참조`) 관점에서 **ECN**, **Dark Pool**, **Crossing Network** 3가지로 구분됩니다.

### 표 2-6. ATS 유형별 구조 및 대표 플랫폼

| 구분 | ECN (`Electronic Communication Network`) | Dark Pool | Crossing Network |
| :--- | :--- | :--- | :--- |
| **사전 투명성** | **Lit** (호가 공개) | **Dark** (호가 비공개) | **Dark** (호가 비공개) |
| **체결 시점** | Continuous (연속 매매) | Continuous (연속 매매) | Periodic Batch (주기적 일괄 매칭) |
| **가격 결정** | **Price Discovery**: 참가자 간 지정가 경합으로 자체 스프레드 형성 | **Derived Price**: 외부 정규 거래소의 실시간 NBBO 중간가(`Midpoint`) 추종 | **Benchmark Price**: 정규장 종가, 특정 시점 중간가, VWAP/TWAP |
| **주요 호가 제출자** | 일반 주문 | 기관의 알고리즘 분할 주문 (`Child Orders`) | 대형 펀드 간 거대 블록 (`Parent / Block Orders`) |
| **대표 플랫폼 (투자은행 주도형)** | - `BIDS Trading` (컨소시엄 모델) | **[대형 IB 계열 Dark Pool]**<br/>- `UBS ATS` *(구 CrossFinder 흡수)*<br/>- `MS Pool` (Morgan Stanley)<br/>- `JPM-X` (JPMorgan)<br/>- `Sigma X2` (Goldman Sachs)<br/>- `Citi Match`, `Barclays LX` | - `Citi Match`<br/>- `Barclays LX` |
| **대표 플랫폼 (독립 중개형)** | **[시간대/기능 특화형]**<br/>- `IntelligentCross`<br/>- `Level ATS`<br/>- `Blue Ocean ATS (BOATS)` | - `Liquidnet H2O`<br/>- `CrossStream`<br/>**[MM ATS]**<br/>- `Virtu MatchIt`, `Two Sigma`, `Jane Street` | **[독립 중개형 기관 Block Crossing]**<br/>- `Liquidnet Classic`<br/>- `ITG POSIT` (Virtu) |

### 표 2-7. 소유·이해상충 관점 비교: 투자은행 주도형 vs 독립 중개형

| 구분 | 투자은행 주도형 (`Bank Owned / Dealer-Led`) | 독립 중개형 (`Independent`) |
| :--- | :--- | :--- |
| **운영 주체** | 대형 IB (투자은행) | 독립 중개 전문 플랫폼 |
| **설립 목적** | 자사 고객 주문의 사내 상계(`Internalization`) 및 외부 수수료 절감 | 모든 시장 참가자를 잇는 중립적 체결 네트워크 제공 |
| **자기자본 거래** (`Principal Trading`) | **적극적 개입** (Market Making Desk, Proprietary Trading 장부 연계) | **엄격히 배제** (순수 `Agency` 중개만 수행) |
| **Order Flow 성격** | 폐쇄적/선별적 (자사 PB/기관 고객 위주, Tiering 적용) | 개방적/규칙 기반 (접속 요건을 충족한 모든 Broker/기관) |
| **핵심 수익원** | 거래소 수수료 절감액 보전 + 스프레드/Market Making 마진 | 순수 매칭 중개 수수료 |
| **주요 리스크/이슈** | **이해상충** (자사 데스크가 외부 고객 주문을 앞서 체결할 위험) | 유동성 확보의 지속성 |

---

## 3. ATS의 4대 수익 모델

### 3.1 대형 IB 계열 다크풀 (`Broker-Dealer Owned Dark Pools`)
골드만삭스, 모건스탠리, JP모건, UBS 등 글로벌 대형 투자은행이 자체 설립한 다크풀입니다.
1. **'비용 회피(`Cost Avoidance`)' 중심의 간접 수익**:
   - **거래소 Take Fee 절감**: 자사 리테일 시장가 주문과 기관 지정가 주문을 정규거래소로 보내면 주당 약 `$0.0030`(3밀)의 Take Fee를 내야 하지만, 자사 다크풀 내부에서 **상계 체결(`Internalization`)**시키면 수천~수만 달러의 수수료 지출을 즉시 절감해 IB의 마진을 보전합니다.
   - **주문 흐름 유출 방지**: 주문 정보를 거래소에 노출하지 않고 내부 매칭해 **정보 누출(`Information Leakage`)**을 차단하고 고객 충성도를 높입니다.
2. **외부 유동성 연결 커미션 (`Tiered Commission`)**: 타사 브로커(`Street SOR`)나 헤지펀드가 해당 다크풀의 비표시 유동성에 접근해 체결을 따낼 때, 체결 주당 **`$0.0010~$0.0015` (`1.0~1.5밀`)** 안팎의 고정 브로커리지 수수료를 부과합니다.

### 3.2 독립 중개형 기관 블록 크로싱 네트워크 (`Independent Crossing Networks`)
자기자본 매매를 하지 않는 순수 대행 브로커(`Pure Agency Broker`)가 운영하는 대형 기관 전용 ATS입니다.
1. **거래대금 비례(`Basis Point`) 중개 수수료**: 일반 거래소처럼 주당 단가(`$0.00xx/주`)가 아니라 체결 거래대금의 **bp(`1bp = 0.01%`)** 단위로 고율 수수료를 과금합니다. *(예: 10만 주 이상의 거대 블록을 NBBO 중간가에서 시장 충격 없이 한 번에 크로싱해 주고 체결 금액의 **1~3bp** 수취)*
2. **조건부 주문(`Conditional Orders`) / IOI 프리미엄**: 대형 자산운용사 포트폴리오 매니저 간에 매매 의사(`IOI`; Indication of Interest)를 타진하고 실제 체결로 잇는 프리미엄 매칭 알고리즘으로 높은 건당 마진을 확보합니다.

### 3.3 전자 마켓메이커 / HFT 주도형 ATS (`Market Maker ATS`)
`Citadel Securities`, `Virtu Financial`, `Two Sigma` 등 초단타 매매 펌 및 전자 마켓메이커가 운영하는 플랫폼입니다.
1. **스프레드 캡처(`Spread Capture`) 극대화**: 무지향성 리테일 주문(`Uninformed Retail Flow`)을 PFOF 등으로 대량 확보한 뒤, 자신들의 알고리즘 호가와 내부 ATS/OTC에서 맞부딪쳐 매수·매도 스프레드의 상당 부분을 마진으로 흡수합니다.
2. **세분화된 티어링(`Sub-penny & Tiered Matching`)**: 정규 거래소와 달리 비표시 주문에 센트 미만(`Sub-penny`)의 가격 개선을 자유롭게 제공합니다. 고객에겐 *"NBBO보다 주당 0.1센트 유리하게 체결해 주었다"*고 제공하면서 잔여 스프레드를 마켓메이커 수익으로 전환합니다.

### 3.4 시간대 및 기능 특화형 ATS (`Niche / Overnight ATS`)
정규 거래소가 다루지 못하는 틈새 시간대나 특수 알고리즘으로 독점적 수수료를 부과하는 신흥 모델입니다.
1. **야간 시간대 독점 체결 수수료 (`Blue Ocean ATS` 등)**:
   - 미국 동부 시간 기준 **`20:00 ~ 익일 04:00`**의 `'Overnight Session'` 단독 제공
   - 경쟁 Lit 거래소가 모두 닫혀 있으므로 한국·일본 등 아시아 리테일 증권사와 미국 브로커(Robinhood 등)로부터 주당 **`$0.0015~$0.0025`** 수준의 높은 고정 수수료 부과
   - 야간 유동성 접속용 전용 게이트웨이 접속료 및 야간 시세 피드 유료 라이선스 판매
2. **지능형 지연 매칭 수수료 (`IntelligentCross` 등)**:
   - AI 알고리즘으로 유동성 제공자가 역선택을 당하지 않는 최적 시점(수 밀리초 단위의 **미세 랜덤 지연**)에만 매칭 체결
   - 호가 안정성을 보장해 주는 대가로 양측(Maker·Taker 모두)에 안정적 체결 수수료 징수

---

## 4. 정규거래소 vs. ATS: 대응 전략과 시장 점유율

### 4.1 정규거래소의 ATS 대응 전략 추진 경과

> 📝 **원문 노트: 정규 거래소의 2단계 반격**  
> **1. ECN 인수 후 자사 세그먼트에 편입 (2000년대 중반)**  
> - `Reg NMS Rule 611`(Trade-through 방지) 시행으로 Floor에서 전자시스템화되어야만 `Automated Quote`로 인정받아 타 거래소 호가를 끌어올 수 있게 되자, 자체 개발 시간이 부족했던 전통 거래소들이 거액을 들여 대형 ECN을 인수해 전환했습니다.  
>   - **Nasdaq**: 2005년 **INET** 인수 후 기존 시스템을 버리고 전사 단일 표준 매칭 엔진 코어로 채택; **Boston Stock Exchange(`Nasdaq BX`)** 인수로 인버스 모델 구축  
>   - **NYSE**: 2006년 **Archipelago**를 역합병해 **NYSE Arca** 출범, Floor+전자 하이브리드 마켓 전환  
>   - **Cboe**: **BATS ECN(`Cboe BZX`)**, **Direct Edge ECN(`Cboe EDGX`)** 인수  
> - **포트폴리오식 유동성 락인**: 메인 거래소는 전통 `Maker-Taker` 모델로, 편입된 ECN 세그먼트(`BX`, `BYX`, `EDGA`)는 정반대 `Taker-Maker(인버스)` 모델로 분리 운영해 다양한 성향의 알고리즘·리테일 주문을 그룹 내부에서 모두 흡수했습니다.  
>
> **2. Dark Pool 내재화**  
> - 거래량이 투자은행 Dark Pool로 대거 이탈하자 거래소 매칭엔진 내부에 **비공개 중간가 세그먼트**를 직접 탑재해 방어선을 구축했습니다.  
>   - `NYSE`: **NYSE Arca Classic Dark**  
>   - `Nasdaq`: **Nasdaq Midpoint Ring**  
>   - `Cboe`: **Cboe EDGA Hidden Midpoint**

### 4.2 시장 점유율 현황 (`OTC 포함, 2024~2025년 누적 거래대금 기준`)

#### 표 2-8. 미국 주식시장 체결 플랫폼별 점유율 현황

| 구분 | OTC (`Internalization`) | ATS (약 40여 개) | 정규거래소: NYSE Group | 정규거래소: Nasdaq Group | 정규거래소: Cboe Group | 정규거래소: Independent Lit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **점유율** | **약 35~38%** | **약 11~14%** | **약 18~21%** | **약 16~18%** | **약 10~13%** | **약 5~7%** |

> 💡 **원문 팁: ATS 간 과점 현황**  
> 약 40여 개 ATS 중 **상위 5~6개 플랫폼이 전체 ATS 거래대금의 50% 이상을 과점**하고 있습니다.  
> *(주요 점유율: `UBS ATS` 약 13~15%, `IntelligentCross` 약 12~14%, `MS Pool / Trajectory Cross` 약 8~9%, `Sigma X2` 약 7~8%, `CrossFinder` 약 6~7%, `JPM-X` 약 5~6% 등)*  
> *(참고: 표 2-6에 기재된 대로 `CrossFinder`는 UBS에 흡수된 구 Credit Suisse 계열 플랫폼입니다.)*

---

## 추가 설명자료: 쉽게 이해하기

### 핵심 용어 사전

| 용어 | 쉬운 풀이 |
| :--- | :--- |
| **TRF** (`Trade Reporting Facility`) | 정규 거래소 밖(`OTC`나 `ATS`)에서 체결된 거래를 10초 안에 보고하도록 만든 FINRA·거래소 공동 보고 창구. 우리가 시세창에서 보는 거래소 밖 체결이 모두 여기를 거쳐 SIP에 찍힙니다. |
| **IOI** (`Indication of Interest`) | "나 A주식 10만 주 정도 사고 싶은데 상대 있소?"라고 정식 확정 호가 전에 블록 상대방을 탐색하는 매매 의사 타진 신호. |
| **bp** (`Basis Point`) | `1bp = 0.01%` (`0.0001`). 100억 원짜리 블록 거래에서 `2bp` 수수료는 `200만 원`입니다. |
| **Last Sale** | 방금 체결이 완료된 가격·수량 정보(실제 거래 내역). 호가(`Quote`)와 구분됩니다. |
| **Overnight Session** | 미국 정규장(09:30~16:00)과 프리·애프터를 제외한 밤 `20:00~04:00 ET` 시간대. 한국 시간으로 **낮(서머타임 기준 09:00~17:00)**에 해당해 한국 서학개미 주간거래가 바로 이 Blue Ocean ATS 등을 거칩니다. |

### 쉬운 비유: "수산시장 vs 호텔 룸 직거래 vs 도매 커튼 뒤"
1. **정규거래소 (`Lit`)**: 모든 사람에게 가격표가 환히 공개된 **대형 노량진 경매장**. 투명하지만 내가 10만 마리를 사려 한다는 게 들키면 가격이 뜁니다.
2. **Dark Pool (`ATS`)**: 커튼 뒤에서 호가창을 가린 채 *"지금 노량진 시세의 딱 중간 가격으로 거래하실 분?"* 하고 몰래 짝을 지어주는 **비밀 매칭룸**.
3. **OTC Internalization**: 손님이 오면 경매장에 보내지도 않고 가게 사장이 자기 냉장고 재고로 바로 팔아치우는 **장외 자체 체결** (무려 전체 시장의 **35~38%**!).

### 놀라운 통계 읽기: "정규거래소 밖 거래가 절반!"
표 2-8을 합산해 보면:
- **장외(Off-Exchange) = OTC(35~38%) + ATS(11~14%) ≈ `46 ~ 52%`**
- **정규거래소(Lit Exchanges) = NYSE + Nasdaq + Cboe + Independent ≈ `49 ~ 59%`** *(구간 합산 기준 약 절반)*  
한국(KRX 단일 중심에서 이제 막 넥스트레이드가 15% 제한 내 경쟁을 시작한 환경)과 비교하면, 미국 시장은 이미 **전체 거래의 절반 가까이가 정규거래소 밖(다크풀 및 도매상 내부화)에서 체결**된다는 점이 가장 큰 구조적 차이입니다.
