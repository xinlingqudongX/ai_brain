import { UnifiedAIClient } from "../api/endpoints/unified_ai_client";
import { AIPlatformType } from "../types/ai_client_types";

async function main() {
    const client = new UnifiedAIClient(AIPlatformType.TONGYI, {
        cookies: "BAIDUID=1234567890",
    });

    const result = await client.sendMessage("你好，世界");
    console.log(result);
}

await main();
