window.base={
    g_restUrl:'http://www.demi.com/api/v1/',

    getData:function(params){
        if(!params.type){
            params.type='get';
        }
        var that=this;
        $.ajax({
            type:params.type,
            url:this.g_restUrl+params.url,
            data:params.data,
            beforeSend: function (XMLHttpRequest) {
                if (params.tokenFlag) {
                    XMLHttpRequest.setRequestHeader('token', that.getLocalStorage('token'));
                }
            },
            success:function(res){
                params.sCallback && params.sCallback(res);
            },
            error:function(res){
                // params.eCallback && params.eCallback(res);
                if(params.eCallback){
                    params.eCallback(res);
                    return;
                }

                var msg = JSON.parse(res.responseText).msg;
                layer.msg(msg);
            }
        });
    },

    setLocalStorage:function(key,val){
        var exp=new Date().getTime()+2*24*60*60*100;  //令牌过期时间
        var obj={
            val:val,
            exp:exp
        };
        localStorage.setItem(key,JSON.stringify(obj));
    },

    getLocalStorage:function(key){
        var info= localStorage.getItem(key);
        if(info) {
            info = JSON.parse(info);
            if (info.exp > new Date().getTime()) {
                return info.val;
            }
            else{
                this.deleteLocalStorage('token');
            }
        }
        return '';
    },

    deleteLocalStorage:function(key){
        return localStorage.removeItem(key);
    },

    getSearchParam: function(name){
        // 获取location.search 中的参数
        var search = location.search.substring(1,location.search.length);
        var sArray = search.split('&');
        for ( var i = 0; i < sArray.length; i++){
            var item = sArray[i];
            if ( item.split('=', 1)[0] == name){
                return item.split('=')[1];
            }
        }

        return false;
    }
}
