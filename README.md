#  Expense Tracker

A web application for tracking personal expenses

The application allows users to add, view, edit, and delete expenses, with data persisted in a PostgreSQL database through a REST API built with Node.js and Express.

---

## Overview

This project was  following a structured roadmap that covered backend development first, then frontend integration. The main goal was to practice working with a full stack setup: a Node.js server, a PostgreSQL database, and a vanilla JavaScript frontend communicating via the Fetch API.

Key features:
- Add a new expense (title, amount, category, date)
- View all expenses in a responsive table
- Edit an existing expense using a modal form
- Delete an expense with a confirmation prompt
- Search expenses by title
- Filter expenses by category
- View a doughnut chart showing expenses distribution by category
- Export all expenses as a CSV file
- Switch between dark and light themes
- Responsive layout that works on desktop, tablet, and mobile

---

## Technologies Used

### Backend
- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- cors
- dotenv

### Frontend
- HTML5
- CSS3 (with CSS variables for theming)
- JavaScript (ES6+)
- Bootstrap 5
- Chart.js
- Fetch API

##Project Structure

| |-- node_modules/
| |-- db.js # Database connection setup
| |-- server.js # Express server and API routes
| |-- schema.sql # Table creation and seed data
| |-- package.json
| |-- .env # Environment variables (not committed)
| |-- .env.example # Template for environment variables
|
|-- frontend/
| |-- index.html # Main HTML page
| |-- css/
| | |-- style.css 
| |-- js/
| |-- app.js 
|
|-- README.md
link :https://github.com/ramaarjoub/Expense_tracking_project
