import { Plus } from 'lucide-react';

interface SideTodoItem {
  id: number;
  title: string;
  completed: boolean;
}

const todoItems: SideTodoItem[] = [
  { id: 1, title: '황수연 숙제검사', completed: true },
  { id: 2, title: '수업자료만들기', completed: true },
  { id: 3, title: '김영애 수업', completed: false },
  { id: 4, title: '김영애 피드백주기', completed: false },
  { id: 5, title: '김영애 과제주기', completed: false },
];

const SideTodoList = () => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">TO DO LIST</h3>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors border border-border">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="space-y-2">
        {todoItems.map((item) => (
          <div
            key={item.id}
            className="card-dark p-3 rounded-xl flex items-center justify-between"
          >
            <span className="text-sm">{item.title}</span>
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                item.completed
                  ? 'bg-accent border-accent'
                  : 'border-muted-foreground'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideTodoList;
