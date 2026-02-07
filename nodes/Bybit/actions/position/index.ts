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
	TP_SL_MODE_OPTIONS,
	POSITION_MODE_OPTIONS,
	TRADE_MODE_OPTIONS,
	TRIGGER_BY_OPTIONS,
} from '../../constants/options';
import { cleanEmptyParams } from '../../utils/helpers';

export const positionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['position'],
			},
		},
		options: [
			{ name: 'Add/Reduce Margin', value: 'addReduceMargin', action: 'Add or reduce margin' },
			{ name: 'Confirm New Risk Limit', value: 'confirmNewRiskLimit', action: 'Confirm new risk limit' },
			{ name: 'Get Closed PnL', value: 'getClosedPnL', action: 'Get closed profit and loss' },
			{ name: 'Get Position Info', value: 'getPositionInfo', action: 'Get position info' },
			{ name: 'Move Positions', value: 'movePositions', action: 'Move positions between accounts' },
			{ name: 'Set Auto Add Margin', value: 'setAutoAddMargin', action: 'Set auto add margin' },
			{ name: 'Set Leverage', value: 'setLeverage', action: 'Set leverage' },
			{ name: 'Set Risk Limit', value: 'setRiskLimit', action: 'Set risk limit' },
			{ name: 'Set TP/SL Mode', value: 'setTpSlMode', action: 'Set TP SL mode' },
			{ name: 'Set Trading Stop', value: 'setTradingStop', action: 'Set take profit stop loss trailing stop' },
			{ name: 'Switch Margin Mode', value: 'switchMarginMode', action: 'Switch cross isolated margin' },
			{ name: 'Switch Position Mode', value: 'switchPositionMode', action: 'Switch position mode' },
		],
		default: 'getPositionInfo',
	},
];

export const positionFields: INodeProperties[] = [
	// Category
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: CATEGORY_OPTIONS.filter((opt) => opt.value !== 'spot'),
		default: 'linear',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
			},
		},
		description: 'Product type (derivatives only)',
	},
	// Symbol
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: [
					'setLeverage', 'switchMarginMode', 'setTpSlMode', 'setRiskLimit',
					'setTradingStop', 'setAutoAddMargin', 'addReduceMargin', 'confirmNewRiskLimit',
				],
			},
		},
		description: 'Trading pair symbol',
	},
	// Leverage
	{
		displayName: 'Buy Leverage',
		name: 'buyLeverage',
		type: 'string',
		default: '10',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setLeverage'],
			},
		},
		description: 'Buy side leverage (0-100)',
	},
	{
		displayName: 'Sell Leverage',
		name: 'sellLeverage',
		type: 'string',
		default: '10',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setLeverage'],
			},
		},
		description: 'Sell side leverage (0-100)',
	},
	// Trade Mode
	{
		displayName: 'Trade Mode',
		name: 'tradeMode',
		type: 'options',
		options: TRADE_MODE_OPTIONS,
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['switchMarginMode'],
			},
		},
		description: 'Margin mode',
	},
	// TP/SL Mode
	{
		displayName: 'TP/SL Mode',
		name: 'tpSlMode',
		type: 'options',
		options: TP_SL_MODE_OPTIONS,
		default: 'Full',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setTpSlMode'],
			},
		},
		description: 'Take profit / stop loss mode',
	},
	// Position Mode
	{
		displayName: 'Position Mode',
		name: 'mode',
		type: 'options',
		options: POSITION_MODE_OPTIONS,
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['switchPositionMode'],
			},
		},
		description: 'Position mode (one-way or hedge)',
	},
	// Risk Limit
	{
		displayName: 'Risk Limit ID',
		name: 'riskId',
		type: 'number',
		default: 1,
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setRiskLimit', 'confirmNewRiskLimit'],
			},
		},
		description: 'Risk limit tier ID',
	},
	// Position Index
	{
		displayName: 'Position Index',
		name: 'positionIdx',
		type: 'options',
		options: [
			{ name: 'One-Way Mode', value: 0 },
			{ name: 'Hedge Mode - Buy Side', value: 1 },
			{ name: 'Hedge Mode - Sell Side', value: 2 },
		],
		default: 0,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setTradingStop', 'addReduceMargin'],
			},
		},
		description: 'Position index',
	},
	// Trading Stop Options
	{
		displayName: 'Trading Stop Options',
		name: 'tradingStopOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setTradingStop'],
			},
		},
		options: [
			{
				displayName: 'Take Profit',
				name: 'takeProfit',
				type: 'string',
				default: '',
				description: 'Take profit price',
			},
			{
				displayName: 'Stop Loss',
				name: 'stopLoss',
				type: 'string',
				default: '',
				description: 'Stop loss price',
			},
			{
				displayName: 'Trailing Stop',
				name: 'trailingStop',
				type: 'string',
				default: '',
				description: 'Trailing stop distance',
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
				displayName: 'Active Price',
				name: 'activePrice',
				type: 'string',
				default: '',
				description: 'Trailing stop trigger price',
			},
			{
				displayName: 'TP Size',
				name: 'tpSize',
				type: 'string',
				default: '',
				description: 'Take profit quantity (partial mode)',
			},
			{
				displayName: 'SL Size',
				name: 'slSize',
				type: 'string',
				default: '',
				description: 'Stop loss quantity (partial mode)',
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
				options: [
					{ name: 'Limit', value: 'Limit' },
					{ name: 'Market', value: 'Market' },
				],
				default: 'Market',
				description: 'Take profit order type',
			},
			{
				displayName: 'SL Order Type',
				name: 'slOrderType',
				type: 'options',
				options: [
					{ name: 'Limit', value: 'Limit' },
					{ name: 'Market', value: 'Market' },
				],
				default: 'Market',
				description: 'Stop loss order type',
			},
		],
	},
	// Auto Add Margin
	{
		displayName: 'Auto Add Margin',
		name: 'autoAddMargin',
		type: 'options',
		options: [
			{ name: 'Off', value: 0 },
			{ name: 'On', value: 1 },
		],
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['setAutoAddMargin'],
			},
		},
		description: 'Auto add margin setting',
	},
	// Margin
	{
		displayName: 'Margin',
		name: 'margin',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['addReduceMargin'],
			},
		},
		description: 'Margin amount (positive to add, negative to reduce)',
	},
	// Position Query Options
	{
		displayName: 'Query Options',
		name: 'queryOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['getPositionInfo', 'getClosedPnL'],
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
		],
	},
	// Move Positions
	{
		displayName: 'From UID',
		name: 'fromUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['movePositions'],
			},
		},
		description: 'Source account UID',
	},
	{
		displayName: 'To UID',
		name: 'toUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['movePositions'],
			},
		},
		description: 'Destination account UID',
	},
	{
		displayName: 'Positions (JSON)',
		name: 'positions',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['position'],
				operation: ['movePositions'],
			},
		},
		description: 'Array of positions to move',
	},
];

