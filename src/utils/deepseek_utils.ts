export async function signParams(params: {
    algorithm: string;
    answer: number;
    challenge: string;
    salt: string;
    signature: string;
    target_path: string;
}) {
    const { algorithm, answer, challenge, salt, signature, target_path } =
        params;
    const data = JSON.stringify({
        algorithm,
        challenge,
        salt,
        answer,
        signature,
        target_path,
    });

    return Buffer.from(data).toString("base64");
}

// worker加载脚本，https://static.deepseek.com/chat/static/33614.25c7f8f220.js
