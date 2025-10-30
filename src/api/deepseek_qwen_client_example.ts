import { UnifiedAIClient } from "./unified_ai_client";
import { AIPlatformType } from "../types/ai_client_types";

/**
 * DeepSeek和通义千问客户端使用示例
 */

// DeepSeek平台示例
async function deepseekExample() {
    console.log("=== DeepSeek客户端示例 ===");

    // DeepSeek认证信息
    const deepseekCredentials = {
        cookies:
            "intercom-device-id-guh50jw4=6c54f9de-5d07-4c6c-9b16-6c7166968944; ds_session_id=95e342c261524d238faa7a56d1051e09; HWWAFSESID=c3fe9a69806e1d0173b; HWWAFSESTIME=1761649134506; __cf_bm=zWepA7Q4l_TS1iD2Rgbp_A54DfREdGNEStgeRlzbIfw-1761819887-1.0.1.1-49yuN109WnAzYeRXOyRoJr_w717CTTNY7K6PrG9zCPfltWbOBV2s.viIKTKZWeiDxUnWkrMGzUOQdGgzDntZ_g7Zp.44Szm_4UQLmqhYMvI; cf_clearance=NcUhY2H4Dh7cZvFlSdVOEZHCPmWHW3G2lrsK6Ha3DhA-1761819888-1.2.1.1-7GnSmWh0WwFQs94GzkTjK9v1_mmsEhxlBywmoxDRqUHjcE7rClHGFs3U69IHZkVHvY4jP.3qscypoDv4A6KOvu3My_nyeOtEr0hFtgYhfUsI0yhU9vHcILAq0SG8jlKJpHJ1QtS0MUeGJAP61v3FsoxxlufpM95WXewM2mKoQQs1R2zPbPinAEN5MLz6CBjdE1EaTZ33tfjfUASM_0dbptKio0aKV32f7vYlrHBsb3Kr6Yh4XSRrVAEy_h.B4gHJ; intercom-session-guh50jw4=YmVLV0M4SCtLY1F5ZlRXbm9qRFp6SkI4NVVKakMxQkpXQVM0bUhuSVJqSmxrSmhDTndxa0p3QmlQMHBLVXJUMVRuZXNDSG5FVjhqZjNjRTNiNGZKclpUYkhUaVVXTXRRTVhuMHVGVU9HSmM9LS1ueVhHYWFNb1p0bGZDZlppUlRTWGp3PT0=--e8c1e3d9a4cb3ed36c166da338af4fb628fee23f",
        authorization:
            "Bearer bOClhLjozzlEhIFYB/b/OjgfsVOasgCZQoLVYtezSywQTZ116Re+4MZJZXFNagM0",
    };

    // 创建DeepSeek客户端
    const deepseekClient = new UnifiedAIClient(
        AIPlatformType.DEEPSEEK,
        deepseekCredentials
    );

    // 获取用户信息
    try {
        const userInfo = await deepseekClient.getUserInfo();
        console.log("DeepSeek用户信息:", userInfo);
    } catch (error) {
        console.error("获取DeepSeek用户信息失败:", error);
    }

    // 发送消息
    try {
        console.log("发送消息到DeepSeek:");
        const stream = await deepseekClient.sendMessage(
            "你好，今天天气怎么样？"
        );
        for await (const chunk of stream) {
            console.log("DeepSeek响应:", chunk);
        }
    } catch (error) {
        console.error("发送消息到DeepSeek失败:", error);
    }
}

