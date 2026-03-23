## 개발 마일스톤

- **Phase 1: 초기 세팅 및 DevOps**
    - Tauri + React(Vite) + Tailwind CSS 프로젝트 생성.
    - GitHub Repository 연동 및 CI/CD(Mac/Win 빌드 및 Release) 파이프라인 구축.
- **Phase 2: UI 뼈대 및 컴포넌트 개발**
    - 스티치(Stitch) MCP를 연결하여 캘린더, 주간/일간 뷰, 모달 등의 UI 디자인 컨텍스트 로드.
    - Atomic 디자인 패턴에 따라 버튼, 입력창 등 기초 컴포넌트(Atoms)부터 구현.
- **Phase 3: 로컬 데이터베이스 연동**
    - Tauri Plugin SQL (SQLite) 설치 및 테이블 스키마(Tasks, Settings) 생성.
    - 프론트엔드와 Rust 간의 IPC(`invoke`) 통신 로직 및 CRUD 기능 구현.
- **Phase 4: 트레이 앱(메뉴바) 동작 및 OS 최적화**
    - 메인 윈도우 프레임 제거 및 상단 메뉴바 아이콘(Tray) 연결.
    - 클릭 시 창 팝업, 외부 클릭 시 창 숨김(Blur) 로직 구현.
    - 백그라운드 전환 시 메모리 점유율 최소화 로직 적용.