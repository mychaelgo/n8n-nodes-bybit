/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';
import {
	CATEGORY_OPTIONS,
	ORDER_TYPE_OPTIONS,
	SIDE_OPTIONS,
	TIME_IN_FORCE_OPTIONS,
	POSITION_IDX_OPTIONS,
	ORDER_FILTER_OPTIONS,
	TRIGGER_BY_OPTIONS,
} from '../../constants/options';
import { cleanEmptyParams, buildOrderLinkId } from '../../utils/helpers';

export const tradeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['trade'],
			},
		},
		options: [
			{ name: 'Amend Order', value: 'amendOrder', action: 'Amend an active order' },
			{ name: 'Batch Amend Orders', value: 'batchAmendOrder', action: 'Amend batch orders' },
			{ name: 'Batch Cancel Orders', value: 'batchCancelOrder', action: 'Cancel batch orders' },
			{ name: 'Batch Place Orders', value: 'batchPlaceOrder', action: 'Place batch orders' },
			{ name: 'Cancel All Orders', value: 'cancelAllOrders', action: 'Cancel all orders' },
			{ name: 'Cancel Order', value: 'cancelOrder', action: 'Cancel an active order' },
			{ name: 'Get Open Orders', value: 'getOpenOrders', action: 'Get open orders' },
			{ name: 'Get Order History', value: 'getOrderHistory', action: 'Get order history' },
			{ name: 'Get Spot Borrow Check', value: 'getSpotBorrowCheck', action: 'Check spot margin borrow quota' },
			{ name: 'Get Trade History', value: 'getTradeHistory', action: 'Get execution fill list' },
			{ name: 'Place Order', value: 'placeOrder', action: 'Place a new order' },
			{ name: 'Set Disconnect Cancel All', value: 'setDisconnectCancelAll', action: 'Set DCP disconnect cancel all' },
		],
		default: 'placeOrder',
	},
];

