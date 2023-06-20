$(document).ready(function () {
    cb2 = $('#createPlaylistButton2');
    cb2.off('click');
    cb2.click(function () {
        // 获取表单数据
        var playlistName = $('#playlistName').val();
        // 其他表单数据的获取
        var playlistDesc = $('#playlistDesc').val();
        // 发送AJAX请求
        $.ajax({
            url: '/user/addPlaylist', // 后端路由地址
            type: 'POST',
            data: {
                playlistName: playlistName,
                playlistDesc: playlistDesc,
            },
            success: function (response) {
                if (response.success === 200) {
                    var url = '/user/playlist_index/' + response.info
                    var title = $(this).text(); // 获取链接的文本
                    history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
                    loadPage(url); // 加载新页面内容
                }
            },
            error: function (error) {
                console.log(error);
                $('#modalBody').html(error);
                $('#messageModal').modal('show');
            }
        });
        $('#createPlaylistModal2').modal('hide');
    });
    $('.song').click(function (event) {
        event.preventDefault(); // 阻止默认的链接跳转行为
        var url = $(this).attr('href'); // 获取链接的地址
        var title = $(this).text(); // 获取链接的文本
        history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
        loadPage(url); // 加载新页面内容
    })
    $('.play-btn1').click(function (event) {
        event.stopPropagation(); // 阻止事件冒泡到父元素
        var id = $(this).data('id');
        console.log(id);
    })

});
