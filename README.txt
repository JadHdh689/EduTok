EduTok - Setup Instructions
=============================

EduTok is a mobile-first educational video application built with React Native (Expo) and a Node.js backend.

------------------------------------------------------------
How to Run the Project
------------------------------------------------------------

1. Clone the Repository
------------------------
First, pull the project to your local machine

2. Install Dependencies
------------------------
Install all required packages:

    npm install

3. Configure Your Local IP
---------------------------
You need to set your local machine’s IP address so the mobile app can communicate with the backend.

- Run the following command in your terminal:
  - Windows (PowerShell / CMD):
        ipconfig
  - Mac/Linux:
        ifconfig

- Copy your IPv4 address.
- Open the file 'config.js' at the project root.
- Replace the placeholder with your IP before ':5000'.  

Example:
    export const API_BASE_URL = "http://192.168.1.10:5000";

4. Start the Backend Server
----------------------------
Navigate to the 'api' folder and start the backend:

    cd api
    node server

This will run the backend on port 5000.

5. Start the Frontend (Expo)
-----------------------------
Navigate to the EduTok folder and start Expo:

    cd ../Edutok
    npx expo start

6. Open the App in Mobile Mode
-------------------------------
1. Open your browser at:
       http://localhost:8081
2. Right-click anywhere on the page → select 'Inspect'.
3. Click the mobile/tablet icon in the DevTools toolbar.
4. Now you can view the app in mobile mode.

------------------------------------------------------------
Notes
------------------------------------------------------------
- Make sure your backend and frontend are running at the same time.
- The IP you use in 'config.js' must match your machine’s IP on the same network and it might change.

