import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MenteeTimerViewProps {
    onBack: () => void;
}

const MenteeTimerView = ({ onBack }: MenteeTimerViewProps) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-2 sticky top-0 bg-[#eef1ff] z-10">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">Timer</h1>
                    <p className="text-sm text-gray-500 mt-1">오늘의 공부 시간을 기록해 보세요</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-20">
                {/* Total Time Display */}
                <div className="bg-gradient-to-br from-[#7b8cff] to-[#5c6bff] rounded-[2rem] p-6 mb-8 text-white shadow-lg relative overflow-hidden">
                    <h2 className="text-sm font-bold opacity-80 mb-2">오늘 공부시간</h2>
                    <div className="text-5xl font-outfit font-bold text-[#6eff7b] tracking-tight">8h 45m</div>

                    {/* Decorative Bars */}
                    <div className="flex items-end gap-1.5 h-12 absolute bottom-6 right-6 opacity-80">
                        {[30, 50, 40, 70, 60, 90, 40, 20].map((h, i) => (
                            <div key={i} className="w-2 bg-white/30 rounded-full" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                {/* Subject Timer Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { subject: '국어', time: '80', color: 'bg-[#2d2d2d]' },
                        { subject: '영어', time: '120', color: 'bg-[#2d2d2d]' },
                        { subject: '수학', time: '180', color: 'bg-[#2d2d2d]' },
                        { subject: '기타', time: '145', color: 'bg-[#2d2d2d]' },
                    ].map((item, idx) => (
                        <div key={idx} className={`${item.color} rounded-3xl p-5 flex flex-col justify-between h-40 shadow-md group relative overflow-hidden`}>
                            <div>
                                <h3 className="text-white/80 font-bold text-sm mb-1">{item.subject}</h3>
                                <div className="text-3xl font-bold text-white font-outfit">
                                    {item.time} <span className="text-lg text-white/50">분</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full rounded-xl bg-white/10 border-none text-white hover:bg-[#6eff7b] hover:text-black font-bold transition-all text-sm h-10"
                            >
                                타이머 시작
                            </Button>

                            {/* Icon Decoration */}
                            <Clock className="absolute top-4 right-4 text-white/5 w-16 h-16 group-hover:rotate-12 transition-transform" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MenteeTimerView;
