<p align="center">
  <a href="https://github.com/sopra-fs22-group-21" target="_blank">
    <img alt="roomeight-logo" height="150" src="https://raw.githubusercontent.com/sopra-fs22-group-21/roomeight/b3de2881db6579ee9322e9e8bc70634c94ad7414/room8.svg"/>
  </a>
</p>
<p align="center">
    <a href="https://github.com/sopra-fs22-group-21/roomeight">Docs</a> <a>| </a><a href="https://www.instagram.com/roomeight.ch/">Instagram</a><a> | </a><a href="https://github.com/sopra-fs22-group-21/roomeight-frontend">Frontend</a>
</p>
<p align="center">
    <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/sopra-fs22-group-21/roomeight-backend">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/sopra-fs22-group-21/roomeight-backend">
    <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed-raw/sopra-fs22-group-21/roomeight-backend?color=">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/sopra-fs22-group-21/roomeight-backend">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/sopra-fs22-group-21/roomeight-backend">
    <img alt="apero" src="https://img.shields.io/badge/%F0%9F%98%89-ap%C3%A9ro-brightgreen">
    <img alt="GitHub" src="https://img.shields.io/github/license/sopra-fs22-group-21/roomeight-frontend">


</p>

## Introduction
roomeight© is a better matching platform for future roomeight's!
Our goal is to connect people who are looking for a room and shared flats which are offering one - 
in a playful and fun way

## Technologies
The roomeight-backend is implemented in the serverless cloud environment 'firebase'

## High-Level components
the main file in our backend is the [index.ts](functions/src/index.ts), which defines the endpoints.  
The endpoints will then forward the requests to the different data-services:  
The [FlatProfileDataService.ts](/functions/src/main/data-services/FlatProfileDataService.ts) takes care of all operations concerning the Flat.  
The [UsertProfileDataService.ts](/functions/src/main/data-services/UserProfileDataService.ts) takes care of all operations concerning the Flat.  

## Launch & Deployment
### project setup
To start working with firebase download the firebase cli for your system - [firebase cli](https://firebase.google.com/docs/cli/)  
After cloning the repo execute `firebase login` and follow the browser instructions  
run the following command in the terminal (while being in the 'functions' folder):  
`npm i @types/uuid`   
`npm i expo-server-sdk`
### build and run the project locally
run the following command in the terminal: `npm run build && firebase emulators:start`
###run the tests
run the following command in the terminal: `jest --coverage`
### deployment
run the following command in the terminal: `firebase deploy`
### further dependencies and database
there are no further dependencies nor database required, as firebase takes care of that

## Roadmap
new developers should mainly focus on implementing a better 'likes-class', such that checking if a user likes you back but without a match gets easier.  
additionally, better user support like resetting password, report inappropriate users etc. would be desirable

## Authors and acknowledgment
Christoph Bachmann @ChrsBa
Lars Bösch @larsuzh

## License
This project is licensed under GNU AGPLv3
