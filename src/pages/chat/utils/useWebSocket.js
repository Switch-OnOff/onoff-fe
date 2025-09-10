// src/composables/useWebSocket.js
import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useWebSocket(url) {
  const messages = ref([]);
  let ws = null;

  const connect = () => {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messages.value.push(data);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
      // 자동 재연결
      setTimeout(connect, 1000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket 오류:', err);
    };
  };

  const sendMessage = (msg) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  };

  onMounted(connect);

  onBeforeUnmount(() => {
    if (ws) ws.close();
  });

  return { messages, sendMessage };
}
