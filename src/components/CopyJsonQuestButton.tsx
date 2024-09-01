'use client';

import {Button} from '@components/ui/Button';
import {copyJsonToClipboard} from '@utils/misc';

type CopyJsonQuestButtonProps = {
  quest: object;
};
const CopyJsonQuestButton = ({quest}: CopyJsonQuestButtonProps) => {
  return (
    <Button
      onClick={() => {
        copyJsonToClipboard(quest);
      }}>
      {'Kopiuj'}
    </Button>
  );
};

export default CopyJsonQuestButton;