export async function executePosition(
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
		case 'getPositionInfo': {
			endpoint = '/v5/position/list';
			method = 'GET';
			query = { category };
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.symbol) query.symbol = queryOptions.symbol;
			if (queryOptions.baseCoin) query.baseCoin = queryOptions.baseCoin;
			if (queryOptions.settleCoin) query.settleCoin = queryOptions.settleCoin;
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'setLeverage': {
			endpoint = '/v5/position/set-leverage';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				buyLeverage: this.getNodeParameter('buyLeverage', i) as string,
				sellLeverage: this.getNodeParameter('sellLeverage', i) as string,
			};
			break;
		}
		case 'switchMarginMode': {
			endpoint = '/v5/position/switch-isolated';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				tradeMode: this.getNodeParameter('tradeMode', i) as number,
				buyLeverage: this.getNodeParameter('buyLeverage', i, '10') as string,
				sellLeverage: this.getNodeParameter('sellLeverage', i, '10') as string,
			};
			break;
		}
		case 'setTpSlMode': {
			endpoint = '/v5/position/set-tpsl-mode';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				tpSlMode: this.getNodeParameter('tpSlMode', i) as string,
			};
			break;
		}
		case 'switchPositionMode': {
			endpoint = '/v5/position/switch-mode';
			body = {
				category,
				mode: this.getNodeParameter('mode', i) as number,
			};
			break;
		}
		case 'setRiskLimit': {
			endpoint = '/v5/position/set-risk-limit';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				riskId: this.getNodeParameter('riskId', i) as number,
			};
			break;
		}
		case 'setTradingStop': {
			endpoint = '/v5/position/trading-stop';
			const tradingStopOptions = this.getNodeParameter('tradingStopOptions', i, {}) as IDataObject;
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				positionIdx: this.getNodeParameter('positionIdx', i) as number,
				...tradingStopOptions,
			};
			break;
		}
		case 'setAutoAddMargin': {
			endpoint = '/v5/position/set-auto-add-margin';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				autoAddMargin: this.getNodeParameter('autoAddMargin', i) as number,
			};
			break;
		}
		case 'addReduceMargin': {
			endpoint = '/v5/position/add-margin';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
				margin: this.getNodeParameter('margin', i) as string,
				positionIdx: this.getNodeParameter('positionIdx', i) as number,
			};
			break;
		}
		case 'getClosedPnL': {
			endpoint = '/v5/position/closed-pnl';
			method = 'GET';
			query = { category };
			const queryOptions = this.getNodeParameter('queryOptions', i, {}) as IDataObject;
			if (queryOptions.symbol) query.symbol = queryOptions.symbol;
			if (queryOptions.startTime) query.startTime = new Date(queryOptions.startTime as string).getTime();
			if (queryOptions.endTime) query.endTime = new Date(queryOptions.endTime as string).getTime();
			if (queryOptions.limit) query.limit = queryOptions.limit;
			if (queryOptions.cursor) query.cursor = queryOptions.cursor;
			break;
		}
		case 'movePositions': {
			endpoint = '/v5/position/move-positions';
			const positions = JSON.parse(this.getNodeParameter('positions', i) as string);
			body = {
				fromUid: this.getNodeParameter('fromUid', i) as string,
				toUid: this.getNodeParameter('toUid', i) as string,
				list: positions,
			};
			break;
		}
		case 'confirmNewRiskLimit': {
			endpoint = '/v5/position/confirm-pending-mmr';
			body = {
				category,
				symbol: this.getNodeParameter('symbol', i) as string,
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
