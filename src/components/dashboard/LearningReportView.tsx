import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LearningReportViewProps {
    onBack: () => void;
}

const LearningReportView = ({ onBack }: LearningReportViewProps) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">학습 리포트보기</h1>
                    <p className="text-sm text-gray-500 mt-1">받은 학습리포트를 몰아보세요</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-20">
                <Card className="rounded-[2rem] p-6 shadow-lg border-none bg-blue-50/50 min-h-full">

                    {/* Weekly Report Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-full text-xs font-bold border-none shadow-sm">
                                ~2026.02
                            </Badge>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">주간 학습 리포트</h2>

                        <div className="space-y-3">
                            {[
                                { week: '1주차', date: '26.02.01 ~ 26.02.07', hasReport: true },
                                { week: '2주차', date: '26.02.08 ~ 26.02.14', hasReport: false },
                                { week: '3주차', date: '26.02.15 ~ 26.02.21', hasReport: false },
                                { week: '4주차', date: '26.02.22 ~ 26.02.28', hasReport: false },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer hover:shadow-md group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-600 w-12">{item.week}</span>
                                        <span className="text-sm font-medium text-gray-400">{item.date}</span>
                                    </div>
                                    {item.hasReport && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:text-blue-600">
                                            <span>평가보기</span>
                                            <ChevronRight size={14} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Report Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">월간 학습 리포트</h2>

                        <div className="space-y-3">
                            {[
                                { month: '1개월', label: '2026.01', hasReport: true },
                                { month: '2개월', label: '2026.02', hasReport: false },
                                { month: '3개월', label: '2026.03', hasReport: false },
                                { month: '4개월', label: '2026.04', hasReport: false },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-[#2d2d2d] rounded-2xl p-4 flex items-center justify-between shadow-md hover:translate-y-[-2px] transition-all cursor-pointer hover:shadow-xl hover:bg-[#3d3d3d] group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-white/90 w-12">{item.month}</span>
                                        <span className="text-sm font-medium text-white/50">{item.label}</span>
                                    </div>
                                    {item.hasReport && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-[#6eff7b] group-hover:text-[#8fff95]">
                                            <span>평가보기</span>
                                            <ChevronRight size={14} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </Card>
            </div>
        </div>
    );
};

export default LearningReportView;
