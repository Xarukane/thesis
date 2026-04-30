





   

from typing import Sequence, Union



from alembic import op

import sqlalchemy as sa





                                        

revision: str = '8d8d72d15594'

down_revision: Union[str, Sequence[str], None] = 'ef568eac5060'

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None





def upgrade() -> None:

                         

                                                                 

    op.add_column('users', sa.Column('profile_image', sa.String(), nullable=True))

                                  





def downgrade() -> None:

                           

                                                                 

    op.drop_column('users', 'profile_image')

                                  

