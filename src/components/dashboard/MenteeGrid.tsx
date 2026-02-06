import { useNavigate } from 'react-router-dom';

interface Mentee {
  id: string;
  name: string;
  school: string;
  imageUrl: string;
}

const mentees: Mentee[] = [
  { id: '1', name: '멘티 1', school: '경기고등학교 3학년', imageUrl: '/images/avatar_male.png' },
  { id: '2', name: '멘티 2', school: '수원여자고등학교 2학년', imageUrl: '/images/avatar_female.png' },
];

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
          <img src={mentee.imageUrl} alt={mentee.name} className="w-full h-full object-cover" />
        </div>

        {/* 텍스트 정보 */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-card-foreground group-hover:text-accent-foreground transition-colors duration-300">
            {mentee.name}
          </h3>
          <p className="text-base md:text-lg text-muted-foreground group-hover:text-accent-foreground/80 transition-colors duration-300">
            {mentee.school}
          </p>
        </div>
      </div>
    </button>
  );
};

const MenteeGrid = () => {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col md:flex-row items-center justify-evenly gap-8 p-8 md:p-12">
      {mentees.map((mentee) => (
        <MenteeCard key={mentee.id} mentee={mentee} />
      ))}
    </div>
  );
};

export default MenteeGrid;
