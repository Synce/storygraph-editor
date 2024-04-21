import _ from 'lodash';
import {useRouter} from 'next/navigation';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import Label from '@components/form/Label';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type AddNodeSchema} from '@schemas/worldInputApiSchemas';

import SubContent from './SubContent';

type Location = NonNullable<RouterOutputs['world']['getLocation']>;

type Characters = Location['Characters'];
type Items = Location['Items'];
type Narration = Location['Narration'];

type CharactersListProps = {
  content: Characters | Items | Narration;
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
            GivenId={x.GivenId}
            type={config.Type}
            key={x.Id}
            onDelete={() => {
              removeNode.mutate({Id: x.Id, Type: config.Type});
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SubContentList;
