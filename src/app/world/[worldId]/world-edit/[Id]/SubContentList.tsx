import {type WorldContent} from '@prisma/client';
import _ from 'lodash';
import {useRouter} from 'next/navigation';

import {api} from '@/trpc/react';
import Label from '@components/form/Label';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type AddNodeSchema} from '@schemas/worldInputApiSchemas';

import SubContent from './SubContent';

type CharactersListProps = {
  content: WorldContent[];
} & AddNodeSchema;

const SubContentList = ({content, ...config}: CharactersListProps) => {
  const {toast} = useToast();
  const router = useRouter();
  const removeNode = api.world.removeNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });

  const addNode = api.world.addNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });

  return (
    <div>
      <Label>{`${_.upperFirst(config.Type)}s`}</Label>

      <Button
        onClick={() => {
          addNode.mutate(config);
        }}>
        {'DODAJ'}
      </Button>
      <div className="flex flex-col gap-10">
        {content.map(x => (
          <SubContent
            Id={x.Id}
            name={x?.Name}
            type={config.Type}
            key={x.Id}
            onDelete={() => {
              removeNode.mutate({Id: x.Id});
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SubContentList;
