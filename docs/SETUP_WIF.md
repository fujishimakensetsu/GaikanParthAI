# Workload Identity Federation 設定ガイド

GitHub ActionsからGoogle Cloud Runへ、サービスアカウントキーを使わずにデプロイするための設定手順です。

## 前提条件

- Google Cloud CLIがインストールされていること
- GCPプロジェクトの管理者権限があること

## 1. 環境変数の設定

### Windows (PowerShell) の場合

```powershell
# あなたのGCPプロジェクトIDに置き換えてください
$env:PROJECT_ID = "your-gcp-project-id"

# GitHubのリポジトリ情報に置き換えてください
$env:GITHUB_ORG = "your-github-username-or-org"
$env:GITHUB_REPO = "your-repo-name"
```

### Mac/Linux (bash) の場合

```bash
# あなたのGCPプロジェクトIDに置き換えてください
export PROJECT_ID="your-gcp-project-id"

# GitHubのリポジトリ情報に置き換えてください
export GITHUB_ORG="your-github-username-or-org"
export GITHUB_REPO="your-repo-name"
```

## 2. 必要なAPIを有効化

```bash
gcloud services enable iamcredentials.googleapis.com --project="${PROJECT_ID}"
gcloud services enable cloudresourcemanager.googleapis.com --project="${PROJECT_ID}"
gcloud services enable run.googleapis.com --project="${PROJECT_ID}"
gcloud services enable artifactregistry.googleapis.com --project="${PROJECT_ID}"
```

## 3. サービスアカウントの作成

```bash
gcloud iam service-accounts create github-actions-deploy \
    --display-name="GitHub Actions Deploy" \
    --project="${PROJECT_ID}"
```

## 4. サービスアカウントに必要な権限を付与

```bash
# Cloud Run 管理者
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Artifact Registry 書き込み権限
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

# サービスアカウントユーザー（Cloud Run デプロイ時に必要）
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Storage 管理者（イメージのプッシュに必要）
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

## 5. Workload Identity Pool の作成

```bash
gcloud iam workload-identity-pools create "github-actions-pool" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --project="${PROJECT_ID}"
```

## 6. Workload Identity Provider の作成

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --location="global" \
    --workload-identity-pool="github-actions-pool" \
    --display-name="GitHub Provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == '${GITHUB_ORG}'" \
    --project="${PROJECT_ID}"
```

## 7. サービスアカウントへのアクセス権付与

```bash
gcloud iam service-accounts add-iam-policy-binding \
    "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}" \
    --role="roles/iam.workloadIdentityUser" \
    --project="${PROJECT_ID}"
```

## 8. Artifact Registry リポジトリの作成（未作成の場合）

```bash
gcloud artifacts repositories create gaikan-parth-ai \
    --repository-format=docker \
    --location=asia-northeast1 \
    --description="Docker repository for gaikan-parth-ai" \
    --project="${PROJECT_ID}"
```

## 9. GitHub Secrets の設定

以下のSecretsをGitHubリポジトリに設定してください：

### WIF_PROVIDER
Workload Identity Provider の完全なリソース名を取得：

```bash
echo "projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider"
```

出力例：
```
projects/123456789012/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
```

### WIF_SERVICE_ACCOUNT
```bash
echo "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
```

### GCP_PROJECT_ID
あなたのGCPプロジェクトID

### GEMINI_API_KEY
Gemini APIキー

### APP_PASSWORD
アプリケーションパスワード

## GitHub Secrets の設定場所

1. GitHubリポジトリにアクセス
2. **Settings** > **Secrets and variables** > **Actions**
3. **New repository secret** をクリック
4. 上記の各シークレットを追加

## 動作確認

設定完了後、`main`ブランチにプッシュすると自動的にCloud Runへデプロイされます。

```bash
git add .
git commit -m "Enable Workload Identity Federation"
git push origin main
```

GitHub Actions のログでデプロイ状況を確認してください。

## トラブルシューティング

### 認証エラーが発生する場合

1. Workload Identity Pool/Provider が正しく作成されているか確認：
```bash
gcloud iam workload-identity-pools list --location="global" --project="${PROJECT_ID}"
gcloud iam workload-identity-pools providers list \
    --workload-identity-pool="github-actions-pool" \
    --location="global" \
    --project="${PROJECT_ID}"
```

2. サービスアカウントのIAMポリシーを確認：
```bash
gcloud iam service-accounts get-iam-policy \
    "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project="${PROJECT_ID}"
```

### Artifact Registry へのプッシュが失敗する場合

リポジトリが存在するか確認：
```bash
gcloud artifacts repositories list --location=asia-northeast1 --project="${PROJECT_ID}"
```

### Cloud Run へのデプロイが失敗する場合

サービスアカウントの権限を確認：
```bash
gcloud projects get-iam-policy "${PROJECT_ID}" \
    --flatten="bindings[].members" \
    --format='table(bindings.role)' \
    --filter="bindings.members:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
```
