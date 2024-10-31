from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from settings import Config
from bs4 import BeautifulSoup
from datetime import datetime



app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "[http://localhost:5173]",  # Add your frontend URL
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", 'OPTIONS'],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})
app.config.from_object(Config)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///job_application.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 
db = SQLAlchemy(app)


class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    company = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    progress = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    updated_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now())

    def to_dict(self):
        return {
            "id" : self.id,
            'company': self.company,
            'position': self.position,
            "status": self.status,
            "progress": self.progress,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

def validate_application_data(data):
    required_fields = ['company', 'position', 'status', 'progress']
    if not all(field in data for field in required_fields):
        return False, "Missing required fields"

    valid_statuses = ['applied', 'oa sent', 'oa received', 'interviewed', 'offered', 'accepted', 'rejected']
    
    if not isinstance(data['status'], str):
        return False, f"Status must be one of: {', '.join(valid_statuses)}"
    
    if data['status'].lower() not in valid_statuses:
        return False, f"Status must be one of: {', '.join(valid_statuses)}"

    try:
        progress = int(data['progress'])
        if not (0 <= progress <= 100):
            return False, "Progress must be between 0 and 100"
    except (ValueError, TypeError):
        return False, "Progress must be a valid number between 0 and 100"

    return True, None

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Job Application API", 
                   "endpoints": {
                       "GET/POST /api/applications": "Get all or create new applications",
                       "GET/PUT/DELETE /api/applications/<id>": "Get, update or delete specific application",
                       "GET /api/application/stats": "Get application statistics"
                   }})


@app.route("/api/applications", methods=["GET", "POST"])
def handle_application():
    if request.method == 'POST':
        try:
            data = request.json
            print("Received data:", data)  # Debug log
            is_valid, error_message = validate_application_data(data)

            if not is_valid:
                print("Validation error:", error_message)  # Debug log
                return jsonify({"error": error_message}), 400

            new_application = JobApplication(
                company=data['company'],
                position=data['position'],
                status=data['status'],
                progress=data['progress']
            )
            db.session.add(new_application)
            db.session.commit()

            return jsonify(new_application.to_dict()), 201

        except Exception as e:
            print("Error:", str(e)) 
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    else:
        try:
            applications = JobApplication.query.all()
            return jsonify([app.to_dict() for app in applications])
        except Exception as e:
            print("Error:", str(e))  # Debug log
            return jsonify({"error": str(e)}), 500


        


@app.route("/api/applications/<int:id>", methods=['GET', 'PUT','DELETE','PATCH'])
def handle_applications(id):
    try:
        application = JobApplication.query.get_or_404(id)

        #Wanting to get the info of the application
        if request.method == 'GET':
            return jsonify(application.to_dict())


        #Wanting to edit the current application
        if request.method == 'PUT':
            data = request.json
            is_valid, error_message = validate_application_data(data)

            if not is_valid:
                return jsonify({'Application does not exist: ': error_message}), 400

            application.company = data['company']
            application.position = data['position']
            application.status = data['status'].lower()
            application.progress = data['progress']
            db.session.commit()

        #Wanting to delete the current appllication
        if request.method == 'DELETE':
            db.session.delete(application)
            db.session.commit()

            return jsonify({"Message: ": "Application deleted successfully"})


        #Wanting to update the status of the application
        if request.method == 'PATCH':
            data = request.json

            if 'status' not in data:
                return jsonify({"error: ": "Missing 'status' field"}), 400

            valid_statuses = ['applied', 'oa sent', 'oa received', 'interviewed', 'offered', 'accepted', 'rejected']
            
            if data['status'].lower() not in valid_statuses:
                return jsonify({"error: ": f"Status must be one of: {', '.join(valid_statuses)}"}), 400

            application.status = data['status'].lower()
            if 'progress' in data:
                application.progress = data['progress']
            db.session.commit()

            return jsonify(application.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'error: ' : str(e)}), 500




@app.route("/api/applications/stats", methods=["GET"])
def get_application_stats():
    try:
        total_applications = JobApplication.query.count()
        status_counts = db.session.query(
            JobApplication.status,
            db.func.count(JobApplication.id)).group_by(JobApplication.status).all()


        return jsonify({ "total_applications": total_applications,
            "status_breakdown": dict(status_counts),
            "latest_application": JobApplication.query.order_by(
                JobApplication.created_at.desc()
            ).first().to_dict() if total_applications > 0 else None
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/applications/<int:id>", methods=["PATCH"])
def update_application_status(id):
    try:
        application = JobApplication.query.get_or_404(id)
        data = request.json

        if 'status' not in data:
            return jsonify({"error": "Missing 'status' field"}), 400

        valid_statuses = ['applied', 'oa sent', 'oa received', 'interviewed', 'offered', 'accepted', 'rejected']
        if data['status'].lower() not in valid_statuses:
            return jsonify({"error": f"Status must be one of: {', '.join(valid_statuses)}"}), 400

        application.status = data['status'].lower()
        if 'progress' in data:
            application.progress = data['progress']
            
        application.updated_at = datetime.now()
        db.session.commit()

        return jsonify(application.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )