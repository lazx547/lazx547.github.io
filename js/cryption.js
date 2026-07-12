(function(global) {
    "use strict";

    // ---------- 工具函数 ----------
    function strToBuf(str) {
        return new TextEncoder().encode(str);
    }

    function bufToStr(buf) {
        return new TextDecoder().decode(buf);
    }

    function bufToBase64(buf) {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToBuf(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // ---------- 核心: 从密码派生密钥 (PBKDF2, 空盐) ----------
    async function deriveKey(password) {
        const enc = new TextEncoder();
        const passwordBuf = enc.encode(password);
        // 固定空盐 (0 长度) -> 密码与结果一一对应
        const salt = new Uint8Array(0);
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuf,
            'PBKDF2',
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // ---------- 密码哈希 (SHA-256) ----------
    async function sha256(message) {
        const data = strToBuf(message);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return bufToBase64(hash);
    }


    // ---------- 加密: AES-GCM 固定空 IV (12字节零) ----------
    async function encryptAES(plainText, password) {
        const key = await deriveKey(password);
        const plainBuf = strToBuf(plainText);
        const iv = new Uint8Array(12); // 固定零 IV
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128
            },
            key,
            plainBuf
        );
        return bufToBase64(encrypted);
    }

    // ---------- 解密: AES-GCM 固定空 IV ----------
    async function decryptAES(cipherBase64, password) {
        const key = await deriveKey(password);
        const cipherBuf = base64ToBuf(cipherBase64);
        const iv = new Uint8Array(12);
        try {
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: 128
                },
                key,
                cipherBuf
            );
            return bufToStr(decrypted);
        } catch (err) {
            throw new Error('解密失败: 密码错误或密文无效');
        }
    }

    // ---------- 暴露全局接口 ----------
    const CryptoLib = {
        encryptAES,
        decryptAES,
        sha256
    };

    // 支持 CommonJS / AMD / 全局
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CryptoLib;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return CryptoLib; });
    } else {
        global.CryptoLib = CryptoLib;
    }

})(typeof window !== 'undefined' ? window : global);