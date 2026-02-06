import { Plus } from 'lucide-react';

const EventWidget = () => {
  return (
    <div className="card-glass p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-foreground">이벤트</h3>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          <Plus size={18} />
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground">영어 수업</p>
    </div>
  );
};

export default EventWidget;
