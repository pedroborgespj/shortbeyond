const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const BASE32_LENGTH = CROCKFORD_BASE32.length;

function toCrockfordBase32(num, len) {
    let base32 = '';
    let tempNum = num;
    
    while (tempNum > 0n) {
        const remainder = tempNum % 32n;
        base32 = CROCKFORD_BASE32[Number(remainder)] + base32;
        tempNum /= 32n;
    }

    return base32.padStart(len, '0');
}

export function generateUlid() {
    const timestamp = BigInt(Date.now());
    const timestampPart = toCrockfordBase32(timestamp, 10);

    const randomPart = new Array(16)
        .fill(0)
        .map(() => {
            const randomIndex = Math.floor(Math.random() * BASE32_LENGTH);
            return CROCKFORD_BASE32[randomIndex];
        })
        .join('');
        
    return timestampPart + randomPart;
}