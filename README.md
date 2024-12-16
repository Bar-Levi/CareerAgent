
# CareerAgent

![CareerAgent Logo](./logo.png)

CareerAgent is a multi-tier application designed to streamline job-seeking processes using a **Node.js Express backend**, a **React frontend**, and a **Python AI server**. This project demonstrates the integration of modern web and AI technologies to deliver a robust and efficient solution.

---

## Project Structure

```plaintext
CareerAgent/
├── backend/        # Node.js Express backend
├── frontend/       # React frontend
├── aiservice/      # Python AI server
└── README.md       # Project description
```

---

## Getting Started

Follow these instructions to set up and run the project locally.

---

### Prerequisites

Make sure you have the following installed:
- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Python 3.8+**
- **pip**

---

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Bar-Levi/CareerAgent.git
cd CareerAgent
```

#### 2. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
4. The backend server will run on `http://localhost:3001`.

#### 3. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. The frontend will run on `http://localhost:3000`.

#### 4. AI Server Setup

1. Navigate to the `aiservice` folder:
   ```bash
   cd ../aiservice
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate       # For Linux/Mac
   venv\Scripts\activate        # For Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the AI server:
   ```bash
   python server.py
   ```
5. The AI server will run on `http://localhost:5000`.

---

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

3. Start the AI server:
   ```bash
   cd aiservice
   python server.py
   ```

4. Open your browser and navigate to `http://localhost:3000` to use the application.

---

## Contributing

We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## Acknowledgments

Thanks to all the open-source projects and contributors that made this possible.
