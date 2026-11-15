# Chapter 13. 미국 시가·종가 특징 및 Nasdaq 사례 (`Opening & Closing Cross`)

> **원문 위치**: 파트 IV. 주요 Trading Rule > 2. Opening Price / Closing Price (2.1 미국 시장의 특징 & 2.2 Nasdaq 사례) (원문 p.63~72)  
> **이 챕터의 핵심 질문**:
> 1. 한국(`KRX`)과 달리 미국 시장은 시가·종가 경매가 진행되는 순간에도 **어떻게 접속체결이 끊기지 않고 병렬로 돌아가는가?**
> 2. **Nasdaq**의 `Opening Cross`와 `Closing Cross`는 분·초 단위 컷오프(`09:28`, `09:29:30` / `15:50`, `15:55`, `15:58`)를 통해 어떻게 가격 조작(`Spoofing`)을 막는가?
> 3. **균형가격(`EP`) 결정 4단계**, **`Late LOO/LOC Price Sliding`**, **`IO/CIO`**, **`NOII`**는 실제로 어떤 숫자로 작동하는가?

---

## 1. 미국 시장 시가·종가(`Opening / Closing Price`)의 특징

시가(`Opening Price`) 및 종가(`Closing Price`) 결정을 위한 `Auction`은 **상장 거래소(`Primary Listing Exchange`)에서 독점 수행**됩니다. 이를 통해 상장 거래소는 막대한 유동성(`Passive & Benchmark Flow`) 흡수에 따른 수수료 수익을 보장받습니다. 미국 시장은 특히 `Closing Auction`의 거래량 비중이 매우 높습니다.

### 표 2-1. `Opening / Closing Auction`의 거래량 비중 (`2023년 ~ 2025년 평균`)

| 구분 | 미국 시장 전체(`Off-Exchange` 포함) 평균 | `Quad Witching Day` | 비고 |
| :--- | :--- | :--- | :--- |
| **Opening Auction** | 약 `1.0% ~ 2.0%` | 약 `3% ~ 5%` | 장중 델타 헤징 포지션 및 액티브 수급 위주 |
| **Closing Auction** | 약 `6.5% ~ 8.5%` | 약 `15% ~ 25% 이상` | 패시브 펀드 설정 / 환매 수요 |
| **합계** | **약 `8% ~ 10%` 수준** | **약 `20% ~ 30%` 육박** | S&P 500 및 Russell 지수 정기 변경일에는 Closing Auction 거래량만으로도 당일 전체 거래량의 `1/4`을 넘기도 함 |

### 한국(`KRX`) vs. 미국(`US`) 옥션 수행 방식의 결정적 차이
- **한국 시장**: 상장거래소(`KRX`)에서 **접속체결이 중단된 상태**로 단일가 호가 접수 및 체결 절차가 진행되며, 해당 시간 동안 ATS(넥스트레이드)에서도 거래가 중단됩니다.
- **미국 시장**:
  1. **시장관리상 중단(`MWCB`, `LULD Halt`, `Regulatory Halt`)에 의한 Auction**: 한국과 동일하게 **모든 Trading Venue에서 접속체결을 중단시킨 상태**에서 상장거래소가 독점 진행합니다.
  2. **정기 시가 및 종가 결정(`Opening / Closing Auction`)**: 당해 상장거래소를 포함한 다른 비상장 정규거래소 및 ATS 등 **모든 Trading Venue에서 접속체결이 중단 없이 진행되는 가운데**, Auction 전용 호가 접수 및 집계 절차가 **병렬적으로(In Parallel)** 진행됩니다.

> 📝 **원문 노트: 미국 시장에서 Auction 진행 방식의 주요 특징**  
> **1. Opening / Closing Auction**  
> - **a) 상장 거래소들**:  
>   - `09:30`까지 Pre-Market 접속체결이 중단 없이 진행됩니다. `09:30`에 Pre-Market 미체결 잔량 중 Regular Market에서도 유효한 호가와 `09:30`까지 별도 제출된 Opening 전용 호가를 모두 포함해 Opening Auction을 수행한 뒤, Regular Market 접속체결로 전환합니다.  
>   - `16:00`까지 Regular Market 접속체결이 중단 없이 진행됩니다. `16:00`에 Regular Market 미체결 잔량과 `16:00`까지 별도 제출된 Closing 전용 호가를 모두 포함해 Closing Auction을 수행한 뒤, After-Market 접속체결로 전환합니다.  
> - **b) 비(非)상장 거래소 및 ATS들**:  
>   - `09:30`에 중단 없이(상장거래소의 Opening Price 발표 여부와 상관없이) Pre-Market에서 Regular Market으로 전환해 접속체결을 지속하고,  
>   - `16:00`에도 중단 없이(상장거래소의 Closing Price 발표 여부와 상관없이) Regular Market에서 After-Market으로 전환해 접속체결을 지속합니다. *(상장거래소의 시·종가 결정 완료를 기다리지 않음)*  
>
> **2. `MWCB`, `LULD Halt`, `Regulatory Halt` 등에 의한 Auction**  
> - 상장거래소는 접속체결을 중단하고 독점적으로 Auction을 진행하며, 비(非)상장 거래소 및 ATS들은 해당 시간 동안 거래를 중단해야 합니다.

