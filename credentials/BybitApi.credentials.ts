/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BybitApi implements ICredentialType {
	name = 'bybitApi';
	displayName = 'Bybit API';
	documentationUrl = 'https://bybit-exchange.github.io/docs/v5/intro';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Bybit API key',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Bybit API secret',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
			],
			default: 'mainnet',
			description: 'Select the Bybit environment',
		},
		{
			displayName: 'Receive Window (ms)',
			name: 'recvWindow',
			type: 'number',
			default: 5000,
			description: 'Time window for request validity in milliseconds',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "testnet" ? "https://api-testnet.bybit.com" : "https://api.bybit.com"}}',
			url: '/v5/market/time',
			method: 'GET',
		},
	};
}
