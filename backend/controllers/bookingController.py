from flask import Blueprint, request, jsonify
from commands.bookingCommands import BookingCommands
from dto.bookingDto import BookingDTO
from extensions import db
from models import TableBooking
import uuid

booking_bp = Blueprint("booking_bp", __name__)

@booking_bp.route("/", methods=["POST"])
def book_table():
    data = request.json
    print(f"Received request data: {data}")  # Debugging
    if not data.get("user_id") or not data.get("date") or not data.get("time"):
        return jsonify({"message": "Missing required fields"}), 400

    booking_dto = BookingCommands.create_booking(data["user_id"], data["date"], data["time"])
    # Since create_booking now returns jsonify directly, no need to call to_dict here
    return booking_dto  # Return the response directly from the BookingCommands

@booking_bp.route("/", methods=["GET"])
def get_bookings():
    bookings_dto = BookingCommands.get_all_bookings()
    return jsonify([b.to_dict() for b in bookings_dto])

@booking_bp.route("/<string:booking_uuid>", methods=["GET"])
def get_individual_booking(booking_uuid):
    try:
        binary_uuid = uuid.UUID(booking_uuid).bytes  # Convert string UUID to binary
        booking = TableBooking.query.get(binary_uuid)  # Query using binary UUID
        
        if booking is None:
            return jsonify({"error": "Booking not found"}), 404

        booking_dto = BookingDTO(
            id=booking.id,
            user_id=booking.user_id,
            date=booking.date,
            time=booking.time,
            status=booking.status,
            tables=booking.tables
        )

        return jsonify(booking_dto.to_dict()), 200

    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400


@booking_bp.route("/<string:booking_id>", methods=["PUT"])
def update_booking(booking_id):
    data = request.json
    status = data.get("status")
    if not status:
        return jsonify({"message": "Status required"}), 400
    
    booking_dto = BookingCommands.update_booking_status(booking_id, status)
    if not booking_dto:
        return jsonify({"message": "Booking not found"}), 404

    return jsonify(booking_dto.to_dict())

@booking_bp.route("/<string:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    result = BookingCommands.delete_booking(booking_id)
    if not result:
        return jsonify({"message": "Booking not found"}), 404
    return jsonify({"message": "Booking deleted successfully"})

@booking_bp.route("/<string:booking_id>/assign-table", methods=["POST"])
def assign_table(booking_id):
    data = request.json
    table_number = data.get("table_number")

    if not table_number:
        return jsonify({"error": "Table number is required"}), 400

    return BookingCommands.assign_table(booking_id, table_number)

