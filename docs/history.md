# Changelog (작업 일지)

## 2026-03-24 Phase 8: 반복 작업 전용 탭(Recurring View) 추가
### ✨ Added (추가된 기능)
- **반복 작업 관리 탭 (`RecurringView.tsx`)**: 하단 네비게이션 탭의 `Weekly`와 `All` 영역 사이에 `Recurring`(반복) 전용 탭을 신설하여, 일회성 작업과 반복성 작업을 시각적으로 완전 분리.
- **주기별 렌더링 및 완료 여부 동기화 로직**: 
  - `Daily`, `Weekly`, `Monthly` 그룹으로 나누어 반복 설정이 걸린 작업의 리스트를 한눈에 모아보게 함.
  - 해당 날짜(이번 주, 이번 달 등 현재 선택된 사이클)에 맞춰 해당 반복 작업이 '완료(done)' 처리되었는지, 아니면 아직 '할 일(todo)'인지 파악하여 상태 체크박스와 연동 표기하는 스마트 알고리즘 적용.
### ✨ commits (관련 커밋 리스트)
- feat: All과 Weekly 영역 사이에 Recurring(반복 작업) 통합 관리 탭 신설
## 2026-03-24 Phase 7: 작업 상세 모달 및 반복 작업(Recurring) 로직
### ✨ Added (추가된 기능)
- **통합 Task 모달 (`TaskDetailModal.tsx`)**: 작업을 새로 '생성(Create)'할 때와 기존 작업을 '수정(Edit)'할 때 모두 공통으로 사용할 수 있는 재사용 가능한 상세 모달 팝업 추가. 
- **DB 스키마 마이그레이션 (v4)**: 작업의 상세 메모를 적을 수 있도록 `tasks` 테이블에 `description` 텍스트 컬럼 추가.
- **반복(Recurring) 스케줄링 자동화 (`useTaskStore.ts`)**: 모달에서 `daily`, `weekly`, `monthly`로 반복 설정된 작업 카드가 체크박스나 드래그를 통해 '완료(Done)' 상태로 변경될 경우, 즉시 다음 주기로 날짜(`due_date`)가 더해진 **새로운 '작업 전(Todo)' 카드가 DB에 자동 복제 생성**되는 고급 스케줄링 비즈니스 로직 탑재.
### ✨ commits (관련 커밋 리스트)
- feat: 생성/수정 통합 Task 모달 및 반복 작업 생성 로직 구현
## 2026-03-24 Phase 6.6: UX 높이 및 트레이 레이아웃 보강
### ✨ Added (추가된 기능)
- **트레이 윈도우 스케일업 (`tauri.conf.json`)**: 데스크톱 최상단에 붙는 트레이 메뉴바 앱의 특성을 고려하여, 창 세로 높이를 600px에서 `750px`로 확장해 더 많은 정보가 한눈에 보이게 셋업.
- **하단 네비게이션 이동 (`MainLayout.tsx`)**: Daily, Weekly, All 메뉴를 뷰 전환할 수 있는 `TabsList` 네비게이션을 앱 화면의 최하단(`Bottom`) 영역으로 깔끔히 이동시켜 접근성 개선.
### 🐛 Fixed (해결된 문제 및 버그)
- **`All` 칸반 보드 렌더링 스크롤 누락 이슈 해결**: 칸반 리스트 내용이 늘어나도 화면 높이가 제한되어 데이터(카드 3장 중 1장만 보임 등)가 잘리던 문제를 타파. Flex 컨테이너(`h-full min-h-0`) 설정 및 컬럼 내부 렌더링(`overflow-y-auto`)을 세밀하게 분리해 각 열마다 독립적인 스크롤이 생성되도록 버그 픽스.
### ✨ commits (관련 커밋 리스트)
- fix: 트레이 앱 최적화 (높이 확장, 칸반 스크롤 버그 수정, 탭 네비게이션 하단 배치)

