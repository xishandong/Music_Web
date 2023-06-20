$(document).ready(function () {
    document.getElementById('clear-btn').addEventListener('click', function () {
        window.ap.list.clear();
        recover();
    });
    upgrade_player();
    try {
        const lyricsLines = Array.from(document.querySelectorAll('.lyrics-list li'));
        const firstLine = lyricsLines[0];
        if (firstLine) {
            firstLine.classList.add('current');
        }
        var playButton = $(".control-play"),
            nextButton = $(".control-forwards"),
            prevButton = $(".control-back");
        if (window.ap.paused) {
            var current = $(".music-player-container")
            current.toggleClass("is-playing");
        }
        playButton.on("click", function () {
            var current = $(".music-player-container")
            current.toggleClass("is-playing");
            if (current.hasClass("is-playing")) {
                // 如果具有 is-playing 类，则执行播放操作
                window.ap.play();
            } else {
                // 如果没有 is-playing 类，则执行暂停操作
                window.ap.pause();
            }
        });
        nextButton.on('click', function () {
            window.ap.skipForward();
            upgrade_player();
            if (window.ap.paused) {
                var current = $(".music-player-container")
                current.toggleClass("is-playing");
            }
            window.ap.play();
        });
        prevButton.on('click', function () {
            window.ap.skipBack();
            upgrade_player();
            if (window.ap.paused) {
                var current = $(".music-player-container")
                current.toggleClass("is-playing");
            }
            window.ap.play();
        });
        // 添加时间更新事件处理程序
        let isScrolling = false;
        let scrollTimeout;
        $('.control-collect').click(function () {
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

        function handleScroll() {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                isScrolling = false;
            }, 1000);
        }

        document.querySelector('.lyrics-container').addEventListener('scroll', handleScroll);
        window.ap.on('timeupdate', function () {
            autoScrollLyrics();
        });

        function autoScrollLyrics() {
            if (!isScrolling) {
                const currentTime = window.ap.audio.currentTime;
                const lyricsLines = Array.from(document.querySelectorAll('.lyrics-list li'));
                const lyricsList = document.querySelector('.lyrics-list');
                // 找到当前时间对应的歌词行
                const currentLine = lyricsLines.find((line, index) => {
                    const time = line.getAttribute('data-time').split(':');
                    const lineTime = parseInt(time[0]) * 60 + parseFloat(time[1]);
                    const nextLine = lyricsLines[index + 1];
                    let nextLineTime = Number.POSITIVE_INFINITY; // 默认下一行时间为无穷大
                    if (nextLine) {
                        const nextLineTimeArr = nextLine.getAttribute('data-time').split(':');
                        nextLineTime = parseInt(nextLineTimeArr[0]) * 60 + parseFloat(nextLineTimeArr[1]);
                    }
                    return lineTime <= currentTime && currentTime < nextLineTime;
                });
                // 更新歌词的滚动位置
                if (currentLine) {
                    const lyricsContainer = document.querySelector('.lyrics-container');
                    const lineHeight = lyricsList.offsetHeight / lyricsLines.length;
                    const lineIndex = lyricsLines.indexOf(currentLine);
                    const containerHeight = lyricsContainer.offsetHeight;
                    let offset;
                    offset = Math.floor(-(lineHeight * lineIndex) + (containerHeight / 2) - (lineHeight / 2) - lyricsList.offsetTop);
                    // 禁用过渡效果
                    lyricsList.style.transition = 'none';
                    lyricsContainer.scrollTop = -offset + 20;
                    setTimeout(() => {
                        lyricsList.style.transition = 'transform 1s ease';
                    }, 0);
                    lyricsLines.forEach(line => line.classList.remove('current'));
                    currentLine.classList.add('current');
                    lyricsLines.forEach((line, index) => {
                        if (line.classList.contains('current')) {
                            line.style.fontSize = '30px';
                        } else {
                            line.style.fontSize = ''; // 清除字体大小
                            line.style.animation = ''; // 清除动画属性
                        }
                    });

                }
            }
        }

        window.ap.on('pause', function () {
            $(".music-player-container").removeClass("is-playing");
        });
        window.ap.on('play', function () {
            $(".music-player-container").addClass("is-playing");
        })
    } catch (e) {
    }
});

function recover() {
    try {
        var current = $(".music-player-container")
        current.removeClass("is-playing");
        $('.artist-name').text('暂无播放');
        $('.song-title').text('暂无播放');
        var albumArt = document.querySelector('.album-art');
        // 替换背景图片链接
        albumArt.style.background = ''
        albumArt.style.background = '#fff url("https://img0.baidu.com/it/u=2979994358,1823769752&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500") center/cover no-repeat;';
        // 获取.vinyl元素的引用
        var vinyl = document.querySelector('.vinyl');
        // 替换背景图片链接
        vinyl.style.backgroundImage = ''
        vinyl.style.backgroundImage = 'url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/83141/vinyl.png"), url("https://img0.baidu.com/it/u=2979994358,1823769752&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500");';
        const lyricsList = document.querySelector('.lyrics-list');
        // 清空歌词容器
        lyricsList.innerHTML = "";
        // 为每一行歌词创建一个 li 元素并添加到歌词容器中
        const li = document.createElement("li");
        li.textContent = '暂无歌词';
        li.setAttribute("data-time", '00"00');
        // 添加 flex 容器类名
        li.classList.add("centered-li");
        lyricsList.appendChild(li);
    } catch (e) {
    }
}
