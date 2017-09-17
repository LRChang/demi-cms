/**
 * Created by lrchang on 04/08/2017.
 */
layui.use(['form','layedit','upload'], function(){
    var form = layui.form();
    var layedit = layui.layedit;

    var currentID = null; // 编辑商品时的商品ID
    if( !isNaN(window.base.getSearchParam('id')) ){
        currentID = window.base.getSearchParam('id');
    }

    /**
     * 渲染编辑表单
     * @param id // 产品ID
     */
    function renderEditForm(id) {
        getProduct(id, function(data){

            // 填充基本信息
            $('blockquote.from-title').html('编辑产品');
            $('button[lay-filter="add-product"]').html('保存修改');
            $('input[name="name"]').val(data.name);
            $('select[name="category_id"]').val(data.category_id);
            $('input[name="price"]').val(data.price);
            $('input[name="stock"]').val(data.stock);

            // 填充主图
            handleUploaded({'url': data.main_img_url,'id': data.img_id}, 'main_img', false);

            // 填充属性
            var emptyAttrForm = $('#property-list .layui-form-item:first');
            for (var i = 0; i < data.properties.length; i++){
                var attrForm = emptyAttrForm.clone();
                var item = data.properties[i];
                attrForm.find('input.property_name').attr('name', "property_name[" + item.id + "]").val(item.name);
                attrForm.find('input.property_detail').attr('name', "property_detail[" + item.id + "]").val(item.detail);
                $('#property-list').append(attrForm);
            }
            if( data.properties.length ){
                // 去除空白
                emptyAttrForm.remove();
            }

            // 填充详情图
            var detailImgs = data.detail_imgs;
            detailImgs.sort(function(a, b){         // 按照图片顺序排序
                return a.order > b.order ? 1 : -1;
            });
            for (var i = 0; i < detailImgs.length; i++ ){
                var item = detailImgs[i];
                handleUploaded({'url': item.img.url,'id': item.img_id}, 'detail_img', true);
            }

            // 重新渲染表单
            form.render();
        });
    }

    /**
     * 获取商品
     * @param id // 产品ID
     * @param callback
     */
    function getProduct(id, callback){
        var params = {
            'type': 'GET',
            'url': 'product/' + id,
            'sCallback': function(res){
                callback && (typeof callback) == 'function' && callback(res);
            }
        }
        window.base.getData(params);
    }

    // 获取商品分类
    var getCategory = {
        'tpye': 'GET',
        'url': 'category/all',
        'sCallback': function(res){
            $('#category_id').html( getCateHtmlStr(res) );
            // 渲染表单
            form.render();

            // 如果是编辑页面，则渲染编辑表单
            if(currentID){
                renderEditForm(currentID);
            }
        }
    };
    window.base.getData(getCategory);

    // 获取分类选项
    function getCateHtmlStr(res){
        var len = res.length;
        if(!len){
            return '<option value="">暂无分类</option>';
        }

        var str = '<option value="">请选择</option>';
        for(var i=0;i<len;i++){
            var item = res[i];
            str += '<option value="' + item['id'] + '">' + item['name'] + '</option>';
        }

        return str;
    }

    // 选择图片
    $(document).on('click','.choose-img',function(event){
        event.preventDefault();
        var type = $(this).data('type');
        if(!type){
            return false;
        }

        $('.upload-img[data-type=' + type + ']').click();
    });

    // 绑定上传
    $('.upload-img').fileupload({
        url: window.base.g_restUrl + 'upload/img?XDEBUG_SESSION_START=11384',
        dataType: 'json',
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader('token', window.base.getLocalStorage('token'));
        },
        done: function (e, data) {
            var result = data.result;
            var type = $(this).data('type');
            var multiple = $(this).attr('multiple');
            var isMultiple = multiple && multiple == 'multiple'; // 是否为多选

            handleUploaded(result, type, isMultiple);
        }
    });

    // 显示图片
    function handleUploaded(result, type, isMultiple){
        var imgItem = createImgItem(result, type, isMultiple);

        if(!isMultiple){
            $('#'+ type).html( imgItem ).show();
        }else{
            $('#'+ type).append( imgItem ).show();
        }
    }

    // 拼接img 与隐藏的 input
    function createImgItem(result, type, isMultiple){
        var name = isMultiple ? (type +'[]') : type;
        return '<input type="hidden" name="' + name + '" value="' + result.id + '"/>'
            + '<img src="' + result.url + '" class="handle-img"/>';
    }


    // 新增属性
    $(document).on('click','.property-add',function(event){
        event.preventDefault();
        var item = $('#property-list .layui-form-item:first').clone().appendTo('#property-list');
        item.find('input').val('');
    });

    // 删除属性
    $(document).on('click','.property-delete',function(event){
        event.preventDefault();

        // 至少保留一个属性
        if( $('#property-list div.layui-form-item').length <= 1 ){
            return false;
        }
        $(this).parents('.layui-form-item').remove();
    });

    // 提交表单
    form.on('submit(add-product)',function(data){
        var elem = data.elem; // 获取提交按钮
        // 防止表单重复提交
        if( $(elem).hasClass('layui-btn-disabled') ){
            return false;
        }

        var field = data.field; // 获取数据

        var url = currentID ? 'product/update' : 'product/create';
        url += '?XDEBUG_SESSION_START=14659';
        if (currentID){
            field['id'] = currentID;
        }
        var addProduct = {
            'url': url,
            'type': 'POST',
            'data': field,
            'sCallback': function(data){
                var msg = currentID ? '修改已保存' : '商品新增成功';
                layer.msg(msg,{
                    'time': 3000,
                    'end':function(){
                        if(currentID){
                            location.reload();
                        }else{
                            window.location.href = "add-product.html?id=" + data.id;
                        }
                    }
                })
            },
            'eCallback': function(res){
                var msg = currentID ? '保存失败' : '新增失败';
                layer.msg(msg ,{'time': 3000});
            }
        };
        window.base.getData(addProduct);

        return false; // 防止表单跳转
    });

    $(document).on('click','img.handle-img',function(event){
        console.log('handle-img');
        layer.open({
            shade: 0,
            time: 3000,
            resize: false,
            btn: ['上 移', '下 移' ,'删 除', '取 消']
            ,yes: function(index, layero){
                console.log('上移');
                //按钮【按钮一】的回调
            }
            ,btn2: function(index, layero){
                //按钮【按钮二】的回调
                console.log('下移');
                //return false 开启该代码可禁止点击该按钮关闭
            }
            ,btn3: function(index, layero){
                //按钮【按钮三】的回调
                console.log('删除');
                //return false 开启该代码可禁止点击该按钮关闭
            },btn4: function(index, layero){
                //按钮【按钮三】的回调
                console.log('取消');
                //return false 开启该代码可禁止点击该按钮关闭
            }
            ,cancel: function(){
                //右上角关闭回调
                console.log('handle-img 4');
                //return false 开启该代码可禁止点击该按钮关闭
            }
        });
    });
});