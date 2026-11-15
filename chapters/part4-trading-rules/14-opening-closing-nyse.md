# Chapter 14. NYSE 사례: DMM 주도 하이브리드 옥션 (`Opening & Closing Auction`)

> **원문 위치**: 파트 IV. 주요 Trading Rule > 2. Opening Price / Closing Price > 2.3 NYSE 사례 (원문 p.73~85)  
> **이 챕터의 핵심 질문**:
> 1. 완전 전산 방식인 Nasdaq과 달리, **NYSE의 하이브리드 옥션(DMM 재량 + Floor Broker `D-Order`)**은 어떻게 작동하며 왜 종가가 16:00을 수십 초 넘겨 결정되곤 하는가?
> 2. 숨겨진 조건부 유동성인 **`D-Order(Discretionary Order)`**의 스텔스 작동과 마감 10초 전 상태 전이(`Unmasked`) 메커니즘은 무엇인가?
> 3. NYSE 특유의 체결 수량 배분 원칙인 **`Parity(1/N 균등 배분)`**는 시간 우선 원칙과 어떻게 다른가?

---

## 1. NYSE 하이브리드 옥션의 특징 및 세션 구성

NYSE는 Nasdaq과 달리 객장(`Floor`)의 지정 마켓메이커(**DMM**; Designated Market Maker)의 재량 및 `D-Order`가 결합된 **하이브리드 옥션(`Hybrid Auction`)** 방식으로 시가와 종가를 결정합니다.

> 📝 **원문 노트: NYSE vs Nasdaq의 시가 및 종가 결정 방식 비교**  
> - **NYSE (일상적 지연 가능)**: 객장 `DMM`의 재량이 결합된 하이브리드 시장이므로, 불균형이 너무 크거나 주문 쇄도로 호가 정리가 덜 끝나면 DMM 판단하에 `16:00:00`을 넘겨 **`16:00:15 ~ 16:01:00`경에 수동/반자동으로 종가 옥션을 지연 체결**시키는 일이 흔합니다.  
> - **Nasdaq (일상적 연장 없음)**: 100% 완전 전산 알고리즘(`Pure Electronic`)으로 `15:55`(MOC 잠금·LOC Price Slide), `15:58`(CIO만 허용)의 단계적 락다운으로 사전 왜곡을 통제하므로, 정상 상태에서는 불균형이 아무리 커도 연장 없이 `16:00:00` 정각에 일괄 체결하고 종료합니다 *(규제적 중단 발생 시만 연장)*.

### 표 2-3. NYSE Pre-Market, Regular Market, After-Market 구성

| 구분 | 세부 세션 | 시간 (`ET`) | 체결 방식 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **Early Trading Session** (`Pre-Market`) | — | `06:30 ~ 09:30` | 접속체결 | LULD / NBBO 등 미적용 |
| **Regular Market** | **Opening Auction** | `09:30` | DMM 주도 하이브리드 단일가 경매 | `06:30`부터 전용호가 접수 개시 / `08:00`부터 OIB 공표 개시 |
| | **Core Trading Session** | `09:30 ~ 16:00` | 접속체결 | 정규장 (`LULD / NBBO` 적용) |
| | **Closing Auction** | `16:00` | DMM 주도 하이브리드 단일가 경매 | `04:00`*(주)*부터 전용호가 접수 개시 / `15:50`부터 OIB(CIB) 공표 개시 |
| **Late Trading Session** (`After-Market`) | — | `16:00 ~ 20:00` | 접속체결 | LULD / NBBO 등 미적용 |

*(※ 표 2-3 내 Closing 전용호가 개시 시각 `04:00`은 원문 표기 기준이며, 아래 Closing 진행 절차 표에서는 NYSE Early 게이트웨이 오픈 시각 `06:30`부터를 세션 행으로 정리하고 있습니다.)*

---

## 2. NYSE Opening Price (`Opening Auction`)

### 2.1 진행 절차 (`Session` 구성)

