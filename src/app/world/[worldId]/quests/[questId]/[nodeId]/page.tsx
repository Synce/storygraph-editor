import NodeForm from '../NodeForm';

type EditNodePageProps = {
  params: {
    worldId: string;
    questId: string;
    nodeId: string;
  };
};

const EditNodePage = ({
  params: {worldId, questId, nodeId},
}: EditNodePageProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <NodeForm worldId={worldId} questId={questId} nodeId={nodeId} edit />
    </div>
  );
};

export default EditNodePage;
