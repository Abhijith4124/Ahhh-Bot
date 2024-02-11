const ENCODING = "utf8";

class RCONPacket {
    constructor(buffer) {
        this._buffer = buffer;
    }

    get buffer() {
        return this._buffer;
    }

    get payloadLength() {
        return this.buffer.readInt32LE(0);
    }

    get requestId() {
        return this.buffer.readInt32LE(4);
    }

    get type() {
        return this.buffer.readInt32LE(8);
    }

    get payload() {
        return this.buffer.toString(ENCODING, 12, 12 + this.payloadLength - 2);
    }

    toString() {
        return `RCONPacket { payloadLength: ${this.payloadLength}, requestId: ${this.requestId}, type: ${this.type}, payload: ${this.payload} }`;
    }

    static randomId() {
        return Number.parseInt(
            Math.random()
                .toString(2)
                .substring(2, 32),
            2
        );
    }

    static createFrom(requestId, type, payload) {
        const size = Buffer.byteLength(payload, ENCODING) + 14;

        const packet = Buffer.alloc(size);

        packet.writeInt32LE(size - 4, 0);
        packet.writeInt32LE(requestId, 4);
        packet.writeInt32LE(type, 8);
        packet.write(payload, 12, size - 2, ENCODING);
        packet.writeInt16LE(0, size - 2);

        return new RCONPacket(packet);
    }
}

module.exports = RCONPacket;
