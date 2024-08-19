'use client';

import {DialogDescription} from '@components/ui/Dialog';
import useValidateJSONSchema from '@hooks/useValidateJSONSchema';

type WorldVerificationProps = {
  world: object;
};

const SCHEMA_URL =
  'https://raw.githubusercontent.com/iwonagg/StoryGraphPhD/master/json_validation/json_schema/schemas/schema_updated_20220213.json';

const WorldVerification = ({world}: WorldVerificationProps) => {
  const {errors, loading, error} = useValidateJSONSchema(SCHEMA_URL, world);

  if (loading)
    return <DialogDescription>{'Weryfikowanie...'}</DialogDescription>;

  if (errors || error)
    return (
      <DialogDescription>{JSON.stringify(error ?? errors)}</DialogDescription>
    );

  return (
    <DialogDescription>
      {'Zweryfikowano, świat jest zgodny z formatem StoryGraph'}
    </DialogDescription>
  );
};

export default WorldVerification;
