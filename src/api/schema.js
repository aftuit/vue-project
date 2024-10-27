/* eslint-disable */
import Vue from 'vue'
import { reactive } from 'vue'
import axios from './axios'
import { globalErrors } from "./lib";

export let Permissions = {}

export class APIMethod {
	constructor(def = {}) {
		def = Object.assign(
			{
				method: 'GET',
				path: '',
				error: {
					message() {
						return 'Ошибка запроса: ' + this.path
					},
					handler: undefined,
				},
			},
			def,
		)
		this.method = def.method.toUpperCase()
		this.type = def.type.toLowerCase()
		const id = /(:[^/]+)/.exec(def.path)
		this.path = def.path
		if (id != null) this.id = id[0].replace(':', '')
		this.errorMessage = def.error.message
		this.permissionKeyFallback = def.permissionKeyFallback
		if (def.error.handler) this.errorHandler = def.errorHandler
	}

	errorHandler(e) {
		// console.error(this.errorMessage(), e.response.data);
		if (this.type == 'list' && e?.response?.status == 404) {
			console.error(e)
			return
		}
		if (e?.response?.data) {
			//   if (Array.isArray(e.response.data)) {
			//     globalErrors.value.push(e.response.data)
			//   }
			//   if (e?.response?.data?.detail)
			//     globalErrors.value.push(e.response.data.detail)
			//   else if (e.response.data.non_field_errors)
			//     globalErrors.value.push(e.response.data.non_field_errors)
			console.log(e)
		} else {

			//   Vue.$toast({
			//     component: ToastificationContent,
			//     props: {
			//       title: this.errorMessage(),
			//       icon: 'AlertTriangleIcon',
			//       variant: 'danger',
			//     },
			//   })
		}
	}

	async send(params) {
		if (this.id !== undefined) {
			if (params instanceof FormData) var id = params.get(this.id)
			else id = params[this.id]

			if (this.method == 'GET' || this.method == 'POST') delete params[this.id]
		}
		try {
			var method = this.method.toLowerCase()
			var req = await axios[method](
				this.path.replace(':' + this.id, id),
				method == 'get' ? { params } : params,
			)
			return req
		} catch (e) {
			this.errorHandler(e)
			throw e
		}
	}
}

export class APINode {
	constructor(methods, flags = {}, fields = []) {
		this.flags = Object.assign(
			{
				paginated: false,
				listable: false,
				editable: false,
				deletable: false,
				addable: false,
				toggleable: false,
			},
			flags,
		)
		fields.forEach((field) => {
			if (field.filter == 'option') {
				field.idField = field.idField || 'id'
				field.valueField = field.valueField || 'title'
			}
		})
		this.fields = fields
		methods.forEach((endpoint) => {
			this['_' + endpoint.type] = endpoint
			if (endpoint.id) this.idKey = endpoint.id
		})
		if (this._list && flags.listable === undefined) this.flags.listable = true
		if (this._delete && flags.deletable === undefined)
			this.flags.deletable = true
		if (this._patch && flags.editable === undefined) this.flags.editable = true
		if (this._create && flags.addable === undefined) this.flags.addable = true
		if (this._toggle && flags.toggleable === undefined)
			this.flags.toggleable = true
	}

	data = reactive({
		dict: {},
		items: [],
		meta: {},
		pagination: {
			from: 0,
			to: 0,
			of: 0,
			per: 0,
		},
	})

	async list(params) {
		try {
			var req = await this._list.send(params)
		} catch (e) {
			if (e?.request?.status == 404) {
				this.data.items = []
				if (this.flags.paginated) {
					this.data.pagination.from = 0
					this.data.pagination.to = 0
					this.data.pagination.per = 0
					this.data.pagination.of = 0
				}
			} else {
				throw e
			}
		}
		if (req) {
			if (this.flags.paginated) {
				if (req.data.count !== undefined) {
					this.data.items = req.data.results
					this.data.pagination.from = req.data.count
						? req.data.page_size * (req.data.page_number - 1) + 1
						: 0
					this.data.pagination.to = Math.min(
						req.data.page_size * req.data.page_number,
						req.data.results.length,
					)
					this.data.pagination.of = req.data.count
					this.data.pagination.per = req.data.page_size
				} else {
					this.data.items = req.data.items
					this.data.pagination.from = req.data.size * (req.data.page - 1) + 1
					this.data.pagination.to = Math.min(
						req.data.size * req.data.page,
						req.data.items?.length,
					)
					this.data.pagination.of = req.data.total
					this.data.pagination.per = req.data.size
				}
			} else {
				if (this.flags.key) {
					this.data.meta = req.data
					this.data.items = this.data.meta[this.flags.key]
				} else {
					this.data.items = req.data
				}
			}
			return req
		}
	}

	async get(params) {
		const id = params[this._get.id]
		let req = await this._get.send(params)
		if (req) {
			this.data.dict[id] = req.data
			return req
		}
	}

	create(params) {
		return this._create?.send(params)
	}
	patch(params) {
		return this._patch.send(params)
	}
	replace(params) {
		return this._replace.send(params)
	}
	toggle(params) {
		return this._toggle.send(params)
	}
	change(params) {
		return this._change.send(params)
	}
	reset(params) {
		return this._reset.send(params)
	}
	delete(id) {
		const o = {}
		o[this._delete.id] = id
		return this._delete.send(o)
	}

	permissions = {
		list: () => permission(this?._list),
		get: () => permission(this?._get),
		create: () => permission(this?._create),
		patch: () => permission(this?._patch),
		replace: () => permission(this?._replace),
		toggle: () => permission(this?._toggle),
		change: () => permission(this?._change),
		reset: () => permission(this?._reset),
		delete: () => permission(this?._delete),
	}

