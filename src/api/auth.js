import axios from '@/api/axios'

const register = credentials => {
  return axios.post('/', { user: credentials })
}

const login = credentials => {
  return axios.post('/auth/token/', credentials)
}

const getCurrentUser = () => {
  return axios.get('/user')
}

const getOneProtocol = id => {
  return axios.get(`/admin/contract/protocol/detail/:${id}`)
}

const getAllProtocols = () => {
  return axios.get(`/admin/contract/protocol/list/`)
}

const updateCurrentUser = currentUserInput => {
  return axios
    .put('/user', { user: currentUserInput })
    .then(response => response.data.user)
}

export default {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  getOneProtocol,
  getAllProtocols,
}
