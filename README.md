# BarShift Pro 🍸

バー・飲食店向け PWA シフト管理アプリ。

| フロントエンド | バックエンド | DB |
|---|---|---|
| Vercel | Render | Neon (PostgreSQL) |

---

## デプロイ手順

### 1. Neon DB（無料）

1. [neon.tech](https://neon.tech) でアカウント作成
2. **New Project** → プロジェクト名: `barshift`
3. **Connection string** をコピー（`postgresql://...`）

---

### 2. Render（バックエンド・無料）

1. [render.com](https://render.com) でアカウント作成
2. **New** → **Web Service** → GitHubリポジトリを接続
3. 設定:

| 項目 | 値 |
|---|---|
| Root Directory | `server` |
| Environment | `Node` |
| Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `node index.js` |

4. **Environment Variables** を追加:

| キー | 値 |
|---|---|
| `DATABASE_URL` | Neonのconnection string |
| `JWT_SECRET` | ランダムな長い文字列（例: `openssl rand -hex 32` の出力）|
| `CLIENT_URL` | VercelのURL（後で追加）|
| `NODE_ENV` | `production` |

5. **Deploy** → デプロイ完了後、URLをメモ（例: `https://barshift-api.onrender.com`）

6. シードデータ投入（Renderの Shell タブで）:
```bash
node prisma/seed.js
```

---

### 3. Vercel（フロントエンド・無料）

1. [vercel.com](https://vercel.com) でアカウント作成
2. **New Project** → GitHubリポジトリを接続
3. 設定:

| 項目 | 値 |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `.`（ルート）|
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. **Environment Variables** を追加:

| キー | 値 |
|---|---|
| `VITE_API_URL` | RenderのURL（例: `https://barshift-api.onrender.com`）|
| `VITE_STORE_ID` | `store-demo` |

5. **Deploy**

---

### 4. 最終設定

VercelのURLが確定したら、RenderのEnvironment Variablesで:
- `CLIENT_URL` = VercelのURL（例: `https://barshift.vercel.app`）

を更新して **Manual Deploy** で再デプロイ。

---

## デモアカウント

| スタッフ | PIN | 権限 |
|---|---|---|
| 田中 花子 | `1111` | 管理者 |
| 鈴木 健太 | `2222` | スタッフ |
| 佐藤 めぐみ | `3333` | スタッフ |
| 山田 大輝 | `4444` | スタッフ |
| 伊藤 結衣 | `5555` | スタッフ |
| 渡辺 翔 | `6666` | スタッフ |

---

## ローカル開発

```bash
# フロントエンド
npm install
cp .env.example .env.local
# VITE_API_URL=http://localhost:3001 に設定
npm run dev

# バックエンド
cd server
npm install
cp .env.example .env
# DATABASE_URL を設定
npx prisma migrate dev --name init
node prisma/seed.js
node index.js
```

---

## 機能一覧

- 🕐 **打刻** — 出勤・退勤をPIN認証後に記録
- 📅 **シフト確認** — 月間シフト表を全スタッフ分で表示
- 📝 **希望提出** — カレンダーでOK/NGを選択して提出
- 👤 **マイページ** — PIN変更・プロフィール確認
- 🔧 **シフト管理** — 管理者がシフト作成・希望を一括反映
- 👥 **スタッフ管理** — 追加・編集・削除
- 📊 **実績集計** — 労働時間・深夜手当・人件費を集計
- 📲 **PWA** — ホーム画面追加・オフライン対応
