interface WhitelistRequest {
    profit: number,
    avg: number,
    count: number,
    mid: number,
    hold_less_5_sec_count: number,
    min_hold: number,
    avg_user: number,
    top_3_buy: number
}

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { defineEventHandler } from 'h3';

// 加载 gRPC 协议定义（.proto 文件）
const packageDefinition = protoLoader.loadSync('./protos/whitelist.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const whitelistProto = grpc.loadPackageDefinition(packageDefinition).whitelist;

// 创建 gRPC 客户端
const client = new whitelistProto.WhitelistService(
    'localhost:8090', // 你的 gRPC 服务地址
    grpc.credentials.createInsecure() // 开发环境（生产需用 TLS）
);

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const whitelistRequest: WhitelistRequest = {
        avg: body.avg,
        avg_user: body.avg_user,
        count: body.count,
        hold_less_5_sec_count: body.hold_less_5_sec_count,
        mid: body.mid,
        min_hold: body.min_hold,
        profit: body.profit,
        top_3_buy: body.top_3_buy
    }

    // 调用 gRPC 服务（异步封装）
    return new Promise((resolve, reject) => {
        client.getWhitelist(whitelistRequest, (err: any, response: any) => {
            if (err) {
                reject({ error: err.message });
            } else {
                resolve(response);
            }
        });
    });
})
