import axios from "axios";

export default {
  login: async function (options) {
    return await axios.post("/api/v1/old/login", options);
  },
  get_members: async function (options) {
    const { idclub } = options;
    return await axios.get(`/api/v1/old/clubmembers/${idclub}`);
  },
  get_member: async function (options) {
    const { idnumber } = options;
    return await axios.get(`/api/v1/old/activemember/${idnumber}`);
  },
};
