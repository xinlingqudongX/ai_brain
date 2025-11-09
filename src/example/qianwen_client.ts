fetch(
    "https://chat.qwen.ai/api/v2/chat/completions?chat_id=77c228c6-d4d5-4dab-9ef8-7b8a5de9ba73",
    {
        headers: {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "bx-ua":
                "231!qpv3VkmUvWB+joF+UA3YtLEjUq/YvqY2leOxacSC80vTPuB9lMZY9mRWFzrwLEV0PmcfY4rL2y0gtwy/wlEHPqObu95Cl9KHScVmpzq4CZvHvJILJg3LasSVqpHLLKrAHdjevkhz01qTm9AceNEzA47tXmVUDgb5ZuaHRPJppWoWg9LxC1JgoaBJVxyI9aLcrXT9lxcc5k9M+eE3jq3ijv8tVCLGOnCyDp0P7ekr+/Mep4Dqk+I9xGdFt9ytKHlCok+++4mWYi++6PH7jO7vnIBDj+//FkuwjWwTSBrcpD6Qt/UOiGQcV04+tDqIq9EuwfoOgS//UretrJpRykWp+++duo+ZH+JVewW/c74nc3HLkxW/wX/GLlo3/m2+KLavMKRFJXrr7USazqRh9dG538pphzJ1xfz42Q8HVTv5EWtwyWiz0EBMWCKMXXPKlkOFm1n2Rq9teGPhOusxr9dnGL32o7XFNvioMbywiI0GJDVB+HrxEaKnYI5kSpDlkW7IO0kxJHleii2wOumAhnbbQpcjzt2R7gOhmK3LeIgooroyCv8e/zLRwsPGdUiviNm+MoatWAvVGMEMMJ9EUYbwaN6pyoBr/UzvM1193gipxHRQpvprQxFsC4E87MybpBuo7FTCWS2mWvKEajhdS5IPDT/FGm/j/mW/Xd25MdAAjNDzRY+QLKaLQV5VxoPEMwhLaJRfZdxRFtCIlQdgQabgZdw8/GCVFH2fkghvPtsRTYwxBDMZv5/JVU8iehYda4IwPGRnHUduYfAB2T3d2VELCzadgkS1EIROtqQIXxDcY3morb4/qrEsdEEeYZQ2QssqBHE+ex6JRdOfTn514tqdlcmPWy33L3jTFIInb7QgwgoZciWDk/zDhuGRdU5ZKMOB7/7A60k/ZV7P5egBeH3Ak1Zk0jjiq8PbdgvB7hcR1rC28NNpIbzT37hii4kRlPltT4FofnuxUb4ZSy26e5o/gL8j8ppNOIWUYcn55tw+avDeZswpAkVdhsoG/k+J5RsM5DpR2PmboMd4/QDevCHK4yhbcsD7s7e3FfFjNIRoCvwVO8rQyrEVrf6XySKFLwr8F2gN57yDisBvEYJuFtH8fZz4YHd+cNHd3RRHws8f43/bzhNBNL/ta5HmCoDxibcL81p0PhIlPAhxzWRspcRjgqw5PmGX3Rt4uU11b9KqzHkkJ0IGrcZR8pGT005gr2bsUWi9vXzsb8VvoOMX5DPJ2doJx0m3beQOLKfB0CbSE9fbpdwFQVIRA1yUpYXqrhK94tbF5+o9VE9h15HpQ2sq/8+ssenWY7IIQcbrDu1PMzAj6AEHRXbwp1pFmfne1NLbys8MC0yzhr7oY3JWZpVe+x7zfYRFYICpMmFiD2eyYjg4M1okWmoFyiUPuaVrIFuECaHnKBDsqkqxJlidVICL26v4e3+BgdkzJO+PSwPloaI8WJsmOKODi4AsATkRrN8Vd4M20pE2z8KnxpQ9URifK1iGJy0ZBneEAJIHjE759kRLuLGELRQHo5phRPVqOJRjmPDpfJM9tC0/ZNc59gQQIW0n",
            "bx-umidtoken":
                "T2gAP7CkFAzvXpibmR8tJ0x4X5t-Qzfak_cIZkNpvnh7et_TbcNk0gskXHsrZA8nLLA=",
            "bx-v": "2.5.31",
            "content-type": "application/json; charset=UTF-8",
            "sec-ch-ua":
                '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            source: "web",
            timezone: "Thu Oct 30 2025 18:27:21 GMT+0800",
            "x-accel-buffering": "no",
            "x-request-id": "66490e7a-0dba-4ce6-bd5d-16c83b6864f4",
            cookie: "acw_tc=0a03e58617618200196993649e3f7728c1e461cc4c9740395ce706d199837d; x-ap=ap-southeast-1; _gcl_au=1.1.1762553557.1761819971; _bl_uid=Rqmndh9FdRgak54sdfXyt1wymmw7; sca=b38893e4; cna=SEckIS77Iw4CAa+PX/QSgDrm; xlly_s=1; atpsida=e10b6006946be4992d18af53_1761820045_2; tfstk=gmwEhpmtA9BeHBL1dPHy0L2MwVDKhY7fU8gSquqoA20hJ8MrqVryRWZ7qYWrSz33RDsKr0DLCW9SRwHzqrMPlZ6fhkEKMYbfltj6d4kmYemHP4DiSYiPSVxamkEKehQLqiZLvTkoblJnEzDiS0n-EDmoEGkic0HkKbvHsF0tqYDotbAismmSq0corGriWmmnEY4oIGoSS4DoEzqiIBzuJduZtGwGd6_eJwcZok0wEK-YAXY0bQ9HK3nZsqci7Lm_QDlEok24HCpmjRwZGft57AqY1ymZ398xY5qqK0yRmQuraJHZ45QeOrzKqlcaRgO-b7ruHvH2q9qZL2l0IXBPDrqaqSGaCiXxLv03NvEW0wZaLyZLQutksvkQ_jyEntLnP5Z4U0yRyOz4qoFo_88F4l8-jjOueW8kaXmtbqsNbdE4JcmhuoNpwQhN6cufDidJwXmtbqsADQd-_RnZliIA.; isg=BCcnDyXJAj14OYc1cU1iZOaRtlvxrPuOuSIMAfmWg7b46E-qQn9A3_iuCuj2ANMG; ssxmod_itna=1-QqjxnDcDyQGQP4eKYKitDCiuYiQ07Dmx7FPGHDyxWK50CGDLxnbqGdqnTKGpT3eTHjWr2msYBEixNDl=gYDZDGFQDqx0Eb2QCxDQlYAGLK==kAARmb=iiGkTqKCXUZbeYfjWtkZnuPsgCU=2DanizgEFoDCPDExGktAIHDemaDCeDQxirDD4DADibt4D1EDDkD04v_FfEz4GWDmRfDY5wjDMjDGa3C8o6rDDCr2A5jloHDG5HQupxeQoxu4DrQbk3zQSDTN2eC4G1jD0HYYtHCKlBpupfTX1y2UmpDl9lDCIEZ3f5nloLvKdc7DDOGbBpKChbGGIQDGWhBWG4zGcAxU0GbiA00P4WY=0wNIKXDDABxHbTymWoQir3xZUH/FpwBHob7Ntmk0oKaiq8qkU0OB2rS2NUiq793sYxW7Pf0x9o48GxaTPeD; ssxmod_itna2=1-QqjxnDcDyQGQP4eKYKitDCiuYiQ07Dmx7FPGHDyxWK50CGDLxnbqGdqnTKGpT3eTHjWr2msYBEiroDi2kGx4pQDDK4DFERaeTvWDDs2C71IcxqDND2BCpkDU2nc21DUMBd6L5NIhlu8QI4p=2kTQI8nPqklgy_qBv7387_q7A_DI7P58aqHQpHK_51D_EkKKvx=GGH2=OqaBPG_/oG9rvG=n51TW8zTeHqU4fh9zKk9bYk88FjKUQh=WdIKw8OKQQvpZEITbBaugK0FZLxefY0_zI_Zc0aa_9BYSKOBrpH83XH4fLkZEkRFotHB4zr=3RHFR1vriQ_tM2OeAGLOCT27TmOKWFelrm2zCQWkCCpooLbaC_sz2QCfkzoaC8trexCMrqixzhDHxYg25Fxre4xN8bvoxHn=XR3AmHY=NZr7BfQKqiUdO4biw4iFc7KSsGbHgxsiZI_l1N4LI3k1ST6R3eB4uqN_RC18CUM6_RfuwHnCOfk4PhTdMT2GvFDbN=rSWA11QxpDThGV_wxkiyei3_IvgDRhRYB3b3Nd7=TasBOKY8AZOKAWT20v6l_81TXL1LhXEnuTzWKnFhkjqGG2xr4tAnl86zCjQQZQNakD0_Q7F3qA3lG71hWfmHLSH2M3g/xQDkTAuLCCg4WuECC4xfrIY0WTbZfb=gG8FOG8_3gmDOxkB5Ea2B7DHqyhxS4r0oeinG=KBYrQixShPY7gWCkvuQh92B=PpDH0DNKLlDeG=Z70btmQoDLlkjRxD3lHdU3Tr8x3HieaP9mPQ_19QFwpqAYTjbKQQT2c0PT2rnqrrNW4HDNCm/DiD5qEPDPC7aRmHEDD",
            Referer: "https://chat.qwen.ai/c/guest",
        },
        body: '{"stream":true,"incremental_output":true,"chat_id":"77c228c6-d4d5-4dab-9ef8-7b8a5de9ba73","chat_mode":"guest","model":"qwen3-coder-plus","parent_id":"80070541-b162-46b9-897b-1a47804fb661","messages":[{"fid":"cd29aeed-9bb7-44a4-b43d-832147bd55ea","parentId":"80070541-b162-46b9-897b-1a47804fb661","childrenIds":["705a1abd-f868-4000-ad92-f84f7d665ec7"],"role":"user","content":"给出查询天气的代码","user_action":"chat","files":[],"timestamp":1761820041,"models":["qwen3-coder-plus"],"chat_type":"t2t","feature_config":{"thinking_enabled":false,"output_schema":"phase"},"extra":{"meta":{"subChatType":"t2t"}},"sub_chat_type":"t2t","parent_id":"80070541-b162-46b9-897b-1a47804fb661"}],"timestamp":1761820041}',
        method: "POST",
    }
);
