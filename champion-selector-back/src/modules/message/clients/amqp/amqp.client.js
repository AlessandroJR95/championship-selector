import { Subject, iif, of, defer, Observable } from 'rxjs';
import { retryWhen, concatMap, tap } from 'rxjs/operators';
import amqp from 'amqplib/callback_api';
import { genericRetryStrategy } from '../../../utils/retry';
import { generateID } from '../../../utils/hash';

export class AmqpClient {
    constructor() {
        this.CONNECTION_URL = `amqp://${process.env.MSG_URL}@rabbitmq:5672`;
        this.TOPIC_EXCHANGE = 'TOPIC_EXCHANGE';
        this.channel = null;
        this.buffer = [];
        this.queue = new Subject();
        this.connection = new Subject();

        this.queue.pipe(
            tap((command) => {
                if (command.command === 'SUBSCRIBE_QUEUE' || command.command === 'SUBSCRIBE_TOPIC') {
                    this.buffer.unshift(command);
                } else {
                    this.buffer.push(command);
                }
            }),
            tap(() => {
                if (this.channel) {
                    this.buffer.forEach((item) => {
                        try {
                            switch(item.command) {
                                case 'PUBLISH':
                                    this.publishToChannel(this.channel, item.payload.queue, item.payload.message);
                                    break;
                                case 'DISPATCH':
                                    this.dispatchToChannel(this.channel, item.payload.channel, item.payload.message);
                                    break;
                                case 'SUBSCRIBE_QUEUE':
                                    this.subscribeToQueueChannel(this.channel, item.payload.queue, item.payload.callback);
                                    break;
                                case 'SUBSCRIBE_TOPIC':
                                    this.subscribeToTopicChannel(this.channel, item.payload.channel, item.payload.callback);
                                    break;
                                case 'SUBSCRIBE_RPC':
                                    this.subscribeToRPCQueue(this.channel, item.payload.queue, item.payload.callback);
                                    break;
                                case 'PUBLISH_RPC':
                                    this.publishToRPCQueue(this.channel, item.payload.channel, item.payload.message).then(item.payload.resolve).catch(item.payload.reject);
                                    break;
                                default:
                                    break;
                            }

                        } catch (e) {
                            console.log('error', item, e);
                            this.reconnect();
                        }

                    });

                    this.buffer = [];
                }
            }),
        ).subscribe(
            () => {},
            (err) => {
                console.log('SUB ERROR!', err);
                this.reconnect();
            }
        );

        this.connection.pipe(
            concatMap(() => iif(
                () => this.channel,
                of(this.channel),
                defer(() => this.getChannel()).pipe(
                    retryWhen(
                        genericRetryStrategy({
                            maxRetryAttempts: 10,
                            scalingDuration: 2000
                        })
                    ),
                    tap((channel) => this.channel = channel)
                )
            )),
        ).subscribe(() => {
            console.log('connected');
        }, (err) => {
            console.error('Error: ', err);
            this.reconnect();
        });

        this.connection.next();

    }

    reconnect() {
        this.channel = null;
        this.connection.next();
    }

    getChannel() {
        const context = this;

        return Observable.create((observable) => {
            amqp.connect(context.CONNECTION_URL, (err, conn) => {
                if (err) return observable.error(err);

                conn.createChannel((error, channel) => {
                    if (error) return  observable.error(error);

                    channel.on('error', (e) => {
                        observable.error(e);
                    });

                    observable.next(channel);
                });
            });
        });

    }

    dispatchToChannel(channel, key, message) { 
        const TOPIC_EXCHANGE = this.TOPIC_EXCHANGE;

        channel.assertExchange(TOPIC_EXCHANGE, 'topic', {
            durable: false
        });

        channel.publish(TOPIC_EXCHANGE, key, Buffer.from(JSON.stringify(message)));
    }

    publishToRPCQueue(channel, queue, message) {
        return new Promise((resolve, reject) => {
            channel.assertQueue('', {
                exclusive: true
            }, function(err, q) {

                if (err) return reject(err);

                const correlationId = generateID();
    
                channel.consume(q.queue, function(msg) {
                    if (msg.properties.correlationId == correlationId) {
                        resolve(msg);
                    }
                }, {
                    noAck: true
                });
    
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    correlationId: correlationId, 
                    replyTo: q.queue,
                    persistent: true
                });
            });
        });
    }

    publishToChannel(channel, queue, message) {
        channel.assertQueue(queue, {
            durable: true
        });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
    }

    subscribeToTopicChannel(channel, key, callback) {
        const TOPIC_EXCHANGE = this.TOPIC_EXCHANGE;

        channel.assertExchange(TOPIC_EXCHANGE, 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function(err, q) {
            if (err) {
                throw err;
            }

            channel.bindQueue(q.queue, TOPIC_EXCHANGE, key);

            channel.consume(q.queue, (msg) => {
                try {
                    callback(JSON.parse(msg.content.toString()));
                } catch (e) {
                    console.error(e);
                }
            }, {
                noAck: true
            });
        });
    }

    subscribeToQueueChannel(channel, queue, callback) {
        channel.assertQueue(queue, {
            durable: true
        });

        channel.prefetch(1);

        channel.consume(queue, function(msg) {
            try {
                callback(JSON.parse(msg.content.toString()));
            } catch (e) {
                console.error(e);
            }
        }, {
            noAck: true
        });
    }

    subscribeToRPCQueue(channel, queue, callback) {
        channel.assertQueue(queue, {
            durable: true
        });

        channel.prefetch(1);

        channel.consume(queue, function(msg) {
            try {
                callback(JSON.parse(msg.content.toString())).then((toReply) => {
                    channel.sendToQueue(
                        msg.properties.replyTo,
                        Buffer.from(toReply ? JSON.stringify(toReply) : ''), {
                            correlationId: msg.properties.correlationId
                        }
                    );
                });
            } catch (e) {
                console.error(e);
            }
        }, {
            noAck: true
        });
    }

    publish(queue, message) {
        this.queue.next({ command: 'PUBLISH', payload: { queue, message } });
    }

    dispatch(channel, message) {
        this.queue.next({ command: 'DISPATCH', payload: { channel, message } });
    }

    subscribeToQueue(queue, callback) {
        this.queue.next({ command: 'SUBSCRIBE_QUEUE', payload: { queue, callback } });
    }

    subscribeToTopic(channel, callback) {
        this.queue.next({ command: 'SUBSCRIBE_TOPIC', payload: { channel, callback } });
    }

    subscribeToRPC(queue, callback) {
        this.queue.next({ command: 'SUBSCRIBE_RPC', payload: { queue, callback } });
    }

    publishToRPC(channel, message) {
        return new Promise((resolve, reject) => this.queue.next({ command: 'PUBLISH_RPC', payload: { channel, message, resolve, reject } }))
    }
}
