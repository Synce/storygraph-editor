import CreateQuestsForm from './CreateQuestForm';

type CreateQuestPageProps = {
  params: {
    worldId: string;
  };
};

const LoadQuestsPage = ({params: {worldId}}: CreateQuestPageProps) => {
  return (
    <main className="flex  w-full grow flex-col bg-slate-700">
      <CreateQuestsForm worldId={worldId} />
    </main>
  );
};

export default LoadQuestsPage;
