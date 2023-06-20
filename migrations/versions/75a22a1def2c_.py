"""empty message

Revision ID: 75a22a1def2c
Revises: 8812661b260d
Create Date: 2023-05-30 23:21:28.454772

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '75a22a1def2c'
down_revision = '8812661b260d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user_history',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('song_id', sa.String(length=100), nullable=False),
    sa.Column('times', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['song_id'], ['song.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'song_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_history')
    # ### end Alembic commands ###