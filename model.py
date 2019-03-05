psfrom flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """User of sumBlocks website."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(64), nullable=False)
    username = db.Column(db.String(100), nullable=False, server_default='')

    wallets = db.relationship('Wallet')

    def __repr__(self):
        """Provide helpful representation when printed."""
        return f"<User user_id={self.user_id} email={self.email}>"


class Wallet(db.Model):
    """A user's stored wallet address """

    __tablename__ = "wallets"

    wallet_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    wallet_address = db.Column(db.String(64), nullable=False)
    wallet_alias = db.Column(db.String(64), nullable=True)

    user = db.relationship('User')

    def __repr__(self):
        s = f"""<Wallet wallet_id={self.wallet_id} 
                 wallet_address={self.wallet_address}>"""
        return s



def connect_to_db(app):
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///sumblocks'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    
    from server import app
    connect_to_db(app)
    print("Connected to DB.")
