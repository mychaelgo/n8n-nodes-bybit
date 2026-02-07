/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';
import { ACCOUNT_TYPE_OPTIONS, MARGIN_MODE_OPTIONS, CATEGORY_OPTIONS } from '../../constants/options';
import { cleanEmptyParams } from '../../utils/helpers';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{ name: 'Batch Set Collateral Coin', value: 'batchSetCollateralCoin', action: 'Batch set collateral coins' },
			{ name: 'Get Account Info', value: 'getAccountInfo', action: 'Get account info' },
			{ name: 'Get Borrow History', value: 'getBorrowHistory', action: 'Get borrow history' },
			{ name: 'Get Coin Greeks', value: 'getCoinGreeks', action: 'Get coin greeks' },
			{ name: 'Get Collateral Info', value: 'getCollateralInfo', action: 'Get collateral info' },
			{ name: 'Get Fee Rates', value: 'getFeeRates', action: 'Get fee rates' },
			{ name: 'Get Repay History', value: 'getRepayHistory', action: 'Get repayment history' },
			{ name: 'Get Spot Margin Data', value: 'getSpotMarginData', action: 'Get spot margin data' },
			{ name: 'Get Spot Margin State', value: 'getSpotMarginState', action: 'Get spot margin state' },
			{ name: 'Get Transaction Log', value: 'getTransactionLog', action: 'Get transaction log' },
			{ name: 'Get Wallet Balance', value: 'getWalletBalance', action: 'Get wallet balance' },
			{ name: 'Set Collateral Switch', value: 'setCollateralSwitch', action: 'Set collateral switch for coin' },
			{ name: 'Set Margin Mode', value: 'setMarginMode', action: 'Set margin mode' },
			{ name: 'Set Spot Hedging', value: 'setSpotHedging', action: 'Enable disable spot hedging' },
			{ name: 'Upgrade to Unified Account', value: 'upgradeToUnifiedAccount', action: 'Upgrade to unified trading account' },
		],
		default: 'getWalletBalance',
	},
];

export const accountFields: INodeProperties[] = [
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
				resource: ['account'],
				operation: ['getWalletBalance', 'getTransactionLog'],
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
				resource: ['account'],
				operation: [
					'getWalletBalance', 'getCollateralInfo', 'getCoinGreeks',
					'setCollateralSwitch', 'getSpotMarginData',
				],
			},
		},
		description: 'Filter by coin (e.g., BTC, USDT)',
	},
	// Category for fee rates
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: CATEGORY_OPTIONS,
		default: 'spot',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getFeeRates'],
			},
		},
		description: 'Product type',
	},
	// Symbol for fee rates
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getFeeRates'],
			},
		},
		description: 'Filter by symbol',
	},
	// Base Coin for fee rates
	{
		displayName: 'Base Coin',
		name: 'baseCoin',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getFeeRates', 'getCoinGreeks'],
			},
		},
		description: 'Filter by base coin',
	},
	// Margin Mode
	{
		displayName: 'Margin Mode',
		name: 'setMarginMode',
		type: 'options',
		options: MARGIN_MODE_OPTIONS,
		default: 'REGULAR_MARGIN',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['setMarginMode'],
			},
		},
		description: 'Margin mode to set',
	},
	// Spot Hedging
	{
		displayName: 'Spot Hedging',
		name: 'setHedgingMode',
		type: 'options',
		options: [
			{ name: 'Off', value: 'OFF' },
			{ name: 'On', value: 'ON' },
		],
		default: 'OFF',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['setSpotHedging'],
			},
		},
		description: 'Enable or disable spot hedging',
	},
	// Collateral Switch
	{
		displayName: 'Collateral Switch',
		name: 'collateralSwitch',
		type: 'options',
		options: [
			{ name: 'Off', value: 'OFF' },
			{ name: 'On', value: 'ON' },
		],
		default: 'ON',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['setCollateralSwitch'],
			},
		},
		description: 'Turn collateral on/off for coin',
	},
	// Batch Collateral Coins JSON
	{
		displayName: 'Collateral Coins (JSON)',
		name: 'collateralCoins',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['batchSetCollateralCoin'],
			},
		},
		description: 'Array of {coin, collateralSwitch} objects',
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
				resource: ['account'],
				operation: ['getBorrowHistory', 'getRepayHistory', 'getTransactionLog'],
			},
		},
		options: [
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'Filter by currency',
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
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: CATEGORY_OPTIONS,
				default: 'spot',
				description: 'Product type filter',
			},
			{
				displayName: 'Base Coin',
				name: 'baseCoin',
				type: 'string',
				default: '',
				description: 'Filter by base coin',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Transaction type filter',
			},
		],
	},
	// VIP Margin Data Options
	{
		displayName: 'VIP Level',
		name: 'vipLevel',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getSpotMarginData'],
			},
		},
		description: 'Filter by VIP level',
	},
];

