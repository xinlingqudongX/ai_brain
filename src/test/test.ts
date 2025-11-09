import { UnifiedAIClient, AIPlatformType } from "../index.js";

async function main() {
    const client = new UnifiedAIClient(AIPlatformType.TONGYI, {
        cookies: "BAIDUID=1234567890",
    });

    const result = await client.sendMessage("你好，世界");
    console.log(result);
}

await main();
