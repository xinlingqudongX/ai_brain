import { UnifiedAIClient } from "./unified_ai_client";
import { AIPlatformType } from "../types/ai_client_types";

/**
 * 统一AI客户端使用示例
 */

// ChatGLM平台示例
async function chatglmExample() {
    console.log("=== ChatGLM客户端示例 ===");

    // ChatGLM认证信息
    const chatglmCredentials = {
        cookies:
            "acw_tc=1a0c655317618125740375313e9c91769e75261478430b72e56f25c591fab3; chatglm_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg; chatglm_user_id=68dc7861b38f394c9e7cbe1e;",
        authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg",
        assistantId: "65940acff94777010aa6b796",
    };

    // 创建ChatGLM客户端
    const chatglmClient = new UnifiedAIClient(
        AIPlatformType.CHATGLM,
        chatglmCredentials
    );

    // 获取用户信息
    try {
        const userInfo = await chatglmClient.getUserInfo();
        console.log("ChatGLM用户信息:", userInfo);
    } catch (error) {
        console.error("获取ChatGLM用户信息失败:", error);
    }

    // 发送消息
    try {
        console.log("发送消息到ChatGLM:");
        const stream = await chatglmClient.sendMessage(
            "你好，今天天气怎么样？"
        );
        for await (const chunk of stream) {
            console.log("ChatGLM响应:", chunk);
        }
    } catch (error) {
        console.error("发送消息到ChatGLM失败:", error);
    }
}

// 通义千问平台示例
async function tongyiExample() {
    console.log("\n=== 通义千问客户端示例 ===");

    // 通义千问认证信息
    const tongyiCredentials = {
        cookies:
            "XSRF-TOKEN=99976fea-d634-43fa-9a4e-97a8070baf47; SESSION=b8d34177c29347b182b68af584f02f4f",
        xsrfToken: "99976fea-d634-43fa-9a4e-97a8070baf47",
        sessionId: "b8d34177c29347b182b68af584f02f4f",
        model: "tongyi-qwen3-plus-model",
    };

    // 创建通义千问客户端
    const tongyiClient = new UnifiedAIClient(
        AIPlatformType.TONGYI,
        tongyiCredentials
    );

    // 获取用户信息
    try {
        const userInfo = await tongyiClient.getUserInfo();
        console.log("通义千问用户信息:", userInfo);
    } catch (error) {
        console.error("获取通义千问用户信息失败:", error);
    }

    // 发送消息
    try {
        console.log("发送消息到通义千问:");
        const stream = await tongyiClient.sendMessage("你好，今天天气怎么样？");
        for await (const chunk of stream) {
            console.log("通义千问响应:", chunk);
        }
    } catch (error) {
        console.error("发送消息到通义千问失败:", error);
    }
}

