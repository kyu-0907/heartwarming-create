import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface ProgressCardProps {
  menteeId: string;
  date?: Date;
}

const ProgressCard = ({ menteeId, date = new Date() }: ProgressCardProps) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ completed: 0, total: 0 });

  const fetchProgress = async () => {
    if (!menteeId) return;
    setLoading(true);
    try {
      const todayStr = format(date, 'yyyy-MM-dd');

      const { data: assignments } = await supabase
        .from('assignments')
        .select('is_completed')
        .eq('mentee_id', menteeId)
        .lte('start_date', todayStr)
        .gte('end_date', todayStr)
        .order('end_date', { ascending: true })
        .limit(2);

      // 2. Fetch todos for today
      const { data: todos } = await supabase
        .from('todos')
        .select('completed')
        .eq('user_id', menteeId)
        .eq('target_date', todayStr);

      const allItems = [
        ...(assignments || []).map(a => ({ completed: !!a.is_completed })),
        ...(todos || []).map(t => ({ completed: !!t.completed }))
      ];

      const completedCount = allItems.filter(i => i.completed).length;
      setStats({
        completed: completedCount,
        total: allItems.length
      });
    } catch (error) {
      console.error('Error fetching progress for mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();

    const handleRefresh = () => fetchProgress();
    window.addEventListener('refresh-stats', handleRefresh);
    window.addEventListener('refresh-todos', handleRefresh);
    return () => {
      window.removeEventListener('refresh-stats', handleRefresh);
      window.removeEventListener('refresh-todos', handleRefresh);
    };
  }, [menteeId, date]);

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="card-glass p-4 min-h-[100px] flex flex-col justify-center">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">계획 이행률</span>
        {loading ? (
          <span className="text-xs text-muted-foreground animate-pulse">불러오는 중...</span>
        ) : (
          <span className="text-sm text-muted-foreground">{stats.completed}/{stats.total}개 완료</span>
        )}
        <span className="text-lg font-bold text-primary">{progress}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;
