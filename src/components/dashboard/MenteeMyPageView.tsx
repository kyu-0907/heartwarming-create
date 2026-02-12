import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MenteeMyPageViewProps {
    onBack: () => void;
}

interface StatItem {
    subject: string;
    total: number;
    done: number;
    progress: number;
    color: string;
    barColor: string;
}

const MenteeMyPageView = ({ onBack }: MenteeMyPageViewProps) => {
    const [stats, setStats] = useState<StatItem[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);

                // Fetch Assignments
                const { data: assignments } = await supabase
                    .from('assignments')
                    .select('subject, is_completed')
                    .eq('mentee_id', user.id);

                if (assignments) {
                    const subjectStats: Record<string, { total: number, done: number }> = {};

                    // Initialize major subjects
                    ['국어', '영어', '수학'].forEach(sub => {
                        subjectStats[sub] = { total: 0, done: 0 };
                    });

                    assignments.forEach(a => {
                        const sub = a.subject || '기타';
                        if (!subjectStats[sub]) subjectStats[sub] = { total: 0, done: 0 };
                        subjectStats[sub].total += 1;
                        if (a.is_completed) subjectStats[sub].done += 1;
                    });

                    const newStats = Object.keys(subjectStats).map(sub => {
                        const { total, done } = subjectStats[sub];
                        const progress = total === 0 ? 0 : Math.round((done / total) * 100);

                        let color = 'text-gray-500';
                        let barColor = 'bg-gray-500';

                        if (sub === '국어') { color = 'text-rose-500'; barColor = 'bg-rose-500'; }
                        else if (sub === '영어') { color = 'text-blue-500'; barColor = 'bg-blue-500'; }
                        else if (sub === '수학') { color = 'text-amber-500'; barColor = 'bg-amber-500'; }
                        else if (sub === '탐구') { color = 'text-emerald-500'; barColor = 'bg-emerald-500'; }
                        else if (sub === '한국사') { color = 'text-orange-500'; barColor = 'bg-orange-500'; }

                        return { subject: sub, total, done, progress, color, barColor };
                    }).sort((a, b) => {
                        // Custom sort order: Korean, English, Math, then others
                        const order = ['국어', '영어', '수학', '탐구', '한국사'];
                        const idxA = order.indexOf(a.subject);
                        const idxB = order.indexOf(b.subject);
                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                        if (idxA !== -1) return -1;
                        if (idxB !== -1) return 1;
                        return 0;
                    });

                    setStats(newStats);
                }
            } catch (error) {
                console.error('Error fetching my page data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getAvatarSrc = () => {
        if (profile?.avatar_url) return profile.avatar_url;
        if (profile?.nickname === '멘티2') return '/images/avatar_female.png';
        return '/images/avatar_male.png';
    }

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#eef1ff]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 pb-2">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-3xl font-bold font-outfit text-gray-800">My Page</h1>
                <p className="text-sm text-gray-500 mt-1">활동 요약 / 내 정보</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-24">
                {/* Profile Card */}
                <Card className="rounded-[2rem] p-8 shadow-xl bg-white border-none relative overflow-hidden mb-6">
                    {/* Decorative Ribbon */}
                    <div className="absolute top-0 right-8">
                        <div className="w-8 h-12 bg-[#6eff7b] shadow-md flex items-end justify-center pb-1">
                            <div className="w-full h-4 bg-white/0 border-l-[16px] border-r-[16px] border-b-[10px] border-l-transparent border-r-transparent border-b-white translate-y-1"></div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-4">
                        <Avatar className="w-24 h-24 border-4 border-[#eef1ff] shadow-lg">
                            <AvatarImage src={getAvatarSrc()} />
                            <AvatarFallback className="bg-gray-200">
                                <User className="w-10 h-10 text-gray-400" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900">{profile?.nickname || '알 수 없음'}</h2>
                            <p className="text-sm font-medium text-gray-500">{profile?.grade || '학년 정보 없음'}</p>
                        </div>

                        <div className="w-full bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-600 font-medium border border-gray-100 mt-2">
                            "{profile?.goal || '오늘의 노력이 내일의 합격이다!'}"
                        </div>
                    </div>

                    {/* Subject Progress */}
                    <div className="mt-10 space-y-6">
                        <h3 className="font-bold text-gray-800 px-1">과목별 달성률 요약</h3>

                        <div className="space-y-4">
                            {stats.map((item, idx) => (
                                <div key={idx} className="bg-[#f8f9ff] rounded-2xl p-5 space-y-3 border border-blue-50/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={`${item.color} border-current bg-white`}>
                                                {item.subject}
                                            </Badge>
                                            <span className="text-xs text-gray-400 font-medium">{item.done}/{item.total}개 완료</span>
                                        </div>
                                        <span className={`text-lg font-bold ${item.color}`}>{item.progress}%</span>
                                    </div>
                                    <Progress value={item.progress} className={`h-2.5 bg-gray-100 [&>div]:${item.barColor}`} />
                                    {/* Removed ambiguous click text, or can keep it if detail view exists. Let's keep vague hint. */}
                                </div>
                            ))}
                            {stats.length === 0 && (
                                <div className="text-center text-gray-400 py-4 text-sm">
                                    아직 등록된 과제가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Floating Consult Button */}
            <div className="absolute bottom-6 left-6 right-6 z-20">
                <Button
                    onClick={() => window.open('https://forms.gle/FchKdDcm23JdGhpK9', '_blank')}
                    className="w-full h-14 rounded-2xl bg-[#2d2d2d] hover:bg-black text-white text-lg font-bold shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>💬</span> 상담 받아보기
                </Button>
            </div>
        </div>
    );
};

export default MenteeMyPageView;
