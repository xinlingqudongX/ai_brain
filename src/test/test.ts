import { UnifiedAIClient, AIPlatformType } from "../index";

async function main() {
    const client = new UnifiedAIClient(AIPlatformType.TONGYI, {
        cookies: "BAIDUID=1234567890",
    });

    
    // const result = await client.sendMessage("你好，世界");
    // for await (const chunk of result) {
    //     console.log(chunk);
    // }
    // console.log(result);
}

main().catch(console.error);