> 📌 **원문 미작성 항목 보충 해설: `[ Regular Market의 Opening 및 Closing 시점 NBBO의 집계 및 공표 ]`**  
> *(원문 p.64에는 해당 노트가 `// 작성 예정 //`으로 비어 있습니다. 아래는 미국 시장 규정에 기반한 보충 해설입니다.)*  
> - **개장 시점 (`09:30:00 ET`)**: Pre-Market(`~09:30:00`) 동안에는 `Reg NMS Rule 611`(Trade-through 금지)과 법정 LULD·공식 NBBO 보호 의무가 적용되지 않습니다. `09:30:00` 정각에 타 거래소(Arca, Cboe 등)와 ATS들이 즉시 Regular Market으로 넘어가 정규장 유효 호가를 표출하면 SIP가 이를 집계해 **공식 NBBO 산출·보호(`Rule 611`)를 개시**합니다. 만약 상장거래소(예: NYSE)가 `Manual Open`으로 `09:33`까지 개장이 지연되더라도, 다른 거래소들은 `09:30:00`부터 형성된 자체 NBBO로 정상 매매가 이루어집니다(단, 상장거래소에서 공식 개장 체결이 나와야 LULD 기준가 및 공식 시가가 확정됨).  
> - **마감 시점 (`16:00:00 ET`)**: `16:00:00` 정각이 되면 타 거래소와 ATS들은 상장거래소 Closing Auction 완료 여부(`16:00:00` 또는 NYSE의 `16:00:30` 등)를 기다리지 않고 곧바로 **After-Market(Extended Hours)**으로 전환되며, 정규장용 주문(DAY)이 취소되고 `Reg NMS Rule 611` NBBO 보호 및 LULD 적용이 즉시 종료됩니다.

---

## 2. Nasdaq 사례 (`Fully Electronic Single-Price Cross`)

`Nasdaq`은 NYSE와 달리 **100% 완전 전산화된 단일가 체결(`Fully Electronic Single-Price Cross`)** 방식으로 시가(`NOOP`) 및 종가(`NOCP`)를 결정합니다.

### 표 2-2. Nasdaq Pre-Market, Regular Market, After-Market 구성

| 구분 | 시간 (`ET`) | 체결 방식 | 비고 |
| :--- | :--- | :--- | :--- |
| **Pre-Market** | `04:00 ~ 09:30` | 접속체결 | LULD / NBBO 등 미적용 |
| **Regular Market** | `09:30` | **Opening Cross** | `04:00`부터 전용호가 접수 개시 / `09:25`부터 NOII 송출 개시 |
| | `09:30 ~ 16:00` | 접속체결 | 정규장 (`LULD / NBBO` 적용) |
| | `16:00` | **Closing Cross** | `04:00`부터 전용호가 접수 개시 / `15:50`부터 NOII 송출 개시 |
| **After-Market** | `16:00 ~ 20:00` | 접속체결 | LULD / NBBO 등 미적용 |

---

### 2.1 Nasdaq Opening Price (`Opening Cross`)

#### 진행 절차 (`Session` 구성)

