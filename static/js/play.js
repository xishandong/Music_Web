$(document).ready(function () {
    // 绑定播放按钮点击事件
    $('.btn-play').click(function () {
        var songId = $(this).data('song-id');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        play(songId, song, cover, singer);
    });
    $('.play-btn').click(function () {
        var songId = $(this).data('song-id');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        play(songId, song, cover, singer);
    });
    $('.play-pause').click(function () {
        var songId = $(this).data('song-id');
        var type = $(this).data('song-type');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        play(songId, song, cover, singer);
    });
    $('.delete-icon').click(function () {
        var songId = $(this).data('song-id');
        var row = $(this).closest('.song'); // 获取最近的父级 tr 元素
        row.fadeOut(500, function () {
            row.remove(); // 在动画结束后移除该行
        });
        $.ajax({
            type: 'POST',
            url: '/user/uncollected',
            data: JSON.stringify({'id': songId}),
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
    });
    $('.delete-icon-hs').click(function () {
        var songId = $(this).data('song-id');
        var row = $(this).closest('.song-card'); // 获取最近的父级 tr 元素
        row.fadeOut(500, function () {
            row.remove(); // 在动画结束后移除该行
        });
        $.ajax({
            type: 'POST',
            url: '/user/deleteHistory',
            data: JSON.stringify({'id': songId}),
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
    })
    $('.btn-collect').click(function () {
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
    })
});

function play(songId, song, cover, singer) {
    var existingSongIndex = findSongIndexById(songId);
    if (existingSongIndex !== -1) {
        window.ap.list.switch(existingSongIndex);
        window.ap.play();
        add_playing();
    } else {
        $.ajax({
            type: 'POST',
            url: '/music/play',
            data: JSON.stringify({
                'id': songId,
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
                        id: song.id,
                        tlyrics: song.tlyrics
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

function findSongIndexById(id) {
    return window.ap.list.audios.findIndex(function (song) {
        return song.id === id;
    });
}
