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
