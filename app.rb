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

# ajaxで送られてきたtlfデータを保存する
post '/save_tlf' do

  tlf_data = @params[:tlf_data]
  time = Time.now.strftime("%Y%m%d%H%M%S")
  tlf_name = time + '.tlf'

  # tlfファイル作成
  tlf_file_path = 'output/' + tlf_name
  File.open(tlf_file_path, "w") do |io|
    io.puts(tlf_data)
  end

  # tlfファイル名を返す
  tlf_name
end

# PDFをダウンロードする
get '/download_pdf' do

  tlf_name = @params[:tlf_name]
  tlf_file_path = 'output/' + tlf_name
  pdf_name = tlf_name.sub('.tlf', '.pdf')
  pdf_file_path = 'output/' + pdf_name

  # PDF生成
  Thinreports::Report.generate(:filename => pdf_file_path, :layout => tlf_file_path) do
    start_new_page
  end

  # PDFダウンロード
  stat = File::stat(pdf_file_path)
  send_file(pdf_file_path, :filename => pdf_name, :length => stat.size, :type => 'application/octet-stream')
end