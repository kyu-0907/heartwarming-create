import { Lightbulb, Plus } from 'lucide-react';

const ProfileHeader = () => {
  return (
    <div className="flex items-center gap-6 mb-6">
      {/* 프로필 아이콘 */}
      <div className="w-20 h-20 rounded-2xl bg-lavender flex items-center justify-center">
        <Lightbulb className="w-10 h-10 text-primary-foreground" />
      </div>
      
      {/* 프로필 정보 */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-foreground">황규호</h1>
        <p className="text-muted-foreground">경기고등학교 3학년</p>
      </div>
      
      {/* 메모 입력 */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="학생세부사항 멘토 개인의 메모공간"
          className="input-field text-sm"
        />
      </div>
      
      {/* 과제 추가 버튼 */}
      <button className="btn-accent flex items-center gap-2">
        과제 추가
        <Plus size={18} />
      </button>
    </div>
  );
};

export default ProfileHeader;
