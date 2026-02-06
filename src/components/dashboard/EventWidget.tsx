import { Plus, Coffee } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EventWidgetProps {
  selectedDate: Date | undefined;
}

// Mock events data
const mockEvents = [
  { id: 1, date: new Date(2026, 1, 6, 14, 0), title: '영어 과외', type: 'study' },
  { id: 2, date: new Date(2026, 1, 6, 16, 0), title: '수학 숙제', type: 'study' },
  { id: 3, date: new Date(2026, 1, 7, 19, 0), title: '멘토링 미팅', type: 'meeting' },
  { id: 4, date: new Date(2026, 1, 8, 10, 0), title: '주간 계획 수립', type: 'planning' },
];

const EventWidget = ({ selectedDate }: EventWidgetProps) => {
  const dailyEvents = selectedDate
    ? mockEvents.filter(event => isSameDay(event.date, selectedDate))
    : [];

  return (
    <div className="card-glass p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">
          {selectedDate ? format(selectedDate, 'M월 d일', { locale: ko }) : '이벤트'} 일정
        </h3>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {dailyEvents.length > 0 ? (
          dailyEvents.map(event => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`w-2 h-10 rounded-full shrink-0 ${event.type === 'study' ? 'bg-blue-400' :
                  event.type === 'meeting' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
              <div>
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <p className="text-xs text-muted-foreground">{format(event.date, 'HH:mm')}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Coffee className="w-8 h-8 opacity-50" />
            <p>일정이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventWidget;
