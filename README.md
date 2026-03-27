# Grade 12 Learning Platform (DAZ)

A modern MERN stack educational platform featuring an **assessment-first learning model**.

## Features
- **Assessment-First**: Prove your mastery before unlocking content.
- **Dynamic Unlocking**: Pass assessments (≥70%) to advance to the next topic.
- **Learning Reinforcement**: Redirected to curated slides if an assessment is failed.
- **Premium UI**: Glassmorphism design with smooth animations.
- **Subject Coverage**: Mathematics, Physics, and Chemistry.

## Tech Stack
- **Frontend**: React.js (Vite), Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Style**: Premium Vanilla CSS.

## Getting Started

### Prerequisites
- Node.js
- MongoDB running locally

### Installation

1. **Clone the Repo** (if applicable)
2. **Setup Backend**:
   ```bash
   cd server
   npm install
   npm run seed  # Populates initial data
   npm start
   ```
3. **Setup Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Folder Structure
- `client/`: React frontend
- `server/`: Node.js backend
- `slides/`: Subject-wise PDF storage
- `server/scripts/seed.js`: Initial database population script
