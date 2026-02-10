import { useState, useEffect, useRef } from 'react';
import { Upload, Paperclip, Send, Loader2, Download, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  content: string;
  attachment_url: string | null;
  answer_content: string | null;
  answer_attachment_url: string | null;
  created_at: string;
  mentee: { nickname: string } | null; // Optional join if needed
}

interface QnASectionProps {
  menteeId: string;
}

const QnASection = ({ menteeId }: QnASectionProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Questions
  useEffect(() => {
    if (menteeId) {
      fetchQuestions();
    }
  }, [menteeId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qna')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
      if (data && data.length > 0 && !selectedQuestion) {
        // Select first one by default if none selected
        // actually better to check if we should keep selection
        // allow explicit selection
      }
    } catch (error) {
      console.error('Error fetching QnA (Mentor):', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerFile(e.target.files[0]);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedQuestion) return;
    if (!answer.trim()) {
      toast.error('답변 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      let answerAttachmentUrl = null;

      if (answerFile) {
        const fileExt = answerFile.name.split('.').pop();
        const fileName = `answers/${selectedQuestion.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('qna_attachments')
          .upload(fileName, answerFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('qna_attachments')
          .getPublicUrl(fileName);

        answerAttachmentUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('qna')
        .update({
          answer_content: answer,
          answer_attachment_url: answerAttachmentUrl,
          answered_at: new Date().toISOString()
        })
        .eq('id', selectedQuestion.id);

      if (updateError) throw updateError;

      toast.success('답변이 등록되었습니다.');
      setAnswer('');
      setAnswerFile(null);
      fetchQuestions(); // Refresh list to show updated status

      // Update local selectedQuestion so UI reflects changes immediately without re-selection
      setSelectedQuestion(prev => prev ? ({
        ...prev,
        answer_content: answer,
        answer_attachment_url: answerAttachmentUrl
      }) : null);

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6" id="qna-section">
      <h2 className="section-title mb-4 flex items-center gap-2">
        <MessageCircle size={20} />
        질의응답
      </h2>

      <div className="card-glass p-0 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
        {/* List Sidebar */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 bg-white/50 backdrop-blur-sm p-4 overflow-y-auto max-h-[250px] md:max-h-full">
          <h3 className="font-bold text-sm text-muted-foreground mb-3 px-2">질문 목록</h3>
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
          ) : questions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              등록된 질문이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setAnswer(q.answer_content || ''); // Prefill if editing (optional, here just view)
                    // Actually resetting answer field for new reply is standard, but if it's already answered maybe we show it?
                    // Let's assume re-answering overrides or edits.
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all hover:bg-white/80 ${selectedQuestion?.id === q.id
                    ? 'bg-white shadow-sm ring-1 ring-primary/20'
                    : 'hover:translate-x-1'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.answer_content ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                      {q.answer_content ? '답변완료' : '대기중'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm truncate ${selectedQuestion?.id === q.id ? 'text-primary' : 'text-gray-700'}`}>
                    {q.title}
                  </h4>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="flex-1 p-6 flex flex-col h-full bg-white/40">
          {selectedQuestion ? (
            <>
              {/* Question Detail */}
              <div className="mb-6 space-y-4 flex-1 overflow-y-auto pr-2">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedQuestion.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedQuestion.content}
                  </p>

                  {selectedQuestion.attachment_url && (
                    <a
                      href={selectedQuestion.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Paperclip size={14} />
                      <span>첨부파일 다운로드</span>
                    </a>
                  )}
                </div>

                {/* Previous Answer Display if exists */}
                {selectedQuestion.answer_content && (
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                      <span className="font-bold text-sm text-blue-800">등록된 답변</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedQuestion.answer_content}</p>

                    {selectedQuestion.answer_attachment_url && (
                      <a
                        href={selectedQuestion.answer_attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-xs text-white bg-blue-500 px-2.5 py-1.5 rounded-full hover:bg-blue-600"
                      >
                        <Download size={12} /> 답변 첨부파일
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Reply Input Area */}
              <div className="pt-4 border-t border-gray-100 bg-white/50 -m-6 p-6 mt-auto">
                <h4 className="font-bold text-sm mb-2 text-gray-700">답변 작성</h4>
                <div className="relative">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="답변 내용을 입력하세요..."
                    className="w-full h-20 rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none resize-none bg-white"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-1.5 rounded-lg transition-colors ${answerFile ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
                      title="파일 첨부"
                    >
                      <Paperclip size={16} />
                    </button>
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={submitting}
                      className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
                {answerFile && (
                  <div className="mt-2 text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                    <Paperclip size={10} />
                    {answerFile.name}
                    <button onClick={() => setAnswerFile(null)} className="ml-1 text-gray-400 hover:text-red-500">✕</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 py-12 transform translate-y-24">
              <MessageCircle size={48} className="mb-4" strokeWidth={1} />
              <p className="text-center">좌측 목록에서 답변할 질문을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QnASection;
