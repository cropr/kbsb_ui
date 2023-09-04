import axios from "axios";

export default {
  login: async function (options) {
    return await axios.post("/api/v1/member/login", options);
  },
  get_members: async function (options) {
    const { idclub } = options;
    return await axios.get(`/api/v1/member/anon/clubmembers/${idclub}`);
  },
  get_member: async function (options) {
    const { idnumber } = options;
    return await axios.get(`/api/v1/member/member/${idnumber}`);
  },
};
