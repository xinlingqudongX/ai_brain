import { TongyiClient } from "../clients/tongyi_client";

async function testGetModels() {
    console.log("Testing Tongyi getModels function...");

    try {
        // 创建通义千问客户端实例
        const tongyiClient = new TongyiClient({
            cookies:
                "cna=2/UeIUBGQn4CAbdfPgkjEu6W; tongyi_sso_ticket=bmybNCbP1e3qY1GgtZjoukgCzyvG69M2yduw4A9treMU*Ent6AHvLFvsFhJ_hnS10; UM_distinctid=19a6746b100ea-07aad12e2cbfcb-26061b51-1fa400-19a6746b10112e9; _samesite_flag_=true; xlly_s=1; isg=BP7-BYaZG7nJ9E4V36sqQtGbTxRAP8K5rTgeGagHasE8S54lEM8SySQowxeH9LrR; tfstk=cgxlB02KbU779ZyxnYsSrC_aC2uOZCEFsH-X0X9x2XdXgCKVi4z47zSEn_csay1..",
            xsrfToken: "test_xsrf_token",
            sessionId: "test_session_id",
        });

        // 调用获取模型列表函数
        const modelsResponse = await tongyiClient.getModels();

        console.log("Models response received:");
        console.log("Success:", modelsResponse.success);
        console.log("HTTP Code:", modelsResponse.httpCode);
        console.log("Data length:", modelsResponse.data?.length || 0);

        if (modelsResponse.data && modelsResponse.data.length > 0) {
            const firstSeries = modelsResponse.data[0];
            if (firstSeries) {
                console.log("First model series:", firstSeries.modelSeries);
                console.log(
                    "First model params count:",
                    firstSeries.params?.length || 0
                );

                if (firstSeries.params && firstSeries.params.length > 0) {
                    const firstModel = firstSeries.params[0];
                    if (firstModel) {
                        console.log("First model name:", firstModel.modelName);
                        console.log(
                            "First model description:",
                            firstModel.describe
                        );
                    }
                }
            }
        }

        const result = await tongyiClient.sendMessage("测试");
        for await (const chunk of result) {
            console.log(chunk);
        }
        console.log("Test completed successfully!");
    } catch (error) {
        console.error("Error testing getModels function:", error);
    }
}

// 运行测试
testGetModels().catch(console.error);
