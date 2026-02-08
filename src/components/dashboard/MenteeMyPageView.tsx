import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MenteeMyPageViewProps {
    onBack: () => void;
}

const MenteeMyPageView = ({ onBack }: MenteeMyPageViewProps) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 pb-2">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-3xl font-bold font-outfit text-gray-800">My Page</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-20">
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
                            <AvatarImage src="/images/avatar_male.png" />
                            <AvatarFallback className="bg-gray-200">
                                <User className="w-10 h-10 text-gray-400" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900">황규호</h2>
                            <p className="text-sm font-medium text-gray-500">경기고등학교 3학년</p>
                        </div>

                        <div className="w-full bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-600 font-medium border border-gray-100 mt-2">
                            "오늘의 노력이 내일의 합격이다!"
                        </div>
                    </div>

                    {/* Subject Progress */}
                    <div className="mt-10 space-y-6">
                        <h3 className="font-bold text-gray-800 px-1">과목별 달성률 요약</h3>

                        <div className="space-y-4">
                            {[
                                { subject: '국어', progress: 40, total: 10, done: 4 },
                                { subject: '영어', progress: 80, total: 10, done: 8 },
                                { subject: '수학', progress: 60, total: 10, done: 6 },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#f8f9ff] rounded-2xl p-4 space-y-2 border border-blue-50/50">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700">{item.subject}</span>
                                            <span className="text-xs text-gray-400 font-medium">{item.done}/{item.total}개 완료</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#6eff7b]">{item.progress}%</span>
                                    </div>
                                    <Progress value={item.progress} className="h-2.5 bg-gray-200 [&>div]:bg-[#6eff7b]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Consult Button */}
                <Button className="w-full h-14 rounded-2xl bg-[#2d2d2d] hover:bg-black text-white text-lg font-bold shadow-xl transition-transform active:scale-95">
                    상담 받아보기
                </Button>
            </div>
        </div>
    );
};

export default MenteeMyPageView;