// 通义千问平台示例
async function qwenExample() {
    console.log("\n=== 通义千问客户端示例 ===");

    // 通义千问认证信息
    const qwenCredentials = {
        cookies:
            "acw_tc=0a03e58617618200196993649e3f7728c1e461cc4c9740395ce706d199837d; x-ap=ap-southeast-1; _gcl_au=1.1.1762553557.1761819971; _bl_uid=Rqmndh9FdRgak54sdfXyt1wymmw7; sca=b38893e4; cna=SEckIS77Iw4CAa+PX/QSgDrm; xlly_s=1; atpsida=e10b6006946be4992d18af53_1761820045_2; tfstk=gmwEhpmtA9BeHBL1dPHy0L2MwVDKhY7fU8gSquqoA20hJ8MrqVryRWZ7qYWrSz33RDsKr0DLCW9SRwHzqrMPlZ6fhkEKMYbfltj6d4kmYemHP4DiSYiPSVxamkEKehQLqiZLvTkoblJnEzDiS0n-EDmoEGkic0HkKbvHsF0tqYDotbAismmSq0corGriWmmnEY4oIGoSS4DoEzqiIBzuJduZtGwGd6_eJwcZok0wEK-YAXY0bQ9HK3nZsqci7Lm_QDlEok24HCpmjRwZGft57AqY1ymZ398xY5qqK0yRmQuraJHZ45QeOrzKqlcaRgO-b7ruHvH2q9qZL2l0IXBPDrqaqSGaCiXxLv03NvEW0wZaLyZLQutksvkQ_jyEntLnP5Z4U0yRyOz4qoFo_88F4l8-jjOueW8kaXmtbqsNbdE4JcmhuoNpwQhN6cufDidJwXmtbqsADQd-_RnZliIA.; isg=BCcnDyXJAj14OYc1cU1iZOaRtlvxrPuOuSIMAfmWg7b46E-qQn9A3_iuCuj2ANMG; ssxmod_itna=1-QqjxnDcDyQGQP4eKYKitDCiuYiQ07Dmx7FPGHDyxWK50CGDLxnbqGdqnTKGpT3eTHjWr2msYBEixNDl=gYDZDGFQDqx0Eb2QCxDQlYAGLK==kAARmb=iiGkTqKCXUZbeYfjWtkZnuPsgCU=2DanizgEFoDCPDExGktAIHDemaDCeDQxirDD4DADibt4D1EDDkD04v_FfEz4GWDmRfDY5wjDMjDGa3C8o6rDDCr2A5jloHDG5HQupxeQoxu4DrQbk3zQSDTN2eC4G1jD0HYYtHCKlBpupfTX1y2UmpDl9lDCIEZ3f5nloLvKdc7DDOGbBpKChbGGIQDGWhBWG4zGcAxU0GbiA00P4WY=0wNIKXDDABxHbTymWoQir3xZUH/FpwBHob7Ntmk0oKaiq8qkU0OB2rS2NUiq793sYxW7Pf0x9o48GxaTPeD; ssxmod_itna2=1-QqjxnDcDyQGQP4eKYKitDCiuYiQ07Dmx7FPGHDyxWK50CGDLxnbqGdqnTKGpT3eTHjWr2msYBEiroDi2kGx4pQDDK4DFERaeTvWDDs2C71IcxqDND2BCpkDU2nc21DUMBd6L5NIhlu8QI4p=2kTQI8nPqklgy_qBv7387_q7A_DI7P58aqHQpHK_51D_EkKKvx=GGH2=OqaBPG_/oG9rvG=n51TW8zTeHqU4fh9zKk9bYk88FjKUQh=WdIKw8OKQQvpZEITbBaugK0FZLxefY0_zI_Zc0aa_9BYSKOBrpH83XH4fLkZEkRFotHB4zr=3RHFR1vriQ_tM2OeAGLOCT27TmOKWFelrm2zCQWkCCpooLbaC_sz2QCfkzoaC8trexCMrqixzhDHxYg25Fxre4xN8bvoxHn=XR3AmHY=NZr7BfQKqiUdO4biw4iFc7KSsGbHgxsiZI_l1N4LI3k1ST6R3eB4uqN_RC18CUM6_RfuwHnCOfk4PhTdMT2GvFDbN=rSWA11QxpDThGV_wxkiyei3_IvgDRhRYB3b3Nd7=TasBOKY8AZOKAWT20v6l_81TXL1LhXEnuTzWKnFhkjqGG2xr4tAnl86zCjQQZQNakD0_Q7F3qA3lG71hWfmHLSH2M3g/xQDkTAuLCCg4WuECC4xfrIY0WTbZfb=gG8FOG8_3gmDOxkB5Ea2B7DHqyhxS4r0oeinG=KBYrQixShPY7gWCkvuQh92B=PpDH0DNKLlDeG=Z70btmQoDLlkjRxD3lHdU3Tr8x3HieaP9mPQ_19QFwpqAYTjbKQQT2c0PT2rnqrrNW4HDNCm/DiD5qEPDPC7aRmHEDD",
        chatId: "77c228c6-d4d5-4dab-9ef8-7b8a5de9ba73",
        model: "qwen3-coder-plus",
    };

    // 创建通义千问客户端
    const qwenClient = new UnifiedAIClient(
        AIPlatformType.QWEN,
        qwenCredentials
    );

    // 获取用户信息
    try {
        const userInfo = await qwenClient.getUserInfo();
        console.log("通义千问用户信息:", userInfo);
    } catch (error) {
        console.error("获取通义千问用户信息失败:", error);
    }

    // 发送消息
    try {
        console.log("发送消息到通义千问:");
        const stream = await qwenClient.sendMessage("你好，今天天气怎么样？");
        for await (const chunk of stream) {
            console.log("通义千问响应:", chunk);
        }
    } catch (error) {
        console.error("发送消息到通义千问失败:", error);
    }
}

