import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval
} from 'date-fns';

interface CalendarWidgetProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const CalendarWidget = ({ selectedDate, onSelectDate }: CalendarWidgetProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Split into weeks (rows)
  const rows = [];
  let daysInWeek = [];
  calendarDays.forEach((day, i) => {
    daysInWeek.push(day);
    if ((i + 1) % 7 === 0) {
      rows.push(daysInWeek);
      daysInWeek = [];
    }
  });

  return (
    <div className="card-glass p-3 md:p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <span className="font-outfit font-bold text-sm md:text-base text-white bg-primary px-3 py-1 rounded-full uppercase">
          {format(currentMonth, 'MMM yyyy')}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors ml-2">
          <Search size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, index) => (
          <div
            key={day}
            className={`calendar-day text-xs font-medium ${index === 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="space-y-1">
        {rows.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={dayIndex}
                  onClick={() => onSelectDate(day)}
                  className={`calendar-day text-xs md:text-sm cursor-pointer transition-all ${!isCurrentMonth ? 'text-muted-foreground/30' : 'text-foreground hover:bg-muted'
                    } ${isSelected ? 'calendar-day-today shadow-md shadow-primary/20' :
                      isToday ? 'bg-secondary text-secondary-foreground font-bold' : ''
                    }`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