| 시간 구분 | `MOO` (`Market-on-Open`) | `LOO` (`Limit-on-Open`) | `Opening D-Order` (`Floor Broker`) | `DMM Interest` (`DMM`) | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `06:30 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | **불허** | 사전 호가 접수 세션 (불균형 미공표) |
| `08:00:00 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | **불허** | **08:00 불균형 데이터 송출 개시** (초당 1회 갱신) |
| `08:30:00 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | **DMM Interest 입력 개시** |
| `09:29:00 ~` | **신규: 허용**<br/>정정·취소 금지 | **신규: 허용**<br/>정정·취소 금지 | **신규: 허용**<br/>정정·취소 금지 | 신규/정정/취소 **허용** | **1차 컷오프 (`Lock-in`)**<br/>· 전 주문 취소·정정 차단<br/>· 신규 입력은 여전히 허용 |
| `09:29:55 ~` | **신규·정정·취소 금지** | **신규·정정·취소 금지** | **신규·정정·취소 금지** | **신규: 허용** (불균형 해소만)<br/>정정·취소 금지 | **2차 컷오프 (`Imbalance Freeze`)**<br/>· 신규 오더 진입 전면 차단<br/>· 불균형 해소 DMM Interest 신규만 허용 |
| `09:30:00 ~` | 체결대기 | 체결대기 | | | **Direct Open 또는 Manual Open** |

### 2.2 NYSE 시가 경매 6단계 절차
1. **`06:30` 게이트웨이 오픈**: Opening Auction 전용 주문 접수 시작
2. **`08:00` 불균형 정보 송출 개시**: 매 1초마다 `OIB` (`Order Imbalance`) Information 피드 전송 시작
3. **`08:30` *(원문 표기 주의)* `DMM Interest` 입력 시작**: DMM 전용 API/Workstation 입력 개시  
   *(※ 편집 주석: 원문 p.81 본문 3항에는 `08:00`으로 표기되어 있으나, 바로 앞 p.80 세션 구성표에는 `08:30:00 ~`으로 명시되어 있으며, D-Order/DMM Interest 오픈 시각 맥락상 `08:30`을 기준 표기로 보되 원문 표기 차이를 함께 병기합니다.)*
4. **`09:29:00` 정정/취소 잠금 (`Lock-in`)**: MOO, LOO, Opening D-Order의 정정/취소 입력 제한
5. **`09:29:55` 신규 주문 컷오프 (`Freeze`)**: MOO, LOO, Opening D-Order 신규 입력도 제한; 불균형 해소 방향의 `DMM Interest` 신규만 허용
6. **`09:30:00` `Direct Open` vs. `Manual Open (Delayed Open)`**:
   - **Direct Open (자동 개장) 3가지 필수 요건**:
     1. 산출된 `Indicative Price`가 **`Opening Collar` 상/하한 내부 밴드**에 포함되고,
     2. `Imbalance`가 **Direct Opening 임계치 범위** 내에 있으며 *(절대 수량 및 체결수량 대비 Imbalance 비율 기준 판단)*,
     3. DMM에 의해 `Pre-Opening Indication`이 발령되지 않은 상태인 경우.
   - **Manual Open (수동/지연 개장)**: 위 요건을 하나라도 만족하지 못하면 진행. DMM은 Regular Market 접속호가장에 추가 유입되는 호가 변화 상황을 감안하고 직접 `DMM Interest`도 추가로 제출해 불균형을 해소한 뒤 `Auction Matching` 실시 여부를 최종 결정합니다.

### 2.3 Opening Auction 핵심 세부 규칙

> 📝 **원문 노트: Opening Auction 시 `Collar Reference Price` 산출 순서**  
> 1. **`09:30:00` 직전 Pre-Market의 `NBBO Midpoint`**: NYSE는 Pre-Market 호가장이 두텁지 않으므로 타 시장 포함한 NBBO를 참조합니다 *(Pre-Market엔 NBBO 의무가 없으나 SIP 또는 NYSE 직접 수신으로 산출)*.  
> 2. **NBBO가 비정상적으로 넓거나 한쪽 호가만 존재 시**: **직전 공식 종가 (`Consolidated Last Sale / Prior Close`)**  
> 3. **권리락/배당락 등 발생 종목**: **수정 공식 기준가 (`Adjusted Reference Price`)**

> 📝 **원문 노트: `Indicative Match Price` 결정 방식 (4단계)**  
> 전용 호가(`MOO`, `LOO`, `Opening/Closing D-Order`)와 접속체결 오더북 유효 잔량을 집계해 4단계 규칙을 순차 적용합니다. *(Nasdaq과의 차이점: 전용 호가에 `D-Order` 포함 + 4단계 Benchmark가 Collar Reference Price/NYSE Last Sale)*
> - **Step 1**: 최대 체결 가능 수량 (`Maximizes Matched Volume`)
> - **Step 2**: 불균형 최소화 (`Minimizes the Order Imbalance`)
> - **Step 3**: 불균형 방향에 따른 가격 선택 (`매수 우위 → 높은 가격`, `매도 우위 → 낮은 가격`)
> - **Step 4**: `Collar Reference Price`와 최단 거리 (`Balance = 0`인데 복수 가격일 때: **Opening**은 `Collar Reference Price`에 가까운 가격 / **Closing**은 NYSE 직전 정규장 체결가 `Last Sale Price`에 가까운 가격, 그래도 복수면 높은 가격)

> 📝 **원문 노트: `Delay Open` 시 Opening Auction 진행 방법**  
> 1. DMM이 **`Pre-Opening Indication`** 발령 *(Indication Range, Imbalance 방향·수량 포함)*.  
> 2. 추가 호가 유입:  
>    - **a) Regular Market 일반 호가 유입**: Pre-Market 미체결 호가와 동일하게 Opening Auction 참여 가능 *(타 Trading Venue는 09:30부터 이미 접속체결 및 NBBO 산출 중이므로 참여자들이 Indication을 보고 유리한 가격의 접속호가를 넣을 수 있음; 반면 `LOO/MOO`는 거부 처리)*.  
>    - **b) `DMM Interest` 추가 제출 가능**.

> 📝 **원문 노트: `DMM Interest` 처리 방식 (Opening)**  
> - **입력**: `08:30`부터 DMM 전용 API 또는 Workstation으로 `Side`, `Price`, `Size`를 단일 가격 또는 가격 단계별 매트릭스 형태로 입력.  
> - **처리**: **`Manual Open` 전환 전까지는 OIB 정보에 반영하지 않습니다.** Manual로 전환되면 예상 체결가나 불균형 방향과 무관하게 양방으로 제출·추가된 DMM Interest를 모두 반영해 OIB를 산출합니다 *(즉, Nasdaq IO처럼 불균형만 상쇄하는 것이 아니라 가격 결정에 직접 참여)*. DMM이 적정 가격이 나왔다고 판단하면 Opening Auction을 지시합니다.

> 💡 **원문 팁: `Imbalance Information` (`OIB / CIB`)**  
> `08:00:00 ET`부터(`15:50:00`부터는 `CIB`) 매 **1초 간격**으로 자체 오더 피드를 통해 배포:  
> - `Paired Shares`: 현 시점 매칭 가능 수량  
> - `Total Imbalance Shares & Side`: 미체결 총 초과 수량 및 방향 (`Buy`, `Sell`, `No Imbalance`)  
> - `Continuous Book Clearing Price`: 정규장+옥션 오더북 결합 잠정 체결가  
> - `Reference Price`: 불균형 계산 기준 앵커 가격

> 💡 **원문 팁: 체결 가격대 수량 우선 배분 (`Parity 1/N 배분`)**  
> NYSE는 Opening Auction에서 가격 우선은 적용하지만, **동일 체결 가격대에서는 시간 우선이 아니라 다음 `Parity(1/N)` 원칙**으로 배분합니다.  
> 1. **배분 대상(참여 단위) 분류**: ① `Book Participant` (전자 호가장 일반 지정가 전체를 **1개 단위**로 묶음), ② `Floor Broker` (`D-Quote`를 제출한 **Broker별로 각각 1개 단위**), ③ `DMM` (`DMM Interest` 전체를 **1개 단위** — *Manual Open인 경우에 한함*).  
> 2. **1/N 균등 배분**: 남은 체결 수량을 각 참여 단위(`N`개)에 `1/N`씩 배분합니다. *(예: D-Quote를 낸 Broker가 2개사 + Book 1개 + DMM 1개 = 총 4단위면 각각 `1/4`씩 배분)*  
> 3. **재분배 반복**: 배분 수량이 특정 참여자 주문량보다 커서 잉여가 남으면, 아직 미체결 잔량이 있는 나머지 참여자들에게 다시 `1/N` 재분배를 반복합니다.  
> *(※ 각 배분 단위 내부에서는 시간 우선순위 적용)*

### 2.4 Opening Auction 연장 케이스 (`Case 1 ~ 3`)
- **Case 1. DMM 재량 수동 개장 및 지연 (`Manual / Delayed Open`)**: 대형 실적 발표·합병·밤사이 거시 충격 등으로 대규모 한쪽 쏠림 불균형이 발생하면 `09:30:00`에 즉시 체결하지 않고 `09:31`, `09:35`, 심지어 `10:00`경까지 홀딩(`Delay`)하며 `Pre-Opening Indication`(예: `$95~$98`)을 공시해 반대 호가 유입을 유도합니다.
- **Case 2. 개장 전 `Regulatory Halt` 지속 (`Code T1` 등)**: 중대 공시 미종료 시 `09:30` 시가 경매 생략 후 장중 공시 완료 시 DMM 주도의 `Reopening Auction`으로 시가 산출.
- **Case 3. 시스템 장애 비상 대체 (`Rule 7.35C Contingency`)**: ① DMM 통신 두절 시 `Automated Open` 전환(DMM 배제 후 자체 알고리즘 단일가 강제 산출), ② 완전 전산 마비 시 자매 거래소(`NYSE Arca` 등) 위임(`Secondary Listing Relief`) 또는 정규 연속매매 첫 호가 대체.

---

## 3. Opening & Closing 공통 핵심: `D-Order` (`Discretionary Order`) 완전 정복

> 📝 **원문 노트: `Opening / Closing Auction`에서 `D-Order`의 스텔스 작동과 상태 전이**  
> **1. 입력 예시**: `기본 지정가 $99.50` / `재량 한도 $100.50` / `매수 100,000주`  
> 주문자(플로어 브로커)의 속마음: *"평소엔 $99.50에 싸게 사고 싶다. 하지만 경매 가격이 넘어가더라도 최대 $100.50까지는 추격할 의향(Discretion)이 있다. 단, 상대 매도 물량과 맞춰질 때만 호가를 활성화할 뿐, 미리 내 본심을 알려서 가격을 끌어올리고 싶진 않다."*  
> - **기본 지정가 (`$99.50`)**: 표면적 하한 기준선 (`Floor`)  
> - **재량 한도 (`$100.50`)**: 필요 시 지불 가능한 상한선 (`Cap`)  
> - **재량 범위 (`$99.50 < P <= $100.50`)**: 조건이 맞을 때만 작동하는 `'조건부 유동성 구간'`
>
> **2. `OIB` 산출 시 가격대별 시뮬레이션 메커니즘 (`08:00~09:29:55`, `15:50~15:59:50`)**  
> - **① `P > $100.50` (예: `$101.00`)**: 재량 한도 초과 → **0주** (체결 풀 및 OIB 완전 제외)  
> - **② `P <= $99.50` (예: `$99.00`)**: 기본 지정가 이하 → **100,000주 전량 무조건 참여** (일반 LOC와 동일) *(원문 표기 `P < $99.50` 포함 기본 지정가 기준)*  
> - **③ `$99.50 < P <= $100.50` (재량 범위 내부 — 핵심 동작)**: **불균형을 줄이는 방향(`Offsetting`)으로만 스텔스 작동**!  
>   - **상황 A (매도 물량이 넘칠 때 / `Sell Imbalance`)**: `$100.00`에서 매도 초과 `60,000주` 발생 시, 매칭 엔진은 이 매수 D-Order에서 딱 **`60,000주`만 동원**해 잠정 체결가를 `$100.00`으로 유지하고 불균형을 `0주`로 만듭니다.  
>   - **상황 B (매수 물량이 넘칠 때 / `Buy Imbalance`)**: 이미 `$100.00`에서 매수 초과가 난 상태에서 D-Order가 추가되면 가격이 `$100.50`을 뚫고 폭등하므로, 엔진은 **단 1주도 참여시키지 않습니다(`0주 취급`)**.
>
> **3. 결정적 상태 전이 (`State Transition`: `09:29:55~09:30:00`, `15:59:50~16:00:00`)**  
> 이전 구간에선 플로어 브로커가 수량/재량 범위를 취소·정정할 수 있었으나, 마감 5초(Opening) 또는 10초(Closing) 전부터는 시스템 내부에서 결정적 전환이 일어납니다.  
> - **① 호가의 고정 (`Lock-in`)**: 취소/정정 패킷 전면 Reject → 오더북 완전 잠금  
> - **② 확정 지정가화 (`Firm Limit Order` 승격)**: Auction 매칭을 위해 이 D-Order를 **"한도 가격 `$100.50`짜리 일반 고정 지정가 매수 100,000주(`Aggressive Limit Buy`)"**로 승격 병합  
> - **③ 최종 OIB 피드 반영 (`Unmasked`)**: 마지막 몇 초간의 OIB 피드에 숨겨져 있던 `100,000주` 잠재력이 확정 반영되어 시장에 투명 공표
>
> **4. 실제 단일가 체결 시 (`09:30:00`, `16:00:00`)**  
> - 최종 종가가 **`$100.20`**이면 한도(`$100.50`) 이하이므로 `$100.20`에 매수 체결 / **`$100.60`**이면 상한 초과로 미체결 즉시 자동 취소(`Killed`).

---

## 4. NYSE Close Price (`Closing Auction`)

### 4.1 진행 절차 (`Session` 구성)

| 시간 구분 | `MOC` | `LOC` | `CO` (`Closing Offset`) | `Closing D-Order` (`Floor Broker`) | `DMM Interest` (`DMM`) | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `06:30 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | **불허** | **불허** | 사전 호가 접수 세션 (불균형 미공표) |
| `08:30 ~` | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | Closing D-Order 및 DMM Interest 오픈 |
| `15:50:00 ~` | **신규·정정·취소 금지** | **신규·정정·취소 금지** | **신규: 허용**<br/>정정·취소 금지 | 신규/정정/취소 **허용** | 신규/정정/취소 **허용** | **1차 컷오프 (`Lock-in`)**<br/>· MOC/LOC 차단 · OIB 피드 송출 개시 |
| `15:58:00 ~` | **금지** | **금지** | **신규: 허용**(불균형 상쇄만)<br/>정정·취소 금지 | **신규: 허용**(불균형 상쇄만)<br/>**정정: 허용(가격개선만)**<br/>취소 금지 | **신규: 허용**(불균형 상쇄만)<br/>정정·취소 허용 *(수급 수렴 조율)* | **Regulatory Imbalance 공표**<br/>· 불균형 해소만 허용 · OIB 송출 |
| `15:59:50 ~` | **금지** | **금지** | **신규: 허용**(불균형 상쇄만)<br/>정정·취소 금지 | **신규·정정·취소 금지** | **신규: 허용**(불균형 상쇄만)<br/>정정·취소 허용 *(DMM 단독 최종 조율)* | **2차 컷오프 (`D-Order`)**<br/>· 불균형 해소 DMM Interest 신규만 허용 |
| `16:00:00 ~` | 체결 대기 | 체결 대기 | 잔여 불균형 흡수 체결 | `Parity` 배분 참여 체결 | DMM 최종 확인 및 단일가 승인 / 자체 자본 체결 | **Direct Close 또는 Manual Close** |

