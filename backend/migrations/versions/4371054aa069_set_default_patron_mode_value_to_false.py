"""set default value for patron mode to false

Revision ID: 4371054aa069
Revises: 4d1fb6176df7
Create Date: 2023-10-19 12:55:00.860172

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm

from app.infrastructure.database import User


# revision identifiers, used by Alembic.
revision = "4371054aa069"
down_revision = "4d1fb6176df7"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    session = orm.Session(bind=bind)

    for user in session.query(User).all():
        user.patron_mode = False

    session.commit()

    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column("patron_mode", existing_type=sa.BOOLEAN(), nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column("patron_mode", existing_type=sa.BOOLEAN(), nullable=True)

    # ### end Alembic commands ###

    bind = op.get_bind()
    session = orm.Session(bind=bind)

    for user in session.query(User).filter(User.patron_mode.is_(False)).all():
        user.patron_mode = None

    session.commit()
