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
    upid = $('#uploadId');
    upid.off('click');
    upid.on('click', function () {
        id = $('#playlistId').val();
        var content = $('.song-content');
        content.html('<section"><span class="loader" style="position:fixed;left: 55%;top: 40%;"> </span></section>'); // 显示加载动画
        $.ajax({
            url: '/user/upload/playlist',
            data: {id: id},
            type: 'POST',
            success: function (response) {
                if (response.success === 200) {
                    url = '/user/playlist_index/' + response.info;
                    title = $(this).text(); // 获取链接的文本
                    history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
                    loadPage(url); // 加载新页面内容
                } else {
                    $('#modalBody').html(response.message);
                    $('#messageModal').modal('show');
                    url = '/user/playlists';
                    title = $(this).text(); // 获取链接的文本
                    history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
                    loadPage(url); // 加载新页面内容
                }
            },
            error: function (error) {
                console.log(error);
                $('#modalBody').html(error);
                $('#messageModal').modal('show');
            },
        });
        $('#upload').modal('hide');
    });


});
