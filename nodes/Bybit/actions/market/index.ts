/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';
import { CATEGORY_OPTIONS, INTERVAL_OPTIONS } from '../../constants/options';
import { cleanEmptyParams } from '../../utils/helpers';

export const marketOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['market'],
			},
		},
		options: [
			{ name: 'Get Delivery Price', value: 'getDeliveryPrice', action: 'Get delivery price' },
			{ name: 'Get Funding Rate History', value: 'getFundingRateHistory', action: 'Get funding rate history' },
			{ name: 'Get Historical Volatility', value: 'getHistoricalVolatility', action: 'Get historical volatility' },
			{ name: 'Get Index Price Kline', value: 'getIndexPriceKline', action: 'Get index price kline' },
			{ name: 'Get Instruments Info', value: 'getInstrumentsInfo', action: 'Get instruments info' },
			{ name: 'Get Insurance', value: 'getInsurance', action: 'Get insurance fund data' },
			{ name: 'Get Kline', value: 'getKline', action: 'Get kline candlestick data' },
			{ name: 'Get Long Short Ratio', value: 'getLongShortRatio', action: 'Get long short ratio' },
			{ name: 'Get Mark Price Kline', value: 'getMarkPriceKline', action: 'Get mark price kline' },
			{ name: 'Get Open Interest', value: 'getOpenInterest', action: 'Get open interest' },
			{ name: 'Get Orderbook', value: 'getOrderbook', action: 'Get order book depth' },
			{ name: 'Get Premium Index Price Kline', value: 'getPremiumIndexPriceKline', action: 'Get premium index price kline' },
			{ name: 'Get Public Trading History', value: 'getPublicTradingHistory', action: 'Get recent public trades' },
			{ name: 'Get Risk Limit', value: 'getRiskLimit', action: 'Get risk limit info' },
			{ name: 'Get Server Time', value: 'getServerTime', action: 'Get server time' },
			{ name: 'Get Tickers', value: 'getTickers', action: 'Get latest market data' },
		],
		default: 'getTickers',
	},
];

export const marketFields: INodeProperties[] = [
	// Category for most operations
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: CATEGORY_OPTIONS,
		default: 'spot',
		required: true,
		displayOptions: {
			show: {
				resource: ['market'],
				operation: [
					'getKline', 'getMarkPriceKline', 'getIndexPriceKline', 'getPremiumIndexPriceKline',
					'getInstrumentsInfo', 'getOrderbook', 'getTickers', 'getFundingRateHistory',
					'getPublicTradingHistory', 'getOpenInterest', 'getRiskLimit', 'getDeliveryPrice',
					'getLongShortRatio',
				],
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
		required: true,
		displayOptions: {
			show: {
				resource: ['market'],
				operation: [
					'getKline', 'getMarkPriceKline', 'getIndexPriceKline', 'getPremiumIndexPriceKline',
					'getOrderbook', 'getFundingRateHistory', 'getPublicTradingHistory', 'getOpenInterest',
					'getRiskLimit', 'getLongShortRatio',
				],
			},
		},
		description: 'Trading pair symbol (e.g., BTCUSDT)',
	},
	// Interval for kline operations
	{
		displayName: 'Interval',
		name: 'interval',
		type: 'options',
		options: INTERVAL_OPTIONS,
		default: '60',
		required: true,
		displayOptions: {
			show: {
				resource: ['market'],
				operation: ['getKline', 'getMarkPriceKline', 'getIndexPriceKline', 'getPremiumIndexPriceKline'],
			},
		},
		description: 'Kline interval',
	},
	// Limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 200,
		displayOptions: {
			show: {
				resource: ['market'],
				operation: [
					'getKline', 'getMarkPriceKline', 'getIndexPriceKline', 'getPremiumIndexPriceKline',
					'getOrderbook', 'getFundingRateHistory', 'getPublicTradingHistory', 'getOpenInterest',
					'getLongShortRatio',
				],
			},
		},
		description: 'Maximum number of records to return',
	},
	// Additional Options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['market'],
				operation: [
					'getKline', 'getMarkPriceKline', 'getIndexPriceKline', 'getPremiumIndexPriceKline',
					'getInstrumentsInfo', 'getTickers', 'getFundingRateHistory', 'getDeliveryPrice',
				],
			},
		},
		options: [
			{
				displayName: 'Start Time',
				name: 'start',
				type: 'dateTime',
				default: '',
				description: 'Start timestamp (milliseconds)',
			},
			{
				displayName: 'End Time',
				name: 'end',
				type: 'dateTime',
				default: '',
				description: 'End timestamp (milliseconds)',
			},
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: '',
				description: 'Trading pair symbol for filtering',
			},
			{
				displayName: 'Base Coin',
				name: 'baseCoin',
				type: 'string',
				default: '',
				description: 'Base coin for filtering (e.g., BTC)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Pre-Launch', value: 'PreLaunch' },
					{ name: 'Trading', value: 'Trading' },
					{ name: 'Settling', value: 'Settling' },
					{ name: 'Delivering', value: 'Delivering' },
					{ name: 'Closed', value: 'Closed' },
				],
				default: 'Trading',
				description: 'Instrument status filter',
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
	// Historical Volatility specific fields
	{
		displayName: 'Base Coin',
		name: 'baseCoin',
		type: 'string',
		default: 'BTC',
		required: true,
		displayOptions: {
			show: {
				resource: ['market'],
				operation: ['getHistoricalVolatility'],
			},
		},
		description: 'Base coin (e.g., BTC, ETH)',
	},
	{
		displayName: 'Period',
		name: 'period',
		type: 'number',
		default: 7,
		displayOptions: {
			show: {
				resource: ['market'],
				operation: ['getHistoricalVolatility'],
			},
		},
		description: 'Period in days (7, 14, 21, 30, 60, 90, 180, 270)',
	},
	// Insurance coin
	{
		displayName: 'Coin',
		name: 'coin',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['market'],
				operation: ['getInsurance'],
			},
		},
		description: 'Filter by coin (e.g., BTC, USDT)',
	},
	// Interval Index for Open Interest
	{
		displayName: 'Interval Time',
		name: 'intervalTime',
		type: 'options',
		options: [
			{ name: '5 Minutes', value: '5min' },
			{ name: '15 Minutes', value: '15min' },
			{ name: '30 Minutes', value: '30min' },
			{ name: '1 Hour', value: '1h' },
			{ name: '4 Hours', value: '4h' },
			{ name: '1 Day', value: '1d' },
		],
		default: '1h',
		displayOptions: {
			show: {
				resource: ['market'],
				operation: ['getOpenInterest'],
			},
		},
		description: 'Interval time for open interest',
	},
];

