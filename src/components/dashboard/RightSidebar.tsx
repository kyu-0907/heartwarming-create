import { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';
import MenteeAssignmentMonitor from './MenteeAssignmentMonitor';
import { X, Search } from 'lucide-react';

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

                <CalendarWidget selectedDate={selectedDate} onSelectDate={onDateChange} />
                <div className="mt-6">
                    <MenteeAssignmentMonitor
                        menteeId={menteeId}
                        selectedDate={selectedDate || new Date()}
                    />
                </div>
            </aside>
        </>
    );
};

export default RightSidebar;
