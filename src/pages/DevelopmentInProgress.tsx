
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DevelopmentInProgress = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center animate-fade-in">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <span className="text-4xl">🚧</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                설스터디는 개발중입니다
            </h1>

            <p className="text-muted-foreground mb-8 text-sm md:text-base max-w-md">
                더 나은 서비스를 제공하기 위해 열심히 준비하고 있습니다.<br />
                빠른 시일 내에 찾아뵙겠습니다!
            </p>

            <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
            >
                <ArrowLeft size={16} />
                뒤로가기
            </Button>
        </div>
    );
};

export default DevelopmentInProgress;
