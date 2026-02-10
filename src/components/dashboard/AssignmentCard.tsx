import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Loader2, Download } from 'lucide-react';

interface Assignment {
  id: string;
  subject: string;
  title: string;
  file_url: string | null;
  start_date: string;
  end_date: string;
}

interface AssignmentCardProps {
  menteeId?: string;
}

const AssignmentCard = ({ menteeId }: AssignmentCardProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menteeId) {
      const fetchAssignments = async () => {
        setLoading(true);
        try {
          // Fetch assignments for today
          const today = format(new Date(), 'yyyy-MM-dd');

          const { data, error } = await supabase
            .from('assignments')
            .select('id, subject, title, file_url, start_date, end_date')
            .eq('mentee_id', menteeId)
            .eq('mentee_id', menteeId)
            // Show all assignments that are not expired (end_date >= today)
            // This includes future assignments (start_date > today)
            .gte('end_date', today)
            .order('end_date', { ascending: true });

          if (error) throw error;
          setAssignments(data || []);
        } catch (error) {
          console.error('Error fetching assignments:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAssignments();
    }
  }, [menteeId]);


  return (
    <div className="card-glass p-4 h-full">
      <h3 className="text-accent font-bold mb-4">과제</h3>

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-primary w-5 h-5" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-muted-foreground text-sm text-center py-4">등록된 과제가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border/10 shadow-sm"
              >
                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{assignment.subject}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {assignment.start_date} ~ {assignment.end_date}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{assignment.title}</span>
                </div>
                {assignment.file_url ? (
                  <a
                    href={assignment.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors p-2 bg-primary/10 rounded-lg"
                    title="자료실 다운로드"
                  >
                    <Download size={16} />
                  </a>
                ) : (
                  <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-1 rounded">파일 없음</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
