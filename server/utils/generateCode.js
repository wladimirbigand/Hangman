'use strict';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1 (ambigus)

function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

function generateUniqueRoomCode(existingCodes) {
  let code = generateCode();
  while (existingCodes.has(code)) {
    code = generateCode();
  }
  return code;
}

module.exports = { generateCode, generateUniqueRoomCode };
