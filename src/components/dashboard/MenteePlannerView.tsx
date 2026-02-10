import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface Plan {
    id: string;
    title: string;
    content: string;
    start_time: number; // 0-24 hour
    end_time: number;
    plan_date: string; // YYYY-MM-DD
}

interface MenteePlannerViewProps {
    onBack: () => void;
}

const MenteePlannerView = ({ onBack }: MenteePlannerViewProps) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [weeklyPlans, setWeeklyPlans] = useState<Plan[]>([]);
    const [today] = useState(new Date());

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(subDays(today, 3), i));
    }, [today]);

    const [newPlan, setNewPlan] = useState<{ title: string; content: string; startAmPm: string; startHour: string; endAmPm: string; endHour: string }>({
        title: '',
        content: '',
        startAmPm: 'AM',
        startHour: '9',
        endAmPm: 'PM',
        endHour: '1'
    });

    useEffect(() => {
        fetchPlans();
        fetchWeeklyPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const formattedDate = format(today, 'yyyy-MM-dd');
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .eq('user_id', user.id)
                .eq('plan_date', formattedDate);

            if (error) throw error;
            setPlans(data || []);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('플랜을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyPlans = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const startStr = format(weekDays[0], 'yyyy-MM-dd');
            const endStr = format(weekDays[6], 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .eq('user_id', user.id)
                .gte('plan_date', startStr)
                .lte('plan_date', endStr);

            if (error) throw error;
            setWeeklyPlans(data || []);
        } catch (error) {
            console.error('Error fetching weekly plans:', error);
        }
    };

    const handleAddPlan = async () => {
        if (!newPlan.title.trim()) {
            toast.error('플랜 제목을 입력해 주세요.');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            // Convert time to 24h number
            let start = parseInt(newPlan.startHour);
            if (newPlan.startAmPm === 'PM' && start !== 12) start += 12;
            if (newPlan.startAmPm === 'AM' && start === 12) start = 0;

            let end = parseInt(newPlan.endHour);
            if (newPlan.endAmPm === 'PM' && end !== 12) end += 12;
            if (newPlan.endAmPm === 'AM' && end === 12) end = 0;
            if (end <= start) end += 24; // next day assumption

            const planDate = format(today, 'yyyy-MM-dd');

            const { error } = await supabase
                .from('plans')
                .insert({
                    user_id: user.id,
                    title: newPlan.title,
                    content: newPlan.content,
                    start_time: start,
                    end_time: end,
                    plan_date: planDate
                });

            if (error) throw error;

            toast.success('플랜이 추가되었습니다.');
            setIsAddModalOpen(false);
            setNewPlan({ title: '', content: '', startAmPm: 'AM', startHour: '9', endAmPm: 'PM', endHour: '1' });
            fetchPlans();
            fetchWeeklyPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
            toast.error('플랜 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#f0f4ff]/50 relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-2">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-800">플래너</h1>
                        <p className="text-sm text-gray-500 mt-1">{format(today, 'M월 d일')}의 계획을 작성해 보세요</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl shadow-lg">
                        플랜 추가
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-0">

                {/* Timeline */}
                <div className="relative mt-4 mb-12" style={{ height: '1440px' }}>
                    {Array.from({ length: 24 }, (_, i) => i + 6).map((h, idx) => {
                        const displayH = h >= 24 ? h - 24 : h;
                        const ampm = displayH >= 12 ? 'PM' : 'AM';
                        const displayHour = displayH > 12 ? displayH - 12 : (displayH === 0 || displayH === 24 ? 12 : displayH);

                        return (
                            <div key={h} className="absolute w-full flex items-center" style={{ top: `${idx * 60}px` }}>
                                <span className="text-xs text-gray-400 w-10 text-right mr-4">{displayHour}{ampm}</span>
                                <div className="flex-1 h-px border-t border-dashed border-gray-300"></div>
                            </div>
                        );
                    })}

                    {/* Loading State */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] z-10 rounded-2xl">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {/* Events */}
                    {!loading && plans.map((plan) => {
                        const startOffset = (plan.start_time - 6) * 60;
                        const duration = (plan.end_time - plan.start_time) * 60;

                        return (
                            <div
                                key={plan.id}
                                className="absolute left-14 right-0 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-200 shadow-md p-4 flex flex-col justify-center text-white border border-white/20 group animate-in zoom-in-95 duration-200"
                                style={{ top: `${startOffset + 5}px`, height: `${duration - 10}px`, minHeight: '40px' }}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-sm md:text-base line-clamp-1">{plan.title}</h3>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm('이 플랜을 삭제하시겠습니까?')) {
                                                const { error } = await supabase.from('plans').delete().eq('id', plan.id);
                                                if (error) toast.error('삭제 중 오류가 발생했습니다.');
                                                else {
                                                    toast.success('플랜이 삭제되었습니다.');
                                                    fetchPlans();
                                                    fetchWeeklyPlans();
                                                }
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded-full transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                {duration > 60 && (
                                    <p className="text-xs md:text-sm text-blue-50 mt-1 opacity-90 line-clamp-2">{plan.content}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Weekly Planner */}
                <div className="mt-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-outfit text-gray-800">주간 플래너</h2>
                            <p className="text-sm text-gray-500">이번 주의 계획을 작성해 보세요</p>
                        </div>
                    </div>

                    <Card className="rounded-[2rem] p-6 shadow-sm border-none bg-white">
                        {weekDays.map((day) => {
                            const dayPlans = weeklyPlans.filter(p => p.plan_date === format(day, 'yyyy-MM-dd'));
                            const isToday = isSameDay(day, today);
                            const dayName = format(day, 'EE', { locale: ko }).toUpperCase().substring(0, 2);

                            return (
                                <div key={day.toISOString()} className={`flex gap-4 mb-6 last:mb-0 ${isToday ? 'scale-[1.02] transition-transform' : ''}`}>
                                    <div className="flex flex-col items-center min-w-[40px]">
                                        <span className={`text-[10px] font-bold ${format(day, 'i') === '7' ? 'text-rose-400' : 'text-gray-400'}`}>{dayName}</span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-1 ${isToday ? 'bg-blue-500 text-white shadow-md' : 'text-gray-800'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2 pt-2">
                                        {dayPlans.length > 0 ? (
                                            dayPlans.map(p => (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    <span className="text-xs font-bold text-gray-700">{p.title}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-2 opacity-50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                <span className="text-xs text-gray-400 italic">계획이 없습니다</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Card>
                </div>
            </div>

            {/* Modal Overlay */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                    <Card className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 border-none animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-6">
                            <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-1 rounded-full text-sm font-bold border-none">
                                {format(today, 'yyyy.MM.dd')}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900 ml-1">Start</label>
                                <div className="flex bg-blue-50 rounded-2xl p-2 items-center justify-center gap-1 h-16">
                                    <button
                                        onClick={() => setNewPlan(p => ({ ...p, startAmPm: p.startAmPm === 'AM' ? 'PM' : 'AM' }))}
                                        className="font-bold text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                    >
                                        {newPlan.startAmPm}
                                    </button>
                                    <Input
                                        type="number"
                                        min={1} max={12}
                                        value={newPlan.startHour}
                                        onChange={e => setNewPlan(p => ({ ...p, startHour: e.target.value }))}
                                        className="w-12 text-center text-lg font-bold border-none bg-transparent shadow-none focus-visible:ring-0 p-0"
                                    />
                                    <span className="font-bold text-gray-800">:00</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900 ml-1">End</label>
                                <div className="flex bg-blue-50 rounded-2xl p-2 items-center justify-center gap-1 h-16">
                                    <button
                                        onClick={() => setNewPlan(p => ({ ...p, endAmPm: p.endAmPm === 'AM' ? 'PM' : 'AM' }))}
                                        className="font-bold text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                    >
                                        {newPlan.endAmPm}
                                    </button>
                                    <Input
                                        type="number"
                                        min={1} max={12}
                                        value={newPlan.endHour}
                                        onChange={e => setNewPlan(p => ({ ...p, endHour: e.target.value }))}
                                        className="w-12 text-center text-lg font-bold border-none bg-transparent shadow-none focus-visible:ring-0 p-0"
                                    />
                                    <span className="font-bold text-gray-800">:00</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-900 ml-1">플랜 작성</label>
                                <Input
                                    className="rounded-xl border-gray-200 bg-white h-12"
                                    placeholder="플랜 제목을 작성해 주세요"
                                    value={newPlan.title}
                                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                />
                            </div>
                            <Textarea
                                className="rounded-xl border-gray-200 bg-white min-h-[120px] resize-none"
                                placeholder="플랜 내용을 작성해 주세요"
                                value={newPlan.content}
                                onChange={(e) => setNewPlan({ ...newPlan, content: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl h-12 font-bold" onClick={() => setIsAddModalOpen(false)}>
                                취소
                            </Button>
                            <Button
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-xl h-12 font-bold shadow-md disabled:opacity-50"
                                onClick={handleAddPlan}
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '플랜 추가'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MenteePlannerView;
