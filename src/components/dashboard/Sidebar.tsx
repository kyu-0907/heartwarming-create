import { Lightbulb, BookOpen, Calendar, MessageCircle, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const menuItems = [
  { icon: Lightbulb, label: '대시보드', path: '/' },
  { icon: BookOpen, label: '학습', path: '/learning' },
  { icon: Calendar, label: '일정', path: '/schedule' },
  { icon: MessageCircle, label: '메시지', path: '/messages' },
  { icon: BarChart3, label: '통계', path: '/stats' },
  { icon: Settings, label: '설정', path: '/settings' },
];

const mentees = [
  { id: '1', name: '멘티 1', school: '경기고등학교 3학년', imageUrl: '/images/avatar_male.png' },
  { id: '2', name: '멘티 2', school: '수원여자고등학교 2학년', imageUrl: '/images/avatar_female.png' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath.startsWith('/mentee');
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.info('로그아웃 되었습니다.');
    navigate('/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col min-h-screen bg-lavender-light border-r border-border/50 py-6 gap-6 shrink-0 z-20 transition-all duration-300 relative ${isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-4'
        }`}
    >
      {/* 로고 영역 */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 px-2'}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
          S
        </div>
        {!isCollapsed && (
          <span className="font-outfit font-bold text-xl text-foreground whitespace-nowrap overflow-hidden">
            SeolStudy
          </span>
        )}
      </div>

      {/* 접기/펼치기 버튼 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm text-muted-foreground hover:text-primary transition-colors hover:scale-110 z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* 메뉴 아이템 */}
      <nav className="flex flex-col gap-1 w-full">
        {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 animate-fade-in">MENU</p>}
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isCollapsed ? 'justify-center w-12 h-12 px-0 mx-auto' : 'px-3'
              } ${isActive(item.path)
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
              }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={isCollapsed ? 20 : 18} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* 멘티 리스트 */}
      <div className={`flex flex-col gap-1 mt-2 w-full ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 animate-fade-in">MY MENTEES</p>}

        {isCollapsed && <div className="w-full h-px bg-border/50 my-2" />}

        <div className="flex flex-col gap-2 w-full">
          {mentees.map((mentee) => (
            <button
              key={mentee.id}
              onClick={() => navigate(`/mentee/${mentee.id}`)}
              className={`flex items-center gap-3 rounded-xl hover:bg-white/50 transition-colors group text-left ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'
                }`}
              title={isCollapsed ? mentee.name : undefined}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border group-hover:border-primary/50 transition-colors shrink-0">
                <img src={mentee.imageUrl} alt={mentee.name} className="w-full h-full object-cover" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{mentee.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{mentee.school}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className={`mt-auto flex items-center gap-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/50 hover:text-destructive transition-colors text-sm font-medium ${isCollapsed ? 'justify-center w-12 h-12 px-0 mx-auto' : 'px-3'
          }`}
        title={isCollapsed ? '로그아웃' : undefined}
      >
        <LogOut size={isCollapsed ? 20 : 18} />
        {!isCollapsed && <span>로그아웃</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
