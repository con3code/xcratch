# Xcratch 変更履歴

## コミット e7565a720ecf766fad3662768387eff3a4be2a66 以降の変更

### 新機能 (Features)

#### 1. **拡張機能ローダー (Extension Loader)**
- **コミット**: 32ea155fa, fa0da7b09, 71fa8a5c5, e9a7a456b
- **説明**:
  - 拡張機能を動的にロードする機能を実装
  - タグとカテゴリによる拡張機能の分類機能
  - 拡張機能の検索機能
  - プリロード機能の実装
- **関連ファイル**:
  - `packages/scratch-gui/src/containers/extension-library.jsx`
  - `packages/scratch-gui/src/lib/libraries/extensions/extensionLoader/`
  - `packages/scratch-gui/scripts/preload.mjs`
  - `packages/scratch-gui/scripts/preload-rules.json`
  - `packages/scratch-vm/src/extension-support/extension-manager.js`

#### 2. **PWA (Progressive Web App) サポート**
- **コミット**: e0ac47b5a
- **説明**:
  - Service Worker による PWA サポート
  - アセットマニフェストの生成
  - オフライン対応
- **関連ファイル**:
  - `packages/scratch-gui/scripts/makePWAAssetsManifest.js`
  - `packages/scratch-gui/static/pwa-icon.png`
  - `packages/scratch-gui/static/pwa-maskable_icon.png`
  - `packages/scratch-gui/src/playground/index.ejs`

#### 3. **Web Bluetooth API 実装**
- **コミット**: de49d4027
- **説明**:
  - Web Bluetooth API を使用したデバイス接続機能
  - BLE デバイスとの通信サポート
- **関連ファイル**:
  - `packages/scratch-vm/src/io/ble-web.js`
  - `packages/scratch-vm/src/io/ble.js`

#### 4. **ローカルバックパック実装**
- **コミット**: e3cab835a
- **説明**:
  - `localStorage` を使用したバックパック機能
  - ローカルストレージへのブロック・スプライト保存
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/backpack-api.js`
  - `packages/scratch-gui/src/containers/backpack.jsx`

#### 5. **URL からのプロジェクト読み込み**
- **コミット**: be00941be, 1f395f75e
- **説明**:
  - URL パラメータからプロジェクトデータを取得
  - ハッシュパラメータを使用したプロジェクト読み込みサポート
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/hash-parser-hoc.jsx`
  - `packages/scratch-gui/src/lib/vm-manager-hoc.jsx`

#### 6. **コード クリーンアップ機能強化**
- **コミット**: 1a22c126e
- **説明**:
  - コード整理のために「きれいにする」機能を強化
  - アニメーションによる視覚的フィードバックの追加
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/enhanced-cleanup.js`
  - `packages/scratch-gui/src/lib/cleanup-utils.js`
  - `packages/scratch-gui/docs/enhanced-cleanup-ja.md` (ドキュメント)

#### 7. **ブロックパレットの改善**
- **コミット**: 4ee346386
- **説明**:
  - マウスオーバー時にブロック全体の形状を表示
  - ユーザビリティの向上
- **関連ファイル**:
  - `packages/scratch-gui/src/components/blocks/blocks.css`

#### 8. **制御文字列のサポート**
- **コミット**: 036a194a1
- **説明**:
  - 'say'、'think'、'equal' ブロックで `\n`、`\t` を受け入れ
  - 改行とタブの制御文字サポート
- **関連ファイル**:
  - `packages/scratch-vm/src/blocks/scratch3_looks.js`

#### 9. **全角数字の変換サポート**
- **コミット**: bc916e072
- **説明**:
  - 全角文字を数値にキャストする機能
  - 日本語入力の改善
- **関連ファイル**:
  - `packages/scratch-vm/src/util/cast.js`

#### 10. **プレイヤーコンポーネントの改善**
- **コミット**: 4bf701739
- **説明**:
  - エディタを開く機能
  - isFullScreen プロパティの追加
- **関連ファイル**:
  - `packages/scratch-gui/src/playground/player.jsx`

### UI/UX の改善

#### 1. **Xcratch ブランディング**
- **コミット**: 91cc6f7fe
- **説明**:
  - ロゴ画像の更新
  - Xcratch ウェブサイトへのリンク更新
- **関連ファイル**:
  - `packages/scratch-gui/src/components/menu-bar/scratch-logo.svg`

#### 2. **メニューバーの調整**
- **コミット**: c84b62ec7
- **説明**:
  - チュートリアルとデバッグ方法の削除
  - メニューバーのシンプル化
- **関連ファイル**:
  - `packages/scratch-gui/src/components/menu-bar/menu-bar.jsx`

#### 3. **Coming Soon 表示の無効化**
- **コミット**: 3a7e23c44
- **説明**:
  - showComingSoon プロパティを false に設定
- **関連ファイル**:
  - `packages/scratch-gui/src/components/stage-header/stage-header.jsx`

#### 4. **デフォルトプロジェクトのコスチューム変更**
- **コミット**: 9e0506b4b
- **説明**:
  - デフォルトプロジェクトのコスチュームを置き換え
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/default-project/`
  - `packages/scratch-gui/src/lib/default-project/881c5994e99006fc05359d738af66337.svg`
  - `packages/scratch-gui/src/lib/default-project/b6e71f1bf154c8a5470665fe87dd507c.svg`

### ローカライゼーション

