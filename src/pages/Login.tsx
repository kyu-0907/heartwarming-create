import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!role) {
      toast.error('역할을 선택해 주세요.');
      return;
    }
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해 주세요.');
      return;
    }

    const userData = {
      role,
      nickname: nickname.trim(),
      isLoggedIn: true,
    };

    localStorage.setItem('user', JSON.stringify(userData));
    toast.success(`${nickname}님, 환영합니다!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            설스터디 <span className="text-primary">MVP</span>
          </h1>
          <p className="text-muted-foreground italic">
            따뜻한 배움의 공간에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            onClick={() => setRole('mentor')}
            className={`cursor-pointer p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${role === 'mentor'
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-transparent hover:border-primary/50'
              }`}
          >
            <div className={`p-3 rounded-full ${role === 'mentor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className={`font-semibold ${role === 'mentor' ? 'text-primary' : 'text-foreground'}`}>
              멘토
            </span>
          </Card>

          <Card
            onClick={() => setRole('mentee')}
            className={`cursor-pointer p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${role === 'mentee'
              ? 'border-accent bg-accent/5 scale-105'
              : 'border-transparent hover:border-accent/50'
              }`}
          >
            <div className={`p-3 rounded-full ${role === 'mentee' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
              <User className="w-8 h-8" />
            </div>
            <span className={`font-semibold ${role === 'mentee' ? 'text-accent' : 'text-foreground'}`}>
              멘티
            </span>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              닉네임
            </label>
            <Input
              id="nickname"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-field h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
          >
            입장하기
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
