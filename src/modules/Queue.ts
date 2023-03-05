export default class Queue<T> {
  private queue: T[];
  private inUse: boolean;

  constructor() {
    this.queue = [];
    this.inUse = false;
  }

  get length(): number {
    return this.queue.length;
  }

  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  add(element: T): void {
    this.queue.push(element);
  }

  remove(index: number, deleteCount: number = 1): void {
    if (index < 0) {
      index = this.queue.length + index;
    }
    if (index >= 0 && index <= this.queue.length - 1) {
      this.queue.splice(index, deleteCount);
    }
  }

  removeFirst(): void {
    this.remove(0);
  }

  removeLast(): void {
    this.remove(-1);
  }

  get(index: number): T | null {
    if (index >= 0 && index <= this.queue.length - 1) {
      return this.queue[index];
    }
    if (index < 0 && Math.abs(index) <= this.queue.length) {
      return this.queue[this.queue.length + index];
    }
    return null;
  }

  get first(): T | null {
    return this.get(0);
  }

  get last(): T | null {
    return this.get(-1);
  }

  processFirst(
    promiseFunc: (first: T) => Promise<void>,
    delayAfter: number = 0
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const first = this.first;
      if (first !== null && !this.inUse) {
        this.inUse = true;
        promiseFunc(first)
          .then(() => {
            setTimeout(() => {
              this.removeFirst();
              this.inUse = false;
              resolve();
            }, delayAfter);
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }

  processAll(
    promiseFunc: (element: T) => Promise<void>,
    delayBetween: number = 0
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const processNext = () => {
        const element = this.first;
        if (element !== null && !this.inUse) {
          this.inUse = true;
          promiseFunc(element)
            .then(() => {
              this.removeFirst();
              this.inUse = false;
              if (this.isEmpty) {
                resolve();
              } else {
                setTimeout(processNext, delayBetween);
              }
            })
            .catch((error) => {
              this.inUse = false;
              reject(error);
            });
        } else {
          resolve();
        }
      };
      processNext();
    });
  }
}
