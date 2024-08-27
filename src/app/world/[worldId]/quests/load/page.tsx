import LoadQuestsForm from './LoadQuestsForm';

type LoadQuestsPageProps = {
  params: {
    worldId: string;
  };
};

const LoadQuestsPage = ({params: {worldId}}: LoadQuestsPageProps) => {
  return (
    <main className="flex w-full flex-grow items-center justify-center bg-slate-900">
      <LoadQuestsForm worldId={worldId} />
    </main>
  );
};

export default LoadQuestsPage;
