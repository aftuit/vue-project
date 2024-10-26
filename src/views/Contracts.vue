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
							>shartnoma qo'shish</CButton
						>
						<CTable align="middle" class="mb-0 border" hover responsive>
							<CTableHead color="light">
								<CTableRow>
									<CTableHeaderCell v-for="label in fields" :key="label">{{
										label.label
									}}</CTableHeaderCell>
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
										<div>{{ item.investor }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.fond }}</div>
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
								</CTableRow>
								<CTableRow> </CTableRow>
							</CTableBody>
						</CTable>
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
		<CModal
			@close="
				() => {
					isVisibleSidebar = false
				}
			"
			:keyboard="false"
			:visible="isVisibleSidebar"
			class="p-3"
		>
			<CModalHeader>
				<CModalTitle>Shartnoma yaratish</CModalTitle>
			</CModalHeader>

			<div class="p-3">
				<CFormLabel>Contract</CFormLabel>
				<CFormInput type="text" v-model="formData.title" />
				<br>
				<CFormLabel>Currency</CFormLabel>
				<CFormSelect v-model="formData.payment_currency">
					<option :value="currency.val" v-for="currency in currencyList" :key="currency.id">
						{{ currency.name }}
					</option>
				</CFormSelect>
				<br>
				<CFormLabel>Balance</CFormLabel>
				<CFormInput type="number" v-model="formData.balance" />
				<br>
				<CFormLabel>Fond</CFormLabel>
				<CFormSelect v-model="formData.fond" @click="fetchFondList">
					<option :value="fond.id" v-for="fond in fondList" :key="fond.id">
						{{ fond.title?.uz }} {{ fond.id }}
					</option>
				</CFormSelect>
				<br>
				<CFormLabel>Description</CFormLabel>
				<CFormTextarea v-model="formData.description"></CFormTextarea>
			</div>
			<CModalFooter>
				<CButton color="secondary">Yopish</CButton>
				<CButton color="primary" @click="submitForm">Saqlash</CButton>
			</CModalFooter>
		</CModal>
	</div>
</template>

<script>
import axios from '@/api/axios';
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

		async function getList() {
			listData.value = await Contracts.list().then(res => res.data)
		}

		onMounted(() => {
			getList()
		})
		const fieldTwo = computed(() => {
			return OrganizationContracts?.fields
		})
		const fields = computed(() => {
			return Contracts?.fields
		})
		async function getList() {
			listData.value = await OrganizationContracts.list().then(res => res?.data || [])
		}
		async function fetchFondList(id) {
			fondList.value = await Fonds.list().then(res => res?.data || [])
			let element = id.target
			if (element.value) {
				formData.fond = element.value
			}
		}
		async function submitForm() {
			console.log(formData)
			try {
				// await OrganizationContracts.create(formData)
				// admin/contract/create/
				await axios.post(`admin/contract/create/`, formData)
				isVisibleSidebar.value = false
			} catch (e) {
				console.log(e.response?.data)
			}
		}
		return {
			listData,
			fields,
			isVisibleSidebar,
			modalProtocol,
			formData,
			currencyList,
			fondList,
			fetchFondList,
			submitForm,
		}
	},
}
</script>
