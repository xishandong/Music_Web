# 加密cookie的key
SECRET_KEY = ''


# 数据库的配置
# MySQL的主机名
HOSTNAME = ""
# MySQL监听的端口, 默认3306
PORT = 3306
# 连接MySQL的用户名
USERNAME = ""
# 连接MySQL的密码
PASSWORD = ""
# MySQL上连接的数据库名称
DATABASE = ""
DB_URI = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}?charset=utf8'
SQLALCHEMY_DATABASE_URI = DB_URI
SQLALCHEMY_TRACK_MODIFICATIONS = False

