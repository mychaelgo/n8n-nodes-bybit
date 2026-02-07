/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';
import { cleanEmptyParams } from '../../utils/helpers';

export const spotLeverageTokenOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['spotLeverageToken'],
			},
		},
		options: [
			{ name: 'Get Leveraged Token Info', value: 'getLeveragedTokenInfo', action: 'Get leveraged token info' },
			{ name: 'Get Leveraged Token Market', value: 'getLeveragedTokenMarket', action: 'Get market info' },
			{ name: 'Get Purchase Redeem Records', value: 'getPurchaseRedeemRecords', action: 'Get purchase redeem records' },
			{ name: 'Purchase', value: 'purchase', action: 'Purchase leveraged token' },
			{ name: 'Redeem', value: 'redeem', action: 'Redeem leveraged token' },
		],
		default: 'getLeveragedTokenInfo',
	},
];

export const spotLeverageTokenFields: INodeProperties[] = [
	// LT Coin
	{
		displayName: 'LT Coin',
		name: 'ltCoin',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['spotLeverageToken'],
				operation: ['getLeveragedTokenInfo', 'getLeveragedTokenMarket', 'purchase', 'redeem', 'getPurchaseRedeemRecords'],
			},
		},
		description: 'Leveraged token abbreviation (e.g., BTC3L, ETH3S)',
	},
	// Amount for purchase/redeem
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['spotLeverageToken'],
				operation: ['purchase', 'redeem'],
			},
		},
		description: 'Purchase amount (USDT) or redeem quantity',
	},
	// Serial Number
	{
		displayName: 'Serial Number',
		name: 'serialNo',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['spotLeverageToken'],
				operation: ['purchase', 'redeem'],
			},
		},
		description: 'Custom serial number for idempotency',
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
				resource: ['spotLeverageToken'],
				operation: ['getPurchaseRedeemRecords'],
			},
		},
		options: [
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				default: '',
				description: 'Filter by order ID',
			},
			{
				displayName: 'Order Type',
				name: 'ltOrderType',
				type: 'options',
				options: [
					{ name: 'Purchase', value: 1 },
					{ name: 'Redeem', value: 2 },
				],
				default: 1,
				description: 'Order type filter',
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
				displayName: 'Serial Number',
				name: 'serialNo',
				type: 'string',
				default: '',
				description: 'Filter by serial number',
			},
		],
	},
];

export async function executeSpotLeverageToken(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let endpoint: string;
	let method: 'GET' | 'POST' = 'GET';
	let body: IDataObject = {};
	let query: IDataObject = {};

	switch (operation) {
		case 'getLeveragedTokenInfo': {
			endpoint = '/v5/spot-lever-token/info';
			const ltCoin = this.getNodeParameter('ltCoin', i, '') as string;
			if (ltCoin) {
				query.ltCoin = ltCoin;
			}
			break;
		}
		case 'getLeveragedTokenMarket': {
			endpoint = '/v5/spot-lever-token/reference';
			const ltCoin = this.getNodeParameter('ltCoin', i, '') as string;
			if (ltCoin) {
				query.ltCoin = ltCoin;
			}
			break;
		}
		case 'purchase': {
			endpoint = '/v5/spot-lever-token/purchase';
			method = 'POST';
			body = {
				ltCoin: this.getNodeParameter('ltCoin', i) as string,
				ltAmount: this.getNodeParameter('amount', i) as string,
			};
			const serialNo = this.getNodeParameter('serialNo', i, '') as string;
			if (serialNo) {
				body.serialNo = serialNo;
			}
			break;
		}
		case 'redeem': {
			endpoint = '/v5/spot-lever-token/redeem';
			method = 'POST';
			body = {
				ltCoin: this.getNodeParameter('ltCoin', i) as string,
				quantity: this.getNodeParameter('amount', i) as string,
			};
			const serialNo = this.getNodeParameter('serialNo', i, '') as string;
			if (serialNo) {
				body.serialNo = serialNo;
			}
			break;
		}
		case 'getPurchaseRedeemRecords': {
			endpoint = '/v5/spot-lever-token/order-record';
			const ltCoin = this.getNodeParameter('ltCoin', i, '') as string;
			if (ltCoin) {
				query.ltCoin = ltCoin;
			}
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.orderId) query.orderId = queryOptions.orderId;
			if (queryOptions.ltOrderType) query.ltOrderType = queryOptions.ltOrderType;
			if (queryOptions.serialNo) query.serialNo = queryOptions.serialNo;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	body = cleanEmptyParams(body);
	query = cleanEmptyParams(query);
	return await bybitApiRequest.call(this, method, endpoint, body, query);
}
