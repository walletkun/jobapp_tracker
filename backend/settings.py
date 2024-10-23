class Config:
    # Database settings
    SQLALCHEMY_DATABASE_URI = 'sqlite:///job_application.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Server settings
    HOST = '0.0.0.0'  # Changed from 'localhost'
    PORT = 5001
    DEBUG = True
    
    # CORS settings
    CORS_HEADERS = ['Content-Type', 'Authorization']