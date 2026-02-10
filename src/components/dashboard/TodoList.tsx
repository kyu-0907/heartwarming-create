import { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TodoListProps {
  menteeId: string;
  isReadOnly?: boolean;
}

const TodoList = ({ menteeId, isReadOnly = false }: TodoListProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!menteeId) return;
    setLoading(true);
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');

      // 1. Fetch Assignments
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .eq('mentee_id', menteeId)
        .lte('start_date', todayStr)
        .gte('end_date', todayStr)
        .order('end_date', { ascending: true });

      if (assignError) throw assignError;

      // 2. Fetch Todos
      const { data: todos, error: todoError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', menteeId)
        .eq('target_date', todayStr)
        .order('created_at', { ascending: true });

      if (todoError) throw todoError;

      const formattedAssigns = (assignments || []).map(a => ({
        id: a.id,
        type: 'assignment',
        subject: a.subject,
        task: a.title,
        completed: a.is_completed
      }));

      const formattedTodos = (todos || []).map(t => ({
        id: t.id,
        type: 'todo',
        subject: t.subject,
        task: t.content,
        completed: t.completed
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
  }, [menteeId]);

  const handleToggle = async (item: any) => {
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
      // Triggers a refresh on progress card if they were in the same component, but they are separate.
      // We could use a global refresh event.
      window.dispatchEvent(new CustomEvent('refresh-stats'));
    } catch (error) {
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
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
      <h2 className="text-accent font-bold mb-4">TO DO LIST</h2>

      <div className="space-y-3 flex-1">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-accent" /></div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={`${item.type}-${item.id}`} className={`flex items-center gap-3 group ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <div
                onClick={() => !isReadOnly && handleToggle(item)}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-colors shrink-0 ${item.completed
                  ? 'bg-accent border-accent'
                  : 'border-muted-foreground'
                  } ${!isReadOnly ? 'hover:border-accent' : ''}`}
              />
              <span className={`min-w-[50px] w-14 px-2 py-0.5 rounded-lg text-[10px] font-bold text-center shrink-0 uppercase tracking-tight ${item.type === 'assignment' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-accent/20 text-accent border border-accent/30'}`}>
                {item.type === 'assignment' ? '과제' : item.subject || '일반'}
              </span>
              <span className={`text-xs md:text-sm flex-1 truncate ${item.completed ? 'text-gray-500 line-through' : 'text-white/90'}`}>
                {item.task}
              </span>
              {!isReadOnly && (
                <button
                  onClick={() => handleDelete(item)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-destructive transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground text-xs italic">
            등록된 계획이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
