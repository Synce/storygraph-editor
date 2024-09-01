import QuestJson from './QuestJson';
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
      <div className="absolute right-5 top-[2.125rem] z-50">
        <QuestJson questId={questId} />
      </div>
      <RootMap worldId={worldId} questId={questId} />
    </div>
  );
};

export default ShowQuestPage;
