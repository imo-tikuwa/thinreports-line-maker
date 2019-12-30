# thinreports-line-makerについて
thinreportsで使用するtlfファイルを作成するツールです。  
バージョン0.10.0のエディターで使用することができます。  
![thinreports_line_maker_03](https://user-images.githubusercontent.com/48991931/71476562-01f7ab00-2829-11ea-8726-8dc1ba57b68a.png)

## 使い方
server_ruby.batで起動する場合
```
git clone https://github.com/imo-tikuwa/thinreports-line-maker.git
cd thinreports-line-maker
bundle install --path vendor/bundle
cd public
npm ci
```

server_php.bat、server_npm.batで起動する場合  
※PDF形式のダウンロードは使えません  
```
git clone https://github.com/imo-tikuwa/thinreports-line-maker.git
cd thinreports-line-maker/public
npm ci
```

## 不具合
テキスト項目はたまにfabric.Textに埋めた独自プロパティが消失して保存ボタンクリック時にエラーが発生してしまいます。  
解決に時間が掛かりそうなのでまめに保存するか、テキストは公式のエディターで編集してください。

## サンプル
※ダウンロード後、ファイルの拡張子をtxtからtlfに変える必要あり（tlfファイルをgithubにアップできなかった）  
[1576896820381.tlf](https://github.com/imo-tikuwa/thinreports-line-maker/files/3990974/1576896820381.txt)  
[onestop.tlf](https://github.com/imo-tikuwa/thinreports-line-maker/files/4002545/onestop.txt)
ふるさと納税のワンストップ特例申請書を目指したテンプレート（途中で力尽きた）  
[公式のエディター](http://www.thinreports.org/features/editor/)や当ツールで読み込むことができます。

## デモ
[thinreports-line-maker(外部リンク)](https://etc.imo-tikuwa.com/thinreports-line-maker/)

## その他
非公式のツールなので間違えて公式に問い合わせたりしないようお願いします。
