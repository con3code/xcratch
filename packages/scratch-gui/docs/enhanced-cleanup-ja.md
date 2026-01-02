# 拡張クリーンアップ機能

本機能は、[ScratchAddons editor-cleanup-plus](https://github.com/ScratchAddons/ScratchAddons/blob/master/addons/editor-cleanup-plus/userscript.js) アドオンに触発された、Scratchワークスペースのデフォルトクリーンアップ機能を拡張するものです。

## 概要

ワークスペース上のブロックを整理する際、従来の単一カラムレイアウトではなく、複数のカラムに分けて配置することで、より見やすく使いやすいレイアウトを実現します。

## 主な機能

### ブロック配置の改善

- **カラムベースレイアウト**: ブロックを単一カラムではなく、X座標の近さ（256px以内）で自動的に複数の縦カラムに整理
- **孤立ブロックの優先配置**: 値を返すブロック（`outputConnection` を持つブロック）を最初のカラムに配置
- **スマートグルーピング**: ユーザーが配置したブロックのグループ（カラム）を保持
- **カラム内ソート**: 各カラム内のブロックをY座標で自動的にソート
- **グリッド配置**: ワークスペースのグリッドに合わせてブロックをスナップ
- **コメント対応**: ブロックに付随するコメントの幅も考慮した配置
- **スムーズアニメーション**: ブロック移動時のスムーズなアニメーション効果

### 孤立ブロックの処理

- **自動分離**: `outputConnection` を持つブロック（値を返すブロック）は孤立ブロックとして分類
- **最前列配置**: 孤立ブロックは最初のカラム（一番左）に配置
- **視覚的な区別**: 通常のスクリプトブロックと分離されるため、注意が必要なブロックを簡単に識別可能

### ワークスペースコメント

- **自動配置**: ワークスペースコメントを最適な位置に自動配置

### アニメーション機能

- **スムーズトランジション**: CSS transitionを使用した滑らかなブロック移動
- **順次アニメーション**: ブロックを一つずつ順番にアニメーション
- **カスタマイズ可能な遅延**: アニメーション間の遅延を設定可能
- **フォールバック対応**: アニメーションに失敗した場合は即座に移動

## 実装構成

拡張機能は以下の3つのファイルで構成されています。

### 1. `cleanup-utils.js`

コアとなるユーティリティ関数群:

- `autoPositionComment()` - コメントの `autoPosition_()` メソッドを使って自動配置
- `getOrderedTopBlockColumns()` - ブロックをX座標でグループ化し、カラムに整理
  - 256px以内のX座標を持つブロックを同じカラムにグループ化
  - 孤立ブロック（`outputConnection` を持つブロック）を分離
  - 各カラムをX座標でソート、カラム内のブロックをY座標でソート
- `animateBlockMove()` - ブロック移動のアニメーション処理
  - CSS transitionを使用した滑らかな移動
  - 300msのアニメーション時間
  - アニメーション完了後にPromiseを解決
- `positionComments()` - ワークスペースコメントを自動配置
- `enhancedCleanUp()` - メインのクリーンアップ処理を統括
  - アニメーションの有効/無効を制御
  - ブロック移動を順次実行

### 2. `enhanced-cleanup.js`

統合レイヤー:

- `installEnhancedCleanup()` - デフォルトの `WorkspaceSvg.prototype.cleanUp` メソッドを上書き
- エラー時の元のクリーンアップへのフォールバック機能
- 元の状態に復元する機能を提供

### 3. `blocks.js` (変更)

- ScratchBlocksの初期化時に拡張クリーンアップをインポートしてインストール
- オプション（ソート等）の設定

## 設定オプション

`installEnhancedCleanup()` 呼び出し時に設定可能:

```javascript
installEnhancedCleanup(Scrat  // 拡張クリーンアップの有効化/無効化
});
```

現在の実装では、`getOrderedTopBlockColumns(true, workspace)` が内部的に呼ばれ、常に孤立ブロックを分離します。
```

## 動作原理

1. **ブロック分析**: ワークスペース上のすべてのトップレベルブロックをスキャン
2. **孤立ブロックの識別**: `outputConnection` を持つブロックを孤立ブロックとして分類
3. **カラムグルーピング**: X座標の近いブロック（256px以内）を同じカラムにグループ化
4. **カラム内ソート**: 各カラム内でブロックをY座標でソート
5. **幅の計算**: コメントを含む各ブロックの幅を測定し、適切な間隔を確保
6. **カラムレイアウト**: 適切な間隔でブロックを縦カラムに配置（孤立ブロックは最初）
7. **グリッドスナップ**: すべてのブロックをワークスペースのグリッドに整列
8. **コメント配置**: ワークスペースコメントを自動配置

## 技術仕様

### ブロックの分類基準

**孤立ブロック（Orphan Block）** として識別される条件:
- ブロックが `outputConnection` を持つ（値を返すブロック）
- これらのブロックは最初のカラムに配置される

**通常のブロック**:
- `outputConnection` を持たないブロック
- X座標の近さ（256px以内）でカラムにグループ化される

### カラムグルーピングアルゴリズム

```javascript
const TOLERANCE = 256; // X座標の許容範囲（ピクセル）

// 各ブロックについて
for (const topBlock of topBlocks) {
    const position = topBlock.getRelativeToSurfaceXY();
    
    // 最も近いカラムを探す
    for (const col of cols) {
        const err = Math.abs(position.x - col.x);
        if (err < TOLERANCE && err < bestError) {
            bestError = err;
            bestCol = col;
        }
    }
    
    if (bestCol) {
        // 既存のカラムに追加し、平均X座標を更新
        bestCol.x = ((bestCol.x * bestCol.count) + position.x) / ++bestCol.count;
        bestCol.blocks.push(topBlock);
    } else {
        // 新しいカラムを作成
        cols.push(new Col(position.x, 1, [topBlock]));
    }
}
```

この方法により、ユーザーが意図的に配置したブロックのグループ（カラム）を保持しながら整理できます。

### レイアウトアルゴリズム

1. **グリッドサイズの取得**: `workspace.getGrid().spacing_` からグリッド間隔を取得（デフォルト: 20px）
2. **初期カーソル位置**: `(gridSize / 2, gridSize / 2)` から開始
3. **カラム間の間隔**: 各カラムの最大幅 + グリッドサイズ
4. **ブロック間の間隔**: ブロックの高さ + グリッドサイズ
5. **グリッドスナップ**: `position += gridSize - ((position + gridSize/2) % gridSize)` で計算

### コメントの自動配置

コメントの `autoPosition_` メソッドを使用して自動配置:

```javascript
export const autoPositionComment = comment => {
    if (typeof comment.autoPosition_ === 'function') {
        comment.needsAutoPositioning_ = true;
        comment.autoPosition_();
        comment.needsAutoPositioning_ = false;
    }
};
```

## 互換性

- **node_modulesの変更なし**: すべてのコードはscratch-editorリポジトリ内に配置
- **フォールバック対応**: エラー時は元のクリーンアップにフォールバック
- **アンドゥ対応**: Blocklyのイベントグルーピングを使用し、適切なアンドゥ/リドゥを実現
- **パフォーマンス**: クリーンアップ中はリサイズイベントを無効化

## 使用方法

拡張クリーンアップはScratch blocksの読み込み時に自動的に有効化されます。ユーザーは以下の方法でトリガーできます:

- コードを右クリックして「きれいにする」を選択

## 従来のクリーンアップとの違い

### 従来のクリーンアップ
- 単一の縦カラム
- ユーザーの配置意図を無視

### 拡張クリーンアップ
- X座標に基づく複数の縦カラム（256px以内でグループ化）
- 孤立ブロック（値を返すブロック）を最初のカラムに配置
- ユーザーが配置したブロックのグループ構造を保持
- 各カラム内でY座標ム
- ハットブロックと孤立ブロックの分離
- ブロック関係に基づくスマート配置
- コメントの適切な処理
- グリッド整列された間隔

## パフォーマンス最適化

クリーンアップ処理中のパフォーマンス最適化:

```javascript
// リサイズイベントを一時的に無効化
const wasResizeEnabled = this.resizesEnabled_;
this.setResizesEnabled(false);

// イベントのグルーピング
if (ScratchBlocks.Events.isEnabled()) {
    ScratchBlocks.Events.setGroup(true);
}

try {
    // クリーンアップ処理
} finally {
    // 元の状態に戻す
    if (ScratchBlocks.Events.isEnabled()) {
        ScratchBlocks.Events.setGroup(false);
    }
    this.setResizesEnabled(wasResizeEnabled);
}
```

## エラーハンドリング

エラー発生時の動作:

1. エラーをログに記録（`log.error`を使用）
2. 元のクリーンアップ関数にフォールバック
3. リサイズイベントとイベントグルーピングを適切に復元

```javascript
try {
    const success = enhancedCleanUp(this, options);
    if (!success) {
        log.warn('Enhanced cleanup failed, falling back to original');
        originalCleanUp.call(this);
    }
} finally {
    // クリーンアップ処理
}
```

## 無効化方法

拡張クリーンアップを無効化し、元のクリーンアップに戻す場合:

```javascript
// 元のクリーンアップを復元
const result = installEnhancedCleanup(ScratchBlocks, options);
if (result) {
    result.restore();
}
```

## 参考資料

- [ScratchAddons editor-cleanup-plus](https://github.com/ScratchAddons/ScratchAddons/tree/master/addons/editor-cleanup-plus)
- [Scratch Blocks GitHub](https://github.com/scratchfoundation/scratch-blocks)
- [Blockly Developer Documentation](https://developers.google.com/blockly)

## 変更履歴

### 2025-12-30
- 初回実装
- ScratchAddons editor-cleanup-plusをベースに機能実装
- node_modulesの変更を回避し、scratch-editor内で完結する実装- カラムベースのレイアウトアルゴリズム実装
- 孤立ブロックの自動分離機能
- アニメーション機能の追加
  - CSS transitionを使用したスムーズな移動
  - 順次アニメーション実行
  - カスタマイズ可能な遅延時間- 日本語ドキュメントの作成

## ライセンス

本拡張機能は、元となったScratchAddons editor-cleanup-plusの設計思想を参考にしていますが、
scratch-editorプロジェクトのライセンスに従います。

## クレジット

本機能は [Scratch Addons](https://github.com/ScratchAddons/ScratchAddons) チームの
[editor-cleanup-plus addon](https://github.com/ScratchAddons/ScratchAddons/tree/master/addons/editor-cleanup-plus)
に基づいています。
