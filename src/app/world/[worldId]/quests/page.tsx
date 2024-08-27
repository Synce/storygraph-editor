import QuestSelect from './QuestSelect';

type QuestsEditProps = {
  params: {
    worldId: string;
  };
};

const QuestsEdit = ({params: {worldId}}: QuestsEditProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <QuestSelect worldId={worldId} />
    </div>
  );
};

export default QuestsEdit;
