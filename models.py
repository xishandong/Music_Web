from exts import db


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(500), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    interval = db.Column(db.Float(precision=1), nullable=False, default=2)
    avatar = db.Column(db.String(500), nullable=False, default='')
    songs = db.relationship('Song', secondary='user_song', backref=db.backref('users', lazy='dynamic'))
    history = db.relationship('Song', secondary='user_history', backref=db.backref('users_history', lazy='dynamic'))
    playlists = db.relationship('Playlist', backref='users', cascade="all, delete-orphan")


class UserSong(db.Model):
    __tablename__ = 'user_song'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
    song_id = db.Column(db.String(100), db.ForeignKey('song.id', ondelete='CASCADE'), primary_key=True)


class Song(db.Model):
    __tablename__ = "song"
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    singer = db.Column(db.String(100), nullable=False)
    cover_url = db.Column(db.String(500), nullable=False)
    score = db.Column(db.String(100), nullable=False)


class UserHistory(db.Model):
    __tablename__ = "user_history"
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
    song_id = db.Column(db.String(100), db.ForeignKey('song.id', ondelete='CASCADE'), primary_key=True)
    times = db.Column(db.Integer, nullable=False, default=0)


class Playlist(db.Model):
    __tablename__ = 'playlists'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    cover = db.Column(db.String(500), nullable=False, default='img/default_cover.png')
    songs = db.relationship('Song', secondary='playlist_song',
                            backref=db.backref('playlists', lazy='dynamic', cascade="save-update, merge"))


class PlaylistSong(db.Model):
    __tablename__ = 'playlist_song'
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.id', ondelete='CASCADE'), primary_key=True)
    song_id = db.Column(db.String(100), db.ForeignKey('song.id', ondelete='CASCADE'), primary_key=True)
