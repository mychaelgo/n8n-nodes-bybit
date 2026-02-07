/**
 * Bybit Helpers Unit Tests
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import {
	cleanEmptyParams,
	formatTimestamp,
	parseBybitTimestamp,
	formatPrice,
	formatQuantity,
	buildOrderLinkId,
	validateSymbol,
	validateCategory,
	validateOrderType,
	validateSide,
	validateTimeInForce,
	roundToTickSize,
	roundToStepSize,
	calculatePnL,
	calculateLiquidationPrice,
	chunkArray,
	sleep,
} from '../../nodes/Bybit/utils/helpers';

describe('Bybit Helpers', () => {
	describe('cleanEmptyParams', () => {
		it('should remove null values', () => {
			const input = { a: 1, b: null, c: 'test' };
			const result = cleanEmptyParams(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove undefined values', () => {
			const input = { a: 1, b: undefined, c: 'test' };
			const result = cleanEmptyParams(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove empty strings', () => {
			const input = { a: 1, b: '', c: 'test' };
			const result = cleanEmptyParams(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should keep zero values', () => {
			const input = { a: 0, b: false, c: 'test' };
			const result = cleanEmptyParams(input);
			expect(result).toEqual({ a: 0, b: false, c: 'test' });
		});
	});

	describe('formatTimestamp', () => {
		it('should convert Date to milliseconds string', () => {
			const date = new Date('2024-01-15T12:00:00.000Z');
			const result = formatTimestamp(date);
			expect(result).toBe('1705320000000');
		});

		it('should convert number to milliseconds string', () => {
			const timestamp = 1705320000000;
			const result = formatTimestamp(timestamp);
			expect(result).toBe('1705320000000');
		});
	});

	describe('parseBybitTimestamp', () => {
		it('should parse milliseconds string to Date', () => {
			const result = parseBybitTimestamp('1705320000000');
			expect(result).toBeInstanceOf(Date);
			expect(result.toISOString()).toBe('2024-01-15T12:00:00.000Z');
		});

		it('should parse number to Date', () => {
			const result = parseBybitTimestamp(1705320000000);
			expect(result).toBeInstanceOf(Date);
		});
	});

	describe('formatPrice', () => {
		it('should format price with default decimals', () => {
			const result = formatPrice(12345.6789);
			expect(result).toBe('12345.67890000');
		});

		it('should format price with custom decimals', () => {
			const result = formatPrice(12345.6789, 2);
			expect(result).toBe('12345.68');
		});
	});

	describe('formatQuantity', () => {
		it('should format quantity with default decimals', () => {
			const result = formatQuantity(1.23456789);
			expect(result).toBe('1.23456789');
		});

		it('should format quantity with custom decimals', () => {
			const result = formatQuantity(1.23456789, 4);
			expect(result).toBe('1.2346');
		});
	});

	describe('buildOrderLinkId', () => {
		it('should generate unique order link id', () => {
			const id1 = buildOrderLinkId();
			const id2 = buildOrderLinkId();
			expect(id1).not.toBe(id2);
			expect(id1).toMatch(/^n8n_[a-z0-9]+_\d+$/);
		});

		it('should include optional prefix', () => {
			const result = buildOrderLinkId('TEST');
			expect(result).toMatch(/^n8n_TEST_[a-z0-9]+_\d+$/);
		});
	});

	describe('validateSymbol', () => {
		it('should accept valid symbols', () => {
			expect(() => validateSymbol('BTCUSDT')).not.toThrow();
			expect(() => validateSymbol('ETH-PERP')).not.toThrow();
			expect(() => validateSymbol('BTC-31MAR23-40000-C')).not.toThrow();
		});

		it('should reject invalid symbols', () => {
			expect(() => validateSymbol('')).toThrow();
			expect(() => validateSymbol('   ')).toThrow();
		});
	});

	describe('validateCategory', () => {
		it('should accept valid categories', () => {
			expect(() => validateCategory('spot')).not.toThrow();
			expect(() => validateCategory('linear')).not.toThrow();
			expect(() => validateCategory('inverse')).not.toThrow();
			expect(() => validateCategory('option')).not.toThrow();
		});

		it('should reject invalid categories', () => {
			expect(() => validateCategory('invalid')).toThrow();
			expect(() => validateCategory('futures')).toThrow();
		});
	});

	describe('validateOrderType', () => {
		it('should accept valid order types', () => {
			expect(() => validateOrderType('Limit')).not.toThrow();
			expect(() => validateOrderType('Market')).not.toThrow();
		});

		it('should reject invalid order types', () => {
			expect(() => validateOrderType('StopLoss')).toThrow();
		});
	});

	describe('validateSide', () => {
		it('should accept valid sides', () => {
			expect(() => validateSide('Buy')).not.toThrow();
			expect(() => validateSide('Sell')).not.toThrow();
		});

		it('should reject invalid sides', () => {
			expect(() => validateSide('Long')).toThrow();
		});
	});

	describe('validateTimeInForce', () => {
		it('should accept valid time in force values', () => {
			expect(() => validateTimeInForce('GTC')).not.toThrow();
			expect(() => validateTimeInForce('IOC')).not.toThrow();
			expect(() => validateTimeInForce('FOK')).not.toThrow();
			expect(() => validateTimeInForce('PostOnly')).not.toThrow();
		});

		it('should reject invalid time in force', () => {
			expect(() => validateTimeInForce('DAY')).toThrow();
		});
	});

	describe('roundToTickSize', () => {
		it('should round to tick size', () => {
			expect(roundToTickSize(100.123, 0.01)).toBe(100.12);
			expect(roundToTickSize(100.125, 0.01)).toBe(100.13);
			expect(roundToTickSize(100.5, 1)).toBe(101);
		});
	});

	describe('roundToStepSize', () => {
		it('should round to step size', () => {
			expect(roundToStepSize(1.234, 0.01)).toBe(1.23);
			expect(roundToStepSize(1.235, 0.01)).toBe(1.24);
			expect(roundToStepSize(10.5, 1)).toBe(11);
		});
	});

	describe('calculatePnL', () => {
		it('should calculate PnL for long position', () => {
			const result = calculatePnL('Buy', 100, 110, 1);
			expect(result).toBe(10);
		});

		it('should calculate PnL for short position', () => {
			const result = calculatePnL('Sell', 100, 90, 1);
			expect(result).toBe(10);
		});

		it('should calculate negative PnL for losing trade', () => {
			const result = calculatePnL('Buy', 100, 90, 1);
			expect(result).toBe(-10);
		});
	});

	describe('calculateLiquidationPrice', () => {
		it('should calculate liquidation price for long position', () => {
			const result = calculateLiquidationPrice('Buy', 100, 10, 0.005);
			expect(result).toBeCloseTo(90.5, 2);
		});

		it('should calculate liquidation price for short position', () => {
			const result = calculateLiquidationPrice('Sell', 100, 10, 0.005);
			expect(result).toBeCloseTo(109.5, 2);
		});
	});

	describe('chunkArray', () => {
		it('should split array into chunks', () => {
			const input = [1, 2, 3, 4, 5];
			const result = chunkArray(input, 2);
			expect(result).toEqual([[1, 2], [3, 4], [5]]);
		});

		it('should handle empty array', () => {
			const result = chunkArray([], 2);
			expect(result).toEqual([]);
		});

		it('should handle chunk size larger than array', () => {
			const input = [1, 2, 3];
			const result = chunkArray(input, 5);
			expect(result).toEqual([[1, 2, 3]]);
		});
	});

	describe('sleep', () => {
		it('should delay execution', async () => {
			const start = Date.now();
			await sleep(100);
			const elapsed = Date.now() - start;
			expect(elapsed).toBeGreaterThanOrEqual(90);
		});
	});
});
