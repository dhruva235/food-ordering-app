import datetime
import uuid
from flask import request, jsonify  # Ensure jsonify is imported
from models import Table, TableBooking
from dto.bookingDto import BookingDTO
from extensions import db

class BookingCommands:
    @staticmethod
    def create_booking(user_id, date, time):
        try:
            # Convert user_id to BINARY(16)
            user_id_bytes = uuid.UUID(user_id).bytes

            # Check the number of bookings for the user
            existing_bookings = TableBooking.query.filter_by(user_id=user_id_bytes).count()
            if existing_bookings >= 2:
                return jsonify({"message": "User has reached the maximum booking limit of 2."}), 400

            # Validate and convert the date format
            try:
                booking_date = datetime.datetime.strptime(date, "%d-%m-%Y").date()  # Convert to date object
            except ValueError:
                return jsonify({"error": "Invalid date format. Use DD-MM-YYYY."}), 400

            # Create the booking
            new_booking = TableBooking(
                user_id=user_id_bytes,
                date=booking_date,
                time=time,
                status="Pending"
            )
            db.session.add(new_booking)
            db.session.commit()

            # Return the booking details in DTO format
            booking_dto = BookingDTO(
                str(uuid.UUID(bytes=new_booking.id)), 
                str(uuid.UUID(bytes=new_booking.user_id)),  # Convert back to string for response
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
        bookings = TableBooking.query.all()
        return [BookingDTO(b.id, b.user_id, b.date, b.time, b.status) for b in bookings]

    @staticmethod
    def get_booking_by_id(booking_id):
        booking = TableBooking.query.get(booking_id)
        if not booking:
            return None
        return BookingDTO(booking.id, booking.user_id, booking.date, booking.time, booking.status)

    @staticmethod
    def update_booking_status(booking_id, status):
        booking = TableBooking.query.get(booking_id)
        if not booking:
            return None
        booking.status = status
        db.session.commit()
        return BookingDTO(booking.id, booking.user_id, booking.date, booking.time, booking.status)

    @staticmethod
    def delete_booking(booking_id):
        booking = TableBooking.query.get(booking_id)
        if not booking:
            return None
        db.session.delete(booking)
        db.session.commit()
        return True  # Indicates success
    
    @staticmethod
    def assign_table(booking_id, table_number):
        try:
            # Convert string UUID to binary
            booking_uuid = uuid.UUID(booking_id).bytes

            # Fetch the booking
            booking = TableBooking.query.get(booking_uuid)
        

            # Check if the table is already assigned
            existing_table = Table.query.filter_by(table_number=table_number, booking_date=booking.date).first()
            if existing_table:
                return jsonify({"error": "Table already assigned for this date"}), 400
            
              # Check if a table is already assigned
            assigned_table = next((t for t in booking.tables if t.booking_status == "Confirmed"), None)
            print(assigned_table)

            if assigned_table:
               return jsonify({"message": f"This booking already has an assigned table: {assigned_table.table_number}"}), 200

            # Assign the table
            new_table = Table(
                booking_id=booking.id,
                user_id=booking.user_id,
                table_number=table_number,
                booking_date=booking.date,
                booking_time=booking.time,
                booking_status="Confirmed"
            )

            db.session.add(new_table)
            booking.status = "Confirmed"  # Update booking status
            db.session.commit()

            return jsonify({
                "message": "Table assigned successfully",
                "booking_id": booking_id,
                "table_id": new_table.get_uuid(),
                "status": "Confirmed"
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
