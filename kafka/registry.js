import log from 'npmlog';

class ConsumerRegister {
    static registry = [];

    register(consumer) {
        ConsumerRegister.registry.push(consumer);
    }

    startConsumers() {
        ConsumerRegister.registry.forEach((consumer) => consumer());
        log.info(
            `Started ${ConsumerRegister.registry.length} ${ConsumerRegister.registry.length > 1 ? 'consumers' : 'consumer'}`
        );
    }
}

export const consumerRegistry = new ConsumerRegister();