export async function executeMarket(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let endpoint: string;
	const method: 'GET' | 'POST' = 'GET';
	let query: IDataObject = {};

	switch (operation) {
		case 'getKline': {
			endpoint = '/v5/market/kline';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				interval: this.getNodeParameter('interval', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.start) {
				query.start = new Date(additionalOptions.start as string).getTime();
			}
			if (additionalOptions.end) {
				query.end = new Date(additionalOptions.end as string).getTime();
			}
			break;
		}
		case 'getMarkPriceKline': {
			endpoint = '/v5/market/mark-price-kline';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				interval: this.getNodeParameter('interval', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.start) {
				query.start = new Date(additionalOptions.start as string).getTime();
			}
			if (additionalOptions.end) {
				query.end = new Date(additionalOptions.end as string).getTime();
			}
			break;
		}
		case 'getIndexPriceKline': {
			endpoint = '/v5/market/index-price-kline';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				interval: this.getNodeParameter('interval', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.start) {
				query.start = new Date(additionalOptions.start as string).getTime();
			}
			if (additionalOptions.end) {
				query.end = new Date(additionalOptions.end as string).getTime();
			}
			break;
		}
		case 'getPremiumIndexPriceKline': {
			endpoint = '/v5/market/premium-index-price-kline';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				interval: this.getNodeParameter('interval', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.start) {
				query.start = new Date(additionalOptions.start as string).getTime();
			}
			if (additionalOptions.end) {
				query.end = new Date(additionalOptions.end as string).getTime();
			}
			break;
		}
		case 'getInstrumentsInfo': {
			endpoint = '/v5/market/instruments-info';
			query = {
				category: this.getNodeParameter('category', i) as string,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.symbol) {
				query.symbol = additionalOptions.symbol;
			}
			if (additionalOptions.baseCoin) {
				query.baseCoin = additionalOptions.baseCoin;
			}
			if (additionalOptions.status) {
				query.status = additionalOptions.status;
			}
			if (additionalOptions.cursor) {
				query.cursor = additionalOptions.cursor;
			}
			break;
		}
		case 'getOrderbook': {
			endpoint = '/v5/market/orderbook';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			break;
		}
		case 'getTickers': {
			endpoint = '/v5/market/tickers';
			query = {
				category: this.getNodeParameter('category', i) as string,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.symbol) {
				query.symbol = additionalOptions.symbol;
			}
			if (additionalOptions.baseCoin) {
				query.baseCoin = additionalOptions.baseCoin;
			}
			break;
		}
		case 'getFundingRateHistory': {
			endpoint = '/v5/market/funding/history';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.start) {
				query.startTime = new Date(additionalOptions.start as string).getTime();
			}
			if (additionalOptions.end) {
				query.endTime = new Date(additionalOptions.end as string).getTime();
			}
			break;
		}
		case 'getPublicTradingHistory': {
			endpoint = '/v5/market/recent-trade';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			break;
		}
		case 'getOpenInterest': {
			endpoint = '/v5/market/open-interest';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				intervalTime: this.getNodeParameter('intervalTime', i) as string,
				limit: this.getNodeParameter('limit', i) as number,
			};
			break;
		}
		case 'getHistoricalVolatility': {
			endpoint = '/v5/market/historical-volatility';
			query = {
				category: 'option',
				baseCoin: this.getNodeParameter('baseCoin', i) as string,
			};
			const period = this.getNodeParameter('period', i) as number;
			if (period) {
				query.period = period;
			}
			break;
		}
		case 'getInsurance': {
			endpoint = '/v5/market/insurance';
			const coin = this.getNodeParameter('coin', i, '') as string;
			if (coin) {
				query.coin = coin;
			}
			break;
		}
		case 'getRiskLimit': {
			endpoint = '/v5/market/risk-limit';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
			};
			break;
		}
		case 'getDeliveryPrice': {
			endpoint = '/v5/market/delivery-price';
			query = {
				category: this.getNodeParameter('category', i) as string,
			};
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
			if (additionalOptions.symbol) {
				query.symbol = additionalOptions.symbol;
			}
			if (additionalOptions.baseCoin) {
				query.baseCoin = additionalOptions.baseCoin;
			}
			if (additionalOptions.cursor) {
				query.cursor = additionalOptions.cursor;
			}
			break;
		}
		case 'getLongShortRatio': {
			endpoint = '/v5/market/account-ratio';
			query = {
				category: this.getNodeParameter('category', i) as string,
				symbol: this.getNodeParameter('symbol', i) as string,
				period: '1h',
				limit: this.getNodeParameter('limit', i) as number,
			};
			break;
		}
		case 'getServerTime': {
			endpoint = '/v5/market/time';
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	query = cleanEmptyParams(query);
	return await bybitApiRequest.call(this, method, endpoint, {}, query, false);
}
