/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

export function cleanEmptyParams(params: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			cleaned[key] = value;
		}
	}
	return cleaned;
}

export function formatTimestamp(date: Date | string | number): string {
	if (typeof date === 'number') {
		return String(date);
	}
	if (typeof date === 'string') {
		return String(new Date(date).getTime());
	}
	return String(date.getTime());
}

export function parseBybitTimestamp(timestamp: number | string): Date {
	const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
	return new Date(ts);
}

export function formatPrice(price: number | string, decimals: number = 8): string {
	const num = typeof price === 'string' ? parseFloat(price) : price;
	return num.toFixed(decimals);
}

export function formatQuantity(qty: number | string, decimals: number = 8): string {
	const num = typeof qty === 'string' ? parseFloat(qty) : qty;
	return num.toFixed(decimals);
}

export function buildOrderLinkId(prefix?: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 10);
	if (prefix) {
		return `n8n_${prefix}_${random}_${timestamp}`;
	}
	return `n8n_${random}_${timestamp}`;
}

export function validateSymbol(symbol: string): void {
	if (!symbol || !symbol.trim()) {
		throw new Error('Symbol is required');
	}
}

export function validateCategory(category: string): void {
	const validCategories = ['spot', 'linear', 'inverse', 'option'];
	if (!validCategories.includes(category)) {
		throw new Error(`Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
	}
}

export function validateOrderType(orderType: string): void {
	const validTypes = ['Limit', 'Market'];
	if (!validTypes.includes(orderType)) {
		throw new Error(`Invalid order type: ${orderType}. Must be one of: ${validTypes.join(', ')}`);
	}
}

export function validateSide(side: string): void {
	const validSides = ['Buy', 'Sell'];
	if (!validSides.includes(side)) {
		throw new Error(`Invalid side: ${side}. Must be one of: ${validSides.join(', ')}`);
	}
}

export function validateTimeInForce(tif: string): void {
	const validTifs = ['GTC', 'IOC', 'FOK', 'PostOnly'];
	if (!validTifs.includes(tif)) {
		throw new Error(`Invalid time in force: ${tif}. Must be one of: ${validTifs.join(', ')}`);
	}
}

export function processListResponse(
	response: IDataObject,
	listKey: string = 'list',
): IDataObject[] {
	const list = response[listKey];
	if (Array.isArray(list)) {
		return list as IDataObject[];
	}
	return [];
}

export function calculatePnL(
	side: 'Buy' | 'Sell',
	entryPrice: number,
	exitPrice: number,
	quantity: number,
): number {
	if (side === 'Buy') {
		return (exitPrice - entryPrice) * quantity;
	}
	return (entryPrice - exitPrice) * quantity;
}

export function calculateLiquidationPrice(
	side: 'Buy' | 'Sell',
	entryPrice: number,
	leverage: number,
	maintenanceMarginRate: number = 0.005,
): number {
	const direction = side === 'Buy' ? 1 : -1;
	const liquidationPrice = entryPrice * (1 - direction * (1 / leverage - maintenanceMarginRate));
	return liquidationPrice;
}

export function roundToTickSize(price: number, tickSize: number): number {
	return Math.round(price / tickSize) * tickSize;
}

export function roundToStepSize(qty: number, stepSize: number): number {
	return Math.round(qty / stepSize) * stepSize;
}

export function getErrorMessage(retCode: number, defaultMessage: string): string {
	const errorMessages: Record<number, string> = {
		10001: 'Request parameter error',
		10002: 'Request timestamp expired',
		10003: 'API key is invalid',
		10004: 'Signature error',
		10005: 'Permission denied',
		10006: 'Too many requests',
		110001: 'Order does not exist',
		110003: 'Order price exceeds limit',
		110004: 'Insufficient wallet balance',
		110012: 'Insufficient available balance',
	};
	return errorMessages[retCode] || defaultMessage;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}
