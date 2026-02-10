import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface FeedbackCardProps {
  menteeId?: string;
}

const FeedbackCard = ({ menteeId }: FeedbackCardProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (menteeId) {
      const fetchFeedback = async () => {
        setFetching(true);
        try {
          const today = format(new Date(), 'yyyy-MM-dd');
          const { data, error } = await supabase
            .from('feedbacks')
            .select('content')
            .eq('mentee_id', menteeId)
            .eq('created_at', today)
            .single();

          if (data) {
            setContent(data.content);
          }
        } catch (error) {
          // Ignore error if no feedback exists
        } finally {
          setFetching(false);
        }
      };

      fetchFeedback();
    }
  }, [menteeId]);

  const handleSave = async () => {
    if (!menteeId) {
      toast.error('멘티 정보가 없습니다.');
      return;
    }

    if (!content.trim()) {
      toast.error('피드백 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const today = format(new Date(), 'yyyy-MM-dd');

      const { error } = await supabase
        .from('feedbacks')
        .upsert({
          mentor_id: user.id,
          mentee_id: menteeId,
          content: content,
          created_at: today
        }, { onConflict: 'mentee_id, created_at' });

      if (error) throw error;

      toast.success('피드백이 저장되었습니다!');
    } catch (error: any) {
      console.error('Error saving feedback:', error);
      toast.error(`저장 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass p-4 h-full flex flex-col">
      <h3 className="font-bold mb-4 text-accent">투데이 피드백(멘토 TO 멘티)</h3>

      <div className="space-y-3 flex-1 flex flex-col">
        {fetching ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-5 h-5" />
          </div>
        ) : (
          <textarea
            placeholder="오늘의 공부에 피드백 남기기."
            className="input-field resize-none h-24 flex-1"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        <div className="flex justify-end mt-auto">
          <button
            className="btn-accent text-sm flex items-center gap-2"
            onClick={handleSave}
            disabled={loading || fetching}
          >
            {loading && <Loader2 className="animate-spin w-3 h-3" />}
            {loading ? '저장 중...' : '보내기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