// 百度平台示例
async function baiduExample() {
    console.log("\n=== 百度客户端示例 ===");

    // 百度认证信息
    const baiduCredentials = {
        cookies:
            'BAIDUID_BFESS=E8AAB09C235DEF2C5D7D4E48AF0E6727:FG=1; BIDUPSID=E8AAB09C235DEF2C5D7D4E48AF0E6727; PSTM=1759138008; ZFY=LCqlJOLttdeYkux6nX58Y:ATGCyz3vFYgO32:BGjVrQFk:C; H_PS_PSSID=60279_63140_64005_64974_65248_65311_65361_65620_65601_65658_65668_65676_65711_65755_65737_65759_65806_65782_65840_65861_65916_65918; __bid_n=19a346c85239888b6d488a; ab_sr=1.0.1_MDE1ZTY3YWM1NTFiY2UyYmRiZGNkOWE1OTFmNjJhOTZmNGQ0Yzg0Yjk1YzU0YjM0MWY5NmQ3NDU2YTQ1YmNmNmNlOGU4ZTNmNDA0Y2E1OGJhN2U2ZDEzOTExZGVjZDRkOWI4ZmYzOTA5OGUxMTJiYmQyMGVlZWYwOWM2MjUwOTNjMGFhMDlmYWRjMTkyYTg0ZTc3NjhmZWE5MjAwYzBmMw==; H_WISE_SIDS=60279_63140_64005_64974_65248_65311_65361_65620_65711_65755_65759_65806_65782_65840_65861_65916_65918_65928_65940_65968_65958_65988_65992_65392_66005_66011; BA_HECTOR=agah8425ah0120ah818lak0l2l0g071kg6bn825; RT="z=1&dm=baidu.com&si=ec22457b-7bca-4717-9779-78a1ca1f4222&ss=mhd7tq8z&sl=2&tt=67m&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=3yaf"; ppfuid=FOCoIC3q5fKa8fgJnwzbE67EJ49BGJeplOzf+4l4EOvDuu2RXBRv6R3A1AZMa49I27C0gDDLrJyxcIIeAeEhD8JYsoLTpBiaCXhLqvzbzmvy3SeAW17tKgNq/Xx+RgOdb8TWCFe62MVrDTY6lMf2GrfqL8c87KLF2qFER3obJGmVXQmqM6seEAgB/LlOs0+zGEimjy3MrXEpSuItnI4KD2oamHIjD/NFFeJepWnxVEaTDvh37imFnz2JusPfLg+20CMlRn+O+PSmIjl1iaxOtxJsVwXkGdF24AsEQ3K5XBbh9EHAWDOg2T1ejpq0s2eFy9ar/j566XqWDobGoNNfmfpaEhZpob9le2b5QIEdiQe/UUOOs2fkuUdvUcIGr3f6FCMUN0p4SXVVUMsKNJv2T2RjO0ZU0bjudHg+LUSELrS4LkPV+7TROLMG0V6r0A++zkWOdjFiy1eD/0R8HcRWYuT+kWCL6ljq7v4YKFUkopCp+HBavJhpxl858h16cMtKQmxzisHOxsE/KMoDNYYE7ucLE22Bi0Ojbor7y6SXfVj7+B4iuZO+f7FUDWABtt/WWQqHKVfXMaw5WUmKnfSR5wwQa+N01amx6X+p+x97kkGmoNOSwxWgGvuezNFuiJQdt51yrWaL9Re9fZveXFsIu/gzGjL50VLcWv2NICayyI8BE9m62pdBPySuv4pVqQ9Sl1uTC//wIcO7QL9nm+0N6JgtCkSAWOZCh7Lr0XP6QztjlyD3bkwYJ4FTiNanaDaDBQXsMH+Z6YBx7EF88fgPC/jYQuJzRpyRzrHBCFmNcbqycJLKBgaJ2tRA5rjAblYxSGk66HDxtjKMU4HPNa0dthtJr0AzkHVTbxkQM8ES9IxE+BL3VTDsIlBc1QPENH6BclCgbSxCEs59D4foI+Eu7Xj3fcrLuWEEwZCNXYE6qp8XfB9dJyvG4GaeLcPhY3MBLfppNjLMcsZExlIXKpnViDzkovG4kdAIyuxdvhnpBOcuRCO3PwUSWeipr32kg7rh+26VQGmUjUFB9qdWM7cM+xhEMNzi6OXbElHkA3erw54tXrxfzO8r5i/hVAMD5lmRW7zauvTts98AVvqIMSVA8vSA4Tm4Z6OA+zAWRuAfqTZYRlp9I4pEOc85gAEpZ4sd1dl7ZsDQM77UWVHypv4+aIVxlWi6jkMK+VCGNGG+ki2NSHb/I1/IeOdtnUD+FFEjsEVUO27UponOPHnWdM3X7JqhncwlFWp7ecHEL1Omsg98jm/klJ3aRE1kTuzptCsDnIwjfVJ9QODEOux3qU+1RQ==; XFI=5ad7b2b0-b572-11f0-b584-117ba6b89997; XFCS=40FC6EFC068FB35AC5C1DAFEBD09B19F8983002821EAC8B8BD8B46DF45BB169A; XFT=D1cJf+NRc2ogYoN8qoHaWxVNtdbsfuvLmmjP2/EZZXY=; BDUSS=mJieXh0NmIweWdORmFqSEFNTC00ZFc5LW8xfmd0dDhRdEMwRVRTSUxhRk92Q3BwRVFBQUFBJCQAAAAAAQAAAAEAAACzskhjx6ew2LbIZnJlZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE4vA2lOLwNpY; BDUSS_BFESS=mJieXh0NmIweWdORmFqSEFNTC00ZFc5LW8xfmd0dDhRdEMwRVRTSUxhRk92Q3BwRVFBQUFBJCQAAAAAAQAAAAEAAACzskhjx6ew2LbIZnJlZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE4vA2lOLwNpY',
    };

    // 创建百度客户端
    const baiduClient = new UnifiedAIClient(
        AIPlatformType.BAIDU,
        baiduCredentials
    );

    // 获取用户信息
    try {
        const userInfo = await baiduClient.getUserInfo();
        console.log("百度用户信息:", userInfo);
    } catch (error) {
        console.error("获取百度用户信息失败:", error);
    }

    // 发送消息
    try {
        console.log("发送消息到百度AI:");
        const stream = await baiduClient.sendMessage("你好，今天天气怎么样？");
        for await (const chunk of stream) {
            console.log("百度AI响应:", chunk);
        }
    } catch (error) {
        console.error("发送消息到百度AI失败:", error);
    }
}

