export default class EventTargetShim {
    constructor() {
        this.listeners = new Map();
    }
    addEventListener(eventType, listener) {
        const existing = this.listeners.get(eventType);
        if (existing)
            existing.add(listener);
        else
            this.listeners.set(eventType, new Set([listener]));
    }
    removeEventListener(eventType, listener) {
        const existing = this.listeners.get(eventType);
        if (existing)
            existing.delete(listener);
    }
    dispatchEvent(event) {
        const existing = this.listeners.get(event.type);
        if (existing) {
            for (let listener of existing.values()) {
                listener(event);
            }
        }
    }
}
