import axios from "axios";
import club from "@/api/club";
import file from "@/api/file";
import interclub from "@/api/interclub";
import old from "@/api/old";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const error_messages = {
  600: "Connectiom issue: server unreachable",
  700: "You triggered a bug.  Please inform the webmaster.",
  WrongUsernamePasswordCombination:
    "Wrong combination of username and password",
};

axios.interceptors.response.use(
  (response) => {
    return Promise.resolve({
      data: response.data,
      headers: response.headers,
    });
  },
  (error) => {
    if (error.response) {
      const detail = error.response.data.detail;
      console.warn("Axios", error.response.status, detail, error.request);
      return Promise.reject({
        code: error.response.status,
        headers: error.response.headers,
        message: detail ? error_messages[detail] : "Unknown error",
      });
    }
    if (error.request) {
      console.warn("Axios", "No response received", error.request);
      return Promise.reject({
        code: 600,
        message: error_messages[600],
      });
    }
    console.warn("Axios", "No request sent", error.message);
    return Promise.reject({
      code: 700,
      message: error_messages[700],
    });
  }
);

const factories = {
  club,
  file,
  interclub,
  old,
};

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      backend: async function (fact, method, options) {
        const f = factories[fact][method];
        return await f(options);
      },
    },
  };
});
