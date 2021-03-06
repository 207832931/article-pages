/**
 * Created by zhouxiong on 16/11/7.
 */


(function ($) {

    $.fn.dragArea = function (options) {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('该浏览器不支持File API.');
            return;
        }

        $(document).on({ //阻止浏览器默认行为
            dragenter: function (e) {
                e.preventDefault();
            },
            dragover: function (e) {
                e.preventDefault();
            },
            dragleave: function (e) {
                e.preventDefault();
            },
            drop: function (e) {
                e.preventDefault();
            }
        });

        /**
         * 辅助函数
         */
        var util = {
            typeFlag: false,
            sizeFlag: false,
            isImage: function (type) {
                return type.indexOf('image') > -1;
            },
            isProperSize: function (size) {
                return Math.floor(size / 1024 / 1024) < 20;
            }
        };

        /**
         * 给this添加拖拽事件
         */
        var _this = this[0];
        var $uploader;
        $(_this).click(function (e) {
            if ($uploader) {
                $uploader.remove();
            }
            $uploader = $("<input type='file' multiple>");
            $(_this).after($uploader);
            $uploader.trigger('click');
            $uploader.on('change', handleChange)
        });


        _this.addEventListener('dragenter', function (e) { //拖拽进div
            e.preventDefault();
            $(_this).addClass('drag-enter');
        });


        _this.addEventListener('dragleave', function (e) { //离开拖拽区域
            e.preventDefault();
            $(_this).removeClass('drag-enter');
        });


        _this.addEventListener('drop', handleDrop); //拖拽结束

        function handleDrop(e) {
            $(_this).removeClass('drag-enter');

            var files = e.dataTransfer.files; //获取拖拽的文件列表,每个文件有name,size,type属性
            return handleFiles(files);
        }

        function handleChange(e) {
            var input = e.target;
            if (!input) {
                alert("找不到 fileinput 元素.");
            } else if (!input.files) {
                alert("该浏览器不支持input[`files`]属性.");
            } else if (!input.files[0]) {
                alert("请选择文件");
            } else {
                var files = input.files;
                handleFiles(files);
            }
        }

        function handleFiles(files) {

            if (!files.length) { //判断拖拽的文件数
                return false;
            }

            for (var i = 0; i < files.length; i++) {
                if (!util.isProperSize(files[i].size)) {
                    util.sizeFlag = true;
                    break;
                }
            }

            if (util.sizeFlag) {
                alert('请保证每个文件小于20M');
                util.sizeFlag = false;
                return false;
            }
            if (files.length > 6) {
                alert('一次最多上传6个文件');
                return false;
            }

            //满足条件后
            $('span', _this).hide();

            var formData = new FormData();
            formData.append('file', files[0]);
            formData.append('filename', files[0].name);
            //2.拖拽完自动上传
            var formData = new FormData();
            for (var i = 0; i < files.length; i++) {
                formData.append('file_' + i, files[i]);
                formData.append('filename_' + i, files[i].name);
            }

            $.ajax({
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total * 100;
                            if (percentComplete >= 5) {
                                percentComplete = percentComplete - 5
                            }
                            if (percentComplete < 100) {
                                $progress.removeClass('hidden');
                                $progressBar.css({width: percentComplete + '%'});
                            } else {
                            }
                        }
                    }, false);

                    return xhr;
                },
                url: 'UploadServlet',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    if (response === 'fail') {
                        return alert('服务端错误');
                    }
                    var list = JSON.parse(response);

                    $progressBar.css({width: '100%'});
                    return setTimeout(function () {
                        hideProgressBar();
                        return renderList(list);
                    }, 10);
                },
                error: function (xhr, err) {
                    var responseTitle = $(xhr.responseText).filter('title').get(0);
                    hideProgressBar();
                }
            });
        }
    };

})(jQuery);
