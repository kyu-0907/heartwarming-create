import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const CalendarWidget = () => {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const dates = [
    [null, null, null, null, null, null, null],
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
  ];
  
  const today = 10;
  const activeDays = [5, 12, 13];
  
  return (
    <div className="card-glass p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-foreground">Feb 2026</span>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight size={18} />
        </button>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors ml-2">
          <Search size={18} />
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, index) => (
          <div
            key={day}
            className={`calendar-day text-xs font-medium ${
              index === 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="space-y-1">
        {dates.slice(1).map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => (
              <div
                key={dayIndex}
                className={`calendar-day ${
                  date === today
                    ? 'calendar-day-today'
                    : activeDays.includes(date || 0)
                    ? 'calendar-day-active'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {date}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
