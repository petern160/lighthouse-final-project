# Chee-tah
Final Project for Lighthouse Lab's Web Development Bootcamp
Deployed on heroku at: https://chee-tah.herokuapp.com/


![](home-page.gif)
![](movie-room.gif)
![](public-room.gif)


A webapp to watch Youtube videos with others. Users can see what public rooms are available to join and what video each room is playing. Video playback is synchonized with the admin of the room.

## Features
- Users can create public or private video rooms
- Users can add to the room's playlist
- Each room has only one admin, who controls what is being played
- Users have synced video playback with the admin of the room
- Users are able to remove any video that they have added to the playlist
- Users are able to chat with others that are currently in the same room


## Getting Started

#### You will need to have two terminals running for this app!

### Configuring the web client
1. Navigate to the web directory from project root `cd web`
2. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
3. Update the .env file with your correct local information
4. Install dependencies: `npm i`
5. Run `npm start`
6. Client app will be running at `localhost:8080` by default. If you have set a specfic `PORT` in your `.env`, it will be running at `localhost:PORT`

### Configuring the server
1. Navigate to the server directory from project root `cd server`
2. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
3. Update the .env file with your correct local information
4. Install dependencies: `npm i`
5. Complie typescript into javascript `npx tsc`
6. Run `npm start`
7. Server will be serving at `localhost:3001` by default. If you have set a specfic `PORT` in your `.env`, it will be serving at `localhost:PORT`

## Dependencies

- Node 10.15.x or above
- NPM 6.9.x or above
- Typescript
- Babel
- Webpack
- Dotenv
- Express
- ReactJS
- Socket.io
- SASS
- Axios
- Cors

## React App

1. ```npm install```
2. ```npm start```


## Express App

1. ```npm install```
2. ```npm run tsc```
3. <kbd>ctrl+z</kbd> + ```bg```
4. ```npm start```

### To kill process 

1. ```jobs```
2. ```kill %<process_id>```



