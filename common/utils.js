import { consumerRegistry } from '../kafka/registry.js';

export const registerConsumer = (consumerClass) => {
    const consumer = new consumerClass();
    consumerRegistry.register(consumer.start.bind(consumer));
};

export const registerConsumerList = (consumerClassList) => {
    consumerClassList.forEach((consumerClass) => {
        registerConsumer(consumerClass);
    });
};

export class BaseSiteAbstractClass {
    constructor() {
        if (new.target === BaseSiteAbstractClass) {
            throw new Error('Abstract class cannot be instantiated directly.');
        }

        const abstractMethods = this.constructor.abstractMethods || [];
        for (const method of abstractMethods) {
            if (typeof this[method] !== 'function') {
                throw new Error(
                    `Class '${this.constructor.name}' must implement abstract method '${method}'.`
                );
            }
        }
    }
}
