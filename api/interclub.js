import axios from "axios";

const prefix = "/api/v1/interclubs";

export default {
  // enrollemnts
  find_interclubenrollment: async function (options) {
    const { idclub } = options;
    const resp = await axios.get(`${prefix}/anon/enrollment//${idclub}`);
    return resp;
  },
  set_interclubenrollment: async function (options) {
    const { token, idclub, ...enrollment } = options;
    const resp = await axios.post(
      `${prefix}/clb/enrollment/${idclub}`,
      enrollment,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    return resp;
  },
  mgmt_set_interclubenrollment: async function (options) {
    const { token, idclub, ...enrollment } = options;
    const resp = await axios.post(
      `${prefix}/mgmt/enrollment/${idclub}`,
      enrollment,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    return resp;
  },
  mgmt_csv_interclubenrollment: async function (options) {
    const { token } = options;
    const resp = await axios.get(`${prefix}/mgmt/command/exportenrollments`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },

  //venues
  anon_getICVenues: async function (options) {
    const { token, idclub } = options;
    const resp = await axios.get(`${prefix}/anon/venue/${idclub}`);
    return resp;
  },
  set_interclubvenues: async function (options) {
    const { token, idclub, venues } = options;
    const resp = await axios.post(
      `${prefix}/clb/venue//${idclub}`,
      { venues },
      { headers: { Authorization: "Bearer " + token } }
    );
    return resp;
  },
  mgmt_set_interclubvenues: async function (options) {
    const { token, idclub, venues } = options;
    const resp = await axios.post(
      `${prefix}/mgmt/venue/${idclub}`,
      { venues },
      { headers: { Authorization: "Bearer " + token } }
    );
    return resp;
  },
  mgmt_csv_interclubvenues: async function (options) {
    const { token } = options;
    const resp = await axios.get(`${prefix}/mgmt/command/exportvenues`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },

  // icclub
  anon_getICteams: async function (options) {
    const { idclub } = options;
    const resp = await axios.get(`${prefix}/anon/icteams/${idclub}`);
    return resp;
  },
  clb_getICclub: async function (options) {
    const { token, idclub } = options;
    const resp = await axios.get(`${prefix}/clb/icclub/${idclub}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  clb_setICclub: async function (options) {
    console.log("api clb_setICclub", options);
    const { token, idclub, ...icc } = options;
    const resp = await axios.put(`${prefix}/clb/icclub//${idclub}`, icc, {
      headers: { Authorization: "Bearer " + token },
    });
    return resp;
  },
};
