import { Watcher, WatcherEvent } from "./watcher.js";
import { setup } from "xstate";

export class Root {
  watcher: Watcher;

  constructor(watcher: Watcher) {
    this.watcher = watcher;
    watcher.watch("package.json", this.update);
  }

  update(event: WatcherEvent) {}
}

export const rootMachine = setup({
  types: {
    context: {} as {},
    events: {} as
      | { type: "rootRead" }
      | { type: "rootUpdated" }
      | { type: "packagesRead" }
      | { type: "packagesUpdated" }
      | { type: "rootPackageUpdated" }
      | { type: "packagesInitialized" }
      | { type: "rootPackageUpdatedRead" },
  },
  guards: {
    valid: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
    updatingPackages: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
  },
  schemas: {
    events: {
      rootRead: {
        type: "object",
        properties: {},
      },
      rootUpdated: {
        type: "object",
        properties: {},
      },
      packagesRead: {
        type: "object",
        properties: {},
      },
      packagesUpdated: {
        type: "object",
        properties: {},
      },
      rootPackageUpdated: {
        type: "object",
        properties: {},
      },
      packagesInitialized: {
        type: "object",
        properties: {},
      },
      rootPackageUpdatedRead: {
        type: "object",
        properties: {},
      },
    },
  },
}).createMachine({
  context: {},
  id: "enso",
  initial: "readingRoot",
  states: {
    readingRoot: {
      on: {
        rootRead: [
          {
            target: "readingPackages",
            guard: {
              type: "valid",
            },
          },
          {
            target: "listeningRoot",
          },
        ],
      },
    },
    readingPackages: {
      on: {
        packagesRead: {
          target: "initializingPackages",
        },
      },
    },
    listeningRoot: {
      on: {
        rootUpdated: {
          target: "readingRoot",
        },
      },
    },
    initializingPackages: {
      on: {
        packagesInitialized: {
          target: "Initialized",
        },
      },
    },
    Initialized: {
      initial: "waitingForRootUpdate",
      states: {
        waitingForRootUpdate: {
          on: {
            rootPackageUpdated: [
              {
                target: "New state 1",
                guard: {
                  type: "updatingPackages",
                },
              },
              {
                target: "readingUpdatedRootPackage",
              },
            ],
          },
        },
        "New state 1": {},
        readingUpdatedRootPackage: {
          on: {
            rootPackageUpdatedRead: [
              {
                target: "updatingPackages",
                guard: {
                  type: "valid",
                },
              },
              {
                target: "waitingForRootPackageFix",
              },
            ],
          },
        },
        updatingPackages: {
          on: {
            packagesUpdated: {
              target: "waitingForRootUpdate",
            },
          },
        },
        waitingForRootPackageFix: {
          on: {
            rootPackageUpdated: {
              target: "readingUpdatedRootPackage",
            },
          },
        },
      },
    },
  },
});
