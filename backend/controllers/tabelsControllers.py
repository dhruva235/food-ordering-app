from flask import Blueprint, request, jsonify
from commands.tabelCommands import TabelCommands
from dto.bookingDto import BookingDTO
from extensions import db
from models import TableBooking
import uuid

tables_bp = Blueprint("tables_bp", __name__)

@tables_bp.route("/", methods=["GET"])
def get_bookings():
    tabel_dto = TabelCommands.get_all_tables()
    return jsonify([b.to_dict() for b in   tabel_dto ])