import Utils from "./modules/Utils";
import Queue from "./modules/Queue";
import Events from "./modules/Events";

const seTools = {
  event: new Events(),
  queue: Queue,
  utils: Utils,
};

declare global {
  interface Window {
    seTools: {
      event: Events;
      queue: typeof Queue;
      utils: typeof Utils;
    };
  }
}

export default seTools;
window.seTools = seTools;
