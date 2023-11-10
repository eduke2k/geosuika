import { DroppableSet } from "../types";

export const flagSet: DroppableSet = {
  randomizeOrder: true,
  tierScles: [
    0.26,
    0.33,
    0.48,
    0.56,
    0.72,
    0.93,
    1.07,
    1.32,
    1.46,
    1.83,
    2.16,
  ],
  droppableConfigs: [
    {
      spriteKey: 'flags',
      animationKey: 'flags:de',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:gb',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:ni',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:jm',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:jp',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:it',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:br',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:ch',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:ca',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:bw',
      bodyConfig: { type: 'circle', radius: 64	}
    },
    {
      spriteKey: 'flags',
      animationKey: 'flags:td',
      bodyConfig: { type: 'circle', radius: 64	}
    }
  ]
};
