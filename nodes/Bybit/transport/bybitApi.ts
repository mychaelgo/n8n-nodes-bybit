/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as crypto from 'crypto';

export interface IBybitApiResponse {
	retCode: number;
	retMsg: string;
	result: IDataObject;
	retExtInfo?: IDataObject;
	time: number;
}

function getBaseUrl(environment: string): string {
	return environment === 'testnet'
		? 'https://api-testnet.bybit.com'
		: 'https://api.bybit.com';
}

function generateSignature(
	apiSecret: string,
	timestamp: string,
	apiKey: string,
	recvWindow: string,
	queryString: string,
): string {
	const preSign = `${timestamp}${apiKey}${recvWindow}${queryString}`;
	return crypto.createHmac('sha256', apiSecret).update(preSign).digest('hex');
}

function buildQueryString(params: IDataObject): string {
	const sortedKeys = Object.keys(params).sort();
	const pairs: string[] = [];
	for (const key of sortedKeys) {
		const value = params[key];
		if (value !== undefined && value !== null && value !== '') {
			pairs.push(`${key}=${String(value)}`);
		}
	}
	return pairs.join('&');
}

export async function bybitApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	requiresAuth: boolean = true,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('bybitApi');
	const environment = credentials.environment as string;
	const baseUrl = getBaseUrl(environment);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (requiresAuth) {
		const apiKey = credentials.apiKey as string;
		const apiSecret = credentials.apiSecret as string;
		const recvWindow = String(credentials.recvWindow || 5000);
		const timestamp = Date.now().toString();

		let queryString = '';
		if (method === 'GET' || method === 'DELETE') {
			queryString = buildQueryString(query);
			if (queryString) {
				options.url = `${options.url}?${queryString}`;
			}
		} else {
			queryString = JSON.stringify(body);
			options.body = body;
		}

		const signature = generateSignature(apiSecret, timestamp, apiKey, recvWindow, queryString);

		options.headers = {
			...options.headers,
			'X-BAPI-API-KEY': apiKey,
			'X-BAPI-SIGN': signature,
			'X-BAPI-TIMESTAMP': timestamp,
			'X-BAPI-RECV-WINDOW': recvWindow,
		};
	} else {
		if (method === 'GET' && Object.keys(query).length > 0) {
			const queryString = buildQueryString(query);
			options.url = `${options.url}?${queryString}`;
		}
	}

	try {
		const response = await this.helpers.httpRequest(options);
		const bybitResponse = response as IBybitApiResponse;

		if (bybitResponse.retCode !== 0) {
			throw new NodeApiError(this.getNode(), response as JsonObject, {
				message: bybitResponse.retMsg || 'Unknown Bybit API error',
				httpCode: String(bybitResponse.retCode),
			});
		}

		return bybitResponse.result;
	} catch (error) {
		if (error instanceof NodeApiError) {
			throw error;
		}
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Bybit API request failed',
		});
	}
}

export async function bybitApiRequestAllItems(
	this: IExecuteFunctions | IHookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	propertyName: string = 'list',
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let cursor: string | undefined;

	do {
		if (cursor) {
			query.cursor = cursor;
		}

		const responseData = await bybitApiRequest.call(this, method, endpoint, body, query);

		const items = responseData[propertyName] as IDataObject[] | undefined;
		if (items && Array.isArray(items)) {
			returnData.push(...items);
		}

		cursor = responseData.nextPageCursor as string | undefined;
	} while (cursor);

	return returnData;
}
