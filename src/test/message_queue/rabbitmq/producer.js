const amqp = require('amqplib');

const message = 'Hello, RabbitMQ for Ecommerce ';

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        console.log(channel);

        const queueName = 'test_topic';

        await channel.assertQueue(queueName, {
            durable: true,
        });

        //send message to consumer channel
        channel.sendToQueue(queueName, Buffer.from(message));
        console.log(`message::`, message);
        setTimeout(() => {
            connection.close;
            process.exit(0);
        }, 500);
    } catch (e) {
        console.log(e);
    }
};

runProducer().catch(console.error);
