/**
 * Created by lrchang on 04/08/2017.
 */
layui.use([],function(){

    // 判断是否登录
    if(!window.base.getLocalStorage('token')){
        window.location.href = 'login.html';
    }

    var pageIndex=1,
        moreDataFlag=true;
    getOrders(pageIndex);

    /*
     * 获取数据 分页
     * params:
     * pageIndex - {int} 分页下表  1开始
     */

    function getOrders(pageIndex){
        var params={
            url:'order/',
            data:{page:pageIndex,size:20},
            tokenFlag:true,
            sCallback:function(res) {
                var str = getOrderHtmlStr(res);
                $('#order-table').append(str);
                $("[data-type='orderNo']").click(function(){
                    $($(this).parent().nextAll()[0]).toggleClass('hide_box');
                })
            }
        };
        window.base.getData(params);
    }

    /*拼接html字符串*/
    function getOrderHtmlStr(res){
        var data = res.data;     //res是关键
        if (data){
            var len = data.length,
                str = '', item;
            if(len>0) {
                for (var i = 0; i < len; i++) {
                    item = data[i];
                    str += '<tr>' +
                        '<td class="orderNo" data-type="orderNo">' + item.order_no + '</td>' +
                        '<td>' + item.snap_name + '</td>' +
                        '<td>' + item.total_count + '</td>' +
                        '<td>￥' + item.total_price + '</td>' +
                        '<td>' + getOrderStatus(item.status) + '</td>' +
                        '<td>' + item.create_time + '</td>' +
                        '<td data-id="' + item.id + '">' + getBtns(item.status) + '</td>' +
                        '</tr>' +
                        '<tr class="hide_box">'+'<td data-type="hide_box">'+item.snap_address +'</td>'+'</tr>';
                }
            }
            else{
                ctrlLoadMoreBtn();
                moreDataFlag=false;
            }
            return str;
        }
        return '';
    }

    /*根据订单状态获得标志*/
    function getOrderStatus(status){
        var arr=[{
            cName:'unpay',
            txt:'未付款',
            bType:'layui-btn-warm'
        },{
            cName:'payed',
            txt:'已付款',
            bType:''
        },{
            cName:'done',
            txt:'已发货',
            bType:'layui-btn-normal'
        },{
            cName:'unstock',
            txt:'缺货',
            bType:'layui-btn-danger'
        }];
        return '<button class="layui-btn layui-btn-small '+arr[status-1].bType + ' ' + arr[status-1].cName+'">'+arr[status-1].txt+'</button>';
    }

    /*根据订单状态获得 操作按钮*/
    function getBtns(status){
        var arr=[{
            cName:'done',
            txt:'发货',
            bType:''
        },{
            cName:'unstock',
            txt:'缺货',
            bType:'layui-btn-danger'
        }];
        if(status==2 || status==4){
            var index=0;
            if(status==4){
                index=1;
            }
            return '<button class="layui-btn layui-btn-small '+arr[index].bType + ' '+arr[index].cName+'">'+arr[index].txt+'</button>';
        }else{
            return '';
        }
    }

    /*控制加载更多按钮的显示*/
    function ctrlLoadMoreBtn(){
        if(moreDataFlag) {
            $('.load-more').hide().next().show();
        }
    }

    /*加载更多*/
    $(document).on('click','.load-more',function(){
        if(moreDataFlag) {
            pageIndex++;
            getOrders(pageIndex);
        }
    });
    /*发货*/
    $(document).on('click','.order-btn.done',function(){
        var $this=$(this),
            $td=$this.closest('td'),
            $tr=$this.closest('tr'),
            id=$td.attr('data-id'),
            $tips=$('.global-tips'),
            $p=$tips.find('p');
        var params={
            url:'order/delivery',
            type:'put', //put
            data:{id:id},
            tokenFlag:true,
            sCallback:function(res) {
                if(res.code.toString().indexOf('2')==0){
                    $tr.find('.order-status-txt')
                        .removeClass('pay').addClass('done')
                        .text('已发货');
                    $this.remove();
                    $p.text('操作成功');
                }else{
                    $p.text('操作失败');
                }
                $tips.show().delay(1500).hide(0);
            },
            eCallback:function(){
                $p.text('操作失败');
                $tips.show().delay(1500).hide(0);
            }
        };
        window.base.getData(params);
    });
});