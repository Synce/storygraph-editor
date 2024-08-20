import {type WorldContent} from '@prisma/client';
import _ from 'lodash';
import {useRouter} from 'next/navigation';

import {api} from '@/trpc/react';
import {Button} from '@components/ui/Button';
import {ScrollArea, ScrollBar} from '@components/ui/ScrollArea';
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
    <div className="flex flex-col gap-4 rounded bg-slate-500 p-4">
      <div className="flex flex-row items-center gap-4">
        <p className="text-lg">{`${_.upperFirst(config.Type)}s`}</p>
        <Button
          onClick={() => {
            addNode.mutate(config);
          }}>
          {'DODAJ'}
        </Button>
      </div>
      {content.length > 0 && (
        <ScrollArea className="max-h-80">
          <div className="flex flex-col gap-2">
            {content.map(x => (
              <SubContent
                Id={x.Id}
                name={x?.Name}
                key={x.Id}
                onDelete={() => {
                  removeNode.mutate({Id: x.Id});
                }}
              />
            ))}
          </div>
          <ScrollBar />
        </ScrollArea>
      )}
    </div>
  );
};

export default SubContentList;
