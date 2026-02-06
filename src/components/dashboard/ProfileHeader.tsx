import { Lightbulb, Plus } from 'lucide-react';
import AddAssignmentDialog from './AddAssignmentDialog';

const ProfileHeader = () => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
      {/* 프로필 아이콘 */}
      {/* 프로필 이미지 */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-border">
        <img
          src="/images/avatar_male.png"
          alt="프로필"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 프로필 정보 */}
      <div className="flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">황규호</h1>
        <p className="text-sm md:text-base text-muted-foreground">경기고등학교 3학년</p>
      </div>

      {/* 메모 입력 */}
      <div className="w-full md:flex-1">
        <input
          type="text"
          placeholder="학생세부사항 멘토 개인의 메모공간"
          className="input-field text-sm"
        />
      </div>

      {/* 과제 추가 버튼 */}
      <AddAssignmentDialog>
        <button
          className="btn-accent flex items-center gap-2 shrink-0"
        >
          과제 추가
          <Plus size={18} />
        </button>
      </AddAssignmentDialog>
    </div>
  );
};

export default ProfileHeader;
