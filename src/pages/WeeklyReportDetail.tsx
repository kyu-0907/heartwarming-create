import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import ReportSidebar from '@/components/dashboard/ReportSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle2, FileText, Download, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const WeeklyReportDetail = () => {
    const navigate = useNavigate();
    const { id: menteeId, reportId } = useParams();
    const [currentWeek, setCurrentWeek] = useState(reportId || '1');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isMentor = user.role === 'mentor';

    const [reportData, setReportData] = useState({
        general_evaluation: '',
        strengths: '',
        improvements: ''
    });

    // Mock data for weekly todo list
    const weeklyTodos = [
        { id: 1, plan: '문법 기초 다지기', goal: '1단원 완강', subject: '국어', date: '2026.02.02', checked: true, material: '문법특강.pdf' },
        { id: 2, plan: '영어 단어 암기', goal: 'Day 1-5', subject: '영어', date: '2026.02.03', checked: true, material: 'VOCA_List.pdf' },
        { id: 3, plan: '수학 문제 풀이', goal: '50문제', subject: '수학', date: '2026.02.04', checked: false, material: '' },
        { id: 4, plan: '한국사 흐름 파악', goal: '고려시대 정리', subject: '한국사', date: '2026.02.05', checked: false, material: 'History_Summary.pdf' },
    ];

    const isMonthly = reportId?.includes('monthly');
    const displayTitle = isMonthly ? `${reportId?.replace('monthly-', '')}개월 리포트` : `${currentWeek}주차 리포트`;

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const reportType = isMonthly ? 'monthly' : 'weekly';
                const titleStr = isMonthly ? `${reportId?.replace('monthly-', '')}개월` : `${currentWeek}주차`;

                const { data, error } = await supabase
                    .from('learning_reports')
                    .select('*')
                    .eq('mentee_id', menteeId)
                    .eq('type', reportType)
                    .eq('title', titleStr)
                    .maybeSingle();

                if (data) {
                    setReportData({
                        general_evaluation: data.general_evaluation || '',
                        strengths: data.strengths || '',
                        improvements: data.improvements || ''
                    });
                } else {
                    setReportData({ general_evaluation: '', strengths: '', improvements: '' });
                }
            } catch (error) {
                console.error('Error fetching report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [menteeId, currentWeek, reportId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const reportType = isMonthly ? 'monthly' : 'weekly';
            const titleStr = isMonthly ? `${reportId?.replace('monthly-', '')}개월` : `${currentWeek}주차`;

            const { error } = await supabase
                .from('learning_reports')
                .upsert({
                    mentee_id: menteeId,
                    mentor_id: user.id,
                    type: reportType,
                    title: titleStr,
                    general_evaluation: reportData.general_evaluation,
                    strengths: reportData.strengths,
                    improvements: reportData.improvements,
                    feedback_date: new Date().toISOString().split('T')[0]
                }, { onConflict: 'mentee_id, type, title' });

            if (error) throw error;
            toast.success(`${isMonthly ? '월간' : '주간'} 학습 리포트가 저장되었습니다.`);
        } catch (error: any) {
            console.error('Error saving report:', error);
            toast.error('리포트 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                {!isMonthly && <ReportSidebar currentWeek={currentWeek} onSelectWeek={setCurrentWeek} />}

                <main className="flex-1 bg-dark-card p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white">
                                    <ArrowLeft className="w-6 h-6" />
                                </Button>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">{displayTitle}</h1>
                            </div>
                            {isMentor && (
                                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    리포트 저장
                                </Button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-20">
                                <Loader2 className="animate-spin text-primary w-8 h-8" />
                            </div>
                        ) : (
                            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* 총평 */}
                                <Card className="bg-card/50 border-border/50 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                                            📢 멘토 총평
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isMentor ? (
                                            <Textarea
                                                value={reportData.general_evaluation}
                                                onChange={(e) => setReportData(prev => ({ ...prev, general_evaluation: e.target.value }))}
                                                placeholder={isMonthly ? "이번 달 학습에 대한 전반적인 총평을 적어주세요." : "이번 주 학습에 대한 전반적인 총평을 적어주세요."}
                                                className="bg-transparent border-slate-700 min-h-[100px] text-sm"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {reportData.general_evaluation || '멘토의 총평이 아직 작성되지 않았습니다.'}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* 잘한 점 */}
                                <Card className="bg-card/50 border-border/50 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                                            👍 {isMonthly ? '이번 달' : '이번 주'} 잘한 점
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isMentor ? (
                                            <Textarea
                                                value={reportData.strengths}
                                                onChange={(e) => setReportData(prev => ({ ...prev, strengths: e.target.value }))}
                                                placeholder={isMonthly ? "학생이 이번 달에 특별히 잘한 점을 적어주세요." : "학생이 이번 주에 특별히 잘한 점을 적어주세요."}
                                                className="bg-transparent border-slate-700 min-h-[100px] text-sm"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {reportData.strengths || '기록된 내용이 없습니다.'}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* 보완할 점 */}
                                <Card className="bg-card/50 border-border/50 shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                                            💪 {isMonthly ? '다음 달' : '다음 주'} 보완할 점
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isMentor ? (
                                            <Textarea
                                                value={reportData.improvements}
                                                onChange={(e) => setReportData(prev => ({ ...prev, improvements: e.target.value }))}
                                                placeholder={isMonthly ? "다음 달에 개선하거나 집중해야 할 내용을 적어주세요." : "다음 주에 개선하거나 집중해야 할 내용을 적어주세요."}
                                                className="bg-transparent border-slate-700 min-h-[100px] text-sm"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {reportData.improvements || '기록된 내용이 없습니다.'}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </section>
                        )}

                        {/* 2. Weekly Todo List Table */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-accent" />
                                    위클리 투두 리스트
                                </h2>
                            </div>

                            <div className="rounded-xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="text-center w-[15%] text-gray-400">계획</TableHead>
                                            <TableHead className="text-center w-[20%] text-gray-400">목표</TableHead>
                                            <TableHead className="text-center w-[10%] text-gray-400">과목</TableHead>
                                            <TableHead className="text-center w-[15%] text-gray-400">날짜</TableHead>
                                            <TableHead className="text-center w-[10%] text-gray-400">멘토 확인</TableHead>
                                            <TableHead className="text-center w-[20%] text-gray-400">학습 자료</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {weeklyTodos.map((todo) => (
                                            <TableRow key={todo.id} className="hover:bg-muted/20 border-border/30 transition-colors">
                                                <TableCell className="font-medium text-center text-white">{todo.plan}</TableCell>
                                                <TableCell className="text-center text-muted-foreground">{todo.goal}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-md text-xs font-medium",
                                                        todo.subject === '국어' ? "bg-red-500/20 text-red-500" :
                                                            todo.subject === '영어' ? "bg-blue-500/20 text-blue-500" :
                                                                todo.subject === '수학' ? "bg-yellow-500/20 text-yellow-500" :
                                                                    "bg-green-500/20 text-green-500"
                                                    )}>
                                                        {todo.subject}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground text-sm">{todo.date}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        {todo.checked ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500 shadow-sm shadow-green-500/20" />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {todo.material ? (
                                                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-white">
                                                            <Download className="w-3 h-3" />
                                                            자료
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default WeeklyReportDetail;
