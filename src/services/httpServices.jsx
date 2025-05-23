import { message } from "antd";
import axios from "axios";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_URL}`,
  timeout: 500000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  const token = sessionStorage.getItem("accessToken");
  return {
    ...config,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${token}`,
    },
  };
});
instance.interceptors.response.use(
  function (response) {
    localStorage.setItem("sessionExpired", "false");
    return response;
  },
  function (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.setItem("sessionExpired", "true");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const responseBody = (response) => response.data;

// const errorBody = (error) => {
//   if (
//     error &&
//     error.response.data &&
//     error.response.data.message &&
//     error.response.data.message === "Authentication failed. Invalid token."
//   ) {
//     message.error("Session expired. Please login again");
//     setTimeout(() => {
//       window.location.reload();
//     }, 2000);
//   } else {
//     throw error;
//   }
// };

const requests = {
  get: (url, body) => instance.get(url, body).then(responseBody),

  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),

  put: (url, body) => instance.put(url, body).then(responseBody),
  patch: (url, body) => instance.patch(url, body).then(responseBody),
  delete: (url, body) => instance.delete(url, body).then(responseBody),
};

export default requests;