// DeepSeek平台示例
async function deepseekExample() {
    console.log("\n=== DeepSeek客户端示例 ===");

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

// 通义千问(Qwen)平台示例
async function qwenExample() {
    console.log("\n=== 通义千问(Qwen)客户端示例 ===");

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

    // 初始使用ChatGLM
    const credentials = {
        cookies:
            "acw_tc=1a0c655317618125740375313e9c91769e75261478430b72e56f25c591fab3; chatglm_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg; chatglm_user_id=68dc7861b38f394c9e7cbe1e;",
        authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg",
        assistantId: "65940acff94777010aa6b796",
    };

    const unifiedClient = new UnifiedAIClient(
        AIPlatformType.CHATGLM,
        credentials
    );
    console.log("当前平台:", unifiedClient.getPlatform());

    // 切换到DeepSeek
    const deepseekCredentials = {
        cookies:
            "intercom-device-id-guh50jw4=6c54f9de-5d07-4c6c-9b16-6c7166968944; ds_session_id=95e342c261524d238faa7a56d1051e09; HWWAFSESID=c3fe9a69806e1d0173b; HWWAFSESTIME=1761649134506; __cf_bm=zWepA7Q4l_TS1iD2Rgbp_A54DfREdGNEStgeRlzbIfw-1761819887-1.0.1.1-49yuN109WnAzYeRXOyRoJr_w717CTTNY7K6PrG9zCPfltWbOBV2s.viIKTKZWeiDxUnWkrMGzUOQdGgzDntZ_g7Zp.44Szm_4UQLmqhYMvI; cf_clearance=NcUhY2H4Dh7cZvFlSdVOEZHCPmWHW3G2lrsK6Ha3DhA-1761819888-1.2.1.1-7GnSmWh0WwFQs94GzkTjK9v1_mmsEhxlBywmoxDRqUHjcE7rClHGFs3U69IHZkVHvY4jP.3qscypoDv4A6KOvu3My_nyeOtEr0hFtgYhfUsI0yhU9vHcILAq0SG8jlKJpHJ1QtS0MUeGJAP61v3FsoxxlufpM95WXewM2mKoQQs1R2zPbPinAEN5MLz6CBjdE1EaTZ33tfjfUASM_0dbptKio0aKV32f7vYlrHBsb3Kr6Yh4XSRrVAEy_h.B4gHJ; intercom-session-guh50jw4=YmVLV0M4SCtLY1F5ZlRXbm9qRFp6SkI4NVVKakMxQkpXQVM0bUhuSVJqSmxrSmhDTndxa0p3QmlQMHBLVXJUMVRuZXNDSG5FVjhqZjNjRTNiNGZKclpUYkhUaVVXTXRRTVhuMHVGVU9HSmM9LS1ueVhHYWFNb1p0bGZDZlppUlRTWGp3PT0=--e8c1e3d9a4cb3ed36c166da338af4fb628fee23f",
        authorization:
            "Bearer bOClhLjozzlEhIFYB/b/OjgfsVOasgCZQoLVYtezSywQTZ116Re+4MZJZXFNagM0",
    };

    unifiedClient.switchPlatform(AIPlatformType.DEEPSEEK, deepseekCredentials);
    console.log("切换后平台:", unifiedClient.getPlatform());
}

// 运行所有示例
async function runExamples() {
    await chatglmExample();
    await tongyiExample();
    await baiduExample();
    await deepseekExample();
    await qwenExample();
    await platformSwitchExample();
}

// 执行示例
runExamples().catch(console.error);
