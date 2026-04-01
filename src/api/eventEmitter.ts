// src/services/eventEmitter.ts
type EventCallback = (data: any) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export const eventEmitter = new EventEmitter();