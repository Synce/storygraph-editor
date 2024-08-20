'use client';

import {Button} from '@components/ui/Button';
import {copyJsonToClipboard} from '@utils/misc';

type CopyJsonButtonProps = {
  world: object;
};
const CopyJsonButton = ({world}: CopyJsonButtonProps) => {
  return (
    <Button
      onClick={() => {
        copyJsonToClipboard(world);
      }}>
      {'Kopiuj'}
    </Button>
  );
};

export default CopyJsonButton;
