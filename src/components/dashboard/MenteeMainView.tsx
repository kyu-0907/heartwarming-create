import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Calendar as CalendarIcon, Download, CheckCircle, Smartphone, PieChart, Timer, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MenteeMainViewProps {
    onSidebarClick?: () => void;
}

const MenteeMainView = ({ onSidebarClick }: MenteeMainViewProps) => {
    // Main Header Date
    const [date, setDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'todo' | 'task' | 'feedback'>('todo');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Widget Calendar State
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedWidgetDate, setSelectedWidgetDate] = useState(new Date());

    // Mock Events for Widget Calendar
    const mockEvents: Record<string, string> = {
        [format(new Date(), 'yyyy-MM-dd')]: '오늘의 학습',
        [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: '국어 과외',
        [format(addDays(new Date(), 5), 'yyyy-MM-dd')]: '수학 모의고사',
        [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: '영어 단어 암기',
        '2026-02-14': '발렌타인 데이',
        '2026-02-03': '국어 과외',
        '2026-02-10': '영어 단어 시험',
        '2026-02-24': '멘토링 상담',
    };

    const calendarDays = eachDayOfInterval({
        start: startOfWeek(startOfMonth(calendarDate)),
        end: endOfWeek(endOfMonth(calendarDate))
    });

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCalendarDate(subMonths(calendarDate, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCalendarDate(addMonths(calendarDate, 1));
    };

    const handleDatePrev = () => setDate(subDays(date, 1));
    const handleDateNext = () => setDate(addDays(date, 1));

    return (
        <div className="w-full h-full flex flex-col items-center bg-[#dadef8]/30 p-4 md:p-8 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-6">
                {/* Profile */}
                <Avatar
                    className="w-10 h-10 border border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onSidebarClick}
                >
                    <AvatarImage src="/images/avatar_male.png" />
                    <AvatarFallback>M</AvatarFallback>
                </Avatar>

                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleDatePrev}>
                        <ChevronLeft size={20} />
                    </Button>

                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 px-2 font-bold text-lg hover:bg-transparent">
                                {format(date, 'M월 d일', { locale: ko })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => { if (d) { setDate(d); setIsCalendarOpen(false); } }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleDateNext}>
                        <ChevronRight size={20} />
                    </Button>
                </div>

                {/* Notification */}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </Button>
            </div>

            {/* Content Card with Tabs */}
            <div className="w-full max-w-md relative mt-4">
                {/* Tabs */}
                <div className="absolute -top-10 left-0 w-full flex items-end justify-center px-4 gap-2 h-12 z-0">
                    {/* Tab 1: Green */}
                    <button
                        onClick={() => setActiveTab('todo')}
                        className={`transition-all duration-300 rounded-t-2xl w-16 h-10 md:h-12 flex items-center justify-center relative ${activeTab === 'todo' ? 'bg-white z-20 h-12 shadow-sm' : 'bg-green-300/80 z-10 h-8 hover:h-10'
                            }`}
                        style={{ boxShadow: activeTab === 'todo' ? '0 -4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}
                    >
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'todo' ? 'bg-green-400' : 'bg-white/50'}`} />
                    </button>

                    {/* Tab 2: Blue */}
                    <button
                        onClick={() => setActiveTab('task')}
                        className={`transition-all duration-300 rounded-t-2xl w-16 h-10 md:h-12 flex items-center justify-center relative ${activeTab === 'task' ? 'bg-white z-20 h-12 shadow-sm' : 'bg-blue-300/80 z-10 h-8 hover:h-10'
                            }`}
                        style={{ boxShadow: activeTab === 'task' ? '0 -4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}
                    >
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'task' ? 'bg-blue-400' : 'bg-white/50'}`} />
                    </button>

                    {/* Tab 3: Purple */}
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`transition-all duration-300 rounded-t-2xl w-16 h-10 md:h-12 flex items-center justify-center relative ${activeTab === 'feedback' ? 'bg-white z-20 h-12 shadow-sm' : 'bg-purple-300/80 z-10 h-8 hover:h-10'
                            }`}
                        style={{ boxShadow: activeTab === 'feedback' ? '0 -4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}
                    >
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'feedback' ? 'bg-purple-400' : 'bg-white/50'}`} />
                    </button>
                </div>

                {/* Main Card */}
                <Card className="w-full bg-white/95 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 min-h-[500px] border-none relative z-10">
                    {/* Interior Ribbon (Bookmark) */}
                    <div className="absolute top-0 left-8">
                        <div className={`w-8 h-12 shadow-md flex items-end justify-center pb-1 ${activeTab === 'todo' ? 'bg-green-400' :
                            activeTab === 'task' ? 'bg-blue-400' : 'bg-purple-400'
                            }`}>
                            <div className="w-full h-4 bg-white/0 border-l-[16px] border-r-[16px] border-b-[10px] border-l-transparent border-r-transparent border-b-white/95 translate-y-1"></div>
                        </div>
                    </div>


                    {/* Content */}
                    <div className="mt-8">
                        {activeTab === 'todo' && <ToDoListContent />}
                        {activeTab === 'task' && <TaskContent date={date} />}
                        {activeTab === 'feedback' && <FeedbackContent date={date} />}
                    </div>
                </Card>
            </div>

            {/* Widgets Grid */}
            <div className="w-full max-w-md space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {/* Row 1: Planner & Q&A */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Planner */}
                    <div
                        onClick={() => { }}
                        className="bg-[#6eff7b] rounded-[2rem] p-6 relative h-40 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm group"
                    >
                        <span className="text-2xl font-bold text-white drop-shadow-sm font-outfit">플래너</span>
                        <PieChart className="absolute bottom-4 right-4 text-white/90 w-16 h-16 group-hover:rotate-12 transition-transform" strokeWidth={2} />
                    </div>

                    {/* Q&A */}
                    <div
                        onClick={() => { }}
                        className="bg-gradient-to-br from-[#e2e8ff] to-[#f0f4ff] rounded-[2rem] p-6 relative h-40 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm group overflow-hidden"
                    >
                        <span className="text-2xl font-bold text-[#4a55a2] font-outfit relative z-10">질의응답</span>
                        <div className="absolute -bottom-4 -right-4 text-[#4a55a2]/10 font-bold text-9xl leading-none select-none">A</div>
                        <div className="absolute top-8 right-2 text-[#4a55a2]/10 font-bold text-8xl leading-none select-none">Q</div>
                    </div>
                </div>

                {/* Row 2: Timer & Study Time */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Timer */}
                    <div
                        onClick={() => { }}
                        className="bg-[#2d2d2d] rounded-[2rem] p-6 relative h-32 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg group"
                    >
                        <span className="text-white font-bold text-sm">타이머</span>
                        <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[#6eff7b] w-12 h-12 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Study Time */}
                    <div
                        onClick={() => { }}
                        className="bg-[#5c6bff] rounded-[2rem] p-5 relative h-32 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg group flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-white/80 text-xs font-bold">공부시간</span>
                            <span className="text-[#6eff7b] text-xl font-bold font-outfit">8h 45m</span>
                        </div>
                        <div className="flex items-end justify-center gap-1 h-10 pb-1 w-full px-2">
                            <div className="w-1.5 bg-[#4a55a2] h-3 rounded-full" />
                            <div className="w-1.5 bg-[#4a55a2] h-5 rounded-full" />
                            <div className="w-1.5 bg-[#6eff7b] h-7 rounded-full" />
                            <div className="w-1.5 bg-[#6eff7b] h-9 rounded-full" />
                            <div className="w-1.5 bg-[#6eff7b] h-5 rounded-full" />
                            <div className="w-1.5 bg-[#4a55a2] h-3 rounded-full" />
                            <div className="w-1.5 bg-[#6eff7b] h-2 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Calendar Card */}
                <div
                    className="bg-white rounded-[2rem] overflow-hidden shadow-xl mt-2 transition-transform hover:scale-[1.01]"
                >
                    <div className="p-6 pb-4">
                        {/* Custom Header */}
                        <div className="flex items-center justify-center gap-6 mb-6">
                            <ChevronLeft size={24} className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={handlePrevMonth} />
                            <Badge className="bg-[#7986cb] hover:bg-[#7d8bd6] text-lg px-6 py-1.5 h-auto rounded-full font-bold shadow-md border-none pointer-events-none">
                                {format(calendarDate, 'MMM yyyy')}
                            </Badge>
                            <ChevronRight size={24} className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={handleNextMonth} />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-7 text-center gap-y-4 mb-2">
                            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                                <div key={d} className={`text-xs font-bold ${d === 'SU' ? 'text-rose-400' : d === 'SA' ? 'text-blue-400' : 'text-gray-300'}`}>{d}</div>
                            ))}

                            {calendarDays.map((day, idx) => {
                                const isSelected = isSameDay(day, selectedWidgetDate);
                                const isCurrentMonth = isSameMonth(day, calendarDate);
                                const hasEvent = !!mockEvents[format(day, 'yyyy-MM-dd')];

                                return (
                                    <div
                                        key={idx}
                                        className={`relative flex justify-center pt-1 group/day cursor-pointer ${!isCurrentMonth ? 'opacity-30' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedWidgetDate(day); }}
                                    >
                                        {isSelected ? (
                                            <div className="w-8 h-8 bg-[#7986cb] rounded-full flex items-center justify-center text-white font-bold shadow-md transform -translate-y-1 transition-all">
                                                {format(day, 'd')}
                                            </div>
                                        ) : (
                                            <div className={`text-sm font-bold min-h-[1.5rem] transition-colors
                                                ${isCurrentMonth ? 'text-gray-700 group-hover/day:text-[#7986cb]' : 'text-gray-400'}
                                            `}>
                                                {format(day, 'd')}
                                            </div>
                                        )}
                                        {hasEvent && !isSelected && (
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Event Footer */}
                    <div className="bg-[#bdc5f5]/30 p-5 flex items-center justify-between hover:bg-[#bdc5f5]/40 transition-colors">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-extrabold text-black/60">이벤트</span>
                            <span className="text-sm font-medium text-black/70">
                                {mockEvents[format(selectedWidgetDate, 'yyyy-MM-dd')] || '일정이 없습니다.'}
                            </span>
                        </div>
                        <Button size="icon" variant="ghost" className="text-black/60 hover:bg-black/5 hover:text-black w-8 h-8">
                            <Plus size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToDoListContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                <span>계획 이행률</span>
                <span className="text-green-500">2/5개 완료 40%</span>
            </div>
            <Progress value={40} className="h-3 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-300" />
        </div>

        <div>
            <h2 className="text-2xl font-bold mb-4 font-outfit">TO DO LIST</h2>
            <div className="space-y-3">
                {[
                    { subject: '국어', title: '문법 강의', done: false, color: 'bg-green-300 text-green-900' },
                    { subject: '영어', title: '모의고사', done: false, color: 'bg-green-300 text-green-900' },
                    { subject: '영어', title: '단어 암기', done: false, color: 'bg-green-300 text-green-900' },
                    { subject: '수학', title: '100제 한단원 끝내기', done: false, color: 'bg-green-300 text-green-900' },
                    { subject: '수학', title: '오답 노트', done: false, color: 'bg-green-300 text-green-900' },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/50 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-4 h-4 rounded-full border-2 ${item.done ? 'bg-green-500 border-green-500' : 'border-red-400'}`} />
                        <Badge className={`${item.color} border-none shadow-none font-bold min-w-[50px] justify-center`}>{item.subject}</Badge>
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    </div>
                ))}
            </div>
        </div>

        <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg">
            계획 추가
        </Button>
    </div>
);

const TaskContent = ({ date }: { date: Date }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-outfit text-blue-500">TASK</h2>
            <Badge variant="secondary" className="w-fit px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium">
                {format(date, 'yyyy.MM.dd')}
            </Badge>
        </div>

        <div className="space-y-4">
            {[1, 2].map((i) => (
                <div key={i} className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">영어 단어 50개 외우기</span>
                        <Button size="icon" className="h-8 w-8 rounded-full bg-blue-400 hover:bg-blue-500 text-white shadow-md">
                            <Download size={16} />
                        </Button>
                    </div>
                    <Badge className="bg-blue-400 hover:bg-blue-500 text-white border-none">설스터디 VOCA</Badge>
                    <p className="text-sm text-gray-500 bg-white/60 p-3 rounded-lg">
                        멘토가 써준 내용
                    </p>
                </div>
            ))}
        </div>

        <Button className="w-full bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-xl py-6 text-lg font-bold shadow-lg">
            공부 인증하기
        </Button>
    </div>
);

const FeedbackContent = ({ date }: { date: Date }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold font-outfit">FEEDBACK</h2>
            <p className="text-sm text-muted-foreground">홍길동 멘토의 피드백</p>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Yesterday</h3>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none">{format(subDays(date, 1), 'yyyy.MM.dd')}</Badge>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 min-h-[100px] shadow-inner text-sm text-gray-700">
                    피드백 내용.
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Today</h3>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none">{format(date, 'yyyy.MM.dd')}</Badge>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 min-h-[100px] shadow-inner text-sm text-gray-700 flex items-center justify-center text-muted-foreground">
                    멘토가 아직 피드백 하지 않았어요.
                </div>
            </div>
        </div>

        <Button className="w-full bg-purple-400 hover:bg-purple-500 text-white rounded-xl py-6 text-lg font-bold shadow-lg">
            학습 리포트 보기
        </Button>
    </div>
);

export default MenteeMainView;
