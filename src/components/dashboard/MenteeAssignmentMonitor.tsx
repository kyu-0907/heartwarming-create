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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

    const getMenteeImage = (nickname: string) => {
        if (nickname === '멘티2') return '/images/avatar_female.png';
        return '/images/avatar_male.png';
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Check user role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const isMentor = profile?.role === 'mentor';

                // 2. Fetch Assignments
                let assignQuery = supabase.from('assignments').select('*');

                if (isMentor) {
                    // If mentor, fetch assignments created by me (assuming mentor_id is user.id)
                    // OR fetch all assignments for mentees I manage. 
                    // Based on schema, assignments usually link to mentor_id.
                    assignQuery = assignQuery.eq('mentor_id', user.id);
                } else {
                    // If mentee, fetch my assignments
                    assignQuery = assignQuery.eq('mentee_id', user.id);
                }

                const { data: assignData, error: assignError } = await assignQuery;
                if (assignError) throw assignError;

                let assignmentsWithProfiles = assignData || [];

                // 3. Manually fetch and map profiles to get mentee nicknames
                if (assignmentsWithProfiles.length > 0) {
                    const menteeIds = Array.from(new Set(assignmentsWithProfiles.map((a: any) => a.mentee_id)));
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, nickname')
                        .in('id', menteeIds);

                    if (profiles) {
                        const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
                        assignmentsWithProfiles = assignmentsWithProfiles.map((a: any) => ({
                            ...a,
                            profiles: profileMap.get(a.mentee_id) || { nickname: '알 수 없음' }
                        }));
                    }
                }

                // 4. Fetch Verifications
                const { data: verifData } = await supabase
                    .from('assignment_verifications')
                    .select('assignment_id, created_at');

                // 5. Fetch Feedbacks
                const { data: feedbackData } = await supabase
                    .from('feedback')
                    .select('assignment_id, id');

                setAssignments(assignmentsWithProfiles);
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
                                onClick={() => navigate('/learning', {
                                    state: {
                                        targetMenteeId: assignment.mentee_id,
                                        targetAssignmentId: assignment.id,
                                        targetDate: assignment.end_date
                                    }
                                })}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 border border-border shadow-sm">
                                            <AvatarImage src={getMenteeImage(assignment.profiles?.nickname)} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                {assignment.profiles?.nickname ? assignment.profiles.nickname[0] : '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-extrabold text-foreground tracking-tight">
                                                    {assignment.profiles?.nickname || '알 수 없음'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${assignment.subject === '국어' ? 'bg-rose-100 text-rose-600' : assignment.subject === '영어' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {assignment.subject}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-medium text-muted-foreground truncate max-w-[140px]">{assignment.title}</h4>
                                        </div>
                                    </div>
                                    <Badge className={`${status.color} border-none shadow-none text-[10px] px-2 py-0.5 font-bold shrink-0`}>
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
