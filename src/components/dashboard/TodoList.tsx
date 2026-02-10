import { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TodoListProps {
  menteeId: string;
  isReadOnly?: boolean;
  date?: Date;
}

const TodoList = ({ menteeId, isReadOnly = false, date = new Date() }: TodoListProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!menteeId) return;
    setLoading(true);
    try {
      const targetDate = format(date, 'yyyy-MM-dd');

      // 1. Fetch Assignments (Match Mentee View Limit & Order)
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .eq('mentee_id', menteeId)
        .lte('start_date', targetDate)
        .gte('end_date', targetDate)
        .order('end_date', { ascending: true })
        .limit(2);

      if (assignError) throw assignError;

      // 2. Fetch Todos
      const { data: todos, error: todoError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', menteeId)
        .eq('target_date', targetDate)
        .order('created_at', { ascending: true });

      if (todoError) throw todoError;

      const formattedAssigns = (assignments || []).map(a => ({
        id: a.id,
        type: 'assignment',
        subject: a.subject,
        content: a.title,
        completed: a.is_completed,
        original: a
      }));

      const formattedTodos = (todos || []).map(t => ({
        id: t.id,
        type: 'todo',
        subject: t.subject,
        content: t.content,
        completed: t.completed,
        original: t
      }));

      setItems([...formattedAssigns, ...formattedTodos]);
    } catch (error) {
      console.error('Error fetching items for mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    const handleRefresh = () => fetchItems();
    window.addEventListener('refresh-todos', handleRefresh);
    window.addEventListener('refresh-stats', handleRefresh);
    return () => {
      window.removeEventListener('refresh-todos', handleRefresh);
      window.removeEventListener('refresh-stats', handleRefresh);
    };
  }, [menteeId, date]);

  const handleToggle = async (item: any) => {
    if (isReadOnly) return;
    try {
      if (item.type === 'assignment') {
        const { error } = await supabase
          .from('assignments')
          .update({ is_completed: !item.completed })
          .eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('todos')
          .update({ completed: !item.completed })
          .eq('id', item.id);
        if (error) throw error;
      }
      setItems(prev => prev.map(i => (i.id === item.id && i.type === item.type) ? { ...i, completed: !item.completed } : i));
      window.dispatchEvent(new CustomEvent('refresh-stats'));
    } catch (error) {
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (item: any) => {
    if (isReadOnly || !confirm('정말 삭제하시겠습니까?')) return;
    try {
      if (item.type === 'assignment') {
        const { error } = await supabase.from('assignments').delete().eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('todos').delete().eq('id', item.id);
        if (error) throw error;
      }
      setItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
      toast.success('항목이 삭제되었습니다.');
      window.dispatchEvent(new CustomEvent('refresh-stats'));
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="card-dark p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 font-outfit text-white uppercase tracking-tight">TO DO LIST</h2>

      <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-accent" /></div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`flex items-center gap-3 p-1 rounded-lg transition-colors group ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-white/5'}`}
              onClick={() => handleToggle(item)}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${item.completed
                  ? 'bg-accent border-accent'
                  : 'border-muted-foreground'
                  }`}
              />
              <span className={`min-w-[50px] px-2 py-0.5 rounded-lg text-[10px] font-bold text-center shrink-0 uppercase tracking-tight ${item.type === 'assignment'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                {item.type === 'assignment' ? '과제' : item.subject || '일반'}
              </span>
              <span className={`text-sm font-medium flex-1 truncate ${item.completed ? 'text-gray-500 line-through' : 'text-white/90'}`}>
                {item.content}
              </span>
              {!isReadOnly && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-destructive transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm italic">
            등록된 계획이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
