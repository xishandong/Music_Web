# 加密cookie的key
SECRET_KEY = 'dxsshidashuaibihhh'


# 数据库的配置
# MySQL的主机名
HOSTNAME = "113.125.109.60"
# MySQL监听的端口, 默认3306
PORT = 3306
# 连接MySQL的用户名
USERNAME = "root"
# 连接MySQL的密码
PASSWORD = "!d0x9sDXS"
# MySQL上连接的数据库名称
DATABASE = "nlp_final"
DB_URI = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}?charset=utf8'
SQLALCHEMY_DATABASE_URI = DB_URI
SQLALCHEMY_TRACK_MODIFICATIONS = False