### 4.2 NYSE 종가 경매 6단계 절차
*(※ 편집 주석: 원문 p.82 본문 서두에 "NYSE의 시가 경매는..."으로 적혀 있으나, 바로 아래 단계 내용과 단원 전체는 **종가 경매(`Closing Auction`)**를 설명하는 부분입니다.)*

1. **`06:30` 게이트웨이 오픈**: Closing Auction 전용 주문 접수 시작 *(Opening과 함께 게이트웨이 오픈)*
2. **`08:30` `Closing D-Order` 및 `DMM Interest` 입력 시작**: 어떤 Auction용인지 식별하는 TAG 존재
3. **`15:50` 불균형 정보 송출 개시 및 `MOC/LOC` 컷오프**: 매 1초 OIB 전송, MOC/LOC 신규·정정·취소 제한, **CO 주문 활성화**
4. **`15:58:00` `Regulatory Imbalance` 확정**: `15:58:00` 기준 불균형 방향·수량을 확정 공표 → CO, Closing D-Order, DMM Interest는 **불균형 상쇄 방향만** 허용, CO/D-Order 정정·취소 금지 *(단, Closing D-Order 가격 개선 정정은 허용)*
5. **`15:59:50` D-Order 차단**: CO는 불균형 상쇄 방향 신규만 허용, Closing D-Order 전면 차단, DMM Interest만 유동성 조율 가능
6. **`16:00:00` `Direct Close` vs. `Manual Close (Delayed Close)`**:
   - **Direct Close (자동 마감) 4가지 요건**:
     1. `Indicative Price`가 `Closing Collar` 상/하한 내부 밴드 포함
     2. **`MOC 미체결 잔량 = 0`** *(Opening은 Imbalance 절대/비율 임계치 기준을 쓰지만 Closing은 당해 요건 대신 MOC 잔량 0 확인)*
     3. **`DMM Interest 수량 = 0`** *(DMM Interest가 있으면 DMM이 개입하겠다는 의사표시이므로 수량 확인)*
     4. DMM에 의해 `Manual Close Flag`가 설정되지 않은 상태
   - **Manual Close**: 위 중 하나라도 불만족 시 DMM이 추가 호가/상황을 보고 직접 DMM Interest를 추가해 불균형을 해소한 후 Auction Matching 실시 여부를 최종 결정합니다.

