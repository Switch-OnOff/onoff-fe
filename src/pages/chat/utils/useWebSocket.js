// src/composables/useWebSocket.js
import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useWebSocket(url) {
  const messages = ref([
    {
      user: 'me',
      text: '안녕하세요!',
      time: '오후 2:30',
      date: '2025-08-10',
    },
    {
      user: 'other',
      text: '네, 반갑습니다 😀네, 반갑습니다 😀네, 반갑습니다 😀네, 반갑습니다 😀네, 반갑습니다 😀네, 반갑습니다 😀네, 반갑습니다 😀네, 반갑습니다 😀',
      time: '오후 2:31',
      date: '2025-09-10',
    },
    {
      user: 'me',
      text: '안녕하세요!',
      time: '오후 2:30',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네, 반갑습니다 😀',
      time: '오후 2:31',
      date: '2025-09-10',
    },
    {
      user: 'me',
      text: '오늘 계약 일정 괜찮으세요?',
      time: '오후 2:35',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네, 내일 오후 3시에 가능할 것 같아요.',
      time: '오후 2:36',
      date: '2025-09-10',
    },
    {
      user: 'me',
      text: '좋습니다! 그럼 내일 뵐게요 🙌',
      time: '오후 2:37',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
    {
      user: 'other',
      text: '네~ 내일 뵈어요!',
      time: '오후 2:38',
      date: '2025-09-10',
    },
  ]);
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
