import uuid

class BookingDTO:
    def __init__(self, id, user_id, date, time, status, tables=None):
        self.id = str(uuid.UUID(bytes=id)) if isinstance(id, bytes) else id
        self.user_id = str(uuid.UUID(bytes=user_id)) if isinstance(user_id, bytes) else user_id
        self.date = date.isoformat()
        self.time = time.strftime("%H:%M:%S")
        self.status = status
        self.tables = [
            {
                "id": str(uuid.UUID(bytes=table.id)) if isinstance(table.id, bytes) else table.id,
                "table_number": table.table_number,
                "booking_date": table.booking_date.isoformat(),
                "booking_time": table.booking_time.strftime("%H:%M:%S"),
                "booking_status": table.booking_status,
            }
            for table in (tables or [])  # Handle case where tables may be None
        ]

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date,
            "time": self.time,
            "status": self.status,
            "tables": self.tables
        }
