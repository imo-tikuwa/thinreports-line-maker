require 'sinatra'
require 'sinatra/reloader'
require 'thinreports'
require 'date'

# index.htmlを表示
get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

# フロント側からrubyが稼働していることを確認するためのルーティング
get '/is-ruby-running' do
  'ruby_is_running.'
end

# PDFをダウンロードする
# 
# 1. POSTされたtlfファイルデータをtmpディレクトリに保存
# 2. tlfをthinreportsで読み込みそのままpdfファイルを生成
# 3. 作成したpdfファイルを読み込み
# 4. tlfファイルとpdfファイルを削除
# 5. レスポンスにpdfファイルのデータを書き込み
post '/download_pdf' do

  # tlfファイル作成
  tlf_data = @params[:tlf_data]
  time = Time.now.strftime("%Y%m%d%H%M%S")
  tlf_name = time + '.tlf'

  tlf_file_path = 'tmp/' + tlf_name
  File.open(tlf_file_path, "w") do |io|
    io.puts(tlf_data)
  end

  # pdfファイル生成
  pdf_name = tlf_name.sub('.tlf', '.pdf')
  pdf_file_path = 'tmp/' + pdf_name
  
  report = Thinreports::Report.new layout: tlf_file_path
  report.start_new_page
  report.generate filename: pdf_file_path

  # pdfファイルダウンロード
  file_data = File.binread(pdf_file_path)
  File.delete(tlf_file_path)
  File.delete(pdf_file_path)
  headers['Content-Type'] = "application/octet-stream"
  headers['Content-Length'] = file_data.length
  headers['Content-Disposition'] = "attachment;filename=\"" + pdf_name + "\""
  file_data
end