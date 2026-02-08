import { ArrowLeft, Folder, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MenteeQnAViewProps {
    onBack: () => void;
}

const MenteeQnAView = ({ onBack }: MenteeQnAViewProps) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 pb-2 sticky top-0 bg-[#eef1ff] z-10">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">질의응답</h1>
                    <p className="text-sm text-gray-500 mt-1">질문하고 답변을 받아보세요</p>
                </div>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-8">
                {/* Question Input */}
                <Card className="rounded-[2rem] p-6 shadow-xl border-none bg-white relative overflow-hidden">
                    <div className="space-y-4">
                        <Input
                            placeholder="제목을 적어주세요"
                            className="bg-gray-50 border-none rounded-xl h-12 text-lg font-bold placeholder:font-medium placeholder:text-gray-400 focus-visible:ring-1 ring-[#7b8cff]/50"
                        />

                        <div className="relative">
                            <Textarea
                                placeholder="질문을 적어주세요"
                                className="min-h-[150px] bg-gray-50 border-none rounded-xl p-4 text-base resize-none focus-visible:ring-1 ring-[#7b8cff]/50 placeholder:text-gray-400"
                            />
                            {/* Attachments */}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-[#7b8cff] hover:bg-white rounded-lg">
                                    <Folder size={18} />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-[#7b8cff] hover:bg-white rounded-lg">
                                    <Image size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button className="rounded-xl px-6 bg-[#2d2d2d] hover:bg-black text-white font-bold h-10 shadow-lg transition-transform active:scale-95">
                                질문하기
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Past QnA List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 px-1">답변보기</h2>

                    <div className="space-y-3">
                        {/* Q1 Example */}
                        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-blue-50/50 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-start gap-4 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#eef1ff] flex items-center justify-center font-bold text-[#7b8cff] text-sm shrink-0">Q.1</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-sm mb-1">질문화법과 작문 28번 문제 질문있어요</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2">문제에서 말하는 의도가 도저히 이해가 안가요. 왜 3번이 답인가요?</p>
                                </div>
                            </div>

                            {/* Answer Box */}
                            <div className="ml-12 bg-[#f8f9ff] rounded-2xl p-4 border border-[#7b8cff]/20 mt-2 relative">
                                <div className="w-6 h-6 rounded-full bg-[#7b8cff] absolute -left-3 top-[-6px] flex items-center justify-center text-white font-bold text-xs ring-4 ring-white">A</div>
                                <p className="text-sm text-gray-600 font-medium">교과서 142페이지를 다시 한번 읽어보면, 화자의 의도는...</p>
                            </div>
                        </div>

                        {/* Q2 Example (No Answer) */}
                        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-blue-50/50 hover:shadow-md transition-all cursor-pointer opacity-70">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#eef1ff] flex items-center justify-center font-bold text-[#7b8cff] text-sm shrink-0">Q.2</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-sm mb-1">영어 빈칸 추론 문제</h3>
                                    <p className="text-xs text-gray-400 line-clamp-1">빈칸에 들어갈 말이 헷갈려요.</p>
                                    <span className="text-xs text-[#7b8cff] font-bold mt-2 inline-block">답변 대기중...</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default MenteeQnAView;
