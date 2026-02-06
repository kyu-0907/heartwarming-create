import { Lightbulb, BookOpen, Calendar, MessageCircle, BarChart3, Settings, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const menuItems = [
  { icon: Lightbulb, label: '대시보드', path: '/' },
  { icon: BookOpen, label: '학습', path: '/learning' },
  { icon: Calendar, label: '일정', path: '/schedule' },
  { icon: MessageCircle, label: '메시지', path: '/messages' },
  { icon: BarChart3, label: '통계', path: '/stats' },
  { icon: Settings, label: '설정', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
    <aside className="w-16 md:w-20 min-h-screen bg-lavender-light flex flex-col items-center py-4 md:py-6 gap-2 shrink-0">
      {/* 프로필 아바타 */}
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-bold mb-2 md:mb-4">
        me
      </div>

      <div className="w-6 md:w-8 h-px bg-border mb-2 md:mb-4" />

      {/* 메뉴 아이템 */}
      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`sidebar-icon ${isActive(item.path) ? 'sidebar-icon-active' : 'sidebar-icon-inactive'
              }`}
            title={item.label}
          >
            <item.icon size={18} className="md:w-5 md:h-5" />
          </button>
        ))}
      </nav>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="sidebar-icon sidebar-icon-inactive mt-auto"
        title="로그아웃"
      >
        <LogOut size={18} className="md:w-5 md:h-5" />
      </button>
    </aside>
  );
};

export default Sidebar;
