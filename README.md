# Overview

## About

The Redruth Reading Room serves as a platform for administrators to generate audio collections aimed at collecting oral testimonies from specific participants. Admin users have the capability to oversee and handle audio submissions, while participants can record and upload their audio responses

## Project Documentation
Comprehensive user and project code information: https://docs.google.com/document/d/1j3MFsgCvuR-3JhLWFGDM-n9m6-IklNo3FuLf6Yl22xQ/edit

Website functionality walkthrough - Video: https://www.youtube.com/watch?v=NY2JuSEOkKU&t=2s 

Codebase walkthrough - Video: https://www.youtube.com/watch?v=I5TzoukEHLg

## Current Functionality
* Home page: Welcomes user with a website description and introductory content. 
* Settings/Login: A test admin account can be logged into an existing account using the following credentials:
     - Email: test@gmail.com
     - Password: @Test123
* Record page: The public can access record pages that are associated with a prompt. A recording can be made on the device and uploaded to the website along with info about who made the recording (name, phone number, etc.).
* Research Tab: Admin users who are logged into the account have access to several tabs to help them manage collections, prompts, and recordings they receive. Info about each tab is seen below.
     - Home: All collections appear along with collection information. User can create a new collection or prompt along with generate a shareable link to receive recordings.
     - Edit/Listen: User can listen to all the recordings that have been uploaded to a specific collection and prompt.
     - Inbox & Publish: To be implemented 


#  Redruth Reading Room Application - React Client (redruthforged-master)
This is what the user sees!

* How do I get set up?
  - Install node

  - Clone this repository

* To install the necessary packages run

  - make install

* To run the application for development purposes run 'make'

  - This will start the application on 127.0.0.1:3000
 
_Note_: If make is not installed on your machine, running npm install and npm start for the above two steps will work instead.


# Redruth Reading Room Application - Server (redruthforged-server-master)
handles database reads/writes

* How do I get set up?
  - Install node

  - Clone this repository

  - Navigate to the directory
    
  - Install necessary packages by running 'make install'

  - To run the application for development purposes run 'make'


    - This will start the application on 127.0.0.1:8000
   
_Note_: If make is not installed on your machine, running npm install and npm start for the above two steps will work instead.



# Testing suite (TestFolder)
* To test Gurkins 

  - Download project
  
  - Go to hellocucumber
  
  - Run mvn test
  
  
  <strong>Note</strong>: This will not build due to the fact that there is no classes defined currently.
  <br></br>
* To test Unit Tests

  - In project root dirictory
  
  - Run ./node_modules/mocha/bin/mocha.js
  
  