	getResourceURL(id) {
		if (id != null) return this._patch.path.replace(':' + this._patch.id, id)
		else throw 'ID not provided'
	}
}

export function permission(method) {
	if (!method) return false
	let path = method.path
	return Permissions[path]?.[method.method] || false
}

export const Contracts = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/list/" })],
	{ paginated: true },
	[
		{
			visible: true,
			key: "id",
			label: "ID",
		},
		{
			visible: true,
			key: "title",
			label: "Nomi",
		},
		{
			visible: true,
			key: "investor",
			label: "investor",
		},
		{
			visible: true,
			key: "fond",
			label: "fond",
		},
		{
			visible: false,
			key: "condition",
			label: "holati",
		},
		{
			visible: true,
			key: "balance",
			label: "balans",
		},
		{
			visible: true,
			key: "payment_currency",
			label: "valyuta",
		},
		{
			visible: true,
			key: "description",
			label: "ma'lumot"
		},
		{
			visible: true,
			key: "status",
			label: "status",
		},
		{
			visible: true,
			key: "contract_type",
			label: "shartnoma turi",
			sortable: true,
		},
		{
			visible: true,
			key: "percentage",
			label: "foiz",
		},
		{
			visible: true,
			key: "profit",
			label: "foyda",
		},
	]
);

export const OrganizationContracts = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/org-contract/list/" }),
	new APIMethod({ type: "create", method: "POST", path: "admin/contract/org-contract/create/" })],
	{ paginated: true },
	[
		{
			visible: true,
			isAddable: false,
			key: "id",
			label: "ID",
		},
		{
			visible: true,
			isAddable: true,
			key: "organization",
			label: "Korxona",
		},
		{
			visible: true,
			isAddable: true,
			key: "contract_date",
			label: "Sanasi",
		},
		{
			visible: true,
			isAddable: true,
			key: "balance",
			label: "Balansi",
		},
		{
			visible: true,
			isAddable: false,
			key: "status",
			label: "status",
		},
		{
			visible: true,
			isAddable: true,
			key: "type",
			label: "type",
		},
		{
			visible: true,
			isAddable: false,
			key: "subdistribution",
			label: "Taqsimot",
			sortable: true,
		},
	]
);

export const Fonds = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/fond/list/" })],
	{ paginated: true },
	[
		{
			visible: true,
			key: "id",
			label: "ID",
		},
		{
			visible: true,
			key: "title",
			label: "Nomi",
		},
		{
			visible: true,
			key: "reason",
			label: "sabab",
		},
		{
			visible: true,
			key: "description",
			label: "tarif",
		},
		{
			visible: false,
			key: "old_balance",
			label: "eski balans",
		},
		{
			visible: true,
			key: "fond_balance",
			label: "fondning balansi",
		},
		{
			visible: true,
			key: "status",
			label: "status",
		},
		{
			visible: true,
			key: "created",
			label: "yaratilgan"
		},
		{
			visible: true,
			key: "start_date",
			label: "boshlash sanasi",
		},
		{
			visible: true,
			key: "end_date",
			label: "tugatish sanasi",
			sortable: true,
		},
	]
);

export const Distribution = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/distribution/list/" }),
	new APIMethod({ type: "create", method: "POST", path: "admin/contract/distribution/create/" }),])
export const SubDistribution = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/sub-distribution/list/" })])

export const ProtocolInfo = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/protocol/detail/:id" })],
	{ paginated: true },
	[
		{
			visible: true,
			key: "id",
			label: "ID",
		},
		{
			visible: true,
			key: "inn",
			label: "Mijoz INN",
		},
		{
			visible: true,
			key: "contract_total_balance",
			label: "Summa",
		},
		{
			visible: true,
			key: "balance",
			label: "balans",
		},
		{
			visible: true,
			key: "percentage",
			label: "Ulush",
		},
		{
			visible: true,
			key: "initial_balance",
			label: "dastlabki sarmoya",
		},
		{
			visible: true,
			key: "withdraw",
			label: "Yechib olish"
		},
		{
			visible: true,
			key: "client_balance",
			label: "Dvidend olish huquqi",
		},
		{
			visible: true,
			key: "old_percentage",
			label: "ulush",
		},
		{
			visible: true,
			key: "dividend",
			label: "Dvidend",
		},
		{
			visible: true,
			key: "investment",
			label: "Sarmoya kiritish(oldingi oy)",
		},
	]
);

export const Protocols = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/protocol/list/" }),
	new APIMethod({ type: "create", method: "POST", path: "admin/contract/protocol/create/" })],
	{ paginated: true },
	[
		{
			visible: true,
			key: "id",
			label: "ID",
		},
		{
			visible: true,
			key: "user",
			label: "foydalanuvchi",
		},
		{
			visible: true,
			key: "fond",
			label: "Fond",
		},
		{
			visible: false,
			key: "contract",
			label: "shartnoma",
		},
		{
			visible: false,
			key: "status",
			label: "status",
		},
		{
			visible: true,
			key: "balance",
			label: "balans",
		},
		{
			visible: true,
			key: "profit",
			label: "foyda",
		},
		{
			visible: true,
			key: "percentage",
			label: "foiz",
		},
		{
			visible: true,
			key: "description",
			label: "ma'lumot"
		},
		{
			visible: true,
			key: "more",
			label: "",
		},
	]
);

export const Organizations = new APINode(
	[new APIMethod({ type: "list", method: "GET", path: "admin/contract/organization/list/" })])


