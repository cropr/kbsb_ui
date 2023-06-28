export const state = () => ({
  credential: "",
  user: "",
  email: "",
});

export const mutations = {
  updateUser(state, o) {
    state.credential = o.credential;
    state.user = o.user;
    state.email = o.email;
  },
};
