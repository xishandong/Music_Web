from flask import render_template, Blueprint, request, jsonify, g

from crawl_model.wangyi import Wangyi
from .user import history_add

bp = Blueprint("music", __name__, url_prefix='/')
wy = Wangyi()


@bp.route('music/search', methods=['POST'])
def search():
    query = request.json.get('query')
    items = wy.search(query, 0)
    return render_template('search.html', items=items, query=query)


@bp.route('music/play', methods=['POST'])
def play():
    song_id = request.json['id']
    info = request.json['info']
    url = wy.get_musicUrl(song_id)
    lyrics = wy.get_lyric(song_id)
    infos = 'None'
    if g.user:
        infos = history_add(song_id, info)
    music = {
        'name': info['song'],
        'singer': info['singer'],
        'cover_url': info['cover'],
        'url': url,
        'lyrics': lyrics[0],
        'id': song_id,
        'tlyrics': lyrics[1]
    }
    return jsonify({'success': 200, 'song': music, 'infos': infos})


@bp.route('music/now')
def now():
    return render_template('play_index.html')


@bp.route('music/collected')
def collected():
    return render_template('collect.html')


@bp.route('music/playlist')
def playlist():
    return render_template('playlist.html')


@bp.route('music/retry', methods=['POST'])
def retry():
    infos = 'None'
    song_id = request.json['id']
    url = wy.get_musicUrl(song_id)
    if g.user:
        infos = history_add(song_id, 'None')
    lyrics = wy.get_lyric(song_id)
    return jsonify({'success': 200, 'url': url, 'infos': infos, 'lyrics': lyrics[0], 'tlyrics': lyrics[1]})
