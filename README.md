<p align="center">
   <img src="./logo.png" alt="CareerAgent Logo" width="50%">
</p>

# CareerAgent

CareerAgent is a multi-tier application designed to streamline job-seeking processes using a **Node.js Express backend** and a **React frontend**. This project demonstrates the integration of modern web and AI technologies to deliver a robust and efficient solution.

## Deployment

The application is deployed on a remote Linux server and accessible via a custom domain at [careeragent-ai.online](https://careeragent-ai.online).

## Project Structure

```plaintext
CareerAgent/
├── backend/        # Node.js Express backend
├── frontend/       # React frontend
└── README.md       # Project description
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Make sure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** or **yarn**

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
3. Create a `prompts` folder in the backend directory:
   ```bash
   mkdir prompts
   ```
4. Create the following files in the `prompts` folder:

   - `analyzeCvPreprompt.txt`
   - `improveCvPreprompt.txt`
   - `interviewerPreprompt.txt`
   - `careerAdvisorPreprompt.txt`
   - `analyzeJobListingPreprompt.txt`

5. Create a `.env` file in the backend directory with the following variables:

   ```
   PORT=3001
   BACKEND=3001
   NODE_ENV=development
   MONGODB_URI=
   JWT_SECRET=
   EMAIL_PASS=
   EMAIL_USER=
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:3001
   CLOUDINARY_URL=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_API_KEY=
   GEMINI_API_KEY=
   SECRET_KEY=
   ```

   Fill in your own values for empty variables.

6. Start the backend server:
   ```bash
   node server.js
   ```
   The backend server will run on `http://localhost:3001`.

#### 3. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory with the following variables:

   ```
   REACT_APP_BACKEND_URL = http://localhost:3001
   REACT_APP_FRONTEND_PORT=3000
   REACT_APP_BOTPRESS_HOST=
   REACT_APP_BOTPRESS_BOT_ID=
   REACT_APP_BOTPRESS_WEBCHAT_URL=
   REACT_APP_CUSTOM_BOT_SCRIPT_URL=
   REACT_APP_SECRET_KEY=
   ```

   Fill in your own values for empty variables.

4. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

## Running the Application

1. Start the backend server:

   ```bash
   cd backend
   npm start
   ```

2. Start the frontend server:

   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to use the application.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

## Acknowledgments

Thanks to all the open-source projects and contributors that made this possible.
