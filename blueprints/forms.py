import wtforms
from wtforms.validators import Email, Length, EqualTo
from models import User


class EmailVerify(wtforms.Form):
    def __call__(self, form, field):
        email = field.data
        user = User.query.filter_by(email=email).first()
        if user:
            raise wtforms.ValidationError(message="该邮箱已经被注册!")


class RegisterForm(wtforms.Form):
    email = wtforms.StringField(validators=[Email(message="邮箱格式错误"), EmailVerify()])
    username = wtforms.StringField(validators=[Length(min=3, max=20, message="用户名格式错误, 最少3位，至多20位!")])
    password = wtforms.StringField(validators=[Length(min=6, max=20, message="密码格式错误! 最少6位, 最多20位!")])
    password_confirm = wtforms.StringField(
        validators=[EqualTo("password", message="两次输入密码不一致! 请检查密码输入!")])


class LoginForm(wtforms.Form):
    email = wtforms.StringField(validators=[Email(message="邮箱格式错误")])
    password = wtforms.StringField(validators=[Length(min=6, max=20, message="密码格式错误! 最少6位, 最多20位!")])
