'use client';

import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';

type CopyWorldIdButtonProps = {
  Id: string;
};

const CopyWorldIdButton = ({Id}: CopyWorldIdButtonProps) => {
  const {toast} = useToast();

  return (
    <Button
      onClick={() => {
        void navigator.clipboard.writeText(Id).then(() => {
          toast({
            title: 'Skopiowano do schowka',
          });
        });
      }}
      variant="secondary">
      {'Skopiuj ID świata'}
    </Button>
  );
};
export default CopyWorldIdButton;