| 시간 구분 | `MOO` (`Market-on-Open`) | `LOO` (`Limit-on-Open`) | `OIO` (`Opening Imbalance Only`) | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `04:00 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 사전 호가 접수 세션 (NOII 미공개) |
| `09:25:00 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | **NOII 송출 개시** (초당 1회 갱신) |
| `09:28:00 ~` | **신규·정정·취소 금지** | **신규: 조건부 허용** (`Late LOO 가격 슬라이딩`)<br/>정정·취소 금지 | **신규: 허용**<br/>정정·취소 금지 | **1차 컷오프 (`Lock-in`)**<br/>· 전 주문 취소·정정 차단<br/>· MOO 신규 차단<br/>· Late LOO 공격적 가격 강제 재조정 |
| `09:29:30 ~` | **신규·정정·취소 금지** | **신규·정정·취소 금지** | **신규: 조건부 허용** (불균형 상쇄 주문만)<br/>정정·취소 금지 | **2차 컷오프 (최종 락다운)**<br/>· LOO 신규 차단<br/>· 불균형 해소 OIO만 허용 |
| `09:30:00 정각` | **Opening Cross 단일가 일괄 체결 (`NOOP` 산출)** | | | 정규 연속매매 세션 개시 |

1. **취소·정정 차단 시점 (`09:28:00`)**: Closing이 10분 전(`15:50`)인 반면, Opening은 **개장 2분 전(`09:28:00`)**에 전 주문의 취소·정정이 잠깁니다(`Lock-in`).
2. **`Late LOO Price Sliding` (`09:28:00 ~ 09:29:29`)**: `09:28` 이후 진입하는 신규 LOO는 `09:28` 기준 Nasdaq Pre-Market BBO 등을 참조해 시가를 과도하게 흔드는 공격적 가격일 경우 강제 재조정(`Price Sliding`)됩니다.
3. **최종 30초 락다운 (`09:29:30 ~ 09:30:00`)**: LOO 진입도 차단되고, 공표된 불균형(`Imbalance`)을 줄이는 방향의 `OIO` 주문만 접수됩니다.

> 📝 **원문 노트: Opening Cross 시 `Late LOO`의 `Price Sliding` 처리**  
> **목적**: 매수(Buy)에는 상한, 매도(Sell)에는 하한 `Reference Price`를 두어 Late LOO로 Opening Price가 과도하게 변동하지 않도록 제한합니다.  
> **참조 가격**: ① `09:28:00` 시점 Nasdaq Pre-Market의 BBO, ② `Previous Official Close`  
> - **a) Buy Side (매수)**:  
>   - `Reference Price (상한) = Max [Best Offer, Previous Close]` *(없는 가격은 무시)*  
>   - Late LOO 가격이 상한보다 높으면 상한으로 재조정(`Sliding`), 상한 이하이면 원 가격 유지.  
> - **b) Sell Side (매도)**:  
>   - `Reference Price (하한) = Min [Best Bid, Previous Close]` *(없는 가격은 무시)*  
>   - Late LOO 가격이 하한보다 낮으면 하한으로 재조정(`Sliding`), 하한 이상이면 원 가격 유지.  
> - **예외**: 비정상 스프레드(BBO 스프레드가 임계치 초과) 또는 `Locked / Crossed` 상태일 때는 ① BBO를 무시하고 양방 모두 `Previous Close`로 Sliding, ② Previous Close마저 없으면 당일 첫 유입 체결가나 발행가 등을 참조합니다.

#### `EP` (`Equilibrium Price`) 결정 4단계 및 `IO` · `NOII` 메커니즘

> 📝 **원문 노트: Opening / Closing Cross에서 `EP` 결정 방식**  
> 전용 호가(`MOO/LOO` 또는 `MOC/LOC`)와 접속체결 오더북의 유효 호가 잔량을 집계한 뒤 아래 4가지 규칙을 순차 적용합니다.
> - **Step 1. 최대 체결 가능 수량** (`Maximizes Matched Volume`)
> - **Step 2. 불균형 최소화** (`Minimizes the Order Imbalance`)
> - **Step 3. 불균형 방향에 따른 가격 선택** *(Step 1, 2를 만족하는 후보 가격이 복수일 때)*  
>   - 매수 우위(`Buy Imbalance`): 후보 가격 중 **높은 가격**  
>   - 매도 우위(`Sell Imbalance`): 후보 가격 중 **낮은 가격**
> - **Step 4. Benchmark Reference Price 최단 거리** (`Closest to Benchmark`)  
>   - Opening Cross는 **`Previous Close`**, Closing Cross는 **`Last Sale Price`** *(NOII에서 `Current Reference Price`로 공표)*

