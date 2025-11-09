
/**
 * 通义千问模型系列
 */
export interface TongyiModelSeries {
    modelSeries: string;
    params: TongyiModelParam[];
}

/**
 * 通义千问模型参数
 */
export interface TongyiModelParam {
    newTag?: boolean;
    modelName: string;
    capsule: TongyiModelCapsule[];
    expanded: boolean;
    picked: boolean;
    modelCode: string;
    describe: string;
    order: number;
}

/**
 * 通义千问模型功能胶囊
 */
export interface TongyiModelCapsule {
    code: string;
    enable: boolean;
}

/**
 * 通义千问获取模型函数的返回类型
 */
export interface TongyiModelsResponse {
    success: boolean;
    httpCode: number;
    errorCode: string | null;
    errorMsg: string | null;
    data: TongyiModelSeries[];
    traceId: string;
    failed: boolean;
}