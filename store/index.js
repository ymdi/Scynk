export const state = () => ({
  user: null
})

export const mutations = {
  name(state, username) {
    state.user = username
  }
}
