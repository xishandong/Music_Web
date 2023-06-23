import logging
import random
from datetime import timedelta
from logging.handlers import RotatingFileHandler

from flask import Flask, session, g, render_template
from flask_migrate import Migrate
from sqlalchemy import func

import config
from blueprints.music import bp as music_bp
from blueprints.user import bp as user_bp
from exts import db
from models import User, Song

app = Flask(__name__)
# 添加配置文件
app.config.from_object(config)
db.init_app(app)
migrate = Migrate(app, db)

# 注册蓝图
app.register_blueprint(user_bp)
app.register_blueprint(music_bp)

# 配置日志记录器
handler = RotatingFileHandler('app.log', maxBytes=1048576, backupCount=10)
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)


# before_request/ before_first_request/ after_request
@app.before_request
def get_session():
    # 在登录成功后设置cookie过期时间为一年
    session.permanent = True
    app.permanent_session_lifetime = timedelta(days=365)
    user_id = session.get("user_id")
    if user_id:
        user = User.query.get(user_id)
        setattr(g, "user", user)
    else:
        setattr(g, "user", None)


@app.context_processor
def my_context_processor():
    status = session.get('status', '')
    return {"user": g.user, 'status': status}


@app.route('/')
def hello_world():  # put application's code here
    artist = ["Taylor Swift", 'iu', '陈奕迅', '五月天', '陈绮贞', 'Adele', 'Ariana Grande', 'BLACKPINK']
    this = random.choice(artist)
    random_songs = db.session.query(Song).filter(Song.singer == this).order_by(func.random()).limit(8).all()
    songs = db.session.query(Song).order_by(func.random()).limit(8).all()
    return render_template('index.html', random_songs=random_songs, this=this, songs=songs)


if __name__ == '__main__':
    app.run()
