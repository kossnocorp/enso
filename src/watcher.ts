import ParcelWatcher from "@parcel/watcher";
import { minimatch } from "minimatch";

const eventName = "*";

export class WatcherEvent extends Event {
  type: ParcelWatcher.EventType;
  path: string;

  constructor(type: ParcelWatcher.EventType, path: string) {
    super(type);
    this.type = type;
    this.path = path;
  }
}

export type WatcherEventListener = (event: WatcherEvent) => void;

export class Watcher {
  private target: EventTarget;

  constructor() {
    this.target = new EventTarget();
  }

  watch(pattern: string, listener: WatcherEventListener) {
    this.target.addEventListener(eventName, (event) => {
      const typedEvent = event as WatcherEvent;
      if (minimatch(typedEvent.path, pattern)) listener(typedEvent);
    });
  }
}
