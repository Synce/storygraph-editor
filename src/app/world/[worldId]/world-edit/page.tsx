import RootMap from './RootMap';

type WorldEditPageProps = {
  params: {
    worldId: string;
  };
};

const WorldEditPage = ({params: {worldId}}: WorldEditPageProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <RootMap Id={worldId} />
    </div>
  );
};
export default WorldEditPage;
