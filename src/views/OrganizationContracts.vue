<template>
    <div>
        <CRow>
            <CCol :md="12">
                <CCard class="mb-4">
                    <CCardBody class="d-flex flex-column">
                        <CButton component="button" type="button" color="info" class="mb-2 align-self-end text-white"
                            @click="isVisibleSidebar = true">shartnoma qo'shish</CButton>
                        <CTable align="middle" class="mb-0 border" hover responsive>
                            <CTableHead color="light">
                                <CTableRow>
                                        <template v-for="label in fields" :key="label" >
                                            <CTableHeaderCell v-if="label.visible">
                                                {{ label.label }}
                                            </CTableHeaderCell>
                                        </template>
                                        <CTableHeaderCell>Tasdiqlash</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                <CTableRow v-for="item in listData" :key="item.id" @click="openModal(item)">
                                    <CTableDataCell>
                                        <div>{{ item.id }}</div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ item.organization ? item.organization.uz : '' }}</div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ item.contract_date }}</div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ item.status }}</div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ item.type }}</div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ item.subdistribution }}</div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CButton style="color:white" :disabled="item.status=='Completed'" size="sm" class="btn btn-success" variant="success" @click="verifyStatus(item)"><CIcon icon="cil-check" height="18" alt="true" style="margin-right: 5px;"/>Tasdiqlash</CButton>
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
                <CModalTitle>Shartnoma yaratish</CModalTitle>
            </CModalHeader>
            <div v-for="(field, index) in fields" :key="index">
                <div v-if="field.isAddable" class="mt-3">
                    <CFormLabel v-if="field.key !== 'type'">{{ field.label }}</CFormLabel>
                    <CFormSelect v-if="field.key === 'organization'" v-model="formData[field.key]" @click="fetchOrgList">
                        <option :value="org.id" v-for="org in orgList" :key="org.id">{{ org.title.uz }}</option>
                    </CFormSelect>
                    <!-- <CFormSelect  v-else-if="field.key === 'type'" v-model="formData[field.key]">
                        <option :value="type1.id" v-for="type1 in typeList" :key="type1.id">{{ type1.name }}</option>
                    </CFormSelect> -->
                    <input v-else-if="field.key=='contract_date'" type="date" v-model="formData[field.key]" class="d-block">
                </div>
            </div>
            <label for="blns">Balans</label>
            {{ balanceOrg }}
            <CModalFooter>
                <CButton color="secondary">Yopish</CButton>
                <CButton color="primary" @click="submitForm">Saqlash</CButton>
            </CModalFooter>
        </CModal>
    </div>
</template>

<script>
import axios from '@/api/axios';
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { Organizations,Fonds,OrganizationContracts} from '@/api/schema'
import {getItem} from '@/helpers/persistanceStorage'
import { CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea,CModal,CSelect,CMultiSelect, CButton, CTableRow } from "@coreui/vue";
export default {
    name: 'DashboardPage',
    components: {
    CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect,
    CButton,
    CTableRow
},
    onMounted(){

    },
    setup() {
        let listData = ref([])
        const isVisibleSidebar = ref(false)
        const modalProtocol = ref(null)
        const orgList = ref([]);
        
        const token = getItem('accessToken'); // Replace with your token retrieval logic
        const payloadBase64 = token.split('.')[1];
        const decodedTokenPayload = JSON.parse(window.atob(payloadBase64));
        const currentUserRole = decodedTokenPayload.user_role;
        const currentUser = decodedTokenPayload.username;
        const currentUserId = decodedTokenPayload?.user_id;
        const selectedDate  = ref('')
        const typeList = ref([
            { name: 'withdraw', id: 1 },
            { name: 'income', id: 2 },
            { name: 'outgoing', id: 3 },
        ]);
        // const contractList = ref([]);
        async function getList() {
            listData.value = await OrganizationContracts.list().then(res => res?.data || [])
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
            return OrganizationContracts?.fields
        })

        const balanceOrg = computed(() => {
            return orgList.value.filter(t=>t.id == formData['organization'])[0]?.sub_distributions?.balance
        })


        const subdistributions = computed(() => {
            return orgList.value.filter(t => t.id==formData.organization)[0]?.sub_distributions
        })

        const formData = reactive({
            contract_date: null,
            organization: null,
      })
      const selectedRowData = ref('')
      function openModal(item) {
      selectedRowData.value = item;
    }
      async function submitForm(){
        formData.subdistribution= subdistributions.value?.id,
        formData.balance= subdistributions.value?.balance
        console.log(formData)
        try{
            await OrganizationContracts.create(formData)
            await getList()
            isVisibleSidebar.value = false

        }catch(e){
            console.log(e.response?.data)
        }
      }
      async function fetchOrgList() {
            orgList.value = await Organizations.list().then(res => res?.data || []);
        }
    //   async function fetchContractList() {
    //     contractList.value = await axios.get(`site/contract/list/?fond=${formData.fond}`).then(res=>res.data)
    //     }
        // watch(()=>formData.fond,()=>{
        //     fetchContractList()
        // })
        
        async function verifyStatus(dt){
            console.log(dt)
            await axios.put(`admin/contract/org-contract/update/${dt.id}/`,{
                status: 'Completed'
            })
            getList()
        }
        return {
            verifyStatus,
            listData,
            fields,
            isVisibleSidebar,
            modalProtocol,
            formData,
            submitForm,
            orgList,
            // contractList,
            // fetchContractList,
            fetchOrgList,
            selectedRowData,
            openModal,
            currentUser,
            currentUserId,
            currentUserRole,
            selectedDate,
            typeList,
            balanceOrg
        }
    },
}
</script>

<style>
.modal-content{
    padding: 25px;
}
</style>
  