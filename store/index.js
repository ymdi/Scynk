export const state = () => ({
  user: null,
  windowSize: null
})

export const mutations = {
  name(state, username) {
    state.user = username
  },
  windowSize(state, size) {
    state.windowSize = size
  }
}

export const getters = {
  getWindowSize(state) {
    return state.windowSize
  }
}
