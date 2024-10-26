<template>
    <div>
        <h2>Protokol #{{ id }}</h2>
        <h4>Fond #{{ listData.fond }}</h4>
        <CRow>
            <CCol :md="12">
                <CCard class="mb-4" style="width: 50%;">
                    <CCardBody class="d-flex flex-column">
                        <CTable align="middle" class="mb-0 border" hover responsive>
                            <CTableHead color="light">
                                <CTableRow>
                                    <CTableHeaderCell>

                                    </CTableHeaderCell>
                                    <CTableHeaderCell>
                                        Yanvar
                                    </CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                <CTableRow>
                                    <CTableDataCell>
                                        <div>Foyda: </div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ listData.profit }}</div>
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableDataCell>
                                        <div>Dividend solig'i: </div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div>{{ listData.percentage }}</div>
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableDataCell>
                                        <div style="font-weight: 700;">Sof foyda: </div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div style="font-weight: 700;">{{ listData.profit - listData.percentage }}</div>
                                    </CTableDataCell>
                                </CTableRow>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
                <CCard class="mb-4">
                    <CCardBody class="d-flex flex-row justify-content-between">
                        <div class="col-5">
                            <p>Sana: </p>
                            <CTable align="middle" class="mb-0 border protocol-table" hover responsive>
                                <CTableHead color="light">
                                    <CTableRow>
                                        <template v-for="label in fields.filter(t => (t.key == 'inn' || t.key == 'id' ||
                                            t.key == 'percentage' || t.key == 'contract_total_balance'))" :key="label">
                                            <CTableHeaderCell>
                                                {{ label.label }}
                                            </CTableHeaderCell>
                                        </template>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    <CTableRow v-for="item of listData.investor" :key="item.id">
                                        <CTableDataCell>
                                            <div>{{ item.id }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.inn }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.contract_total_balance }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.percentage }}</div>
                                        </CTableDataCell>
                                    </CTableRow>
                                    <CTableRow>
                                        <CTableDataCell>
                                            <div></div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">Jami</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sumOfTotalBalance }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sumOfTotalPercent }}</div>
                                        </CTableDataCell>
                                    </CTableRow>

                                </CTableBody>
                            </CTable>
                        </div>
                        <div class="col-7" style="padding-left: 20px;">
                            <p>Sana: </p>
                            <CTable align="middle" class="mb-0 border protocol-table" hover responsive>
                                <CTableHead color="light">
                                    <CTableRow>
                                        <template v-for="label in fields.filter(t => {
                                            return (t.key == 'initial_balance' ||
                                                t.key == 'withdraw' || t.key == 'client_balance' || t.key == 'old_percentage' ||
                                                t.key == 'dividend' || t.key == 'investment')
                                        })" :key="label">
                                            <CTableHeaderCell>
                                                {{ label.label }}
                                            </CTableHeaderCell>
                                        </template>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    <CTableRow v-for="item of listData.investor" :key="item.id">
                                        <CTableDataCell>
                                            <div>{{ item.initial_balance }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.withdraw }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.client_balance }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.old_percentage }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.dividend }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>{{ item.investment }}</div>
                                        </CTableDataCell>
                                    </CTableRow>
                                    <CTableRow>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sum_initial_balance }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sum_withdraw }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sum_client_balance }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sum_old_percentage }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ sum_dividend }}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div style="font-weight: 500;">{{ 0 }}</div>
                                        </CTableDataCell>
                                    </CTableRow>
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
</template>
  
<script>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import axios from '@/api/axios'
import { ProtocolInfo } from '@/api/schema'
import { getters } from '@/store/modules/auth'
import { useStore } from 'vuex'
import { CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect, CTableRow } from "@coreui/vue";
export default {
    name: 'DashboardPage',
    props: ['id'],
    components: {
        CInputGroup, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CModal, CSelect, CMultiSelect,
        CTableRow
    },
    setup(props) {
        const listData = ref({})
        const sumOfTotalBalance = ref(0)
        const sumOfTotalPercent = ref(0)
        const sum_initial_balance = ref(0)
        const sum_withdraw = ref(0)
        const sum_client_balance = ref(0)
        const sum_old_percentage = ref(0)
        const sum_dividend = ref(0)
        async function getList() {
            await ProtocolInfo.list({ id: props?.id }).then(res => {
                listData.value = res.data
                sumOfTotalBalance.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.contract_total_balance > 0 ? curr.contract_total_balance : 0)), 0)
                sumOfTotalPercent.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.percentage > 0 ? curr.percentage : 0)), 0)
                sum_initial_balance.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.initial_balance > 0 ? curr.initial_balance : 0)), 0)
                sum_withdraw.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.withdraw > 0 ? curr.withdraw : 0)), 0)
                sum_client_balance.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.client_balance > 0 ? curr.client_balance : 0)), 0)
                sum_old_percentage.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.old_percentage > 0 ? curr.old_percentage : 0)), 0)
                sum_dividend.value = res.data?.investor?.reduce((acc, curr) => (acc + (curr.dividend > 0 ? curr.dividend : 0)), 0)

            })
        }
        onMounted(() => {
            getList()
        })
        const fields = computed(() => {
            return ProtocolInfo?.fields
        })

        return {
            listData,
            fields,
            sumOfTotalBalance,
            sumOfTotalPercent,
            sum_initial_balance,
            sum_withdraw,
            sum_client_balance,
            sum_old_percentage,
            sum_dividend,
        }
    },
}
</script>

<style>
.modal-content {
    padding: 25px;
}
.protocol-table tr th{
    font-size: 13px;
    font-weight: 500;
}
.protocol-table tr td div{
    font-size: 13px;
    font-weight: 500;
}
.protocol-table tr:last-child td div{
    font-size: 15px;
    font-weight: 500;
}
</style>
  