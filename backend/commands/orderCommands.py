import uuid
from flask import jsonify, send_file
from commands.genatrepdf import generate_pdf
from constants.enums import OrderStatus
from extensions import db
from models import FoodItem, Order, OrderItem, Receipt

class OrderCommands:

    # 🟢 Create Order
    @staticmethod
    def place_order(user_id, order_items):
        if not user_id or not order_items:
            return jsonify({"error": "Missing required fields"}), 400

        # Create order
        new_order = Order(
            id=uuid.uuid4().bytes,
            user_id=uuid.UUID(user_id).bytes,
            total_price=sum(item["price"] * item["quantity"] for item in order_items),
            status=OrderStatus.PENDING.value
        )
        db.session.add(new_order)

        for item in order_items:
            food = FoodItem.query.filter_by(name=item["name"]).first()
            if not food:
                return jsonify({"error": f"Food item '{item['name']}' not found"}), 404
            
            order_item = OrderItem(
                order_id=new_order.id,
                food_id=food.id,
                quantity=item["quantity"]
            )
            db.session.add(order_item)

        db.session.commit()

        return jsonify({
            "id": str(uuid.UUID(bytes=new_order.id)),
            "user_id": str(uuid.UUID(bytes=new_order.user_id)),
            "total_price": new_order.total_price,
            "status": new_order.status,
            "order_items": [
                {
                    "name": food.name,
                    "price": food.price,
                    "quantity": item.quantity
                }
                for item in new_order.order_items
                for food in [FoodItem.query.get(item.food_id)]
            ]
        }), 201

    # 🟠 Update Order Status
    @staticmethod
    def update_order_status(order_id, status):
        try:
            binary_uuid = uuid.UUID(order_id).bytes
        except ValueError:
            return jsonify({"error": "Invalid UUID format"}), 400

        order = Order.query.get(binary_uuid)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # Validate status using Enum
        if status not in [s.value for s in OrderStatus]:
            return jsonify({"error": "Invalid status"}), 400

        order.status = status
        db.session.commit()

        return jsonify({"message": "Order status updated successfully", "status": order.status})

    # 📤 Send Order (Mark as Sent)
    @staticmethod
    def send_order(order_id):
        try:
            order = Order.query.filter_by(id=uuid.UUID(order_id).bytes).first_or_404(description="Order not found")

            if order.status != OrderStatus.PENDING.value:
                return jsonify({"error": "Order is not in pending state"}), 400

            # Update status and generate receipt
            order.status  = OrderStatus.SENT.value
            db.session.commit()

            receipt_id = uuid.uuid4().bytes
            pdf_path = generate_pdf(order, receipt_id)

            receipt = Receipt(order_id=order.id, file_path=pdf_path)
            db.session.add(receipt)
            db.session.commit()

            return jsonify({"message": "Order sent successfully", "receipt_pdf": pdf_path}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500  

    # 📥 Download Receipt
    @staticmethod
    def download_receipt(order_id):
        try:
            receipt = Receipt.query.filter_by(order_id=uuid.UUID(order_id).bytes).first_or_404(description="Receipt not found")
            return send_file(receipt.file_path, as_attachment=True)

        except Exception as e:
            return jsonify({"error": str(e)}), 500
    @staticmethod
    def get_all_orders():
        orders = Order.query.all()

        return [
        {
            "id": str(uuid.UUID(bytes=order.id)),
            "user_id": str(uuid.UUID(bytes=order.user_id)),
            "total_price": order.total_price,
            "status": order.status,
            "order_items": [
                {
                    "name": food.name,
                    "price": food.price,
                    "quantity": item.quantity
                }
                for item in order.order_items
                for food in [FoodItem.query.get(item.food_id)]
            ]
        }
        for order in orders
    ]
