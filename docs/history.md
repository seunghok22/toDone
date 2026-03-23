# Changelog (작업 일지)

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