### 4.3 Closing Auction 핵심 세부 규칙

> 📝 **원문 노트: Closing Auction 시 `Collar Reference Price` 산출 (2단계)**  
> **1. 후보가격 결정**: ① `16:00:00` 직전 NYSE Regular Market `Last Sale Price` → ② 미존재 시 미국 전체 시장 `Consolidated Last Sale Price` → ③ 모두 미존재 시 `Previous Official Close`  
> **2. 후보가격 검증**:  
> - 후보가격이 `16:00:00` 직전 **Consolidated NBBO 범위 내**이면 후보가격을 최종 `Collar Reference Price`로 확정 *(NBBO 한쪽이라도 없으면 1에서 정한 후보가격 사용)*  
> - 범위 밖이면 `16:00:00` 직전 **Consolidated NBBO Midpoint**를 `Collar Reference Price`로 결정

> 📝 **원문 노트: Closing Auction 시 `CO` (`Closing Offset Order`) 처리 방식**  
> `CO`는 `15:50:00` 이후 활성화되어 불균형 반대 방향 잔량만 흡수하는 조건부 지정가 주문(**Nasdaq의 `IO`와 유사**)입니다. `15:58:00` 이후엔 정정·취소가 불가하고 불균형 반대 방향으로만 신규 제출 가능합니다.
> 1. `Indicative Match Price (=EP)` 산출에는 참여하지 않습니다.
> 2. `EP` 결정 후 불균형이 발생한 경우, 불균형 반대 방향이면서 `EP`보다 유리한 가격의 `CO`에 한해 가격-시간 우선순위로 불균형이 `0`이 될 때까지 체결에 참여합니다.
> 3. 체결 완료 후 잔량은 자동 취소됩니다.

