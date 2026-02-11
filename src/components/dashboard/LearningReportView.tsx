import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface LearningReportViewProps {
    onBack: () => void;
}

const LearningReportView = ({ onBack }: LearningReportViewProps) => {
    const [existingReports, setExistingReports] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Get current mentee ID from auth or state. For mentees, it's their own ID.
    const [menteeId, setMenteeId] = useState<string | null>(null);

    useEffect(() => {
        const fetchExistences = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setMenteeId(user.id);

                const { data } = await supabase
                    .from('learning_reports')
                    .select('type, title')
                    .eq('mentee_id', user.id);

                if (data) {
                    const keys = data.map(r => `${r.type}-${r.title}`);
                    setExistingReports(keys);
                }
            } catch (error) {
                console.error('Error fetching report existences:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExistences();
    }, []);

    const hasReport = (type: string, title: string) => {
        return existingReports.includes(`${type}-${title}`);
    };

    const handleNavigate = (type: string, title: string) => {
        if (!menteeId) return;
        const reportId = type === 'monthly' ? `monthly-${title.replace('개월', '')}` : title.replace('주차', '');
        navigate(`/mentee/${menteeId}/report/${reportId}`);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">학습 리포트보기</h1>
                    <p className="text-sm text-gray-500 mt-1">멘토가 작성한 주간/월간 평가를 확인하세요</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-20">
                <Card className="rounded-[2rem] p-6 shadow-lg border-none bg-blue-50/50 min-h-full relative overflow-hidden">

                    {loading && (
                        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-[2rem]">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    )}

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
                                { week: '1주차', date: '26.02.01 ~ 26.02.07' },
                                { week: '2주차', date: '26.02.08 ~ 26.02.14' },
                                { week: '3주차', date: '26.02.15 ~ 26.02.21' },
                                { week: '4주차', date: '26.02.22 ~ 26.02.28' },
                            ].map((item, idx) => {
                                const exists = hasReport('weekly', item.week);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => exists && handleNavigate('weekly', item.week)}
                                        className={`rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all ${exists ? 'bg-white cursor-pointer hover:translate-y-[-2px] hover:shadow-md group' : 'bg-white/50 opacity-60 cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-600 w-12">{item.week}</span>
                                            <span className="text-xs font-medium text-gray-400">{item.date}</span>
                                        </div>
                                        {exists ? (
                                            <div className="flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:text-blue-600">
                                                <span>리포트 보기</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-300">미작성</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Monthly Report Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">월간 학습 리포트</h2>

                        <div className="space-y-3">
                            {[
                                { month: '1개월', label: '2026.01' },
                                { month: '2개월', label: '2026.02' },
                                { month: '3개월', label: '2026.03' },
                                { month: '4개월', label: '2026.04' },
                            ].map((item, idx) => {
                                const exists = hasReport('monthly', item.month);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => exists && handleNavigate('monthly', item.month)}
                                        className={`rounded-2xl p-4 flex items-center justify-between shadow-md transition-all ${exists ? 'bg-[#2d2d2d] cursor-pointer hover:translate-y-[-2px] hover:shadow-xl hover:bg-[#3d3d3d] group' : 'bg-[#2d2d2d]/50 opacity-40 cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-white/90 w-12">{item.month}</span>
                                            <span className="text-sm font-medium text-white/50">{item.label}</span>
                                        </div>
                                        {exists ? (
                                            <div className="flex items-center gap-1 text-xs font-bold text-[#6eff7b] group-hover:text-[#8fff95]">
                                                <span>리포트 보기</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-white/20">미작성</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </Card>
            </div>
        </div>
    );
};

export default LearningReportView;
