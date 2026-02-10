import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import ProfileHeader from '@/components/dashboard/ProfileHeader';
import TodoList from '@/components/dashboard/TodoList';
import ProgressCard from '@/components/dashboard/ProgressCard';
import StudyTimeCard from '@/components/dashboard/StudyTimeCard';
import AssignmentCard from '@/components/dashboard/AssignmentCard';
import FeedbackCard from '@/components/dashboard/FeedbackCard';
import QnASection from '@/components/dashboard/QnASection';
import ReportSection from '@/components/dashboard/ReportSection';
import RightSidebar from '@/components/dashboard/RightSidebar';
import { ArrowLeft, Menu } from 'lucide-react';

const MenteeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMyWorkspaceOpen, setIsMyWorkspaceOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-background">
      {/* 왼쪽 사이드바 */}
      <Sidebar mobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 md:p-6 lg:overflow-y-auto lg:h-full h-auto scrollbar-hide">
        {/* 모바일 헤더 */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-foreground hover:text-primary transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-outfit font-bold text-lg text-foreground">SeolStudy</span>
          <button
            onClick={() => setIsMyWorkspaceOpen(true)}
            className="text-sm font-bold text-primary border border-primary/30 bg-primary/5 rounded-lg px-3 py-1 active:scale-95 transition-all"
          >
            MY
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">멘티 목록으로</span>
          </button>

          {/* 프로필 헤더 */}
          <ProfileHeader menteeId={id} />

          {/* 상단 그리드 - 반응형 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* TO DO LIST */}
            <div className="lg:col-span-1 h-full">
              <TodoList menteeId={id!} isReadOnly={true} date={selectedDate} />
            </div>

            {/* 오른쪽 통계 카드들 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressCard menteeId={id!} date={selectedDate} />
                <StudyTimeCard />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <AssignmentCard menteeId={id} />
              </div>
            </div>
          </div>

          {/* 질의응답 섹션 */}
          <QnASection menteeId={id!} />

          {/* 리포트 섹션 */}
          <ReportSection />
        </div>
      </main>

      {/* 오른쪽 사이드바 - 반응형 */}
      <RightSidebar
        menteeId={id}
        showMemo={true}
        mobileOpen={isMyWorkspaceOpen}
        onMobileClose={() => setIsMyWorkspaceOpen(false)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  );
};

export default MenteeDetail;
