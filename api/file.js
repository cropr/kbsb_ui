import axios from "axios";

const prefix = "/api/v1/report";
export default {
  anon_get_files: async function (options) {
    const { reports } = options;
    return await axios.get(`${prefix}/anon/file`, {
      params: { reports },
    });
  },
  add_file: async function (options) {
    const { token, ...options1 } = options;
    console.log("add file", options1, token);
    const resp = await axios.post("/api/v1/files", options1, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  delete_file: async function (options) {
    const { id, token } = options;
    const resp = await axios.delete(`/api/v1/file/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  get_file: async function (options) {
    const { id, token } = options;
    const resp = await axios.get(`/api/v1/file/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  get_files: async function (options) {
    const { token } = options;
    const resp = await axios.get("/api/v1/files", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  update_file: async function (options) {
    const { id, token, ...options1 } = options;
    const resp = await axios.put(`/api/v1/file/${id}`, options1, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
};
