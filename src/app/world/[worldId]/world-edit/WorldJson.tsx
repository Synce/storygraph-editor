import {api} from '@/trpc/server';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/Accordion';
import {Button} from '@components/ui/Button';
import {ScrollArea, ScrollBar} from '@components/ui/ScrollArea';

type WorldJsonProps = {
  Id: string;
};

const WorldJson = async ({Id}: WorldJsonProps) => {
  const world = await api.world.getWorld({Id});

  return (
    <Accordion type="single" collapsible className="z-50 w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="px-10">{'JSON'}</AccordionTrigger>
        <AccordionContent className="absolute z-10 h-[80vh] w-full border border-slate-200 bg-slate-700">
          <ScrollArea className="h-full">
            <pre>{JSON.stringify(world, null, 2)}</pre>
            <Button className="absolute right-2 top-2">{'Kopiuj'}</Button>
            <ScrollBar />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default WorldJson;
