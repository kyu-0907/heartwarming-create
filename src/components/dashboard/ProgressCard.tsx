const ProgressCard = () => {
  const progress = 40;
  
  return (
    <div className="card-glass p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">계획 이행률</span>
        <span className="text-sm text-muted-foreground">2/5개 완료</span>
        <span className="text-lg font-bold text-primary">{progress}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;