> 📝 **원문 노트: Closing Auction 시 `DMM Interest` 처리 방식**  
> - `Manual Close` 전환 전까지는 `CIB (Closing Imbalance Information)`에 반영하지 않습니다.
> - `16:00:00` 시점에 **`DMM Interest` 수량이 0이 아니면 자동으로 `Manual Close`로 전환**됩니다.
> - `Manual Close` 결정 시 양방으로 제출·추가된 DMM Interest를 모두 반영해 CIB를 산출하고(가격결정에 직접 참여), DMM이 적정 가격 산출 판단 시 Closing Auction을 지시합니다.

### 4.4 Closing Auction 연장 케이스 (`Case 1 ~ 3`)
- **Case 1. `Manual Close` 전환에 따른 지연 마감 (가장 빈번한 정상 연장)**:  
  Opening Auction의 지연 오픈(`Pre-Opening Indication` 공표 후 외부 유동성 유입 대기)과 달리, Closing Auction의 `Manual Close`는 **`16:00:00`에 외부 주문이 모두 차단**됩니다! 연장된 수초~1~2분 동안 DMM은 **동결된 최종 Order Book**을 보고 **자신의 `DMM Interest` 가격·수량만 조정**해 불균형을 해소하고 Collar 안쪽 공정가격으로 정가를 맞춘 뒤 체결을 지시합니다.
