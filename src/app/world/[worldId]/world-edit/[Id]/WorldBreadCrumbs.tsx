'use client';

import {useRouter} from 'next/navigation';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import Breadcrumbs from '@components/breadcrumbs/Breadcrumbs';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';

type Node = NonNullable<RouterOutputs['world']['getAncestors']>[number];
type WorldBreadCrumbsProps = {
  path: Node[];
  currentItemName: string | null;
  currentItemId: string;
};

const WorldBreadCrumbs = ({
  path,
  currentItemName,
  currentItemId,
}: WorldBreadCrumbsProps) => {
  const router = useRouter();
  const {toast} = useToast();

  const navigateToNode = (node: Node) => {
    if (node.depth === 1) router.push(`/world/${node.worldId}/world-edit`);
    else
      router.push(`/world/${node.worldId}/world-edit/${node.WorldContent.Id}`);
  };
  const utils = api.useUtils();

  const removeNode = api.world.removeNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      void utils.invalidate();
      navigateToNode(path[path.length - 1]!);
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });

  return (
    <div className="flex w-full flex-row justify-between py-4">
      <Breadcrumbs
        data={path}
        keyExtractor={item => item.id}
        onItemClick={item => {
          navigateToNode(item);
        }}
        nameExtractor={item => item.WorldContent?.Name ?? 'World'}
        lastItemName={currentItemName ?? 'Brak nazwy'}
      />
      <Button
        onClick={() => {
          removeNode.mutate({Id: currentItemId});
        }}
        variant="destructive">
        {'Usuń'}
      </Button>
    </div>
  );
};

export default WorldBreadCrumbs;
