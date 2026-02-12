import { useState, useEffect } from 'react';
import { ChevronRight, Save, ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Mentee {
    id: string;
    nickname: string;
    grade?: string;
}

interface Assignment {
    id: string;
    title: string;
    subject: string;
    start_date: string;
    end_date: string;
}

// Mock Interface for Todo (since no real table yet)
interface TodoItem {
    id: number;
    date: string;
    title: string;
    isDone: boolean;
}

const LearningFeedback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [date, setDate] = useState<Date>(new Date()); // Selected Date for Feedback
    const [calendarDate, setCalendarDate] = useState<Date>(new Date()); // Viewing Month

    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [selectedMenteeId, setSelectedMenteeId] = useState<string>('');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    const [generalComment, setGeneralComment] = useState('');

    // Feedback State
    const [subjects, setSubjects] = useState([
        { name: '국어', color: 'bg-rose-100 text-rose-700', border: 'border-rose-200', summary: '', detail: '', is_important: false },
        { name: '영어', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', summary: '', detail: '', is_important: false },
        { name: '수학', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200', summary: '', detail: '', is_important: false },
        { name: '탐구', color: 'bg-green-100 text-green-700', border: 'border-green-200', summary: '', detail: '', is_important: false },
    ]);

    const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>(null);

    // Initial load from navigation state
    useEffect(() => {
        if (location.state) {
            const { targetMenteeId, targetDate } = location.state;
            if (targetMenteeId) setSelectedMenteeId(targetMenteeId);
            if (targetDate) {
                const dateObj = new Date(targetDate);
                setDate(dateObj);
                setCalendarDate(dateObj);
            }
        }
    }, [location.state]);

    // Fetch Mentees
    useEffect(() => {
        const fetchMentees = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, nickname')
                .eq('role', 'mentee');

            if (error) {
                console.error('Error fetching mentees:', error);
                toast.error('학생 목록을 불러오는데 실패했습니다.');
                return;
            }

            if (data && data.length > 0) {
                setMentees(data);
                setSelectedMenteeId(data[0].id);
            }
        };
        fetchMentees();
    }, []);

    const [verifications, setVerifications] = useState<any[]>([]);

    // Fetch Data for selected mentee and date
    useEffect(() => {
        if (!selectedMenteeId) return;

        const fetchData = async () => {
            // Load Assignments
            const { data: assignmentData } = await supabase
                .from('assignments')
                .select('*')
                .eq('mentee_id', selectedMenteeId);

            setAssignments(assignmentData || []);

            // Load Verifications
            const { data: verificationData } = await supabase
                .from('assignment_verifications')
                .select('*')
                .eq('mentee_id', selectedMenteeId);

            setVerifications(verificationData || []);

            // Load Existing Feedback for this date
            const formattedDate = format(date, 'yyyy-MM-dd');
            const { data: existingFeedback } = await supabase
                .from('feedback')
                .select('id, general_comment, assignment_id')
                .eq('mentee_id', selectedMenteeId)
                .eq('feedback_date', formattedDate)
                .maybeSingle();

            if (existingFeedback) {
                setGeneralComment(existingFeedback.general_comment || '');
                if (existingFeedback.assignment_id) {
                    setSelectedAssignmentId(existingFeedback.assignment_id);
                }

                // Load Details
                const { data: detailData } = await supabase
                    .from('feedback_details')
                    .select('*')
                    .eq('feedback_id', existingFeedback.id);

                if (detailData) {
                    setSubjects(prev => prev.map(s => {
                        const detail = detailData.find((d: any) => d.subject === s.name);
                        return detail ? {
                            ...s,
                            summary: detail.summary || '',
                            detail: detail.detail || '',
                            is_important: detail.is_important || false
                        } : { ...s, summary: '', detail: '', is_important: false };
                    }));
                }
            } else {
                setGeneralComment('');
                // If no feedback in DB, we keep the locally selected assignment id (if any)
                // so that mentors can create new feedback for a specific assignment.
                setSubjects(prev => prev.map(s => ({ ...s, summary: '', detail: '', is_important: false })));
            }
        };

        fetchData();
    }, [selectedMenteeId, date]);

    const isAssignmentVerified = (assignmentId: string) => {
        return verifications.some(v => v.assignment_id === assignmentId);
    };

    const getVerificationForAssignment = (assignmentId: string) => {
        return verifications.find(v => v.assignment_id === assignmentId);
    };

    // Reset assignment selection when mentee changes
    useEffect(() => {
        setSelectedAssignmentId(null);
    }, [selectedMenteeId]);

    const handleDeleteAssignment = async () => {
        if (!selectedAssignmentId) return;

        const assignmentToDelete = assignments.find(a => a.id === selectedAssignmentId);

        try {
            const { error } = await supabase.from('assignments').delete().eq('id', selectedAssignmentId);
            if (error) throw error;

            toast.success(`'${assignmentToDelete?.title}' 과제가 삭제되었습니다.`);
            setAssignments(prev => prev.filter(a => a.id !== selectedAssignmentId));
            setSelectedAssignmentId(null);
        } catch (error) {
            console.error('Error deleting assignment:', error);
            toast.error('과제 삭제 중 오류가 발생했습니다.');
        }
    };


    const handleSave = async () => {
        if (!selectedMenteeId) {
            toast.error('학생을 먼저 선택해주세요.');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            const formattedDate = format(date, 'yyyy-MM-dd');

            // 1. Upsert Main Feedback
            const { data: existingFeedback } = await supabase
                .from('feedback')
                .select('id')
                .eq('mentee_id', selectedMenteeId)
                .eq('feedback_date', formattedDate)
                .maybeSingle();

            let feedbackId = existingFeedback?.id;

            if (feedbackId) {
                const { error: updateError } = await supabase
                    .from('feedback')
                    .update({
                        general_comment: generalComment,
                        assignment_id: selectedAssignmentId,
                        mentor_id: user.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', feedbackId);

                if (updateError) throw updateError;
            } else {
                const { data: newFeedback, error: insertError } = await supabase
                    .from('feedback')
                    .insert({
                        mentee_id: selectedMenteeId,
                        mentor_id: user.id,
                        feedback_date: formattedDate,
                        general_comment: generalComment,
                        assignment_id: selectedAssignmentId
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                feedbackId = newFeedback.id;
            }

            // 2. Handle Details
            const { error: deleteError } = await supabase
                .from('feedback_details')
                .delete()
                .eq('feedback_id', feedbackId);

            if (deleteError) throw deleteError;

            const detailsToInsert = subjects
                .filter(s => s.summary.trim() !== '' || s.detail.trim() !== '')
                .map(s => ({
                    feedback_id: feedbackId,
                    subject: s.name,
                    summary: s.summary,
                    detail: s.detail,
                    is_important: s.is_important
                }));

            if (detailsToInsert.length > 0) {
                const { error: detailsError } = await supabase
                    .from('feedback_details')
                    .insert(detailsToInsert);

                if (detailsError) throw detailsError;
            }

            toast.success('피드백이 저장되었습니다.');

            // Send Notification
            if (selectedMenteeId) {
                const currentAssignment = assignments.find(a => a.id === selectedAssignmentId);
                const notifContent = currentAssignment
                    ? `[피드백] '${currentAssignment.title}' 과제에 대한 멘토의 피드백이 도착했습니다.`
                    : `[피드백] ${format(date, 'M월 d일')} 학습에 대한 멘토의 피드백이 도착했습니다.`;

                await supabase.from('notifications').insert({
                    user_id: selectedMenteeId,
                    type: 'feedback',
                    content: notifContent,
                    is_read: false
                });
            }

        } catch (error) {
            console.error('Error saving feedback:', error);
            toast.error('피드백 저장 중 오류가 발생했습니다.');
        }
    };

    const updateSubjectFeedback = (name: string, field: 'summary' | 'detail', value: string) => {
        setSubjects(prev => prev.map(s => s.name === name ? { ...s, [field]: value } : s));
        if (selectedSubject && selectedSubject.name === name) {
            setSelectedSubject(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const toggleImportant = (name: string) => {
        setSubjects(prev => prev.map(s => s.name === name ? { ...s, is_important: !s.is_important } : s));
        if (selectedSubject && selectedSubject.name === name) {
            setSelectedSubject(prev => prev ? { ...prev, is_important: !prev.is_important } : null);
        }
    };

    // Calendar Generation
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Calendar Handlers
    const prevMonth = () => setCalendarDate(subMonths(calendarDate, 1));
    const nextMonth = () => setCalendarDate(addMonths(calendarDate, 1));

    const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

    return (
        <div className="w-full h-full min-h-screen bg-[#f0f4ff]/50 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-white/50">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-900">학습 및 피드백</h1>
                    <p className="text-sm text-gray-500">학생별 학습 현황을 확인하고 피드백을 작성하세요</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Learning Calendar */}
                <div className="xl:col-span-7 space-y-6">
                    {/* Controls Card */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-lg bg-white flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                        <div className="w-full md:w-1/2 space-y-2">
                            <label className="text-sm font-bold text-gray-600 ml-1">학생 선택</label>
                            <Select value={selectedMenteeId} onValueChange={setSelectedMenteeId}>
                                <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="학생을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mentees.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.nickname}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" onClick={() => setDate(new Date())} className="h-12 rounded-xl border-gray-200">
                                오늘로 이동
                            </Button>
                        </div>
                    </Card>

                    {/* Monthly Calendar Card */}
                    <Card className="p-6 rounded-[2rem] border-none shadow-lg bg-white min-h-[600px] flex flex-col">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                <span className="text-blue-500">📅</span> 학습 계획표
                            </h3>
                            <div className="flex items-center gap-4 bg-gray-50 rounded-full px-4 py-1">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-white rounded-full w-8 h-8">
                                    <ChevronLeft size={20} />
                                </Button>
                                <span className="font-outfit font-bold text-lg text-gray-700 min-w-[100px] text-center">
                                    {format(calendarDate, 'yyyy. MM')}
                                </span>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-white rounded-full w-8 h-8">
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 border border-gray-100 rounded-2xl overflow-hidden relative">
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                                    <div key={d} className={`text-center py-3 text-sm font-bold ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid (Week Rows) */}
                            <div className="flex flex-col bg-white h-full overflow-y-auto">
                                {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => {
                                    const weekDays = calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7);
                                    const weekStart = weekDays[0];
                                    const weekEnd = weekDays[6];

                                    // Filter assignments for this week
                                    const weekAssignments = assignments.filter(a => {
                                        const start = new Date(a.start_date);
                                        const end = new Date(a.end_date);
                                        return (start <= weekEnd && end >= weekStart);
                                    });

                                    weekAssignments.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

                                    return (
                                        <div key={weekIdx} className="relative min-h-[100px] border-b border-gray-100 group">
                                            {/* Background Layer (Dates & Clicks) */}
                                            <div className="grid grid-cols-7 absolute inset-0 z-0 h-full">
                                                {weekDays.map((day, dayIdx) => {
                                                    const isSelected = isSameDay(day, date);
                                                    const isCurrentMonth = isSameMonth(day, calendarDate);
                                                    const isToday = isSameDay(day, new Date());

                                                    return (
                                                        <div
                                                            key={dayIdx}
                                                            onClick={() => {
                                                                setDate(day);
                                                                setSelectedAssignmentId(null); // Clear assignment when clicking empty date
                                                            }}
                                                            className={`
                                                                 border-r border-gray-50 p-1 cursor-pointer transition-colors relative
                                                                 ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'bg-white text-gray-700'}
                                                                 ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}
                                                             `}
                                                        >
                                                            <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                                                 ${isToday ? 'bg-blue-500 text-white' : ''}
                                                                 ${isSelected && !isToday ? 'bg-blue-200 text-blue-700' : ''}
                                                             `}>
                                                                {format(day, 'd')}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Events Layer (Overlaid Grid) */}
                                            <div className="relative z-10 grid grid-cols-7 gap-y-1 px-0 pt-8 pb-2 pointer-events-none w-full">
                                                {weekAssignments.map(assignment => {
                                                    const aStart = new Date(assignment.start_date);
                                                    const aEnd = new Date(assignment.end_date);
                                                    const effectiveStart = aStart < weekStart ? weekStart : aStart;
                                                    const effectiveEnd = aEnd > weekEnd ? weekEnd : aEnd;
                                                    const startCol = effectiveStart.getDay();
                                                    const endCol = effectiveEnd.getDay();
                                                    const gridStart = startCol + 1;
                                                    const gridEnd = endCol + 2;
                                                    const isContinuesFromPrev = aStart < weekStart;
                                                    const isContinuesToNext = aEnd > weekEnd;

                                                    let colorClass = '';
                                                    switch (assignment.subject) {
                                                        case '국어': colorClass = 'bg-rose-300 text-rose-900 border-rose-400 hover:bg-rose-400'; break;
                                                        case '영어': colorClass = 'bg-blue-300 text-blue-900 border-blue-400 hover:bg-blue-400'; break;
                                                        case '수학': colorClass = 'bg-amber-300 text-amber-900 border-amber-400 hover:bg-amber-400'; break;
                                                        case '탐구': colorClass = 'bg-emerald-300 text-emerald-900 border-emerald-400 hover:bg-emerald-400'; break;
                                                        default: colorClass = 'bg-slate-300 text-slate-900 border-slate-400 hover:bg-slate-400';
                                                    }

                                                    const isVerified = isAssignmentVerified(assignment.id);

                                                    return (
                                                        <div
                                                            key={`${assignment.id}-${weekIdx}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAssignmentId(assignment.id);
                                                                // Also set date if it's within range and not already selected
                                                                const aEndDate = new Date(assignment.end_date);
                                                                if (!isWithinInterval(date, { start: new Date(assignment.start_date), end: aEndDate })) {
                                                                    setDate(aEndDate > new Date() ? new Date() : aEndDate);
                                                                }

                                                                if (!isVerified) {
                                                                    toast.warning('공부 인증이 완료되지 않은 과제입니다.');
                                                                } else {
                                                                    toast.success(`'${assignment.title}' 인증 확인 완료`);
                                                                }
                                                            }}
                                                            className={`
                                                                 pointer-events-auto cursor-pointer transition-transform hover:scale-[1.02] active:scale-95
                                                                 h-6 flex items-center px-2 mx-1 shadow-sm text-[11px] font-bold truncate border
                                                                 ${colorClass}
                                                                 ${selectedAssignmentId === assignment.id ? 'ring-2 ring-purple-500 ring-offset-1' : ''}
                                                                 ${isContinuesFromPrev ? 'rounded-l-none border-l-0 ml-0' : 'rounded-l-md'}
                                                                 ${isContinuesToNext ? 'rounded-r-none border-r-0 mr-0' : 'rounded-r-md'}
                                                                 ${!isVerified ? 'opacity-50 grayscale-[0.3]' : ''}
                                                             `}
                                                            style={{
                                                                gridColumnStart: gridStart,
                                                                gridColumnEnd: gridEnd
                                                            }}
                                                            title={`${assignment.title}${!isVerified ? ' (미인증)' : ' (인증완료)'}`}
                                                        >
                                                            <div className="w-full flex items-center justify-center gap-1">
                                                                {isVerified && <CheckCircle2 size={10} className="shrink-0" />}
                                                                <span className="truncate">{assignment.title}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Feedback Form */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 shadow-lg sticky top-8">
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold font-outfit text-purple-600">FEEDBACK INPUT</h2>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-1">
                                    {format(date, 'yyyy.MM.dd')}
                                </Badge>
                            </div>
                            <p className="text-sm font-bold text-gray-700">
                                <span className="text-purple-500">{mentees.find(m => m.id === selectedMenteeId)?.nickname}</span> 님의 학습 피드백
                            </p>
                        </div>

                        {selectedAssignment && (
                            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-200 rounded-xl text-purple-600">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-purple-400 uppercase leading-none mb-1">Target Assignment</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedAssignment.title}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedAssignmentId(null)}
                                    className="text-gray-400 hover:text-gray-600 font-bold text-xs"
                                >
                                    해제
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 font-bold text-xs"
                                        >
                                            삭제
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>과제 삭제</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                정말 '{selectedAssignment.title}' 과제를 삭제하시겠습니까?<br />
                                                삭제된 과제는 복구할 수 없습니다.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>취소</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-red-500 hover:bg-red-600 text-white">
                                                삭제
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}

                        <div className="space-y-4">
                            {!selectedAssignment ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <Target className="text-gray-300" size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400">학습 계획표에서 과제를 선택하고<br />피드백을 작성해주세요</p>
                                </div>
                            ) : (
                                <>
                                    {/* Verification Check */}
                                    {(() => {
                                        const verification = getVerificationForAssignment(selectedAssignment.id);
                                        const isVerified = !!verification;

                                        if (!isVerified) {
                                            return (
                                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
                                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                                                        <Clock className="text-amber-600" size={20} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-amber-800">공부 인증 대기 중</p>
                                                        <p className="text-xs text-amber-600 leading-relaxed">
                                                            학생이 해당 과제에 대한 공부 인증을<br />
                                                            완료한 후에 피드백을 작성할 수 있습니다.
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // If verified, show verification content and feedback cards
                                        const subj = subjects.find(s => s.name === selectedAssignment.subject) || {
                                            name: selectedAssignment.subject,
                                            color: 'bg-gray-100 text-gray-700',
                                            border: 'border-gray-200',
                                            summary: '',
                                            detail: '',
                                            is_important: false
                                        };

                                        return (
                                            <div className="space-y-6">
                                                {/* Verification Content Preview */}
                                                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Student Verification</span>
                                                        <Badge className="bg-blue-500 text-white border-none text-[10px]">인증 완료</Badge>
                                                    </div>
                                                    {verification.image_url && (
                                                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-blue-100 shadow-sm bg-white">
                                                            <img src={verification.image_url} alt="Verification" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="bg-white/80 rounded-xl p-3 border border-blue-50 shadow-sm">
                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                                                            "{verification.content || '입력된 내용이 없습니다.'}"
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Feedback Input Card */}
                                                <div
                                                    onClick={() => setSelectedSubject(subj)}
                                                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1
                                                        ${subj.summary ? 'bg-purple-50/30 border-purple-200' : 'bg-white border-gray-100 hover:border-purple-200'}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <Badge className={`${subj.color} border-none shadow-none text-xs px-2 py-1`}>{subj.name}</Badge>
                                                        {subj.is_important && (
                                                            <Badge className="bg-red-500 text-white border-none text-[10px]">중요</Badge>
                                                        )}
                                                    </div>

                                                    {subj.summary ? (
                                                        <p className={`text-sm ${subj.is_important ? 'font-bold text-gray-800' : 'font-medium text-gray-600'} line-clamp-2 min-h-[40px]`}>
                                                            {subj.summary}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 flex items-center justify-center h-10 border border-dashed border-gray-300 rounded-lg">
                                                            {subj.name} 과제 피드백 작성하기 +
                                                        </p>
                                                    )}

                                                    <div className="absolute top-5 right-5 text-gray-300">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>

                                                {/* General Comment */}
                                                <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                                                    <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                                        <span>📝</span> 멘토 총평
                                                    </h3>
                                                    <Textarea
                                                        value={generalComment}
                                                        onChange={(e) => setGeneralComment(e.target.value)}
                                                        placeholder="오늘의 학습 태도, 칭찬, 보완할 점 등을 자유롭게 적어주세요."
                                                        className="bg-white border-purple-100 focus-visible:ring-purple-200 min-h-[120px] resize-none rounded-xl p-4 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                        </div>

                        <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 text-lg font-bold shadow-xl shadow-purple-200 mt-8 gap-2 transition-all active:scale-95">
                            <Save size={20} />
                            피드백 저장하기
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {selectedSubject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedSubject(null)}
                >
                    <div
                        className="w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`absolute top-0 left-0 right-0 h-32 ${selectedSubject.color.split(' ')[0]} opacity-20`} />

                        <div className="relative mb-6 flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <Badge className={`${selectedSubject.color} text-base py-1 px-4 border-none w-fit shadow-sm`}>
                                    {selectedSubject.name} 피드백
                                </Badge>
                                <span className="text-sm text-gray-500 font-medium ml-1">상세 내용을 작성해주세요</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSubject(null)} className="rounded-full bg-white/50 hover:bg-white">
                                <ChevronLeft size={24} />
                            </Button>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                                <div className="p-4 pb-2 flex justify-between items-center">
                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">One Line Summary</span>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubject.is_important}
                                            onChange={() => toggleImportant(selectedSubject.name)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                        />
                                        <span className="text-xs font-bold text-red-500">중요 표시</span>
                                    </label>
                                </div>
                                <Input
                                    value={selectedSubject.summary}
                                    onChange={(e) => updateSubjectFeedback(selectedSubject.name, 'summary', e.target.value)}
                                    placeholder="핵심 내용을 한 줄로 요약해주세요."
                                    className="bg-transparent border-none text-lg font-bold px-4 pb-4 focus-visible:ring-0 placeholder:text-gray-300 placeholder:font-normal"
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-bold text-gray-400 ml-1">상세 피드백</span>
                                <Textarea
                                    value={selectedSubject.detail}
                                    onChange={(e) => updateSubjectFeedback(selectedSubject.name, 'detail', e.target.value)}
                                    placeholder="구체적인 학습 조언과 설명을 작성해주세요."
                                    className="min-h-[240px] bg-gray-50 border-none rounded-2xl p-5 text-base resize-none focus-visible:ring-2 ring-purple-100"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={() => setSelectedSubject(null)}
                            className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-6 font-bold mt-8 shadow-xl text-lg"
                        >
                            작성 완료
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningFeedback;
