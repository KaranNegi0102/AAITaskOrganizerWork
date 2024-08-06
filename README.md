AAI Task Manager (MERN)
Overview
The AAI Task Manager is a cloud-based web application designed to streamline team task management. Built using the MERN stack (MongoDB, Express.js, React, and Node.js), this platform provides a user-friendly interface for efficient task assignment, tracking, and collaboration. The application caters to administrators and regular users, offering comprehensive features to enhance productivity and organization.

Why/Problem?
In a dynamic work environment, effective task management is crucial for team success. Traditional methods of task tracking through spreadsheets or manual systems can be cumbersome and prone to errors. The AAI Task Manager aims to address these challenges by providing a centralized platform for task management, enabling seamless collaboration and improved workflow efficiency.

Background
With the rise of remote work and dispersed teams, there is a growing need for tools that facilitate effective communication and task coordination. The AAI Task Manager addresses this need by leveraging modern web technologies to create an intuitive and responsive task management solution. The MERN stack ensures scalability, while the integration of Redux Toolkit, Headless UI, and Tailwind CSS enhances user experience and performance.

Admin Features:
User Management:

Create admin accounts.
Add and manage team members.
Task Assignment:

Assign tasks to individual or multiple users.
Update task details and status.
Task Properties:

Label tasks as todo, in progress, or completed.
Assign priority levels (high, medium, normal, low).
Add and manage sub-tasks.
Asset Management:

Upload task assets, such as images.
User Account Control:

Disable or activate user accounts.
Permanently delete or trash tasks.
User Features:
Task Interaction:

Change task status (in progress or completed).
View detailed task information.
Communication:

Add comments or chat to task activities.
General Features:
Authentication and Authorization:

User login with secure authentication.
Role-based access control.
Profile Management:

Update user profiles.
Password Management:

Change passwords securely.
Dashboard:

Provide a summary of user activities.
Filter tasks into todo, in progress, or completed.
Technologies Used:
Frontend:

React (Vite)
Redux Toolkit for State Management
Headless UI
Tailwind CSS
Backend:

Node.js with Express.js
Database:

MongoDB for efficient and scalable data storage.
The AAI Task Manager is an innovative solution that brings efficiency and organization to task management within teams. By harnessing the power of the MERN stack and modern frontend technologies, the platform provides a seamless experience for both administrators and users, fostering collaboration and productivity.

Setup Instructions
Server Setup
Environment variables
First, create the environment variables file .env in the server folder. The .env file contains the following environment variables:

MONGODB_URI = your MongoDB URL
JWT_SECRET = any secret key - must be secured
PORT = 8800 or any port number
NODE_ENV = development
Set Up MongoDB:
Setting up MongoDB involves a few steps:

Visit MongoDB Atlas Website
Go to the MongoDB Atlas website: https://www.mongodb.com/cloud/atlas.
Create an Account
Log in to your MongoDB Atlas account.
Create a New Cluster
Choose a Cloud Provider and Region
Configure Cluster Settings
Create Cluster
Wait for Cluster to Deploy
Create Database User
Set Up IP Whitelist
Connect to Cluster
Configure Your Application
Test the Connection
Create a new database and configure the .env file with the MongoDB connection URL.

Steps to run server
Open the project in any editor of choice.
Navigate into the server directory cd server.
Run npm i or npm install to install the packages.
Run npm start to start the server.
If configured correctly, you should see a message indicating that the server is running successfully and Database Connected.

Steps to run client
Navigate into the client directory cd client.
Run npm i or npm install to install the packages.
Run npm start to run the app on http://localhost:3000.
Open http://localhost:3000 to view it in your browser.
