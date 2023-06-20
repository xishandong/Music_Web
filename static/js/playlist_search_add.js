$(document).ready(function () {
    var url = window.location.href;
    var parts = url.split("/");
    var pid = parts[parts.length - 1];
    back = $('.back');
    back.off('click');
    back.on('click', function (event) {
        event.preventDefault(); // 阻止默认的链接跳转行为
        var url = $(this).attr('href'); // 获取链接的地址
        var title = $(this).text(); // 获取链接的文本
        history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
        loadPage(url); // 加载新页面内容
    });
    var form = document.getElementById("search-form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = form.elements["query"].value;
        var load = $('.show-load');
        load.html('<section><span class="loader"> </span></section>');
        content = $('.song-content')
        content.html('');
        $.ajax({
            url: '/user/search_add',
            method: "POST",
            data: JSON.stringify({
                'query': query,
            }),
            contentType: 'application/json;charset=UTF-8',
            success: function (response) {
                items = response.query;
                load.html('');
                if (items.length > 0 && pid !== 'collect') {
                    items.forEach(function (item) {
                        var songHtml = '<div class="song">' +
                            '<img src="' + item.cover_url + '" alt="">' +
                            '<div class="info">' +
                            '<div class="title">' + item.name + '</div>' +
                            '<div class="artist">' + item.singer + '-----' + item.id +
                            '<button class="add" data-song-id="' + item.id + '" data-song-type="wy" data-song-singer="' + item.singer + '" data-song-cover="' + item.cover_url + '" data-song-name="' + item.name + '">' +
                            '<i class="fa fa-th-list"></i>' +
                            '</button>' +
                            '<button class="collect" data-song-id="' + item.id + '" data-song-singer="' + item.singer + '" data-song-cover="' + item.cover_url + '" data-song-name="' + item.name + '">' +
                            '<i class="fa fa-heart"></i>' +
                            '</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>';

                        // 将 songHtml 添加到页面中
                        // 例如，可以使用 jQuery 的 append() 方法将其添加到某个容器中
                        content.append(songHtml);
                    });
                }
                if (items.length > 0 && pid === 'collect'){
                    items.forEach(function (item) {
                        var songHtml = '<div class="song">' +
                            '<img src="' + item.cover_url + '" alt="">' +
                            '<div class="info">' +
                            '<div class="title">' + item.name + '</div>' +
                            '<div class="artist">' + item.singer + '-----' + item.id +
                            '<button class="collect" data-song-id="' + item.id + '" data-song-singer="' + item.singer + '" data-song-cover="' + item.cover_url + '" data-song-name="' + item.name + '">' +
                            '<i class="fa fa-heart"></i>' +
                            '</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>';

                        // 将 songHtml 添加到页面中
                        // 例如，可以使用 jQuery 的 append() 方法将其添加到某个容器中
                        content.append(songHtml);
                    });
                }
            },
            error: function (xhr, status, error) {
                load.html('<h1>Error</h1><p>' + error + '</p>');
            }
        });
    });
    add = $('.song-content');
    add.off('click')
    add.on('click', '.add', function (e) {
        var id = $(this).data('song-id');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        info = {'song': song, 'cover': cover, 'singer': singer}
        add_song(id, pid, info)
    })
    add.on('click', '.collect', function (e) {
        var id = $(this).data('song-id');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        $.ajax({
            type: 'POST',
            url: '/user/collected',
            data: JSON.stringify({'id': id, 'info': {'song': song, 'cover': cover, 'singer': singer}}),
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
    })
})


function add_song(mid, pid, info) {
    $.ajax({
        url: '/user/addPlaylistSong', // 后端路由地址
        type: 'POST',
        data: {
            mid: mid,
            pid: pid,
            info: info
        },
        success: function (response) {
            $('#modalBody').html(response.message);
            $('#messageModal').modal('show');
        },
        error: function (error) {
            console.log(error);
            $('#modalBody').html(error);
            $('#messageModal').modal('show');
        }
    });
}