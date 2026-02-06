import Sidebar from '@/components/dashboard/Sidebar';
import MenteeGrid from '@/components/dashboard/MenteeGrid';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import EventWidget from '@/components/dashboard/EventWidget';
import SideTodoList from '@/components/dashboard/SideTodoList';

const Index = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.nickname ? `${user.nickname}${user.role === 'mentor' ? 'T' : ''}` : '사용자';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* 왼쪽 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 bg-dark-card min-h-screen">
        {/* 헤더 */}
        <header className="p-4 md:p-6 border-b border-border/20">
          <h1 className="text-xl md:text-2xl font-bold text-white">{displayName}</h1>
        </header>

        {/* 멘티 그리드 */}
        <MenteeGrid />
      </main>

      {/* 오른쪽 사이드바 */}
      <aside className="w-full lg:w-72 xl:w-80 p-4 border-t lg:border-t-0 lg:border-l border-border overflow-auto bg-background shrink-0">
        <CalendarWidget />
        <EventWidget />
        <SideTodoList />
      </aside>
    </div>
  );
};

export default Index;
