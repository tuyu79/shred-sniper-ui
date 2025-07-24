interface EmptyRequest {
}

interface ConfigRequest {
    max_sol: number;
    whitelist_enabled: boolean;
    jito_fee: number;
    zero_slot_buy_fee: number;
    zero_slot_sell_fee: number;
}

interface BlacklistRequest {
    item: string;
}

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import {defineEventHandler, EventHandlerRequest, H3Event} from 'h3';

// 加载 gRPC 协议定义（.proto 文件）
const packageDefinition = protoLoader.loadSync('./protos/config.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const configProto = grpc.loadPackageDefinition(packageDefinition).config;



export default defineEventHandler(async (event) => {
    const method = getMethod(event);
    // 获取所有查询参数（返回一个对象）
    const query = getQuery(event);
    const grpcUrl = query.grpc_url

    // 创建 gRPC 客户端
    const client = new configProto.ConfigService(
        grpcUrl, // 你的 gRPC 服务地址
        grpc.credentials.createInsecure() // 开发环境（生产需用 TLS）
    );

    switch (method) {
        case "GET": {
            return new Promise((resolve, reject) => {
                client.getWhitelistConfig({}, (err: any, response: any) => {
                    if (err) {
                        reject({error: err.message});
                    } else {
                        resolve(response);
                    }
                });
            });
        }
        case "PUT": {
            const body = await readBody(event) as BlacklistRequest
            return new Promise((resolve, reject) => {
                client.updateWhitelistConfig(body, (err: any, response: any) => {
                    if (err) {
                        reject({error: err.message});
                    } else {
                        resolve(response);
                    }
                });
            });
        }
    }
})