## 2026-03-24 Phase 6.5: 전역 캘린더 스트립(Daily View - TaskTray) 리팩토링
### ✨ Added (추가된 기능)
- **전역 날짜 관리(`useTaskStore.ts`)**: Zustand 스토어에 `selectedDate` 상태를 추가하여 앱 전반의 기준 날짜를 제어하도록 업그레이드.
- **`CalendarStrip` 가로 달력 레이아웃 도입**: Stitch MCP의 TaskTray 가이드라인을 수용하여, 메인 헤더와 탭 사이 공간에 날짜를 좌우 스크롤하며 고를 수 있는 미니 데이트픽커 바(Bar)를 전역적으로 부착.
- **날짜 동기화 및 동적 뷰 개편**: 
  - `Daily`, `Weekly`, `Monthly` 뷰가 단순히 '오늘' 기준이 아닌, 상단 스트립에서 **'클릭해 둔 날짜(`selectedDate`)'**를 바라보도록 의존성을 대폭 수정.
  - 이를 통해 캘린더 스트립에서 일자를 넘겨보면서 원하는 날의 할 일, 그 주, 그 달의 할 일 현황을 매끄럽게 탐색하는 UX 달성.
### ✨ commits (관련 커밋 리스트)
- feat: 전역 캘린더 스트립 부착 및 날짜 기반 탭 렌더링 리팩토링
### 🐛 Fixed (해결된 문제 및 버그)
- 각 하위 뷰에 불필요하거나 중복되던 날짜 호출 로직 및 안 쓰이는 `React` import 정리.
### 📝 Next Steps (다음에 진행할 추천 작업)
- Phase 7 진행: 각 할 일 항목(행)을 눌렀을 때의 상세 모달 컴포넌트 디자인.

## 2026-03-24 Phase 6: 캘린더(Monthly) 및 주간(Weekly) 뷰 구현
### ✨ Added (추가된 기능)
- `sqlite` DB: 반복 작업을 제어하기 위해 `recurrence` 컬럼(`none`, `daily`, `weekly`, `monthly`)을 새로 추가하는 **v3 마이그레이션 적용**.
- **Monthly(달력) 탭 도입**: `date-fns` 날짜 라이브러리를 통해 한 달 분량의 Grid 달력 UI를 렌더링하고, 각 칸에 마감일 기준 일정을 점/단어 텍스트로 노출(`MonthlyView.tsx`). 
  - (제약사항 준수) 달력이 반복 주기로 인해 꽉 차 보이는 것을 막고자 `recurrence !== 'none'`인 항목은 자동 배제 처리.
  - (제약사항 준수) 마감일(`due_date`)이 아예 없는 작업은 달력 하단에 `No Due Date` 스크롤 뷰로 별도 모음 표시.
- **Weekly(주간) 탭 도입**: 현재 주차 범위(`월요일 ~ 일요일`)를 계산하여, 이번 주 마감인 작업 혹은 `recurrence === 'weekly'`인 일정들만 수집(`WeeklyView.tsx`).
  - 수집된 일정들을 직관적인 UI를 제공하기 위해 '완료된 항목(Done)'과 '이번 주 남은 할 일(Pending This Week)' 구역으로 분할 렌더링.
### ✨ commits (관련 커밋 리스트)
- feat: Monthly 캘린더 뷰 및 Weekly 필터링 구현
### 🐛 Fixed (해결된 문제 및 버그)
- (없음)
### 📝 Next Steps (다음에 진행할 추천 작업)
- Phase 7 진행: 각 일정을 클릭했을 때 뜨는 상세 정보 모달(Modal) 창 구현 및 반복 주기(Recurring) 처리 백그라운드 스케줄링.
- 캘린더(Monthly) UI 렌더링 폴리싱 (마우스 오버나 툴팁을 통한 자세한 스케줄 정보 노출).

