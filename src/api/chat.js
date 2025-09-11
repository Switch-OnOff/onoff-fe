import axios from 'axios';

export const getChatRoom = async (userId) => {
  try {
    const res = await axios.get(`/chat/main/${userId}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const getChatDetail = async (roomId) => {
  try {
    const res = await axios.get(`/chat/room/${roomId}/messages`);
    console.log('api');
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// export const getChatDetail = async (chatRoom) => {
//   const id = 1;
//   try {
//     // 채팅 내용 불러오기
//     const res = await axios.get(`/chat/main/${id}`);
//     console.log(res.data);
//     return res.data;
//   } catch (err) {
//     console.log(err);
//   }
// };
