//@ts-ignore
import Ws from '@adonisjs/websocket-client';

export type SocketMessage = {
    type: string,
    obj?: any
}

export type Subscription = {
    emit(event: string, data: JSON): void,
    on(event: string, callback: Function): SocketMessage,
    off(event: string, callback: Function): void,
    close(): void,
    eventsSeted: boolean,
}

export type AdonisSocket = {
    connect(): void,
    close(): void,
    on(event: string, callback: Function): void,
    getSubscription(topic: string): Subscription,
    subscribe(topic: string): Subscription

}


export class SocketConnection {
    ws: AdonisSocket | undefined;

    constructor() {
        this.ws = undefined
        this.connect = this.connect.bind(this)
        this.subscribe = this.subscribe.bind(this)
    }

    connect() {
        if (this.ws) return this
        this.ws = Ws(process.env.REACT_APP_WS_URL)
            // .withApiToken(token)
            .connect();

        this.ws?.on('open', () => {
            console.log('Connection initialized')
        });

        this.ws?.on('close', () => {
            console.log('Connection closed')
        });

        return this
    }

    getSubscription(topic: string): Subscription | undefined {
        return this.ws?.getSubscription(topic)
    }

    subscribe(channel: string, handler?: Function) {
        if (!this.ws) {
            setTimeout(() => this.subscribe(channel, handler), 1000)
        } else {
            const result = this.ws.subscribe(channel);

            console.log(result)

            result.on('message', (message: any) => {
                console.log('Incoming', message);
                if (handler) handler(message)
            });

            result.on('error', (error: any) => {
                console.error(error)
            });

            console.log(result)

            return result
        }
    }
}

export default new SocketConnection()
