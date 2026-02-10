import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import {
    ClipboardCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    MessageSquare,
    ChevronRight,
    Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface MenteeAssignmentMonitorProps {
    menteeId?: string;
    selectedDate: Date;
}

const MenteeAssignmentMonitor = ({ menteeId, selectedDate }: MenteeAssignmentMonitorProps) => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [verifications, setVerifications] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Fetch Assignments
                let assignQuery = supabase.from('assignments').select('*');
                if (menteeId) {
                    assignQuery = assignQuery.eq('mentee_id', menteeId);
                } else if (user.role === 'mentor') {
                    assignQuery = assignQuery.eq('mentor_id', user.id);
                }
                const { data: assignData } = await assignQuery;

                // 2. Fetch Verifications
                const { data: verifData } = await supabase
                    .from('assignment_verifications')
                    .select('assignment_id, created_at');

                // 3. Fetch Feedbacks (to see if feedback is already provided)
                const { data: feedbackData } = await supabase
                    .from('feedback')
                    .select('assignment_id, id');

                setAssignments(assignData || []);
                setVerifications(verifData || []);
                setFeedbacks(feedbackData || []);

            } catch (error) {
                console.error('Error fetching monitor data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [menteeId, selectedDateStr]);

    // Filter assignments active on selected date
    const activeAssignments = assignments.filter(a => {
        return a.start_date <= selectedDateStr && a.end_date >= selectedDateStr;
    });

    const getStatus = (assignmentId: string) => {
        const hasVerification = verifications.some(v => v.assignment_id === assignmentId);
        const hasFeedback = feedbacks.some(f => f.assignment_id === assignmentId);

        if (hasFeedback) return { label: '완료', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
        if (hasVerification) return { label: '인증됨', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ClipboardCheck };
        return { label: '진행 중', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock };
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Clock className="w-6 h-6 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-sm text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                    <ClipboardCheck size={14} />
                    Assignment Monitor
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20">
                    {format(selectedDate, 'MM.dd')}
                </Badge>
            </div>

            <div className="space-y-3">
                {activeAssignments.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-muted/30 rounded-[2rem] border border-dashed border-border/50">
                        <AlertCircle className="text-muted-foreground/30 mb-2" size={24} />
                        <p className="text-xs text-muted-foreground">선택한 날짜에<br />진행 중인 과제가 없습니다.</p>
                    </div>
                ) : (
                    activeAssignments.map((assignment) => {
                        const status = getStatus(assignment.id);
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={assignment.id}
                                className="group bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                                onClick={() => navigate('/learning')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${assignment.subject === '국어' ? 'bg-rose-50' : assignment.subject === '영어' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                                            <span className={`text-[10px] font-bold ${assignment.subject === '국어' ? 'text-rose-500' : assignment.subject === '영어' ? 'text-blue-500' : 'text-amber-500'}`}>
                                                {assignment.subject[0]}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{assignment.subject}</span>
                                            <h4 className="text-sm font-bold text-foreground truncate max-w-[120px]">{assignment.title}</h4>
                                        </div>
                                    </div>
                                    <Badge className={`${status.color} border-none shadow-none text-[10px] px-2 py-0.5 font-bold`}>
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Clock size={10} />
                                        <span>{assignment.start_date} ~ {assignment.end_date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {status.label === '인증됨' && (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-bounce shadow-lg shadow-blue-500/30">
                                                <MessageSquare size={10} className="text-white" />
                                            </div>
                                        )}
                                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Quick Summary Card */}
            {activeAssignments.length > 0 && (
                <div className="mt-2 bg-primary/5 rounded-2xl p-4 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">Monitoring Tips</p>
                    <p className="text-xs text-primary/70 leading-relaxed">
                        파란색 <span className="font-bold text-primary">인증됨</span> 배지가 뜬 과제는 학생이 공부 인증을 완료한 상태입니다. 지금 바로 피드백을 남겨주세요!
                    </p>
                </div>
            )}
        </div>
    );
};

export default MenteeAssignmentMonitor;
