# 🚀 クイックスタートガイド

AI株式診断サービスを最速で起動する方法を説明します。

---

## ⚠️ 重要な前提条件

**Node.js v22.5.0 以上が必須です！**

```bash
node --version  # v22.5.0+ を確認してください
```

Node.js 原生 SQLite を使用するため、この要件は必須です。

---

## ⚡ 最速起動（本番環境モード）

### 一つのコマンドで完結！

```bash
npm start
```

このコマンドは以下を自動実行します：
- ✅ フロントエンドのビルド
- ✅ バックエンドサーバーの起動
- ✅ 静的ファイルの配信
- ✅ 全APIエンドポイントの提供

**アクセス:** http://localhost:3001

**特徴:**
- 一つのポート（3001）だけで完結
- CORSの問題なし
- 本番環境と同じ構成
- デプロイ前のテストに最適

---

## 💻 開発モード（ホットリロード対応）

コードを編集しながら開発する場合：

```bash
npm run dev:all
```

**アクセス:**
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3001

**特徴:**
- ホットリロード対応
- ソースマップ有効
- 開発ツール使用可能
- デバッグに最適

**個別起動も可能:**

```bash
# バックエンドのみ
npm run server

# フロントエンドのみ
npm run dev
```

---

## 📋 全コマンド一覧

| コマンド | 用途 | ポート | 説明 |
|---------|------|--------|------|
| `npm start` | **本番環境** | 3001 | ビルド + サーバー起動（推奨） |
| `npm run start:prod` | 本番環境 | 3001 | サーバーのみ起動（要ビルド済み） |
| `npm run dev:all` | 開発環境 | 5173, 3001 | 前後端同時起動 + ホットリロード |
| `npm run dev` | 開発環境 | 5173 | フロントエンドのみ |
| `npm run server` | 開発環境 | 3001 | バックエンドのみ |
| `npm run build` | ビルド | - | フロントエンドビルドのみ |

---

## 🎯 モード比較

| 項目 | 本番モード | 開発モード |
|------|-----------|-----------|
| コマンド | `npm start` | `npm run dev:all` |
| ポート | 3001（一つ） | 5173 + 3001 |
| ビルド | 必要 | 不要 |
| ホットリロード | ❌ | ✅ |
| パフォーマンス | 高速 | 標準 |
| 用途 | テスト・デプロイ | 開発・デバッグ |

---

## 🔧 環境設定

`.env` ファイルを編集：

```env
# API設定
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key
API_PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**注意事項:**
- データベースは Node.js 原生 SQLite を使用（自動で `server/database/stock-diagnosis.db` に作成）
- Supabase は使用していません
- 本番モード: `VITE_API_URL` は不要（同じサーバーで配信）
- 開発モード: `VITE_API_URL=http://localhost:3001` が必要

---

## ✅ 起動確認

### 本番モードの確認

```bash
# ヘルスチェック
curl http://localhost:3001/health
```

**期待される出力:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T13:30:00.000Z",
  "environment": "production"
}
```

**ブラウザでアクセス:**
- アプリケーション: http://localhost:3001
- 特定銘柄: http://localhost:3001/?code=7203

### 開発モードの確認

**ブラウザでアクセス:**
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3001/health
- 特定銘柄: http://localhost:5173/?code=7203

## ⚠️ トラブルシューティング

### ポートが使用中

**3001ポートが使用されている場合:**

```bash
# Mac/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

または `.env` でポートを変更:
```env
API_PORT=3002
```

### "Failed to fetch" エラー

1. バックエンドが起動しているか確認:
```bash
curl http://localhost:3001/health
```

2. `.env` の設定を確認:
```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_key
```

3. サーバーを再起動

### ビルドエラー

```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📦 デプロイ前チェックリスト

- [ ] Node.js v22.5.0 以上がインストールされている
- [ ] `npm run build` が成功する
- [ ] `npm start` で起動できる
- [ ] http://localhost:3001 でアプリが表示される
- [ ] `/health` エンドポイントが正常に応答する
- [ ] `.env` に本番用の環境変数が設定されている
- [ ] SQLite データベースが正常に作成される (`server/database/stock-diagnosis.db`)
- [ ] Gemini API Keyが有効である
- [ ] 銘柄検索とAI診断が正常に動作する
- [ ] 管理者ログインが正常に動作する（adsadmin / Mm123567）

---

## 🎉 成功確認

`npm start` 実行後、以下が表示されれば成功です:

```
Database schema initialized successfully
(node:xxx) ExperimentalWarning: SQLite is an experimental feature and might change at any time
Initial admin user created: adsadmin
🚀 Server running on http://localhost:3001
📊 Stock API: http://localhost:3001/api/stock
🤖 Gemini API: http://localhost:3001/api/gemini
🌍 Environment: production
📦 Serving static files from: /path/to/dist
✨ Frontend available at: http://localhost:3001
```

**注意**: `ExperimentalWarning` は正常な動作です（Node.js 原生 SQLite が実験的機能のため）

ブラウザで http://localhost:3001 を開いてください!
