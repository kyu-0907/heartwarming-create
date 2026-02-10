import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MemoWidget = () => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('memos')
          .select('content')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setContent(data.content || '');
        }
      } catch (error) {
        // Ignore error
      }
    };

    fetchMemo();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!content) return;

      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('memos')
          .upsert({
            user_id: user.id,
            content: content,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) throw error;
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving memo:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="mt-6 mb-20 md:mb-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-bold text-foreground text-sm">MEMO</h3>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="animate-spin text-primary w-3 h-3" />}
          {lastSaved && !isSaving && (
            <span className="text-[10px] text-muted-foreground">
              저장됨 {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="card-dark p-3 rounded-2xl min-h-[150px] relative">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="자유롭게 기록하세요..."
          className="w-full h-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-gray-500 text-white min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default MemoWidget;
