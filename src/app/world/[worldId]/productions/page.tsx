import RootMap from './RootMap';

type ProductionsEditProps = {
  params: {
    worldId: string;
  };
};

const ProductionsEdit = ({params: {worldId}}: ProductionsEditProps) => {
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <RootMap Id={worldId} />
    </div>
  );
};

export default ProductionsEdit;
