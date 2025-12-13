export interface CorsConfig {
  origin:
    | string[]
    | ((
        origin: string,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus: number;
}

export const getCorsConfig = (): CorsConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return {
      origin: [
        'http://localhost:5173', // Vite 开发服务器
        'http://localhost:3000', // 本地开发
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://localhost:4173', // Vite 预览服务器
        'http://localhost:8080', // 其他可能的开发端口
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
      ],
      credentials: true,
      optionsSuccessStatus: 200,
    };
  }

  // 生产环境配置
  return {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // 生产环境下的域名白名单
      const allowedOrigins = [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
        'https://app.yourdomain.com',
        // 可以从环境变量中读取允许的域名
        ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
      ];

      // 允许没有 origin 的请求（如移动应用、Postman等）
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  };
};
