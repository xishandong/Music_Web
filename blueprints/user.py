import os
import time

from flask import Blueprint, render_template, request, jsonify, redirect, url_for, session, g, flash, current_app
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

from crawl_model.wangyi import Wangyi
from exts import db, system
from models import User, Song, UserSong, UserHistory, Playlist, PlaylistSong
from nlp_model.addSong_recommend import add_song, recommends
from .forms import RegisterForm, LoginForm

bp = Blueprint("user", __name__, url_prefix='/')
wy = Wangyi()  # initial wy object


@bp.route('user/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template("login.html")
    elif request.method == 'POST':
        form = LoginForm(request.form)
        if form.validate():
            email = form.email.data
            password = form.password.data
            user = User.query.filter_by(email=email).first()
            if not user:
                session['status'] = 'BAD'
                flash("no such email address")
                return redirect(url_for("user.login"))
            if check_password_hash(user.password, password):
                session['status'] = 'OK'
                flash("login Success!")
                # cookie
                session['user_id'] = user.id
                return redirect("/")
            else:
                session['status'] = 'BAD'
                flash("Wrong password")
                return redirect(url_for("user.login"))
        else:
            session['status'] = 'BAD'
            flash(form.errors)
            return redirect(url_for("user.login"))


@bp.route('user/logout')
def logout():
    session.clear()
    return redirect("/")


@bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template("register.html")
    elif request.method == 'POST':
        form = RegisterForm(request.form)
        if form.validate():
            email = form.email.data
            username = form.username.data
            password = form.password.data
            user = User(email=email, username=username, password=generate_password_hash(password))
            db.session.add(user)
            db.session.commit()
            session['status'] = 'OK'
            flash("Register Success!!Login Now!!")
            return redirect(url_for("user.login"))
        else:
            session['status'] = 'BAD'
            message = []
            for k in form.errors:
                message.append(form.errors[k][0])
            flash('<br>'.join(message))
            return redirect(url_for("user.register"))


@bp.route('user/collected', methods=['POST'])
def collected():
    if not g.user:
        return jsonify({'success': 200, 'message': '请登陆后进行操作'})
    try:
        song_id = request.json.get('id')
        info = request.json['info']
        user_id = g.user.id
        userSong = UserSong.query.filter_by(user_id=user_id, song_id=song_id).first()
        if userSong:
            return jsonify({'success': 200, 'message': '你已经收藏了该歌曲，请勿重复收藏 '})
        user = User.query.filter_by(id=user_id).first()
        song = Song.query.filter_by(id=song_id).first()
        if not song:
            song_info = add_song(song_id, info['song'], info['singer'], info['cover'])
            new_song = Song(id=str(song_info['id']), name=song_info['song'], singer=song_info['singer'],
                            cover_url=song_info['cover'],
                            score=song_info['score'])
            # 添加新歌曲到数据库
            db.session.add(new_song)
            db.session.commit()
            time.sleep(1)
            song = Song.query.filter_by(id=song_id).first()
        # 创建用户收藏
        user_song = UserSong(user_id=user.id, song_id=song.id)
        # 添加用户收藏到数据库
        db.session.add(user_song)
        db.session.commit()
        return jsonify({'success': 200, 'message': '成功收藏'})
    except Exception as e:
        current_app.logger.error('user/collected: %s', str(e))
        db.session.rollback()
        return jsonify({'success': 500, 'message': '服务器错误'})


@bp.route('user/uncollected', methods=['POST'])
def uncollected():
    if not g.user:
        return jsonify({'success': 200, 'message': '请登陆后进行操作'})
    try:
        song_id = request.json.get('id')
        user_id = g.user.id
        user = User.query.filter_by(id=user_id).first()
        song = Song.query.filter_by(id=song_id).first()
        if user and song in user.songs:
            user.songs.remove(song)
            db.session.commit()
            return jsonify({'success': 200, 'message': '成功取消收藏'})
        else:
            return jsonify({'success': 200, 'message': '歌曲错误'})
    except Exception as e:
        current_app.logger.error('user/uncollected: %s', str(e))
        db.session.rollback()
        return jsonify({'success': 500, 'message': '服务器错误'})


@bp.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    filename = file.filename
    user = User.query.filter_by(id=g.user.id).first()
    if check_file_extend(filename) and user:
        check = f'avatar-{user.id}'
        check_img_exist(check)
        file.save(system + f'/music_demo/static/img/{check}-{filename}')
        user.avatar = f'img/{check}-{filename}'
        try:
            db.session.commit()
            return jsonify({'success': 200, 'file': f'/static/img/{check}-{filename}',
                            'message': '头像上传成功，如果没有正常显示试着刷新一下浏览器'})
        except Exception as e:
            current_app.logger.error('user/update_avatar: %s', str(e))
            db.session.rollback()
            return jsonify({'success': 500, 'message': '数据库错误'})
    else:
        return jsonify({'success': 200, 'message': '请上传图片，仅支持jpg,png,webp,bmp,gif格式图片!!!'})


def history_add(song_id, info):
    try:
        user_id = g.user.id
        userSong = UserHistory.query.filter_by(user_id=user_id, song_id=song_id).first()
        if userSong:
            userSong.times += 1
            db.session.commit()
            return {'success': 200, 'message': '历史加一'}
        user = User.query.filter_by(id=user_id).first()
        song = Song.query.filter_by(id=song_id).first()
        if not song:
            song_info = add_song(song_id, info['song'], info['singer'], info['cover'])
            new_song = Song(id=str(song_info['id']), name=song_info['song'], singer=song_info['singer'],
                            cover_url=song_info['cover'],
                            score=song_info['score'])
            # 添加新歌曲到数据库
            db.session.add(new_song)
            db.session.commit()
            time.sleep(1)
            song = Song.query.filter_by(id=song_id).first()
        # 创建用户收藏
        user_song = UserHistory(user_id=user.id, song_id=song.id, times=1)
        # 添加用户收藏到数据库
        db.session.add(user_song)
        db.session.commit()
        return {'success': 200, 'message': '历史加一'}
    except Exception as e:
        current_app.logger.error('history_add: %s', str(e))
        db.session.rollback()
        return {'success': 500, 'message': '服务器错误'}


@bp.route('/hs')
def hs():
    if g.user:
        # 使用join()方法将User和UserHistory两个模型进行连接查询
        query = db.session.query(UserHistory, Song).join(Song).filter(UserHistory.user_id == g.user.id)
        # 获取用户所有歌曲的历史记录和播放次数
        history_records = query.all()
        history_records.sort(key=lambda x: x[0].times, reverse=True)
        return render_template('history.html', history=history_records[:30])
    else:
        history_records = None
        return render_template('history.html', history=history_records)


@bp.route('/user/deleteHistory', methods=['POST'])
def deleteHistory():
    if not g.user:
        return jsonify({'success': 200, 'message': '请登陆后进行操作'})
    try:
        song_id = request.json.get('id')
        user_id = g.user.id
        user = User.query.filter_by(id=user_id).first()
        song = Song.query.filter_by(id=song_id).first()
        if user and song in user.history:
            user.history.remove(song)
            db.session.commit()
            return jsonify({'success': 200, 'message': '成功删除该歌曲历史记录'})
        else:
            return jsonify({'success': 200, 'message': '歌曲错误'})
    except Exception as e:
        current_app.logger.error('/user/deleteHistory: %s', str(e))
        db.session.rollback()
        return jsonify({'success': 500, 'message': '服务器错误'})


@bp.route('user/recommend')
def recommend():
    if g.user:
        songs, score = recommends()
        return render_template('recommend.html', songs=songs, score=score)
    else:
        return render_template('recommend.html')


@bp.route('addSong/<name>/<page>')
def addSong(name, page):
    try:
        name = name.strip()
        songs = wy.search(name, page)  # do search
        save_song2database(songs)
        return 'success'
    except Exception as e:
        current_app.logger.error('/addSong: %s', str(e))
        return 'error'


@bp.route('addRecommend')
def addRecommend():
    try:
        songs = wy.get_everyday_recommend()
        save_song2database(songs)
        return 'success'
    except Exception as e:
        current_app.logger.error('addRecommend: %s', str(e))
        return 'error'


@bp.route('user/playlists')
def playlists():
    return render_template('playlists.html')


@bp.route('user/search_add', methods=['POST'])
def search_add():
    query = request.json.get('query')
    items = wy.search(query, 0)
    return jsonify({'query': items})


@bp.route('user/playlist_index/<id>')
def playlist_index(id):
    if id == 'collect':
        return render_template('collect.html')
    playlist = Playlist.query.filter_by(id=id).first()
    if playlist and g.user.id == playlist.user_id:
        return render_template('playlist_index.html', playlist=playlist)
    else:
        return jsonify({'success': 500, 'message': '错误操作!!'})


@bp.route('user/addPlaylist', methods=['POST'])
def add_playlist():
    name = request.form.get('playlistName')
    desc = request.form.get('playlistDesc')
    user_id = g.user.id
    if desc and name:
        playlist = Playlist(name=name, description=desc, user_id=user_id)
    elif not desc and name:
        playlist = Playlist(name=name, user_id=user_id)
    else:
        return jsonify({'success': 500, 'message': '歌单名不能为空'})
    db.session.add(playlist)
    try:
        db.session.commit()
        return jsonify({'success': 200, 'message': '歌单添加成功',
                        'info': playlist.id})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error('user/addPlaylist: %s', str(e))
        return jsonify({'success': 500, 'message': '歌单添加失败，请检查网络问题'})


@bp.route('user/addPlaylistSong', methods=['POST'])
def add_PlaylistSong():
    playlist_id = request.form.get('pid')
    song_id = request.form.get('mid')
    name = request.form.get('info[song]')
    cover = request.form.get('info[cover]')
    singer = request.form.get('info[singer]')
    if not g.user:
        return jsonify({'success': 500, 'message': '请登陆后进行操作'})
    playlist = Playlist.query.get(playlist_id)
    song = Song.query.get(song_id)
    playlist_song = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if not song:
        song_info = add_song(song_id, name, singer, cover)
        new_song = Song(id=str(song_info['id']), name=song_info['song'], singer=song_info['singer'],
                        cover_url=song_info['cover'],
                        score=song_info['score'])
        # 添加新歌曲到数据库
        db.session.add(new_song)
        db.session.commit()
        time.sleep(1)
        song = Song.query.filter_by(id=song_id).first()
    if playlist_song:
        return jsonify({'success': 500, 'message': '你已添加该歌曲，请勿重复添加'})
    if playlist and song:
        p_s = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
        db.session.add(p_s)
        try:
            db.session.commit()
            return jsonify({'success': 200, 'message': '成功添加歌曲到歌单', 'info': {
                'name': song.name, 'singer': song.singer, 'cover_url': song.cover_url, 'id': song.id
            }})
        except Exception as e:
            current_app.logger.error('user/addPlaylistSong: %s', str(e))
            db.session.rollback()
            return jsonify({'success': 500, 'message': '数据库错误'})
    else:
        return jsonify({'success': 500, 'message': '无效的歌单号或歌曲'})


@bp.route('user/add_song/<id>', methods=['GET'])
def add_song_index(id):
    return render_template('playlist_add.html', id=id)


@bp.route('user/deletePlaylist', methods=['POST'])
def delete_playlist():
    id = request.form.get('id')
    playlist = Playlist.query.filter_by(id=id).first()
    if playlist.user_id == g.user.id:
        check = f'cover-{g.user.id}-{playlist.id}'
        check_img_exist(check)
        db.session.delete(playlist)
        try:
            db.session.commit()
            return jsonify({'success': 200, 'message': '成功'})
        except Exception as e:
            current_app.logger.error('user/deletePlaylist: %s', str(e))
            return jsonify({'success': 500, 'message': '数据库错误'})
    else:
        return jsonify({'success': 500, 'message': '错误操作'})


@bp.route('user/deletePlaylistSong', methods=['POST'])
def delete_PlaylistSong():
    pid = request.form.get('pid')
    mid = request.form.get('mid')
    playlist = Playlist.query.filter_by(id=pid).first()
    song = Song.query.filter_by(id=mid).first()
    if playlist.user_id == g.user.id:
        if song in playlist.songs:
            playlist.songs.remove(song)
            try:
                db.session.commit()
                return jsonify({'success': 200, 'message': '歌曲从歌单中移除'})
            except Exception as e:
                current_app.logger.error('user/deletePlaylistSong: %s', str(e))
                return jsonify({'success': 200, 'message': '数据库错误'})
    else:
        return jsonify({'success': 500, 'message': '错误操作!'})


@bp.route('user/edit_playlist', methods=['POST'])
def edit_playlist():
    name = request.form.get('name')
    desc = request.form.get('desc')
    pid = request.form.get('pid')
    playlist = Playlist.query.filter_by(id=pid).first()
    if g.user.id == playlist.user_id:
        if name and desc and playlist:
            playlist.name = name
            playlist.description = desc
        elif name and not desc and playlist:
            playlist.name = name
        elif not name and playlist and desc:
            playlist.description = desc
        else:
            return jsonify({'success': 200, 'message': '未作任何修改!'})
        try:
            db.session.commit()
            return jsonify({'success': 200, 'message': '成功修改歌单信息!'})
        except Exception as e:
            current_app.logger.error('user/edit_playlist: %s', str(e))
            db.session.rollback()
            return jsonify({"message": '数据库错误', 'success': 500})
    else:
        return jsonify({'success': 500, 'message': '错误操作'})


@bp.route('user/upload_cover/<id>', methods=['POST'])
def upload_cover(id):
    file = request.files['file']
    filename = file.filename
    playlist = Playlist.query.filter_by(id=id).first()
    if playlist.user_id == g.user.id:
        if check_file_extend(filename) and playlist:
            check = f'cover-{g.user.id}-{playlist.id}'
            check_img_exist(check)
            file.save(system + f'/music_demo/static/img/{check}-{filename}')
            playlist.cover = f'img/{check}-{filename}'
            try:
                db.session.commit()
                return jsonify({'success': 200, 'file': f'/static/img/{check}-{filename}',
                                'message': '头像上传成功，如果没有正常显示试着刷新一下浏览器'})
            except Exception as e:
                current_app.logger.error('user/update_avatar: %s', str(e))
                db.session.rollback()
                return jsonify({'success': 500, 'message': '数据库错误'})
        else:
            return jsonify({'success': 200, 'message': '请上传图片，仅支持jpg,png,webp,bmp,gif格式图片!!!'})
    else:
        return jsonify({'success': 500, 'message': '错误操作'})


def save_song2database(songs):
    for song in songs:
        existing_song = Song.query.filter_by(id=str(song['id'])).first()
        if existing_song:
            continue
        song_info = add_song(song['id'], song['name'], song['singer'], song['cover_url'])  # use add song function
        new_song = Song(id=str(song_info['id']), name=song_info['song'], singer=song_info['singer'],
                        cover_url=song_info['cover'],
                        score=song_info['score'])
        current_app.logger.info(new_song)
        db.session.add(new_song)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            current_app.logger.error("An integrity error occurred. The transaction has been rolled back.")


def check_file_extend(filename):
    # 检查文件拓展名，这个也可以在前端写
    extend = os.path.splitext(filename)[-1]
    if extend not in ['.jpg', '.png', '.JPG', '.PNG', '.webp', '.jpeg', '.JPEG', '.gif',
                      'GIF', '.bmp', '.BMP']:
        return False
    else:
        return True


def check_img_exist(id):
    folder_path = system + '/music_demo/static/img'  # 替换为实际的文件夹路径
    # 获取文件夹中所有文件的列表
    file_list = os.listdir(folder_path)
    # 遍历文件列表
    for file_name in file_list:
        if file_name.startswith(f'{id}-'):
            file_path = os.path.join(folder_path, file_name)
            os.remove(file_path)
