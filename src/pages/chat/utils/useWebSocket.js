// src/composables/useWebSocket.js
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(url, topic = '/topic/notify') {
  const messages = ref([]);
  let client = null;

  const connect = () => {
    const socket = new SockJS(url);
    client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log('STOMP 연결됨');
      client.subscribe(topic, (msg) => {
        messages.value.push({
          ...JSON.parse(msg.body),
          self: false, // 서버에서 받은 메시지 → 상대방 메시지
        });
      });
    };

    client.activate();
  };

  // src/composables/useWebSocket.js
  const sendMessage = (msg, destination = '/app/chat') => {
    if (!msg) {
      console.error('⚠️ sendMessage: msg가 undefined임!');
      return;
    }

    console.log(msg);
    if (client && client.connected) {
      client.publish({ destination, body: JSON.stringify(msg) });

      messages.value.push({
        text: msg,
        self: true,
      });

      console.log(messages.value);
    }
  };

  onMounted(connect);
  onBeforeUnmount(() => {
    if (client) client.deactivate();
  });

  return { messages, sendMessage };
}
