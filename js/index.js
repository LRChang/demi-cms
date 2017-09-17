/**
 * Created by lrchang on 04/08/2017.
 */
layui.use(['element'],function(){
    var element = layui.element(); //导航的hover效果、二级菜单等功能，需要依赖element模块
    // var $ = layui.jquery;

    // 判断是否登录
    if(!window.base.getLocalStorage('token')){
        window.location.href = 'login.html';
    }

    // 主菜单项
    $('.main-menu-item').on('click',function(){
        var othis = $(this), type = othis.data('type');
        var tabid = othis.data('id');

        // 不存在则新增一个Tab项
        if( !$('#page-container ul').find("li[lay-id='" + tabid + "']").length ){
            var height = window.outerHeight - 100;
            var iframe = '<iframe src="' + othis.data('url')+ '?v=' + Date.now() + '"';
                iframe += ' style="height:' + height + 'px;" ';
                iframe += 'name="' + Date.now() + '" class="tab-iframe"></iframe>';
            element.tabAdd('page-container', {
                title: othis.data('title') //标题
                ,content: iframe
                ,id: tabid
            });
        }

        //切换到Tab项
        element.tabChange('page-container',tabid);
    });

    // 默认打开orders页面
    $('.main-menu-item[data-id="orders"]').click();

    /*退出*/
    $(document).on('click','#login-out',function(){
        window.base.deleteLocalStorage('token');
        window.location.href = 'login.html';
    });
})