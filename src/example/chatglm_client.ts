import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";

function U() {
    const e = Date.now(),
        A = e.toString(),
        t = A.length,
        o = A.split("").map((e) => Number(e)),
        i = o.reduce((e, A) => e + A, 0) - o[t - 2],
        a = i % 10;
    return A.substring(0, t - 2) + a + A.substring(t - 1, t);
}
function M() {
    return (uuidv4() + "").replace(/-/g, "");
}

//  发送消息给AI 返回SSE
fetch("https://chatglm.cn/chatglm/backend-api/assistant/stream", {
    headers: {
        accept: "text/event-stream",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "app-name": "chatglm",
        authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
            '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-app-fr": "default",
        "x-app-platform": "pc",
        "x-app-version": "0.0.1",
        "x-device-brand": "",
        "x-device-id": "48fa1b60de90444c9eac53d3d2fb6643",
        "x-device-model": "",
        "x-exp-groups":
            "na_android_config:exp:NA,na_4o_config:exp:4o_A,na_glm4plus_config:exp:open,mainchat_server_app:exp:A,mobile_history_daycheck:exp:a,desktop_toolbar:exp:A,chat_drawing_server:exp:A,drawing_server_cogview:exp:cogview4,app_welcome_v2:exp:B,chat_drawing_streamv2:exp:A,mainchat_rm_fc:exp:add,mainchat_dr:exp:open,chat_auto_entrance:exp:A,drawing_server_hi_dream:control:A,homepage_square:exp:close,assistant_recommend_prompt:exp:3,app_home_regular_user:exp:A,memory_common:exp:enable,mainchat_moe:exp:300,assistant_greet_user:exp:greet_user,app_welcome_personalize:exp:A,assistant_model_exp_group:exp:glm4.5,ai_wallet:exp:ai_wallet_enable",
        "x-lang": "zh",
        "x-nonce": "a68244a258eb49c89ab2ea269c3afb9c",
        "x-request-id": "2ef1cf9548db47b295be246cf8daa226",
        "x-sign": "e40df007ca6f16d174e110c7cb726ad5",
        "x-timestamp": "1761812993135",
        cookie: "acw_tc=1a0c655317618125740375313e9c91769e75261478430b72e56f25c591fab3; chatglm_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg; chatglm_token_expires=2025-10-30%2018:22:53; chatglm_refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzc3MzY0NjIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiODVhNzA2N2Q5OGIwNGUyMWFjNzllNzUyYWRlMzZiODgiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJyZWZyZXNoIn0.Kn7zyyUiwl5RXWBWarptDRROeH_B3eJWsKVmc8VKHjI; chatglm_user_id=68dc7861b38f394c9e7cbe1e; ssxmod_itna=1-Yq_ODKBK0KY57IxGKi7mKZosG8D_26CDBP01DpgxQ5DODLxnRDGdNuebjweQeDB7GuGPkKQSr4oMD05xtwDA5DnGx7YDt=4IesmYjY2xttonCi_KeK=YnhIbmBI6ApqDUWzMSS2PsN14zAhx0qXrW4GLDY=DCd_cYxGGU4GwDGoD34DiDDPDb_rDAMeD7qDFnenropTDm4GWbPDgWWPHwPDjtrT3pp4DGT3Px7QaSlDD0MGpNi_P_Ch7xGYPpZmhqZxEoGD=x0taDBdt4VD=VaCRNDaEcIMHH_bDzTzDtwn1x1BOSWcbs1=bAt3he9OeCAoNB5=YtNGYwGYjOQ3Bx5ExhgDtG=fr=zOemDDi6wq0rcGGqZprQNMhXW2AZ=4sCmPWYy7uwmGhYIPBqnQ4KUwzDmxnDYiGp10_bmC3mNUIKYD; ssxmod_itna2=1-Yq_ODKBK0KY57IxGKi7mKZosG8D_26CDBP01DpgxQ5DODLxnRDGdNuebjweQeDB7GuGPkKQSr4owDDcto5Yri84DLQ0y4f/tGGDD/GOG3QtWslPIX2bQNDCaR6xLK9quoDuFIOtG5QIDfFAXZ9uDPlSDf4ljKDdLxjd4VFjxuzY2PakbPpRjXSlNtE_6r6kdX4Wn5F0LVWW_X7T25Cnu0Ac6YKkYgmDU=Und=Fw2XUGy=1TN4APuVGEf50Wr73ZGQTTU0Bp3tloMDTD6DqZQ0YYL5W/=PkiZFhOhVlEW5qMhtZQsnoAQsepk_Ipeh0Ywmjnmj9sKGniqLj_S0e5/pOj_Ntq9fK5mmkfFPOafFw1zb9_mOCWc9egKTOW7GmyvAWQvKSFwCSmI0m1BhOmGH3PwYmvm0I0qQjn/7EqumdVEdpwp9e9Rb41TOYGm0mBmgsWv5HmADap9KPx94WqrBi4t84jwQ437IKGCEDsMs42wDn98YaRpCLR/e7YFnHpdKxnD/yy8aFXk42INjW7mKIK51pO4GF1ZRlKqMSDG/de2pCU4G7nRGEaTauAbaKiqAAsGb7Vd8qC/jb4ti/zKCtgm3qb==GS79jHViZ90xG71hC15RImKMzFkzSKV4qnz/mdcGXgdcT4VOc4Wuz0YB6Y9rvib4HiGkiZ8Z_zXO_s7xvL=i0UiaBGiBD/oNEVBEKY0CLWETWD97YfdVE/8ImY_03h7xqL47r7dLBDBDkglKD=m5R66Slb5Ph_IfnOVn5YRsmI_SDFGwges2cR/8GrBD8DYA2AXqi3SwGm5TpK0=4_ex53NPnsjpe7Yp_KMYTes7Vm4=fx0KjQdyN6Woh4wQx9hj8eFGw7e8DpG5ArGY9GGIhemu9wQN4xD",
    },
    body: '{"assistant_id":"65940acff94777010aa6b796","conversation_id":"690320b3aa3d506b8f3f55d6","chat_type":"user_chat","meta_data":{"cogview":{"rm_label_watermark":false},"is_test":false,"input_question_type":"xxxx","channel":"","draft_id":"","is_networking":false,"chat_mode":"zero","quote_log_id":"","platform":"pc"},"messages":[{"role":"user","content":[{"type":"text","text":"今天天气"}]}]}',
    method: "POST",
});

