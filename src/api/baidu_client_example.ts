import { UnifiedAIClient } from "./unified_ai_client";
import { AIPlatformType } from "../types/ai_client_types";

/**
 * 百度客户端使用示例
 */

async function baiduExample() {
    console.log("=== 百度客户端示例 ===");

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

// 运行示例
baiduExample().catch(console.error);
