import uuid
from app import db
from sqlalchemy.dialects.mysql import BINARY
from sqlalchemy import Column, String, Integer, Date, Time, ForeignKey

# Function to generate UUID as bytes for MySQL
def generate_uuid():
    return uuid.uuid4().bytes

class User(db.Model):
    id = Column(BINARY(16), primary_key=True, default=generate_uuid, unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    bookings = db.relationship('TableBooking', backref='user', lazy=True)
    role = Column(String(20), default="user") 

    def get_uuid(self):
        """Convert BINARY(16) UUID to string format for readability"""
        return str(uuid.UUID(bytes=self.id))
    
    def is_admin(self):
        return self.role == "admin"


class TableBooking(db.Model):
    id = Column(BINARY(16), primary_key=True, default=generate_uuid, unique=True, nullable=False)
    user_id = Column(BINARY(16), ForeignKey('user.id'), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    status = Column(String(50), default="Pending")
    tables = db.relationship('Table', backref='booking', lazy=True)

    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))


class Table(db.Model):
    __tablename__ = 'tables'  # Avoid MySQL reserved keyword conflicts
    id = Column(BINARY(16), primary_key=True, default=generate_uuid, unique=True, nullable=False)
    booking_id = Column(BINARY(16), ForeignKey('table_booking.id'), nullable=False)
    user_id = Column(BINARY(16), ForeignKey('user.id'), nullable=False)
    table_number = Column(Integer, nullable=False)
    booking_date = Column(Date, nullable=False)
    booking_time = Column(Time, nullable=False)
    booking_status = Column(String(50), default="Pending")

    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))
