<template>
    <div>
        <CRow>
            <CCol :md="12">
                <CCard class="mb-4">
                    <CCardBody class="d-flex flex-column">
                        <CTable align="middle" class="mb-0 border" hover responsive>
                            <CTableHead color="light">
                                <CTableRow>
                                        <template v-for="label in fields" :key="label" >
                                            <CTableHeaderCell v-if="label.visible && label.key!='created'&& label.key!='start_date'&& label.key!='end_date'">
                                                {{ label.label }}
                                            </CTableHeaderCell>
                                    
                                        </template>
                                        <CTableHeaderCell>
                                            Taqsimot
                                        </CTableHeaderCell>
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
                      <div>{{ item.fond_balance }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.status }}</div>
                    </CTableDataCell>
                    <!-- <CTableDataCell>
                      <div>{{ item.created }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.start_date }}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{{ item.end_date }}</div> -->
                    <!-- </CTableDataCell> -->
                    <CTableDataCell>
                                        <div>
                                            <router-link
                                                :to="{
                                                    name: 'Distribution',
                                                    params: { id:item.id },
                                                }"
                                                target="_blank"
                                                style="text-decoration: none;"
                                                >
                                                    Taqsimotni ko'rish
                                            </router-link>
                                        </div>
                                    </CTableDataCell>
                  </CTableRow>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
        <CModal @close="
                () => {
                  isVisibleSidebar = false
                }
              " :keyboard="false" :visible="isVisibleSidebar"
            >
            <CModalHeader>
                <CModalTitle>Protokol yaratish</CModalTitle>
            </CModalHeader>
            <div v-for="(field, index) in fields" :key="index">
                <div v-if="field.key!='id' && field.key!='more' && field.key!='user' && field.key!='status' && field.key!='contract'" class="mt-3">
                    <CFormLabel>{{ field.label }}</CFormLabel>
                    <CInputGroup v-if="field.key!='fond' && field.key!='contract'">
                        <CFormInput type="number" v-if="field.visible && field.key!='description'" :placeholder="field.label" :aria-label="field.label"
                            :aria-describedby="'basic-addon-' + field.key" v-model.number="formData[field.key]"/>
                        <CFormInput v-else-if="field.key!='description'" :placeholder="field.label" :aria-label="field.label" v-model="formData[field.key]"/>
                        <CFormTextarea v-else :placeholder="'Enter Description'" v-model="formData[field.key]"/>
                    </CInputGroup>
                    <CFormSelect v-else-if="field.key === 'fond'" v-model="formData[field.key]" @click="fetchFondList">
                        <option :value="fond.id" v-for="fond in fondList" :key="fond.id">{{ fond.title.uz }}</option>
                    </CFormSelect>
                    <!-- <CFormSelect multiple v-else-if="field.key === 'contract'" v-model="formData[field.key]">
                        <option :value="contract.id" v-for="contract in contractList" :key="contract.id">{{ contract.title }}</option>
                    </CFormSelect> -->
                    <!-- <select class="form-multi-select" id="ms1" multiple data-coreui-search="true" v-else-if="field.key === 'contract'" v-model="formData[field.key]" @input="fetchContractList">
                        <option :value="contract.id" v-for="contract in contractList" :key="contract.id">{{ contract.name }}</option>
                    </select> -->
                    <!-- <CMultiSelect v-else-if="field.key === 'contract'" label="Framework" :options="contractList" text="Please select your framework." /> -->
                </div>
            </div>
            <CModalFooter>
                <CButton color="secondary">Yopish</CButton>
                <CButton color="primary" @click="submitForm">Saqlash</CButton>
            </CModalFooter>
        </CModal>
    </div>
</template>

<script>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { Protocols, Contracts,Fonds} from '@/api/schema'
import {getItem} from '@/helpers/persistanceStorage'
import { CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea,CModal,CSelect,CMultiSelect } from "@coreui/vue";
export default {
    name: 'DashboardPage',
    components: {
        CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea,CModal,CSelect,CMultiSelect
    },
    onMounted(){

    },
    setup() {
        let listData = ref([])
        const isVisibleSidebar = ref(false)
        const modalProtocol = ref(null)
        const fondList = ref([]);
        
        const token = getItem('accessToken'); // Replace with your token retrieval logic
        const payloadBase64 = token.split('.')[1];
        const decodedTokenPayload = JSON.parse(window.atob(payloadBase64));
        const currentUserRole = decodedTokenPayload.user_role;
        const currentUser = decodedTokenPayload.username;
        const currentUserId = decodedTokenPayload?.user_id;
        // const contractList = ref([]);
        async function getList() {
            listData.value = await Fonds.list().then(res => res?.data || [])
            // store.dispatch(actionTypes.getAllProtocols)
            // .then(async(res) => {
            //     listData.value = await res.data || []
            // })
            // if(props.id>0){
            //     axios.get(`/admin/contract/protocol/list/`).then(async res => {
            //     listData.value = await res.data || []
            // })
            // }else{

            //     listData.value = []
            // }
        }

        onMounted(() => {
            getList()
        })
        const fields = computed(() => {
            return Fonds?.fields
        })

        const formData = reactive({
            user: currentUserId,
            balance: null,
            fond: [],
            profit: null,
            percentage: null,
            description: null,
      })
      const selectedRowData = ref('')
      function openModal(item) {
      selectedRowData.value = item;
    }
      async function submitForm(){
        try{
            await Protocols.create(formData)
            await getList()
            isVisibleSidebar.value = false

        }catch(e){
            console.log(e.response?.data)
        }
      }
      async function fetchFondList() {
            fondList.value = await Fonds.list().then(res => res?.data || []);
        }
    //   async function fetchContractList() {
    //     contractList.value = await axios.get(`site/contract/list/?fond=${formData.fond}`).then(res=>res.data)
    //     }
        // watch(()=>formData.fond,()=>{
        //     fetchContractList()
        // })
        
        return {
            listData,
            fields,
            isVisibleSidebar,
            modalProtocol,
            formData,
            submitForm,
            fondList,
            // contractList,
            // fetchContractList,
            fetchFondList,
            selectedRowData,
openModal,
currentUser,
currentUserId,
currentUserRole,
        }
    },
}
</script>

<style>
.modal-content{
    padding: 25px;
}
</style>
  