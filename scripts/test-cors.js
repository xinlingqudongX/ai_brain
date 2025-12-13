#!/usr/bin/env node

/**
 * CORS 测试脚本
 * 用于验证跨域配置是否正常工作
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testCors() {
  console.log('🧪 开始测试 CORS 配置...\n');

  const tests = [
    {
      name: '测试预检请求 (OPTIONS)',
      method: 'OPTIONS',
      url: `${API_BASE_URL}/api/v1/llm/action/get-models`,
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    },
    {
      name: '测试实际请求 (POST)',
      method: 'POST',
      url: `${API_BASE_URL}/api/v1/llm/action/get-models`,
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json',
      },
      data: {}
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📋 ${test.name}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        headers: test.headers,
        data: test.data,
        validateStatus: () => true, // 不抛出错误，让我们检查状态码
      });

      console.log(`   状态码: ${response.status}`);
      
      // 检查CORS相关的响应头
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      };

      console.log('   CORS 响应头:');
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`     ${key}: ${value}`);
        }
      });

      if (response.status >= 200 && response.status < 300) {
        console.log('   ✅ 测试通过\n');
      } else {
        console.log(`   ❌ 测试失败: ${response.statusText}\n`);
      }

    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}\n`);
    }
  }

  console.log('🏁 CORS 测试完成');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/api/v1/llm/action/get-models`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 检查服务器状态...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ 服务器未运行或无法访问');
    console.log('请先启动后端服务器: npm run start:dev');
    process.exit(1);
  }

  console.log('✅ 服务器正在运行\n');
  await testCors();
}

if (require.main === module) {
  main().catch(console.error);
}