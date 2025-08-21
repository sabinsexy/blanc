import * as base64 from 'base64-js';
// Utility functions for encoding/decoding
export function encodeBase64(data) {
    return base64.fromByteArray(data);
}
export function decodeBase64(data) {
    return base64.toByteArray(data);
}
export function stringToUint8Array(str) {
    return new TextEncoder().encode(str);
}
export function uint8ArrayToString(arr) {
    return new TextDecoder().decode(arr);
}
export function generateRandomBytes(length) {
    if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return array;
    }
    else if (typeof require !== 'undefined') {
        const crypto = require('crypto');
        return new Uint8Array(crypto.randomBytes(length));
    }
    else {
        throw new Error('No secure random number generator available');
    }
}
export function generateNonce() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
export function generateMessageId() {
    return `${Date.now()}-${generateNonce()}@skiff-mail-clone.local`;
}
//# sourceMappingURL=utils.js.map