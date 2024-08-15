'use client';

import {Button} from '@components/ui/Button';
import {downloadJsonToFile} from '@utils/misc';

type CopyJsonButtonProps = {
  world: object;
};
const DownloadJSONButton = ({world}: CopyJsonButtonProps) => {
  return (
    <Button
      onClick={() => {
        downloadJsonToFile(world, 'world.json');
      }}>
      {'Pobierz plik JSON'}
    </Button>
  );
};

export default DownloadJSONButton;
