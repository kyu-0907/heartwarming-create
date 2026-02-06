import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Upload, NotebookPen } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

interface AddAssignmentDialogProps {
    children?: React.ReactNode;
}

const AddAssignmentDialog = ({ children }: AddAssignmentDialogProps) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>();
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call simulation
        toast.success('과제가 성공적으로 추가되었습니다!', {
            icon: '📝',
        });
        setOpen(false);
        // Reset form
        setDate(undefined);
        setFile(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
                <DialogHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <NotebookPen className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-foreground">새로운 과제 만들기</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* 1. 과목 & 제목 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="subject" className="text-base text-foreground/80">과목</Label>
                            <Select>
                                <SelectTrigger className="bg-background border-input">
                                    <SelectValue placeholder="과목" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="korean">국어</SelectItem>
                                    <SelectItem value="english">영어</SelectItem>
                                    <SelectItem value="math">수학</SelectItem>
                                    <SelectItem value="science">과학</SelectItem>
                                    <SelectItem value="history">한국사</SelectItem>
                                    <SelectItem value="other">기타</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="title" className="text-base text-foreground/80">제목</Label>
                            <Input id="title" placeholder="과제 제목을 입력하세요" className="bg-background border-input" required />
                        </div>
                    </div>

                    {/* 2. 기간 & 목표 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 flex flex-col">
                            <Label className="text-base text-foreground/80">기간 (시작일 ~ 마감일)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal bg-background border-input hover:bg-accent hover:text-accent-foreground",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "yyyy.MM.dd", { locale: ko })} -{" "}
                                                    {format(date.to, "yyyy.MM.dd", { locale: ko })}
                                                </>
                                            ) : (
                                                format(date.from, "yyyy.MM.dd", { locale: ko })
                                            )
                                        ) : (
                                            <span>기간 선택</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                        locale={ko}
                                        className="bg-popover border-border"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goal" className="text-base text-foreground/80">목표</Label>
                            <Input id="goal" placeholder="목표를 설정해보세요!" className="bg-background border-input" />
                        </div>
                    </div>

                    {/* 3. 과제 내용 */}
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-base text-foreground/80">과제 내용</Label>
                        <Textarea
                            id="content"
                            placeholder="어떤 과제인지 상세하게 적어주세요."
                            className="min-h-[150px] bg-background border-input resize-none"
                            required
                        />
                    </div>

                    {/* 4. 첨부 파일 */}
                    <div className="space-y-2">
                        <Label className="text-base text-foreground/80">첨부 파일</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="dropzone-file-dialog"
                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 border-muted-foreground/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                    {file ? (
                                        <div className="flex items-center gap-2 text-primary">
                                            <Upload className="w-5 h-5" />
                                            <p className="text-sm font-medium">{file.name}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Upload className="w-6 h-6" />
                                            <span className="text-sm">클릭 또는 드래그하여 업로드 (JPG, PDF)</span>
                                        </div>
                                    )}
                                </div>
                                <input id="dropzone-file-dialog" type="file" className="hidden" accept=".jpg,.jpeg,.pdf" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            취소
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                            과제 만들기
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAssignmentDialog;
