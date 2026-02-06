const MemoWidget = () => {
  return (
    <div className="mt-4">
      <h3 className="font-bold text-foreground text-center mb-4">MEMO</h3>
      
      <div className="card-dark p-4 rounded-2xl min-h-32">
        <textarea
          placeholder="개인의 메모장"
          className="w-full h-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground"
          rows={4}
        />
      </div>
    </div>
  );
};

export default MemoWidget;