- **Case 2. `15:50 ~ 16:00` `LULD Trading Pause` 발생 시 병합 연장**:  
  장 마감 10분 전 급변동으로 LULD 정지 시 별도 장중 Reopening을 생략하고 Closing Auction과 병합 연장합니다. `15:50`에 잠겼던 MOC/LOC/CO/D-Order의 입력·정정·취소 제한이 일부 해제되어 불균형 해소를 돕고, 5분 Pause 종료 시각이 `16:00`을 넘기면(예: `15:57` Pause → `16:02` 종료) 종료 시점까지 Closing을 연장합니다. 이때는 평상시 `10% Collar` 대신 **완화·확장된 `LULD Reopening Collar`**가 적용됩니다.
- **Case 3. 시스템 장애 비상 대체 (`Rule 7.35C Contingency`)**:  
  매칭 엔진, Imbalance Feed 장애 등 정상 마감 불가 시 별도 연장 시각까지 유예하거나, 복구 불가 시 `Contingency Closing` 절차로 공식 종가를 산출합니다.

---

## 추가 설명자료: 쉽게 이해하기

### 핵심 용어 사전

| 용어 | 쉬운 풀이 |
| :--- | :--- |
| **DMM** (`Designated Market Maker`) | 과거 스페셜리스트에서 진화한 NYSE 종목 전담 마켓메이커. 평소엔 전자 유동성을 공급하고, 시가·종가 수급이 극심하게 쏠릴 땐 인간적 판단(재량)으로 자기 자본을 투입해 균형 가격을 잡아주는 '시장의 소방수'. |
| **Floor Broker** | NYSE 객장에 물리적/전산적으로 소속되어 대형 기관(연기금·뮤추얼펀드)의 주문을 대리 집행하는 중개인. 이들만이 **`D-Order`**라는 특수 무기를 쓸 수 있습니다. |
| **D-Order** (`Discretionary Order`) | 표면 가격(Floor)과 진짜 속마음 한도(Cap)를 이중으로 적어두는 NYSE 전용 비밀 병기. 마감 `15:59:50`까지 본심을 감춘 채 불균형을 조용히 메우다가 마감 10초 전에야 정체를 드러냅니다. |
| **Parity 배분 (`1/N`)** | 일반적인 "먼저 온 사람 100% 체결(시간 우선)" 대신, 같은 가격에 모인 참가 그룹(전자 호가장 vs 플로어 브로커 A vs 플로어 브로커 B vs DMM)에 물량을 **공평하게 `1/N`씩 쪼개어 배분**하는 NYSE 고유의 규칙. |

