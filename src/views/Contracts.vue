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
									<CTableHeaderCell v-for="label in fields" :key="label">{{
				label.label
			}}</CTableHeaderCell>
									<CTableHeaderCell>Harakat</CTableHeaderCell>
								</CTableRow>
							</CTableHead>
							<CTableBody>
								<CTableRow v-for="item in listData" :key="item.id">
									<CTableDataCell>
										<div>{{ item.id }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.title }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.investor?.get_full_name }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.fond?.uz }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.condition }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.balance }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.payment_currency }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.description.uz }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.status }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.contract_type }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.percentage }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.profit }}</div>
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
												<CIcon icon="cil-x-circle" height="18" />
											</CButton>
										</div>
									</CTableDataCell>
								</CTableRow>
								<CTableRow> </CTableRow>
							</CTableBody>
						</CTable>
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
		<CModal @close="() => {
				isVisibleSidebar = false
			}
				" :keyboard="false" :visible="isVisibleSidebar" class="p-3">
			<CModalHeader>
				<CModalTitle>Shartnoma yaratish</CModalTitle>
			</CModalHeader>

			<div class="p-3">
				<CFormLabel>Contract number</CFormLabel>
				<CFormInput type="text" v-model="formData.title" />
				<br />
				<CFormLabel>Contract type</CFormLabel>
				<CFormSelect v-model="formData.contract_type">
					<option :value="contract.val" v-for="contract in contract_typeList" :key="contract.id">
						{{ contract.name }}
					</option>
				</CFormSelect>
				<br />
				<CFormLabel>Currency</CFormLabel>
				<CFormSelect v-model="formData.payment_currency">
					<option :value="currency.val" v-for="currency in currencyList" :key="currency.id">
						{{ currency.name }}
					</option>
				</CFormSelect>
				<br />
				<CFormLabel>Balance</CFormLabel>
				<CFormInput type="number" v-model="formData.balance" />
				<br />
				<CFormLabel>Fond</CFormLabel>
				<CFormSelect v-model="formData.fond" @click="fetchFondList">
					<option :value="fond.id" v-for="fond in fondList" :key="fond.id">
						{{ fond.title?.uz }} {{ fond.id }}
					</option>
				</CFormSelect>
				<br />
				<CFormLabel>Description</CFormLabel>
				<CFormTextarea v-model="formData.description"></CFormTextarea>
			</div>
			<CModalFooter>
				<CButton color="secondary" @click="isVisibleSidebar = false">Yopish</CButton>
				<CButton color="primary" @click="submitForm">Saqlash</CButton>
			</CModalFooter>
		</CModal>
	</div>
</template>

<script>
import axios from '@/api/axios'
import { ref, onMounted, reactive, computed } from 'vue'
import { Contracts, Organizations, Fonds, OrganizationContracts } from '@/api/schema'
import {
	CInputGroup,
	CFormInput,
	CFormLabel,
	CFormSelect,
	CFormTextarea,
	CModal,
	CSelect,
	CMultiSelect,
	CButton,
	CTableRow,
} from '@coreui/vue'
import { cilLemon } from '@coreui/icons'
export default {
	name: 'DashboardPage',
	components: {
		CInputGroup,
		CFormInput,
		CFormLabel,
		CFormSelect,
		CFormTextarea,
		CModal,
		CSelect,
		CMultiSelect,
		CButton,
		CTableRow,
	},
	setup() {
		let listData = ref([])
		const isVisibleSidebar = ref(false)
		const modalProtocol = ref(null)
		const fondList = ref([])
		const formData = reactive({
			title: null,
			contract_type: 'INVESTMENT',
			fond: null,
			description: '',
			payment_currency: '',
			balance: '',
		})

		const currencyList = ref([
			{ name: 'UZS', val: 'uzs', id: 1 },
			{ name: 'RUB', val: 'rub', id: 2 },
			{ name: 'USD', val: 'usd', id: 3 },
			{ name: 'EUR', val: 'eur', id: 4 },
		])
		const contract_typeList = ref([
			{ name: 'Investment', val: 'INVESTMENT' },
			{ name: 'Dividend', val: 'DIVIDEND' },
			{ name: 'Withdraw', val: 'WITHDRAW' }
		])

		onMounted(() => {
			getList()
		})
		async function getList() {
			listData.value = await Contracts.list().then(res => res.data);
			// listData.value = await axios.get('admin/contract/list/').then(res => res.data)
		}

		const fieldTwo = computed(() => {
			return OrganizationContracts?.fields
		})
		const fields = computed(() => {
			return Contracts?.fields
		})
		// async function getList() {
		// 	listData.value = await OrganizationContracts.list().then(res => res?.data || [])
		// }
		async function fetchFondList(id) {
			fondList.value = await Fonds.list().then(res => res?.data || [])
			let element = id.target
			if (element.value) {
				formData.fond = element.value
			}
		}
		async function submitForm() {
			try {
				await axios.post(`admin/contract/create/`, formData)
				isVisibleSidebar.value = false
			} catch (e) {
				console.log(e.response?.data)
			}
		}
		async function verifyStatus(id) {
			console.log(id)
			await axios.put(`admin/contract/update/${id}/`, {
				status: 'Completed'
			})
			getList()
		}
		async function deleteItem(id) {
			await axios.delete(`admin/contract/delete/${id}/`)
			getList()
		}
		return {
			listData,
			contract_typeList,
			fields,
			isVisibleSidebar,
			modalProtocol,
			formData,
			currencyList,
			fondList,
			fetchFondList,
			submitForm,
			verifyStatus,
			deleteItem
		}
	},
}
</script>
