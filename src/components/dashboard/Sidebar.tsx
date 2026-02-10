import { Lightbulb, BookOpen, Calendar, MessageCircle, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuItems = [
  { icon: Lightbulb, label: '대시보드', path: '/' },
  { icon: BookOpen, label: '학습', path: '/learning' },
  { icon: Calendar, label: '일정', path: '/schedule' },
  { icon: MessageCircle, label: '메시지', path: '/messages' },
  { icon: BarChart3, label: '통계', path: '/stats' },
  { icon: Settings, label: '설정', path: '/settings' },
];

interface Mentee {
  id: string;
  nickname: string;
  role: string;
}

const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = location.pathname;
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileOpen]);

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
        console.error('Error fetching mentees for sidebar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' && !currentPath.startsWith('/mentee'); // Only active on exact '/'
    return currentPath.startsWith(path);
  };

  const isMenteeActive = (menteeId: string) => {
    return currentPath.includes(`/mentee/${menteeId}`);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    toast.info('로그아웃 되었습니다.');
    navigate('/login');
  };

  const getMenteeImage = (nickname: string) => {
    if (nickname === '멘티2') return '/images/avatar_female.png';
    return '/images/avatar_male.png';
  }

  const getMenteeSchool = (nickname: string) => {
    if (nickname === '멘티2') return '수원여자고등학교 2학년';
    return '경기고등학교 3학년';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`${mobileOpen ? 'flex fixed inset-y-0 left-0 w-64 shadow-2xl px-4' : 'hidden'
          } md:flex flex-col h-screen bg-lavender-light border-r border-border/50 py-6 gap-6 shrink-0 z-50 transition-all duration-300 relative ${!mobileOpen && isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-4'
          }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="md:hidden absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1"
        >
          <X size={20} />
        </button>

        {/* 로고 영역 */}
        <div className={`flex items-center ${!mobileOpen && isCollapsed ? 'justify-center' : 'gap-2 px-2'}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
            S
          </div>
          {(mobileOpen || !isCollapsed) && (
            <span className="font-outfit font-bold text-xl text-foreground whitespace-nowrap overflow-hidden">
              SeolStudy
            </span>
          )}
        </div>

        {/* 접기/펼치기 버튼 - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm text-muted-foreground hover:text-primary transition-colors hover:scale-110 z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* 메뉴 아이템 */}
        <nav className="flex flex-col gap-1 w-full">
          {(!mobileOpen && isCollapsed) ? null : <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 animate-fade-in">MENU</p>}

          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen && onMobileClose) onMobileClose();
                }}
                className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${!mobileOpen && isCollapsed ? 'justify-center w-12 h-12 px-0 mx-auto' : 'px-3'
                  } ${active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
                  }`}
                title={(!mobileOpen && isCollapsed) ? item.label : undefined}
              >
                <item.icon size={(!mobileOpen && isCollapsed) ? 20 : 18} />
                {(mobileOpen || !isCollapsed) && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* 멘티 리스트 */}
        <div className={`flex flex-col gap-1 mt-2 w-full ${!mobileOpen && isCollapsed ? 'items-center' : ''}`}>
          {(!mobileOpen && isCollapsed) ? null : <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 animate-fade-in">MY MENTEES</p>}

          {!mobileOpen && isCollapsed && <div className="w-full h-px bg-border/50 my-2" />}

          <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[300px] scrollbar-hide">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground w-5 h-5" /></div>
            ) : mentees.map((mentee) => {
              const active = isMenteeActive(mentee.id);
              const imageUrl = getMenteeImage(mentee.nickname);
              const school = getMenteeSchool(mentee.nickname);

              return (
                <button
                  key={mentee.id}
                  onClick={() => {
                    navigate(`/mentee/${mentee.id}`);
                    if (mobileOpen && onMobileClose) onMobileClose();
                  }}
                  className={`flex items-center gap-3 rounded-xl hover:bg-white/50 transition-colors group text-left ${!mobileOpen && isCollapsed ? 'justify-center p-2' : 'px-3 py-2'
                    } ${active ? 'bg-primary/10' : ''}`}
                  title={(!mobileOpen && isCollapsed) ? mentee.nickname : undefined}
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden border transition-colors shrink-0 ${active ? 'border-primary' : 'border-border group-hover:border-primary/50'}`}>
                    <img src={imageUrl} alt={mentee.nickname} className="w-full h-full object-cover" />
                  </div>
                  {(mobileOpen || !isCollapsed) && (
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-sm font-medium transition-colors truncate ${active ? 'text-primary font-bold' : 'text-foreground group-hover:text-primary'}`}>{mentee.nickname}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{school}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center gap-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/50 hover:text-destructive transition-colors text-sm font-medium ${!mobileOpen && isCollapsed ? 'justify-center w-12 h-12 px-0 mx-auto' : 'px-3'
            }`}
          title={(!mobileOpen && isCollapsed) ? '로그아웃' : undefined}
        >
          <LogOut size={(!mobileOpen && isCollapsed) ? 20 : 18} />
          {(mobileOpen || !isCollapsed) && <span>로그아웃</span>}
        </button>
      </aside>
    </>
  );
};
export default Sidebar;