export async function executeAccount(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let endpoint: string;
	let method: 'GET' | 'POST' = 'GET';
	let body: IDataObject = {};
	let query: IDataObject = {};

	switch (operation) {
		case 'getWalletBalance': {
			endpoint = '/v5/account/wallet-balance';
			query = {
				accountType: this.getNodeParameter('accountType', i) as string,
			};
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) {
				query.coin = coin;
			}
			break;
		}
		case 'upgradeToUnifiedAccount': {
			endpoint = '/v5/account/upgrade-to-uta';
			method = 'POST';
			break;
		}
		case 'getBorrowHistory': {
			endpoint = '/v5/account/borrow-history';
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.currency) query.currency = queryOptions.currency;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getRepayHistory': {
			endpoint = '/v5/account/repay-history';
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.currency) query.currency = queryOptions.currency;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'getCollateralInfo': {
			endpoint = '/v5/account/collateral-info';
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) {
				query.currency = coin;
			}
			break;
		}
		case 'getCoinGreeks': {
			endpoint = '/v5/asset/coin-greeks';
			const baseCoin = this.getNodeParameter('baseCoin', i, '') as string;
			if (baseCoin) {
				query.baseCoin = baseCoin;
			}
			break;
		}
		case 'getFeeRates': {
			endpoint = '/v5/account/fee-rate';
			const category = this.getNodeParameter('category', i, '') as string;
			if (category) {
				query.category = category;
			}
			const symbol = this.getNodeParameter('symbol', i, '') as string;
			if (symbol) {
				query.symbol = symbol;
			}
			const baseCoin = this.getNodeParameter('baseCoin', i, '') as string;
			if (baseCoin) {
				query.baseCoin = baseCoin;
			}
			break;
		}
		case 'getAccountInfo': {
			endpoint = '/v5/account/info';
			break;
		}
		case 'getTransactionLog': {
			endpoint = '/v5/account/transaction-log';
			query = {
				accountType: this.getNodeParameter('accountType', i) as string,
			};
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.category) query.category = queryOptions.category;
			if (queryOptions.currency) query.currency = queryOptions.currency;
			if (queryOptions.baseCoin) query.baseCoin = queryOptions.baseCoin;
			if (queryOptions.type) query.type = queryOptions.type;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'setMarginMode': {
			endpoint = '/v5/account/set-margin-mode';
			method = 'POST';
			body = {
				setMarginMode: this.getNodeParameter('setMarginMode', i) as string,
			};
			break;
		}
		case 'setSpotHedging': {
			endpoint = '/v5/account/set-hedging-mode';
			method = 'POST';
			body = {
				setHedgingMode: this.getNodeParameter('setHedgingMode', i) as string,
			};
			break;
		}
		case 'setCollateralSwitch': {
			endpoint = '/v5/account/set-collateral-switch';
			method = 'POST';
			body = {
				coin: this.getNodeParameter('coin', i) as string,
				collateralSwitch: this.getNodeParameter('collateralSwitch', i) as string,
			};
			break;
		}
		case 'batchSetCollateralCoin': {
			endpoint = '/v5/account/set-collateral-switch-batch';
			method = 'POST';
			const coins = JSON.parse(this.getNodeParameter('collateralCoins', i) as string);
			body = {
				request: coins,
			};
			break;
		}
		case 'getSpotMarginData': {
			endpoint = '/v5/spot-margin-trade/data';
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) {
				query.currency = coin;
			}
			const vipLevel = this.getNodeParameter('vipLevel', i, '') as string;
			if (vipLevel) {
				query.vipLevel = vipLevel;
			}
			break;
		}
		case 'getSpotMarginState': {
			endpoint = '/v5/spot-margin-trade/state';
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	body = cleanEmptyParams(body);
	query = cleanEmptyParams(query);
	return await bybitApiRequest.call(this, method, endpoint, body, query);
}
