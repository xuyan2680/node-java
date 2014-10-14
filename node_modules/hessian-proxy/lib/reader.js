var assert = require('assert'),
    BufferReader = require('buffer-reader');

function Reader() {
    this.reader = new BufferReader(new Buffer(0));
}

Reader.prototype.parse = function(data) {
    this.res = data;
    this.reader.append(data);
    var r = this.reader.nextString(1);
    assert(r === 'r', "Invalid rsponse, expected 'r', recived '" + r + "', body: " + data.toString());
    this.reader.move(2); // 0x01 0x00
    this.data = this.readObject();
    return this;
};

Reader.prototype.readObject = function() {
    var type = this.reader.nextString(1);
    switch (type) {
        case 'f':
            this.fault = true;
            // read fault
            throw new Error('Fault:' + this.res.toString());
        case 'N':
            return null;
        case 'T':
            return true;
        case 'F':
            return false;
        case 'I':
            return this.reader.nextInt32BE();
        case 'L':
            return {
                high: this.reader.nextInt32BE(),
                low: this.reader.nextUInt32BE()
            };
        case 'D':
            return this.reader.nextDoubleBE();


    }
    return;
};


Reader.prototype.getData = function() {
    if (this.data !== undefined)
        return this.data;

    return this.res;
};

module.exports = Reader;