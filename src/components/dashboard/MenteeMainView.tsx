import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bell, Download, PieChart, Timer, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, addDays, subDays } from 'date-fns';
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
import { toast } from 'sonner';
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
    const [date, setDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'todo' | 'task' | 'feedback'>('todo');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newTodo, setNewTodo] = useState({ subject: '국어', content: '' });

    const handleDatePrev = () => setDate(subDays(date, 1));
    const handleDateNext = () => setDate(addDays(date, 1));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleAddTodo = async () => {
        if (!newTodo.content.trim()) {
            toast.error('내용을 입력해 주세요.');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            const { error } = await supabase
                .from('todos')
                .insert({
                    user_id: user.id,
                    content: newTodo.content,
                    subject: newTodo.subject,
                    target_date: format(date, 'yyyy-MM-dd'),
                    completed: false
                });

            if (error) throw error;

            toast.success('계획이 추가되었습니다.');
            setIsTodoModalOpen(false);
            setNewTodo({ subject: '국어', content: '' });
            // Triggers a custom event to notify ToDoListContent to refresh
            window.dispatchEvent(new CustomEvent('refresh-todos'));
        } catch (error) {
            console.error('Error adding todo:', error);
            toast.error('계획 추가 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
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

                <Button variant="ghost" size="icon" onClick={() => setView('notification')} className="w-10 h-10 text-muted-foreground relative">
                    <Bell size={36} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </Button>
            </div>

            {/* Content Card with Tabs */}
            <div className="w-full max-w-md relative mt-4">
                <div className="absolute -top-10 left-0 w-full flex items-end justify-center px-4 gap-2 h-12 z-0">
                    <button onClick={() => setActiveTab('todo')} className={`transition-all duration-300 rounded-t-2xl w-16 h-10 md:h-12 flex items-center justify-center relative ${activeTab === 'todo' ? 'bg-white z-20 h-12 shadow-sm' : 'bg-green-300/80 z-10 h-8 hover:h-10'}`}>
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'todo' ? 'bg-green-400' : 'bg-white/50'}`} />
                    </button>
                    <button onClick={() => setActiveTab('task')} className={`transition-all duration-300 rounded-t-2xl w-16 h-10 md:h-12 flex items-center justify-center relative ${activeTab === 'task' ? 'bg-white z-20 h-12 shadow-sm' : 'bg-blue-300/80 z-10 h-8 hover:h-10'}`}>
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'task' ? 'bg-blue-400' : 'bg-white/50'}`} />
                    </button>
                    <button onClick={() => setActiveTab('feedback')} className={`transition-all duration-300 rounded-t-2xl w-16 h-10 md:h-12 flex items-center justify-center relative ${activeTab === 'feedback' ? 'bg-white z-20 h-12 shadow-sm' : 'bg-purple-300/80 z-10 h-8 hover:h-10'}`}>
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'feedback' ? 'bg-purple-400' : 'bg-white/50'}`} />
                    </button>
                </div>

                <Card className="w-full bg-white/95 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 min-h-[500px] border-none relative z-10">
                    <div className="absolute top-0 left-8">
                        <div className={`w-8 h-12 shadow-md flex items-end justify-center pb-1 ${activeTab === 'todo' ? 'bg-green-400' : activeTab === 'task' ? 'bg-blue-400' : 'bg-purple-400'}`}>
                            <div className="w-full h-4 bg-white/0 border-l-[16px] border-r-[16px] border-b-[10px] border-l-transparent border-r-transparent border-b-white/95 translate-y-1"></div>
                        </div>
                    </div>

                    <div className="mt-8">
                        {activeTab === 'todo' && <ToDoListContent date={date} onAddClick={() => setIsTodoModalOpen(true)} />}
                        {activeTab === 'task' && <TaskContent date={date} onVerifyClick={() => setView('verification')} />}
                        {activeTab === 'feedback' && <FeedbackContent date={date} onReportClick={() => setView('report')} />}
                    </div>
                </Card>
            </div>

            {/* Widgets Grid */}
            <div className="w-full max-w-md space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setView('planner')} className="bg-[#6eff7b] rounded-[2rem] p-6 relative h-40 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm group">
                        <span className="text-2xl font-bold text-white drop-shadow-sm font-outfit">플래너</span>
                        <PieChart className="absolute bottom-4 right-4 text-white/90 w-16 h-16 group-hover:rotate-12 transition-transform" strokeWidth={2} />
                    </div>
                    <div onClick={() => setView('qna')} className="bg-gradient-to-br from-[#e2e8ff] to-[#f0f4ff] rounded-[2rem] p-6 relative h-40 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm group overflow-hidden">
                        <span className="text-2xl font-bold text-[#4a55a2] font-outfit relative z-10">질의응답</span>
                        <div className="absolute -bottom-4 -right-4 text-[#4a55a2]/10 font-bold text-9xl leading-none select-none">A</div>
                        <div className="absolute top-8 right-2 text-[#4a55a2]/10 font-bold text-8xl leading-none select-none">Q</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setView('timer')} className="bg-[#2d2d2d] rounded-[2rem] p-6 relative h-32 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg group">
                        <span className="text-white font-bold text-sm">타이머</span>
                        <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[#6eff7b] w-12 h-12 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="bg-[#5c6bff] rounded-[2rem] p-5 relative h-32 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg group flex flex-col justify-between">
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

                {/* Todo Add Modal */}
                {isTodoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsTodoModalOpen(false); }}>
                        <Card className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 border-none animate-in zoom-in-95 duration-200">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 ml-1">과목</label>
                                    <div className="flex gap-2">
                                        {['국어', '영어', '수학'].map((sub) => (
                                            <button
                                                key={sub}
                                                onClick={() => setNewTodo(prev => ({ ...prev, subject: sub }))}
                                                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${newTodo.subject === sub ? 'bg-[#6eff7b] text-black scale-105' : 'bg-green-100/50 text-gray-500 hover:bg-green-100'}`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 ml-1">계획 내용</label>
                                    <textarea
                                        className="w-full h-32 rounded-2xl bg-gray-50 border-none p-4 text-sm font-medium resize-none focus:ring-2 focus:ring-[#6eff7b]/50 outline-none placeholder:text-gray-400"
                                        placeholder="계획 내용을 작성해 주세요"
                                        value={newTodo.content}
                                        onChange={(e) => setNewTodo(prev => ({ ...prev, content: e.target.value }))}
                                    />
                                </div>
                                <Button
                                    disabled={saving}
                                    className="w-full bg-[#2d2d2d] hover:bg-black text-white rounded-2xl py-6 text-lg font-bold shadow-lg"
                                    onClick={handleAddTodo}
                                >
                                    {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : '계획 추가'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components
const ToDoListContent = ({ date, onAddClick }: { date: Date; onAddClick: () => void }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const targetDate = format(date, 'yyyy-MM-dd');
            // 1. Fetch assignments active on the selected date
            const { data: assignments, error: assignError } = await supabase
                .from('assignments')
                .select('*')
                .eq('mentee_id', user.id)
                .lte('start_date', targetDate)
                .gte('end_date', targetDate)
                .order('end_date', { ascending: true })
                .limit(2);

            if (assignError) throw assignError;

            // 2. Fetch Todos
            const { data: todos, error: todoError } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)
                .eq('target_date', targetDate)
                .order('created_at', { ascending: true });

            if (todoError) throw todoError;

            const formattedAssigns = (assignments || []).map(a => ({
                id: a.id,
                type: 'assignment',
                subject: a.subject,
                content: a.title,
                completed: a.is_completed,
                original: a
            }));

            const formattedTodos = (todos || []).map(t => ({
                id: t.id,
                type: 'todo',
                subject: t.subject,
                content: t.content,
                completed: t.completed,
                original: t
            }));

            setItems([...formattedAssigns, ...formattedTodos]);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [date]);

    useEffect(() => {
        const handleRefresh = () => fetchItems();
        window.addEventListener('refresh-todos', handleRefresh);
        return () => window.removeEventListener('refresh-todos', handleRefresh);
    }, [date]);

    const handleToggle = async (item: any) => {
        try {
            if (item.type === 'assignment') {
                const { error } = await supabase
                    .from('assignments')
                    .update({ is_completed: !item.completed })
                    .eq('id', item.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('todos')
                    .update({ completed: !item.completed })
                    .eq('id', item.id);
                if (error) throw error;
            }
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: !item.completed } : i));
        } catch (error) {
            toast.error('상태 변경 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (item: any) => {
        try {
            if (item.type === 'assignment') {
                const { error } = await supabase
                    .from('assignments')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('todos')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
            }
            setItems(prev => prev.filter(i => i.id !== item.id));
            toast.success('항목이 삭제되었습니다.');
        } catch (error) {
            toast.error('삭제 중 오류가 발생했습니다.');
        }
    };

    const completedCount = items.filter(i => i.completed).length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                    <span>계획 이행률</span>
                    <span className="text-green-500">{completedCount}/{items.length}개 완료 {Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-300" />
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4 font-outfit text-gray-800 uppercase">TO DO LIST</h2>
                <div className="space-y-3 min-h-[100px]">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-green-400" /></div>
                    ) : items.length > 0 ? (
                        items.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 bg-white/50 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                                <div onClick={() => handleToggle(item)} className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${item.completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-green-400'}`} />
                                <Badge className={`${item.type === 'assignment' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} border-none shadow-none font-bold min-w-[50px] justify-center`}>
                                    {item.type === 'assignment' ? '과제' : item.subject || '일반'}
                                </Badge>
                                <span className={`text-sm font-medium flex-1 truncate ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.content}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm italic">일정이 없습니다.</div>
                    )}
                </div>
            </div>
            <Button onClick={onAddClick} className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg">계획 추가</Button>
        </div>
    );
};

const TaskContent = ({ date, onVerifyClick }: { date: Date; onVerifyClick: () => void }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                let query = supabase.from('assignments').select('*');
                if (profile?.role === 'mentor') { query = query.eq('mentor_id', user.id); }
                else { query = query.eq('mentee_id', user.id); }
                const { data, error } = await query;
                if (error) throw error;
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const filteredTasks = (data || []).filter((task: any) => task.end_date >= todayStr);
                filteredTasks.sort((a: any, b: any) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
                setTasks(filteredTasks);
            } catch (error) { console.error('Error fetching tasks:', error); } finally { setLoading(false); }
        };
        fetchTasks();
    }, [date]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold font-outfit text-blue-500">TASK</h2>
                <Badge variant="secondary" className="w-fit px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium">{format(date, 'yyyy.MM.dd')}</Badge>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-400" /></div>
                ) : tasks.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-blue-50/50 rounded-2xl">등록된 과제가 없습니다.</div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800">{task.title}</span>
                                {task.file_url && (
                                    <Button size="icon" className="h-8 w-8 rounded-full bg-blue-400 hover:bg-blue-500 text-white shadow-md" onClick={() => window.open(task.file_url, '_blank')}><Download size={16} /></Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-blue-400 hover:bg-blue-500 text-white border-none shrink-0">{task.subject}</Badge>
                                <span className="text-xs text-muted-foreground">{task.start_date} ~ {task.end_date}</span>
                            </div>
                            <p className="text-sm text-gray-500 bg-white/60 p-3 rounded-lg overflow-hidden text-ellipsis">{task.content}</p>
                        </div>
                    ))
                )}
            </div>
            <Button onClick={onVerifyClick} className="w-full bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-xl py-6 text-lg font-bold shadow-lg">공부 인증하기</Button>
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
                const { data: mainFeedback, error: mainError } = await supabase.from('feedback').select('id, general_comment').eq('mentee_id', user.id).eq('feedback_date', targetDate).maybeSingle();
                if (mainError) throw mainError;
                if (mainFeedback) {
                    setFeedbackData(mainFeedback);
                    const { data: detailData, error: detailError } = await supabase.from('feedback_details').select('*').eq('feedback_id', mainFeedback.id);
                    if (detailError) throw detailError;
                    setDetails(detailData || []);
                } else { setFeedbackData(null); setDetails([]); }
            } catch (error) { console.error('Error fetching feedback:', error); } finally { setLoading(false); }
        };
        fetchFeedback();
    }, [date]);

    const getDetailBySubject = (subj: string) => details.find((d: any) => d.subject === subj);
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
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-1">{format(date, 'yyyy.MM.dd')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">멘토의 과목별 코멘트</p>
            </div>
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-400" /></div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-3">
                        {subjects.map((subj) => {
                            const detail = getDetailBySubject(subj.name);
                            return (
                                <div key={subj.name} onClick={() => detail && setSelectedDetail(detail)} className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${detail ? 'bg-white border-purple-100 hover:border-purple-300' : 'bg-gray-50 border-transparent opacity-80'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={`${subj.color} border-none shadow-none text-xs`}>{subj.name}</Badge>
                                        {detail?.is_important && <Badge className="bg-red-500 text-white border-none text-[10px] animate-pulse">중요</Badge>}
                                    </div>
                                    {detail ? (
                                        <p className={`text-sm ${detail.is_important ? 'font-bold text-gray-800' : 'font-medium text-gray-600'} line-clamp-2`}>{detail.summary}</p>
                                    ) : (
                                        <p className="text-xs text-gray-400">등록된 피드백이 없습니다.</p>
                                    )}
                                    {detail && <Trash2 size={14} className="absolute top-4 right-4 text-gray-300" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <Button onClick={onReportClick} className="w-full bg-purple-400 hover:bg-purple-500 text-white rounded-xl py-6 text-lg font-bold shadow-lg mt-4">학습 리포트 보기</Button>
            {selectedDetail && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-[2rem] p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <Badge className="bg-purple-100 text-purple-700 text-lg py-1 px-3">{selectedDetail.subject} 피드백</Badge>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDetail(null)}><ChevronLeft size={24} /></Button>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
                        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                            <span className="text-xs font-bold text-purple-500 block mb-2">요약</span>
                            <p className="text-lg font-bold text-gray-800 leading-snug">{selectedDetail.summary}</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-400 ml-1">상세 내용</span>
                            <div className="bg-white rounded-2xl p-4 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap shadow-sm border border-gray-100">{selectedDetail.detail || "상세 내용이 없습니다."}</div>
                        </div>
                    </div>
                    <Button onClick={() => setSelectedDetail(null)} className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold mt-4 shadow-lg">닫기</Button>
                </div>
            )}
        </div>
    );
};

export default MenteeMainView;
