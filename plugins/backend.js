import axios from "axios";
import file from "@/api/file";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    //Log the user out if the JWT token is expired
    // if (error) {
    //   const originalRequest = error.config;
    //   if (
    //     error.hasOwnProperty("response") &&
    //     error.response.hasOwnProperty("status")
    //   ) {
    //     if (error.response.status === 403 && !originalRequest._retry) {
    //       originalRequest._retry = true;
    //       appStore.logout();
    //     } else if (error.response.status === 440) {
    //       //Login timeout
    //       appStore.logout();
    //       router.push("/");
    //     }
    //   }
    // }

    // //Setup custom error message
    // if (
    //   !error.hasOwnProperty("response") ||
    //   (error.response.status !== 403 && error.response.status !== 440)
    // ) {
    //   let message = "An unknown error occured.";
    //   if (typeof error !== "undefined") {
    //     if (error.hasOwnProperty("message")) {
    //       if (error.message == "Network Error")
    //         message =
    //           "An unknow server error occured. Our databases might be momentarily offline.";
    //       else message = error.message;
    //     }

    //     if (error.hasOwnProperty("response")) {
    //       //Deal with validation errors
    //       if (error.response.status == 422) {
    //         error.response.data.detail.forEach((error) => {
    //           error.loc.shift();
    //           console.log("422 Error", error);
    //           if (error.loc.includes("body"))
    //             error.loc.splice(error.loc.indexOf("body"), 1);
    //           if (error.loc.includes("data"))
    //             error.loc.splice(error.loc.indexOf("data"), 1);
    //           if (error.loc.includes("user"))
    //             error.loc.splice(error.loc.indexOf("user"), 1);
    //           if (error.loc.includes("counter"))
    //             error.loc.splice(error.loc.indexOf("counter"), 1);
    //           if (error.loc.includes("__root__"))
    //             error.loc.splice(error.loc.indexOf("__root__"), 1);
    //           if (error.loc.includes("zone_name")) {
    //             error.loc = ["zone_name"];
    //           }
    //           if (error.loc.includes("room_name")) {
    //             error.loc = ["room_name"];
    //           }
    //           if (error.loc.includes("room_type_name")) {
    //             error.loc = ["room_type"];
    //           }
    //           console.log("Validation error", error);

    //           if (error.type == "type_error" || error.type == "value_error") {
    //             app.config.globalProperties.$toast.error(error.msg);
    //           } else {
    //             appStore.addError({
    //               id: error.loc.join("."),
    //               error: error.msg,
    //             });
    //             message =
    //               "We have not been able to validate the request sent to the server.";
    //           }
    //         });
    //       } else if (error.response.hasOwnProperty("data")) {
    //         if (
    //           error.response.data.hasOwnProperty("message") &&
    //           error.response.data.message.length > 0
    //         ) {
    //           message = error.response.data.message;
    //         } else if (
    //           error.response.data.hasOwnProperty("detail") &&
    //           error.response.data.detail.length > 0
    //         ) {
    //           message = error.response.data.detail;
    //         }
    //       }
    //     }
    //   }
    // }

    return Promise.reject(error);
  }
);

const factories = {
  file,
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
