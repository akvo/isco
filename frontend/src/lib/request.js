import axios from "axios";

const simplifyResponse = response => {
    if (!response) return {};

    const common = {
        status: response.status,
        statusText: response.statusText,
        data: response.data
    };

    const formError =
        response.status === 422 || response.status === 429
            ? { errors: response.data?.errors || {} }
            : {};

    return { ...common, ...formError };
};

var token;
// TODO: review this way of reusing token
const request = (t) => {
  if (t){
    token = t;
  }
    const req = axios.create({ withCredentials: true });

    req.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    req.defaults.headers.common["Authorization"] = `Bearer ${token}`;


    req.interceptors.response.use(
        response => simplifyResponse(response),
        error => Promise.reject(simplifyResponse(error.response))
    );

    return req;
};

export default request;
