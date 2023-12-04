# Node.js Chat and Video Call Application

![Node.js Logo](https://nodejs.org/static/images/logo.svg)

## Author

**Manuel Felipe Stroh**
- Senior PHP Developer
- Email: [manuelfelipestroh@gmail.com](mailto:manuelfelipestroh@gmail.com)

## Project Overview

This project is a multifaceted Node.js application designed to demonstrate a variety of web technologies for a technical assessment by Now Optics. It features a real-time chat application, a split-view interface for two users to communicate, and a WebRTC-based video calling feature. The project has been crafted with both functionality and educational demonstration in mind. While some aspects of the application are rudimentary and primarily serve to showcase the capabilities of the technologies used, they fully comply with the assessment requirements.

## Key Features

- **Real-Time Chat:** Utilizes WebSockets for live, bidirectional communication between clients.
- **Split-View Interface:** Allows two users to chat simultaneously in a shared window.
- **WebRTC Video Call:** Implements WebRTC for peer-to-peer video communication.
- **Node.js Backend:** The server-side is powered by Node.js, handling HTTP requests, WebSocket connections, and SQLite database interactions.
- **SQLite Database:** Used for storing chat messages, facilitating message retrieval upon page reload.
- **Bulma CSS Framework:** Provides a modern, responsive UI.

## Technologies Used

- 🟢 **Node.js:** JavaScript runtime for building the server-side application.
- 💾 **SQLite:** SQL database engine for storing chat messages.
- 🌐 **Express.js:** Web application framework for Node.js to handle HTTP requests.
- 💬 **WebSocket (socket.io):** Enables real-time, bidirectional communication between web clients and servers.
- 📹 **WebRTC:** Allows direct peer-to-peer communication, used for video calling.
- 🎨 **Bulma:** Modern CSS framework based on Flexbox for styling the frontend.
- ⚡ **npm:** Package manager for Node.js.

## Installation and Setup

### Prerequisites

- Node.js installed on your system.
- Basic knowledge of JavaScript and Node.js.

### Steps to Run the Application

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/mafelstroh/symmetrical-system.git
   cd symmetrical-system
   git checkout develop

  2. **Install Dependencies:**
     ```bash
     npm install
     ```
  
  3. **Start the Application:**
     ```bash
     node server.js
     ```
  
  4. **Access the Application:**
     - Open your browser and navigate to `http://localhost:3000`.

### Contributions

Contributions, issues, and feature requests are welcome! Feel free to contact me