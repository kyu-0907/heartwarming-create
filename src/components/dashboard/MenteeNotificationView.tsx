import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MenteeNotificationViewProps {
    onBack: () => void;
}

const MenteeNotificationView = ({ onBack }: MenteeNotificationViewProps) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-2 sticky top-0 bg-[#eef1ff] z-10">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">Notifications</h1>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-6 pb-20">
                <div className="space-y-4">
                    {/* Unfinished Plans (Blue Style) */}
                    {[
                        { subject: '국어', count: 6 },
                        { subject: '영어', count: 4 },
                        { subject: '수학', count: 4 },
                    ].map((item, idx) => (
                        <Card key={idx} className="bg-blue-100/80 border-none p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center">
                                <Bell size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-blue-900 font-bold">{item.subject}</span>
                                <span className="text-blue-700/80 text-sm font-medium">완료되지 않은 계획 {item.count}개</span>
                            </div>
                        </Card>
                    ))}

                    {/* Feedback (Dark Style) */}
                    <Card className="bg-[#2d2d2d] border-none p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:translate-x-1 transition-transform cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-gray-700 text-[#6eff7b] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Bell size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#6eff7b] font-bold">피드백 수신</span>
                            <span className="text-gray-400 text-sm font-medium">멘토의 피드백이 도착했습니다</span>
                        </div>
                    </Card>

                    {/* Report (Dark Style) */}
                    {[
                        { type: '주간', title: '리포트 수신' },
                        { type: '월간', title: '리포트 수신' },
                    ].map((item, idx) => (
                        <Card key={idx} className="bg-[#2d2d2d] border-none p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:translate-x-1 transition-transform cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-gray-700 text-[#6eff7b] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Bell size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#6eff7b] font-bold">{item.title}</span>
                                <span className="text-gray-400 text-sm font-medium">멘토의 {item.type}학습 리포트가 도착했습니다</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MenteeNotificationView;
