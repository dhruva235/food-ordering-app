
from flask import jsonify
from dto.tabelDto import TableDTO
from models import Table  # Ensure correct import
from extensions import db

class TabelCommands:
    @staticmethod
    def get_all_tables():
        tables = Table.query.all()
        return [TableDTO(b.id, b.booking_id, b.user_id, b.table_number, b.booking_date, b.booking_time, b.booking_status) for b in tables]
