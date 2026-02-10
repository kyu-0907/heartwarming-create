import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import MenteeGrid from '@/components/dashboard/MenteeGrid';
import RightSidebar from '@/components/dashboard/RightSidebar';
import MenteeMainView from '@/components/dashboard/MenteeMainView';
import { Menu } from 'lucide-react';

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMyWorkspaceOpen, setIsMyWorkspaceOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isMentor = user.role === 'mentor';
  const displayName = user.nickname ? `${user.nickname}${user.role === 'mentor' ? 'T' : ''}` : '사용자';

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-background">
      {/* 왼쪽 사이드바 */}
      <Sidebar mobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

      {/* 메인 콘텐츠 */}
      <main className={`flex-1 lg:h-full lg:overflow-y-auto h-auto scrollbar-hide flex flex-col ${!isMentor ? 'bg-[#dadef8]/30' : 'bg-dark-card'}`}>
        {!isMentor ? (
          <MenteeMainView onSidebarClick={() => setIsMobileMenuOpen(true)} />
        ) : (
          <>
            {/* 모바일 헤더 */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border/20 bg-dark-card sticky top-0 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white hover:text-primary transition-colors"
              >
                <Menu size={24} />
              </button>

              <span className="font-outfit font-bold text-lg text-white">SeolStudy</span>

              <button
                onClick={() => setIsMyWorkspaceOpen(true)}
                className="text-sm font-bold text-primary border border-primary/30 bg-primary/10 rounded-lg px-3 py-1 active:scale-95 transition-all"
              >
                MY
              </button>
            </div>

            {/* 헤더 */}
            <header className="p-4 md:p-6 border-b border-border/20">
              <h1 className="text-xl md:text-2xl font-bold text-white">{displayName}</h1>
            </header>

            {/* 멘티 그리드 */}
            <MenteeGrid />
          </>
        )}
      </main>

      {/* 오른쪽 사이드바 (멘토일 때만 표시) */}
      {isMentor && (
        <RightSidebar
          mobileOpen={isMyWorkspaceOpen}
          onMobileClose={() => setIsMyWorkspaceOpen(false)}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}
    </div>
  );
};

export default Index;
