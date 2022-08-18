import axios from 'axios';
import { authStorageKey } from "../utils";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use(async config => {
  
  try {
    let auth = localStorage.getItem(authStorageKey)
    if (auth) {
      const authObj = JSON.parse(auth)
      config.headers.Authorization = `Bearer ${authObj.token}`;
    }

    const jsonEmpresa = localStorage.getItem('@netiz-empresa')
    const empresaLogada = JSON.parse(jsonEmpresa)
    config.headers.empresa_id = empresaLogada.id;
  } catch (error) {
    console.log(error)
  }

  return config;
});


export default api;