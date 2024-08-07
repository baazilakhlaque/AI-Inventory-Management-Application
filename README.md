# AI Inventory Management Application

This is an application that enables users to add items to their inventory, monitor quantities and remove items when they are sold but with a twist: this process is made simpler with the use of AI for smarter handling. With the help of React-camera-pro package and Google Cloud Vision API, the app allows users to take pictures of different items, classifies the images and adds the label of that image to the system - sparing the time to write. Moreover, in case of only food items, the application's 'AI Chef' feature uses LLama 3.1 LLM to generate several recipes based on the available items.

This application leverages Next.js as the React framework, Material-UI to create a responsive and an appealing user interface, Firebase Firestore as the backend database, and Cloud Storage for Firebase to store pictures of inventory items. 

Environment variables are used in the code which means that to run the code it might be needed to replace those variables with custom values.

How to run the application:
- install the files
- go into the project directory
- run "npm install"
- Then run "npm start"

