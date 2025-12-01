import axios from 'axios';

// Set your backend URL directly here
const baseURL = 'http://localhost:8080/api'; // ضع البورت الصحيح للسيرفر

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export default instance;
