import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {
  type NarrationSchema,
  worldSchema,
  type ItemSchema,
  type CharacterSchema,
  type ConnectionSchema,
} from '@schemas/worldSchema';

export const worldRouter = createTRPCRouter({
  loadWorld: publicProcedure
    .input(worldSchema)
    .mutation(async ({ctx, input}) => {
      const {LSide, RSide, Instructions, Preconditions, ...world} = input;

      const createNarration = (Narration?: NarrationSchema[]) => {
        if (!Narration) return undefined;

        return {
          createMany: {
            data: Narration,
          },
        };
      };

      const createItems = (Items?: ItemSchema[]) => {
        if (!Items) return undefined;

        return {
          createMany: {
            data: Items?.map(({Narration, Items, ...item}) => ({
              ...item,
              // Narration: createNarration(Narration),
              SubItems: createNarration(Items),
            })),
          },
        };
      };

      const createCharacters = (Characters?: CharacterSchema[]) => {
        if (!Characters) return undefined;

        return {
          createMany: {
            data: Characters?.map(({Narration, Items, ...item}) => ({
              ...item,
              Narration: createNarration(Narration),
              Items: createNarration(Items),
            })),
          },
        };
      };

      const createConnections = (Connections?: ConnectionSchema[]) => {
        if (!Connections) return undefined;
        return {
          createMany: {
            data: Connections,
          },
        };
      };

      return ctx.db.world.create({
        data: {
          ...world,
          Locations: {c},
        },
      });
    }),

  // create: publicProcedure
  //   .input(z.object({name: z.string().min(1)}))
  //   .mutation(async ({ctx, input}) => {
  //     // simulate a slow db call
  //     await new Promise(resolve => {
  //       setTimeout(resolve, 1000);
  //     });

  //   }),

  getLatest: publicProcedure.query(({ctx}) => {
    return ctx.db.world.findFirst({
      include: {
        Locations: {
          include: {
            Characters: {
              include: {
                Items: true,
                // dodaj więcej inkluzji, jeśli istnieją kolejne zagnieżdżenia
              },
            },
            Items: true,
            Connections: true,
            // dodaj więcej inkluzji, jeśli istnieją kolejne zagnieżdżenia
          },
        },
      },
    });
  }),
});
