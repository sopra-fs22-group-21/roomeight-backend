# roomeight-backend

##Introduction
roomeight© is a better matching platform for future roomeight's!
Our goal is to connect people who are looking for a room and shared flats which are offering one - 
in a playful and fun way

##Technologies
The roomeight-backend is implemented in the serverless cloud environment 'firebase'

##High-Level components
the main file in our backend is the [index.ts](functions/src/index.ts), which defines the endpoints.  
The endpoints will then forward the requests to the different data-services:  
The [FlatProfileDataService.ts](/functions/src/main/data-services/FlatProfileDataService.ts) takes care of all operations concerning the Flat.  
The [UsertProfileDataService.ts](/functions/src/main/data-services/UserProfileDataService.ts) takes care of all operations concerning the Flat.  

##Launch & Deployment
###project setup
To start working with firebase download the firebase cli for your system - [firebase cli](https://firebase.google.com/docs/cli/)  
After cloning the repo execute `firebase login` and follow the browser instructions  
run the following command in the terminal (while being in the 'functions' folder):  
`npm i @types/uuid`   
`npm i expo-server-sdk`
###build and run the project locally
run the following command in the terminal: `npm run build && firebase emulators:start`
###run the tests
run the following command in the terminal: `jest --coverage`
###deployment
run the following command in the terminal: `firebase deploy`
###further dependencies and database
there are no further dependencies nor database required, as firebase takes care of that

##Roadmap
new developers should mainly focus on implementing a better 'likes-class', such that checking if a user likes you back but without a match gets easier.  
additionally, better user support like resetting password, report inappropriate users etc. would be desirable

##Authors and acknowledgment
Christoph Bachmann @ChrsBa
Lars Bösch @larsuzh

## License
This project is licensed under the MIT License