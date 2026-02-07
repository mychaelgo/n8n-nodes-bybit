/**
 * Bybit Institutional Lending Resource
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';

export const institutionalLendingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
			},
		},
		options: [
			{
				name: 'Get Product Info',
				value: 'getProductInfo',
				description: 'Get product info for institutional lending',
				action: 'Get product info',
			},
			{
				name: 'Get Margin Coin Info',
				value: 'getMarginCoinInfo',
				description: 'Get margin coin info',
				action: 'Get margin coin info',
			},
			{
				name: 'Get Loan Orders',
				value: 'getLoanOrders',
				description: 'Get loan order records',
				action: 'Get loan orders',
			},
			{
				name: 'Get Repay Orders',
				value: 'getRepayOrders',
				description: 'Get repayment order records',
				action: 'Get repay orders',
			},
			{
				name: 'Get LTV Info',
				value: 'getLtvInfo',
				description: 'Get LTV (Loan-to-Value) information',
				action: 'Get LTV info',
			},
			{
				name: 'Bind or Unbind UID',
				value: 'bindOrUnbindUid',
				description: 'Bind or unbind UID for institutional lending',
				action: 'Bind or unbind UID',
			},
		],
		default: 'getProductInfo',
	},
];

export const institutionalLendingFields: INodeProperties[] = [
	// getProductInfo fields
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['getProductInfo'],
			},
		},
		default: '',
		description: 'Product ID. Leave empty to query all products.',
	},

	// getMarginCoinInfo fields
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['getMarginCoinInfo'],
			},
		},
		required: true,
		default: '',
		description: 'Product ID to query margin coin info',
	},

	// getLoanOrders fields
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['getLoanOrders'],
			},
		},
		default: '',
		description: 'Order ID to query specific loan order',
	},
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['getLoanOrders'],
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
				resource: ['institutionalLending'],
				operation: ['getLoanOrders'],
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
				resource: ['institutionalLending'],
				operation: ['getLoanOrders'],
			},
		},
		default: 50,
		description: 'Number of records to return (1-100)',
	},

	// getRepayOrders fields
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['getRepayOrders'],
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
				resource: ['institutionalLending'],
				operation: ['getRepayOrders'],
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
				resource: ['institutionalLending'],
				operation: ['getRepayOrders'],
			},
		},
		default: 50,
		description: 'Number of records to return (1-100)',
	},

	// bindOrUnbindUid fields
	{
		displayName: 'UID',
		name: 'uid',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['bindOrUnbindUid'],
			},
		},
		required: true,
		default: '',
		description: 'UID to bind or unbind',
	},
	{
		displayName: 'Operation Type',
		name: 'operationType',
		type: 'options',
		options: [
			{ name: 'Bind', value: '0' },
			{ name: 'Unbind', value: '1' },
		],
		displayOptions: {
			show: {
				resource: ['institutionalLending'],
				operation: ['bindOrUnbindUid'],
			},
		},
		required: true,
		default: '0',
		description: 'Bind or unbind operation',
	},
];

export async function executeInstitutionalLendingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'getProductInfo': {
			const productId = this.getNodeParameter('productId', i, '') as string;

			const qs: IDataObject = {};
			if (productId) qs.productId = productId;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/ins-loan/product-infos',
				{},
				qs,
			);
			break;
		}

		case 'getMarginCoinInfo': {
			const productId = this.getNodeParameter('productId', i) as string;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/ins-loan/ensure-tokens-convert',
				{},
				{ productId },
			);
			break;
		}

		case 'getLoanOrders': {
			const orderId = this.getNodeParameter('orderId', i, '') as string;
			const startTime = this.getNodeParameter('startTime', i, '') as string;
			const endTime = this.getNodeParameter('endTime', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;

			const qs: IDataObject = { limit };
			if (orderId) qs.orderId = orderId;
			if (startTime) qs.startTime = new Date(startTime).getTime().toString();
			if (endTime) qs.endTime = new Date(endTime).getTime().toString();

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/ins-loan/loan-order',
				{},
				qs,
			);
			break;
		}

		case 'getRepayOrders': {
			const startTime = this.getNodeParameter('startTime', i, '') as string;
			const endTime = this.getNodeParameter('endTime', i, '') as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;

			const qs: IDataObject = { limit };
			if (startTime) qs.startTime = new Date(startTime).getTime().toString();
			if (endTime) qs.endTime = new Date(endTime).getTime().toString();

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/ins-loan/repaid-history',
				{},
				qs,
			);
			break;
		}

		case 'getLtvInfo': {
			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/ins-loan/ltv-convert',
			);
			break;
		}

		case 'bindOrUnbindUid': {
			const uid = this.getNodeParameter('uid', i) as string;
			const operationType = this.getNodeParameter('operationType', i) as string;

			responseData = await bybitApiRequest.call(
				this,
				'POST',
				'/v5/ins-loan/association-uid',
				{ uid, operate: operationType },
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
