import axios from "axios";
// import { ACCESS_TOKEN } from "@/store/mutation-types";
// import store from '@/store'

const API_HOST = "http://localhost:8080/api";

const CODE = {
  SUCCESS: 0,
  ERROR: -1,
  NOT_INSTALL: 2,

  TOKEN_NOT_EXIST: 1004,
  TOKEN_INVALID: 1005,
  TOKEN_EXPIRED: 1006,
};

const instance = axios.create({
  baseURL: API_HOST,
  timeout: 10000,
  withCredentials: false,
});

instance.interceptors.response.use(
  (response) => {
    if (response.status !== 200) return Promise.reject(response);
    const { status, msg } = response.data;
    if (status === CODE.SUCCESS) return response.data;
    if (msg) {
      MessagePlugin.warning(msg);
    } else {
      MessagePlugin.warning('未知服务端错误');
    }
    return Promise.reject(response);
  },
  (err) => {
    MessagePlugin.warning('请求路径或请求参数错误');
    return Promise.reject(err);
  }
);

export default instance;
