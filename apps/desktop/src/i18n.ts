import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App header
      'app.name': 'toDone',
      'app.settings': 'Settings',

      // Tabs
      'tab.daily': 'Daily',
      'tab.weekly': 'Weekly',
      'tab.recurring': 'Recurring',
      'tab.all': 'All',

      // Daily tab
      'daily.empty': 'No tasks for today. Add one below!',
      'daily.addTask': 'Add New Task',

      // Weekly tab
      'weekly.pending': 'Pending This Week',
      'weekly.completed': 'Completed',
      'weekly.emptyPending': 'No pending tasks this week.',
      'weekly.emptyCompleted': 'No completed tasks yet.',

      // Recurring tab
      'recurring.empty': 'No recurring tasks found.',

      // Calendar
      'calendar.days': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

      // Settings Modal
      'settings.title': 'Settings',
      'settings.done': 'Done',
      'settings.allTabPeriod.label': "'All' Tab Period",
      'settings.allTabPeriod.desc': 'Select the time frame for tasks shown in the Kanban board. This also determines how far back overdue in-progress tasks will carry over into the Daily & Weekly tabs.',
      'settings.allTabPeriod.all': 'All Time (Show Everything)',
      'settings.allTabPeriod.day': 'Daily (Based on Selected Date)',
      'settings.allTabPeriod.week': 'Weekly (Week of Selected Date)',
      'settings.allTabPeriod.month': 'Monthly (Month of Selected Date)',
      'settings.allTabPeriod.year': 'Yearly (Year of Selected Date)',
      'settings.app.label': 'App',
      'settings.app.desc': 'Completely quit the toDone application and remove it from the menu bar.',
      'settings.quit': 'Quit toDone',
      'settings.language.label': 'Language',
      'settings.language.desc': 'Choose the display language for the app.',
      'settings.version': 'Version',
      'settings.update.available': 'Update to v{{version}}',
      'settings.update.latest': 'Up to date',

      // Update Modal
      'update.title': 'Update Available',
      'update.available': 'v{{version}} is ready to install.',
      'update.description': 'A new version of toDone is available. Install now for the latest improvements and fixes.',
      'update.later': 'Later',
      'update.install': 'Install & Restart',
      'update.installing': 'Installing...',

      // Task Detail Modal
      'modal.title.create': 'New Task',
      'modal.title.edit': 'Edit Task',
      'modal.field.title': 'Title',
      'modal.field.description': 'Description',
      'modal.field.dueDate': 'Due Date',
      'modal.field.recurrence': 'Recurrence',
      'modal.field.status': 'Status',
      'modal.recurrence.none': 'None',
      'modal.recurrence.daily': 'Daily',
      'modal.recurrence.weekly': 'Weekly',
      'modal.recurrence.monthly': 'Monthly',
      'modal.status.todo': 'To Do',
      'modal.status.inProgress': 'In Progress',
      'modal.status.done': 'Done',
      'modal.save': 'Save',
      'modal.delete': 'Delete',
      'modal.cancel': 'Cancel',
    }
  },
  ko: {
    translation: {
      // App header
      'app.name': 'toDone',
      'app.settings': 'Settings',

      // Tabs
      'tab.daily': 'Daily',
      'tab.weekly': 'Weekly',
      'tab.recurring': 'Recurring',
      'tab.all': 'All',

      // Daily tab
      'daily.empty': '오늘은 할 일이 없어요. 아래에서 추가해보세요!',
      'daily.addTask': '새 할 일 추가',

      // Weekly tab
      'weekly.pending': '이번 주 남은 할 일',
      'weekly.completed': '완료',
      'weekly.emptyPending': '이번 주 남은 할 일이 없어요.',
      'weekly.emptyCompleted': '아직 완료된 할 일이 없어요.',

      // Recurring tab
      'recurring.empty': '반복 작업이 없어요.',

      // Calendar
      'calendar.days': ['일', '월', '화', '수', '목', '금', '토'],

      // Settings Modal
      'settings.title': 'Settings',
      'settings.done': '완료',
      'settings.allTabPeriod.label': "'All' Tab 표시 기간",
      'settings.allTabPeriod.desc': 'Kanban 보드에 표시할 기간을 설정해요. Daily & Weekly 탭에서 진행 중인 작업을 얼마나 오래 이어보낼지도 이 설정을 따라요.',
      'settings.allTabPeriod.all': '전체 기간 (모두 보기)',
      'settings.allTabPeriod.day': '하루 (선택한 날짜 기준)',
      'settings.allTabPeriod.week': '1주일 (선택한 날짜 기준)',
      'settings.allTabPeriod.month': '1개월 (선택한 날짜 기준)',
      'settings.allTabPeriod.year': '올해 (선택한 날짜 기준)',
      'settings.app.label': 'App',
      'settings.app.desc': 'toDone 앱을 완전히 종료하고 메뉴바에서 제거해요.',
      'settings.quit': 'Quit toDone',
      'settings.language.label': 'Language',
      'settings.language.desc': '앱 표시 언어를 선택해요.',
      'settings.version': '버전',
      'settings.update.available': 'v{{version}}으로 업데이트',
      'settings.update.latest': '최신 버전입니다',

      // Update Modal
      'update.title': '업데이트',
      'update.available': 'v{{version}}을 설치할 준비가 됐어요.',
      'update.description': 'toDone 새 버전이 출시됐어요. 지금 설치하면 최신 개선 사항과 수정 사항을 바로 사용할 수 있어요.',
      'update.later': '나중에',
      'update.install': '설치 및 재시작',
      'update.installing': '설치 중...',

      // Task Detail Modal
      'modal.title.create': '새 할 일',
      'modal.title.edit': '수정',
      'modal.field.title': '제목',
      'modal.field.description': '메모',
      'modal.field.dueDate': '마감일',
      'modal.field.recurrence': '반복',
      'modal.field.status': '상태',
      'modal.recurrence.none': '없음',
      'modal.recurrence.daily': '매일',
      'modal.recurrence.weekly': '매주',
      'modal.recurrence.monthly': '매달',
      'modal.status.todo': '할 일',
      'modal.status.inProgress': '진행 중',
      'modal.status.done': '완료',
      'modal.save': '저장',
      'modal.delete': '삭제',
      'modal.cancel': '취소',
    }
  }
};

const savedLang = localStorage.getItem('todone-language');
const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
const defaultLang = savedLang || browserLang;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
