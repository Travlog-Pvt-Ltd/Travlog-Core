import { consumerRegistry } from '../kafka/registry.js';

export const registerConsumer = (consumer) => {
    consumerRegistry.register(consumer);
    return consumer;
};
