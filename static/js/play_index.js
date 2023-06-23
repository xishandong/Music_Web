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
        window.isScrolling = false;
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
            window.isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                window.isScrolling = false;
            }, 1000);
        }

        document.querySelector('.lyrics-container').addEventListener('scroll', handleScroll);
        window.ap.on('timeupdate', function () {
            autoScrollLyrics();
        });
        window.ap.on('pause', function () {
            $(".music-player-container").removeClass("is-playing");
        });
        window.ap.on('play', function () {
            $(".music-player-container").addClass("is-playing");
        })
        window.ap.on('ended', function () {
            upgrade_player();
            add_playing();
        });
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

function upgrade_player() {
    try {
        const lyricsString = window.ap.list.audios[window.ap.list.index]['lrc'];
        const tlyricsString = window.ap.list.audios[window.ap.list.index]['tlyrics']
        const lyrics = getLine(lyricsString);
        const tlyrics = getLine(tlyricsString);
        lyric_array = add_translation(lyrics, tlyrics)
        if (lyric_array) {
            setLyrics(lyric_array);
        }
        create_album();
        showTranslations();
    } catch (e) {
    }

    function setLyrics(lyrics) {
        const lyricsList = document.querySelector('.lyrics-list');
        lyricsList.innerHTML = "";
        // 为每一行歌词创建一个 li 元素并添加到歌词容器中
        lyrics.forEach(lyric => {
            const li = document.createElement("li");
            const t_li = document.createElement("li")
            li.textContent = lyric.content;
            if (lyric.translate) {
                t_li.textContent = lyric.translate;
                t_li.setAttribute("data-time", formatTime(lyric.time))
                t_li.classList.add("translate");
            }
            li.setAttribute("data-time", formatTime(lyric.time));
            // 添加 flex 容器类名
            li.classList.add("centered-li");
            lyricsList.appendChild(li);
            if (lyric.translate) {
                lyricsList.appendChild(t_li);
            }
        });
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds)}`;
    }

    function padZero(number) {
        return number.toString().padStart(2, "0");
    }

    function getLine(lyricsString) {
        const regex = /\[(\d+):(\d+\.\d+)\](.*)/g;
        const lyrics = [];
        let match;
        while ((match = regex.exec(lyricsString)) !== null) {
            const minute = parseInt(match[1]);
            const second = parseFloat(match[2]);
            const time = minute * 60 + second;
            const content = match[3];
            lyrics.push({
                time,
                content
            });
        }
        return lyrics
    }

    function create_album() {
        var music = window.ap.list.audios[window.ap.list.index]
        // 获取.album-art元素的引用
        $('.artist-name').html(music.name + '<div class="control-collect" data-song-id=""\n' +
            '                         data-song-singer=""\n' +
            '                         data-song-cover=""\n' +
            '                         data-song-name="" style="position:relative;">\n' +
            '                        <svg t="1686316931118" class="icon" viewBox="0 0 1179 1024" version="1.1"\n' +
            '                             xmlns="http://www.w3.org/2000/svg" p-id="2619" width="25" height="25">\n' +
            '                            <path d="M142.31918 540.267127l350.13559 373.653781c54.296613 63.852817 139.806023 63.883844 195.033436-1.054906l362.204951-388.670672c42.661625-48.866952 65.466202-112.130263 65.466203-182.902021a279.239726 279.239726 0 0 0-501.018122-169.653647 30.99561 30.99561 0 0 1-25.534922 12.131415 30.99561 30.99561 0 0 1-25.503895-12.131415A279.239726 279.239726 0 0 0 62.053272 341.293309c0 72.850542 28.792718 144.242832 77.411458 195.498835 1.054906 1.116959 1.985705 2.264944 2.85445 3.474983z m-54.606879 31.926409A349.732244 349.732244 0 0 1 0 341.293309C0 152.806494 152.806184 0.00031 341.292999 0.00031c95.065613 0 183.708713 39.155615 247.313317 106.111096A340.486306 340.486306 0 0 1 835.95066 0.00031c188.486815 0 341.292999 152.806184 341.292999 341.292999 0 80.793361-25.069522 154.636755-72.198982 213.463257-1.147986 1.923651-2.482131 3.754223-4.095516 5.491715l-5.181449 5.553768c-2.699317 3.071637-5.491715 6.112247-8.315138 9.090804-0.620533 0.620533-1.210039 1.241065-1.861598 1.799545L733.810974 954.069375c-79.055869 93.048882-209.553901 93.017855-287.616918 1.147985L90.783938 576.040839a31.243823 31.243823 0 0 1-3.102664-3.847303z"\n' +
            '                                  fill="#d81e06" p-id="2620"></path>\n' +
            '                        </svg>\n' +
            '                    </div>');
        $('.song-title').text(music.artist);
        // 获取按钮元素
        var button = document.querySelector('.control-collect');
        button.setAttribute('data-song-id', music.id);
        button.setAttribute('data-song-singer', music.artist);
        button.setAttribute('data-song-cover', music.cover);
        button.setAttribute('data-song-name', music.name);
        var albumArt = document.querySelector('.album-art');
        // 替换背景图片链接
        albumArt.style.background = '#fff url(' + music.cover + ') center/cover no-repeat';
        // 获取.vinyl元素的引用
        var vinyl = document.querySelector('.vinyl');
        // 替换背景图片链接
        vinyl.style.backgroundImage = 'url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/83141/vinyl.png"), url(' + music.cover + ')';
    }
}

function autoScrollLyrics() {
    if (!window.isScrolling) {
        const currentTime = window.ap.audio.currentTime;
        const lyricsLines = Array.from(document.querySelectorAll('.lyrics-list .centered-li'));
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
                    line.style.fontSize = '25px';
                } else {
                    line.style.fontSize = ''; // 清除字体大小
                    line.style.animation = ''; // 清除动画属性
                }
            });

        }
    }
}

function add_translation(origin, translation) {
    let translationIndex = 0;
    return origin.map(item => {
        if (translationIndex < translation.length && item.time === translation[translationIndex].time) {
            item.translate = translation[translationIndex].content;
            translationIndex++;
        }
        return item;
    });
}

function showTranslations() {
    const switchToggle = document.getElementById('switch-toggle');
    const translateElements = document.querySelectorAll('.lyrics-list .translate');
    switchToggle.addEventListener('change', function () {
        if (!this.checked) {
            translateElements.forEach(element => {
                element.style.display = 'none';
            });
        } else {
            translateElements.forEach(element => {
                element.style.display = '';
            });
        }
    });
}
