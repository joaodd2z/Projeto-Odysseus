#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// MCP 서버 프로세스 시작
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// stdin/stdout 인터페이스 설정
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// 표준 입력/출력 연결 설정
let isServerReady = false;
const serverOutput = server.stdout;

serverOutput.on('data', (data) => {
  const message = data.toString();
  console.log(`서버 출력: ${message}`);
  
  // 서버가 준비되면 테스트 메시지 전송
  if (!isServerReady && message.includes('YouTube MCP server has started')) {
    isServerReady = true;
    console.log('테스트 1: 언어 파라미터 없이 자막 요청');
    server.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTranscript',
      params: {
        videoId: 'dQw4w9WgXcQ'
      }
    }) + '\n');
    
    setTimeout(() => {
      console.log('테스트 2: 영어 언어 파라미터로 자막 요청');
      server.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getTranscript',
        params: {
          videoId: 'dQw4w9WgXcQ',
          lang: 'en'
        }
      }) + '\n');
    }, 3000);
  }
});

// 프로세스 종료 처리
rl.on('close', () => {
  server.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});

console.log('YouTube MCP 서버 테스트를 시작합니다. Ctrl+C로 종료할 수 있습니다.'); 