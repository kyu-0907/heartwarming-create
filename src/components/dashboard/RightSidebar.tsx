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

    return (
        <aside className="w-full lg:w-72 xl:w-80 p-4 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto h-full bg-background shrink-0 scrollbar-hide">
            <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <EventWidget selectedDate={selectedDate} />
            <SideTodoList />
            {showMemo && <MemoWidget />}
        </aside>
    );
};

export default RightSidebar;
