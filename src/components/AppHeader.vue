<template>
  <CHeader position="sticky" class="mb-4">
    <CContainer fluid>
      <CHeaderToggler class="ps-1" @click="$store.commit('toggleSidebar')">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>
      <CHeaderBrand class="mx-auto d-lg-none" to="/">
        <CIcon :icon="logo" height="48" alt="Logo" />
      </CHeaderBrand>
      <CHeaderNav>
        <CNavItem class="d-flex flex-column align-items-center justify-content-center">
            <span style="font-weight: 500; display: block;">{{ currentUserRole }}</span>
          <p style="margin: 0;">{{ currentUser }}</p>
        </CNavItem>
        <AppHeaderDropdownAccnt style="width: 80px;"/>
      </CHeaderNav>
    </CContainer>
    <CHeaderDivider />
    <CContainer fluid>
      <AppBreadcrumb />
    </CContainer>
  </CHeader>
</template>

<script>
import AppBreadcrumb from './AppBreadcrumb'
import AppHeaderDropdownAccnt from './AppHeaderDropdownAccnt'
import { logo } from '@/assets/brand/logo'
import {getItem} from '@/helpers/persistanceStorage'
export default {
  name: 'AppHeader',
  components: {
    AppBreadcrumb,
    AppHeaderDropdownAccnt,
  },
  setup(){
    const token = getItem('accessToken'); // Replace with your token retrieval logic
    const payloadBase64 = token.split('.')[1];
    const decodedTokenPayload = JSON.parse(window.atob(payloadBase64));
    const currentUserRole = decodedTokenPayload.user_role;
    const currentUser = decodedTokenPayload.username;
    return{
        currentUserRole,
        currentUser,
        logo
    }
  }
}
</script>
