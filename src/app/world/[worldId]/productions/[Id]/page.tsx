import {api} from '@/trpc/server';
import {convertToPlainObject} from '@utils/misc';

import ProductionForm from '../ProductionForm';

type EditProductionPageProps = {
  params: {
    worldId: string;
    Id: string;
  };
};

const EditProductionPage = async ({
  params: {worldId, Id},
}: EditProductionPageProps) => {
  const productions = await api.productions.getProductions({worldId});
  const production = await api.productions.getProduction({Id});

  const names = productions.map(item => item.Title);
  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <ProductionForm
        productionNames={names}
        worldId={worldId}
        production={convertToPlainObject(production)}
      />
    </div>
  );
};

export default EditProductionPage;
