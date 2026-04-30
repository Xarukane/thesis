





   

from typing import Sequence, Union



from alembic import op

import sqlalchemy as sa





                                        

revision: str = 'ef568eac5060'

down_revision: Union[str, Sequence[str], None] = None

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None





def upgrade() -> None:

                         

                                                                 

    op.alter_column('listings', 'category',

               existing_type=sa.VARCHAR(),

               nullable=False)

    op.alter_column('listings', 'location',

               existing_type=sa.VARCHAR(),

               nullable=False)

    op.alter_column('listings', 'is_active',

               existing_type=sa.BOOLEAN(),

               nullable=False)

    op.alter_column('listings', 'created_at',

               existing_type=sa.DATETIME(),

               nullable=False)

    op.alter_column('listings', 'owner_id',

               existing_type=sa.INTEGER(),

               nullable=False)

    op.create_index(op.f('ix_listings_category'), 'listings', ['category'], unique=False)

    op.alter_column('users', 'is_admin',

               existing_type=sa.BOOLEAN(),

               nullable=False)

    op.alter_column('users', 'created_at',

               existing_type=sa.DATETIME(),

               nullable=False)

                                  





def downgrade() -> None:

                           

                                                                 

    op.alter_column('users', 'created_at',

               existing_type=sa.DATETIME(),

               nullable=True)

    op.alter_column('users', 'is_admin',

               existing_type=sa.BOOLEAN(),

               nullable=True)

    op.drop_index(op.f('ix_listings_category'), table_name='listings')

    op.alter_column('listings', 'owner_id',

               existing_type=sa.INTEGER(),

               nullable=True)

    op.alter_column('listings', 'created_at',

               existing_type=sa.DATETIME(),

               nullable=True)

    op.alter_column('listings', 'is_active',

               existing_type=sa.BOOLEAN(),

               nullable=True)

    op.alter_column('listings', 'location',

               existing_type=sa.VARCHAR(),

               nullable=True)

    op.alter_column('listings', 'category',

               existing_type=sa.VARCHAR(),

               nullable=True)

                                  

