# Publishing to npm

This repo uses GitHub Actions to automatically publish to npm when you create a release. Users can then install the node directly from n8n's Community Nodes (Settings > Community Nodes > Install).

## One-time setup

### 1. Create an npm account

Sign up at [npmjs.com](https://www.npmjs.com/signup) if you don't have one.

### 2. Create an npm access token

1. Log in to npm
2. Go to **Access Tokens** (profile menu > Access Tokens)
3. **Generate New Token** > **Classic Token**
4. Choose **Automation** (for CI/CD)
5. Copy the token

### 3. Add the token to GitHub

1. Go to your repo: **Settings** > **Secrets and variables** > **Actions**
2. **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: paste your npm token
5. Save

### 4. Publish

1. Update the version in `package.json` if needed
2. Commit and push
3. Create a **Release** on GitHub: **Releases** > **Create a new release**
4. Create a tag (e.g. `v1.0.0`)
5. Publish the release

The GitHub Action will run automatically and publish to npm.

## User installation

After publishing, users can install in n8n:

- **Community Nodes UI**: Enter `@mychaelgo/n8n-nodes-bybit`
- **Manual**: `npm install @mychaelgo/n8n-nodes-bybit` in `~/.n8n/nodes`
