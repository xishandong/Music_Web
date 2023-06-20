$(document).ready(function () {
    add_playing();
    list = [];
    table = $('.files-table-row')
    flag = 1;
    table.each(function () {
        var id = $(this).data('song-id');
        var index = $.inArray(id, $.map(window.ap.list.audios, function (obj) {
            return obj.id;
        }));
        if (index === -1) {
            flag = 1;
        } else {
            flag = 0;
        }
    })
    back = $('.back');
    back.off('click');
    back.on('click', function (event) {
        event.preventDefault(); // 阻止默认的链接跳转行为
        var url = $(this).attr('href'); // 获取链接的地址
        var title = $(this).text(); // 获取链接的文本
        history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
        loadPage(url); // 加载新页面内容
    });
    $('.btn-add-song').click(function () {
        var url = $(this).attr('href'); // 获取链接的地址
        var title = $(this).text(); // 获取链接的文本
        history.pushState({url: url, title: title}, title, url); // 修改路由，不刷新页面
        loadPage(url); // 加载新页面内容
    });
    $('#createPlaylistButton1').click(function () {
        var playlistName = $('#name').val();
        var playlistDesc = $('#desc').val();
        var pid = $(this).data('pid');
        $.ajax({
            url: '/user/edit_playlist', // 后端路由地址
            type: 'POST',
            data: {
                name: playlistName,
                desc: playlistDesc,
                pid: pid
            },
            success: function (response) {
                if (playlistDesc && playlistName) {
                    $(".details h2").text(playlistName);
                    $(".details p").text(playlistDesc);
                } else if (playlistDesc && !playlistName) {
                    $(".details p").text(playlistDesc);
                } else if (playlistName && !playlistDesc) {
                    $(".details h2").text(playlistName);
                }
                $('#modalBody').html(response.message);
                $('#messageModal').modal('show');
            },
            error: function (error) {
                console.log(error);
                $('#modalBody').html(error);
                $('#messageModal').modal('show');
            }
        });
        $('#createPlaylistModal1').modal('hide');
    });
    $(".avatar").click(function () {
        $("#file").click();
    });
    var url = window.location.href;
    var parts = url.split("/");
    var id = parts[parts.length - 1];
    $("#file").change(function () {
        var fileInput = document.getElementById("file");
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append("file", file);
        $.ajax({
            url: "/user/upload_cover/" + id,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.file) {
                    $(".avatar img").attr("src", response.file);
                }
                $('#modalBody').html(response.message);
                $('#messageModal').modal('show');
            },
            error: function (error) {
                console.log(error);
                $('#modalBody').html(error);
                $('#messageModal').modal('show');
            }
        });
    });
    table.on('click', function (event) {
        if (!$(event.target).hasClass('more-action') && !$(event.target).hasClass('more-action1')) {
            if (flag === 1) {
                window.ap.list.clear();
                table.each(function () {
                    var id = $(this).data('song-id');
                    var song = $(this).data('song-name');
                    var cover = $(this).data('song-cover');
                    var singer = $(this).data('song-singer');
                    var songInfo = {
                        id: id,
                        name: song,
                        cover: cover,
                        artist: singer,
                        lrc: '',
                    };
                    list.push(songInfo);
                });
                window.ap.list.add(list);
                flag = 0;
            }
            var id = $(this).data('song-id');
            var song = $(this).data('song-name');
            var cover = $(this).data('song-cover');
            var singer = $(this).data('song-singer');
            var existingSongIndex = findSongIndexById(id);
            if (existingSongIndex !== -1) {
                window.ap.list.switch(existingSongIndex);
                window.ap.play();
                add_playing();
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/music/play',
                    data: JSON.stringify({
                        'id': id,
                        'type': 'wy',
                        'info': {'song': song, 'cover': cover, 'singer': singer}
                    }),
                    contentType: 'application/json;charset=UTF-8',
                    success: function (response) {
                        var song = response.song;
                        var audio;
                        if (song.lyrics) {
                            audio = {
                                name: song.name,
                                artist: song.singer,
                                url: song.url,
                                cover: song.cover_url,
                                lrc: song.lyrics,
                                id: song.id
                            };
                        } else {
                            audio = {
                                name: song.name,
                                artist: song.singer,
                                url: song.url,
                                cover: song.cover_url,
                                id: song.id
                            };
                        }
                        window.ap.list.add(audio);
                        window.ap.list.switch(window.ap.list.audios.length - 1);
                        window.ap.play();
                        add_playing();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            }
        }
    });
    $('.more-action').click(function (event) {
        event.stopPropagation();
        row = $(this).closest('.files-table-row');
        mid = row.children('.name-cell').text();
        $('#confirmBody').html('确定删除该歌曲吗?');
        $('#confirm').modal('show');
        cb = $('#confirmButton');
        cb.off('click');
        cb.on('click', function () {
            deleteSong(mid, id);
            row.fadeOut(500, function () {
                row.remove();
            });
        });
    })
    $('.more-action1').click(function (event) {
        event.stopPropagation();
        row = $(this).closest('.files-table-row');
        mid = row.children('.name-cell').text();
        $('#confirmBody').html('确定取消收藏该歌曲吗?');
        $('#confirm').modal('show');
        cb = $('#confirmButton');
        cb.off('click');
        cb.on('click', function () {
            uncollected(mid);
            row.fadeOut(500, function () {
                row.remove();
            });
        });
    })
    remove = $('.btn-remove');
    remove.off('click');
    remove.on('click', function () {
        if (confirm("确定要删除该歌单吗？")) {
            $.ajax({
                url: '/user/deletePlaylist',
                type: 'POST',
                data: {
                    id: id
                },
                success: function (response) {
                    if (response.success === 200) {
                        var url = '/user/playlists'
                        var title = $(this).text();
                        history.pushState({url: url, title: title}, title, url);
                        loadPage(url); // 加载新页面内容
                    } else {
                        $('#modalBody').html(response.message);
                        $('#messageModal').modal('show');
                    }
                },
                error: function (error) {
                    console.log(error)
                }
            });
        }
    })
})

function deleteSong(mid, id) {
    $.ajax({
        url: '/user/deletePlaylistSong', // 后端路由地址
        type: 'POST',
        data: {
            pid: id,
            mid: mid
        },
        success: function (response) {
        },
        error: function (error) {
        }
    });
}


function findSongIndexById(id) {
    return window.ap.list.audios.findIndex(function (song) {
        return song.id === id;
    });
}

function uncollected(mid) {
    $.ajax({
        type: 'POST',
        url: '/user/uncollected',
        data: JSON.stringify({'id': mid}),
        contentType: 'application/json;charset=UTF-8',
        success: function (response) {
            // 在这里处理后端返回的JSON数据
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
}