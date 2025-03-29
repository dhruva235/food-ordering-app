import datetime
from flask import Blueprint, current_app, request, jsonify
from werkzeug.security import generate_password_hash
from extensions import db
from models import User
import uuid
import re
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User
import uuid
import re
import jwt
from sqlalchemy.exc import IntegrityError

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/users")

# Email validation regex
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    if not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing email or password"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401


    return jsonify({
        "message": "Login successful",
        "user_id": str(uuid.UUID(bytes_le=user.id)),
        "role": user.role
    }), 200

@user_bp.route("/", methods=["POST"])
def register_user():
    data = request.json

    # Validate input fields
    if not all(k in data for k in ("name", "email", "password", "role")):
        return jsonify({"error": "Missing required fields"}), 400

    if data["role"] not in ["user", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256", salt_length=16)

    new_user = User(name=data["name"], email=data["email"], password=hashed_password, role=data["role"])

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            "message": f"{data['role'].capitalize()} user registered successfully",
            "user_id": str(uuid.UUID(bytes=new_user.id))
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@user_bp.route("/<string:user_id>", methods=["GET"])
def get_user(user_id):
    try:
        user_uuid = uuid.UUID(user_id).bytes  # Convert UUID string to bytes for MySQL query
        user = User.query.get(user_uuid)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "id": str(uuid.UUID(bytes=user.id)),  # Convert BINARY(16) back to UUID string
            "name": user.name,
            "email": user.email
        }), 200
    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400

@user_bp.route("/", methods=["GET"])
def get_all_users():
    users = User.query.all()
    if not users:
        return jsonify({"message": "No users found"}), 404

    users_list = [
        {
            "id": str(uuid.UUID(bytes=user.id)),  # Convert BINARY(16) back to UUID string
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]
    return jsonify(users_list), 200
