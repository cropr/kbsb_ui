import axios from "axios";

export default {
  find_interclubenrollment: async function (options) {
    const { idclub } = options;
    const resp = await axios.get(`/api/v1/a/interclub/enrollment/${idclub}`);
    return resp;
  },
  set_interclubenrollment: async function (options) {
    const { token, idclub, ...enrollment } = options;
    const resp = await axios.post(
      `/api/v1/c/interclub/enrollment/${idclub}`,
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
      `/api/v1/interclub/enrollment/${idclub}`,
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
    const resp = await axios.get(`/api/v1/csv/interclubenrollment`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  find_interclubvenues: async function (options) {
    const { token, idclub } = options;
    const resp = await axios.get(`/api/v1/a/interclub/venues/${idclub}`);
    return resp;
  },
  set_interclubvenues: async function (options) {
    const { token, idclub, venues } = options;
    const resp = await axios.post(
      `/api/v1/c/interclub/venues/${idclub}`,
      { venues },
      { headers: { Authorization: "Bearer " + token } }
    );
    return resp;
  },
  mgmt_set_interclubvenues: async function (options) {
    const { token, idclub, venues } = options;
    const resp = await axios.post(
      `/api/v1/interclub/venues/${idclub}`,
      { venues },
      { headers: { Authorization: "Bearer " + token } }
    );
    return resp;
  },
  mgmt_csv_interclubvenues: async function (options) {
    const { token } = options;
    const resp = await axios.get(`/api/v1/csv/interclubvenues`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return resp;
  },
  get_interclubclub: async function (options) {
    const { idclub } = options;
    const resp = await axios.get(`/api/v1/a/interclub/club/${idclub}`);
    return resp;
  },
  mgmt_set_interclubclub: async function (options) {
    console.log("api mgmt_set_interclubclub", options);
    const { token, idclub, ...icc } = options;
    const resp = await axios.put(`/api/v1/interclub/club/${idclub}`, icc, {
      headers: { Authorization: "Bearer " + token },
    });
    return resp;
  },
  clb_set_interclubclub: async function (options) {
    console.log("api clb_set_interclubclub", options);
    const { token, idclub, ...icc } = options;
    const resp = await axios.put(`/api/v1/c/interclub/club/${idclub}`, icc, {
      headers: { Authorization: "Bearer " + token },
    });
    return resp;
  },
};
