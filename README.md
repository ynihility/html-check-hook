# html-check-hook

単一HTMLファイルのゲームやツールを Claude Code で編集するときに、`<script>` の構文エラーをその場で見つけるための小さな仕組みです。

- **check.mjs**：HTML内のインラインJSを取り出して、Node.js の `--check` で構文だけを確認します。依存ライブラリはありません。
- **html-postcheck.mjs**：Claude Code の PostToolUse フックです。Claude が `.html` を編集・作成するたびに、同じフォルダにある `check.mjs` を自動で実行し、PASS / FAIL を Claude に返します。

Claude が壊れたコードを書いても、次の手を打つ前に本人（Claude）が気づいて直せるようになります。

## 動作環境

- Node.js 18 以上（ESM と top-level await を使用）
- Claude Code

## 使い方

### 1. 手動で確認する

```
node check.mjs index.html
```

| 終了コード | 意味 |
|---|---|
| 0 | インラインJSがすべて構文OK（PASS） |
| 1 | 構文エラーあり、またはチェック対象のJSが0件（FAIL） |
| 2 | 引数なし、またはファイルを読めない |

エラーがあると、HTMLの何行目あたりかを表示します。

### 2. Claude Code で自動実行する

1. `hooks/html-postcheck.mjs` を `~/.claude/hooks/` にコピーします。
2. `examples/settings.example.json` の `hooks` の部分を、`~/.claude/settings.json` に追記します（すでに `hooks` がある場合は `PostToolUse` の配列に足してください）。
3. チェックしたいHTMLと同じフォルダに `check.mjs` を置きます。

フックが動かない場合は、`command` の `$HOME/.claude/hooks/html-postcheck.mjs` を、自分の環境の絶対パスに書き換えてください。

`check.mjs` が置かれていないフォルダや、`.html` 以外のファイルでは何もしません。

## わかること・わからないこと

- わかるのは「JSの構文が壊れていないか」だけです。ゲームが正しく動くか、楽しいかは判定しません。動作は必ず自分の目で確認してください。
- HTMLは正規表現で読み取っているため、文字列の中に `</script>` を含むような書き方には対応していません。
- `src` 付きの外部スクリプトや、`type="application/json"` などJS以外のブロックは対象外です。

## 使用例

このフックは、ブラウザで遊べる単一HTMLの育成ゲーム [やみだまり](https://github.com/ynihility/yamidamari)（約9,400行）の開発で使っています。

## ライセンス

MIT
