/**
 * Bybit Spot Margin UTA Resource
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';

export const spotMarginUtaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['spotMarginUta'],
			},
		},
		options: [
			{
				name: 'Get VIP Margin Data',
				value: 'getVIPMarginData',
				description: 'Get VIP margin data',
				action: 'Get VIP margin data',
			},
			{
				name: 'Toggle Margin Trade',
				value: 'toggleMarginTrade',
				description: 'Turn on/off spot margin trade',
				action: 'Toggle margin trade',
			},
			{
				name: 'Set Leverage',
				value: 'setLeverage',
				description: 'Set the user\'s maximum leverage in spot cross margin',
				action: 'Set spot margin leverage',
			},
			{
				name: 'Get Spot Margin State',
				value: 'getSpotMarginState',
				description: 'Get the state of spot margin trade',
				action: 'Get spot margin state',
			},
			{
				name: 'Get Normal Margin Status',
				value: 'getNormalMarginStatus',
				description: 'Get whether the Normal account spot margin is enabled',
				action: 'Get normal margin status',
			},
			{
				name: 'Switch Normal Margin Mode',
				value: 'switchNormalMarginMode',
				description: 'Turn on/off normal spot margin trading',
				action: 'Switch normal margin mode',
			},
		],
		default: 'getVIPMarginData',
	},
];

export const spotMarginUtaFields: INodeProperties[] = [
	// getVIPMarginData fields
	{
		displayName: 'VIP Level',
		name: 'vipLevel',
		type: 'options',
		options: [
			{ name: 'No VIP', value: 'No VIP' },
			{ name: 'VIP-1', value: 'VIP-1' },
			{ name: 'VIP-2', value: 'VIP-2' },
			{ name: 'VIP-3', value: 'VIP-3' },
			{ name: 'VIP-4', value: 'VIP-4' },
			{ name: 'VIP-5', value: 'VIP-5' },
			{ name: 'VIP-Supreme', value: 'VIP-Supreme' },
			{ name: 'PRO-1', value: 'PRO-1' },
			{ name: 'PRO-2', value: 'PRO-2' },
			{ name: 'PRO-3', value: 'PRO-3' },
			{ name: 'PRO-4', value: 'PRO-4' },
			{ name: 'PRO-5', value: 'PRO-5' },
		],
		displayOptions: {
			show: {
				resource: ['spotMarginUta'],
				operation: ['getVIPMarginData'],
			},
		},
		default: 'No VIP',
		description: 'VIP level to query',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['spotMarginUta'],
				operation: ['getVIPMarginData'],
			},
		},
		default: '',
		description: 'Currency to query (e.g., BTC, ETH). Leave empty for all.',
	},

	// toggleMarginTrade fields
	{
		displayName: 'Spot Margin Mode',
		name: 'spotMarginMode',
		type: 'options',
		options: [
			{ name: 'Turn On', value: '1' },
			{ name: 'Turn Off', value: '0' },
		],
		displayOptions: {
			show: {
				resource: ['spotMarginUta'],
				operation: ['toggleMarginTrade'],
			},
		},
		required: true,
		default: '1',
		description: 'Turn on or off spot margin trade',
	},

	// setLeverage fields
	{
		displayName: 'Leverage',
		name: 'leverage',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['spotMarginUta'],
				operation: ['setLeverage'],
			},
		},
		required: true,
		default: '2',
		description: 'Leverage value (2-10)',
	},

	// switchNormalMarginMode fields
	{
		displayName: 'Enable Switch',
		name: 'switch',
		type: 'options',
		options: [
			{ name: 'Turn On', value: '1' },
			{ name: 'Turn Off', value: '0' },
		],
		displayOptions: {
			show: {
				resource: ['spotMarginUta'],
				operation: ['switchNormalMarginMode'],
			},
		},
		required: true,
		default: '1',
		description: 'Turn on or off normal spot margin trading',
	},
];

export async function executeSpotMarginUtaOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'getVIPMarginData': {
			const vipLevel = this.getNodeParameter('vipLevel', i) as string;
			const currency = this.getNodeParameter('currency', i, '') as string;

			const qs: IDataObject = {};
			if (vipLevel) qs.vipLevel = vipLevel;
			if (currency) qs.currency = currency;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/spot-margin-trade/data',
				{},
				qs,
			);
			break;
		}

		case 'toggleMarginTrade': {
			const spotMarginMode = this.getNodeParameter('spotMarginMode', i) as string;

			responseData = await bybitApiRequest.call(
				this,
				'POST',
				'/v5/spot-margin-trade/switch-mode',
				{ spotMarginMode },
			);
			break;
		}

		case 'setLeverage': {
			const leverage = this.getNodeParameter('leverage', i) as string;

			responseData = await bybitApiRequest.call(
				this,
				'POST',
				'/v5/spot-margin-trade/set-leverage',
				{ leverage },
			);
			break;
		}

		case 'getSpotMarginState': {
			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/spot-margin-trade/state',
			);
			break;
		}

		case 'getNormalMarginStatus': {
			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/spot-cross-margin-trade/loan-info',
			);
			break;
		}

		case 'switchNormalMarginMode': {
			const switchVal = this.getNodeParameter('switch', i) as string;

			responseData = await bybitApiRequest.call(
				this,
				'POST',
				'/v5/spot-cross-margin-trade/switch',
				{ switch: switchVal },
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
