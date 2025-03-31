import uuid
from app import db
from sqlalchemy.dialects.mysql import BINARY
from sqlalchemy import Column, Float, String, Integer, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SQLAlchemyEnum

from constants.enums import BookingStatus


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
    booking_id = Column(BINARY(16), ForeignKey('table_booking.id'), nullable=True)  # Can be null if not booked
    user_id = Column(BINARY(16), ForeignKey('user.id'), nullable=True)  # Can be null if not booked
    table_number = Column(Integer, nullable=False)
    booking_date = Column(Date, nullable=True)  # Can be null if not booked
    booking_time = Column(Time, nullable=True)  # Can be null if not booked
    booking_status = Column(SQLAlchemyEnum(BookingStatus), default=BookingStatus.AVAILABLE.value, nullable=False) 
    is_booked = Column(db.Boolean, default=False)  # Flag to indicate if booked

    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))

class FoodItem(db.Model):
    id = Column(BINARY(16), primary_key=True, default=lambda: uuid.uuid4().bytes, unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(String(255), nullable=True)
    category = Column(String(50), nullable=False) 
    
    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))

class Order(db.Model):
    id = Column(BINARY(16), primary_key=True, default=lambda: uuid.uuid4().bytes, unique=True, nullable=False)
    user_id = Column(BINARY(16), ForeignKey('user.id'), nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="Pending")
    order_items = relationship('OrderItem', backref='order', lazy=True)
    
    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))

class OrderItem(db.Model):
    id = Column(BINARY(16), primary_key=True, default=lambda: uuid.uuid4().bytes, unique=True, nullable=False)
    order_id = Column(BINARY(16), ForeignKey('order.id'), nullable=False)
    food_id = Column(BINARY(16), ForeignKey('food_item.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    
    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))
    
    
class Receipt(db.Model):
    id = Column(BINARY(16), primary_key=True, default=lambda: uuid.uuid4().bytes, unique=True, nullable=False)
    order_id = Column(BINARY(16), ForeignKey('order.id'), nullable=False)
    file_path = Column(String(255), nullable=False)  # Path to the saved PDF file
    created_at = Column(db.DateTime, default=db.func.current_timestamp())

    def get_uuid(self):
        return str(uuid.UUID(bytes=self.id))

