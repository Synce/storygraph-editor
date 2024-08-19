'use client';

import {DialogDescription} from '@components/ui/Dialog';
import useValidateJSONSchema from '@hooks/useValidateJSONSchema';

type WorldVerificationProps = {
  productions: object[];
};

const SCHEMA_URL =
  'https://raw.githubusercontent.com/iwonagg/StoryGraphPhD/master/json_validation/json_schema/schemas/schema_updated_20220213.json';

const ProductionVerification = ({productions}: WorldVerificationProps) => {
  const {errors, loading, error} = useValidateJSONSchema(
    SCHEMA_URL,
    productions,
  );

  if (loading)
    return <DialogDescription>{'Weryfikowanie...'}</DialogDescription>;

  if (errors || error)
    return (
      <pre className="text-black">
        {JSON.stringify(error ?? errors, null, 2)}
      </pre>
    );

  return (
    <DialogDescription>
      {'Zweryfikowano, produkcje są zgodne z formatem StoryGraph'}
    </DialogDescription>
  );
};

export default ProductionVerification;
