/**
 * Bybit Utility Resource
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { bybitApiRequest } from '../../transport/bybitApi';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Get Server Time',
				value: 'getServerTime',
				description: 'Get Bybit server timestamp',
				action: 'Get server time',
			},
			{
				name: 'Get Announcements',
				value: 'getAnnouncements',
				description: 'Get Bybit announcements',
				action: 'Get announcements',
			},
		],
		default: 'getServerTime',
	},
];

export const utilityFields: INodeProperties[] = [
	// getAnnouncements fields
	{
		displayName: 'Locale',
		name: 'locale',
		type: 'options',
		options: [
			{ name: 'English (US)', value: 'en-US' },
			{ name: 'Chinese (Simplified)', value: 'zh-CN' },
			{ name: 'Chinese (Traditional - TW)', value: 'zh-TW' },
			{ name: 'Chinese (Traditional - HK)', value: 'zh-HK' },
			{ name: 'Korean', value: 'ko-KR' },
			{ name: 'Japanese', value: 'ja-JP' },
			{ name: 'Russian', value: 'ru-RU' },
			{ name: 'German', value: 'de-DE' },
			{ name: 'Spanish (ES)', value: 'es-ES' },
			{ name: 'Spanish (AR)', value: 'es-AR' },
			{ name: 'French', value: 'fr-FR' },
			{ name: 'Turkish', value: 'tr-TR' },
			{ name: 'Vietnamese', value: 'vi-VN' },
			{ name: 'Portuguese', value: 'pt-PT' },
			{ name: 'Arabic', value: 'ar-SA' },
			{ name: 'Hindi', value: 'hi-IN' },
			{ name: 'Indonesian', value: 'id-ID' },
			{ name: 'Thai', value: 'th-TH' },
			{ name: 'Filipino', value: 'fil-PH' },
		],
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getAnnouncements'],
			},
		},
		required: true,
		default: 'en-US',
		description: 'Language for announcements',
	},
	{
		displayName: 'Announcement Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'New Crypto', value: 'new_crypto' },
			{ name: 'Latest Bybit News', value: 'latest_bybit_news' },
			{ name: 'Delistings', value: 'delistings' },
			{ name: 'Latest Activities', value: 'latest_activities' },
			{ name: 'Product Updates', value: 'product_updates' },
			{ name: 'New Fiat Listings', value: 'new_fiat_listings' },
			{ name: 'Maintenance Updates', value: 'maintenance_updates' },
			{ name: 'Bybit Learn', value: 'bybit_learn' },
			{ name: 'API Updates', value: 'api_updates' },
			{ name: 'Crypto Airdrop', value: 'crypto_airdrop' },
			{ name: 'Other', value: 'other' },
		],
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getAnnouncements'],
			},
		},
		default: '',
		description: 'Announcement type filter',
	},
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'options',
		options: [
			{ name: 'Spot', value: 'Spot' },
			{ name: 'Derivatives', value: 'Derivatives' },
			{ name: 'Copy Trading', value: 'Copy Trading' },
			{ name: 'Spot Liquidity Mining', value: 'Spot Liquidity Mining' },
			{ name: 'Web3', value: 'Web3' },
			{ name: 'USDC Contract', value: 'USDC Contract' },
			{ name: 'Leveraged Tokens', value: 'Leveraged Tokens' },
			{ name: 'Margin Trading', value: 'Margin Trading' },
			{ name: 'Launchpad', value: 'Launchpad' },
			{ name: 'P2P Trading', value: 'P2P Trading' },
			{ name: 'Trading Bots', value: 'Trading Bots' },
			{ name: 'Bybit NFT', value: 'Bybit NFT' },
			{ name: 'VIP', value: 'VIP' },
			{ name: 'Institutional Loan', value: 'Institutional Loan' },
			{ name: 'MT5', value: 'MT5' },
			{ name: 'Convert', value: 'Convert' },
			{ name: 'Options', value: 'Options' },
			{ name: 'Pre-Market', value: 'Pre-Market' },
			{ name: 'Earn', value: 'Earn' },
			{ name: 'Card', value: 'Card' },
		],
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getAnnouncements'],
			},
		},
		default: '',
		description: 'Announcement tag filter',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getAnnouncements'],
			},
		},
		default: 1,
		description: 'Page number',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getAnnouncements'],
			},
		},
		default: 20,
		description: 'Number of announcements per page',
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'getServerTime': {
			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/market/time',
				{},
				{},
				false, // No authentication needed for public endpoint
			);
			break;
		}

		case 'getAnnouncements': {
			const locale = this.getNodeParameter('locale', i) as string;
			const type = this.getNodeParameter('type', i, '') as string;
			const tag = this.getNodeParameter('tag', i, '') as string;
			const page = this.getNodeParameter('page', i, 1) as number;
			const limit = this.getNodeParameter('limit', i, 20) as number;

			const qs: IDataObject = { locale, page, limit };
			if (type) qs.type = type;
			if (tag) qs.tag = tag;

			responseData = await bybitApiRequest.call(
				this,
				'GET',
				'/v5/announcements/index',
				{},
				qs,
				false, // No authentication needed for public endpoint
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
