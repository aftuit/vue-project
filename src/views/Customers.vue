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
										<div>{{ item.user?.get_full_name }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.address }}</div>
									</CTableDataCell>
									<CTableDataCell>
										<div>{{ item.inn }}</div>
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
import { Customers } from '@/api/schema'
export default {
	name: 'DashboardPage',
	components: {},
	setup() {
		let listData = ref([])
		async function getList() {
			listData.value = await Customers.list().then(res => res.data)
		}
		onMounted(() => {
			getList()
		})
		const fields = computed(() => {
			return Customers?.fields
		})
		return {
			listData,
			fields,
		}
	},
}
</script>
