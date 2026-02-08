import { useRef } from 'react';
import { ArrowLeft, Folder, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface StudyVerificationProps {
    onBack: () => void;
}

const StudyVerification = ({ onBack }: StudyVerificationProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleFileClick = () => fileInputRef.current?.click();
    const handleImageClick = () => imageInputRef.current?.click();

    return (
        <div className="w-full h-full flex flex-col bg-[#eef1ff] relative animate-in slide-in-from-right duration-300">
            {/* Hidden Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => console.log('File selected:', e.target.files)}
            />
            <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={(e) => console.log('Image selected:', e.target.files)}
            />

            {/* Header */}
            <div className="p-6 pb-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mb-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-gray-800">공부 인증하기</h1>
                    <p className="text-sm text-gray-500 mt-1">오늘의 공부를 인증해보세요</p>
                </div>
            </div>

            {/* Content Form */}
            <div className="flex-1 px-6 pb-20 overflow-y-auto">
                <Card className="rounded-[2rem] overflow-hidden shadow-lg border-2 border-blue-100 flex flex-col h-[500px]">
                    {/* Toolbar */}
                    <div className="bg-blue-50/50 p-4 flex justify-end gap-3 border-b border-blue-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleFileClick}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-100/50 rounded-xl w-10 h-10 transition-colors"
                        >
                            <Folder size={24} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleImageClick}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-100/50 rounded-xl w-10 h-10 transition-colors"
                        >
                            <ImageIcon size={24} />
                        </Button>
                    </div>


                    {/* Text Area */}
                    <Textarea
                        className="flex-1 p-6 text-base border-none resize-none focus-visible:ring-0 bg-white placeholder:text-gray-300"
                        placeholder="공부인증 이미지나 결과를 입력해주세요"
                    />
                </Card>

                {/* Bottom Actions */}
                <div className="flex gap-4 mt-8">
                    <Button
                        variant="secondary"
                        className="flex-1 h-14 rounded-full text-base font-bold bg-[#8da4ff] text-white hover:bg-[#7b93f0] shadow-md shadow-blue-200"
                    >
                        임시 저장
                    </Button>
                    <Button
                        className="flex-1 h-14 rounded-full text-base font-bold bg-[#333333] hover:bg-black text-white shadow-lg shadow-gray-300"
                    >
                        게 시
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudyVerification;