//  获取用户信息
fetch("https://chatglm.cn/chatglm/user-api/user/info", {
    headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "app-name": "chatglm",
        authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg",
        priority: "u=1, i",
        "sec-ch-ua":
            '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-app-fr": "default",
        "x-app-platform": "pc",
        "x-app-version": "0.0.1",
        "x-device-brand": "",
        "x-device-id": "48fa1b60de90444c9eac53d3d2fb6643",
        "x-device-model": "",
        "x-exp-groups":
            "na_android_config:exp:NA,na_4o_config:exp:4o_A,na_glm4plus_config:exp:open,mainchat_server_app:exp:A,mobile_history_daycheck:exp:a,desktop_toolbar:exp:A,chat_drawing_server:exp:A,drawing_server_cogview:exp:cogview4,app_welcome_v2:exp:B,chat_drawing_streamv2:exp:A,mainchat_rm_fc:exp:add,mainchat_dr:exp:open,chat_auto_entrance:exp:A,drawing_server_hi_dream:control:A,homepage_square:exp:close,assistant_recommend_prompt:exp:3,app_home_regular_user:exp:A,memory_common:exp:enable,mainchat_moe:exp:300,assistant_greet_user:exp:greet_user,app_welcome_personalize:exp:A,assistant_model_exp_group:exp:glm4.5,ai_wallet:exp:ai_wallet_enable",
        "x-lang": "zh",
        "x-nonce": "3f863c2199614e5991d765fc96596f9a",
        "x-request-id": "6810618e054c4bbd84bc0bbcd300246c",
        "x-sign": "90511e4b8898fb99204eaf3ad17fbb8b",
        "x-timestamp": "1761813594072",
        cookie: "acw_tc=1a0c655317618125740375313e9c91769e75261478430b72e56f25c591fab3; chatglm_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzYxODk5MDIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiMzNkNzAxNGUxYjY5NGU4ZjljNTRlNGU2YjMwNzk2YTMiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJhY2Nlc3MifQ.bOQz7DBjbw4dIKAoMtnPxVIvAVgiLPxL19Kmy2Uggjg; chatglm_token_expires=2025-10-30%2018:22:53; chatglm_refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLnlKjmiLdfcGQzejA2IiwiZXhwIjoxNzc3MzY0NjIyLCJuYmYiOjE3NjE4MTI2MjIsImlhdCI6MTc2MTgxMjYyMiwianRpIjoiODVhNzA2N2Q5OGIwNGUyMWFjNzllNzUyYWRlMzZiODgiLCJ1aWQiOiI2OGRjNzg2MWIzOGYzOTRjOWU3Y2JlMWUiLCJkZXZpY2VfaWQiOiI0OGZhMWI2MGRlOTA0NDRjOWVhYzUzZDNkMmZiNjY0MyIsInR5cGUiOiJyZWZyZXNoIn0.Kn7zyyUiwl5RXWBWarptDRROeH_B3eJWsKVmc8VKHjI; chatglm_user_id=68dc7861b38f394c9e7cbe1e; ssxmod_itna=1-Yq_ODKBK0KY57IxGKi7mKZosG8D_26CDBP01DpgxQ5DODLxnRDGdNuebjweQeDBiAqeGoK=75D/Y0OeDZDGKQDqx0Er0mBwehPot0OoxpqbnGG2i5W3r_SxEr3oh7y0sd81kmya5j2DmWweoKxGLDY=DCd4wYxGGA4GwDGoD34DiDDPDb3rDAMeD7qDFUjTiq=TDm4GWQPDgtWpa1PDjtgRYsp4DGMEqx7QanlDD0MDmNi_PCCxHxGAqsZeGZlhvoGGdx0taDBdtl/GdgZM0NAnvXtkFr3bDzM1DtdWCMeBOnlWrOcYo9wim7D/7eCioNB5=A=N7xefhXxQ3BxwBx=0d50xXgQvOdwGeDD3N3Rx2prDXgaNTpYl=444qSeA7b_5mGxY_iBwRjw1nqGYm9Dh49GKn08RhwY0KYD; ssxmod_itna2=1-Yq_ODKBK0KY57IxGKi7mKZosG8D_26CDBP01DpgxQ5DODLxnRDGdNuebjweQeDBiAqeGoK=7eDAKr8gYvmGUkHNG4pCDbuAiPD",
    },
    body: null,
    method: "GET",
});
