'use client';

import {Button} from '@components/ui/Button';
import {downloadJsonToFile} from '@utils/misc';

type CopyJsonButtonProps = {
  json: object;
  name: string;
};
const DownloadJSONButton = ({json, name}: CopyJsonButtonProps) => {
  return (
    <Button
      onClick={() => {
        downloadJsonToFile(json, name);
      }}>
      {'Pobierz plik JSON'}
    </Button>
  );
};

export default DownloadJSONButton;
