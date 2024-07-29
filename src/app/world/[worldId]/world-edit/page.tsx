import RootMap from './RootMap';
import WorldJson from './WorldJson';

type WorldEditPageProps = {
  params: {
    worldId: string;
  };
};

const WorldEditPage = ({params: {worldId}}: WorldEditPageProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <WorldJson Id={worldId} />
      <RootMap Id={worldId} />
    </div>
  );
};
export default WorldEditPage;
