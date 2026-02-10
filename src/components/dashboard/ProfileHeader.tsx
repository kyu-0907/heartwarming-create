import { Lightbulb, Plus, Loader2 } from 'lucide-react';
import AddAssignmentDialog from './AddAssignmentDialog';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileHeaderProps {
  menteeId?: string;
}

const ProfileHeader = ({ menteeId }: ProfileHeaderProps) => {
  const [menteeName, setMenteeName] = useState('멘티');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menteeId) {
      const fetchProfile = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('nickname').eq('id', menteeId).single();
        if (data) setMenteeName(data.nickname);
        setLoading(false);
      };
      fetchProfile();
    }
  }, [menteeId]);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
      {/* 프로필 이미지 및 정보 그룹 */}
      <div className="flex items-center gap-4 self-start md:self-auto w-full md:w-auto">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-border">
          <img
            src={menteeName === '멘티2' ? "/images/avatar_female.png" : "/images/avatar_male.png"}
            alt="프로필"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : menteeName}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {menteeName === '멘티2' ? '수원여자고등학교 2학년' : '경기고등학교 3학년'}
          </p>
        </div>

        {/* Mobile Only Add Button */}
        <div className="md:hidden ml-auto">
          <AddAssignmentDialog menteeId={menteeId}>
            <button className="btn-accent px-3 py-2 text-xs flex items-center gap-1">
              과제 추가 <Plus size={14} />
            </button>
          </AddAssignmentDialog>
        </div>
      </div>

      {/* 메모 입력 */}
      <div className="w-full md:flex-1">
        <input
          type="text"
          placeholder="학생세부사항 멘토 개인의 메모공간"
          className="input-field text-sm"
        />
      </div>

      {/* 과제 추가 버튼 (Desktop) */}
      <div className="hidden md:block">
        <AddAssignmentDialog menteeId={menteeId}>
          <button
            className="btn-accent flex items-center gap-2 shrink-0"
          >
            과제 추가
            <Plus size={18} />
          </button>
        </AddAssignmentDialog>
      </div>
    </div>
  );
};

export default ProfileHeader;
