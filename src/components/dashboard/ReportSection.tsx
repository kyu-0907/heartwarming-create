import { useNavigate, useParams } from 'react-router-dom';

interface WeeklyReport {
  id: string;
  week: string;
  dateRange: string;
  deadline?: string;
}

interface MonthlyReport {
  month: string;
  label: string;
  deadline?: string;
}

const weeklyReports: WeeklyReport[] = [
  { id: '1', week: '1주차', dateRange: '26.02.01 ~ 26.02.07', deadline: '26.02.08 평가 작성' },
  { id: '2', week: '2주차', dateRange: '26.02.08 ~ 26.02.14' },
  { id: '3', week: '3주차', dateRange: '26.02.15 ~ 26.02.21' },
  { id: '4', week: '4주차', dateRange: '26.02.22 ~ 26.02.28' },
];

const monthlyReports: MonthlyReport[] = [
  { month: '1개월', label: '2026.01', deadline: '26.02.01 평가 작성' },
  { month: '2개월', label: '2026.02' },
  { month: '3개월', label: '' },
  { month: '4개월', label: '' },
];

const ReportSection = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isMentor = user.role === 'mentor';

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 주간 학습 리포트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title text-base md:text-lg">주간 학습 리포트</h2>
          {isMentor && <button className="btn-accent text-xs md:text-sm">작성하기</button>}
        </div>

        <div className="space-y-2">
          {weeklyReports.map((report) => (
            <div
              key={report.id}
              className="report-row cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/mentee/${id || '1'}/report/${report.id}`)}
            >
              <span className="text-xs md:text-sm font-medium text-foreground w-10 md:w-12 shrink-0">{report.week}</span>
              <span className="text-xs md:text-sm text-muted-foreground flex-1 truncate">{report.dateRange}</span>
              {report.deadline && (
                <span className="text-xs text-muted-foreground hidden md:block">{report.deadline}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 월간 학습 리포트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title text-base md:text-lg">월간 학습 리포트</h2>
          {isMentor && <button className="btn-accent text-xs md:text-sm">작성하기</button>}
        </div>

        <div className="space-y-2">
          {monthlyReports.map((report) => (
            <div
              key={report.month}
              className="report-row cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/mentee/${id || '1'}/report/monthly-${report.month.replace('개월', '')}`)}
            >
              <span className="text-xs md:text-sm font-medium text-foreground w-10 md:w-12 shrink-0">{report.month}</span>
              <span className="text-xs md:text-sm text-muted-foreground flex-1">{report.label}</span>
              {report.deadline && (
                <span className="text-xs text-muted-foreground hidden md:block">{report.deadline}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSection;
