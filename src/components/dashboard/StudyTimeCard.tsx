const StudyTimeCard = () => {
  // 간단한 차트 데이터
  const chartData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80];
  const maxValue = Math.max(...chartData);
  
  return (
    <div className="card-lavender">
      <span className="text-sm font-medium text-lavender-dark mb-2 block">공부시간</span>
      
      <div className="flex items-end gap-4">
        <span className="text-3xl font-bold text-lavender-dark">8h45m</span>
        
        {/* 미니 차트 */}
        <div className="flex items-end gap-1 h-12 flex-1">
          {chartData.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-lavender-dark/30 rounded-t"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyTimeCard;
