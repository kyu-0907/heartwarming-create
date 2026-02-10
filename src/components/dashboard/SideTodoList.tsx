import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SideTodoItem {
  id: string;
  content: string;
  completed: boolean;
  type?: 'personal' | 'assignment';
}

interface SideTodoListProps {
  selectedDate: Date;
  menteeId?: string;
}

const SideTodoList = ({ selectedDate, menteeId }: SideTodoListProps) => {
  const [todos, setTodos] = useState<SideTodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mentorName = user.nickname || '나';
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // If menteeId is provided (from MenteeDetail page), we use that as the target user
      const targetUserId = menteeId || currentUser.id;

      // 1. Fetch Personal Todos for selected user (if it's a mentee's view or we are looking at a specific mentee)
      let personalTodos: SideTodoItem[] = [];
      const isMentorMonitoringSelf = !menteeId && currentUser.role === 'mentor';

      if (!isMentorMonitoringSelf) {
        const { data: personalData, error: personalError } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_date', selectedDateStr)
          .order('created_at', { ascending: false });

        if (personalError) throw personalError;
        personalTodos = (personalData || []).map(t => ({
          ...t,
          type: 'personal'
        }));
      }

      // 2. Fetch Assignments
      let assignmentData: any[] = [];
      if (menteeId) {
        // We are viewing a specific mentee, show their assignments
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('mentee_id', menteeId);
        if (error) throw error;
        assignmentData = data || [];
      } else {
        // Global view: if mentor, show all they manage. if mentee, show their own.
        const query = supabase.from('assignments').select('*');
        if (currentUser.role === 'mentor') {
          query.eq('mentor_id', currentUser.id);
        } else {
          query.eq('mentee_id', currentUser.id);
        }
        const { data, error } = await query;
        if (error) throw error;
        assignmentData = data || [];
      }

      // 3. Fetch mentee nicknames manually
      const menteeIds = Array.from(new Set((assignmentData || []).map((a: any) => a.mentee_id)));
      let menteeMap: Record<string, string> = {};

      if (menteeIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nickname')
          .in('id', menteeIds);

        (profiles || []).forEach((p: any) => {
          menteeMap[p.id] = p.nickname;
        });
      }

      console.log('Selected Date (Str):', selectedDateStr);
      console.log('Assignments (Raw):', assignmentData);

      const assignmentDataFiltered = (assignmentData || []).filter((a: any) => {
        const isValid = a.start_date <= selectedDateStr && a.end_date >= selectedDateStr;
        console.log(`Checking: ${a.title} (${a.start_date} ~ ${a.end_date}) vs ${selectedDateStr} => ${isValid}`);
        return isValid;
      });

      const assignmentTodos: SideTodoItem[] = assignmentDataFiltered.map((a: any) => {
        const isEndDate = a.end_date === selectedDateStr;
        const menteeName = menteeMap[a.mentee_id] || '멘티';
        let content = '';

        if (isEndDate) {
          content = `${menteeName}의 ${a.title} 과제 검사 및 피드백`;
        } else {
          content = `${menteeName}의 ${a.title} 과제 모니터링`;
        }

        return {
          id: `assignment-${a.id}`, // Virtual ID
          content: content,
          completed: false,
          type: 'assignment'
        };
      });

      // Combine lists
      setTodos([...personalTodos, ...assignmentTodos]);

    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [selectedDateStr]);

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
          completed: false,
          target_date: selectedDateStr // Save with selected date
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

  const handleToggleTodo = async (id: string, currentCompleted: boolean, type?: string) => {
    if (type === 'assignment' || menteeId) return;

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
    e.stopPropagation();
    if (menteeId) return;
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
          <span className="text-primary font-extrabold">{format(selectedDate, 'M.d(eee)', { locale: ko })}</span> 일정
        </h3>
        {(!menteeId && user.role !== 'mentor') && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-muted rounded-lg transition-colors border border-border"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
        {(!menteeId && isAdding) && (
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
          <div className="text-center text-xs text-muted-foreground py-4">등록된 일정이 없습니다.</div>
        ) : (
          todos.map((item) => (
            <div
              key={item.id}
              className={`w-full bg-[#1e2329] p-4 rounded-xl flex items-center justify-between mb-2 transition-colors hover:bg-[#252b33] ${menteeId ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleToggleTodo(item.id, item.completed, item.type)}
            >
              <span className={`text-sm font-medium truncate select-none flex-1 mr-4 ${item.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                {item.content}
              </span>

              <div className="flex items-center gap-2">
                {(item.type === 'personal' && !menteeId) && (
                  <button
                    onClick={(e) => handleDeleteTodo(e, item.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200 ${item.type === 'assignment'
                    ? 'bg-[#2dd4bf]' // 과제는 항상 청록색 점
                    : item.completed
                      ? 'bg-[#2dd4bf]' // 완료됨
                      : 'border-2 border-gray-500 bg-transparent' // 미완료
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