## 2026-03-24 Phase 5: 일간(Daily) 및 전체(All) 칸반 보드 고도화
### ✨ Added (추가된 기능)
- `sqlite` DB: 기존 `tasks` 테이블을 해치지 않고 `status` 컬럼(`todo`, `in-progress`, `done`)을 도입하는 **v2 마이그레이션 적용**.
- `@dnd-kit/core` 라이브러리 연동: **'All' 탭 전용 3단 칸반 보드(`KanbanBoard.tsx`)** 구축.
- **드래그 앤 드롭(DnD) 지원**: 할 일 카드를 집어서 다른 열로 옮기면 즉각 데이터베이스의 `status` 값이 변경되도록 `updateTaskStatus` 로직 바인딩.
- **'Daily' 탭 필터링 강화**: 저장된 전체 할 일 중 마감일(`due_date`)이 오늘 날짜인 것, 혹은 카테고리가 `daily`인 것만 노출되도록 필터링 시스템 구현.
- 할 일 추가 시 자동으로 오늘 날짜가 마감일로 주입되어 올바른 구역에 등록되는 동적 파이프라인.
### ✨ commits (관련 커밋 리스트)
- feat: 전체 뷰 칸반 보드 DnD 도입 및 일간 필터링 구현
### 🐛 Fixed (해결된 문제 및 버그)
- 기존 체크박스 클릭 논리(Toggle)를 덮어씌워 `todo`와 `done` 간의 status 값도 동기화되도록 데이터 일관성 패치.
### 📝 Next Steps (다음에 진행할 추천 작업)
- Phase 6 진행: 캘린더 모양 렌더링을 통한 Monthly 뷰, 그리고 Weekly 뷰 개발.
- 칸반 드래그 앤 드롭(DnD) 시 Sortable(순서 지정) 로직 및 애니메이션 고도화.

## 2026-03-24 Phase 4: 트레이 앱(메뉴바) 동작 및 OS 최적화
### ✨ Added (추가된 기능)
- `tauri.conf.json` 윈도우 설정 변경: 앱 창의 타이틀바와 테두리 제거(`decorations: false`), 배경 투명화(`transparent: true`), 시작 시 창 숨김(`visible: false`), 크기 조절 방지(`resizable: false`).
- `tauri-plugin-tray-icon` 기능 활성화 및 `lib.rs` 메뉴바 시스템 트레이 아이콘 부착.
- 트레이 아이콘 클릭 동작: 바탕화면에서 왼쪽 마우스 클릭 시 창이 나타나고(`show`), 메뉴바에서 한 번 더 클릭하면 부드럽게 창을 닫음(`hide`).
- 바탕화면 포커스 처리: 다른 앱이나 바탕화면을 누르면(`WindowEvent::Focused(false)`) 자동으로 앱 창이 숨겨지는 Blur 하이드(Hide) 이벤트 적용.
- Mac 하단 독(Dock)에 아이콘이 나타나지 않게 앱 활성 정책을 `Accessory` 모드로 변경 성공.
### ✨ commits (관련 커밋 리스트)
- feat: 메뉴바 트레이 앱 동작 및 Blur 숨김 처리 구현
### 🐛 Fixed (해결된 문제 및 버그)
- (없음)
### 📝 Next Steps (다음에 진행할 추천 작업)
- (최종 점검) 실제 사용성 개선을 위해 처음부터 특정 좌표에 창이 나타나도록 커스터마이징 로직 고려.
- React 측 Weekly/Monthly 탭 필터링 데이터 연동.

