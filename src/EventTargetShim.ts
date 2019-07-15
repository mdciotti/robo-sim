export default class EventTargetShim {
	private listeners: Map<string, Set<EventListener>> = new Map();

	public addEventListener(eventType: string, listener: EventListener): void {
		const existing = this.listeners.get(eventType);
		if (existing) existing.add(listener);
		else this.listeners.set(eventType, new Set([listener]));
	}

	public removeEventListener(eventType: string, listener: EventListener): void {
		const existing = this.listeners.get(eventType);
		if (existing) existing.delete(listener);
	}

	public dispatchEvent(event: Event|CustomEvent<any>) {
		const existing = this.listeners.get(event.type);
		if (existing) for (let listener of existing.values()) listener(event);
	}
}
