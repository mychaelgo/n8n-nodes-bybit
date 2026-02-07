# n8n-nodes-bybit

> [mychaelgo Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from mychaelgo.
>
> For licensing information, visit https://github.com/mychaelgo.

A comprehensive n8n community node for **Bybit** cryptocurrency exchange, providing full integration with the Bybit V5 unified API for spot trading, derivatives (USDT perpetuals, inverse perpetuals), options, and more.

![n8n](https://img.shields.io/badge/n8n-community_node-ff6d5a)
![Bybit](https://img.shields.io/badge/Bybit-V5_API-F7A600)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **11 Resource Categories** with 100+ operations
- **Unified Trading Account (UTA)** support
- **All Product Types**: Spot, Linear (USDT/USDC perpetuals), Inverse, Options
- **Complete Trading Operations**: Place, amend, cancel orders (single and batch)
- **Position Management**: Leverage, margin modes, TP/SL, trailing stops
- **Asset Management**: Transfers, deposits, withdrawals
- **Sub-Account Support**: Create and manage sub-accounts and API keys
- **Leveraged Tokens**: Purchase and redeem leveraged tokens
- **Institutional Lending**: Loan and repayment operations
- **Poll-Based Triggers**: 10 trigger types for automation
- **Testnet Support**: Full testnet integration for development

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes** in n8n
2. Select **Install**
3. Enter `n8n-nodes-bybit`
4. Agree to the risks and click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Clone or extract the node package
npm install n8n-nodes-bybit
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/mychaelgo/n8n-nodes-bybit.git
cd n8n-nodes-bybit

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-bybit

# Restart n8n
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Bybit API key | Yes |
| API Secret | Your Bybit API secret | Yes |
| Environment | `mainnet` or `testnet` | Yes |
| Receive Window | Request validity window (ms), default: 5000 | No |

### Getting API Keys

1. Log in to [Bybit](https://www.bybit.com) or [Bybit Testnet](https://testnet.bybit.com)
2. Go to **Account & Security** > **API Management**
3. Create a new API key with required permissions
4. Enable IP whitelisting for security (recommended)

## Resources & Operations

### Market Data
- Get kline (candlestick) data
- Get mark price, index price, premium index klines
- Get instruments info
- Get orderbook depth
- Get tickers
- Get funding rate history
- Get public trading history
- Get open interest
- Get historical volatility (options)
- Get insurance fund data
- Get risk limits
- Get delivery price
- Get long/short ratio
- Get server time

### Trade
- Place order (with TP/SL support)
- Amend order
- Cancel order
- Cancel all orders
- Get open orders
- Get order history
- Get trade history
- Batch place/amend/cancel orders (up to 10)
- Get spot borrow check
- Set disconnect cancel all (DCP)

### Position (Derivatives)
- Get position info
- Set leverage
- Switch margin mode (cross/isolated)
- Set TP/SL mode
- Switch position mode (one-way/hedge)
- Set risk limit
- Set trading stop (TP/SL/trailing)
- Set auto add margin
- Add/reduce margin
- Get closed PnL
- Move positions

### Account
- Get wallet balance
- Get account info
- Upgrade to Unified Account
- Get borrow/repay history
- Get collateral info
- Get coin Greeks (options)
- Get fee rates
- Get transaction log
- Set margin mode
- Set spot hedging
- Set collateral switch

### Asset
- Get delivery/settlement records
- Get coin exchange records
- Get all coins balance
- Internal transfers
- Universal transfers
- Get deposit records
- Get deposit address
- Get coin info
- Withdraw funds
- Cancel withdrawal

### User (Sub-Accounts)
- Create sub-account
- Create/modify/delete API keys
- Freeze/unfreeze sub-account
- Get API key info
- Get affiliate user info

### Spot Leverage Token
- Get leveraged token info
- Get market info
- Purchase tokens
- Redeem tokens
- Get purchase/redeem records

### Spot Margin (UTA)
- Get VIP margin data
- Toggle margin trade
- Set leverage
- Get margin state

### Institutional Lending
- Get product info
- Get margin coin info
- Get loan/repay orders
- Get LTV info
- Bind/unbind UID

### Pre-Upgrade Data
- Get pre-upgrade order history
- Get pre-upgrade trade history
- Get pre-upgrade closed PnL
- Get pre-upgrade transactions
- Get pre-upgrade option delivery

### Utility
- Get server time
- Get announcements

## Trigger Node

The Bybit Trigger node supports poll-based automation:

| Trigger Type | Description |
|--------------|-------------|
| New Order | Trigger when a new order is created |
| Order Filled | Trigger when an order is filled |
| Order Canceled | Trigger when an order is canceled |
| Position Opened | Trigger when a new position is opened |
| Position Closed | Trigger when a position is closed |
| Price Alert | Trigger when price crosses threshold |
| Funding Rate Alert | Trigger on funding rate threshold |
| Liquidation Alert | Trigger when near liquidation |
| Balance Changed | Trigger on balance change |
| PnL Threshold | Trigger when PnL exceeds threshold |

## Usage Examples

### Place a Market Order

```javascript
// Node configuration
Resource: Trade
Operation: Place Order
Category: linear
Symbol: BTCUSDT
Side: Buy
Order Type: Market
Quantity: 0.001
```

### Get Account Balance

```javascript
// Node configuration
Resource: Account
Operation: Get Wallet Balance
Account Type: UNIFIED
Coin: USDT
```

### Set Position Leverage

```javascript
// Node configuration
Resource: Position
Operation: Set Leverage
Category: linear
Symbol: BTCUSDT
Buy Leverage: 10
Sell Leverage: 10
```

## Bybit Concepts

| Concept | Description |
|---------|-------------|
| Category | Product type: `spot`, `linear`, `inverse`, `option` |
| UTA | Unified Trading Account - single account for all products |
| Position Mode | One-way (single position) or Hedge (long/short separate) |
| Margin Mode | Cross (shared margin) or Isolated (per-position margin) |
| DCP | Disconnect Cancel Protection - auto-cancel on disconnect |
| Position Idx | 0=one-way, 1=hedge buy, 2=hedge sell |

## Networks

| Network | REST API | Use Case |
|---------|----------|----------|
| Mainnet | https://api.bybit.com | Production trading |
| Testnet | https://api-testnet.bybit.com | Development & testing |

## Error Handling

The node includes comprehensive error handling for Bybit API error codes:

- `10001` - Parameter error
- `10002` - Request timeout
- `10003` - Server busy
- `10004` - Invalid sign
- `10005` - Permission denied
- `110001` - Order not found
- `110007` - Insufficient balance
- `110012` - Insufficient available balance
- And many more...

## Security Best Practices

1. **API Key Permissions**: Only enable required permissions
2. **IP Whitelisting**: Restrict API access to known IPs
3. **Testnet First**: Test workflows on testnet before production
4. **Secure Storage**: Use n8n's credential encryption
5. **Monitor Activity**: Regularly review API key usage

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format
```

## Author

**mychaelgo**
- GitHub: [mychaelgo](https://github.com/mychaelgo)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**https://github.com/mychaelgo**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- **Documentation**: [Bybit V5 API Docs](https://bybit-exchange.github.io/docs/v5/intro)
- **Issues**: [GitHub Issues](https://github.com/mychaelgo/n8n-nodes-bybit/issues)

## Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [Bybit](https://bybit.com) - Cryptocurrency exchange
- The open-source community

---

**Disclaimer**: This node is not officially affiliated with Bybit. Use at your own risk. Always test on testnet first and never risk more than you can afford to lose.
