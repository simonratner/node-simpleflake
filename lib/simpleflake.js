var assert = require('assert');
var bignum = require('bignum');
var crypto = require('crypto');

var opt = {
  epoch: Date.UTC(2014, 0, 1),
  timebits: 41,
};

function simpleflake(ts, seq) {
  var timebits = opt.timebits;
  var seqbits = 64 - timebits;

  ts = bignum((ts || Date.now()) - opt.epoch);
  assert(ts >= 0, 'ts must be >= ' + opt.epoch);
  assert(ts.bitLength() <= timebits, 'ts must be <= ' + timebits + ' bits');

  if (seq) {
    seq = bignum(seq);
    assert(seq.bitLength() <= seqbits, 'seq must be <= ' + seqbits + ' bits');
  } else {
    seq = bignum.fromBuffer(crypto.randomBytes(Math.ceil(seqbits / 8)));
  }

  var buf = bignum.or(
      ts.shiftLeft(seqbits),
      seq.and(bignum('ffffffffffffffff', 16).shiftRight(timebits))
  ).toBuffer();

  // Augment returned buffer with base58 encoding option.
  buf.toString = toString;
  return buf;
}

function toString(enc) {
  if (enc == 'base58') {
    return require('base58-native').encode(this);
  } else {
    return Buffer.prototype.toString.apply(this, arguments);
  }
}

module.exports = simpleflake;
module.exports.options = opt;