export const tradeFields: INodeProperties[] = [
	// Category
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: CATEGORY_OPTIONS,
		default: 'spot',
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
			},
		},
		description: 'Product type',
	},
	// Symbol for order operations
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['placeOrder', 'amendOrder', 'cancelOrder', 'cancelAllOrders', 'getSpotBorrowCheck'],
			},
		},
		description: 'Trading pair symbol (e.g., BTCUSDT)',
	},
	// Side
	{
		displayName: 'Side',
		name: 'side',
		type: 'options',
		options: SIDE_OPTIONS,
		default: 'Buy',
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['placeOrder', 'getSpotBorrowCheck'],
			},
		},
		description: 'Order side',
	},
	// Order Type
	{
		displayName: 'Order Type',
		name: 'orderType',
		type: 'options',
		options: ORDER_TYPE_OPTIONS,
		default: 'Limit',
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['placeOrder'],
			},
		},
		description: 'Type of order',
	},
	// Quantity
	{
		displayName: 'Quantity',
		name: 'qty',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['placeOrder'],
			},
		},
		description: 'Order quantity',
	},
	// Price (for limit orders)
	{
		displayName: 'Price',
		name: 'price',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['placeOrder'],
				orderType: ['Limit'],
			},
		},
		description: 'Order price (required for limit orders)',
	},
	// Order ID for amend/cancel
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['amendOrder', 'cancelOrder'],
			},
		},
		description: 'Order ID to amend or cancel',
	},
	// Order Link ID
	{
		displayName: 'Order Link ID',
		name: 'orderLinkId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['amendOrder', 'cancelOrder'],
			},
		},
		description: 'User customized order ID (alternative to Order ID)',
	},
	// Order Options
	{
		displayName: 'Order Options',
		name: 'orderOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['placeOrder'],
			},
		},
		options: [
			{
				displayName: 'Time In Force',
				name: 'timeInForce',
				type: 'options',
				options: TIME_IN_FORCE_OPTIONS,
				default: 'GTC',
				description: 'Time in force',
			},
			{
				displayName: 'Position Index',
				name: 'positionIdx',
				type: 'options',
				options: POSITION_IDX_OPTIONS,
				default: 0,
				description: 'Position index for hedge mode',
			},
			{
				displayName: 'Order Link ID',
				name: 'orderLinkId',
				type: 'string',
				default: '',
				description: 'Custom order ID',
			},
			{
				displayName: 'Reduce Only',
				name: 'reduceOnly',
				type: 'boolean',
				default: false,
				description: 'Whether this is a reduce-only order',
			},
			{
				displayName: 'Close On Trigger',
				name: 'closeOnTrigger',
				type: 'boolean',
				default: false,
				description: 'Whether to close on trigger',
			},
			{
				displayName: 'Market Unit',
				name: 'marketUnit',
				type: 'options',
				options: [
					{ name: 'Base Coin', value: 'baseCoin' },
					{ name: 'Quote Coin', value: 'quoteCoin' },
				],
				default: 'baseCoin',
				description: 'Market order unit for spot only',
			},
			{
				displayName: 'Take Profit Price',
				name: 'takeProfit',
				type: 'string',
				default: '',
				description: 'Take profit price',
			},
			{
				displayName: 'Stop Loss Price',
				name: 'stopLoss',
				type: 'string',
				default: '',
				description: 'Stop loss price',
			},
			{
				displayName: 'TP Trigger By',
				name: 'tpTriggerBy',
				type: 'options',
				options: TRIGGER_BY_OPTIONS,
				default: 'LastPrice',
				description: 'Take profit trigger price type',
			},
			{
				displayName: 'SL Trigger By',
				name: 'slTriggerBy',
				type: 'options',
				options: TRIGGER_BY_OPTIONS,
				default: 'LastPrice',
				description: 'Stop loss trigger price type',
			},
			{
				displayName: 'TP Limit Price',
				name: 'tpLimitPrice',
				type: 'string',
				default: '',
				description: 'Take profit limit price',
			},
			{
				displayName: 'SL Limit Price',
				name: 'slLimitPrice',
				type: 'string',
				default: '',
				description: 'Stop loss limit price',
			},
			{
				displayName: 'TP Order Type',
				name: 'tpOrderType',
				type: 'options',
				options: ORDER_TYPE_OPTIONS,
				default: 'Market',
				description: 'Take profit order type',
			},
			{
				displayName: 'SL Order Type',
				name: 'slOrderType',
				type: 'options',
				options: ORDER_TYPE_OPTIONS,
				default: 'Market',
				description: 'Stop loss order type',
			},
			{
				displayName: 'Is Leverage',
				name: 'isLeverage',
				type: 'options',
				options: [
					{ name: 'No', value: 0 },
					{ name: 'Yes', value: 1 },
				],
				default: 0,
				description: 'Whether to borrow for spot margin',
			},
			{
				displayName: 'Trigger Price',
				name: 'triggerPrice',
				type: 'string',
				default: '',
				description: 'Trigger price for conditional orders',
			},
			{
				displayName: 'Trigger By',
				name: 'triggerBy',
				type: 'options',
				options: TRIGGER_BY_OPTIONS,
				default: 'LastPrice',
				description: 'Trigger price type',
			},
			{
				displayName: 'Trigger Direction',
				name: 'triggerDirection',
				type: 'options',
				options: [
					{ name: 'Rise', value: 1 },
					{ name: 'Fall', value: 2 },
				],
				default: 1,
				description: 'Trigger direction',
			},
		],
	},
	// Amend Options
	{
		displayName: 'Amend Options',
		name: 'amendOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['amendOrder'],
			},
		},
		options: [
			{
				displayName: 'New Quantity',
				name: 'qty',
				type: 'string',
				default: '',
				description: 'New order quantity',
			},
			{
				displayName: 'New Price',
				name: 'price',
				type: 'string',
				default: '',
				description: 'New order price',
			},
			{
				displayName: 'New Trigger Price',
				name: 'triggerPrice',
				type: 'string',
				default: '',
				description: 'New trigger price',
			},
			{
				displayName: 'New Take Profit',
				name: 'takeProfit',
				type: 'string',
				default: '',
				description: 'New take profit price',
			},
			{
				displayName: 'New Stop Loss',
				name: 'stopLoss',
				type: 'string',
				default: '',
				description: 'New stop loss price',
			},
		],
	},
	// Batch Orders JSON
	{
		displayName: 'Orders (JSON)',
		name: 'batchOrders',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['batchPlaceOrder', 'batchAmendOrder', 'batchCancelOrder'],
			},
		},
		description: 'Array of order objects (max 10)',
	},
	// Query Options for listing orders
	{
		displayName: 'Query Options',
		name: 'queryOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['getOpenOrders', 'getOrderHistory', 'getTradeHistory'],
			},
		},
		options: [
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: '',
				description: 'Filter by symbol',
			},
			{
				displayName: 'Base Coin',
				name: 'baseCoin',
				type: 'string',
				default: '',
				description: 'Filter by base coin',
			},
			{
				displayName: 'Settle Coin',
				name: 'settleCoin',
				type: 'string',
				default: '',
				description: 'Filter by settle coin',
			},
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				default: '',
				description: 'Filter by order ID',
			},
			{
				displayName: 'Order Link ID',
				name: 'orderLinkId',
				type: 'string',
				default: '',
				description: 'Filter by order link ID',
			},
			{
				displayName: 'Order Filter',
				name: 'orderFilter',
				type: 'options',
				options: ORDER_FILTER_OPTIONS,
				default: 'Order',
				description: 'Order type filter',
			},
			{
				displayName: 'Order Status',
				name: 'orderStatus',
				type: 'string',
				default: '',
				description: 'Order status filter',
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
				description: 'Maximum number of records',
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'Pagination cursor',
			},
		],
	},
	// Cancel All Options
	{
		displayName: 'Cancel Options',
		name: 'cancelOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['cancelAllOrders'],
			},
		},
		options: [
			{
				displayName: 'Base Coin',
				name: 'baseCoin',
				type: 'string',
				default: '',
				description: 'Cancel by base coin',
			},
			{
				displayName: 'Settle Coin',
				name: 'settleCoin',
				type: 'string',
				default: '',
				description: 'Cancel by settle coin',
			},
			{
				displayName: 'Order Filter',
				name: 'orderFilter',
				type: 'options',
				options: ORDER_FILTER_OPTIONS,
				default: 'Order',
				description: 'Order type filter',
			},
			{
				displayName: 'Stop Order Type',
				name: 'stopOrderType',
				type: 'string',
				default: '',
				description: 'Stop order type filter',
			},
		],
	},
	// DCP Settings
	{
		displayName: 'Time Window (Seconds)',
		name: 'timeWindow',
		type: 'number',
		default: 10,
		required: true,
		displayOptions: {
			show: {
				resource: ['trade'],
				operation: ['setDisconnectCancelAll'],
			},
		},
		description: 'Disconnect protection time window in seconds (3-300)',
	},
];

