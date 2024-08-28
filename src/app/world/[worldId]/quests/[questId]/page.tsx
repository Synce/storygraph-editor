import RootMap from './RootMap';

type ShowQuestPageProps = {
  params: {
    worldId: string;
    questId: string;
  };
};

const ShowQuestPage = ({params: {worldId, questId}}: ShowQuestPageProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <RootMap worldId={worldId} questId={questId} />
    </div>
  );
};

export default ShowQuestPage;
