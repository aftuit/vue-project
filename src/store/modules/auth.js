import authApi from '@/api/auth'
import {setItem,getItem} from '@/helpers/persistanceStorage'

import { ref,reactive } from 'vue'
const isAuthenticated = ref(false)
const state = reactive({
  isSubmitting: false,
  isLoggedIn: false,
  isLoading: false,
  currentUser: null,
  currentUserId: null,
  currentUserRole: null,
  validationErrors: null,
})

export const mutationTypes = {
  registerStart: '[auth] Register start',
  registerSuccess: '[auth] Register success',
  registerFailure: '[auth] Register failure',

  loginStart: '[auth] Login start',
  loginSuccess: '[auth] Login success',
  loginFailure: '[auth] Login failure',

  getCurrentUserStart: '[auth] Get current user start',
  getCurrentUserSuccess: '[auth] Get current user success',
  getCurrentUserFailure: '[auth] Get current user failure',

  updateCurrentUserStart: '[auth] Update current user start',
  updateCurrentUserSuccess: '[auth] Update current user success',
  updateCurrentUserFailure: '[auth] Update current user failure',

  logout: '[auth] logout'
}

export const actionTypes = {
  register: '[auth] Register',
  login: '[auth] Login',
  getCurrentUser: '[auth] Get current user',
  updateCurrentUser: '[auth] Update current user',
  logout: '[auth] logout'
}

export const getterTypes = {
  currentUser: '[auth] currentUser',
  currentUserId: '[auth] currentUserId',
  currentUserRole: '[auth] currentUserRole',
  isLoggedIn: '[auth] isLoggedIn',
  isAnonymous: '[auth] isAnonymous',
}

const getters = {
  [getterTypes.currentUser]: state => {
    return state.currentUser
  },
  [getterTypes.currentUserId]: state => {
    return state.currentUserId
  },
  [getterTypes.currentUserRole]: state => {
    return state.currentUserRole
  },
  [getterTypes.isLoggedIn]: state => {
    return Boolean(state.isLoggedIn)
  },
  [getterTypes.isAnonymous]: state => {
    return state.isLoggedIn === false
  }
}

const mutations = {
  [mutationTypes.registerStart](state) {
    state.isSubmitting = true
    state.validationErrors = null
  },
  [mutationTypes.registerSuccess](state, payload) {
    state.isSubmitting = false
    state.isLoggedIn = true
    state.currentUser = payload
  },
  [mutationTypes.registerFailure](state, payload) {
    state.isSubmitting = false
    state.validationErrors = payload
  },
  [mutationTypes.loginStart](state) {
    state.isSubmitting = true
    state.validationErrors = null
  },
  [mutationTypes.loginSuccess](state, payload) {
    state.isSubmitting = false
    state.isLoggedIn = true
    state.currentUserId = payload.id
    state.currentUser = payload.username
    state.currentUserRole = payload.role
    isAuthenticated.value = true
  },
  [mutationTypes.loginFailure](state, payload) {
    state.isSubmitting = false
    state.validationErrors = payload
  },
  [mutationTypes.getCurrentUserStart](state) {
    state.isLoading = true
  },
  [mutationTypes.getCurrentUserSuccess](state, payload) {
    state.isLoading = false
    state.isLoggedIn = true
    state.currentUser = payload
  },
  [mutationTypes.getCurrentUserFailure](state) {
    state.isLoading = false
    state.isLoggedIn = false
    state.currentUser = null
  },
  [mutationTypes.updateCurrentUserStart]() {},
  [mutationTypes.updateCurrentUserSuccess](state, payload) {
    state.currentUser = payload
  },
  [mutationTypes.updateCurrentUserFailure]() {},
  [mutationTypes.logout]() {
      state.currentUserId = null
      state.currentUser = null
      state.currentUserRole = null
      state.isLoggedIn = false
      isAuthenticated.value = false
  }
}

const actions = {
  [actionTypes.register](context, credentials) {
    return new Promise(resolve => {
      context.commit(mutationTypes.registerStart)
      authApi
        .register(credentials)
        .then(response => {
          context.commit(mutationTypes.registerSuccess, response.data.user)
          setItem('accessToken', response.data.user.token)
          resolve(response.data.user)
        })
        .catch(result => {
          context.commit(
            mutationTypes.registerFailure,
            result.response.data.errors
          )
        })
    })
  },
  [actionTypes.login](context, credentials) {
    return new Promise(resolve => {
      context.commit(mutationTypes.loginStart)
      authApi
        .login(credentials)
        .then(response => {
            setItem('accessToken', response.data.access)
            setItem('refreshToken', response.data.refresh)
            const token = getItem('accessToken'); // Replace with your token retrieval logic
            const payloadBase64 = token.split('.')[1];
            const decodedTokenPayload = JSON.parse(window.atob(payloadBase64));
            const role = decodedTokenPayload.user_role;
            const username = decodedTokenPayload.username;
            const id = decodedTokenPayload.user_id;
            context.commit(mutationTypes.loginSuccess, {username,id,role})
          resolve(response.data)
        })
        .catch(result => {
            console.log(result)
        //   context.commit(
        //     mutationTypes.loginFailure,
        //     result.response.data.detail
        //   )
        })
    })
  },
  [actionTypes.getCurrentUser](context) {
    return new Promise(resolve => {
      context.commit(mutationTypes.getCurrentUserStart)
      authApi
        .getCurrentUser()
        .then(response => {
          context.commit(
            mutationTypes.getCurrentUserSuccess,
            response.data.user
          )
          resolve(response.data.user)
        })
        .catch(() => {
          context.commit(mutationTypes.getCurrentUserFailure)
        })
    })
  },
  [actionTypes.updateCurrentUser](context, {currentUserInput}) {
    return new Promise(resolve => {
      context.commit(mutationTypes.updateCurrentUserStart)
      authApi
        .updateCurrentUser(currentUserInput)
        .then(user => {
          context.commit(mutationTypes.updateCurrentUserSuccess, user)
          resolve(user)
        })
        .catch(result => {
          context.commit(
            mutationTypes.updateCurrentUserFailure,
            result.response.data.errors
          )
        })
    })
  },
  [actionTypes.logout](context) {
    return new Promise(resolve => {
    
    //   setItem('accessToken', '')
    //   setItem('refreshToken', '')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      context.commit(mutationTypes.logout)
      resolve()
    //   window.location.reload()
    })
  }
}

export default {
  state,
  actions,
  mutations,
  getters,
  isAuthenticated: isAuthenticated.value
}
