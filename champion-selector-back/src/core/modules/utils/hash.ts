import * as crypto from 'crypto';

function generateMD5(short: boolean) {
    const hash = crypto.randomBytes(20).toString('hex');
    const randomSlice = Math.floor(Math.random() * hash.length - 5) + 0;

    return short ? hash.slice(randomSlice, randomSlice + 5) : hash;
}

export const generateID = (options?: any) => {
    let defaultOpts = Object.assign({ short: false }, options);
    return generateMD5(defaultOpts.short);
}


// https://stackoverflow.com/a/47593316
export function mulberry32(a: any) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function xmur3(str: any) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}