// 平台切换示例
async function platformSwitchExample() {
    console.log("\n=== 平台切换示例 ===");

    // 初始使用DeepSeek
    const deepseekCredentials = {
        cookies:
            "intercom-device-id-guh50jw4=6c54f9de-5d07-4c6c-9b16-6c7166968944; ds_session_id=95e342c261524d238faa7a56d1051e09; HWWAFSESID=c3fe9a69806e1d0173b; HWWAFSESTIME=1761649134506; __cf_bm=zWepA7Q4l_TS1iD2Rgbp_A54DfREdGNEStgeRlzbIfw-1761819887-1.0.1.1-49yuN109WnAzYeRXOyRoJr_w717CTTNY7K6PrG9zCPfltWbOBV2s.viIKTKZWeiDxUnWkrMGzUOQdGgzDntZ_g7Zp.44Szm_4UQLmqhYMvI; cf_clearance=NcUhY2H4Dh7cZvFlSdVOEZHCPmWHW3G2lrsK6Ha3DhA-1761819888-1.2.1.1-7GnSmWh0WwFQs94GzkTjK9v1_mmsEhxlBywmoxDRqUHjcE7rClHGFs3U69IHZkVHvY4jP.3qscypoDv4A6KOvu3My_nyeOtEr0hFtgYhfUsI0yhU9vHcILAq0SG8jlKJpHJ1QtS0MUeGJAP61v3FsoxxlufpM95WXewM2mKoQQs1R2zPbPinAEN5MLz6CBjdE1EaTZ33tfjfUASM_0dbptKio0aKV32f7vYlrHBsb3Kr6Yh4XSRrVAEy_h.B4gHJ; intercom-session-guh50jw4=YmVLV0M4SCtLY1F5ZlRXbm9qRFp6SkI4NVVKakMxQkpXQVM0bUhuSVJqSmxrSmhDTndxa0p3QmlQMHBLVXJUMVRuZXNDSG5FVjhqZjNjRTNiNGZKclpUYkhUaVVXTXRRTVhuMHVGVU9HSmM9LS1ueVhHYWFNb1p0bGZDZlppUlRTWGp3PT0=--e8c1e3d9a4cb3ed36c166da338af4fb628fee23f",
        authorization:
            "Bearer bOClhLjozzlEhIFYB/b/OjgfsVOasgCZQoLVYtezSywQTZ116Re+4MZJZXFNagM0",
    };

    const unifiedClient = new UnifiedAIClient(
        AIPlatformType.DEEPSEEK,
        deepseekCredentials
    );
    console.log("当前平台:", unifiedClient.getPlatform());

    // 切换到通义千问
    const qwenCredentials = {
        cookies:
            "acw_tc=0a03e58617618200196993649e3f7728c1e461cc4c9740395ce706d199837d; x-ap=ap-southeast-1; _gcl_au=1.1.1762553557.1761819971; _bl_uid=Rqmndh9FdRgak54sdfXyt1wymmw7; sca=b38893e4; cna=SEckIS77Iw4CAa+PX/QSgDrm; xlly_s=1; atpsida=e10b6006946be4992d18af53_1761820045_2; tfstk=gmwEhpmtA9BeHBL1dPHy0L2MwVDKhY7fU8gSquqoA20hJ8MrqVryRWZ7qYWrSz33RDsKr0DLCW9SRwHzqrMPlZ6fhkEKMYbfltj6d4kmYemHP4DiSYiPSVxamkEKehQLqiZLvTkoblJnEzDiS0n-EDmoEGkic0HkKbvHsF0tqYDotbAismmSq0corGriWmmnEY4oIGoSS4DoEzqiIBzuJduZtGwGd6_eJwcZok0wEK-YAXY0bQ9HK3nZsqci7Lm_QDlEok24HCpmjRwZGft57AqY1ymZ398xY5qqK0yRmQuraJHZ45QeOrzKqlcaRgO-b7ruHvH2q9qZL2l0IXBPDrqaqSGaCiXxLv03NvEW0wZaLyZLQutksvkQ_jyEntLnP5Z4U0yRyOz4qoFo_88F4l8-jjOueW8kaXmtbqsNbdE4JcmhuoNpwQhN6cufDidJwXmtbqsADQd-_RnZliIA.; isg=BCcnDyXJAj14OYc1cU1iZOaRtlvxrPuOuSIMAfmWg7b46E-qQn9A3_iuCuj2ANMG; ssxmod_itna=1-QqjxnDcDyQGQP4eKYKitDCiuYiQ07Dmx7FPGHDyxWK50CGDLxnbqGdqnTKGpT3eTHjWr2msYBEixNDl=gYDZDGFQDqx0Eb2QCxDQlYAGLK==kAARmb=iiGkTqKCXUZbeYfjWtkZnuPsgCU=2DanizgEFoDCPDExGktAIHDemaDCeDQxirDD4DADibt4D1EDDkD04v_FfEz4GWDmRfDY5wjDMjDGa3C8o6rDDCr2A5jloHDG5HQupxeQoxu4DrQbk3zQSDTN2eC4G1jD0HYYtHCKlBpupfTX1y2UmpDl9lDCIEZ3f5nloLvKdc7DDOGbBpKChbGGIQDGWhBWG4zGcAxU0GbiA00P4WY=0wNIKXDDABxHbTymWoQir3xZUH/FpwBHob7Ntmk0oKaiq8qkU0OB2rS2NUiq793sYxW7Pf0x9o48GxaTPeD; ssxmod_itna2=1-QqjxnDcDyQGQP4eKYKitDCiuYiQ07Dmx7FPGHDyxWK50CGDLxnbqGdqnTKGpT3eTHjWr2msYBEiroDi2kGx4pQDDK4DFERaeTvWDDs2C71IcxqDND2BCpkDU2nc21DUMBd6L5NIhlu8QI4p=2kTQI8nPqklgy_qBv7387_q7A_DI7P58aqHQpHK_51D_EkKKvx=GGH2=OqaBPG_/oG9rvG=n51TW8zTeHqU4fh9zKk9bYk88FjKUQh=WdIKw8OKQQvpZEITbBaugK0FZLxefY0_zI_Zc0aa_9BYSKOBrpH83XH4fLkZEkRFotHB4zr=3RHFR1vriQ_tM2OeAGLOCT27TmOKWFelrm2zCQWkCCpooLbaC_sz2QCfkzoaC8trexCMrqixzhDHxYg25Fxre4xN8bvoxHn=XR3AmHY=NZr7BfQKqiUdO4biw4iFc7KSsGbHgxsiZI_l1N4LI3k1ST6R3eB4uqN_RC18CUM6_RfuwHnCOfk4PhTdMT2GvFDbN=rSWA11QxpDThGV_wxkiyei3_IvgDRhRYB3b3Nd7=TasBOKY8AZOKAWT20v6l_81TXL1LhXEnuTzWKnFhkjqGG2xr4tAnl86zCjQQZQNakD0_Q7F3qA3lG71hWfmHLSH2M3g/xQDkTAuLCCg4WuECC4xfrIY0WTbZfb=gG8FOG8_3gmDOxkB5Ea2B7DHqyhxS4r0oeinG=KBYrQixShPY7gWCkvuQh92B=PpDH0DNKLlDeG=Z70btmQoDLlkjRxD3lHdU3Tr8x3HieaP9mPQ_19QFwpqAYTjbKQQT2c0PT2rnqrrNW4HDNCm/DiD5qEPDPC7aRmHEDD",
        chatId: "77c228c6-d4d5-4dab-9ef8-7b8a5de9ba73",
        model: "qwen3-coder-plus",
    };

    unifiedClient.switchPlatform(AIPlatformType.QWEN, qwenCredentials);
    console.log("切换后平台:", unifiedClient.getPlatform());
}

// 运行所有示例
async function runExamples() {
    await deepseekExample();
    await qwenExample();
    await platformSwitchExample();
}

// 执行示例
runExamples().catch(console.error);
