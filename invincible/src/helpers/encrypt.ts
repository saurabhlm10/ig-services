import CryptoJS from 'crypto-js';
export function encrypt(data: string) {
    const cryptoSecret = process.env.CryptoSecret as string;

    const encrypted_data = CryptoJS.AES.encrypt(data, cryptoSecret).toString();

    return encrypted_data;
}
