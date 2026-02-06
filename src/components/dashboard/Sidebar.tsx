import { Lightbulb, BookOpen, Calendar, MessageCircle, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeIndex?: number;
}

const menuItems = [
  { icon: Lightbulb, label: '대시보드' },
  { icon: BookOpen, label: '학습' },
  { icon: Calendar, label: '일정' },
  { icon: MessageCircle, label: '메시지' },
  { icon: BarChart3, label: '통계' },
  { icon: Settings, label: '설정' },
];

const Sidebar = ({ activeIndex = 0 }: SidebarProps) => {
  return (
    <aside className="w-16 h-screen bg-lavender-light flex flex-col items-center py-6 gap-2">
      {/* 프로필 아바타 */}
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-4">
        me
      </div>
      
      <div className="w-8 h-px bg-border mb-4" />
      
      {/* 메뉴 아이템 */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={`sidebar-icon ${
              index === activeIndex ? 'sidebar-icon-active' : 'sidebar-icon-inactive'
            }`}
            title={item.label}
          >
            <item.icon size={20} />
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
