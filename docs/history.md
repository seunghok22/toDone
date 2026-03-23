# Changelog (작업 일지)

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
