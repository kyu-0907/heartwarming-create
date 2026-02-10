import { useState, useEffect } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface MenteeNotificationViewProps {
    onBack: () => void;
}

const MenteeNotificationView = ({ onBack }: MenteeNotificationViewProps) => {
    const [qnaNotifications, setQnaNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('qna')
                .select('*')
                .eq('mentee_id', user.id)
                .not('answer_content', 'is', null) // Only answered questions
                .order('answered_at', { ascending: false })
                .limit(5);

            if (data) setQnaNotifications(data);
        };
        fetchNotifications();
    }, []);

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
                    {/* Real Q&A Notifications */}
                    {qnaNotifications.map((qna: any) => (
                        <Card key={qna.id} className="bg-[#2d2d2d] border-none p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:translate-x-1 transition-transform cursor-pointer group" onClick={() => { /* Navigate to QnA view if possible, or just expand */ }}>
                            <div className="w-12 h-12 rounded-full bg-gray-700 text-[#6eff7b] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Bell size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#6eff7b] font-bold">질문 답변 도착</span>
                                <span className="text-gray-400 text-sm font-medium line-clamp-1">'{qna.title}'에 대한 답변이 등록되었습니다.</span>
                                <span className="text-[10px] text-gray-500 mt-1">{new Date(qna.answered_at || qna.created_at).toLocaleDateString()}</span>
                            </div>
                        </Card>
                    ))}

                    {/* Unfinished Plans (Blue Style) - Creating Mock for visual consistency as requested previously, or keep static if no backend logic requested for this yet */}
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
                </div>
            </div>
        </div>
    );
};

export default MenteeNotificationView;
