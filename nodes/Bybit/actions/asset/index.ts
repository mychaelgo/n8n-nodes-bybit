/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';
import { ACCOUNT_TYPE_OPTIONS, CATEGORY_OPTIONS, WITHDRAW_TYPE_OPTIONS, TRANSFER_STATUS_OPTIONS } from '../../constants/options';
import { cleanEmptyParams } from '../../utils/helpers';

export const assetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		options: [
			{ name: 'Cancel Withdrawal', value: 'cancelWithdrawal', action: 'Cancel withdrawal' },
			{ name: 'Create Internal Transfer', value: 'createInternalTransfer', action: 'Internal transfer between accounts' },
			{ name: 'Get All Coins Balance', value: 'getAllCoinsBalance', action: 'Get all coins balance' },
			{ name: 'Get Asset Info', value: 'getAssetInfo', action: 'Get asset info' },
			{ name: 'Get Coin Exchange Records', value: 'getCoinExchangeRecords', action: 'Get coin exchange records' },
			{ name: 'Get Coin Info', value: 'getCoinInfo', action: 'Get coin info' },
			{ name: 'Get Delivery Record', value: 'getDeliveryRecord', action: 'Get delivery record' },
			{ name: 'Get Deposit Records', value: 'getDepositRecords', action: 'Get deposit records' },
			{ name: 'Get Internal Deposit Records', value: 'getInternalDepositRecords', action: 'Get internal deposit records' },
			{ name: 'Get Internal Transfer Records', value: 'getInternalTransferRecords', action: 'Get internal transfer records' },
			{ name: 'Get Master Deposit Address', value: 'getMasterDepositAddress', action: 'Get master deposit address' },
			{ name: 'Get Settlement Record', value: 'getSettlementRecord', action: 'Get settlement record' },
			{ name: 'Get Single Coin Balance', value: 'getSingleCoinBalance', action: 'Get single coin balance' },
			{ name: 'Get Sub Account Deposit Records', value: 'getSubAccountDepositRecords', action: 'Get sub account deposit records' },
			{ name: 'Get Sub Deposit Address', value: 'getSubDepositAddress', action: 'Get sub account deposit address' },
			{ name: 'Get Sub UIDs', value: 'getSubUids', action: 'Get sub account UIDs' },
			{ name: 'Get Transferable Coin', value: 'getTransferableCoin', action: 'Get transferable coins' },
			{ name: 'Get Universal Transfer Records', value: 'getUniversalTransferRecords', action: 'Get universal transfer records' },
			{ name: 'Get Withdrawal Records', value: 'getWithdrawalRecords', action: 'Get withdrawal records' },
			{ name: 'Get Withdrawable Amount', value: 'getWithdrawableAmount', action: 'Get withdrawable amount' },
			{ name: 'Universal Transfer', value: 'universalTransfer', action: 'Universal transfer' },
			{ name: 'Withdraw', value: 'withdraw', action: 'Withdraw funds' },
		],
		default: 'getAllCoinsBalance',
	},
];

