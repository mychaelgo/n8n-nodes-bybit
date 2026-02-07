/**
 * Bybit API Transport Unit Tests
 *
 * [mychaelgo Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from mychaelgo.
 * For licensing information, visit https://github.com/mychaelgo.
 */

import * as crypto from 'crypto';

// Test the signature generation logic directly
describe('Bybit API Transport', () => {
	describe('Signature Generation', () => {
		const testCases = [
			{
				name: 'should generate correct HMAC SHA256 signature',
				apiSecret: 'test_secret_key',
				timestamp: '1673581873000',
				apiKey: 'test_api_key',
				recvWindow: '5000',
				queryString: 'category=linear&symbol=BTCUSDT',
				expected: crypto
					.createHmac('sha256', 'test_secret_key')
					.update('1673581873000test_api_key5000category=linear&symbol=BTCUSDT')
					.digest('hex'),
			},
			{
				name: 'should handle empty query string',
				apiSecret: 'secret123',
				timestamp: '1673581873000',
				apiKey: 'apikey123',
				recvWindow: '5000',
				queryString: '',
				expected: crypto
					.createHmac('sha256', 'secret123')
					.update('1673581873000apikey1235000')
					.digest('hex'),
			},
			{
				name: 'should handle JSON body for POST requests',
				apiSecret: 'secret456',
				timestamp: '1673581874000',
				apiKey: 'apikey456',
				recvWindow: '10000',
				queryString: '{"category":"spot","symbol":"BTCUSDT","side":"Buy","orderType":"Market","qty":"0.01"}',
				expected: crypto
					.createHmac('sha256', 'secret456')
					.update('1673581874000apikey45610000{"category":"spot","symbol":"BTCUSDT","side":"Buy","orderType":"Market","qty":"0.01"}')
					.digest('hex'),
			},
		];

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

		testCases.forEach(({ name, apiSecret, timestamp, apiKey, recvWindow, queryString, expected }) => {
			it(name, () => {
				const result = generateSignature(apiSecret, timestamp, apiKey, recvWindow, queryString);
				expect(result).toBe(expected);
			});
		});
	});

	describe('Query String Building', () => {
		function buildQueryString(params: Record<string, unknown>): string {
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

		it('should sort parameters alphabetically', () => {
			const params = { symbol: 'BTCUSDT', category: 'linear', limit: 50 };
			const result = buildQueryString(params);
			expect(result).toBe('category=linear&limit=50&symbol=BTCUSDT');
		});

		it('should filter out null and undefined values', () => {
			const params = { symbol: 'BTCUSDT', cursor: null, limit: undefined, category: 'spot' };
			const result = buildQueryString(params);
			expect(result).toBe('category=spot&symbol=BTCUSDT');
		});

		it('should filter out empty strings', () => {
			const params = { symbol: 'BTCUSDT', orderId: '', category: 'spot' };
			const result = buildQueryString(params);
			expect(result).toBe('category=spot&symbol=BTCUSDT');
		});

		it('should handle empty params object', () => {
			const result = buildQueryString({});
			expect(result).toBe('');
		});

		it('should convert numbers to strings', () => {
			const params = { limit: 100, offset: 0 };
			const result = buildQueryString(params);
			expect(result).toBe('limit=100&offset=0');
		});
	});

	describe('Base URL Selection', () => {
		function getBaseUrl(environment: string): string {
			return environment === 'testnet'
				? 'https://api-testnet.bybit.com'
				: 'https://api.bybit.com';
		}

		it('should return mainnet URL for mainnet environment', () => {
			expect(getBaseUrl('mainnet')).toBe('https://api.bybit.com');
		});

		it('should return testnet URL for testnet environment', () => {
			expect(getBaseUrl('testnet')).toBe('https://api-testnet.bybit.com');
		});

		it('should default to mainnet for unknown environment', () => {
			expect(getBaseUrl('production')).toBe('https://api.bybit.com');
		});
	});

	describe('Error Code Mapping', () => {
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

		function getErrorMessage(retCode: number, defaultMessage: string): string {
			return errorMessages[retCode] || defaultMessage;
		}

		it('should return correct message for known error codes', () => {
			expect(getErrorMessage(10001, 'Unknown')).toBe('Request parameter error');
			expect(getErrorMessage(10004, 'Unknown')).toBe('Signature error');
			expect(getErrorMessage(110004, 'Unknown')).toBe('Insufficient wallet balance');
		});

		it('should return default message for unknown error codes', () => {
			expect(getErrorMessage(99999, 'Unknown error')).toBe('Unknown error');
		});
	});
});
