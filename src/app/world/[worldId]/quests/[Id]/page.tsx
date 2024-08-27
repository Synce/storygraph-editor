type ShowQuestPageProps = {
  params: {
    worldId: string;
    Id: string;
  };
};

const ShowQuestPage = ({params: {worldId, Id}}: ShowQuestPageProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      {worldId} {Id}
    </div>
  );
};

export default ShowQuestPage;