### 쉬운 숫자 예시: `NYSE Parity (1/N)` 배분 계산해보기

종가(또는 시가)가 **`$100.00`**으로 결정되었는데, `$100.00` 매도 물량 총량이 **`1,200주`**뿐이고 같은 `$100.00` 가격에 사려는 매수 대기자(4개 참여 단위)가 총 `2,500주` 모여 있다고 가정합시다.
- 참여 단위 ① **Book Participant** (일반 전자 지정가 10명이 낸 합계): `1,000주`
- 참여 단위 ② **Floor Broker A** (D-Order): `200주`
- 참여 단위 ③ **Floor Broker B** (D-Order): `800주`
- 참여 단위 ④ **DMM** (DMM Interest): `500주`

일반 거래소(Nasdaq)라면 1등으로 주문 넣은 사람 한 명이 `1,200주`를 싹 다 가져가지만, **NYSE Parity 배분**은 다릅니다!
1. **1차 배분 (`1,200주 ÷ 4단위 = 각 300주`)**:
   - Book `300주` (잔여 700주)
   - Broker A `200주` (전량 체결 완료! **100주 잉여 발생!**)
   - Broker B `300주` (잔여 500주)
   - DMM `300주` (잔여 200주)
2. **2차 재분배 (남은 `100주 ÷ 미체결 3단위 = 약 33주씩`)**:
   - Book `+34주`, Broker B `+33주`, DMM `+33주` 추가 배정!
   - *(단, Book 내부에서는 가장 먼저 주문을 넣은 시간 우선순위로 334주가 배분됨)*

