const amqplib = require('amqplib');

const runConsumer = async () => {
    try {
        const connection = await amqplib.connect(
            'amqp://guest:guest@localhost'
        );
        const channel = await connection.createChannel();

        const queueName = 'test_topic';

        await channel.assertQueue(queueName, {
            durable: true,
        });

        //send message to consumer channel
        channel.consume(
            queueName,
            (message) => {
                console.log(`Received message: ${message.content.toString()}`);
            },
            { noAck: false }
        );
    } catch (e) {
        console.log(e);
    }
};

runConsumer().catch(console.error);
