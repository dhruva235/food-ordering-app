from flask import Blueprint, request, jsonify
from commands.orderCommands import OrderCommands
from dto.orderDto import OrderDTO
import uuid

order_bp = Blueprint("order_bp", __name__)

@order_bp.route("/", methods=["POST"])
def place_order():
    data = request.json
    if not data.get("user_id") or not data.get("order_items"):
        return jsonify({"message": "Missing required fields"}), 400

    order_dto = OrderCommands.place_order(data["user_id"], data["order_items"])
    return order_dto  # Since create_order returns jsonify directly

@order_bp.route("/", methods=["GET"])
def get_orders():
    orders = OrderCommands.get_all_orders()
    return jsonify(orders)  # ✅ orders is now a JSON-serializable list



@order_bp.route("/<string:order_id>", methods=["GET"])
def get_individual_order(order_id):
    try:
        binary_uuid = uuid.UUID(order_id).bytes  # Convert string UUID to binary
        order_dto = OrderCommands.get_order_by_id(binary_uuid)

        if order_dto is None:
            return jsonify({"error": "Order not found"}), 404

        return jsonify(order_dto.to_dict()), 200

    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400

@order_bp.route("/<string:order_id>", methods=["PUT"])
def update_order_status(order_id):
    data = request.json
    status = data.get("status")
    if not status:
        return jsonify({"message": "Status required"}), 400

    order_dto = OrderCommands.update_order_status(order_id, status)
    if not order_dto:
        return jsonify({"message": "Order not found"}), 404

    return jsonify(order_dto.to_dict())

@order_bp.route("/<string:order_id>", methods=["DELETE"])
def delete_order(order_id):
    result = OrderCommands.delorder(order_id)
    if not result:
        return jsonify({"message": "Order not found"}), 404

    return jsonify({"message": "Order deleted successfully"})

# 🔵 Send Order
@order_bp.route("/<string:order_id>/send", methods=["POST"])
def send_order(order_id):
    return OrderCommands.send_order(order_id)

# 🟢 Download Receipt
@order_bp.route("/<string:order_id>/receipt", methods=["GET"])
def download_receipt(order_id):
    return OrderCommands.download_receipt(order_id)
