const FeedbackCard = () => {
  return (
    <div className="card-glass p-4">
      <h3 className="font-bold mb-4 text-foreground">투데이 피드백(멘토 TO 멘티)</h3>
      
      <div className="space-y-3">
        <textarea
          placeholder="오늘의 공부에 피드백 남기기."
          className="input-field resize-none h-20"
        />
        
        <div className="flex justify-end">
          <button className="btn-accent text-sm">
            보내기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
