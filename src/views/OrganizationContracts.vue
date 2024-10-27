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
                                    <template v-for="label in fields" :key="label">
                                        <CTableHeaderCell v-if="label.visible">
                                            {{ label.label }}
                                        </CTableHeaderCell>
                                    </template>
                                    <CTableHeaderCell>Harakatlar</CTableHeaderCell>
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
                                        <div>{{ item.balance }}</div>
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
                                        <div class="d-flex">
                                            <CButton :disabled="item.status == 'Completed'"
                                                v-c-tooltip="{ content: 'Tasdiqlash', placement: 'top' }" size="sm"
                                                class="btn btn-success text-white" @click="verifyStatus(item.id)">
                                                <CIcon icon="cil-check" height="18" alt="true"
                                                    style="margin-right: 5px;" />
                                            </CButton>
                                            <CButton v-c-tooltip="{ content: `O'chirish`, placement: 'top' }" size="sm"
                                                class="btn btn-danger ms-1 text-white" @click="deleteItem(item.id)">
                                                <CIcon icon="cil-check" height="18" />
                                            </CButton>
                                        </div>
                                    </CTableDataCell>
                                </CTableRow>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
        <CModal @close="() => {
                isVisibleSidebar = false
            }
                " :keyboard="false" :visible="isVisibleSidebar">
            <CModalHeader>
                <CModalTitle>Shartnoma yaratish</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <div class="d-flex flex-column gap-3">
                    <div>
                        <CFormLabel>Korxona</CFormLabel>
                        <CFormSelect v-model="formData.organization">
                            <option value="" selected disabled>Tanlang</option>
                            <option v-for="org in orgList" :key="org.id" :value="org.id">
                                {{ org.title?.uz }}
                            </option>
                        </CFormSelect>
                    </div>
                    <div>
                        <CFormLabel>Sanasi</CFormLabel>
                        <input type="date" id="" v-model="formData.contract_date" class="form-control">
                    </div>
                    <div>
                        <CFormLabel>Taqsimot</CFormLabel>
                        <input type="text" id="" v-model="formData.subdistribution" class="form-control" disabled>
                    </div>
                    <div>
                        <CFormLabel>Balance</CFormLabel>
                        <input type="text" v-model="formData.balance" class="form-control" disabled>
                    </div>
                </div>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" @click="isVisibleSidebar = false">Yopish</CButton>
                <CButton color="primary" @click="submitForm">Saqlash</CButton>
            </CModalFooter>
        </CModal>
    </div>
</template>

<script>
import axios from '@/api/axios';
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { Organizations, Fonds, OrganizationContracts } from '@/api/schema'
import { getItem } from '@/helpers/persistanceStorage'
import { cilTrash } from '@coreui/icons';
import { CIcon } from '@coreui/icons-vue';
import { CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect, CButton, CTableRow, CModalBody } from "@coreui/vue";
// import CIcon from '@coreui/icons-vue';
export default {
    name: 'DashboardPage',
    components: {
        CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect,
        CButton,
        CTableRow,
        cilTrash,
        CIcon
    },
    onMounted() {

    },
    setup() {
        let listData = ref([])
        const isVisibleSidebar = ref(false)
        const modalProtocol = ref(null)
        const orgList = ref([{ name: '', id: null }]);

        const token = getItem('accessToken'); // Replace with your token retrieval logic
        const payloadBase64 = token.split('.')[1];
        const decodedTokenPayload = JSON.parse(window.atob(payloadBase64));
        const currentUserRole = decodedTokenPayload.user_role;
        const currentUser = decodedTokenPayload.username;
        const currentUserId = decodedTokenPayload?.user_id;
        const selectedDate = ref('')
        const typeList = ref([
            { name: '', id: 4 },
            { name: 'withdraw', id: 1 },
            { name: 'income', id: 2 },
            { name: 'outgoing', id: 3 },
        ]);

        const formData = reactive({
            organization: null,
            contract_date: null,
            balance: null,
            subdistribution: null
        })

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
            getList();
            fetchOrgList();

        })
        const fields = computed(() => {
            return OrganizationContracts?.fields
        })

        // const balanceOrg = computed(() => {
        //     return orgList.value.find(t => t.id == formData['organization'])?.sub_distributions?.balance
        // })


        // // const subdistributions = computed(() => {
        // //     return orgList.value.find(t => t.id == formData.organization)?.sub_distributions
        // // })

        watch(() => formData.organization, (newValue) => {
            console.log(newValue);
            formData.subdistribution = orgList.value.find(t => t.id == newValue)?.sub_distributions?.id || '-';
            formData.balance = orgList.value.find(t => t.id == newValue)?.sub_distributions?.balance ?? '-';
        }, { immediate: true })


        const selectedRowData = ref('')
        function openModal(item) {
            selectedRowData.value = item;
        }
        async function submitForm() {
            try {
                await OrganizationContracts.create(formData)
                await getList()
                isVisibleSidebar.value = false

            } catch (e) {
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

        async function verifyStatus(dt) {
            console.log(dt)
            await axios.put(`admin/contract/org-contract/update/${dt.id}/`, {
                status: 'Completed'
            })
            getList()
        }
        async function deleteItem(id) {
            await axios.delete(`admin/contract/org-contract/delete/${id}/`)
            getList()
        }
        return {
            verifyStatus,
            deleteItem,
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
            // balanceOrg
        }
    },
}
</script>

<style>
.modal-content {
    padding: 25px;
}
</style>