## 2026-03-24 Phase 3: 로컬 데이터베이스 연동 및 관리
### ✨ Added (추가된 기능)
- `tauri-plugin-sql`을 통해 `sqlite:todone.db` 데이터베이스 및 `tasks` 테이블 생성/마이그레이션 적용.
- `zustand` 라이브러리를 활용하여 `useTaskStore.ts` 전역 상태 스토어 생성 및 CRUD 액션(할 일 목록 가져오기, 추가, 토글, 삭제) 구현.
- `MainLayout.tsx` 컴포넌트 내부의 체크박스 및 입력창을 스토어 모듈에 바인딩하여 실제 애플리케이션 기능 활성화.
- (디버깅 지원) 로컬 DB 오류가 발생할 경우를 대비하여 화면 최상단에 직관적인 빨간색 오류 배너를 띄우도록 `error` 상태 추가.
### ✨ commits (관련 커밋 리스트)
- feat: SQLite DB 연동 및 Zustand 기반 CRUD 기능 구현
- fix: SQLite 실행 권한 보강, 폴백 UUID 및 UI 에러 배너 추가
### 🐛 Fixed (해결된 문제 및 버그)
- Tauri v2 보안 정책으로 인해 내부 SQL 동작(`execute`, `select`)이 막히던 문제를 `capabilities/default.json`에 권한(allow-execute, allow-select, allow-load)을 추가하여 해결.
- 일부 localhost 런타임 환경에서 `crypto.randomUUID()`가 작동하지 않는 문제를 대비하여 `Date.now()`와 난수 조합을 통한 고유 ID 생성 방식으로 안전하게 대체(Fallback).
### 📝 Next Steps (다음에 진행할 추천 작업)
- [기능 개선] Weekly, Monthly, All 탭 클릭 시 카테고리별로 필터링되어 보이도록 로직 고도화.
- Phase 4 진행: 트레이 앱(메뉴바) 동작, 프레임 제거 및 바탕화면 클릭 시 숨김(Blur 처리) OS 최적화 로직 적용.

## 2026-03-24 Phase 2: UI 뼈대 및 모듈 컴포넌트 구축
### ✨ Added (추가된 기능)
- `shadcn/ui` 초기화 및 Stitch "Crystalline Observer" (macOS 네이티브 테마) 전역 스타일 파일 적용 (프로스티드 글래스, 텍스트 드래그 방지, SF Pro 폰트 등).
- 기초 원칙(Atoms) 컴포넌트 개발: `Button`, `Checkbox`, `Input`, `Tabs`를 `src/atoms/`에 구현하고 디자인 토큰 반영.
- 800px 최대 폭 및 상단 탭 네비게이션을 갖춘 프레임리스 테마 메인 레이아웃(`MainLayout.tsx`) 구성.
### ✨ commits (관련 커밋 리스트)
- feat: 초기 UI 컴포넌트 및 메인 레이아웃 뼈대 구축
### 🐛 Fixed (해결된 문제 및 버그)
- (없음)
### 📝 Next Steps (다음에 진행할 추천 작업)
- Phase 3 진행: 로컬 데이터베이스 연동 (Tauri Plugin SQL) 및 기초 테이블 스키마 설정.
- 프론트엔드와 Rust 머신 간의 비동기 IPC 통신(invoke) 연동.

## 2026-03-23 프로젝트 초기 세팅
### ✨ Added (추가된 기능)
- Tauri + React(Vite) + Tailwind CSS 기반 백본 생성.
- `src/atoms`, `src/molecules`, `src/organisms`, `src/pages` 원자적 디자인 폴더 트리 추가.
- `.github/workflows/release.yml`에 자동 빌드/릴리즈 CI/CD(GitHub Actions) 설정 추가.
### ✨ commits (관련 커밋 리스트)
- chore: 프로젝트 초기 환경 및 CI/CD 세팅
### 🐛 Fixed (해결된 문제 및 버그)
- CI/CD 파이프라인(`release.yml`)이 `main` 브랜치 푸시 시마다 배포를 시도하지 않도록 트리거를 태그(`v*`) 및 수동 실행(`workflow_dispatch`)으로 제한.
### 📝 Next Steps (다음에 진행할 추천 작업)
- Phase 2 진행: 스티치(Stitch) MCP 연결 및 UI 디자인 컨텍스트 로드.
- 기초 컴포넌트(Atoms) 개발.
