# 収益モデルとマネタイズ

## ポジショニング

このプラグインは、汎用的なトークン生成ツールとして位置付けるべきではありません。

推奨ポジショニング:

**Framer 向けの忠実なトークンインポート兼監査ツール。**

中核価値:
- 既存の JSON カラートークンを Framer に取り込む
- ソースの意図を保持する
- Framer 内でのトークンのずれを減らす

## 価格設計の考え方

単なるインポーターはマネタイズ力に限界があります。
インポーター + 監査ツールは、継続的な価値がより強くなります。

## マネタイズ案

### 案 1: 買い切り有料プラグイン
向いているケース:
- 小さく集中したユーティリティ
- 初期検証
- シンプルなマーケットプレイス公開

メリット:
- 理解しやすい
- 早く出荷できる

デメリット:
- 上振れ余地が限られる
- 継続収益が低い

### 案 2: 無料 + Pro
推奨案。

#### 無料
- JSON インポート
- 基本プレビュー
- 基本的な競合処理

#### Pro
- 高度なプレビュー
- 監査機能
- 重複検出
- 直接指定されたカラー使用の検出
- プリミティブ誤用検出
- テーマ網羅性チェック
- より良いレポート

メリット:
- 導入しやすい
- 明確なアップグレード導線
- 価値に基づくセグメント分け

デメリット:
- プラットフォーム制約によってはライセンス / 権限設計が必要

#### 現実的な価格設定

推奨価格:
- Free: $0
- Pro Solo: $8 / 月、または $72 / 年
- Pro Team: $24 / 月、または $216 / 年
- 買い切りを併用する場合: Solo $49、Team $149

価格の考え方:
- Free は、インポート体験そのものを広げるために十分に使える状態にする。
- Pro は、監査・重複検出・直接指定カラー検出・プリミティブ誤用検出・テーマ網羅性チェック・レポートをまとめて有料化する。
- Solo の月額は、Framer Pro 本体の $30 / 月を大きく下回る必要がある。
- Team は、個人の便利ツールではなく、クライアント案件や複数メンバーでの品質管理に支払う価格として設定する。

この価格帯が妥当な理由:
- Framer Marketplace には無料プラグインが多く、カラーやスタイルの軽量ユーティリティも無料で提供されている。単なるインポートやスタイル作成だけでは高い月額を取りにくい。
- 一方で、Brand Guard のような Framer 内のブランド QA / 監査系プラグインは、有料 Pro 機能としてルール数、spacing、radius、text style usage などを分けている。このプラグインの Pro も、同じく「品質管理」に課金する位置付けにする。
- Figma 系の監査プラグインでは、Design Lint は無料、Roast は Solo $19 / Team $99 の買い切り、Design System Organizer は $2.99 と低価格帯も存在する。そのため、カラー専用の Framer プラグインをいきなり $20-40 / 月にするのは強すぎる。
- Tokens Studio は Starter Plus が €39-49 / 月、Specify は $69 / 月からで、いずれも Figma / Git / 複数ソース / コード連携を含む広いトークン運用プロダクトである。このプラグインは Framer 内の下流作業に特化するため、その半分以下の価格から始めるのが自然。
- 年額 $72 は、支払い意思のある個人・フリーランスにとって軽く、1 回のクライアント案件で十分回収できる。Team $216 / 年は、監査レポートやルール共有が実用化された段階なら、制作会社の品質管理コストとして説明しやすい。

最初から高単価にしない方がよい理由:
- 対象ユーザーは、デザインシステム専任チームよりも Framer 制作者、個人、制作会社寄りになる可能性が高い。
- Framer ではホスティングやエディター課金がすでに発生するため、プラグイン追加課金は心理的に軽く見える必要がある。
- Pro の価値は、同期エンジンではなく「問題を発見して修正判断を速くすること」なので、SaaS 型の高額デザイントークン基盤とは別カテゴリとして扱うべき。

### 案 3: スイート戦略
長期的な方向性。

カラーから始め、次の領域へ拡張します:
- radius
- shadow
- spacing
- typography
- governance / reporting

これにより、より広いトークン運用プロダクトを作れます。

#### 現実的な価格設定

推奨価格:
- Suite Solo: $16 / 月、または $144 / 年
- Suite Team: $49 / 月、または $468 / 年
- Suite Agency: $99 / 月、または $948 / 年
- Enterprise: $299 / 月以上、または個別見積もり

価格の考え方:
- Suite は、カラー専用 Pro とは別物として扱う。
- radius、shadow、spacing、typography、governance / reporting まで含めるなら、単体プラグインではなく Framer 向けのデザインシステム監査スイートになる。
- Solo は Framer Pro 本体より安く、Team は Framer Scale より安い水準に置く。
- Agency は複数クライアント案件、複数プロジェクト、エクスポート可能な監査レポート、保存済みルールセットを前提にする。
- Enterprise は、SSO、監査履歴、チーム権限、カスタムルール、サポート SLA などを提供できる段階まで待つ。

