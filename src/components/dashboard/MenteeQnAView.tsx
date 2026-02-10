import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Folder, Image, Paperclip, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MenteeQnAViewProps {
    onBack: () => void;
}

interface Question {
    id: string;
    title: string;
    content: string;
    attachment_url: string | null;
    answer_content: string | null;
    answer_attachment_url: string | null;
    created_at: string;
}

const MenteeQnAView = ({ onBack }: MenteeQnAViewProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Questions
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('qna')
                .select('*')
                .eq('mentee_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error('Error fetching QnA:', error);
            // toast.error('질문 목록을 불러오지 못했습니다.'); // Suppress initial load error in case table doesn't exist yet
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('제목과 내용을 모두 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            let attachmentUrl = null;

            // Upload File if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('qna_attachments')
                    .upload(fileName, file);

                if (uploadError) {
                    // Try creating bucket logic implicitly not possible here, assume bucket exists
                    console.error('Upload error:', uploadError);
                    toast.error('파일 업로드에 실패했습니다.');
                    // Continue without file? No, usually stop.
                    // But maybe bucket is 'assignments' or other? using 'qna_attachments' as new standard
                    throw uploadError;
                }

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('qna_attachments')
                    .getPublicUrl(fileName);

                attachmentUrl = publicUrl;
            }

            // Insert Question
            const { error: insertError } = await supabase
                .from('qna')
                .insert({
                    mentee_id: user.id,
                    title,
                    content,
                    attachment_url: attachmentUrl
                });

            if (insertError) throw insertError;

            toast.success('질문이 등록되었습니다.');
            setTitle('');
            setContent('');
            setFile(null);
            fetchQuestions(); // Refresh list

        } catch (error) {
            console.error('Error submitting question:', error);
            toast.error('질문 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-2 sticky top-0 bg-[#eef1ff] z-10">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">질의응답</h1>
                    <p className="text-sm text-gray-500 mt-1">질문하고 답변을 받아보세요</p>
                </div>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-8">
                {/* Question Input */}
                <Card className="rounded-[2rem] p-6 shadow-xl border-none bg-white relative overflow-hidden">
                    <div className="space-y-4">
                        <Input
                            placeholder="제목을 적어주세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl h-12 text-lg font-bold placeholder:font-medium placeholder:text-gray-400 focus-visible:ring-1 ring-[#7b8cff]/50"
                        />

                        <div className="relative">
                            <Textarea
                                placeholder="질문을 적어주세요"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[100px] bg-gray-50 border-none rounded-xl p-4 text-base resize-none focus-visible:ring-1 ring-[#7b8cff]/50 placeholder:text-gray-400"
                            />
                            {/* Attachments */}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`h-8 w-8 rounded-lg ${file ? 'text-[#7b8cff] bg-blue-50' : 'text-gray-400 hover:text-[#7b8cff] hover:bg-white'}`}
                                >
                                    <Paperclip size={18} />
                                </Button>
                            </div>
                        </div>

                        {file && (
                            <div className="text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                                <Paperclip size={12} />
                                {file.name}
                                <button onClick={() => setFile(null)} className="ml-2 text-gray-400 hover:text-red-500">✕</button>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="rounded-xl px-6 bg-[#2d2d2d] hover:bg-black text-white font-bold h-10 shadow-lg transition-transform active:scale-95"
                            >
                                {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : '질문하기'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Past QnA List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 px-1">내 질문 목록</h2>

                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#7b8cff]" /></div>
                    ) : questions.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-300">
                            등록된 질문이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((q, idx) => (
                                <div key={q.id} className={`bg-white rounded-[1.5rem] p-5 shadow-sm border transition-all cursor-pointer ${q.answer_content ? 'border-blue-200' : 'border-gray-100 opacity-90'}`}>
                                    <div className="flex items-start gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-[#eef1ff] flex items-center justify-center font-bold text-[#7b8cff] text-sm shrink-0">
                                            Q.{questions.length - idx}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-800 text-sm mb-1">{q.title}</h3>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(q.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">{q.content}</p>

                                            {q.attachment_url && (
                                                <a
                                                    href={q.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#7b8cff] bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download size={10} /> 첨부파일 확인
                                                </a>
                                            )}

                                            {!q.answer_content && (
                                                <span className="text-xs text-[#7b8cff] font-bold mt-2 inline-block">답변 대기중...</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Answer Box */}
                                    {q.answer_content && (
                                        <div className="ml-12 bg-[#f8f9ff] rounded-2xl p-4 border border-[#7b8cff]/20 mt-3 relative animate-in fade-in slide-in-from-top-1">
                                            <div className="w-6 h-6 rounded-full bg-[#7b8cff] absolute -left-3 top-[-6px] flex items-center justify-center text-white font-bold text-xs ring-4 ring-white">A</div>
                                            <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{q.answer_content}</p>
                                            {q.answer_attachment_url && (
                                                <a
                                                    href={q.answer_attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-2 text-[10px] text-white bg-[#7b8cff] px-2 py-1 rounded-full hover:bg-[#6b7cff]"
                                                >
                                                    <Download size={10} /> 답변 첨부파일
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MenteeQnAView;
