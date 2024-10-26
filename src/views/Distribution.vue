<template>
    <div>
        <h3 class="w-100 mb-2">Taqsimot</h3>


        <div class="form-group col-12 d-flex mb-5">
            <div class="col-3">
                <label for="fond-list1">Protokol tanlang:</label>
                <select class="form-select" id="fond-list1" v-model="selectedProtocol" @click="fetchProtocolList">
                    <option :value="protocol" v-for="protocol in protocolList" :key="protocol.id">protocol: {{ protocol.id
                    }}</option>
                </select>
            </div>
            <ul class="p-0 m-0 d-flex flex-row col-9 justify-content-around list-unstyled align-items-end"
                v-show="selectedProtocol">
                <li v-for="key of Object.keys(selectedProtocol || {})" :key="key"
                    class="d-block mr-2 border-1 border-secondary cil-border-all p-1 solid">
                    <CBadge color="info" style="font-size: 13px;" shape="rounded-pill">{{ key }}: {{ selectedProtocol[key] }}
                    </CBadge>
                </li>
            </ul>
        </div>
        <div class="w-100 d-flex flex-row justify-content-end mb-2" v-if="Object.keys(selectedProtocol || {}).length>0">
            <CButton size="sm" color="info" style="width: 130px;" @click="isVisibleTable = true">Shakllantirish</CButton>
            <CButton size="sm" color="success" style="margin-left: 10px;margin-right: 10px;min-width: 130px;" @click="distributeProfit">Foydani taqsimlash</CButton>
            <div class="d-flex align-items-center">
                <CFormInput style="width: 130px;" v-model.number="insertedProfit"></CFormInput>
                <CButton size="sm" color="secondary"><CIcon icon="cil-plus" height="16" alt="true" @click="addProfit"/></CButton>
            
            </div>
            
        </div>

        <table class="table table-striped" v-show="isVisibleTable">
            <thead>
                <tr>
                    <th>Korxona</th>
                    <th>Fond</th>
                    <th>Summa</th>
                    <th>%</th>
                </tr>
            </thead>
            <tbody>
                <!-- Your table rows go here -->
                <tr>
                    <td style="font-weight: 600;">{{ fondData ? fondData.title?.uz : '' }}</td>
                    <td style="font-weight: 600;">{{ fondData ? fondData.title?.uz : '' }}</td>
                    <td style="font-weight: 600;"
                        :style="{ color: (fondData ? (fondData.fond_balance - distrAmount) : 0) <= 0 ? 'red' : '' }">{{ fondData ?
                            fondData.fond_balance - distrAmount : '' }}
                        <span v-show="(fondData ? fondData.fond_balance - distrAmount : 0) < 0">Balans yetmaydi</span>
                    </td>
                    <td style="font-weight: 600;">{{ fondPercent }}</td>
                </tr>
                <tr v-for="data in tableData" :key="data">
                    <td>{{ data.factory }}</td>
                    <td>{{ data.fond }}</td>
                    <td>{{ data.sum }}</td>
                    <td>{{ data.percent }}</td>
                </tr>
                <tr>
                    <td><select class="form-select" id="fond-list" v-model="selectedOrganizations"
                            @click="fetchOrganizationList">
                            <option :value="fond" v-for="fond in subdistriborg" :key="fond.id"> {{ fond.title?.uz }}
                            </option>
                        </select></td>
                    <td>{{ fondData ? fondData.title?.uz : '' }}</td>
                    <td><input type="number" :disabled="!selectedOrganizations?.id" v-model="distrAmount" @keyup.enter="addNewRow()"
                            :style="{ border: '2px solid' + fondData?.fond_balance < distrAmount ? 'red' : '' }"></td>
                    <td>{{ organizationPercent }}</td>
                </tr>
            </tbody>
            <CButton color="info" class="mt-2" size="sm" style="width: 130px;right: 0;" @click.prevent="createDistribution">Submit</CButton>
            <!-- <div class="d-inline-flex flex-row"> -->
                <CBadge color="success" @click="" shape="rounded-pill" style="    margin-right: 10px;
    margin-left: 50px;cursor: pointer;"><CIcon icon="cil-check" height="18" alt="true"/> </CBadge>

                <CBadge color="danger" shape="rounded-pill" @click="" style="cursor: pointer;"> <CIcon icon="cil-x-circle" height="18" alt="true" />  </CBadge>

            <!-- </div> -->
        </table>
    </div>
</template>

