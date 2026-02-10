import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bell, Calendar as CalendarIcon, Download, CheckCircle, Smartphone, PieChart, Timer, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StudyVerification from './StudyVerification';
import MenteePlannerView from './MenteePlannerView';
import LearningReportView from './LearningReportView';
import MenteeMyPageView from './MenteeMyPageView';
import MenteeNotificationView from './MenteeNotificationView';
import MenteeTimerView from './MenteeTimerView';
import MenteeQnAView from './MenteeQnAView';

interface MenteeMainViewProps {
    onSidebarClick?: () => void;
}

const MenteeMainView = ({ onSidebarClick }: MenteeMainViewProps) => {
    const navigate = useNavigate();
    const [view, setView] = useState<'dashboard' | 'planner' | 'verification' | 'report' | 'mypage' | 'notification' | 'timer' | 'qna'>('dashboard');
    // Main Header Date
    const [date, setDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'todo' | 'task' | 'feedback'>('todo');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState({ subject: '국어', content: '' });

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

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (view === 'planner') {
        return <MenteePlannerView onBack={() => setView('dashboard')} />;
    }

    if (view === 'verification') {
        return <StudyVerification onBack={() => setView('dashboard')} />;
    }

    if (view === 'report') {
        return <LearningReportView onBack={() => setView('dashboard')} />;
    }

    if (view === 'mypage') {
        return <MenteeMyPageView onBack={() => setView('dashboard')} />;
    }

    if (view === 'notification') {
        return <MenteeNotificationView onBack={() => setView('dashboard')} />;
    }

    if (view === 'timer') {
        return <MenteeTimerView onBack={() => setView('dashboard')} />;
    }

    if (view === 'qna') {
        return <MenteeQnAView onBack={() => setView('dashboard')} />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center bg-[#dadef8]/30 p-4 md:p-8 overflow-y-auto min-h-screen">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-6">
                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="w-10 h-10 border border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src="/images/avatar_male.png" />
                            <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setView('mypage')} className="cursor-pointer">
                            마이페이지
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                            로그아웃
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                <Button variant="ghost" size="icon" onClick={() => setView('notification')} className="w-10 h-10 text-muted-foreground relative">
                    <Bell size={36} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
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
                        {activeTab === 'todo' && <ToDoListContent onAddClick={() => setIsTodoModalOpen(true)} />}
                        {activeTab === 'task' && <TaskContent date={date} onVerifyClick={() => setView('verification')} />}
                        {activeTab === 'feedback' && <FeedbackContent date={date} onReportClick={() => setView('report')} />}
                    </div>
                </Card>
            </div>

            {/* Widgets Grid */}
            <div className="w-full max-w-md space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {/* Row 1: Planner & Q&A */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Planner */}
                    <div
                        onClick={() => setView('planner')}
                        className="bg-[#6eff7b] rounded-[2rem] p-6 relative h-40 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm group"
                    >
                        <span className="text-2xl font-bold text-white drop-shadow-sm font-outfit">플래너</span>
                        <PieChart className="absolute bottom-4 right-4 text-white/90 w-16 h-16 group-hover:rotate-12 transition-transform" strokeWidth={2} />
                    </div>

                    {/* Q&A */}
                    <div
                        onClick={() => setView('qna')}
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
                        onClick={() => setView('timer')}
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

                {/* Calendar Caard */}
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

            {/* Todo Add Modal */}
            {isTodoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsTodoModalOpen(false); }}>
                    <Card className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 border-none animate-in zoom-in-95 duration-200">
                        <div className="space-y-6">
                            {/* Subjects */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">과목</label>
                                <div className="flex gap-2">
                                    {['국어', '영어', '수학'].map((sub) => (
                                        <button
                                            key={sub}
                                            onClick={() => setNewTodo(prev => ({ ...prev, subject: sub }))}
                                            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${newTodo.subject === sub
                                                ? 'bg-[#6eff7b] text-black scale-105'
                                                : 'bg-green-100/50 text-gray-500 hover:bg-green-100'
                                                }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">계획 내용</label>
                                <textarea
                                    className="w-full h-32 rounded-2xl bg-gray-50 border-none p-4 text-sm font-medium resize-none focus:ring-2 focus:ring-[#6eff7b]/50 outline-none placeholder:text-gray-400"
                                    placeholder="계획 내용을 작성해 주세요"
                                    value={newTodo.content}
                                    onChange={(e) => setNewTodo(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                className="w-full bg-[#2d2d2d] hover:bg-black text-white rounded-2xl py-6 text-lg font-bold shadow-lg"
                                onClick={() => {
                                    setIsTodoModalOpen(false);
                                    setNewTodo({ subject: '국어', content: '' });
                                }}
                            >
                                계획 추가
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const ToDoListContent = ({ onAddClick }: { onAddClick: () => void }) => (
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
                    <div key={idx} className="flex items-center gap-3 bg-white/50 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                        <div className={`w-4 h-4 rounded-full border-2 transition-colors ${item.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-green-400'}`} />
                        <Badge className={`${item.color} border-none shadow-none font-bold min-w-[50px] justify-center`}>{item.subject}</Badge>
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    </div>
                ))}
            </div>
        </div>

        <Button onClick={onAddClick} className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg">
            계획 추가
        </Button>
    </div>
);

const TaskContent = ({ date, onVerifyClick }: { date: Date; onVerifyClick: () => void }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const targetDate = format(date, 'yyyy-MM-dd');

                // Check Role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                let query = supabase.from('assignments').select('*');

                if (profile?.role === 'mentor') {
                    // Mentor sees all assignments they created
                    query = query.eq('mentor_id', user.id);
                } else {
                    // Mentee sees assignments assigned to them
                    query = query.eq('mentee_id', user.id);
                }

                const { data, error } = await query;

                if (error) throw error;

                // Filter in JS: Show all active and future assignments (end_date >= today)
                // We do NOT filter by start_date, so future assignments are visible too.
                const today = format(new Date(), 'yyyy-MM-dd');

                console.log('Mentee View: Fetching all active/future tasks from:', today);
                console.log('Mentee View: All Tasks:', data);

                const filteredTasks = (data || []).filter((task: any) => {
                    // Show if not expired (end_date is today or future)
                    return task.end_date >= today;
                });

                // Sort by deadline (soonest first)
                filteredTasks.sort((a: any, b: any) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

                setTasks(filteredTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [date]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold font-outfit text-blue-500">TASK</h2>
                <Badge variant="secondary" className="w-fit px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium">
                    {format(date, 'yyyy.MM.dd')}
                </Badge>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-blue-400" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-blue-50/50 rounded-2xl">
                        등록된 과제가 없습니다.
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800">{task.title}</span>
                                {task.file_url && (
                                    <Button
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-blue-400 hover:bg-blue-500 text-white shadow-md"
                                        onClick={() => window.open(task.file_url, '_blank')}
                                    >
                                        <Download size={16} />
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-blue-400 hover:bg-blue-500 text-white border-none shrink-0">{task.subject}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {task.start_date} ~ {task.end_date}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 bg-white/60 p-3 rounded-lg overflow-hidden text-ellipsis">
                                {task.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <Button onClick={onVerifyClick} className="w-full bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-xl py-6 text-lg font-bold shadow-lg">
                공부 인증하기
            </Button>
        </div>
    );
};

const FeedbackContent = ({ date, onReportClick }: { date: Date; onReportClick: () => void }) => {
    const [feedbackData, setFeedbackData] = useState<{ id: string, general_comment: string | null } | null>(null);
    const [details, setDetails] = useState<any[]>([]);
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFeedback = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const targetDate = format(date, 'yyyy-MM-dd');

                // 1. Fetch Main Feedback
                const { data: mainFeedback, error: mainError } = await supabase
                    .from('feedback')
                    .select('id, general_comment')
                    .eq('mentee_id', user.id)
                    .eq('feedback_date', targetDate)
                    .single();

                if (mainError && mainError.code !== 'PGRST116') throw mainError; // PGRST116 is "no rows found"

                if (mainFeedback) {
                    setFeedbackData(mainFeedback);

                    // 2. Fetch Details
                    const { data: detailData, error: detailError } = await supabase
                        .from('feedback_details')
                        .select('*')
                        .eq('feedback_id', mainFeedback.id);

                    if (detailError) throw detailError;
                    setDetails(detailData || []);
                } else {
                    setFeedbackData(null);
                    setDetails([]);
                }

            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [date]);

    // Helper to find detail by subject
    const getDetailBySubject = (subj: string) => details.find(d => d.subject === subj);

    const subjects = [
        { name: '국어', color: 'bg-rose-100 text-rose-700', border: 'border-rose-200' },
        { name: '영어', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
        { name: '수학', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-bold font-outfit text-purple-600">FEEDBACK</h2>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-1">
                        {format(date, 'yyyy.MM.dd')}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">멘토의 과목별 코멘트</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-400" /></div>
            ) : (
                <div className="space-y-4">
                    {/* Subject Cards */}
                    <div className="grid gap-3">
                        {subjects.map((subj) => {
                            const detail = getDetailBySubject(subj.name);
                            return (
                                <div
                                    key={subj.name}
                                    onClick={() => detail && setSelectedDetail(detail)}
                                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md 
                                        ${detail ? 'bg-white border-purple-100 hover:border-purple-300' : 'bg-gray-50 border-transparent opacity-80'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={`${subj.color} border-none shadow-none text-xs`}>{subj.name}</Badge>
                                        {detail?.is_important && (
                                            <Badge className="bg-red-500 text-white border-none text-[10px] animate-pulse">중요</Badge>
                                        )}
                                    </div>

                                    {detail ? (
                                        <p className={`text-sm ${detail.is_important ? 'font-bold text-gray-800' : 'font-medium text-gray-600'} line-clamp-2`}>
                                            {detail.summary}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400">등록된 피드백이 없습니다.</p>
                                    )}

                                    {detail && (
                                        <div className="absolute top-4 right-4 text-gray-300">
                                            <ChevronRight size={16} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* General Comment */}
                    <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                        <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                            <span>📝</span> 멘토 총평
                        </h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {feedbackData?.general_comment || "아직 총평이 등록되지 않았습니다."}
                        </p>
                    </div>
                </div>
            )}

            <Button onClick={onReportClick} className="w-full bg-purple-400 hover:bg-purple-500 text-white rounded-xl py-6 text-lg font-bold shadow-lg mt-4">
                학습 리포트 보기
            </Button>

            {/* Detail Modal Overlay */}
            {selectedDetail && (
                <div
                    className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-[2rem] p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <Badge className="bg-purple-100 text-purple-700 text-lg py-1 px-3">
                            {selectedDetail.subject} 피드백
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDetail(null)}>
                            <ChevronLeft size={24} />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
                        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                            <span className="text-xs font-bold text-purple-500 block mb-2">요약</span>
                            <p className="text-lg font-bold text-gray-800 leading-snug">
                                {selectedDetail.summary}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-400 ml-1">상세 내용</span>
                            <div className="bg-white rounded-2xl p-4 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap shadow-sm border border-gray-100">
                                {selectedDetail.detail || "상세 내용이 없습니다."}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => setSelectedDetail(null)}
                        className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold mt-4 shadow-lg"
                    >
                        닫기
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MenteeMainView;
