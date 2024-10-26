<template>
  <CDropdown variant="nav-item">
    <CDropdownToggle @click.prevent placement="bottom-end" class="" :caret="false">

      <CAvatar :src="avatar" size="xl"/>
    </CDropdownToggle>
    <CDropdownMenu >
      <CDropdownItem @click="logout" style="cursor: pointer;"> <CIcon icon="cil-lock-locked"/> Logout </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<script>
import {
  actionTypes as authActionTypes
} from '@/store/modules/auth'
import avatar from '../assets/images/avatars/9.jpg'

export default {
  name: 'AppHeaderDropdownAccnt',
  setup() {
    return {
      avatar: avatar,
      itemsCount: 42,
    }
  },
  methods:{
    logout() {
      this.$store.dispatch(authActionTypes.logout).then(() => {
        this.$router.push({name: 'Login'})
      })
    }
  },

}
</script>
