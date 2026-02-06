import Sidebar from '@/components/dashboard/Sidebar';
import ProfileHeader from '@/components/dashboard/ProfileHeader';
import TodoList from '@/components/dashboard/TodoList';
import ProgressCard from '@/components/dashboard/ProgressCard';
import StudyTimeCard from '@/components/dashboard/StudyTimeCard';
import AssignmentCard from '@/components/dashboard/AssignmentCard';
import FeedbackCard from '@/components/dashboard/FeedbackCard';
import QnASection from '@/components/dashboard/QnASection';
import ReportSection from '@/components/dashboard/ReportSection';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import EventWidget from '@/components/dashboard/EventWidget';
import SideTodoList from '@/components/dashboard/SideTodoList';
import MemoWidget from '@/components/dashboard/MemoWidget';

const Index = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* 왼쪽 사이드바 */}
      <Sidebar />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* 프로필 헤더 */}
          <ProfileHeader />
          
          {/* 상단 그리드 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* TO DO LIST */}
            <TodoList />
            
            {/* 오른쪽 통계 카드들 */}
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ProgressCard />
                <StudyTimeCard />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <AssignmentCard />
                <FeedbackCard />
              </div>
            </div>
          </div>
          
          {/* 질의응답 섹션 */}
          <QnASection />
          
          {/* 리포트 섹션 */}
          <ReportSection />
        </div>
      </main>
      
      {/* 오른쪽 사이드바 */}
      <aside className="w-72 p-4 border-l border-border overflow-auto">
        <CalendarWidget />
        <EventWidget />
        <SideTodoList />
        <MemoWidget />
      </aside>
    </div>
  );
};

export default Index;
