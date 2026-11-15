# USCapital_YKT — 미국 자본시장 구조 학습 포털

원문 PDF `[20261113]_미국_자본시장구조.pdf`(총 91쪽)를 분석해 **14개 주제별 Markdown 챕터(Part I~IV) + 전체 가이드(`chapters/README.md`)**로 세분화하고, 용어 해설·쉬운 비유·숫자 계산 예시·KRX 비교 해설을 덧붙여 구축한 인터랙티브 학습 포털입니다.

## GitHub Pages 접속

* 배포 주소(예상): `https://keimania.github.io/USCapital_YKT/`
* 권장 Pages 설정: **Settings → Pages → Build and deployment → Deploy from a branch → `gh-pages` / `(root)`**
  *(참고: `main` / `(root)`로 설정하더라도 루트 `index.html`이 자동으로 `./website/index.html`로 연결됩니다.)*

## 디렉터리 구조

```text
USCapital_YKT/
├── [20261113]_미국_자본시장구조.pdf   # 원문 자료 (91p)
├── chapters/                         # 14개 세분화 챕터 + 전체 안내
│   ├── README.md
│   ├── part1-regulations/            # Ch 01 ~ 03 (법규·Reg NMS·Reg ATS)
│   ├── part2-participants/           # Ch 04 ~ 07 (SEC/FINRA·거래소·ATS·DTCC)
│   ├── part3-order-flow/             # Ch 08 ~ 11 (리테일·기관·패시브/HFT·SOR)
│   └── part4-trading-rules/          # Ch 12 ~ 14 (MWCB/LULD·Nasdaq·NYSE 경매)
├── website/                          # 정적 웹 앱 (오프라인 file:// 실행 지원)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── chapters-data.js
├── build_site.py                     # Markdown + 용어 + 퀴즈 -> chapters-data.js 빌더
└── index.html                        # 루트 접속 시 ./website/index.html 리다이렉트
```

## 로컬 실행 및 재빌드

* **바로 열기**: `website/index.html` 파일을 브라우저로 직접 열면 별도 서버 없이 오프라인으로도 모든 기능이 동작합니다.
* **데이터 재빌드**: `chapters/` 문서를 수정한 뒤 아래 명령으로 `website/chapters-data.js`를 갱신할 수 있습니다.

```bash
python build_site.py
```
