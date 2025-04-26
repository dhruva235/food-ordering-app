import datetime
from flask import jsonify
from constants.enums import BookingStatus
from models import Table, TableBooking
import uuid
from dto.bookingDto import BookingDTO
from extensions import db

class BookingCommands:
    @staticmethod
    def create_booking(user_id, date, time):
        try:
            # Ensure user_id is in UUID string format
            user_id_bytes = str(uuid.UUID(user_id))  # Ensure user_id is a string representation of UUID

            # Check the number of bookings for the user
            existing_bookings = TableBooking.query.filter_by(user_id=user_id_bytes).count()
            if existing_bookings >= 2:
                return jsonify({"message": "User has reached the maximum booking limit of 2."}), 400

            # Validate and convert date format
            try:
                booking_date = datetime.datetime.strptime(date, "%d-%m-%Y").date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use DD-MM-YYYY."}), 400

            # Create the booking
            new_booking = TableBooking(
                user_id=user_id_bytes,
                date=booking_date,
                time=time,
                status=BookingStatus.PENDING.value  # Use Enum for status
            )
            db.session.add(new_booking)
            db.session.commit()

            # Convert booking to DTO
            booking_dto = BookingDTO(
               new_booking.id,
                new_booking.user_id,
                new_booking.date,
                new_booking.time,
                new_booking.status
            )
            return jsonify(booking_dto.to_dict()), 201

        except KeyError as e:
            return jsonify({"error": f"Missing required field: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_all_bookings():
        try:
            bookings = TableBooking.query.all()
            # Return all bookings converted into DTOs
            return jsonify([BookingDTO(b.id, b.user_id, b.date, b.time, b.status).to_dict() for b in bookings]), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_booking_by_id(booking_id):
        try:
            # Ensure booking_id is in string format, and attempt to convert it to UUID
            booking_id = str(booking_id)  # Convert booking_id to string to ensure proper comparison

            # Debugging print statement
            print(f"Attempting to retrieve booking with ID: {booking_id}")

            # Attempt to get the booking from the database by its UUID
            booking = TableBooking.query.get(booking_id)
            
            # Debugging print to check the result of the query
            print(f"Booking fetched: {booking}")

            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            booking_dto = BookingDTO(
                booking.id,
                booking.user_id,
                booking.date,
                booking.time,
                booking.status
            )
            return jsonify(booking_dto.to_dict()), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_booking_status(booking_id, status):
        if status not in [e.value for e in BookingStatus]:  # Ensure valid status
            return jsonify({"error": "Invalid booking status"}), 400

        try:
            # Ensure booking_id is in string format
            booking_id = str(booking_id)
            booking = TableBooking.query.get(booking_id)
            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            booking.status = status
            db.session.commit()

            booking_dto = BookingDTO(
                booking.id,
                booking.user_id,
                booking.date,
                booking.time,
                booking.status
            )
            return jsonify(booking_dto.to_dict()), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_booking(booking_id):
        try:
            # Ensure booking_id is in string format
            booking_id = str(booking_id)
            booking = TableBooking.query.get(booking_id)
            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            db.session.delete(booking)
            db.session.commit()
            return jsonify({"message": "Booking deleted successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def assign_table(booking_id, table_number):
        try:
            # Ensure booking_id is in string format
            booking_id = str(booking_id)
            booking = TableBooking.query.get(booking_id)

            if not booking:
                return jsonify({"error": "Booking not found"}), 404

            # Check if the table is already assigned on the same date
            existing_table = Table.query.filter_by(table_number=table_number, booking_date=booking.date).first()
            if existing_table:
                return jsonify({"error": "Table already assigned for this date"}), 400

            # Check if a table is already assigned for this booking
            assigned_table = next((t for t in booking.tables if t.booking_status == BookingStatus.CONFIRMED.value), None)
            if assigned_table:
                return jsonify({"message": f"This booking already has an assigned table: {assigned_table.table_number}"}), 200

            # Assign the table using existing booking details
            new_table = Table(
                booking_id=booking.id,
                user_id=booking.user_id,
                table_number=table_number,
                booking_date=booking.date,
                booking_time=booking.time,
                booking_status=BookingStatus.CONFIRMED.value,
                is_booked=True
            )

            db.session.add(new_table)
            booking.status = BookingStatus.CONFIRMED.value  # Update booking status
            db.session.commit()

            return jsonify({
                "message": "Table assigned successfully",
                "booking_id": booking_id,
                "table_id": new_table.id,
                "status": BookingStatus.CONFIRMED.value
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
