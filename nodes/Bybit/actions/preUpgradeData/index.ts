/**
 * Bybit Pre-Upgrade Data Resource
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';

export const preUpgradeDataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
			},
		},
		options: [
			{
				name: 'Get Pre-Upgrade Order History',
				value: 'getPreUpgradeOrderHistory',
				description: 'Get order history before account upgrade to UTA',
				action: 'Get pre upgrade order history',
			},
			{
				name: 'Get Pre-Upgrade Trade History',
				value: 'getPreUpgradeTradeHistory',
				description: 'Get trade/execution history before account upgrade to UTA',
				action: 'Get pre upgrade trade history',
			},
			{
				name: 'Get Pre-Upgrade Closed PnL',
				value: 'getPreUpgradeClosedPnl',
				description: 'Get closed PnL records before account upgrade to UTA',
				action: 'Get pre upgrade closed pnl',
			},
			{
				name: 'Get Pre-Upgrade Transactions',
				value: 'getPreUpgradeTransactions',
				description: 'Get transaction log before account upgrade to UTA',
				action: 'Get pre upgrade transactions',
			},
			{
				name: 'Get Pre-Upgrade Option Delivery',
				value: 'getPreUpgradeOptionDelivery',
				description: 'Get option delivery records before account upgrade to UTA',
				action: 'Get pre upgrade option delivery',
			},
		],
		default: 'getPreUpgradeOrderHistory',
	},
];

export const preUpgradeDataFields: INodeProperties[] = [
	// Common fields for pre-upgrade data operations
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: [
			{ name: 'Linear', value: 'linear' },
			{ name: 'Inverse', value: 'inverse' },
			{ name: 'Option', value: 'option' },
		],
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: [
					'getPreUpgradeOrderHistory',
					'getPreUpgradeTradeHistory',
					'getPreUpgradeClosedPnl',
					'getPreUpgradeTransactions',
				],
			},
		},
		required: true,
		default: 'linear',
		description: 'Product type',
	},
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: [
			{ name: 'Option', value: 'option' },
		],
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeOptionDelivery'],
			},
		},
		required: true,
		default: 'option',
		description: 'Product type (option only)',
	},
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
			},
		},
		default: '',
		description: 'Symbol (e.g., BTCUSDT). Required for linear; optional for others.',
	},
	{
		displayName: 'Base Coin',
		name: 'baseCoin',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: [
					'getPreUpgradeOrderHistory',
					'getPreUpgradeTradeHistory',
					'getPreUpgradeClosedPnl',
				],
			},
		},
		default: '',
		description: 'Base coin (e.g., BTC). Used for option category.',
	},
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeOrderHistory', 'getPreUpgradeTradeHistory'],
			},
		},
		default: '',
		description: 'Order ID',
	},
	{
		displayName: 'Order Link ID',
		name: 'orderLinkId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeOrderHistory', 'getPreUpgradeTradeHistory'],
			},
		},
		default: '',
		description: 'User customized order ID',
	},
	{
		displayName: 'Order Filter',
		name: 'orderFilter',
		type: 'options',
		options: [
			{ name: 'All Orders', value: 'Order' },
			{ name: 'Stop Orders', value: 'StopOrder' },
		],
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeOrderHistory'],
			},
		},
		default: 'Order',
		description: 'Order filter type',
	},
	{
		displayName: 'Execution Type',
		name: 'execType',
		type: 'options',
		options: [
			{ name: 'Trade', value: 'Trade' },
			{ name: 'ADL', value: 'AdlTrade' },
			{ name: 'Funding', value: 'Funding' },
			{ name: 'Bust Trade', value: 'BustTrade' },
			{ name: 'Delivery', value: 'Delivery' },
			{ name: 'Block Trade', value: 'BlockTrade' },
		],
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeTradeHistory'],
			},
		},
		default: 'Trade',
		description: 'Execution type filter',
	},
	{
		displayName: 'Transaction Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Trade', value: 'TRADE' },
			{ name: 'Transfer In', value: 'TRANSFER_IN' },
			{ name: 'Transfer Out', value: 'TRANSFER_OUT' },
			{ name: 'Settlement', value: 'SETTLEMENT' },
			{ name: 'Delivery', value: 'DELIVERY' },
			{ name: 'Liquidation', value: 'LIQUIDATION' },
			{ name: 'Bonus', value: 'BONUS' },
			{ name: 'Fee Refund', value: 'FEE_REFUND' },
			{ name: 'Interest', value: 'INTEREST' },
			{ name: 'Currency Buy', value: 'CURRENCY_BUY' },
			{ name: 'Currency Sell', value: 'CURRENCY_SELL' },
		],
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeTransactions'],
			},
		},
		default: '',
		description: 'Transaction type',
	},
	{
		displayName: 'Expiry Date',
		name: 'expDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
				operation: ['getPreUpgradeOptionDelivery'],
			},
		},
		default: '',
		description: 'Expiry date filter for options',
	},
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
			},
		},
		default: '',
		description: 'Start time filter (milliseconds)',
	},
	{
		displayName: 'End Time',
		name: 'endTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
			},
		},
		default: '',
		description: 'End time filter (milliseconds)',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
			},
		},
		default: 50,
		description: 'Number of records to return (1-200)',
	},
	{
		displayName: 'Cursor',
		name: 'cursor',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['preUpgradeData'],
			},
		},
		default: '',
		description: 'Cursor for pagination',
	},
];

export async function executePreUpgradeDataOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'getPreUpgradeOrderHistory': {
			const category = this.getNodeParameter('category', i) as string;
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			const baseCoin = this.getNodeParameter('baseCoin', i, '') as string;
			const orderId = this.getNodeParameter('orderId', i, '') as string;
			const orderLinkId = this.getNodeParameter('orderLinkId', i, '') as string;
			const orderFilter = this.getNodeParameter('orderFilter', i, '') as string;
			const startTime = this.getNodeParameter('startTime', i, '') as string;
			const endTime = this.getNodeParameter('endTime', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;
			const cursor = this.getNodeParameter('cursor', i, '') as string;

			const qs: IDataObject = { category, limit };
			if (symbol) qs.symbol = symbol;
			if (baseCoin) qs.baseCoin = baseCoin;
			if (orderId) qs.orderId = orderId;
			if (orderLinkId) qs.orderLinkId = orderLinkId;
			if (orderFilter) qs.orderFilter = orderFilter;
			if (startTime) qs.startTime = new Date(startTime).getTime().toString();
			if (endTime) qs.endTime = new Date(endTime).getTime().toString();
			if (cursor) qs.cursor = cursor;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/pre-upgrade/order/history',
				{},
				qs,
			);
			break;
		}

		case 'getPreUpgradeTradeHistory': {
			const category = this.getNodeParameter('category', i) as string;
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			const baseCoin = this.getNodeParameter('baseCoin', i, '') as string;
			const orderId = this.getNodeParameter('orderId', i, '') as string;
			const orderLinkId = this.getNodeParameter('orderLinkId', i, '') as string;
			const execType = this.getNodeParameter('execType', i, '') as string;
			const startTime = this.getNodeParameter('startTime', i, '') as string;
			const endTime = this.getNodeParameter('endTime', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;
			const cursor = this.getNodeParameter('cursor', i, '') as string;

			const qs: IDataObject = { category, limit };
			if (symbol) qs.symbol = symbol;
			if (baseCoin) qs.baseCoin = baseCoin;
			if (orderId) qs.orderId = orderId;
			if (orderLinkId) qs.orderLinkId = orderLinkId;
			if (execType) qs.execType = execType;
			if (startTime) qs.startTime = new Date(startTime).getTime().toString();
			if (endTime) qs.endTime = new Date(endTime).getTime().toString();
			if (cursor) qs.cursor = cursor;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/pre-upgrade/execution/list',
				{},
				qs,
			);
			break;
		}

		case 'getPreUpgradeClosedPnl': {
			const category = this.getNodeParameter('category', i) as string;
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			const startTime = this.getNodeParameter('startTime', i, '') as string;
			const endTime = this.getNodeParameter('endTime', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;
			const cursor = this.getNodeParameter('cursor', i, '') as string;

			const qs: IDataObject = { category, limit };
			if (symbol) qs.symbol = symbol;
			if (startTime) qs.startTime = new Date(startTime).getTime().toString();
			if (endTime) qs.endTime = new Date(endTime).getTime().toString();
			if (cursor) qs.cursor = cursor;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/pre-upgrade/position/closed-pnl',
				{},
				qs,
			);
			break;
		}

		case 'getPreUpgradeTransactions': {
			const category = this.getNodeParameter('category', i) as string;
			const baseCoin = this.getNodeParameter('baseCoin', i, '') as string;
			const type = this.getNodeParameter('type', i, '') as string;
			const startTime = this.getNodeParameter('startTime', i, '') as string;
			const endTime = this.getNodeParameter('endTime', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;
			const cursor = this.getNodeParameter('cursor', i, '') as string;

			const qs: IDataObject = { category, limit };
			if (baseCoin) qs.baseCoin = baseCoin;
			if (type) qs.type = type;
			if (startTime) qs.startTime = new Date(startTime).getTime().toString();
			if (endTime) qs.endTime = new Date(endTime).getTime().toString();
			if (cursor) qs.cursor = cursor;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/pre-upgrade/account/transaction-log',
				{},
				qs,
			);
			break;
		}

		case 'getPreUpgradeOptionDelivery': {
			const category = this.getNodeParameter('category', i) as string;
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			const expDate = this.getNodeParameter('expDate', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;
			const cursor = this.getNodeParameter('cursor', i, '') as string;

			const qs: IDataObject = { category, limit };
			if (symbol) qs.symbol = symbol;
			if (expDate) qs.expDate = expDate;
			if (cursor) qs.cursor = cursor;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/pre-upgrade/asset/delivery-record',
				{},
				qs,
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
