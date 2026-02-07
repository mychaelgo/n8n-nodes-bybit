/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodePropertyOptions } from 'n8n-workflow';

export const CATEGORY_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Spot', value: 'spot' },
	{ name: 'Linear (USDT/USDC Perpetual)', value: 'linear' },
	{ name: 'Inverse', value: 'inverse' },
	{ name: 'Option', value: 'option' },
];

export const ORDER_TYPE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Limit', value: 'Limit' },
	{ name: 'Market', value: 'Market' },
];

export const SIDE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Buy', value: 'Buy' },
	{ name: 'Sell', value: 'Sell' },
];

export const TIME_IN_FORCE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'GTC (Good Till Cancel)', value: 'GTC' },
	{ name: 'IOC (Immediate or Cancel)', value: 'IOC' },
	{ name: 'FOK (Fill or Kill)', value: 'FOK' },
	{ name: 'PostOnly', value: 'PostOnly' },
];

export const POSITION_IDX_OPTIONS: INodePropertyOptions[] = [
	{ name: 'One-Way Mode', value: 0 },
	{ name: 'Hedge Mode - Buy Side', value: 1 },
	{ name: 'Hedge Mode - Sell Side', value: 2 },
];

export const ACCOUNT_TYPE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Unified', value: 'UNIFIED' },
	{ name: 'Contract', value: 'CONTRACT' },
	{ name: 'Spot', value: 'SPOT' },
	{ name: 'Option', value: 'OPTION' },
	{ name: 'Fund', value: 'FUND' },
];

export const INTERVAL_OPTIONS: INodePropertyOptions[] = [
	{ name: '1 Minute', value: '1' },
	{ name: '3 Minutes', value: '3' },
	{ name: '5 Minutes', value: '5' },
	{ name: '15 Minutes', value: '15' },
	{ name: '30 Minutes', value: '30' },
	{ name: '1 Hour', value: '60' },
	{ name: '2 Hours', value: '120' },
	{ name: '4 Hours', value: '240' },
	{ name: '6 Hours', value: '360' },
	{ name: '12 Hours', value: '720' },
	{ name: '1 Day', value: 'D' },
	{ name: '1 Week', value: 'W' },
	{ name: '1 Month', value: 'M' },
];

export const TP_SL_MODE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Full', value: 'Full' },
	{ name: 'Partial', value: 'Partial' },
];

export const POSITION_MODE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'One-Way Mode', value: 0 },
	{ name: 'Hedge Mode (Two-Way)', value: 3 },
];

export const MARGIN_MODE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Cross Margin', value: 'REGULAR_MARGIN' },
	{ name: 'Isolated Margin', value: 'ISOLATED_MARGIN' },
	{ name: 'Portfolio Margin', value: 'PORTFOLIO_MARGIN' },
];

export const TRADE_MODE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Cross', value: 0 },
	{ name: 'Isolated', value: 1 },
];

export const ORDER_FILTER_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Order', value: 'Order' },
	{ name: 'TP/SL Order', value: 'tpslOrder' },
	{ name: 'Stop Order', value: 'StopOrder' },
];

export const STOP_ORDER_TYPE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Take Profit', value: 'TakeProfit' },
	{ name: 'Stop Loss', value: 'StopLoss' },
	{ name: 'Trailing Stop', value: 'TrailingStop' },
	{ name: 'Stop', value: 'Stop' },
	{ name: 'Partial Take Profit', value: 'PartialTakeProfit' },
	{ name: 'Partial Stop Loss', value: 'PartialStopLoss' },
];

export const TRIGGER_DIRECTION_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Rise (trigger when price rises)', value: 1 },
	{ name: 'Fall (trigger when price falls)', value: 2 },
];

export const TRIGGER_BY_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Last Price', value: 'LastPrice' },
	{ name: 'Index Price', value: 'IndexPrice' },
	{ name: 'Mark Price', value: 'MarkPrice' },
];

export const WITHDRAW_TYPE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'On Chain', value: 0 },
	{ name: 'Off Chain', value: 1 },
	{ name: 'All', value: 2 },
];

export const TRANSFER_STATUS_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Success', value: 'SUCCESS' },
	{ name: 'Pending', value: 'PENDING' },
	{ name: 'Failed', value: 'FAILED' },
];

export const DEPOSIT_STATUS_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Unknown', value: 0 },
	{ name: 'To Be Confirmed', value: 1 },
	{ name: 'Processing', value: 2 },
	{ name: 'Success', value: 3 },
	{ name: 'Deposit Failed', value: 4 },
];

export const BYBIT_ERROR_CODES: Record<number, string> = {
	0: 'Success',
	10001: 'Request parameter error',
	10002: 'Request timestamp expired',
	10003: 'API key is invalid',
	10004: 'Signature error',
	10005: 'Permission denied',
	10006: 'Too many requests',
	10007: 'Request timeout',
	10010: 'System error',
	10016: 'Server error',
	10017: 'IP not in whitelist',
	10018: 'Request exceeded the limit',
	110001: 'Order does not exist',
	110003: 'Order price exceeds limit',
	110004: 'Insufficient wallet balance',
	110005: 'Position status not normal',
	110006: 'Asset not match',
	110007: 'Position mode is not match',
	110008: 'Risk limit exceeded',
	110009: 'Order not modified',
	110010: 'Order not cancelled',
	110012: 'Insufficient available balance',
	110013: 'Position value too small',
	110014: 'Invalid leverage',
	110015: 'Trading banned for this symbol',
	110017: 'Reduce only rule not satisfied',
	110018: 'Order would immediately trigger',
	110019: 'Order would trigger immediately',
	110020: 'Position closed',
	110021: 'Position mode cannot be changed',
	110022: 'Position quantity exceeded',
	110023: 'Position side error',
	110024: 'Reduce-only order cannot increase position',
	110025: 'Close order cannot be placed during settlement',
	110026: 'Isolated margin mode position auto-add margin',
	110027: 'Position is not enough',
	110028: 'Position is in auto-add margin mode',
	110029: 'Leverage cannot be changed',
};
