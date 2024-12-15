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
