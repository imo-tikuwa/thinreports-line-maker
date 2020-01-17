# thinreports-line-makerについて
thinreportsで使用するtlfファイルを作成するツールです。  
バージョン0.10.0のエディターで使用することができます。  
![thinreports_line_maker_03](https://user-images.githubusercontent.com/48991931/71476562-01f7ab00-2829-11ea-8726-8dc1ba57b68a.png)

## デモサイト
[thinreports-line-maker(外部リンク)](https://etc.imo-tikuwa.com/thinreports-line-maker/)

## サンプル
※ダウンロード後、ファイルの拡張子をtxtからtlfに変える必要あり（tlfファイルをgithubにアップできなかった）  
[onestop.tlf](https://github.com/imo-tikuwa/thinreports-line-maker/files/4077319/onestop.txt)

ふるさと納税のワンストップ特例申請書を目指したテンプレート  
[公式のエディター](http://www.thinreports.org/features/editor/)や当ツールで読み込むことができます。

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

## その他
非公式のツールなので間違えて公式に問い合わせたりしないようお願いします。
