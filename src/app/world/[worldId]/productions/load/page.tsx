import LoadProductionsForm from './LoadProductionsForm';

type LoadProductionsPageProps = {
  params: {
    worldId: string;
  };
};

const LoadProductionsPage = ({params: {worldId}}: LoadProductionsPageProps) => {
  return (
    <main className="flex w-full flex-grow items-center justify-center bg-slate-900">
      <LoadProductionsForm worldId={worldId} />
    </main>
  );
};

export default LoadProductionsPage;
