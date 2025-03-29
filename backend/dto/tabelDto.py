import uuid

class TableDTO:
    def __init__(self, id, booking_id, user_id, table_number, booking_date, booking_time, booking_status):
        self.id = self.convert_uuid(id)
        self.user_id = self.convert_uuid(user_id)
        self.booking_id = self.convert_uuid(booking_id)
        self.booking_date = booking_date
        self.time = booking_time
        self.status = booking_status
        self.table_number = table_number

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
            "date": self.booking_date.isoformat(),
            "time": self.time.strftime("%H:%M:%S"),
            "status": self.status,
            "table_number": self.table_number
        }
