import { Upload } from 'lucide-react';

interface Question {
  id: number;
  label: string;
  active: boolean;
}

const questions: Question[] = [
  { id: 1, label: 'Q. 1', active: true },
  { id: 2, label: 'Q. 2', active: false },
  { id: 3, label: 'Q. 3', active: false },
  { id: 4, label: 'Q. 4', active: false },
];

const QnASection = () => {
  return (
    <div className="mt-6">
      <h2 className="section-title mb-4">질의응답</h2>
      
      <div className="card-glass p-6">
        <div className="flex gap-6">
          {/* 질문 목록 */}
          <div className="flex flex-col gap-2">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-center gap-2">
                {index > 0 && (
                  <div className={`w-2 h-2 rounded-full ${q.active ? 'bg-accent' : 'bg-muted'}`} />
                )}
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    q.active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {q.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* 질문 내용 */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">질문제목</h3>
              <p className="text-muted-foreground text-sm">질문내용</p>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-accent text-sm">
                보내기
              </button>
              <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                <Upload size={18} />
              </button>
            </div>
            
            {/* 답변 입력 */}
            <input
              type="text"
              placeholder="답변하기"
              className="input-field"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnASection;
