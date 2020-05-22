import { OutgoingPacket, InboxDto, IncomingPacket, MessageDto } from "./chat";
import { EventProducer } from "./EventProducer";

interface ProxyEventMap {
    "login": () => void;
    "message": (channelId: string, message: MessageDto) => void;
    "conversation": (channelId: string) => void;
}

class Proxy extends EventProducer<ProxyEventMap>
{
    private ws: WebSocket;
    inbox: InboxDto | null = null;
    constructor() {
        super();

        // this.ws = new WebSocket("ws://echo.websocket.org/");
        this.ws = new WebSocket("wss://raja.aut.bme.hu/chat/");
        this.ws.addEventListener("open", () => {
            // proxy.sendPacket({ type: "register", email: "custom_test@gmail.com", password: "test", displayName: "custom_test", staySignedIn: false });
        });
        
        this.ws.addEventListener("message", e => {
            // let p = <IncomingPacket>JSON.parse(e.data);
            let p = JSON.parse(e.data) as IncomingPacket;
            console.log(p)
            switch (p.type) {
                case "error":
                    alert(p.message);
                    break;
                case "login":
                    this.inbox = p.inbox;
                    this.dispatch("login");
                    break;
                case "message":
                    let cid = p.channelId;
                    this.inbox!.conversations.find(x => x.channelId === cid)?.lastMessages.push(p.message);
                    this.dispatch("message", cid, p.message);
                    break;
                case "conversationAdded":
                    this.inbox!.conversations.push(p.conversation);
                    this.dispatch("conversation", p.conversation.channelId);
                    break;
            }
        });
    }


    sendPacket(packet: OutgoingPacket) {
        this.ws.send(JSON.stringify(packet));
    }
    

}
export var proxy = new Proxy();
