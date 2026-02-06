interface WeeklyReport {
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
  { week: '1주차', dateRange: '26.02.01 ~ 26.02.07', deadline: '26.02.08 평가 작성' },
  { week: '2주차', dateRange: '26.02.08 ~ 26.02.14' },
  { week: '3주차', dateRange: '26.02.15 ~ 26.02.21' },
  { week: '4주차', dateRange: '26.02.22 ~ 26.02.28' },
];

const monthlyReports: MonthlyReport[] = [
  { month: '1개월', label: '2026.01', deadline: '26.02.01 평가 작성' },
  { month: '2개월', label: '2026.02' },
  { month: '3개월', label: '' },
  { month: '4개월', label: '' },
];

const ReportSection = () => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-6">
      {/* 주간 학습 리포트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">주간 학습 리포트</h2>
          <button className="btn-accent text-sm">작성하기</button>
        </div>
        
        <div className="space-y-2">
          {weeklyReports.map((report) => (
            <div key={report.week} className="report-row">
              <span className="text-sm font-medium text-foreground w-12">{report.week}</span>
              <span className="text-sm text-muted-foreground flex-1">{report.dateRange}</span>
              {report.deadline && (
                <span className="text-xs text-muted-foreground">{report.deadline}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 월간 학습 리포트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">월간 학습 리포트</h2>
          <button className="btn-accent text-sm">작성하기</button>
        </div>
        
        <div className="space-y-2">
          {monthlyReports.map((report) => (
            <div key={report.month} className="card-dark p-3 rounded-xl flex items-center gap-4">
              <span className="text-sm font-medium w-12">{report.month}</span>
              <span className="text-sm text-muted-foreground flex-1">{report.label}</span>
              {report.deadline && (
                <span className="text-xs text-muted-foreground">{report.deadline}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSection;
