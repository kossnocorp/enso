import { Watcher, WatcherEvent } from "./watcher.js";

export class Root {
  watcher: Watcher;

  constructor(watcher: Watcher) {
    this.watcher = watcher;
    watcher.watch("package.json", this.update);
  }

  update(event: WatcherEvent) {}
}
