import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';

interface StudyTimeCardProps {
  menteeId?: string;
}

const StudyTimeCard = ({ menteeId }: StudyTimeCardProps) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [chartData, setChartData] = useState<number[]>(Array(10).fill(0)); // Last 10 days
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menteeId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const today = new Date();
          const todayStr = format(today, 'yyyy-MM-dd');
          const tenDaysAgoStr = format(subDays(today, 9), 'yyyy-MM-dd'); // 10 days range including today

          // Fetch sessions for last 10 days
          const { data, error } = await supabase
            .from('study_sessions')
            .select('study_date, duration')
            .eq('user_id', menteeId)
            .gte('study_date', tenDaysAgoStr)
            .lte('study_date', todayStr);

          if (error) throw error;

          // Aggregates
          let todayTotal = 0;
          const dailyMap: Record<string, number> = {};

          // Initialize map
          for (let i = 0; i < 10; i++) {
            const d = format(subDays(today, 9 - i), 'yyyy-MM-dd');
            dailyMap[d] = 0;
          }

          (data || []).forEach((row: any) => {
            if (dailyMap[row.study_date] !== undefined) {
              dailyMap[row.study_date] += row.duration;
            }
            if (row.study_date === todayStr) {
              todayTotal += row.duration;
            }
          });

          setTotalSeconds(todayTotal);
          setChartData(Object.values(dailyMap)); // Ordered by date

        } catch (error) {
          console.error('Error fetching study time:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [menteeId]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const maxValue = Math.max(...chartData, 1); // Avoid div by zero

  return (
    <div className="card-lavender h-full flex flex-col justify-between">
      <span className="text-sm font-medium text-lavender-dark mb-2 block">공부시간</span>

      <div className="flex items-end gap-3 md:gap-4 flex-1">
        <span className="text-3xl md:text-4xl font-bold text-lavender-dark shrink-0">
          {hours}h{minutes.toString().padStart(2, '0')}m
        </span>

        {/* Chart */}
        <div className="flex items-end gap-1 h-12 flex-1 pb-1">
          {chartData.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-lavender-dark/30 rounded-t min-w-[4px]"
              style={{ height: `${Math.min((value / maxValue) * 100, 100)}%` }}
              title={`${Math.floor(value / 60)}m`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyTimeCard;
