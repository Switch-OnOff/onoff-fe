// src/composables/useWebSocket.js
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(url, topic = '/topic/notify') {
  const messages = ref([]);
  let client = null;

  const connect = () => {
    const socket = new SockJS(url); // ⚠ URL은 반드시 http:// 또는 https://
    client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log('STOMP 연결됨');
      client.subscribe(topic, (msg) => {
        messages.value.push(JSON.parse(msg.body));
      });
    };

    client.activate();
  };

  const sendMessage = (destination, msg) => {
    if (client && client.connected) {
      client.publish({ destination, body: JSON.stringify(msg) });
    }
  };

  onMounted(connect);
  onBeforeUnmount(() => {
    if (client) client.deactivate();
  });

  return { messages, sendMessage };
}
