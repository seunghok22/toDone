# Changelog (작업 일지)

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
