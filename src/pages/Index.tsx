import Sidebar from '@/components/dashboard/Sidebar';
import MenteeGrid from '@/components/dashboard/MenteeGrid';
import RightSidebar from '@/components/dashboard/RightSidebar';

const Index = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.nickname ? `${user.nickname}${user.role === 'mentor' ? 'T' : ''}` : '사용자';

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-background">
      {/* 왼쪽 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 bg-dark-card h-full overflow-y-auto scrollbar-hide">
        {/* 헤더 */}
        <header className="p-4 md:p-6 border-b border-border/20">
          <h1 className="text-xl md:text-2xl font-bold text-white">{displayName}</h1>
        </header>

        {/* 멘티 그리드 */}
        <MenteeGrid />
      </main>

      {/* 오른쪽 사이드바 */}
      <RightSidebar />
    </div>
  );
};

export default Index;
