import { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';
import EventWidget from './EventWidget';
import SideTodoList from './SideTodoList';
import MemoWidget from './MemoWidget';
import { X } from 'lucide-react';

interface RightSidebarProps {
    menteeId?: string;
    showMemo?: boolean;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const RightSidebar = ({
    menteeId,
    showMemo = false,
    mobileOpen = false,
    onMobileClose,
    selectedDate,
    onDateChange
}: RightSidebarProps) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mentorName = user.nickname || '멘토';

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`
                    ${mobileOpen ? 'fixed inset-y-0 right-0 z-50 w-80 shadow-2xl flex flex-col' : 'hidden lg:flex lg:flex-col lg:w-72 xl:w-80'}
                    bg-background p-4 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto h-full shrink-0 scrollbar-hide transition-all duration-300
                `}
            >
                {/* Mobile Header with Close Button */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                    <span className="font-bold text-lg">My Workspace</span>
                    <button
                        onClick={onMobileClose}
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 멘토 프로필 헤더 */}
                <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-secondary/50 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-sm">
                        {mentorName[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium">My Workspace</span>
                        <span className="text-sm font-bold text-foreground">{mentorName} 멘토님</span>
                    </div>
                </div>

                <CalendarWidget selectedDate={selectedDate} onSelectDate={onDateChange} />
                <SideTodoList selectedDate={selectedDate || new Date()} menteeId={menteeId} />
                <MemoWidget />
            </aside>
        </>
    );
};

export default RightSidebar;