この価格帯が妥当な理由:
- Design Lint や Color AutoLink のような無料ツールは、単一ファイル内の検出や修正支援に近い。Suite が有料で成立するには、複数トークン種別、ルールセット、レポート、チーム運用まで広げる必要がある。
- Tokens Studio、Specify、Supernova は、デザイントークンの作成、同期、ドキュメント、コード連携、ガバナンスまで含むため、$35-169 / 月以上の価格が成立している。
- Framer 専用 Suite は、それらより狭いが、Framer プロジェクト内の実行結果に直結する。したがって、Solo $16 / 月、Team $49 / 月なら、広域 SaaS より安く、単体プラグインより高い中間価格として説明しやすい。
- Agency $99 / 月は、制作会社が毎月複数サイトを監査する前提なら妥当。ただし、単にカラー以外を追加しただけでは弱く、クライアント提出用レポート、違反一覧の CSV / Markdown 出力、プロジェクト間ルール共有が必要。

段階的な値上げ方針:
- カラー Pro の段階では $8 / 月を上限にする。
- 2 種類以上のトークン監査と保存済みルールセットが入ったら Suite Solo $16 / 月へ拡張する。
- チーム共有、複数プロジェクト、レポート出力が安定したら Suite Team $49 / 月を出す。
- カスタムルール、監査履歴、権限、サポートが揃うまでは Enterprise を前面に出さない。

## 市場比較メモ

調査時点: 2026-04-15

参考にした市場:
- Framer Marketplace: プラグインは 650 件以上あり、無料と有料が混在している。Design Workflow カテゴリも存在する。
- Framer 本体: Basic $10 / 月、Pro $30 / 月、Scale $100 / 月。プラグイン価格は、少なくとも Solo では Framer Pro 本体より軽く見える必要がある。
- Framer 類似プラグイン:
  - Color AutoLink: raw HEX を既存 Color Styles にリンクする無料プラグイン。
  - Accessible Colors: WCAG 対応のカラーパレット / テーマ生成を行う無料プラグイン。
  - Brand Guard: 色、フォント、文言、spacing、radius、text style usage などを検証する有料 QA プラグイン。
  - Pattern Duplication Finder: 重複 UI ブロックを検出する有料 Design Workflow プラグイン。
- Figma 類似プラグイン:
  - Design Lint: デザイン上の不整合や未リンクスタイルを検出する無料プラグイン。
  - Roast: 監査 / handoff 支援。Solo $19、Team $99 の買い切り。
  - Design System Organizer: スタイルやコンポーネント整理。$2.99。
- デザイントークン / デザインシステム SaaS:
  - Tokens Studio: Free あり、Starter Plus €39 / 月から。Studio 系は €169 / 月、Organization は €499 / 月。
  - Specify: Essentials $69 / 月、Teams $134 / 月。
  - Supernova: Free あり、Pro は Builder $20-25 / 月、Full $35-45 / 月。

参考 URL:
- https://www.framer.com/marketplace/plugins/
- https://www.framer.com/pricing/
- https://www.framer.com/marketplace/plugins/color-autolink/
- https://www.framer.com/marketplace/plugins/accessible-colors/
- https://www.framer.com/marketplace/plugins/brand-guard/
- https://www.framer.com/marketplace/plugins/pattern-duplication-finder/
- https://lintyour.design/
- https://roastplugin.framer.website/
- https://figmaelements.com/plugins/design-system-organizer-2/
- https://tokens.studio/pricing
- https://specifyapp.com/pricing
- https://www.supernova.io/pricing

## 推奨する市場投入順序

### ステージ 1
検証用の個人利用 MVP

### ステージ 2
カラーインポートを入口にしたマーケットプレイス公開

### ステージ 3
監査とガバナンスによる有料差別化

### ステージ 4
より広範なトークンスイート

## 大まかな商業仮説

### ユーザーが支払う理由
ユーザーはカラー作成に対して支払うわけではありません。
支払う理由は次の通りです:
- 手作業での再作成を避ける
- システムの意図を保持する
- スタイルのずれを減らす
- トークン誤用を特定する
- Framer を外部の信頼できる唯一の参照元ファイルと揃え続ける

## コストモデル上の考慮
主なコスト:
- 開発時間
- Framer API / プラットフォーム更新後のメンテナンス
- サポート / ドキュメント
- マーケティング / プロダクトページ用アセット

## 成功指標
- 完了したインポート数
- 月次のリピート利用
- ワークスペース / プロジェクトごとの監査実行数
- インポートのみのユーザーから監査ユーザーへのアップグレード率