→ 이 때문에 대형 기관들은 전자 호가장(`Book`) 뒤에서 수십 명과 줄 서는 대신, **독자 1개 단위(`1/N` 몫)를 통째로 챙길 수 있는 Floor Broker의 `D-Order`**를 통해 종가 물량을 대량 확보하려는 것입니다!

### 최종 요약 비교: Nasdaq vs. NYSE 종가 경매 한눈에 보기

| 비교 항목 | **Nasdaq (`Closing Cross`)** | **NYSE (`Closing Auction`)** |
| :--- | :--- | :--- |
| **운영 주체** | **100% 전산 알고리즘** (`INET`) | **하이브리드** (전산 + 인간 `DMM` 재량) |
| **전용 비밀 주문** | 없음 (`MOC`, `LOC`, `CIO` 3종) | **`Closing D-Order`** (Floor Broker 전용) + `DMM Interest` |
| **1차 취소·정정 잠금** | `15:50:00` (전 종목 잠금) | `15:50:00` (`MOC/LOC/CO` 잠금, 단 D-Order·DMM은 허용) |
| **2차 컷오프** | `15:55:00` (`MOC` 금지, Late LOC Sliding) | `15:58:00` (불균형 확정, D-Order 가격개선 정정만) |
| **최종 컷오프** | `15:58:00` (`LOC` 금지, `CIO`만) | `15:59:50` (`D-Order` 잠금 & `Firm Limit` 공개 전환) |
| **16:00 지연 마감** | 정상 수급 불균형 시 **연장 없음** (정각 체결) | 불균형·DMM 개입 시 **`16:00:15~16:01` 지연 빈번** |
| **동일 가격대 배분** | 가격-시간 우선 (`Price-Time`) | **`Parity (1/N)` 배분** (Book / 각 Broker / DMM) |
