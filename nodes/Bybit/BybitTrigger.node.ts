/**
 * Bybit Trigger n8n Node
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { bybitApiRequest } from './transport/bybitApi';

// Emit licensing notice once per node load
let licensingNoticeEmitted = false;
function emitLicensingNotice() {
	if (!licensingNoticeEmitted) {
		console.warn(`[mychaelgo Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from mychaelgo.

For licensing information, visit https://github.com/mychaelgo.`);
		licensingNoticeEmitted = true;
	}
}

export class BybitTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bybit Trigger',
		name: 'bybitTrigger',
		icon: 'file:bybit.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerType"]}}',
		description: 'Trigger workflows based on Bybit events',
		defaults: {
			name: 'Bybit Trigger',
		},
		polling: true,
		inputs: [],
		outputs: ['main'] as const,
		credentials: [
			{
				name: 'bybitApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: [
					{
						name: 'New Order',
						value: 'newOrder',
						description: 'Trigger when a new order is created',
					},
					{
						name: 'Order Filled',
						value: 'orderFilled',
						description: 'Trigger when an order is filled/executed',
					},
					{
						name: 'Order Canceled',
						value: 'orderCanceled',
						description: 'Trigger when an order is canceled',
					},
					{
						name: 'Position Opened',
						value: 'positionOpened',
						description: 'Trigger when a new position is opened',
					},
					{
						name: 'Position Closed',
						value: 'positionClosed',
						description: 'Trigger when a position is closed',
					},
					{
						name: 'Price Alert',
						value: 'priceAlert',
						description: 'Trigger when price crosses a threshold',
					},
					{
						name: 'Funding Rate Alert',
						value: 'fundingRateAlert',
						description: 'Trigger when funding rate exceeds threshold',
					},
					{
						name: 'Liquidation Alert',
						value: 'liquidationAlert',
						description: 'Trigger when position approaches liquidation',
					},
					{
						name: 'Balance Changed',
						value: 'balanceChanged',
						description: 'Trigger when wallet balance changes',
					},
					{
						name: 'PnL Threshold',
						value: 'pnlThreshold',
						description: 'Trigger when PnL exceeds threshold',
					},
				],
				default: 'newOrder',
				required: true,
			},
			// Category
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{ name: 'Spot', value: 'spot' },
					{ name: 'Linear (USDT Perpetual)', value: 'linear' },
					{ name: 'Inverse', value: 'inverse' },
					{ name: 'Option', value: 'option' },
				],
				default: 'linear',
				displayOptions: {
					show: {
						triggerType: [
							'newOrder', 'orderFilled', 'orderCanceled',
							'positionOpened', 'positionClosed', 'priceAlert',
							'fundingRateAlert', 'liquidationAlert', 'pnlThreshold',
						],
					},
				},
			},
			// Symbol
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: 'BTCUSDT',
				description: 'Trading pair symbol',
				displayOptions: {
					show: {
						triggerType: [
							'newOrder', 'orderFilled', 'orderCanceled',
							'positionOpened', 'positionClosed', 'priceAlert',
							'fundingRateAlert', 'liquidationAlert', 'pnlThreshold',
						],
					},
				},
			},
			// Account Type for balance
			{
				displayName: 'Account Type',
				name: 'accountType',
				type: 'options',
				options: [
					{ name: 'Unified', value: 'UNIFIED' },
					{ name: 'Contract', value: 'CONTRACT' },
					{ name: 'Spot', value: 'SPOT' },
					{ name: 'Fund', value: 'FUND' },
				],
				default: 'UNIFIED',
				displayOptions: {
					show: {
						triggerType: ['balanceChanged'],
					},
				},
			},
			// Coin for balance
			{
				displayName: 'Coin',
				name: 'coin',
				type: 'string',
				default: 'USDT',
				description: 'Coin to monitor',
				displayOptions: {
					show: {
						triggerType: ['balanceChanged'],
					},
				},
			},
			// Price threshold
			{
				displayName: 'Price Threshold',
				name: 'priceThreshold',
				type: 'number',
				default: 0,
				description: 'Price level to trigger on',
				displayOptions: {
					show: {
						triggerType: ['priceAlert'],
					},
				},
			},
			{
				displayName: 'Price Direction',
				name: 'priceDirection',
				type: 'options',
				options: [
					{ name: 'Above', value: 'above' },
					{ name: 'Below', value: 'below' },
					{ name: 'Cross', value: 'cross' },
				],
				default: 'above',
				displayOptions: {
					show: {
						triggerType: ['priceAlert'],
					},
				},
			},
			// Funding rate threshold
			{
				displayName: 'Funding Rate Threshold (%)',
				name: 'fundingRateThreshold',
				type: 'number',
				default: 0.1,
				description: 'Funding rate percentage threshold',
				displayOptions: {
					show: {
						triggerType: ['fundingRateAlert'],
					},
				},
			},
			// Liquidation margin percentage
			{
				displayName: 'Margin Threshold (%)',
				name: 'marginThreshold',
				type: 'number',
				default: 20,
				description: 'Margin percentage threshold for liquidation warning',
				displayOptions: {
					show: {
						triggerType: ['liquidationAlert'],
					},
				},
			},
			// PnL threshold
			{
				displayName: 'PnL Threshold',
				name: 'pnlThreshold',
				type: 'number',
				default: 100,
				description: 'PnL threshold value (positive or negative)',
				displayOptions: {
					show: {
						triggerType: ['pnlThreshold'],
					},
				},
			},
			{
				displayName: 'PnL Direction',
				name: 'pnlDirection',
				type: 'options',
				options: [
					{ name: 'Profit Above', value: 'profitAbove' },
					{ name: 'Loss Below', value: 'lossBelow' },
					{ name: 'Any', value: 'any' },
				],
				default: 'any',
				displayOptions: {
					show: {
						triggerType: ['pnlThreshold'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		emitLicensingNotice();

		const triggerType = this.getNodeParameter('triggerType') as string;
		const webhookData = this.getWorkflowStaticData('node');
		const returnData: INodeExecutionData[] = [];

		switch (triggerType) {
			case 'newOrder':
			case 'orderFilled':
			case 'orderCanceled': {
				const category = this.getNodeParameter('category') as string;
				const symbol = this.getNodeParameter('symbol') as string;
				
				const response = await bybitApiRequest.call(
					this,
					'GET',
					'/v5/order/history',
					{},
					{ category, symbol, limit: 50 },
				) as IDataObject;

					const orders = (response.list as IDataObject[]) || [];
					const lastPollTime = webhookData.lastPollTime as number || 0;
					const now = Date.now();

					for (const order of orders) {
						const orderTime = parseInt(order.createdTime as string, 10);
						if (orderTime > lastPollTime) {
							const orderStatus = order.orderStatus as string;
							
							if (triggerType === 'newOrder' && orderStatus === 'New') {
								returnData.push({ json: order });
							} else if (triggerType === 'orderFilled' && orderStatus === 'Filled') {
								returnData.push({ json: order });
							} else if (triggerType === 'orderCanceled' && orderStatus === 'Cancelled') {
								returnData.push({ json: order });
							}
						}
					}

					webhookData.lastPollTime = now;
					break;
				}

				case 'positionOpened':
				case 'positionClosed': {
					const category = this.getNodeParameter('category') as string;
					const symbol = this.getNodeParameter('symbol') as string;

					const response = await bybitApiRequest.call(
						this,
						'GET',
						'/v5/position/list',
						{},
						{ category, symbol },
					) as IDataObject;

					const positions = (response.list as IDataObject[]) || [];
					const previousPositions = webhookData.previousPositions as IDataObject[] || [];

					for (const position of positions) {
						const positionSize = parseFloat(position.size as string);
						const posSymbol = position.symbol as string;
						
						const prevPosition = previousPositions.find((p) => p.symbol === posSymbol);
						const prevSize = prevPosition ? parseFloat(prevPosition.size as string) : 0;

						if (triggerType === 'positionOpened' && positionSize > 0 && prevSize === 0) {
							returnData.push({ json: { ...position, event: 'opened' } });
						} else if (triggerType === 'positionClosed' && positionSize === 0 && prevSize > 0) {
							returnData.push({ json: { ...position, event: 'closed', previousSize: prevSize } });
						}
					}

					webhookData.previousPositions = positions;
					break;
				}

				case 'priceAlert': {
					const category = this.getNodeParameter('category') as string;
					const symbol = this.getNodeParameter('symbol') as string;
					const priceThreshold = this.getNodeParameter('priceThreshold') as number;
					const priceDirection = this.getNodeParameter('priceDirection') as string;

					const response = await bybitApiRequest.call(
						this,
						'GET',
						'/v5/market/tickers',
						{},
						{ category, symbol },
						false,
					) as IDataObject;

					const tickers = (response.list as IDataObject[]) || [];
					const ticker = tickers[0];
					
					if (ticker) {
						const lastPrice = parseFloat(ticker.lastPrice as string);
						const previousPrice = webhookData.previousPrice as number;
						let shouldTrigger = false;

						if (priceDirection === 'above' && lastPrice >= priceThreshold) {
							shouldTrigger = previousPrice === undefined || previousPrice < priceThreshold;
						} else if (priceDirection === 'below' && lastPrice <= priceThreshold) {
							shouldTrigger = previousPrice === undefined || previousPrice > priceThreshold;
						} else if (priceDirection === 'cross') {
							if (previousPrice !== undefined) {
								shouldTrigger = (previousPrice < priceThreshold && lastPrice >= priceThreshold) ||
									(previousPrice > priceThreshold && lastPrice <= priceThreshold);
							}
						}

						if (shouldTrigger) {
							returnData.push({
								json: {
									...ticker,
									threshold: priceThreshold,
									direction: priceDirection,
									previousPrice,
									triggered: true,
								},
							});
						}

						webhookData.previousPrice = lastPrice;
					}
					break;
				}

				case 'fundingRateAlert': {
					const category = this.getNodeParameter('category') as string;
					const symbol = this.getNodeParameter('symbol') as string;
					const fundingRateThreshold = this.getNodeParameter('fundingRateThreshold') as number;

					const response = await bybitApiRequest.call(
						this,
						'GET',
						'/v5/market/tickers',
						{},
						{ category, symbol },
						false,
					) as IDataObject;

					const tickers = (response.list as IDataObject[]) || [];
					const ticker = tickers[0];

					if (ticker && ticker.fundingRate) {
						const fundingRate = parseFloat(ticker.fundingRate as string) * 100;
						const previousFundingAlert = webhookData.previousFundingAlert as boolean;

						if (Math.abs(fundingRate) >= fundingRateThreshold && !previousFundingAlert) {
							returnData.push({
								json: {
									...ticker,
									fundingRatePercent: fundingRate,
									threshold: fundingRateThreshold,
									triggered: true,
								},
							});
							webhookData.previousFundingAlert = true;
						} else if (Math.abs(fundingRate) < fundingRateThreshold) {
							webhookData.previousFundingAlert = false;
						}
					}
					break;
				}

				case 'liquidationAlert': {
					const category = this.getNodeParameter('category') as string;
					const symbol = this.getNodeParameter('symbol') as string;
					const marginThreshold = this.getNodeParameter('marginThreshold') as number;

					const response = await bybitApiRequest.call(
						this,
						'GET',
						'/v5/position/list',
						{},
						{ category, symbol },
					) as IDataObject;

					const positions = (response.list as IDataObject[]) || [];
					const previousLiqAlert = webhookData.previousLiqAlert as { [key: string]: boolean } || {};

					for (const position of positions) {
						const positionValue = parseFloat(position.positionValue as string || '0');
						const liqPrice = parseFloat(position.liqPrice as string || '0');
						const markPrice = parseFloat(position.markPrice as string || '0');
						const posSymbol = position.symbol as string;

						if (positionValue > 0 && liqPrice > 0 && markPrice > 0) {
							const distanceToLiq = Math.abs((markPrice - liqPrice) / markPrice) * 100;
							
							if (distanceToLiq <= marginThreshold && !previousLiqAlert[posSymbol]) {
								returnData.push({
									json: {
										...position,
										distanceToLiquidation: distanceToLiq,
										threshold: marginThreshold,
										triggered: true,
									},
								});
								previousLiqAlert[posSymbol] = true;
							} else if (distanceToLiq > marginThreshold) {
								previousLiqAlert[posSymbol] = false;
							}
						}
					}

					webhookData.previousLiqAlert = previousLiqAlert;
					break;
				}

				case 'balanceChanged': {
					const accountType = this.getNodeParameter('accountType') as string;
					const coin = this.getNodeParameter('coin') as string;

					const response = await bybitApiRequest.call(
						this,
						'GET',
						'/v5/account/wallet-balance',
						{},
						{ accountType, coin },
					) as IDataObject;

					const accounts = (response.list as IDataObject[]) || [];
					const previousBalances = webhookData.previousBalances as { [key: string]: string } || {};

					for (const account of accounts) {
						const coins = (account.coin as IDataObject[]) || [];
						for (const coinData of coins) {
							const coinName = coinData.coin as string;
							const walletBalance = coinData.walletBalance as string;
							const prevBalance = previousBalances[coinName];

							if (prevBalance !== undefined && prevBalance !== walletBalance) {
								returnData.push({
									json: {
										...coinData,
										accountType,
										previousBalance: prevBalance,
										change: parseFloat(walletBalance) - parseFloat(prevBalance),
									},
								});
							}

							previousBalances[coinName] = walletBalance;
						}
					}

					webhookData.previousBalances = previousBalances;
					break;
				}

				case 'pnlThreshold': {
					const category = this.getNodeParameter('category') as string;
					const symbol = this.getNodeParameter('symbol') as string;
					const pnlThreshold = this.getNodeParameter('pnlThreshold') as number;
					const pnlDirection = this.getNodeParameter('pnlDirection') as string;

					const response = await bybitApiRequest.call(
						this,
						'GET',
						'/v5/position/list',
						{},
						{ category, symbol },
					) as IDataObject;

					const positions = (response.list as IDataObject[]) || [];
					const previousPnlAlert = webhookData.previousPnlAlert as { [key: string]: boolean } || {};

					for (const position of positions) {
						const unrealisedPnl = parseFloat(position.unrealisedPnl as string || '0');
						const posSymbol = position.symbol as string;
						let shouldTrigger = false;

						if (pnlDirection === 'profitAbove' && unrealisedPnl >= pnlThreshold) {
							shouldTrigger = !previousPnlAlert[posSymbol];
						} else if (pnlDirection === 'lossBelow' && unrealisedPnl <= -pnlThreshold) {
							shouldTrigger = !previousPnlAlert[posSymbol];
						} else if (pnlDirection === 'any' && Math.abs(unrealisedPnl) >= pnlThreshold) {
							shouldTrigger = !previousPnlAlert[posSymbol];
						}

						if (shouldTrigger) {
							returnData.push({
								json: {
									...position,
									threshold: pnlThreshold,
									direction: pnlDirection,
									triggered: true,
								},
							});
							previousPnlAlert[posSymbol] = true;
						} else if (Math.abs(unrealisedPnl) < pnlThreshold * 0.9) {
							// Reset when PnL drops below 90% of threshold
							previousPnlAlert[posSymbol] = false;
						}
					}

					webhookData.previousPnlAlert = previousPnlAlert;
					break;
				}

				default:
					throw new Error(`Unknown trigger type: ${triggerType}`);
			}

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}
