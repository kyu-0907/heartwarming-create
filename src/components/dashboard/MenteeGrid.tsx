import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Mentee {
  id: string;
  nickname: string;
  role: string;
}

const MenteeCard = ({ mentee }: { mentee: Mentee }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/mentee/${mentee.id}`)}
      className="relative w-full max-w-sm aspect-[3/4] group outline-none transition-transform duration-300 hover:-translate-y-2"
    >
      {/* 폴더 탭 (뒤) - 약간 작게 유지 */}
      <div className="absolute top-0 left-0 w-32 h-10 bg-muted rounded-t-2xl transition-colors duration-300 group-hover:bg-accent" />

      {/* 메인 카드 (앞) */}
      <div className="absolute inset-0 top-4 bg-muted rounded-3xl rounded-tl-none border-4 border-border transition-all duration-300 group-hover:bg-accent group-hover:border-accent group-hover:shadow-xl flex flex-col items-center justify-center p-6 gap-6">

        {/* 프로필 사진 영역 (대형) */}
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-background border-4 border-border overflow-hidden shadow-sm group-hover:border-accent-foreground/20 transition-all duration-300">
          <img
            src={mentee.nickname === '멘티2' ? "/images/avatar_female.png" : "/images/avatar_male.png"}
            alt={mentee.nickname}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 텍스트 정보 */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-card-foreground group-hover:text-accent-foreground transition-colors duration-300">
            {mentee.nickname || '이름 없음'}
          </h3>
          <p className="text-base md:text-lg text-muted-foreground group-hover:text-accent-foreground/80 transition-colors duration-300">
            {mentee.nickname === '멘티2' ? '수원여자고등학교 2학년' : '경기고등학교 3학년'}
          </p>
        </div>
      </div>
    </button>
  );
};

const MenteeGrid = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentee');

        if (error) throw error;
        setMentees(data || []);
      } catch (error) {
        console.error('Error fetching mentees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-muted-foreground">
        <p>등록된 멘티가 없습니다.</p>
        <p className="text-sm">테스트 계정으로 멘티 로그인을 먼저 진행해주세요!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col md:flex-row items-center justify-evenly gap-8 p-8 md:p-12">
      {mentees.map((mentee) => (
        <MenteeCard key={mentee.id} mentee={mentee} />
      ))}
    </div>
  );
};

export default MenteeGrid;
