import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Play, Pause, Save, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MenteeTimerViewProps {
    onBack: () => void;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
};

const MenteeTimerView = ({ onBack }: MenteeTimerViewProps) => {
    const [totalToday, setTotalToday] = useState(0); // seconds
    const [subjects, setSubjects] = useState<any[]>([
        { subject: '국어', time: 0, color: 'bg-[#2d2d2d]' },
        { subject: '영어', time: 0, color: 'bg-[#2d2d2d]' },
        { subject: '수학', time: 0, color: 'bg-[#2d2d2d]' },
        { subject: '기타', time: 0, color: 'bg-[#2d2d2d]' },
    ]);

    // Timer State
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0); // seconds for current session
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch Today's Data
    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = format(new Date(), 'yyyy-MM-dd');
            const { data, error } = await supabase
                .from('study_sessions')
                .select('subject, duration')
                .eq('user_id', user.id)
                .eq('study_date', today);

            if (error) throw error;

            let total = 0;
            const subjectTotals: Record<string, number> = { '국어': 0, '영어': 0, '수학': 0, '기타': 0 };

            (data || []).forEach((row: any) => {
                total += row.duration;
                if (subjectTotals[row.subject] !== undefined) {
                    subjectTotals[row.subject] += row.duration;
                } else {
                    subjectTotals['기타'] += row.duration;
                }
            });

            setTotalToday(total);
            setSubjects(prev => prev.map(s => ({
                ...s,
                time: Math.floor(subjectTotals[s.subject] / 60) // display in minutes
            })));

        } catch (error) {
            console.error('Error fetching timer data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        } else if (!isRunning && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const handleStart = (subject: string) => {
        if (activeSubject && activeSubject !== subject) {
            toast.error('이미 다른 과목 타이머가 작동 중입니다.');
            return;
        }
        setActiveSubject(subject);
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleSave = async () => {
        if (!activeSubject || elapsed === 0) return;

        setIsRunning(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('study_sessions').insert({
                user_id: user.id,
                subject: activeSubject,
                duration: elapsed,
                study_date: format(new Date(), 'yyyy-MM-dd')
            });

            if (error) throw error;

            toast.success(`${activeSubject} ${formatTime(elapsed)} 저장 완료!`);

            // Limit fetch call? Optimistic update is better but fetch is safer for sync.
            await fetchData();

            // Reset
            setElapsed(0);
            setActiveSubject(null);

        } catch (error) {
            console.error('Error saving session:', error);
            toast.error('저장 실패');
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setElapsed(0);
        setActiveSubject(null);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-2 sticky top-0 bg-[#eef1ff] z-10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-800">Timer</h1>
                        <p className="text-sm text-gray-500 mt-1">오늘의 공부 시간을 기록해 보세요</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-20">
                {/* Active Timer Display (Overlay or Top Section) */}
                {activeSubject && (
                    <div className="bg-black/90 text-white rounded-[2rem] p-6 mb-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-lg md:text-xl font-bold text-gray-300 mb-4">{activeSubject} 공부 중...</h3>

                        {/* Time Display: Responsive Font Size */}
                        <div className="text-5xl md:text-7xl font-outfit font-bold tabular-nums tracking-wider text-[#6eff7b] mb-8 text-center w-full">
                            {new Date(elapsed * 1000).toISOString().substr(11, 8)}
                        </div>

                        <div className="flex justify-center gap-4">
                            {!isRunning ? (
                                <Button onClick={() => setIsRunning(true)} size="lg" className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-[#6eff7b] hover:bg-[#5ce669] text-black shadow-lg shadow-green-500/20">
                                    <Play size={24} fill="currentColor" />
                                </Button>
                            ) : (
                                <Button onClick={handlePause} size="lg" className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-500/20">
                                    <Pause size={24} fill="currentColor" />
                                </Button>
                            )}

                            <Button onClick={handleSave} size="lg" className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                <Save size={24} />
                            </Button>

                            {/* Cancel/Reset Button: Red with X icon */}
                            <Button onClick={handleReset} size="lg" className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 border-none">
                                <span className="sr-only">취소</span>
                                <X size={24} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Total Time Display */}
                {!activeSubject && (
                    <div className="bg-gradient-to-br from-[#7b8cff] to-[#5c6bff] rounded-[2rem] p-6 mb-8 text-white shadow-lg relative overflow-hidden transition-all hover:scale-[1.02]">
                        <h2 className="text-sm font-bold opacity-80 mb-2">오늘 총 공부시간</h2>
                        <div className="text-5xl font-outfit font-bold text-[#6eff7b] tracking-tight">
                            {Math.floor(totalToday / 3600)}h {Math.floor((totalToday % 3600) / 60)}m
                        </div>
                        {/* Bars visual based on total time approx */}
                        <div className="flex items-end gap-1.5 h-12 absolute bottom-6 right-6 opacity-30">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-2 bg-white rounded-full" style={{ height: `${Math.random() * 50 + 20}%` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Subject Timer Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {subjects.map((item, idx) => (
                        <div key={idx} className={`${item.color} rounded-3xl p-5 flex flex-col justify-between h-40 shadow-md group relative overflow-hidden ${activeSubject === item.subject ? 'ring-4 ring-[#6eff7b] ring-offset-2 ring-offset-[#eef1ff]' : ''}`}>
                            <div>
                                <h3 className="text-white/80 font-bold text-sm mb-1">{item.subject}</h3>
                                <div className="text-3xl font-bold text-white font-outfit">
                                    {item.time} <span className="text-lg text-white/50">분</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleStart(item.subject)}
                                disabled={!!activeSubject && activeSubject !== item.subject}
                                variant="outline"
                                className={`w-full rounded-xl border-none font-bold transition-all text-sm h-10 ${activeSubject === item.subject ? 'bg-[#6eff7b] text-black' : 'bg-white/10 text-white hover:bg-[#6eff7b] hover:text-black'}`}
                            >
                                {activeSubject === item.subject ? '측정 중...' : '타이머 시작'}
                            </Button>

                            <Clock className="absolute top-4 right-4 text-white/5 w-16 h-16 group-hover:rotate-12 transition-transform" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MenteeTimerView;
