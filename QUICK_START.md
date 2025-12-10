# ⚡ クイックリファレンス

## ⚠️ 重要な要件

**Node.js v22.5.0 以上が必須です！**

```bash
node --version  # v22.5.0+ を確認
```

---

## 最速起動

```bash
npm start
```

→ http://localhost:3001

---

## コマンド

```bash
npm start          # 本番環境（ビルド込み）
npm run start:prod # 本番環境（ビルド済み）
npm run dev:all    # 開発環境
npm run build      # ビルドのみ
```

---

## ポート

| モード | ポート | URL |
|--------|--------|-----|
| 本番 | 3001 | http://localhost:3001 |
| 開発 | 5173, 3001 | http://localhost:5173 |

---

## 環境変数 (.env)

```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_key
API_PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**注意**: Supabase は使用していません（Node.js 原生 SQLite を使用）

---

## トラブルシュート

**ポートエラー:**
```bash
lsof -ti:3001 | xargs kill -9
```

**ビルドエラー:**
```bash
npm install
npm start
```

---

詳細は `STARTUP_GUIDE.md` を参照
