$(function() {

    // bootstrap4 ツールチップ設定
    $('[data-toggle="tooltip"]').tooltip();

    // カラーピッカー設定
    $("#color, #rect-line-color, #rect-fill-color").wheelColorPicker({
      preview: true,
      autoResize: false,
      sliders: "vrgb",
      cssClass: "color-picker-popup",
    });
    $("#color").val("000000").trigger('change');
    $("#rect-line-color").val("000000").trigger('change');
    $("#rect-fill-color").val("ffffff").trigger('change');

    // キャンバス作成
    var canvas = new fabric.Canvas('layout-canvas');
    canvas.selection = false;
    fabric.Object.prototype.transparentCorners = false;
    initAligningGuidelines(canvas);
    initCenteringGuidelines(canvas);
    canvas.setWidth(595);
    canvas.setHeight(842);

    // 線追加
    $("#add_line").on("click", function() {

      var direction = $("#direction").val(),
      color = $("#color").val(),
      length = $("#length").val(),
      width = $("#width").val(),
      position_x = $("#position-x").val(),
      position_y = $("#position-y").val(),
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
          draw_line(x1, y1, x2, y2, color, width);
          if ('vertical' === direction) {
            x1 += interval;
            x2 += interval;
          } else {
            y1 += interval;
            y2 += interval;
          }
        }
      } else {
        draw_line(x1, y1, x2, y2, color, width);
      }
    });

    // 線を書く
    var draw_line = function(x1, y1, x2, y2, color, width) {
      canvas.add(new fabric.Line([x1, y1, x2, y2], {
        left: x1,
        top: y1,
        stroke: '#' + color,
        strokeWidth: width,
        selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        hasControls: false,
        hasBorders: true,
        hoverCursor: "inherit"
      }));
      canvas.renderAll();
      save();
    };

    // 四角形追加
    $("#add_rect").on("click", function() {

      var position_x = $("#rect-position-x").val(),
      position_y = $("#rect-position-y").val(),
      line_color = $("#rect-line-color").val(),
      fill_color = $("#rect-fill-color").val(),
      width = $("#rect-width").val(),
      height = $("#rect-height").val(),
      line_width = $("#rect-line-width").val();

      position_x = parseInt(position_x);
      position_y = parseInt(position_y);
      width = parseInt(width);
      height = parseInt(height);
      line_width = parseInt(line_width);

      draw_rect(position_x, position_y, width, height, line_width, line_color, fill_color);
    });

    // 四角形を書く
    var draw_rect = function(x, y, w, h, line_width, line_color, fill_color) {
      let fill_color_prop = (fill_color != "") ? '#' + fill_color : "";
      canvas.add(new fabric.Rect({
        left: x,
        top: y,
        width: w,
        height: h,
        fill: fill_color_prop,
        stroke: '#' + line_color,
        strokeWidth: line_width,
        selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        hasControls: false,
        hasBorders: true,
        hoverCursor: "inherit"
      }));
      canvas.renderAll();
      save();
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
        margin: [
          20,
          20,
          20,
          20
        ]
      }
    };


    // tlfファイルダウンロード
    $("#download_tlf").on("click", function(){

      var download_filename = new Date().getTime();
      tlf_config.items = [];
      tlf_config.title = download_filename;
      tlf_config.report.orientation = current_tlf_orientation;
      tlf_config.report['paper-type'] = current_tlf_paper_type;
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

        var push_data = null;

        // 線と四角形で条件分岐する
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
              "border-style": "solid",
              "fill-color": fill_color_prop
            },
            "border-radius": 0
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
              "border-style": "solid",
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

      var tlf_json = JSON.stringify(tlf_config, null, 2);
      var tlf_blob = window.URL.createObjectURL(new Blob([tlf_json], {type: 'text/plain'}));
      var download_link = document.createElement("a");
      download_link.download = download_filename + '.tlf';
      download_link.href = tlf_blob;
      download_link.dataset.downloadurl = ["text/plain", download_link.download, download_link.href].join(":");
      download_link.click();
    });


    // see https://stackoverflow.com/questions/19043219/undo-redo-feature-in-fabric-js
    var state;
    var undo = [];
    var redo = [];
    function save() {
      redo = [];
      $('#redo').prop('disabled', true);
      if (state) {
        undo.push(state);
        $('#undo').prop('disabled', false);
      }
      state = JSON.stringify(canvas);
    }

    function replay(playStack, saveStack, buttonsOn, buttonsOff) {
      saveStack.push(state);
      state = playStack.pop();
      var on = $(buttonsOn);
      var off = $(buttonsOff);
      on.prop('disabled', true);
      off.prop('disabled', true);
      canvas.clear();
      canvas.loadFromJSON(state, function() {
        canvas.renderAll();
        on.prop('disabled', false);
        if (playStack.length) {
          off.prop('disabled', false);
        }
      });
    }

    save();
    canvas.on('object:modified', function() {
      save();
    });

    $('#undo').on('click', function() {
      replay(undo, redo, '#redo', this);
    });
    $('#redo').on('click', function() {
      replay(redo, undo, '#undo', this);
    });


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
              draw_line(item.x1, item.y1, item.x2, item.y2, item.style['border-color'].replace('#', ''), item.style['border-width']);
            } else if (item.type === 'rect') {
              let fill_color_prop = (item.style['fill-color'] === "none") ? "" : item.style['fill-color'].replace('#', '');
              draw_rect(item.x, item.y, item.width, item.height, item.style['border-width'], item.style['border-color'].replace('#', ''), fill_color_prop);
            }
          }

          state = null;
          undo = [];
          redo = [];
          save();
          $('#undo').prop('disabled', true);
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
    });
    $(".default-canvas-size").trigger('click');

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
    });

    // キャンバスの縦横入れ替え処理
    $(".toggle-canvas-orientation").on('click', function() {
      current_tlf_orientation = (current_tlf_orientation === "portrait") ? "landscape" : "portrait";
      let tmp_canvas_width = canvas.getWidth(), tmp_canvas_height = canvas.getHeight();
      canvas.setWidth(tmp_canvas_height);
      canvas.setHeight(tmp_canvas_width);
      update_disp();
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
      $("#position-x").val(e.pointer.x);
      $("#position-y").val(e.pointer.y);
      $("#rect-position-x").val(e.pointer.x);
      $("#rect-position-y").val(e.pointer.y);
    });

    // マウスオーバーの位置をとりあえずコンソールログに出しとく
    canvas.on('mouse:move', function(e){
      console.log("x:" + e.pointer.x, "y:" + e.pointer.y);
    });

    // 「このプログラムについて」の折りたたみ
    $("#usage-collapse").on('show.bs.collapse', function(){
        $("#usage-collapse-trigger").find("span.fa").addClass("fa-minus").removeClass("fa-plus");
    }).on('hide.bs.collapse', function(){
        $("#usage-collapse-trigger").find("span.fa").addClass("fa-plus").removeClass("fa-minus");
    });
});