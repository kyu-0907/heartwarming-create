import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
    id: number;
    title: string;
    content: string;
    startTime: number; // 0-24 hour
    endTime: number;
    day: string; // YYYY-MM-DD
}

interface MenteePlannerViewProps {
    onBack: () => void;
}

const MenteePlannerView = ({ onBack }: MenteePlannerViewProps) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([
        { id: 1, title: '9시에서 12시까지의 공부 주제', content: '9시에서 12시까지의 공부 내용', startTime: 9, endTime: 12, day: '2026-02-10' },
        { id: 2, title: '2시에서 7시까지의 공부 주제', content: '2시에서 7시까지의 공부 내용', startTime: 14, endTime: 19, day: '2026-02-10' },
        { id: 3, title: '10시에서 3시까지의 공부 주제', content: '10시에서 3시까지의 공부 내용', startTime: 22, endTime: 27, day: '2026-02-10' } // 27 = next day 3am
    ]);

    const [newPlan, setNewPlan] = useState<{ title: string; content: string; startAmPm: string; startHour: string; endAmPm: string; endHour: string }>({
        title: '',
        content: '',
        startAmPm: 'AM',
        startHour: '9',
        endAmPm: 'PM',
        endHour: '1'
    });

    const handleAddPlan = () => {
        // Convert time to 24h number for simplicity in this demo
        let start = parseInt(newPlan.startHour);
        if (newPlan.startAmPm === 'PM' && start !== 12) start += 12;
        if (newPlan.startAmPm === 'AM' && start === 12) start = 0;

        let end = parseInt(newPlan.endHour);
        if (newPlan.endAmPm === 'PM' && end !== 12) end += 12;
        if (newPlan.endAmPm === 'AM' && end === 12) end = 0;
        if (end < start) end += 24; // next day assumption

        const plan: Plan = {
            id: Date.now(),
            title: newPlan.title,
            content: newPlan.content,
            startTime: start,
            endTime: end,
            day: '2026-02-10'
        };

        setPlans([...plans, plan]);
        setIsAddModalOpen(false);
        setNewPlan({ title: '', content: '', startAmPm: 'AM', startHour: '9', endAmPm: 'PM', endHour: '1' });
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
                        <p className="text-sm text-gray-500 mt-1">하루의 계획을 작성해 보세요</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl shadow-lg">
                        플랜 추가
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-0">
                {/* Timeline */}
                <div className="relative mt-4 mb-12" style={{ height: '1600px' }}>
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

                    {/* Events */}
                    {plans.map((plan) => {
                        const startOffset = (plan.startTime - 6) * 60;
                        const duration = (plan.endTime - plan.startTime) * 60;

                        return (
                            <div
                                key={plan.id}
                                className="absolute left-14 right-0 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-200 shadow-md p-4 flex flex-col justify-center text-white border border-white/20"
                                style={{ top: `${startOffset + 10}px`, height: `${duration - 20}px` }}
                            >
                                <h3 className="font-bold text-sm md:text-base">{plan.title}</h3>
                                <p className="text-xs md:text-sm text-blue-50 mt-1 opacity-90">{plan.content}</p>
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
                        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day, idx) => (
                            <div key={day} className="flex gap-4 mb-6 last:mb-0">
                                <div className="flex flex-col items-center min-w-[30px]">
                                    <span className={`text-[10px] font-bold ${day === 'SU' ? 'text-rose-400' : 'text-gray-400'}`}>{day}</span>
                                    <span className="text-sm font-bold mt-1 text-gray-800">{8 + idx}</span>
                                </div>
                                <div className="flex-1 space-y-2 pt-1">
                                    {/* Mock items for demo */}
                                    {day === 'SU' ? [1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-xs text-gray-600 font-medium">10시에서 3시까지의 공부 내용</span>
                                        </div>
                                    )) : day === 'MO' ? [1, 2].map(i => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-xs text-gray-600 font-medium">10시에서 3시까지의 공부 내용</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-xs text-gray-600 font-medium">10시에서 3시까지의 공부 내용</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            {/* Modal Overlay */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                    <Card className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 border-none animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-6">
                            <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-1 rounded-full text-sm font-bold border-none">
                                2026.02.10
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
                            <Button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-xl h-12 font-bold shadow-md" onClick={handleAddPlan}>
                                플랜 추가
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MenteePlannerView;
