/**
 * Bybit n8n Node
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

// Import resource operations and fields
import { marketOperations, marketFields, executeMarket } from './actions/market';
import { tradeOperations, tradeFields, executeTrade } from './actions/trade';
import { positionOperations, positionFields, executePosition } from './actions/position';
import { accountOperations, accountFields, executeAccount } from './actions/account';
import { assetOperations, assetFields, executeAsset } from './actions/asset';
import { userOperations, userFields, executeUser } from './actions/user';
import { spotLeverageTokenOperations, spotLeverageTokenFields, executeSpotLeverageToken } from './actions/spotLeverageToken';
import { spotMarginUtaOperations, spotMarginUtaFields, executeSpotMarginUtaOperation } from './actions/spotMarginUta';
import { institutionalLendingOperations, institutionalLendingFields, executeInstitutionalLendingOperation } from './actions/institutionalLending';
import { preUpgradeDataOperations, preUpgradeDataFields, executePreUpgradeDataOperation } from './actions/preUpgradeData';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility';

// Emit licensing notice once per node load
const licensingNoticeEmitted = false;
function emitLicensingNotice() {
	if (!licensingNoticeEmitted) {
		console.warn(`[mychaelgo Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from mychaelgo.

For licensing information, visit https://github.com/mychaelgo.`);
	}
}

export class Bybit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bybit',
		name: 'bybit',
		icon: 'file:bybit.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Bybit V5 API for cryptocurrency trading',
		defaults: {
			name: 'Bybit',
		},
		inputs: ['main'] as const,
		outputs: ['main'] as const,
		credentials: [
			{
				name: 'bybitApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage wallet, balance, and account settings',
					},
					{
						name: 'Asset',
						value: 'asset',
						description: 'Manage assets, transfers, deposits, and withdrawals',
					},
					{
						name: 'Institutional Lending',
						value: 'institutionalLending',
						description: 'Institutional lending operations',
					},
					{
						name: 'Market',
						value: 'market',
						description: 'Get market data, tickers, orderbook, and klines',
					},
					{
						name: 'Position',
						value: 'position',
						description: 'Manage positions, leverage, and margin',
					},
					{
						name: 'Pre-Upgrade Data',
						value: 'preUpgradeData',
						description: 'Access pre-UTA upgrade historical data',
					},
					{
						name: 'Spot Leverage Token',
						value: 'spotLeverageToken',
						description: 'Manage leveraged token operations',
					},
					{
						name: 'Spot Margin (UTA)',
						value: 'spotMarginUta',
						description: 'Spot margin trading operations for UTA',
					},
					{
						name: 'Trade',
						value: 'trade',
						description: 'Place, modify, and manage orders',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Manage sub-accounts and API keys',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Server time and announcements',
					},
				],
				default: 'market',
			},

			// Operations for each resource
			...marketOperations,
			...tradeOperations,
			...positionOperations,
			...accountOperations,
			...assetOperations,
			...userOperations,
			...spotLeverageTokenOperations,
			...spotMarginUtaOperations,
			...institutionalLendingOperations,
			...preUpgradeDataOperations,
			...utilityOperations,

			// Fields for each resource
			...marketFields,
			...tradeFields,
			...positionFields,
			...accountFields,
			...assetFields,
			...userFields,
			...spotLeverageTokenFields,
			...spotMarginUtaFields,
			...institutionalLendingFields,
			...preUpgradeDataFields,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		emitLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				switch (resource) {
					case 'market':
						responseData = await executeMarket.call(this, operation, i);
						break;
					case 'trade':
						responseData = await executeTrade.call(this, operation, i);
						break;
					case 'position':
						responseData = await executePosition.call(this, operation, i);
						break;
					case 'account':
						responseData = await executeAccount.call(this, operation, i);
						break;
					case 'asset':
						responseData = await executeAsset.call(this, operation, i);
						break;
					case 'user':
						responseData = await executeUser.call(this, operation, i);
						break;
					case 'spotLeverageToken':
						responseData = await executeSpotLeverageToken.call(this, operation, i);
						break;
					case 'spotMarginUta':
						responseData = await executeSpotMarginUtaOperation.call(this, operation, i);
						break;
					case 'institutionalLending':
						responseData = await executeInstitutionalLendingOperation.call(this, operation, i);
						break;
					case 'preUpgradeData':
						responseData = await executePreUpgradeDataOperation.call(this, operation, i);
						break;
					case 'utility':
						responseData = await executeUtilityOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((data) => ({ json: data })));
				} else {
					returnData.push({ json: responseData });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
