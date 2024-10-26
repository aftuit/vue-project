<template>
	<div>
		<CRow>
			<CCol :md="12">
				<CCard class="mb-4">
					<CCardBody>
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
	</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { Contracts } from '@/api/schema'
export default {
	name: 'DashboardPage',
	components: {},
	setup() {
		let listData = ref([])
		async function getList() {
			listData.value = await Contracts.list().then(res => res.data)
		}

		onMounted(() => {
			getList()
		})
		const fields = computed(() => {
			return Contracts?.fields
		})
		console.log(listData, Contracts)
		return {
			listData,
			fields,
		}
	},
}
</script>
