import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import ReportSidebar from '@/components/dashboard/ReportSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle2, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const WeeklyReportDetail = () => {
    const navigate = useNavigate();
    const { id, reportId } = useParams();
    const [currentWeek, setCurrentWeek] = useState(reportId || '1');

    // Mock data for weekly todo list
    const weeklyTodos = [
        { id: 1, plan: '문법 기초 다지기', goal: '1단원 완강', subject: '국어', date: '2026.02.02', checked: true, material: '문법특강.pdf' },
        { id: 2, plan: '영어 단어 암기', goal: 'Day 1-5', subject: '영어', date: '2026.02.03', checked: true, material: 'VOCA_List.pdf' },
        { id: 3, plan: '수학 문제 풀이', goal: '50문제', subject: '수학', date: '2026.02.04', checked: false, material: '' },
        { id: 4, plan: '한국사 흐름 파악', goal: '고려시대 정리', subject: '한국사', date: '2026.02.05', checked: false, material: 'History_Summary.pdf' },
    ];

    return (
        <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-background">
            {/* Global Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Report Sidebar (Weeks) */}
                <ReportSidebar currentWeek={currentWeek} onSelectWeek={setCurrentWeek} />

                {/* Main Content */}
                <main className="flex-1 bg-dark-card p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Header / Back Button */}
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">주간 학습 리포트 상세</h1>
                        </div>

                        {/* 1. Mentor Feedback Section */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 총평 */}
                            <Card className="bg-card/50 border-border/50 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                                        📢 멘토 총평
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        이번 주는 전반적으로 계획했던 학습량을 잘 소화했습니다. 특히 국어 문법 파트에서의 이해도가 높아진 것이 보입니다. 다만 수학 문제 풀이 시간이 부족했던 점이 아쉽습니다.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* 잘한 점 */}
                            <Card className="bg-card/50 border-border/50 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                                        👍 이번 주 잘한 점
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        <li>매일 꾸준히 단어 암기를 진행함</li>
                                        <li>질문 횟수가 늘어 적극적인 태도를 보임</li>
                                        <li>약속된 시간을 정확히 지킴</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* 보완할 점 */}
                            <Card className="bg-card/50 border-border/50 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                                        💪 다음 주 보완할 점
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        <li>수학 오답 노트를 조금 더 꼼꼼히 작성하기</li>
                                        <li>학습 중간 휴식 시간을 규칙적으로 갖기</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

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
                                            <TableHead className="text-center w-[15%]">계획</TableHead>
                                            <TableHead className="text-center w-[20%]">목표</TableHead>
                                            <TableHead className="text-center w-[10%]">과목</TableHead>
                                            <TableHead className="text-center w-[15%]">날짜</TableHead>
                                            <TableHead className="text-center w-[10%]">멘토 확인</TableHead>
                                            <TableHead className="text-center w-[20%]">학습 자료</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {weeklyTodos.map((todo) => (
                                            <TableRow key={todo.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-medium text-center">{todo.plan}</TableCell>
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
                                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {todo.material ? (
                                                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
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
