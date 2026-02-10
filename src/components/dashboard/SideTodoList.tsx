import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SideTodoItem {
  id: string;
  content: string;
  completed: boolean;
}

const SideTodoList = () => {
  const [todos, setTodos] = useState<SideTodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mentorName = user.nickname || '나';

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newTodoContent.trim()) {
        setIsAdding(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('todos').insert({
          user_id: user.id,
          content: newTodoContent,
          completed: false
        });

        if (error) throw error;

        toast.success('할 일이 추가되었습니다.');
        setNewTodoContent('');
        setIsAdding(false);
        fetchTodos();
      } catch (error) {
        console.error('Error adding todo:', error);
        toast.error('할 일 추가 실패');
      }
    }
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !currentCompleted })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !currentCompleted } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('상태 변경 실패');
    }
  };

  const handleDeleteTodo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 부모 클릭 방지
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setTodos(todos.filter(todo => todo.id !== id));
      toast.success('삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('삭제 실패');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-sm md:text-base flex items-center gap-1">
          <span className="text-primary font-extrabold">{mentorName} 멘토</span>의 TO DO LIST
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-muted rounded-lg transition-colors border border-border"
        >
          <Plus size={14} className="md:w-4 md:h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
        {isAdding && (
          <div className="card-dark p-2 rounded-xl mb-2">
            <Input
              autoFocus
              placeholder="할 일을 입력하세요..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyDown={handleAddTodo}
              onBlur={() => {
                if (!newTodoContent.trim()) setIsAdding(false);
              }}
              className="h-8 text-sm bg-transparent border-none text-white placeholder:text-gray-400 focus-visible:ring-0 px-2"
            />
          </div>
        )}

        {loading && todos.length === 0 ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-primary w-5 h-5" />
          </div>
        ) : todos.length === 0 && !isAdding ? (
          <div className="text-center text-xs text-muted-foreground py-4">등록된 할 일이 없습니다.</div>
        ) : (
          todos.map((item) => (
            <div
              key={item.id}
              className="card-dark p-2.5 md:p-3 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-black/60 transition-colors"
              onClick={() => handleToggleTodo(item.id, item.completed)}
            >
              <span className="text-xs md:text-sm truncate select-none flex-1 mr-2 text-white">
                {item.content}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDeleteTodo(e, item.id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 size={14} />
                </button>
                <div
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 shrink-0 transition-colors duration-200 ${item.completed
                    ? 'bg-accent border-accent'
                    : 'border-muted-foreground group-hover:border-accent/50'
                    }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SideTodoList;
