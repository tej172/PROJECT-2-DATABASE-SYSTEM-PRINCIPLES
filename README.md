# PROJECT-2-DATABASE-SYSTEM-PRINCIPLES

#### PROJECT 2: WHAT IS YOUR QUERY ACCESSING AND AT WHAT COST?  
#### SC3020 DATABASE SYSTEM PRINCIPLES 
#### TOTAL MARKS: 100 
#### Due Date: November 17, 2023; 11:59 PM 

# Project Overview
Our project is dedicated to crafting an interactive data visualization tool and framework for comprehending the execution plans of SQL queries. With PostgreSQL as the underlying DBMS and the TPC-H dataset for dummy data, our software orchestrates a cohesive interaction between various components. These include a graphical user interface (GUI) coded in ReactJS (./frontend), a robust exploration module handling query processing and visualization, and the main execution orchestrator built using Flask (./api). This versatile and multi-dimensional approach ensures that users gain a holistic understanding of Query Execution Plans (QEPs).

## Installation Guide
The installation guide provides a step-by-step walkthrough for installing and running our software. Ensure your system meets the following prerequisites:

### Installing Prerequisites
1. Ensure Node.js and npm are installed:
   - Node.js: Minimum version v16.16.0
   - npm: Minimum version v8.11.0
2. Install python and poetry:
   - For Poetry, use the command: `pip install poetry`
3. Verify you have a compatible Integrated Development Environment (IDE) installed:
   - For Python: Choose an IDE like VSCode (recommended), PyCharm, or Jupyter Notebook.
   - For ReactJS: Select an IDE suitable for React, such as VSCode (recommended), Sublime Text, or Atom.

### Project Setup & Running the Project
1. Clone or download the project from the GitHub repository.
2. Set Up Python Virtual Environment:
   ```bash
   pip3 install --upgrade pip
   cd api
   pip3 install virtualenv
   py -3 -m venv venv
   .\venv\Scripts\activate
   ```
3. Set up the .env file:
   - Navigate to the ‘api’ folder.
   - Create a file called ‘.env’ inside the api folder.
   - Add the following configuration to the .env file:
     ```
     FLASK_APP=app.py
     FLASK_ENV=development
     DB_HOST=localhost
     DB_NAME=TPC-H
     DB_USER=postgres
     DB_PASSWORD=postgres
     DB_PORT=5432
     ```
4. Setting Up and Testing the Backend:
   ```bash
   pip install poetry
   pip install -r requirements.txt
   flask run
   ```
5. Setting Up and Testing the Frontend:
   - Navigate to the project's root folder:
     ```bash
     cd ..
     ```
   - Move to the ‘frontend’ folder directory:
     ```bash
     cd frontend
     npm install -f
     npm start
     ```
6. Running the complete project from the root folder:
   ```bash
   cd ..
   npm install
   npm start
   ```

### Alternative Setup
If the initial method encounters issues:

#### Setting Up and Testing the Backend:
```bash
npm install poetry
poetry install
flask --app app run
```

#### Setting Up and Testing the Frontend:
- From the project's root folder, navigate to the frontend directory on your terminal:
  ```bash
  cd frontend
  ```
- Run the following commands on the frontend directory through your terminal:
  ```bash
  npm install
  npm start
  ```

## Viewing Project Results/Usage
Once both the backend and frontend servers are running, open your default web browser and navigate to the specified URL (usually http://localhost:3000/) to interact with the GUI. Explore the visualizations, query results, and delve into the realm of SQL query execution made accessible through our group’s software. Additionally, a video guide on using the software, including functionality and a walkthrough, is available [here](https://youtu.be/ZfDLBhyjvj0).


## Team Members
Submitted By:
- Joanne Christina Salimin (U21020304J)
- Priscilla Celine Setiawan (U2123732G)
- Tiwana Teg Singh (U2122816B)
- Muhammad Rafi Adzikra Sujai (U2120731G)

Submission Date: 17 November 2023

Programming Language Utilized:
- ReactJS (Frontend)
- Python (with Flask) (Backend)

GitHub Link: [Project Repository](https://github.com/tej172/PROJECT-2-DATABASE-SYSTEM-PRINCIPLES)