export async function executeTrade(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let endpoint: string;
	let method: 'GET' | 'POST' = 'POST';
	let body: IDataObject = {};
	let query: IDataObject = {};
	const category = this.getNodeParameter('category', i) as string;

	switch (operation) {
		case 'placeOrder': {
			endpoint = '/v5/order/create';
			const orderOptions = this.getNodeParameter('orderOptions', i, {}) as IDataObject;
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				side: this.getNodeParameter('side', i) as string,
				orderType: this.getNodeParameter('orderType', i) as string,
				qty: this.getNodeParameter('qty', i) as string,
				...orderOptions,
			};
			const orderType = this.getNodeParameter('orderType', i) as string;
			if (orderType === 'Limit') {
				body.price = this.getNodeParameter('price', i) as string;
			}
			if (!body.orderLinkId) {
				body.orderLinkId = buildOrderLinkId();
			}
			break;
		}
		case 'amendOrder': {
			endpoint = '/v5/order/amend';
			const amendOptions = this.getNodeParameter('amendOptions', i, {}) as IDataObject;
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				...amendOptions,
			};
			const orderId = this.getNodeParameter('orderId', i, '') as string;
			const orderLinkId = this.getNodeParameter('orderLinkId', i, '') as string;
			if (orderId) {
				body.orderId = orderId;
			} else if (orderLinkId) {
				body.orderLinkId = orderLinkId;
			}
			break;
		}
		case 'cancelOrder': {
			endpoint = '/v5/order/cancel';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
			};
			const orderId = this.getNodeParameter('orderId', i, '') as string;
			const orderLinkId = this.getNodeParameter('orderLinkId', i, '') as string;
			if (orderId) {
				body.orderId = orderId;
			} else if (orderLinkId) {
				body.orderLinkId = orderLinkId;
			}
			break;
		}
		case 'getOpenOrders': {
			endpoint = '/v5/order/realtime';
			method = 'GET';
			query = { category };
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.symbol) query.symbol = queryOptions.symbol;
			if (queryOptions.baseCoin) query.baseCoin = queryOptions.baseCoin;
			if (queryOptions.settleCoin) query.settleCoin = queryOptions.settleCoin;
			if (queryOptions.orderId) query.orderId = queryOptions.orderId;
			if (queryOptions.orderLinkId) query.orderLinkId = queryOptions.orderLinkId;
			if (queryOptions.orderFilter) query.orderFilter = queryOptions.orderFilter;
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'cancelAllOrders': {
			endpoint = '/v5/order/cancel-all';
			const cancelOptions = this.getNodeParameter('cancelOptions', i, {}) as IDataObject;
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				...cancelOptions,
			};
			break;
		}
		case 'getOrderHistory': {
			endpoint = '/v5/order/history';
			method = 'GET';
			query = { category };
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.symbol) query.symbol = queryOptions.symbol;
			if (queryOptions.baseCoin) query.baseCoin = queryOptions.baseCoin;
			if (queryOptions.orderId) query.orderId = queryOptions.orderId;
			if (queryOptions.orderLinkId) query.orderLinkId = queryOptions.orderLinkId;
			if (queryOptions.orderFilter) query.orderFilter = queryOptions.orderFilter;
			if (queryOptions.orderStatus) query.orderStatus = queryOptions.orderStatus;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getTradeHistory': {
			endpoint = '/v5/execution/list';
			method = 'GET';
			query = { category };
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.symbol) query.symbol = queryOptions.symbol;
			if (queryOptions.baseCoin) query.baseCoin = queryOptions.baseCoin;
			if (queryOptions.orderId) query.orderId = queryOptions.orderId;
			if (queryOptions.orderLinkId) query.orderLinkId = queryOptions.orderLinkId;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'batchPlaceOrder': {
			endpoint = '/v5/order/create-batch';
			const orders = JSON.parse(this.getNodeParameter('batchOrders', i) as string);
			body = {
				category,
				request: orders,
			};
			break;
		}
		case 'batchAmendOrder': {
			endpoint = '/v5/order/amend-batch';
			const orders = JSON.parse(this.getNodeParameter('batchOrders', i) as string);
			body = {
				category,
				request: orders,
			};
			break;
		}
		case 'batchCancelOrder': {
			endpoint = '/v5/order/cancel-batch';
			const orders = JSON.parse(this.getNodeParameter('batchOrders', i) as string);
			body = {
				category,
				request: orders,
			};
			break;
		}
		case 'getSpotBorrowCheck': {
			endpoint = '/v5/order/spot-borrow-check';
			method = 'GET';
			query = {
				category: 'spot',
				symbol: this.getNodeParameter('symbol', i) as string,
				side: this.getNodeParameter('side', i) as string,
			};
			break;
		}
		case 'setDisconnectCancelAll': {
			endpoint = '/v5/order/disconnected-cancel-all';
			body = {
				timeWindow: this.getNodeParameter('timeWindow', i) as number,
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
