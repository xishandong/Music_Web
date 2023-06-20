$(document).ready(function () {
    back = $('.back');
    back.off('click');
    back.on('click', function (event) {
        event.preventDefault(); // 阻止默认的链接跳转行为
        var url = $(this).attr('href'); // 获取链接的地址
        var title = $(this).text(); // 获取链接的文本
        history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
        loadPage(url); // 加载新页面内容
    });
    $('.collect-btn').click(function () {
        var query = $(this).data('song-id');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        $.ajax({
            type: 'POST',
            url: '/user/collected',
            data: JSON.stringify({'id': query, 'info': {'song': song, 'cover': cover, 'singer': singer}}),
            contentType: 'application/json;charset=UTF-8',
            success: function (response) {
                $('#modalBody').html(response.message);
                $('#messageModal').modal('show');
            },
            error: function (error) {
                console.log(error);
                // 在这里处理请求失败的情况
                $('#modalBody').html(error);
                $('#messageModal').modal('show');
            }
        });
    });
})