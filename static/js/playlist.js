$(document).ready(function () {
    update_list();
    add_playing();
    table = $('.files-table-row');
    table.off('click');
    table.on('click', function (event) {
        if (!$(event.target).hasClass('more-action')) {
            var index = this.getAttribute('index')
            window.ap.list.switch(parseInt(index));
            add_playing()
            if (window.ap.paused) {
                window.ap.play()
            }
        }
    });
    bb = $('.more-action');
    bb.on('click', function (event) {
        event.stopPropagation();
        var index = this.getAttribute('index')
        var row = $(this).closest('.files-table-row');
        window.ap.list.remove(parseInt(index));
        row.fadeOut(500, function () {
            row.remove(); // 在动画结束后移除该行
            reorderIndexes();
            add_playing()
        });
    });
})

function update_list() {
    var files = window.ap.list.audios
    var filesTable = document.querySelector('.files-table'),
        page = document.querySelector('.page-right-content')
    if (files.length !== 0) {
        for (var i = 0; i < files.length; i++) {
            var row = document.createElement('div');
            row.classList.add('files-table-row');
            row.setAttribute('index', i)
            // 创建并设置文件信息单元格元素
            var idCell = document.createElement('div');
            idCell.classList.add('table-cell', 'name-cell');
            idCell.textContent = files[i].id;
            var songCell = document.createElement('div');
            songCell.classList.add('table-cell', 'song-cell');
            songCell.textContent = files[i].name;
            var artistCell = document.createElement('div');
            artistCell.classList.add('table-cell', 'size-cell');
            artistCell.textContent = files[i].artist;
            // 创建操作单元格元素
            var actionCell = document.createElement('div');
            actionCell.classList.add('table-cell', 'action-cell');
            var moreActionBtn = document.createElement('button');
            moreActionBtn.classList.add('more-action');
            moreActionBtn.setAttribute('index', i)
            actionCell.appendChild(moreActionBtn);
            // 将单元格元素添加到文件表格行元素中
            row.appendChild(idCell);
            row.appendChild(songCell);
            row.appendChild(artistCell);
            row.appendChild(actionCell);
            // 将文件表格行元素添加到文件表格中
            filesTable.appendChild(row);
        }
    } else {
        var noSongsContainer = document.createElement('div');
        noSongsContainer.classList.add('no-songs-container');

        var noSongsMessage = document.createElement('h1');
        noSongsMessage.textContent = '暂无歌曲';

        noSongsContainer.appendChild(noSongsMessage);
        page.appendChild(noSongsContainer);
    }

}

// 重新排序 index 属性
function reorderIndexes() {
    $('.files-table-row').each(function (index, row) {
        $(row).attr('index', index);
    });
    $('.more-action').each(function (index, row) {
        $(row).attr('index', index);
    });
}

