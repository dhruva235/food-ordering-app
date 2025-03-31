import uuid

from constants.enums import BookingStatus


class TableDTO:
    def __init__(self, id, booking_id, user_id, table_number, booking_date, booking_time, booking_status, booked):
        self.id = self.convert_uuid(id)
        self.user_id = self.convert_uuid(user_id) if user_id else None
        self.booking_id = self.convert_uuid(booking_id) if booking_id else None
        self.booking_date = booking_date.isoformat() if booking_date else None
        self.time = booking_time.strftime("%H:%M:%S") if booking_time else None
        self.status = booking_status.value if isinstance(booking_status, BookingStatus) else booking_status
        self.table_number = table_number
        self.booked = booked

    def convert_uuid(self, value):
        """Convert BINARY(16) UUID to string format"""
        if isinstance(value, bytes):  # Convert BINARY(16) to UUID string
            return str(uuid.UUID(bytes=value))
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "booking_id": self.booking_id,
            "date": self.booking_date,
            "time": self.time,
            "status": self.status,  # Now always a string
            "table_number": self.table_number,
            "booked": self.booked
        }