export const assetFields: INodeProperties[] = [
	// Account Type
	{
		displayName: 'Account Type',
		name: 'accountType',
		type: 'options',
		options: ACCOUNT_TYPE_OPTIONS,
		default: 'UNIFIED',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['getAllCoinsBalance', 'getSingleCoinBalance', 'getAssetInfo'],
			},
		},
		description: 'Account type',
	},
	// Coin
	{
		displayName: 'Coin',
		name: 'coin',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: [
					'getAllCoinsBalance', 'getSingleCoinBalance', 'getCoinInfo',
					'getMasterDepositAddress', 'getSubDepositAddress', 'getWithdrawableAmount',
					'withdraw', 'getDepositRecords', 'getWithdrawalRecords',
				],
			},
		},
		description: 'Filter by coin (e.g., BTC, USDT)',
	},
	// Category
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: CATEGORY_OPTIONS.filter((opt) => opt.value !== 'spot'),
		default: 'linear',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['getDeliveryRecord', 'getSettlementRecord'],
			},
		},
		description: 'Product type',
	},
	// Symbol
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['getDeliveryRecord', 'getSettlementRecord'],
			},
		},
		description: 'Trading pair symbol',
	},
	// Transfer fields
	{
		displayName: 'Transfer ID',
		name: 'transferId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['createInternalTransfer', 'universalTransfer'],
			},
		},
		description: 'Unique transfer ID (UUID)',
	},
	{
		displayName: 'From Account Type',
		name: 'fromAccountType',
		type: 'options',
		options: ACCOUNT_TYPE_OPTIONS,
		default: 'UNIFIED',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['createInternalTransfer', 'universalTransfer', 'getTransferableCoin'],
			},
		},
		description: 'Source account type',
	},
	{
		displayName: 'To Account Type',
		name: 'toAccountType',
		type: 'options',
		options: ACCOUNT_TYPE_OPTIONS,
		default: 'SPOT',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['createInternalTransfer', 'universalTransfer', 'getTransferableCoin'],
			},
		},
		description: 'Destination account type',
	},
	{
		displayName: 'Transfer Coin',
		name: 'transferCoin',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['createInternalTransfer', 'universalTransfer'],
			},
		},
		description: 'Coin to transfer (e.g., USDT)',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['createInternalTransfer', 'universalTransfer', 'withdraw'],
			},
		},
		description: 'Amount to transfer or withdraw',
	},
	// Universal transfer member IDs
	{
		displayName: 'From Member ID',
		name: 'fromMemberId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['universalTransfer'],
			},
		},
		description: 'Source member ID (UID)',
	},
	{
		displayName: 'To Member ID',
		name: 'toMemberId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['universalTransfer'],
			},
		},
		description: 'Destination member ID (UID)',
	},
	// Withdrawal fields
	{
		displayName: 'Chain',
		name: 'chain',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['withdraw', 'getMasterDepositAddress', 'getSubDepositAddress'],
			},
		},
		description: 'Blockchain network (e.g., ETH, TRX, SOL)',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['withdraw'],
			},
		},
		description: 'Withdrawal destination address',
	},
	{
		displayName: 'Withdrawal ID',
		name: 'withdrawalId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['cancelWithdrawal'],
			},
		},
		description: 'Withdrawal ID to cancel',
	},
	// Sub account fields
	{
		displayName: 'Sub Member ID',
		name: 'subMemberId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['getSubDepositAddress', 'getSubAccountDepositRecords'],
			},
		},
		description: 'Sub-account member ID',
	},
	// Query Options
	{
		displayName: 'Query Options',
		name: 'queryOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: [
					'getCoinExchangeRecords', 'getInternalTransferRecords', 'getUniversalTransferRecords',
					'getDepositRecords', 'getSubAccountDepositRecords', 'getInternalDepositRecords',
					'getWithdrawalRecords', 'getDeliveryRecord', 'getSettlementRecord',
				],
			},
		},
		options: [
			{
				displayName: 'Coin',
				name: 'coin',
				type: 'string',
				default: '',
				description: 'Filter by coin',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				description: 'Start time filter',
			},
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
				description: 'End time filter',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Maximum records',
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'Pagination cursor',
			},
			{
				displayName: 'Transfer ID',
				name: 'transferId',
				type: 'string',
				default: '',
				description: 'Filter by transfer ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: TRANSFER_STATUS_OPTIONS,
				default: 'SUCCESS',
				description: 'Transfer status filter',
			},
			{
				displayName: 'Withdraw Type',
				name: 'withdrawType',
				type: 'options',
				options: WITHDRAW_TYPE_OPTIONS,
				default: 2,
				description: 'Withdrawal type filter',
			},
		],
	},
	// Withdrawal Options
	{
		displayName: 'Withdrawal Options',
		name: 'withdrawalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['withdraw'],
			},
		},
		options: [
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
				description: 'Address tag/memo (for chains that require it)',
			},
			{
				displayName: 'Force Chain',
				name: 'forceChain',
				type: 'options',
				options: [
					{ name: 'No', value: 0 },
					{ name: 'Yes', value: 1 },
				],
				default: 0,
				description: 'Force on-chain withdrawal',
			},
			{
				displayName: 'Account Type',
				name: 'accountType',
				type: 'options',
				options: ACCOUNT_TYPE_OPTIONS,
				default: 'UNIFIED',
				description: 'Account type to withdraw from',
			},
			{
				displayName: 'Fee Type',
				name: 'feeType',
				type: 'options',
				options: [
					{ name: 'Regular Fee', value: 0 },
					{ name: 'Deduct from Withdrawal', value: 1 },
				],
				default: 0,
				description: 'Fee deduction method',
			},
			{
				displayName: 'Request ID',
				name: 'requestId',
				type: 'string',
				default: '',
				description: 'Custom request ID for idempotency',
			},
		],
	},
];

