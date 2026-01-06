import axios from './axios';

const BASE = '/challenges';

export async function fetchChallenges() {
  const res = await axios.get(BASE);
  return res.data;
}

export async function fetchChallengeById(id: string) {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data;
}

// التعديل هنا يا وحش 👇
export async function submitChallenge(id: string, answer: string) {
  // بنبعت الـ answer في الـ body بتاع الـ POST request
  const res = await axios.post(`${BASE}/${id}/submit`, { answer });
  return res.data;
}