<script>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { Protocols, Organizations, Distribution, SubDistribution, Fonds } from '@/api/schema'
import { getItem } from '@/helpers/persistanceStorage'
import { CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect } from "@coreui/vue";
import { useRouter, useRoute } from 'vue-router'
export default {
    name: 'DashboardPage',
    components: {
        CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect
    },
    onMounted() {

    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const fondData = ref([]);
        const protocolList = ref([]);
        const organizationList = ref([]);
        const selectedOrganizations = ref([])
        const selectedFond = ref([])
        const selectedProtocol = ref([])
        const isOrganizationSelect = ref(false)
        const subdistrib = ref(null)
        const distrAmount = ref(0)
        const subdistriborg = ref(null)
        const isVisibleTable = ref(false)
        const typeList = ref([
            { name: 'withdraw' },
            { name: 'income' },
            { name: 'outgoing' },
        ]);
        const contract_date = ref(null)
        const balances = reactive({})
        let totalBalance = ref(0)
        const insertedBalances = computed(() => {
            return Object.values(balances).reduce((acc, cur) => acc + cur, 0)
        })
        onMounted(() => {
            fetchOrganizationList()
            fetchFondList()
        })
        const formData = reactive({
            balance: null,
            fond: [],
            type: 'outgoing'
        })
        const formDataDistr = reactive({
            balance: null,
            fond: [],
            type: 'outgoing',
            organization: null,
        })
        async function submitForm() {
            try {
                await Protocols.create(formData)
                await getList()
                isVisibleSidebar.value = false

            } catch (e) {
                console.log(e.response?.data)
            }
        }
        let saveFondBalance = 0
        async function fetchFondList() {
            fondData.value = await Fonds.list().then(res => res?.data || []);
            fondData.value = fondData.value.filter(t => t.id == route.params.id)[0];
             saveFondBalance = +fondData.value.fond_balance
        }
        async function fetchOrganizationList() {
            subdistriborg.value = await Organizations.list().then(res => res?.data || []);
        }
        async function fetchProtocolList() {
            protocolList.value = await Protocols.list().then(res => res?.data || []);
        }

        watch(selectedOrganizations, () => {
            insertedBalances.value = 0
        })

        function createDistribution() {
            let selectedOrgWithBalance = tableData.value.map(t => {
                let obj = {}
                obj.organization = t.id
                obj.balance = t.sum
                return obj
            })
            Distribution.create({
                subdistributions: selectedOrgWithBalance,
                fond: fondData.value?.id,
            })
        }
        const tableData = ref([
            // Your data goes here, e.g., an array of objects
            // { factory: fondData.value?.title?.uz, fond: fondData.value?.title?.uz, sum: fondData.value?.fond_balance, percent: 100 },
            // Add more rows as needed
        ])

        function addNewRow() {
            // Create a new row object with default 
            const newRow = {
                factory: selectedOrganizations.value?.title?.uz, // You can set default values here
                id: selectedOrganizations.value?.id, // You can set default values here
                fond: fondData.value?.title?.uz,
                sum: Number(distrAmount.value), // Set the default value as needed
                percent: organizationPercent.value, // Set the default value as needed
            };
            fondData.value.fond_balance = +fondData.value.fond_balance - Number(distrAmount.value)

            // Push the new row to the tableData array
            tableData.value.push(newRow);
            distrAmount.value = 0
            selectedOrganizations.value=null
        }
        
        const organizationPercent = computed(() => {
            return Number(distrAmount.value) * 100 / saveFondBalance
        })
        const fondPercent = computed(() => {
            let num = fondData.value?.fond_balance * 100 /saveFondBalance
            return num % 1 == 0 ? num: (num).toFixed(2)
              
        })
        watch(distrAmount,()=>{
            tableData.value.forEach(t=>{
                t.percent = Number(t.sum) * 100 / saveFondBalance
            })
            console.log(tableData)
        })

        const insertedProfit = ref(0)
        async function distributeProfit(){

        }
        return {
            insertedProfit,
            distributeProfit,
            organizationPercent,
            fondPercent,
            tableData,
            formData,
            submitForm,
            fetchFondList,
            organizationList,
            fetchOrganizationList,
            fondData,
            contract_date,
            typeList,
            isVisibleTable,
            isOrganizationSelect,
            formDataDistr,
            subdistrib,
            distrAmount,
            balances,
            insertedBalances,
            totalBalance,
            createDistribution,
            selectedOrganizations,
            selectedFond,
            subdistriborg,
            fetchProtocolList,
            protocolList,
            addNewRow

        }
    },
}
</script>


<style lang="scss" ></style>