#### 1. **日本語ブロック翻訳のカスタマイズ**
- **コミット**: eb5ccef4d
- **説明**:
  - 日本語ロケールの演算子を見やすいシンボルに変更
  - デフォルトメッセージの上書き
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/blocks-override-translations.js`
  - `packages/scratch-gui/src/lib/blocks.js`

#### 2. **欠落翻訳の追加**
- **コミット**: efb686aca
- **説明**:
  - 日本語ロケールの欠落翻訳 (gui.sharedMessages) を追加
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/missing-translations.js`

#### 3. **拡張機能ローダーのカスタム翻訳**
- **コミット**: ce887c8cb
- **説明**:
  - Xcratch 拡張機能ローダーのカスタム翻訳
  - ロケール処理の更新
- **関連ファイル**:
  - `packages/scratch-gui/src/containers/extension-library-translations.js`
  - `packages/scratch-gui/src/lib/libraries/xcratch-category-translations.js`
  - `packages/scratch-gui/src/lib/libraries/xcratch-tag-translations.js`
  - `packages/scratch-gui/src/lib/libraries/extension-tags.js`
  - `packages/scratch-gui/src/lib/libraries/tag-messages.js`
  - `packages/scratch-gui/src/reducers/locales.js`

### バグ修正 (Bug Fixes)

#### 1. **ブロック削除時のコメント処理**
- **コミット**: 9487bf3f4
- **説明**:
  - ブロック削除時に関連コメントも削除
- **関連ファイル**:
  - `packages/scratch-vm/src/engine/blocks.js`

#### 2. **スプライト複製時のコメントコピー**
- **コミット**: 047deefd2
- **説明**:
  - スプライト複製時にコメントもコピー
- **関連ファイル**:
  - `packages/scratch-vm/src/sprites/sprite.js`

#### 3. **コメント位置のドリフト修正**
- **コミット**: a21f593ec
- **説明**:
  - ブロック移動時にコメントも一緒に移動
- **関連ファイル**:
  - `packages/scratch-vm/src/sprites/rendered-target.js`

#### 4. **バックパックでの未サポート画像形式の処理**
- **コミット**: b02207802
- **説明**:
  - バックパックで未サポート画像形式を安全に処理
- **関連ファイル**:
  - `packages/scratch-gui/src/lib/backpack/costume-payload.js`

#### 5. **バックパックでの JPEG 保持**
- **コミット**: 8e8ba7439
- **説明**:
  - バックパックで JPEG 形式を保持

#### 6. **ライブラリからのコスチュームとサウンドの読み込み**
- **コミット**: 6d683342e
- **説明**:
  - ライブラリからコスチュームとサウンドを正しく読み込む
- **関連ファイル**:
  - github `xcratch/scratch-storage`

#### 7. **handleSelect と onCategorySelected のエラー処理改善**
- **コミット**: daf2531e9
- **説明**:
  - エラー処理の改善とリファクタリング
- **関連ファイル**:
  - `packages/scratch-gui/src/containers/extension-library.jsx`
  - `packages/scratch-gui/src/lib/async-modal.jsx`

### 開発環境の改善

#### 1. **VSCode ローカルデバッグ設定**
- **コミット**: 1186eb80f
- **説明**:
  - VSCode のデバッグ設定追加
- **関連ファイル**:
  - `.vscode/launch.json`
  - `.vscode/settings.json`
  - `.vscode/tasks.json`

#### 2. **GitHub Actions ワークフロー**
- **コミット**: b4c07c871
- **説明**:
  - GitHub Pages へのデプロイワークフロー
- **関連ファイル**:
  - `.github/workflows/deploy.yml`

#### 3. **.gitignore の更新**
- **コミット**: 6119927a5
- **説明**:
  - preload ディレクトリを含める
  - 未使用の preload.json を削除
- **関連ファイル**:
  - `.gitignore`
  - `packages/scratch-gui/.gitignore`

#### 4. **Browserslist の更新**
- **説明**:
  - ブラウザサポート対象の更新
- **関連ファイル**:
  - `packages/scratch-gui/.browserslistrc`

#### 5. **Webpack 設定の更新**
- **説明**:
  - PWA サポート、拡張機能ローダーなどのための設定更新
- **関連ファイル**:
  - `packages/scratch-gui/webpack.config.js`

### パッケージ更新

#### 1. **package.json の更新**
- **コミット**: d52918f6c
- **説明**:
  - 依存関係の更新
  - package-lock.json の更新
- **関連ファイル**:
  - `package.json`
  - `package-lock.json`
  - `packages/scratch-gui/package.json`
  - `packages/scratch-render/package.json`
  - `packages/scratch-vm/package.json`

## 主要な変更の概要

Xcratch は、Scratch の機能を大幅に拡張し、以下の主要な改善を行っています:

1. **拡張性の向上**: 拡張機能ローダーにより、動的な拡張機能の読み込みと管理が可能になりました
2. **オフライン対応**: PWA サポートとローカルバックパックにより、オフライン環境での利用が可能になりました
3. **デバイス連携**: Web Bluetooth API により、BLE デバイスとの連携が可能になりました
4. **日本語対応の強化**: カスタム翻訳と全角数字サポートにより、日本語環境での使いやすさが向上しました
5. **ユーザビリティの改善**: UI/UX の改善、バグ修正により、全体的な使い勝手が向上しました

## 統計

- **総コミット数**: 32個（マージコミット除く）
- **変更ファイル数**: 71ファイル
- **追加行数**: 約24,769行
- **削除行数**: 約20,127行
