# Job Application Tracker

A full-stack web application to help you track your job applications. Built with React + Vite for the frontend and Flask for the backend.

## Features

- Add and track job applications
- Automatic progress tracking based on application status
- Status tracking (Applied, OA Sent, OA Received, Interviewed, etc.)
- Delete applications
- Responsive design

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- shadcn/ui components

### Backend
- Flask
- SQLite
- SQLAlchemy

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (3.8 or higher)
- Git

### Setup

1. Clone the repository
```bash
git clone https://github.com/walletkun/jobapp_tracker.git
cd jobapp_tracker
```


2. Backend Setup

# For pip users
```bash
cd backend
python -m venv venv
source venv/bin/activate #On windows use: venv\Scripts\activate
pip install -r requirements_venv.txt
```

# For conda users
```bash
cd backend
conda create -n 'your choice of venv name' python=3.10
conda activate 'your choice of venv name'
pip install -r requirements_conda.txt
```


3. Frontend Setup
```bash
cd frontend
npm install
```


## Running Application

1. Start the Backend
```bash
cd backend
#If using venv
source venv/bin/activate #On windows use: venv\Scripts\activate
python app.py

#If using conda
conda activate 'your choice of name' 
python app.py
```


2. Start the Frontend (in a new terminal)
```bash
#Assuming you still in backend working directory
cd ../frontend
npm run dev
```


## The application will be available at:
 - Frontend: http://localhost:5173
 - Backend API: http://localhost:5001


## Project structure
job-application-tracker/
├── backend/
│   ├── app.py
│   ├── settings.py
│   ├── requirements.txt
│   └── requirements_conda.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
└── README.md


## API Endpoints
- GET /api/applications - Get all applications
- POST /api/applications - Create a new application
- DELETE /api/application - Delete an application




## Future Implementation
- Adding a gmail scraper to check up-to-date application results
- Integrate automatic change of results based on the above scrape