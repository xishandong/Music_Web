$(document).ready(function() {
    $('.re-play').click(function () {
        var songId = $(this).data('song-id');
        var type = $(this).data('song-type');
        var song = $(this).data('song-name');
        var cover = $(this).data('song-cover');
        var singer = $(this).data('song-singer');
        $.ajax({
            type: 'POST',
            url: '/music/play',
            data: JSON.stringify({
                'id': songId,
                'type': type,
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
                // 切换到新添加的歌曲
                window.ap.list.switch(window.ap.list.audios.length - 1);
                window.ap.play();
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
    $('.re-col').click(function () {
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