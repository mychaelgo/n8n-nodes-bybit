/*
 * Copyright (c) mychaelgo
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';
import { cleanEmptyParams } from '../../utils/helpers';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{ name: 'Create Sub API Key', value: 'createSubApiKey', action: 'Create sub account API key' },
			{ name: 'Create Sub Member', value: 'createSubMember', action: 'Create sub account' },
			{ name: 'Delete Master API Key', value: 'deleteMasterApiKey', action: 'Delete master API key' },
			{ name: 'Delete Sub API Key', value: 'deleteSubApiKey', action: 'Delete sub account API key' },
			{ name: 'Freeze Sub Member', value: 'freezeSubMember', action: 'Freeze unfreeze sub account' },
			{ name: 'Get Affiliate User Info', value: 'getAffiliateUserInfo', action: 'Get affiliate user info' },
			{ name: 'Get API Key Info', value: 'getApiKeyInfo', action: 'Get API key info' },
			{ name: 'Get Sub UID List', value: 'getSubUidList', action: 'Get sub account UID list' },
			{ name: 'Modify Master API Key', value: 'modifyMasterApiKey', action: 'Modify master API key' },
			{ name: 'Modify Sub API Key', value: 'modifySubApiKey', action: 'Modify sub account API key' },
		],
		default: 'getApiKeyInfo',
	},
];

export const userFields: INodeProperties[] = [
	// Sub Member Creation
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createSubMember'],
			},
		},
		description: 'Sub-account username (6-16 characters, letters and numbers only)',
	},
	{
		displayName: 'Member Type',
		name: 'memberType',
		type: 'options',
		options: [
			{ name: 'Normal Sub-Account', value: 1 },
			{ name: 'Custodial Sub-Account', value: 6 },
		],
		default: 1,
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createSubMember'],
			},
		},
		description: 'Sub-account type',
	},
	// Sub Member Options
	{
		displayName: 'Sub Member Options',
		name: 'subMemberOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createSubMember'],
			},
		},
		options: [
			{
				displayName: 'Switch',
				name: 'switch',
				type: 'options',
				options: [
					{ name: 'Turn Off', value: 0 },
					{ name: 'Turn On', value: 1 },
				],
				default: 1,
				description: 'Enable quick login',
			},
			{
				displayName: 'Is UTA',
				name: 'isUta',
				type: 'boolean',
				default: true,
				description: 'Whether to create as UTA account',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Note for the sub-account',
			},
		],
	},
	// Sub UID
	{
		displayName: 'Sub UID',
		name: 'subuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createSubApiKey', 'freezeSubMember', 'modifySubApiKey', 'deleteSubApiKey'],
			},
		},
		description: 'Sub-account UID',
	},
	// Freeze Action
	{
		displayName: 'Freeze Action',
		name: 'frozen',
		type: 'options',
		options: [
			{ name: 'Unfreeze', value: 0 },
			{ name: 'Freeze', value: 1 },
		],
		default: 1,
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['freezeSubMember'],
			},
		},
		description: 'Freeze or unfreeze action',
	},
	// API Key ID (for modify/delete)
	{
		displayName: 'API Key',
		name: 'apikey',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['modifySubApiKey', 'deleteSubApiKey'],
			},
		},
		description: 'API key to modify or delete',
	},
	// API Key Creation/Modification Options
	{
		displayName: 'API Key Options',
		name: 'apiKeyOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createSubApiKey', 'modifyMasterApiKey', 'modifySubApiKey'],
			},
		},
		options: [
			{
				displayName: 'Read Only',
				name: 'readOnly',
				type: 'options',
				options: [
					{ name: 'Read and Write', value: 0 },
					{ name: 'Read Only', value: 1 },
				],
				default: 0,
				description: 'API key permission type',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Note for the API key',
			},
			{
				displayName: 'IP Whitelist',
				name: 'ips',
				type: 'string',
				default: '',
				description: 'Comma-separated list of allowed IPs',
			},
			{
				displayName: 'Permissions (JSON)',
				name: 'permissions',
				type: 'json',
				default: '{}',
				description: 'Permission settings as JSON object',
			},
		],
	},
	// Affiliate UID
	{
		displayName: 'Affiliate UID',
		name: 'uid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getAffiliateUserInfo'],
			},
		},
		description: 'UID of the affiliate user',
	},
];

export async function executeUser(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let endpoint: string;
	let method: 'GET' | 'POST' = 'POST';
	let body: IDataObject = {};
	let query: IDataObject = {};

	switch (operation) {
		case 'createSubMember': {
			endpoint = '/v5/user/create-sub-member';
			const subMemberOptions = this.getNodeParameter('subMemberOptions', i, {}) as IDataObject;
			body = {
				username: this.getNodeParameter('username', i) as string,
				memberType: this.getNodeParameter('memberType', i) as number,
				...subMemberOptions,
			};
			if (body.permissions && typeof body.permissions === 'string') {
				body.permissions = JSON.parse(body.permissions as string);
			}
			break;
		}
		case 'createSubApiKey': {
			endpoint = '/v5/user/create-sub-api';
			const apiKeyOptions = this.getNodeParameter('apiKeyOptions', i, {}) as IDataObject;
			body = {
				subuid: this.getNodeParameter('subuid', i) as string,
				...apiKeyOptions,
			};
			if (apiKeyOptions.ips && typeof apiKeyOptions.ips === 'string') {
				body.ips = (apiKeyOptions.ips as string).split(',').map((ip) => ip.trim());
			}
			if (body.permissions && typeof body.permissions === 'string') {
				body.permissions = JSON.parse(body.permissions as string);
			}
			break;
		}
		case 'getSubUidList': {
			endpoint = '/v5/user/query-sub-members';
			method = 'GET';
			break;
		}
		case 'freezeSubMember': {
			endpoint = '/v5/user/frozen-sub-member';
			body = {
				subuid: parseInt(this.getNodeParameter('subuid', i) as string, 10),
				frozen: this.getNodeParameter('frozen', i) as number,
			};
			break;
		}
		case 'getApiKeyInfo': {
			endpoint = '/v5/user/query-api';
			method = 'GET';
			break;
		}
		case 'modifyMasterApiKey': {
			endpoint = '/v5/user/update-api';
			const apiKeyOptions = this.getNodeParameter('apiKeyOptions', i, {}) as IDataObject;
			body = { ...apiKeyOptions };
			if (apiKeyOptions.ips && typeof apiKeyOptions.ips === 'string') {
				body.ips = (apiKeyOptions.ips as string).split(',').map((ip) => ip.trim());
			}
			if (body.permissions && typeof body.permissions === 'string') {
				body.permissions = JSON.parse(body.permissions as string);
			}
			break;
		}
		case 'modifySubApiKey': {
			endpoint = '/v5/user/update-sub-api';
			const apiKeyOptions = this.getNodeParameter('apiKeyOptions', i, {}) as IDataObject;
			body = {
				apikey: this.getNodeParameter('apikey', i) as string,
				...apiKeyOptions,
			};
			if (apiKeyOptions.ips && typeof apiKeyOptions.ips === 'string') {
				body.ips = (apiKeyOptions.ips as string).split(',').map((ip) => ip.trim());
			}
			if (body.permissions && typeof body.permissions === 'string') {
				body.permissions = JSON.parse(body.permissions as string);
			}
			break;
		}
		case 'deleteSubApiKey': {
			endpoint = '/v5/user/delete-sub-api';
			body = {
				apikey: this.getNodeParameter('apikey', i) as string,
			};
			break;
		}
		case 'deleteMasterApiKey': {
			endpoint = '/v5/user/delete-api';
			break;
		}
		case 'getAffiliateUserInfo': {
			endpoint = '/v5/user/aff-customer-info';
			method = 'GET';
			query = {
				uid: this.getNodeParameter('uid', i) as string,
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
