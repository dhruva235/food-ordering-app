import os
from urllib.parse import quote_plus

class Config:
    password = quote_plus("Balekonda@303")
    SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://root:{password}@localhost:3306/hotel_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
