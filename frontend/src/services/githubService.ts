// /frontend/src/services/githubService.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/github';
const getToken = () => localStorage.getItem('user_token');

const getMyOrgs = async () => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.get(`${API_URL}/orgs`, config);
    return response.data; // Renverra un tableau ex: [{ login: 'MonOrga1' }, ...]
};

export const githubService = {
    getMyOrgs,
};