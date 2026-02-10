import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Folder, Image as ImageIcon, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface StudyVerificationProps {
    onBack: () => void;
}

interface Assignment {
    id: string;
    title: string;
    subject: string;
    content: string;
    start_date: string;
    end_date: string;
}

const StudyVerification = ({ onBack }: StudyVerificationProps) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = format(new Date(), 'yyyy-MM-dd');
            const { data, error } = await supabase
                .from('assignments')
                .select('*')
                .eq('mentee_id', user.id)
                .lte('start_date', today)
                .gte('end_date', today)
                .order('end_date', { ascending: true });

            if (error) throw error;
            setAssignments(data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error('과제 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // In a real app, we would upload to Supabase Storage here.
        // For now, let's simulate a URL or use base64 for preview.
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.info('이미지가 선택되었습니다.');
    };

    const handleSubmit = async () => {
        if (!selectedAssignment) {
            toast.error('과제를 선택해주세요.');
            return;
        }
        if (!content.trim()) {
            toast.error('내용을 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('assignment_verifications')
                .insert({
                    assignment_id: selectedAssignment.id,
                    mentee_id: user.id,
                    content,
                    image_url: imageUrl // In reality, this would be the storage path/URL
                });

            if (error) throw error;

            toast.success('공부 인증이 게시되었습니다!');
            onBack();
        } catch (error) {
            console.error('Error submitting verification:', error);
            toast.error('인증 게시 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#eef1ff]">
                <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
            </div>
        );
    }

    if (!selectedAssignment) {
        return (
            <div className="w-full h-full flex flex-col bg-[#eef1ff] animate-in slide-in-from-right duration-300">
                <div className="p-6 pb-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-gray-800">공부 인증하기</h1>
                        <p className="text-sm text-gray-500 mt-1">인증할 과제를 선택해주세요</p>
                    </div>
                </div>

                <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-4">
                    {assignments.length === 0 ? (
                        <Card className="p-12 flex flex-col items-center justify-center text-center rounded-[2rem] border-none shadow-md">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Folder className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">현재 진행 중인 과제가 없습니다.</p>
                        </Card>
                    ) : (
                        assignments.map((assignment) => (
                            <Card
                                key={assignment.id}
                                onClick={() => setSelectedAssignment(assignment)}
                                className="p-5 rounded-2xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                            >
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-100 text-blue-600 border-none rounded-lg text-[10px] px-2 py-0.5 font-bold uppercase">
                                            {assignment.subject}
                                        </Badge>
                                        <span className="text-xs text-gray-400 font-medium">{assignment.start_date} ~ {assignment.end_date}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 truncate">{assignment.title}</h3>
                                    <p className="text-sm text-gray-500 truncate">{assignment.content}</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-full text-blue-400 group-hover:bg-blue-100 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={handleImageChange}
            />

            {/* Header */}
            <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(null)} className="-ml-2 mt-1">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-500 text-white border-none rounded-lg text-[10px] font-bold">
                                {selectedAssignment.subject}
                            </Badge>
                            <span className="text-xs text-gray-500 font-medium">{selectedAssignment.title}</span>
                        </div>
                        <h1 className="text-2xl font-bold font-outfit text-gray-800">공부 인증 작성</h1>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Due Date</p>
                    <p className="text-sm font-bold text-gray-700">{selectedAssignment.end_date}</p>
                </div>
            </div>

            {/* Content Form */}
            <div className="flex-1 px-6 pb-20 overflow-y-auto">
                <Card className="rounded-[2rem] overflow-hidden shadow-lg border-none flex flex-col min-h-[400px]">
                    {/* Toolbar */}
                    <div className="bg-blue-50/50 p-4 flex justify-between items-center border-b border-blue-100">
                        <span className="text-xs font-bold text-blue-600 ml-2">인증 내용 입력</span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => imageInputRef.current?.click()}
                                className={`rounded-xl w-10 h-10 transition-colors ${imageUrl ? 'text-blue-500 bg-blue-100' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-100'}`}
                            >
                                <ImageIcon size={24} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {imageUrl && (
                            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                                    <img src={imageUrl} alt="Verification" className="w-full h-full object-cover" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg"
                                        onClick={() => setImageUrl(null)}
                                    >
                                        <ArrowLeft className="rotate-45" size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Textarea
                            className="flex-1 p-6 text-base border-none resize-none focus-visible:ring-0 bg-white placeholder:text-gray-300 min-h-[200px]"
                            placeholder="공부인증 이미지나 결과를 입력해주세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </Card>

                {/* Bottom Actions */}
                <div className="flex gap-4 mt-8">
                    <Button
                        variant="secondary"
                        onClick={() => onBack()}
                        className="flex-1 h-14 rounded-full text-base font-bold bg-white text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-100"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 h-14 rounded-full text-base font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : '인증 게시하기'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudyVerification;
