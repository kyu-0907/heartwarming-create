import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const TEST_ACCOUNTS = {
  mentor: {
    email: 'mentor@test.com',
    password: 'password123!', // Simple password for test
    role: 'mentor',
    nickname: '멘토1',
    label: '멘토',
    icon: GraduationCap,
    color: 'primary',
  },
  mentee1: {
    email: 'mentee1@test.com',
    password: 'password123!',
    role: 'mentee',
    nickname: '멘티1',
    label: '멘티 1',
    icon: User,
    color: 'accent',
  },
  mentee2: {
    email: 'mentee2@test.com',
    password: 'password123!',
    role: 'mentee',
    nickname: '멘티2',
    label: '멘티 2',
    icon: User,
    color: 'accent',
  },
};

const Login = () => {
  const [selectedUser, setSelectedUser] = useState<keyof typeof TEST_ACCOUNTS | null>(null);
  const [inputNickname, setInputNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!selectedUser) return;

    if (inputNickname.trim() !== TEST_ACCOUNTS[selectedUser].nickname) {
      toast.error(`"${TEST_ACCOUNTS[selectedUser].nickname}"을(를) 정확히 입력해주세요.`);
      return;
    }

    setLoading(true);
    const account = TEST_ACCOUNTS[selectedUser];

    try {
      // 1. Try to Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        // If user not found or invalid login, try to Sign Up (BOOTSTRAP)
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          // Check if it's actually "User not found" case disguised or try sign up
          // Note: Supabase gives generic error for security. We'll try sign up as fallback for "first time" setup.
          console.log("Login failed, attempting to create test user...", error.message);

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
              data: {
                role: account.role,
                nickname: account.nickname,
              },
            },
          });

          if (signUpError) {
            throw signUpError;
          }

          // If sign up successful but session is null, email confirmation might be required.
          if (signUpData.user && !signUpData.session) {
            toast.info("계정이 생성되었습니다. 이메일 확인이 필요할 수 있습니다. (Supabase 콘솔에서 Email Confirm 비활성화 추천)");
            setLoading(false);
            return;
          }
        } else {
          throw error;
        }
      }

      // Login Successful
      const userData = {
        role: account.role,
        nickname: account.nickname,
        email: account.email,
        isLoggedIn: true,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      toast.success(`${account.nickname}님, 환영합니다!`);
      navigate('/');

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`로그인 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            설스터디 <span className="text-primary">MVP</span>
          </h1>
          <p className="text-muted-foreground italic">
            테스트할 계정을 선택해주세요. (최초 1회시 자동 가입됩니다)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(TEST_ACCOUNTS) as Array<keyof typeof TEST_ACCOUNTS>).map((key) => {
            const account = TEST_ACCOUNTS[key];
            const isSelected = selectedUser === key;
            const Icon = account.icon;

            return (
              <Card
                key={key}
                onClick={() => {
                  setSelectedUser(key);
                  setInputNickname(''); // Reset input when switching
                }}
                className={`cursor-pointer p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 border-2 relative overflow-hidden group
                  ${isSelected
                    ? `border-${account.color} bg-${account.color}/5 ring-2 ring-${account.color}/20 ring-offset-2 scale-105 shadow-xl`
                    : `border-transparent hover:border-${account.color}/50 hover:bg-slate-50`
                  }`}
              >
                <div className={`p-4 rounded-full transition-colors duration-300 ${isSelected
                  ? `bg-${account.color} text-${account.color}-foreground`
                  : 'bg-muted text-muted-foreground group-hover:bg-slate-200'
                  }`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className={`font-bold text-xl ${isSelected ? `text-${account.color}` : 'text-foreground'}`}>
                    {account.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {account.role === 'mentor' ? '선생님 계정' : '학생 계정'}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />
                )}
              </Card>
            );
          })}
        </div>

        {selectedUser && (
          <div className="max-w-md mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-300 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border shadow-sm">
            <div className="space-y-2 text-center">
              <h3 className="font-semibold text-lg">
                Are you <span className="text-primary font-bold">{TEST_ACCOUNTS[selectedUser].nickname}</span>?
              </h3>
              <p className="text-xs text-muted-foreground">
                본인 확인을 위해 닉네임 <span className="font-mono font-bold text-foreground bg-slate-100 px-1 rounded">
                  {TEST_ACCOUNTS[selectedUser].nickname}
                </span>
                을(를) 입력해주세요.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={`${TEST_ACCOUNTS[selectedUser].nickname} 입력`}
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                className="input-field h-12 text-center font-bold text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
                autoFocus
              />
              <Button
                onClick={handleLogin}
                disabled={loading || !inputNickname}
                className={`h-12 w-16 shrink-0 rounded-xl transition-all
                  ${loading ? 'opacity-80' : 'hover:scale-105 active:scale-95'}
                `}
              >
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground/60">
              * 실제 비밀번호는 보안상 'password123!'으로 자동 설정됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
