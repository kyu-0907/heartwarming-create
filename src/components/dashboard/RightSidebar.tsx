import { useState } from 'react';
import CalendarWidget from './CalendarWidget';
import EventWidget from './EventWidget';
import SideTodoList from './SideTodoList';
import MemoWidget from './MemoWidget';

interface RightSidebarProps {
    showMemo?: boolean;
}

const RightSidebar = ({ showMemo = false }: RightSidebarProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mentorName = user.nickname || '멘토';

    return (
        <aside className="w-full lg:w-72 xl:w-80 p-4 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto h-full bg-background shrink-0 scrollbar-hide">
            {/* 멘토 프로필 헤더 */}
            <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-sm">
                    {mentorName[0]}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">My Workspace</span>
                    <span className="text-sm font-bold text-foreground">{mentorName} 멘토님</span>
                </div>
            </div>

            <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <EventWidget selectedDate={selectedDate} />
            <SideTodoList />
            {showMemo && <MemoWidget />}
        </aside>
    );
};

export default RightSidebar;
