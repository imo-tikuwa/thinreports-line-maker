"use strict";

// Webフォント読み込み（Textのオプションが初期表示で折りたたまれたことが原因で、フォントのローディングが行われていなかったためWebFontLoaderというライブラリを使用）
// https://github.com/typekit/webfontloader
// http://cly7796.net/wp/javascript/load-web-fonts-with-webfontloader/
WebFont.load({
  custom: {
    families: ['IPAMincho', 'IPAPMincho', 'IPAGothic', 'IPAPGothic'],
    urls: ['../css/style.css']
  },
  loading: function() {
    console.log('loading');
  },
  active: function() {
    console.log('active');
  },
  inactive: function() {
    console.log('inactive');
  },
  fontloading: function(familyName, fvd) {
    console.log('fontloading', familyName, fvd);
  },
  fontactive: function(familyName, fvd) {
    console.log('fontactive', familyName, fvd);
  },
  fontinactive: function(familyName, fvd) {
    console.log('fontinactive', familyName, fvd);
  }
});

$(function() {

  // bootstrap4 ツールチップ設定
  $('[data-toggle="tooltip"]').tooltip();

  // カラーピッカー設定
  $("#color, #rect-line-color, #rect-fill-color, #text-color").wheelColorPicker({
    preview: true,
    autoResize: false,
    sliders: "vrgb",
    cssClass: "color-picker-popup",
  });
  $("#color").val("000000").trigger('change');
  $("#rect-line-color").val("000000").trigger('change');
  $("#rect-fill-color").val("ffffff").trigger('change');
  $("#text-color").val("000000").trigger('change');

  // キャンバス作成
  var canvas = new fabric.Canvas('layout-canvas');
  canvas.selection = false;
  fabric.Object.prototype.transparentCorners = false;
  initAligningGuidelines(canvas);
  initCenteringGuidelines(canvas);
  canvas.setWidth(595);
  canvas.setHeight(842);

  // Canvasのオブジェクトをid指定で取得する
  // https://stackoverflow.com/questions/32931236/how-to-remove-fabric-js-object-with-custom-id
  fabric.Canvas.prototype.getItemByAttr = function(attr, name) {
    var object = null,
    objects = this.getObjects();
    for (var i = 0, len = this.size(); i < len; i++) {
      if (objects[i][attr] && objects[i][attr] === name) {
        object = objects[i];
        break;
      }
    }
    return object;
  };

  // メモリを使いすぎないようにというFabricjsの処理？によって線がぼやけてしまう。objectCacheオプションをfalseにし、以下のcanvasサイズに関する設定を変更
  // see https://stackoverflow.com/questions/47513180/fabricjs-lines-in-group-become-blurry
  fabric.perfLimitSizeTotal = 225000000;
  fabric.maxCacheSideLimit = 5000;

  // 線追加
  $("#add_line").on("click", function() {

    var direction = $("#direction").val(),
    color = $("#color").val(),
    length = $("#length").val(),
    width = $("#width").val(),
    position_x = $("#position-x").val(),
    position_y = $("#position-y").val(),
    line_type = $("#line-type").val(),
    interval = $("#interval").val(),
    repeat = $("#repeat").val();

    length = parseInt(length);
    width = parseInt(width);
    position_x = parseInt(position_x);
    position_y = parseInt(position_y);
    interval = parseInt(interval);
    repeat = parseInt(repeat);

    var x1 = position_x,
    y1 = position_y,
    x2 = position_x,
    y2 = position_y;

    if ('vertical' === direction) {
      y2 += length;
    } else {
      x2 += length;
    }

    if (interval > 0 &&  repeat > 0) {
      for (var i = 0; i <= repeat; i++) {
        draw_line(x1, y1, x2, y2, color, width, line_type);
        if ('vertical' === direction) {
          x1 += interval;
          x2 += interval;
        } else {
          y1 += interval;
          y2 += interval;
        }
      }
    } else {
      draw_line(x1, y1, x2, y2, color, width, line_type);
    }
  });

  // 線を書く
  var draw_line = function(x1, y1, x2, y2, color, width, line_type) {
    let canvas_line = new fabric.Line([x1, y1, x2, y2], {
      left: x1,
      top: y1,
      stroke: '#' + color,
      strokeWidth: width,
      selectable: false,
      evented: false,
      objectCaching: false,
      hoverCursor: "inherit"
    });
    if (line_type == 'dashed') {
      canvas_line.strokeDashArray = [2, 2];
    } else if (line_type == 'dotted') {
      canvas_line.strokeDashArray = [1, 1];
    }

    canvas.add(canvas_line);
    canvas.renderAll();
  };

  // 四角形追加
  $("#add_rect").on("click", function() {

    var position_x = $("#rect-position-x").val(),
    position_y = $("#rect-position-y").val(),
    line_color = $("#rect-line-color").val(),
    fill_color = $("#rect-fill-color").val(),
    width = $("#rect-width").val(),
    height = $("#rect-height").val(),
    line_width = $("#rect-line-width").val(),
    line_type = $("#rect-line-type").val();

    position_x = parseInt(position_x);
    position_y = parseInt(position_y);
    width = parseInt(width);
    height = parseInt(height);
    line_width = parseInt(line_width);

    draw_rect(position_x, position_y, width, height, line_width, line_color, fill_color, line_type);
  });

  // 四角形を書く
  var draw_rect = function(x, y, w, h, line_width, line_color, fill_color, line_type) {
    let fill_color_prop = (fill_color != "") ? '#' + fill_color : "";
    let canvas_rect = new fabric.Rect({
      left: x,
      top: y,
      width: w,
      height: h,
      fill: fill_color_prop,
      stroke: '#' + line_color,
      strokeWidth: line_width,
      selectable: false,
      evented: false,
      objectCaching: false,
      hoverCursor: "inherit"
    });
    if (line_type == 'dashed') {
      canvas_rect.strokeDashArray = [2, 2];
    } else if (line_type == 'dotted') {
      canvas_rect.strokeDashArray = [1, 1];
    }

    canvas.add(canvas_rect);
    canvas.renderAll();
  };

  // テキスト追加
  $("#add_text").on("click", function() {

    var add_text = window.prompt("追加するテキストを入力してください。\n改行は「\\n」と入力してください", "");
    if (add_text == null || add_text == '') {
      if (add_text == '') {
        alert("テキストを入力してください。");
      }
      return false;
    }

    var position_x = $("#text-position-x").val(),
    position_y = $("#text-position-y").val(),
    text_color = $("#text-color").val(),
    text_font = $("#text-font").val(),
    width = $("#text-width").val(),
    height = $("#text-height").val(),
    text_size = $("#text-size").val(),
    text_position = $("#text-position").val(),
    font_style_bold = $("#font-style-bold:checked").val(),
    font_style_italic = $("#font-style-italic:checked").val(),
    font_style_linethrough = $("#font-style-linethrough:checked").val(),
    font_style_underline = $("#font-style-underline:checked").val();

    let font_style_arr = [];
    if (font_style_bold != undefined) {
      font_style_arr.push(font_style_bold);
    }
    if (font_style_italic != undefined) {
      font_style_arr.push(font_style_italic);
    }
    if (font_style_linethrough != undefined) {
      font_style_arr.push(font_style_linethrough);
    }
    if (font_style_underline != undefined) {
      font_style_arr.push(font_style_underline);
    }

    position_x = parseInt(position_x);
    position_y = parseInt(position_y);
    width = parseInt(width);
    height = parseInt(height);

    let text_position_arr = text_position.split('-'),
    styles = {
      color: text_color,
      "font-family": [
        text_font
      ],
      "font-size": text_size,
      "font-style": font_style_arr,
      "letter-spacing": "",
      "line-height": "",
      "line-height-ratio": "",
      "text-align": text_position_arr[0],
      "vertical-align": text_position_arr[1]
    };

    draw_text(add_text, position_x, position_y, width, height, styles);
  });

  // テキストを書く
  var draw_text = function(text, x, y, w, h, other_props) {

    var font_style_weight = ($.inArray('bold', other_props['font-style']) >= 0) ? "bold" : "",
    font_style_italic = ($.inArray('italic', other_props['font-style']) >= 0) ? "italic" : "",
    is_linethrough = ($.inArray('linethrough', other_props['font-style']) >= 0),
    is_underline = ($.inArray('underline', other_props['font-style']) >= 0);

    let canvas_text = new fabric.Text(text.replace(/\\n/g, '\n'), {
      left: x,
      top: y,
      fill: '#' + other_props.color.replace('#', ''),
      fontSize: other_props['font-size'],
      fontFamily: other_props['font-family'][0],
      textAlign: other_props['text-align'],
      fontWeight: font_style_weight,
      fontStyle: font_style_italic,
      underline: is_underline,
      linethrough: is_linethrough,
      selectable: false,
      evented: false,
      objectCaching: false,
      hoverCursor: "inherit"
    });

    // FabricJs側で使えないプロパティをthinreportSavedPropsという名前で保持しておくためにfabric.Textにプロパティを追加する
    // https://stackoverflow.com/questions/38008915/how-to-add-name-to-fabricjs-object
    // http://fabricjs.com/fabric-intro-part-3
    canvas_text.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          thinreportSavedProps: this.thinreportSavedProps
        });
      };
    })(canvas_text.toObject);
    canvas_text.thinreportSavedProps = {
      verticalAlign: other_props['vertical-align'],
      width: w,
      height: h,
      lineHeight: other_props['line-height'],
      lineHeightRatio: other_props['line-height-ratio'],
      letterSpacing: other_props['letter-spacing']
    };

    canvas.add(canvas_text);
    canvas.renderAll();
  };

  // flf関連の変数とか
  var current_tlf_paper_type = "A4",
  current_tlf_orientation = "portrait",
  current_tlf_size_is_free = false,
  tlf_config = {
    version: '0.10.0',
    items: [],
    state: {
      ["layout-guides"]: []
    },
    title: "",
    report: {
      ["paper-type"]: current_tlf_paper_type,
      orientation: current_tlf_orientation,
      margin: []
    }
  };

  // 線の種類を取得する
  var get_border_style = function(strokeDashArray) {
    let border_style = "solid";
    if (strokeDashArray != undefined) {
      if (strokeDashArray[0] == 2 && strokeDashArray[1] == 2) {
        border_style = "dashed";
      } else if (strokeDashArray[0] == 1 && strokeDashArray[1] == 1) {
        border_style = "dotted";
      }
    }
    return border_style;
  };

  // tlfファイルダウンロード
  $("#download_tlf").on("click", function(){
    var download_filename = new Date().getTime();
    var tlf_json = get_tlf_json(download_filename);
    var tlf_blob = window.URL.createObjectURL(new Blob([tlf_json], {type: 'text/plain'}));
    var download_link = document.createElement("a");
    download_link.download = download_filename + '.tlf';
    download_link.href = tlf_blob;
    download_link.dataset.downloadurl = ["text/plain", download_link.download, download_link.href].join(":");
    download_link.click();
  });

  // tlfファイルデータを返す
  var get_tlf_json = function(download_filename = null) {
    if (download_filename == null) {
      download_filename = new Date().getTime();
    }
    let current_margin_top = $("#margin-top").val(),
    current_margin_right = $("#margin-right").val(),
    current_margin_bottom = $("#margin-bottom").val(),
    current_margin_left = $("#margin-left").val();

    current_margin_top = parseInt(current_margin_top);
    current_margin_right = parseInt(current_margin_right);
    current_margin_bottom = parseInt(current_margin_bottom);
    current_margin_left = parseInt(current_margin_left);

    tlf_config.items = [];
    tlf_config.title = download_filename;
    tlf_config.report.orientation = current_tlf_orientation;
    tlf_config.report['paper-type'] = current_tlf_paper_type;
    tlf_config.report.margin = [];
    tlf_config.report.margin.push(current_margin_top);
    tlf_config.report.margin.push(current_margin_right);
    tlf_config.report.margin.push(current_margin_bottom);
    tlf_config.report.margin.push(current_margin_left);
    if (current_tlf_size_is_free) {
      if (current_tlf_orientation === "portrait") {
        tlf_config.report.width = parseInt(canvas.getWidth());
        tlf_config.report.height = parseInt(canvas.getHeight());
      } else {
        tlf_config.report.width = parseInt(canvas.getHeight());
        tlf_config.report.height = parseInt(canvas.getWidth());
      }
    } else {
      delete tlf_config.report.width;
      delete tlf_config.report.height;
    }
    canvas.getObjects().map(function(item, index){

      // マージン線はtlfファイルに出力しないのでスキップ
      if (is_margin_object(item)) {
        return;
      }

      var push_data = null;

      // 線と四角形とテキストで条件分岐する
      if (item instanceof fabric.Rect) {

        let fill_color_prop = ("" == item.fill) ? "none" : item.fill;

        push_data = {
          "id": "",
          "type": "rect",
          "display": true,
          "description": "",
          "x": item.left,
          "y": item.top,
          "width": item.width,
          "height": item.height,
          "style": {
            "border-color": item.stroke,
            "border-width": item.strokeWidth,
            "border-style": get_border_style(item.strokeDashArray),
            "fill-color": fill_color_prop
          },
          "border-radius": 0
        };

      } else if (item instanceof fabric.Text) {

        let texts = item.text.split('\n'),
        font_style_arr = [];
        if (item.fontWeight == 'bold') {
          font_style_arr.push('bold');
        }
        if (item.fontStyle == 'italic') {
          font_style_arr.push('italic');
        }
        if (item.linethrough == true) {
          font_style_arr.push('linethrough');
        }
        if (item.underline == true) {
          font_style_arr.push('underline');
        }

        push_data = {
          "id": "",
          "type": "text",
          "display": true,
          "description": "",
          "x": item.left,
          "y": item.top,
          "width": item.thinreportSavedProps.width,
          "height": item.thinreportSavedProps.height,
          "style": {
            "font-family": [
              item.fontFamily
            ],
            "font-size": item.fontSize,
            "color": item.fill,
            "text-align": item.textAlign,
            "vertical-align": item.thinreportSavedProps.verticalAlign,
            "line-height": item.thinreportSavedProps.lineHeight,
            "line-height-ratio": item.thinreportSavedProps.lineHeightRatio,
            "letter-spacing": item.thinreportSavedProps.letterSpacing,
            "font-style": font_style_arr
          },
          "texts": texts
        };

      } else {

        push_data = {
          "id": "",
          "type": "line",
          "display": true,
          "description": "",
          "style": {
            "border-color": item.stroke,
            "border-width": item.strokeWidth,
            "border-style": get_border_style(item.strokeDashArray)
          }
        };

        // undo/redoを行った前に存在したオブジェクトとadd_lineで追加したオブジェクトの内容が違うのでここで分岐して結果として同じものを出力させる
        if (item.version != undefined) {
          // undo/redoを行う前に存在したオブジェクトのパターン
          push_data['x1'] = item.left;
          push_data['y1'] = item.top;
          push_data['x2'] = item.left + item.width;
          push_data['y2'] = item.top + item.height;
        } else {
          // add_lineで追加したオブジェクトのパターン
          push_data['x1'] = item.x1;
          push_data['y1'] = item.y1;
          push_data['x2'] = item.x2;
          push_data['y2'] = item.y2;
        }
      }

      tlf_config.items.push(push_data);
    });

    return JSON.stringify(tlf_config, null, 2);
  };

  // Undo/Redo処理
  // https://codepen.io/Jadev/pen/mLNzmB
  var is_redoing = false;
  var history = [];
  canvas.on('object:added',function(e) {
    reflash_undo_btn();
    if (!is_redoing) {
      history = [];
      reflash_redo_btn();
    }
    is_redoing = false;
  });
  $('#undo').on('click', function() {
    if (canvas._objects.length > 0) {
      history.push(canvas._objects.pop());
      canvas.renderAll();
      reflash_undo_btn();
      reflash_redo_btn();
    }
  });
  $('#redo').on('click', function() {
    if (history.length > 0) {
      is_redoing = true;
      canvas.add(history.pop());
      reflash_redo_btn();
    }
  });
  // Undoボタンの最新化
  // 4本のマージン線以外はUndo可能
  function reflash_undo_btn() {
    if (canvas._objects.length > 4) {
      $('#undo').prop('disabled', false);
    } else {
      $('#undo').prop('disabled', true)
    }
  }
  // Redoボタンの最新化
  function reflash_redo_btn() {
    if (history.length > 0) {
      $('#redo').prop('disabled', false);
    } else {
      $('#redo').prop('disabled', true)
    }
  }


  $(window).keydown(function(e){
    // Ctrl+Z でundo呼び出し（undoボタンがdisabledでないときトリガーからクリックイベント実行）
    if (event.ctrlKey && e.keyCode === 90) {
      if (!$('#undo').prop('disabled')) {
        $('#undo').trigger('click');
      }
      e.preventDefault();
    }
    // Ctrl+Y でredo呼び出し（redoボタンがdisabledでないときトリガーからクリックイベント実行）
    else if (event.ctrlKey && e.keyCode === 89) {
      if (!$('#redo').prop('disabled')) {
        $('#redo').trigger('click');
      }
      e.preventDefault();
    }
    // Ctrl+S でダウンロード呼び出し
    else if (event.ctrlKey && e.keyCode === 83) {
      $('#download_tlf').trigger('click');
      e.preventDefault();
    }
  });

  // tlfファイルロード
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    $("#load_tlf").on("click", function(){
      $("#load_tlf_file").trigger('click');
    });
    $("#load_tlf_file").on("change", function(e){
      if (!window.confirm("編集中のファイルは失われます。よろしいですか？")) {
        return false;
      }
      var tlf_file = e.target.files[0];
      var tlf_file_name = tlf_file.name.toLowerCase();
      if (!tlf_file_name.endsWith('.tlf')) {
        alert("tlfファイルを選択してください。");
        return false;
      }

      var reader = new FileReader();
      reader.readAsText(tlf_file);
      reader.addEventListener('load', function() {
        var tlf_file_data = JSON.parse(reader.result);
        canvas.clear();
        for (var i = 0; i < tlf_file_data.items.length; i++) {
          var item = tlf_file_data.items[i];
          if (item.type === 'line') {
            draw_line(item.x1, item.y1, item.x2, item.y2, item.style['border-color'].replace('#', ''), item.style['border-width'], item.style['border-style']);
          } else if (item.type === 'rect') {
            let fill_color_prop = (item.style['fill-color'] === "none") ? "" : item.style['fill-color'].replace('#', '');
            draw_rect(item.x, item.y, item.width, item.height, item.style['border-width'], item.style['border-color'].replace('#', ''), fill_color_prop, item.style['border-style']);
          } else if (item.type === 'text') {
            let texts = item.texts.join('\n');
            draw_text(texts, item.x, item.y, item.width, item.height, item.style);
          }
        }

        // マージン線を再描画
        $("#margin-top").val(tlf_file_data.report.margin[0]);
        $("#margin-right").val(tlf_file_data.report.margin[1]);
        $("#margin-bottom").val(tlf_file_data.report.margin[2]);
        $("#margin-left").val(tlf_file_data.report.margin[3]);
        draw_margin_line();

        history = [];
        reflash_undo_btn();
        reflash_redo_btn();
      });

    });
  } else {
    $("#load_tlf").hide();
  }

  // キャンバスサイズのデータ
  var canvas_size_data = {
    a4: {
      width: 595,
      height: 842,
      tlf_type: "A4"
    },
    a3: {
      width: 842,
      height: 1191,
      tlf_type: "A3"
    },
    b5: {
      width: 516,
      height: 729,
      tlf_type: "B5_ISO"
    },
    b4: {
      width: 729,
      height: 1032,
      tlf_type: "B4_ISO"
    }
  };

  // キャンバスサイズの変更処理
  $('.canvas-size').on('click', function() {
    var change_size = canvas_size_data[$(this).data('canvas-size')];
    if (current_tlf_orientation === "portrait") {
      canvas.setWidth(change_size.width);
      canvas.setHeight(change_size.height);
    } else {
      canvas.setWidth(change_size.height);
      canvas.setHeight(change_size.width);
    }
    current_tlf_paper_type = change_size.tlf_type;
    current_tlf_size_is_free = false;
    update_disp();
    draw_margin_line();
  });

  // キャンバスサイズ（フリーサイズ）の処理
  $(".free-canvas-size").on("click", function(){
    let free_width = window.prompt("新しい幅を入力", canvas.getWidth());
    if (free_width == null || !isFinite(free_width)) {
      alert("数値を入力してください。");
      return false;
    }
    let free_height = window.prompt("新しい高さを入力", canvas.getHeight());
    if (free_height == null || !isFinite(free_height)) {
      alert("数値を入力してください。");
      return false;
    }
    canvas.setWidth(free_width);
    canvas.setHeight(free_height);
    current_tlf_paper_type = "user";
    current_tlf_size_is_free = true;
    update_disp();
    draw_margin_line();
  });

  // キャンバスの縦横入れ替え処理
  $(".toggle-canvas-orientation").on('click', function() {
    current_tlf_orientation = (current_tlf_orientation === "portrait") ? "landscape" : "portrait";
    let tmp_canvas_width = canvas.getWidth(), tmp_canvas_height = canvas.getHeight();
    canvas.setWidth(tmp_canvas_height);
    canvas.setHeight(tmp_canvas_width);
    update_disp();
    draw_margin_line();
  });

  // ラベル表示更新
  function update_disp() {
    $(".disp-paper-type").text(current_tlf_paper_type);
    $(".disp-width").text(canvas.getWidth());
    $(".disp-height").text(canvas.getHeight());
    $(".disp-orientation").text(current_tlf_orientation);
  }

  // キャンバス上でクロスヘアカーソルを表示させる、ダブルクリックした位置をPositionX,Yにセットする
  canvas.isDrawingMode = true;
  canvas.freeDrawingCursor = 'crosshair';
  canvas.on('mouse:down:before', function(e){
    canvas.isDrawingMode = false;
  });
  canvas.on('mouse:down', function(e){
    canvas.isDrawingMode = true;
  });
  canvas.on('mouse:dblclick', function(e){
    var canvas_pointer_x = parseInt(e.pointer.x),
    canvas_pointer_y = parseInt(e.pointer.y);
    $("#position-x").val(canvas_pointer_x);
    $("#position-y").val(canvas_pointer_y);
    $("#rect-position-x").val(canvas_pointer_x);
    $("#rect-position-y").val(canvas_pointer_y);
    $("#text-position-x").val(canvas_pointer_x);
    $("#text-position-y").val(canvas_pointer_y);
  });

  // キャンバスをマウスオーバーしてる間、カーソルに追従してXY座標を出力する
  canvas.on('mouse:move', function(e){
    var canvas_pointer_x = parseInt(e.pointer.x),
    canvas_pointer_y = parseInt(e.pointer.y);
    $("#canvas-xy-disp").css({left: canvas_pointer_x + 22, top: canvas_pointer_y + 53});
    $("#canvas-xy-disp").attr('title', "X:" + canvas_pointer_x + " Y:" + canvas_pointer_y).tooltip('_fixTitle').tooltip('show');
  }).on('mouse:out', function(){
    $("#canvas-xy-disp").tooltip('hide');
  });

  // bootstrap4 collapseの折りたたみ処理
  $("#usage-collapse, #line-collapse, #rect-collapse, #text-collapse, #action-collapse, #canvas-size-collapse, #margin-collapse").on('show.bs.collapse hide.bs.collapse', function(e){
    let $target_collapse = $("#" + $(this).attr("id") + "-trigger");
    if (e.type == 'show') {
      $target_collapse.find("span.fa").addClass("fa-minus").removeClass("fa-plus");
    } else if (e.type == 'hide') {
      $target_collapse.find("span.fa").addClass("fa-plus").removeClass("fa-minus");
    }
  });

  // マージン描画
  var draw_margin_line = function() {

    let current_width = parseInt(canvas.getWidth()),
    current_height = parseInt(canvas.getHeight()),
    current_margin_top = $("#margin-top").val(),
    current_margin_right = $("#margin-right").val(),
    current_margin_bottom = $("#margin-bottom").val(),
    current_margin_left = $("#margin-left").val();

    current_margin_top = parseInt(current_margin_top);
    current_margin_right = parseInt(current_margin_right);
    current_margin_bottom = parseInt(current_margin_bottom);
    current_margin_left = parseInt(current_margin_left);

    let margins = {
      top: {
        x1: 0,
        y1: current_margin_top,
        x2: current_width,
        y2: current_margin_top
      },
      right: {
        x1: current_width - current_margin_right,
        y1: 0,
        x2: current_width - current_margin_right,
        y2: current_height
      },
      bottom: {
        x1: 0,
        y1: current_height - current_margin_bottom,
        x2: current_width,
        y2: current_height - current_margin_bottom
      },
      left: {
        x1: current_margin_left,
        y1: 0,
        x2: current_margin_left,
        y2: current_height
      }
    };

    // 既存のマージン線を消して新規でマージン線を追加
    canvas.getObjects().map(function(canvas_item, canvas_item_index){
      if (is_margin_object(canvas_item)) {
        canvas.remove(canvas_item);
      }
    });
    for(let margin_target in margins) {
      let margin_data = margins[margin_target];
      let canvas_margin_line = new fabric.Line([margin_data.x1, margin_data.y1, margin_data.x2, margin_data.y2], {
        left: margin_data.x1,
        top: margin_data.y1,
        stroke: '#eee',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        objectCaching: false,
        hoverCursor: "inherit"
      });

      canvas_margin_line.toObject = (function(toObject) {
        return function() {
          return fabric.util.object.extend(toObject.call(this), {
            margin_id: this.margin_id
          });
        };
      })(canvas_margin_line.toObject);
      canvas_margin_line.margin_id = margin_target;

      canvas.add(canvas_margin_line);
      canvas.sendToBack(canvas_margin_line);
    }
    canvas.renderAll();
  };

  // キャンバス内の線オブジェクトがマージン線か判定
  var is_margin_object = function(canvas_item) {
    return (canvas_item.margin_id != null && canvas_item.margin_id != '' && $.inArray(canvas_item.margin_id, ['top', 'right', 'bottom', 'left']) >= 0);
  };

  // マージンの設定値を変更したら再描画
  $("#margin-top, #margin-right, #margin-bottom, #margin-left").on('change', function(e){
    draw_margin_line();
  });

  // ページ読み込み時にA4サイズのキャンバスを読み込み
  $(".default-canvas-size").trigger('click');

  // rubyが稼働しているときのみthinreportsを利用したPDFのダウンロードを行うボタンを表示
  $.ajax({
    url:'/is-ruby-running',
    type:'GET',
    dataType: 'text',
    success: function(data, status, xhr) {
      if (xhr.status === 200 && data == 'ruby_is_running.') {
        $("#download_pdf").show();

        // PDFダウンロード処理
        $("#download_pdf").on('click', function(){
          let tlf_json = get_tlf_json();
          $.ajax({
            type: 'POST',
            dataType: 'text',
            url: '/save_tlf',
            data: {
              tlf_data: tlf_json
            },
            success: function(tlf_name, status2, xhr2){
              if (xhr2.status === 200) {
                window.location.href = '/download_pdf?tlf_name=' + tlf_name
              }
            },
          });
        });
      }
    }
  });
});