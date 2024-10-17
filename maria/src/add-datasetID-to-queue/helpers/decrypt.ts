import CryptoJS from 'crypto-js';

export function decrypt(encryptedData: string): string {
    const cryptoSecret = process.env.CryptoSecret as string;
    const decrypted_bytes = CryptoJS.AES.decrypt(encryptedData, cryptoSecret);
    const decrypted_data = decrypted_bytes.toString(CryptoJS.enc.Utf8);
    return decrypted_data;
}