> 📝 **원문 노트: `IO` (`Imbalance Order`)의 처리 방식**  
> 1. **EP 결정에는 참여하지 않습니다.**  
> 2. **EP 결정 후**, 불균형이 발생한 경우에 한해 **불균형 반대 방향이면서 EP보다 유리한 가격으로 제출된 IO**만 가격-시간 우선순위에 따라 불균형을 `0`으로 만들 수 있을 때까지 체결에 참여합니다.  
> 3. 체결 완료 후 남은 잔량은 **자동 취소**됩니다.  
> - **원문 예시**: `EP = $100.00`, **매도 우위(`Sell Imbalance`) `20,000주`**인 경우 → 매수 IO 중 지정가가 `$100.00` 이상(`Limit Price >= $100.00`)인 주문만 선별 → Limit Price·제출시간 순 정렬 후 `20,000주` 범위 내에서 체결 참여.

> 💡 **원문 팁: `NOII` (`Net Order Imbalance Information`) 6대 필드**  
> - **Paired Shares**: 현 시점 Order Book 상태에서 단일가로 즉시 체결 가능한 수량  
> - **Imbalance Shares**: Paired Shares 체결 후 타방 물량 부족으로 남는 초과 주식 수  
> - **Imbalance Side**: 불균형 방향 (`B` = 매수 우위, `S` = 매도 우위, `0` = 균형)  
> - **Near Price**: 전용 호가(`MOO/MOC`, `LOO/LOC`, `IO`) + **접속 Order Book 잔량** 모두 포함해 산출한 예상 체결가  
> - **Far Price**: **전용 호가(`MOO/MOC`, `LOO/LOC`, `IO`)만**으로 산출한 예상 체결가  
> - **Current Reference Price**: Late LOO/LOC Price Sliding 및 EP 산출 시 활용되는 기준 가격

#### Opening Cross 연장 케이스 (`Case 1 ~ 3`)
원칙적으로 Nasdaq Opening Cross는 불균형이 아무리 커도 `09:30:00` 정각에 즉시 일괄 체결됩니다(NYSE의 DMM 재량 지연 오픈과 대조). 단, 아래 3가지 특수 상황에서는 예외가 발생합니다.
- **Case 1. 개장 전 `Regulatory Halt` 상태 유지 (`Code T1`, `Code IPO1` 등)**: 중대 미공개 공시 대기나 신규 IPO 종목은 `09:30:00` Opening Cross를 보류하고, 사유 해소 후 별도의 **`Halt/IPO Cross`**를 통해 장중(`10:30`, `11:00` 등)에 첫 체결을 냅니다.
- **Case 2. 시스템 장애 및 긴급 지연 (`Rule 4752 Contingency`)**: `INET` 엔진 또는 게이트웨이 다운 시 운영위원회(`Market Operations`)가 `System Status Alert`를 띄우고 `09:35`, `09:40` 등으로 연기합니다. 복구 불가 시 Opening Cross를 공식 취소(`Bypassed`)하고 정규장 첫 체결(`First Regular Sale`) 또는 SIP 첫 체결가를 공식 시가(`NOOP`)로 대체 확정합니다.
- **Case 3. `LULD` 및 `MWCB`와의 관계**: 프리마켓(`04:00~09:30`)에는 LULD가 적용되지 않으므로 LULD로 09:30 크로스가 지연되는 일은 원천적으로 없습니다. 만약 `09:30:00` 개장 직후 S&P 500이 7% 폭락해 MWCB가 발동되면, 이미 체결된 `Opening Cross`는 유효 성립하고 `09:30:01` 이후 전 시장이 15분간 정지됩니다.

---

### 2.2 Nasdaq Closing Price (`Closing Cross`)

#### 진행 절차 (`Session` 구성)

