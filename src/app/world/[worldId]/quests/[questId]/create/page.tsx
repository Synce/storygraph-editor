import NodeForm from '../NodeForm';

type NodeCreateProps = {
  params: {
    worldId: string;
    questId: string;
  };
};

const NodeCreate = ({params: {worldId, questId}}: NodeCreateProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <NodeForm worldId={worldId} questId={questId} edit={false} />
    </div>
  );
};

export default NodeCreate;
