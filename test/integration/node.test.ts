/**
 * Bybit Node Integration Tests
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import { Bybit } from '../../nodes/Bybit/Bybit.node';
import { BybitTrigger } from '../../nodes/Bybit/BybitTrigger.node';

describe('Bybit Node Structure', () => {
	describe('Main Node', () => {
		let node: Bybit;

		beforeEach(() => {
			node = new Bybit();
		});

		it('should have correct display name', () => {
			expect(node.description.displayName).toBe('Bybit');
		});

		it('should have correct node name', () => {
			expect(node.description.name).toBe('bybit');
		});

		it('should have correct version', () => {
			expect(node.description.version).toBe(1);
		});

		it('should require bybitApi credentials', () => {
			const credentials = node.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials?.length).toBe(1);
			expect(credentials?.[0].name).toBe('bybitApi');
			expect(credentials?.[0].required).toBe(true);
		});

		it('should have all expected resources', () => {
			const resourceProperty = node.description.properties.find(p => p.name === 'resource');
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');

			const resourceOptions = (resourceProperty as any)?.options || [];
			const resourceValues = resourceOptions.map((opt: any) => opt.value);

			expect(resourceValues).toContain('market');
			expect(resourceValues).toContain('trade');
			expect(resourceValues).toContain('position');
			expect(resourceValues).toContain('account');
			expect(resourceValues).toContain('asset');
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('spotLeverageToken');
			expect(resourceValues).toContain('spotMarginUta');
			expect(resourceValues).toContain('institutionalLending');
			expect(resourceValues).toContain('preUpgradeData');
			expect(resourceValues).toContain('utility');
		});

		it('should have inputs and outputs configured', () => {
			expect(node.description.inputs).toBeDefined();
			expect(node.description.outputs).toBeDefined();
		});

		it('should have icon file reference', () => {
			expect(node.description.icon).toBe('file:bybit.svg');
		});

		it('should have subtitle expression', () => {
			expect(node.description.subtitle).toBe('={{$parameter["operation"] + ": " + $parameter["resource"]}}');
		});
	});

	describe('Trigger Node', () => {
		let triggerNode: BybitTrigger;

		beforeEach(() => {
			triggerNode = new BybitTrigger();
		});

		it('should have correct display name', () => {
			expect(triggerNode.description.displayName).toBe('Bybit Trigger');
		});

		it('should have correct node name', () => {
			expect(triggerNode.description.name).toBe('bybitTrigger');
		});

		it('should be a polling trigger', () => {
			expect(triggerNode.description.polling).toBe(true);
		});

		it('should have empty inputs (trigger node)', () => {
			expect(triggerNode.description.inputs).toEqual([]);
		});

		it('should require bybitApi credentials', () => {
			const credentials = triggerNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials?.length).toBe(1);
			expect(credentials?.[0].name).toBe('bybitApi');
		});

		it('should have all expected trigger types', () => {
			const triggerTypeProperty = triggerNode.description.properties.find(p => p.name === 'triggerType');
			expect(triggerTypeProperty).toBeDefined();
			expect(triggerTypeProperty?.type).toBe('options');

			const triggerOptions = (triggerTypeProperty as any)?.options || [];
			const triggerValues = triggerOptions.map((opt: any) => opt.value);

			expect(triggerValues).toContain('newOrder');
			expect(triggerValues).toContain('orderFilled');
			expect(triggerValues).toContain('orderCanceled');
			expect(triggerValues).toContain('positionOpened');
			expect(triggerValues).toContain('positionClosed');
			expect(triggerValues).toContain('priceAlert');
			expect(triggerValues).toContain('fundingRateAlert');
			expect(triggerValues).toContain('liquidationAlert');
			expect(triggerValues).toContain('balanceChanged');
			expect(triggerValues).toContain('pnlThreshold');
		});

		it('should have category option', () => {
			const categoryProperty = triggerNode.description.properties.find(p => p.name === 'category');
			expect(categoryProperty).toBeDefined();
			expect(categoryProperty?.type).toBe('options');

			const categoryOptions = (categoryProperty as any)?.options || [];
			const categoryValues = categoryOptions.map((opt: any) => opt.value);

			expect(categoryValues).toContain('spot');
			expect(categoryValues).toContain('linear');
			expect(categoryValues).toContain('inverse');
			expect(categoryValues).toContain('option');
		});
	});
});

describe('Bybit Resource Operations', () => {
	const node = new Bybit();

	const expectedOperations: Record<string, string[]> = {
		market: [
			'getKline',
			'getMarkPriceKline',
			'getIndexPriceKline',
			'getPremiumIndexPriceKline',
			'getInstrumentsInfo',
			'getOrderbook',
			'getTickers',
			'getFundingRateHistory',
			'getPublicTradingHistory',
			'getOpenInterest',
			'getHistoricalVolatility',
			'getInsurance',
			'getRiskLimit',
			'getDeliveryPrice',
			'getLongShortRatio',
			'getServerTime',
		],
		trade: [
			'placeOrder',
			'amendOrder',
			'cancelOrder',
			'getOpenOrders',
			'cancelAllOrders',
			'getOrderHistory',
			'getTradeHistory',
			'batchPlaceOrder',
			'batchAmendOrder',
			'batchCancelOrder',
			'getSpotBorrowCheck',
			'setDisconnectCancelAll',
		],
		position: [
			'getPositionInfo',
			'setLeverage',
			'switchMarginMode',
			'setTpSlMode',
			'switchPositionMode',
			'setRiskLimit',
			'setTradingStop',
			'setAutoAddMargin',
			'addReduceMargin',
			'getClosedPnL',
			'movePositions',
			'confirmNewRiskLimit',
		],
	};

	Object.entries(expectedOperations).forEach(([resource, operations]) => {
		describe(`${resource} resource`, () => {
			it(`should have operations for ${resource}`, () => {
				const operationProperty = node.description.properties.find(
					p => p.name === 'operation' && 
					(p.displayOptions?.show?.resource as string[] | undefined)?.includes(resource)
				);

				expect(operationProperty).toBeDefined();

				if (operationProperty && 'options' in operationProperty) {
					const operationOptions = operationProperty.options as any[];
					const operationValues = operationOptions.map((opt: any) => opt.value);

					operations.forEach(op => {
						expect(operationValues).toContain(op);
					});
				}
			});
		});
	});
});
