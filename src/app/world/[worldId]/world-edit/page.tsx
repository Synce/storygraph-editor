import RootMap from './RootMap';
import WorldJson from './WorldJson';

type WorldEditPageProps = {
  params: {
    worldId: string;
  };
};

const WorldEditPage = ({params: {worldId}}: WorldEditPageProps) => {
  return (
    <div className="flex  h-full w-full flex-col bg-slate-800">
      <WorldJson Id={worldId} />
      <RootMap Id={worldId} />
    </div>
  );
};
export default WorldEditPage;
