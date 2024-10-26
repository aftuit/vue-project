<template>
    <div>
      <CRow>
        <CCol :md="12">
          <CCard class="mb-4">
            <CCardBody class="d-flex flex-column">
                <CButton
                    component="button"
                    type="button"
                    color="info"
                    class="mb-2 align-self-end text-white"
                    @click="isVisibleSidebar = true"
                    >Fond qo'shish</CButton>
              <CTable align="middle" class="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell v-for="label in fields" :key="label">{{ label.label }}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="item in listData" :key="item.id">
                    <CTableDataCell>
                      <div>{{ item.id }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.title.uz }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.reason.uz }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.description.uz }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.old_balance }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.fond_balance }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.status }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.created }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.start_date }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.end_date }}</div>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow> </CTableRow>
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal :backdrop="false" :keyboard="false" :visible="isVisibleSidebar">
        <CModalHeader>
            <CModalTitle>Modal title</CModalTitle>
        </CModalHeader>
        <CModalBody>Modal body text goes here.</CModalBody>
        <CModalFooter>
            <CButton color="secondary" @click="isVisibleSidebar =false">Close</CButton>
            <CButton color="primary">Save changes</CButton>
        </CModalFooter>
        </CModal>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue'
  import { Fonds } from '@/api/schema'
  export default {
    name: 'DashboardPage',
    components: {
    },
    setup() {
      let listData = ref([])
      const isVisibleSidebar = ref(false)
      async function getList(){
  
          listData.value  = await Fonds.list().then(res=> res.data)
      }
  
      onMounted(()=>{
          getList()
      })
      const fields = computed(()=>{
          return Fonds?.fields 
      })
        console.log(listData,Fonds)
      return {
          listData,
          fields,
          isVisibleSidebar
      }
    },
  }
  </script>
  