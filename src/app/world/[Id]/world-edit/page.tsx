import WorldMap from '@/app/_components/WorldMap';

import WorldJson from './WorldJson';

type WorldEditPageProps = {
  params: {
    Id: string;
  };
};

const WorldEditPage = ({params: {Id}}: WorldEditPageProps) => {
  return (
    <div className="flex  h-full w-full flex-col bg-slate-800">
      <WorldJson Id={Id} />
      <WorldMap Id={Id} />
    </div>
  );
};
export default WorldEditPage;
