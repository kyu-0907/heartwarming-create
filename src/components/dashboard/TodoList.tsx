interface TodoItem {
  id: number;
  subject: string;
  task: string;
  completed: boolean;
}

const todoItems: TodoItem[] = [
  { id: 1, subject: '국어', task: '문법 강의', completed: true },
  { id: 2, subject: '영어', task: '모의고사', completed: true },
  { id: 3, subject: '영어', task: '단어 암기', completed: false },
  { id: 4, subject: '수학', task: '100제 한단원 끝내기', completed: false },
  { id: 5, subject: '수학', task: '오답 노트', completed: false },
];

const TodoList = () => {
  return (
    <div className="card-dark p-4 h-full">
      <h2 className="text-accent font-bold mb-4">TO DO LIST</h2>
      
      <div className="space-y-2">
        {todoItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                item.completed
                  ? 'bg-accent border-accent'
                  : 'border-muted-foreground'
              }`}
            />
            <span className="subject-badge bg-secondary/20 text-secondary-foreground">
              {item.subject}
            </span>
            <span className="text-sm text-card-foreground">{item.task}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