| 시간 구분 | `MOC` (`Market-on-Close`) | `LOC` (`Limit-on-Close`) | `CIO` (`Closing Imbalance Only`) | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `04:00 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 사전 호가 접수 기간 (NOII 미공개) |
| `15:50:00 ~` | 신규 **허용**<br/>**정정·취소 금지** | 신규 **허용**<br/>**정정·취소 금지** | 신규 **허용**<br/>**정정·취소 금지** | **NOII 송출 개시** (초당 1회 갱신)<br/>· 전 주문 취소·정정 잠금(`Lock-in`) |
| `15:55:00 ~` | **신규·정정·취소 금지** | **신규: 조건부 허용** (`Late LOC 가격 슬라이딩`)<br/>정정·취소 금지 | 신규 **허용**<br/>정정·취소 금지 | **MOC 신규 컷오프**<br/>· Late LOC 공격적 가격 강제 재조정 |
| `15:58:00 ~` | **신규·정정·취소 금지** | **신규·정정·취소 금지** | **신규: 조건부 허용** (불균형 상쇄 주문만)<br/>정정·취소 금지 | **LOC 신규 최종 컷오프**<br/>· 불균형 해소 전용 CIO만 진입 가능 |
| `16:00:00` | **Closing Cross 일괄 체결 집행 (`NOCP` 산출)** | | | 정규장 종료 및 애프터마켓 전환 |

1. **취소 및 정정 잠금 시점 (`15:50:00`)**: 세 주문 유형 모두 취소(`Tag 35=F`)·정정(`Tag 35=G`) 전면 차단(`Reject`). *(유일한 예외: 명백한 전산 입력 착오 `Legitimate Error` 입증 시 Market Operations 직권 승인)*. 이유는 `15:50`부터 초당 1회 공표되는 NOII에 **허위 신호(`Spoofing/허수 호가`)**를 넣었다 빼는 행위를 막기 위함입니다.
2. **신규 주문의 3단계 컷오프**:
   - `15:55:00`: **MOC 신규 차단** (무제한 시장 충격을 주는 시장가 주문 유입 차단)
   - `15:55:00`: **Late LOC Price Sliding** 개시
   - `15:58:00`: **LOC 신규 전면 차단**, 마지막 2분(`15:58~16:00`)은 불균형을 반대편에서 줄이는 **`CIO`만 허용** (불균형 확대 방향은 Reject)

> 📝 **원문 노트: Closing Cross 시 `Late LOC`의 `Price Sliding` 처리**  
> **참조 가격**: ① `15:55:00` 시점 Nasdaq Regular Market 접속체결 호가장의 BBO, ② `15:55:00` 시점 Nasdaq Regular Market에서 체결된 `Last Sale Price` *(단, Nasdaq BBO 미존재 시 `15:55:00` 시점 NBBO 추가 활용)*  
> - **a) Buy Side (매수)**:  
>   - `Reference Price (상한) = Max [Best Offer, Last Sale Price]`  
>   - `Best Offer`가 없으면 `15:55:00` 시점 **NBBO Midpoint** 사용, NBBO도 한쪽이라도 없으면 `Last Sale Price` 선택.  
>   - Late LOC가 상한보다 높으면 상한으로 재조정(`Sliding`), 같거나 낮으면 원 가격 유지.  
> - **b) Sell Side (매도)**:  
>   - `Reference Price (하한) = Min [Best Bid, Last Sale Price]`  
>   - `Best Bid`가 없으면 `15:55:00` 시점 **NBBO Midpoint** 사용, NBBO도 유효하지 않으면 `Last Sale Price` 선택.  
>   - Late LOC가 하한보다 낮으면 하한으로 재조정(`Sliding`), 같거나 높으면 원 가격 유지.  
> - **예외**: **`Crossed`** 상태면 `Last Sale Price`로 Sliding *(없으면 Previous Official Close → 발행가 순)*. **`Locked` (`BB = BO`)**인 경우는 정상과 동일하게 BB, BO 모두 인정.

#### Closing Cross 연장 케이스 (`Case 1 ~ 3`)
*(※ 원문 p.72에 "실제 발생 가능한 4가지 핵심 케이스"로 도입되었으나 실제 본문에는 Case 1~3까지 3가지 케이스가 수록되어 있습니다.)*
정상적인 수급 불균형만으로는 `16:00:00`을 넘겨 연장하지 않습니다. 단, Opening Cross와 달리 Closing Cross에서는 **규제적 중단(LULD/MWCB)**이 발생할 수 있어 `16:00:00` 초과 연장이 빈번히 발생합니다.
- **Case 1. 장 마감 직전 `LULD` 매매정지 및 옥션 연장 (가장 흔함)**:  
  `15:50 ~ 16:00` 사이 LULD Pause(기본 5분) 발생 시(예: `15:56` 발동 → `16:01` 만료), 정규 Closing Cross와 LULD Reopening Auction을 하나로 **통합 단일가 처리(`Cross/Halt Merger`)**합니다. `16:01` 시점에 불균형이 `Auction Collar`를 벗어나면 **5분 단위로 계속 연장(`16:06`, `16:11`...)**합니다.
- **Case 2. `MWCB Level 1/2` 발동이 `15:25` 직전에 발생한 경우**:  
  MWCB Level 1(-7%)·Level 2(-13%)는 `15:25` 이전에만 발동합니다. 만약 `15:24:00`에 발동되면 15분 정지 후 **`15:39:00`에 재개 옥션**이 열리는데, 재개 옥션이 5분 연장을 거듭하면 불과 11분 뒤인 `15:50` 컷오프와 Closing 절차가 연쇄적으로 밀리거나 긴급 조정될 수 있습니다.
- **Case 3. 나스닥 시스템 장애 및 SIP 통신 두절 (`Rule 4754 Contingency`)**:  
  운영위원회가 수 분간 지연(`Delay/Hold`)시킨 뒤 지정 시각(`16:15~16:30` 등)까지 복구가 불가하면 크로스를 취소하고 ① `16:00` 직전 나스닥 Last Sale Price, ② 마감 시점 Consolidated Tape 최근 체결가, ③ 완전 다운 시 백업 거래소(**`NYSE Arca`** 등)에 종가 산출을 공식 위임합니다.

---

## 추가 설명자료: 쉽게 이해하기

### 핵심 용어 사전

| 용어 | 쉬운 풀이 |
| :--- | :--- |
| **NOOP / NOCP** | `Nasdaq Official Opening Price` / `Nasdaq Official Closing Price`. 나스닥이 단일가 경매로 확정한 그날의 공식 시가/종가. |
| **Spoofing (스푸핑)** | 체결할 생각도 없이 거대한 허수 매수 주문을 넣어 다른 사람들을 속여 가격을 움직인 뒤 잽싸게 취소하는 불법 시세조종. `09:28` / `15:50` 취소 잠금이 바로 이걸 막습니다. |
| **Near Price vs Far Price** | `Far Price`는 오직 경매 전용 주문(`MOC/LOC`)끼리만 계산한 예상가이고, `Near Price`는 정규장 호가창 물량까지 합쳐서 계산한 **실제에 더 가까운 예상 체결가**입니다. |

### 쉬운 손계산 예시 1: `EP(균형가격) 결정 4단계` 직접 구해보기

장 마감 직전 특정 종목의 `Last Sale Price(직전 정규장가)`가 **`$100.00`**이고, 누적 매수/매도 주문(유효 잔량 포함)이 다음과 같다고 합시다.

| 후보 가격 | 누적 매수 가능 수량 | 누적 매도 가능 수량 | **Step 1: 체결 가능 수량** | **Step 2: 남은 불균형** | 불균형 방향 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `$100.20` | `5,000주` | `9,000주` | `5,000주` | `4,000주` | 매도 우위 |
| **`$100.10`** | **`7,000주`** | **`7,500주`** | **`7,000주` (최대!)** | **`500주`** | 매도 우위 |
| **`$100.00`** | **`8,000주`** | **`7,000주`** | **`7,000주` (최대!)** | `1,000주` | 매수 우위 |
| `$99.90` | `9,000주` | `4,000주` | `4,000주` | `5,000주` | 매수 우위 |

1. **Step 1 (최대 체결량)**: `$100.10`과 `$100.00`이 둘 다 `7,000주`로 공동 1등!
2. **Step 2 (불균형 최소화)**: `$100.10`은 불균형이 **`500주`**뿐이고 `$100.00`은 `1,000주`입니다. 따라서 **`$100.10`이 최종 EP로 확정!**
*(만약 `$100.10`과 `$100.00` 둘 다 불균형이 `500주` 매도 우위로 같았다면? **Step 3**에 따라 매도 우위 시 더 낮은 가격인 `$100.00`이 선택되고, 매수·매도 방향마저 0으로 동률이었다면 **Step 4**에 따라 `Last Sale Price ($100.00)`에 가장 가까운 가격이 선택됩니다!)*

### 쉬운 손계산 예시 2: `Late LOC Price Sliding`
- 시각: `15:56:00` (15:55 이후이므로 `Late LOC Price Sliding` 구간!)
- 15:55 시점 Nasdaq BBO: `Bid $99.90 x Offer $100.10`, `Last Sale Price = $100.05`
- 이때 한 트레이더가 뒤늦게 **매수 LOC `$100.50`**을 냈다면?
  - 매수 상한 `Reference Price = Max[Best Offer($100.10), Last Sale($100.05)]` = **`$100.10`**!
  - 제출가 `$100.50 > $100.10`이므로, 나스닥 엔진은 이 주문 가격을 **`$100.10`으로 강제 하향 재조정(Sliding)**해 접수합니다. 마감 5분 전에 터무니없이 높은 가격을 던져 종가를 튀게 만드는 장난을 원천 차단합니다!
