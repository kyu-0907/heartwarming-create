interface Assignment {
  id: number;
  title: string;
  link: string;
}

const assignments: Assignment[] = [
  { id: 1, title: '셀스터디 학습지1 풀기', link: '셀스터디 학습지1' },
  { id: 2, title: '영어 단어 50개 외우기', link: '셀스터디 VOCA' },
];

const AssignmentCard = () => {
  return (
    <div className="card-glass p-4">
      <h3 className="text-accent font-bold mb-4">과제</h3>
      
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
          >
            <span className="text-sm text-foreground">{assignment.title}</span>
            <a
              href="#"
              className="text-sm text-primary hover:underline"
            >
              {assignment.link}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentCard;
