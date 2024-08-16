import {api} from '@/trpc/server';

import ProductionForm from '../ProductionForm';

type ProductionsEditProps = {
  params: {
    worldId: string;
  };
};

const ProductionCreate = async ({params: {worldId}}: ProductionsEditProps) => {
  const productions = await api.productions.getProductions({worldId});
  const names = productions.map(item => item.Title);
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <ProductionForm productionNames={names} worldId={worldId} />
    </div>
  );
};

export default ProductionCreate;