export async function executeAsset(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let endpoint: string;
	let method: 'GET' | 'POST' = 'GET';
	let body: IDataObject = {};
	let query: IDataObject = {};

	switch (operation) {
		case 'getDeliveryRecord': {
			endpoint = '/v5/asset/delivery-record';
			query = {
				category: this.getNodeParameter('category', i) as string,
			};
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			if (symbol) query.symbol = symbol;
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getSettlementRecord': {
			endpoint = '/v5/asset/settlement-record';
			query = {
				category: this.getNodeParameter('category', i) as string,
			};
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			if (symbol) query.symbol = symbol;
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getCoinExchangeRecords': {
			endpoint = '/v5/asset/exchange/order-record';
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.coin) query.fromCoin = queryOptions.coin;
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getAssetInfo': {
			endpoint = '/v5/asset/transfer/query-asset-info';
			query = {
				accountType: this.getNodeParameter('accountType', i) as string,
			};
			break;
		}
		case 'getAllCoinsBalance': {
			endpoint = '/v5/asset/transfer/query-account-coins-balance';
			query = {
				accountType: this.getNodeParameter('accountType', i) as string,
			};
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) query.coin = coin;
			break;
		}
		case 'getSingleCoinBalance': {
			endpoint = '/v5/asset/transfer/query-account-coin-balance';
			query = {
				accountType: this.getNodeParameter('accountType', i) as string,
				coin: this.getNodeParameter('coin', i) as string,
			};
			break;
		}
		case 'getTransferableCoin': {
			endpoint = '/v5/asset/transfer/query-transfer-coin-list';
			query = {
				fromAccountType: this.getNodeParameter('fromAccountType', i) as string,
				toAccountType: this.getNodeParameter('toAccountType', i) as string,
			};
			break;
		}
		case 'createInternalTransfer': {
			endpoint = '/v5/asset/transfer/inter-transfer';
			method = 'POST';
			body = {
				transferId: this.getNodeParameter('transferId', i) as string,
				coin: this.getNodeParameter('transferCoin', i) as string,
				amount: this.getNodeParameter('amount', i) as string,
				fromAccountType: this.getNodeParameter('fromAccountType', i) as string,
				toAccountType: this.getNodeParameter('toAccountType', i) as string,
			};
			break;
		}
		case 'getInternalTransferRecords': {
			endpoint = '/v5/asset/transfer/query-inter-transfer-list';
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.transferId) query.transferId = queryOptions.transferId;
			if (queryOptions.coin) query.coin = queryOptions.coin;
			if (queryOptions.status) query.status = queryOptions.status;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getSubUids': {
			endpoint = '/v5/asset/transfer/query-sub-member-list';
			break;
		}
		case 'universalTransfer': {
			endpoint = '/v5/asset/transfer/universal-transfer';
			method = 'POST';
			body = {
				transferId: this.getNodeParameter('transferId', i) as string,
				coin: this.getNodeParameter('transferCoin', i) as string,
				amount: this.getNodeParameter('amount', i) as string,
				fromMemberId: this.getNodeParameter('fromMemberId', i) as string,
				toMemberId: this.getNodeParameter('toMemberId', i) as string,
				fromAccountType: this.getNodeParameter('fromAccountType', i) as string,
				toAccountType: this.getNodeParameter('toAccountType', i) as string,
			};
			break;
		}
		case 'getUniversalTransferRecords': {
			endpoint = '/v5/asset/transfer/query-universal-transfer-list';
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.transferId) query.transferId = queryOptions.transferId;
			if (queryOptions.coin) query.coin = queryOptions.coin;
			if (queryOptions.status) query.status = queryOptions.status;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getDepositRecords': {
			endpoint = '/v5/asset/deposit/query-record';
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) query.coin = coin;
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getSubAccountDepositRecords': {
			endpoint = '/v5/asset/deposit/query-sub-member-record';
			query = {
				subMemberId: this.getNodeParameter('subMemberId', i) as string,
			};
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) query.coin = coin;
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getInternalDepositRecords': {
			endpoint = '/v5/asset/deposit/query-internal-record';
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.coin) query.coin = queryOptions.coin;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getMasterDepositAddress': {
			endpoint = '/v5/asset/deposit/query-address';
			query = {
				coin: this.getNodeParameter('coin', i) as string,
			};
			const chain = this.getNodeParameter('chain', i, '') as string;
			if (chain) query.chainType = chain;
			break;
		}
		case 'getSubDepositAddress': {
			endpoint = '/v5/asset/deposit/query-sub-member-address';
			query = {
				coin: this.getNodeParameter('coin', i) as string,
				chainType: this.getNodeParameter('chain', i) as string,
				subMemberId: this.getNodeParameter('subMemberId', i) as string,
			};
			break;
		}
		case 'getCoinInfo': {
			endpoint = '/v5/asset/coin/query-info';
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) query.coin = coin;
			break;
		}
		case 'getWithdrawalRecords': {
			endpoint = '/v5/asset/withdraw/query-record';
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) query.coin = coin;
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.withdrawType !== undefined) query.withdrawType = queryOptions.withdrawType;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getWithdrawableAmount': {
			endpoint = '/v5/asset/withdraw/withdrawable-amount';
			query = {
				coin: this.getNodeParameter('coin', i) as string,
			};
			break;
		}
		case 'withdraw': {
			endpoint = '/v5/asset/withdraw/create';
			method = 'POST';
			body = {
				coin: this.getNodeParameter('coin', i) as string,
				chain: this.getNodeParameter('chain', i) as string,
				address: this.getNodeParameter('address', i) as string,
				amount: this.getNodeParameter('amount', i) as string,
				timestamp: Date.now(),
			};
			const withdrawalOptions = this.getNodeParameter('withdrawalOptions', i, {}) as IDataObject;
			if (withdrawalOptions.tag) body.tag = withdrawalOptions.tag;
			if (withdrawalOptions.forceChain !== undefined) body.forceChain = withdrawalOptions.forceChain;
			if (withdrawalOptions.accountType) body.accountType = withdrawalOptions.accountType;
			if (withdrawalOptions.feeType !== undefined) body.feeType = withdrawalOptions.feeType;
			if (withdrawalOptions.requestId) body.requestId = withdrawalOptions.requestId;
			break;
		}
		case 'cancelWithdrawal': {
			endpoint = '/v5/asset/withdraw/cancel';
			method = 'POST';
			body = {
				id: this.getNodeParameter('withdrawalId', i) as string,
			};
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	body = cleanEmptyParams(body);
	query = cleanEmptyParams(query);
	return await bybitApiRequest.call(this, method, endpoint, body, query);
}
