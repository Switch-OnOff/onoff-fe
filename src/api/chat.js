import axios from 'axios';

export const getChatRoom = async (userId) => {
  try {
    const res = await axios.get(`/chat/rooms/${userId}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
