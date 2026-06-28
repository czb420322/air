import defaultSettings from '@/settings'

const { showSettings, fixedHeader, sidebarLogo } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  theme: 'light',
  selectedProject: { id: 1, name: '大型多联机', company_name: '良渚数字文化', code: 'XM202408211122' }
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_THEME: (state, theme) => {
    state.theme = theme
  },
  SET_PROJECT: (state, project) => {
    state.selectedProject = project
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
  },
  setProject({ commit }, project) {
    commit('SET_PROJECT', project)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

