<template>
  <div class="bg-light min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <h1>Login</h1>
                  <p class="text-medium-emphasis">Sign In to your account</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Username"
                      autocomplete="username"
                      v-model="username"
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autocomplete="current-password"
                      v-model="password"
                    />
                  </CInputGroup>
                  <span class="error-mess">
                    {{ errorText }}
                  </span>
                  <CRow>
                    <CCol :xs="6">
                      <CButton color="primary" class="px-4" @click="login"> Login </CButton>
                    </CCol>
                    <CCol :xs="6" class="text-right">
                      <CButton color="link" class="px-0">
                        Forgot password?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            <CCard class="text-white bg-primary" style="width: 44%">
              <CCardBody class="text-center" style="padding: 0;">
                <img :src="LoginImage" alt="jpg" style="width: 100%; height: 100%;">
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import {actionTypes} from '@/store/modules/auth'
import {mapState} from 'vuex'
import LoginImage from '../../assets/login-image.jpg'
export default {
  name: 'LoginPage',
  data() {
    return {
      username: "",
      password: "",
      loggedIn: false,
      isVisibleModal: false,
      errorText: this.validationErrors,
      LoginImage: LoginImage
    };
  },
  computed: {
    ...mapState({
      isSubmitting: state => state.auth.isSubmitting,
      validationErrors: state => state.auth.validationErrors
    })
  },
  watch:{
    validationErrors(){
        this.errorText = this.validationErrors
    }
  },
  methods:{
    login() {
        this.$store
        .dispatch(actionTypes.login, {
          username: this.username,
          password: this.password
        })
        .then(() => {
          this.$router.push({path: '/contracts'})
        })
    },
  }
}
</script>

<style>
.error-mess{
    display: block;
    margin-top: 5px;
    margin-bottom: 5px;
    color: red;
}
</style>
