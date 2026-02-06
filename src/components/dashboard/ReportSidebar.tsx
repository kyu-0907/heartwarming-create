import { cn } from "@/lib/utils";

interface ReportSidebarProps {
    currentWeek: string;
    onSelectWeek: (week: string) => void;
}

const weeks = [
    { id: '1', label: '1주차', period: '26.02.01 ~ 26.02.07' },
    { id: '2', label: '2주차', period: '26.02.08 ~ 26.02.14' },
    { id: '3', label: '3주차', period: '26.02.15 ~ 26.02.21' },
    { id: '4', label: '4주차', period: '26.02.22 ~ 26.02.28' },
];

const ReportSidebar = ({ currentWeek, onSelectWeek }: ReportSidebarProps) => {
    return (
        <aside className="w-full md:w-64 bg-card border-r border-border p-4 flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-6 px-2">주간 리포트</h2>
            <nav className="space-y-2">
                {weeks.map((week) => (
                    <button
                        key={week.id}
                        onClick={() => onSelectWeek(week.id)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1",
                            currentWeek === week.id
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-white"
                        )}
                    >
                        <span className="font-semibold text-sm">{week.label}</span>
                        <span className="font-outfit text-xs opacity-70">{week.period}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default ReportSidebar;
