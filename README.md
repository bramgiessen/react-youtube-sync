# React Youtube Sync

A server & client application to play Youtube videos in sync on multiple devices at the same time. Built with React, Redux, Node.js & Socket.IO. Try the [live demo](https://react-youtube-sync.herokuapp.com).

![screenshot](https://user-images.githubusercontent.com/6198229/31607425-929b75e0-b26c-11e7-8500-dbd5323741d2.gif)


Stack
-----

- [React (Create-React-App)](https://github.com/facebookincubator/create-react-app)
- [React-Redux](https://github.com/reactjs/react-redux)
- [React-Router](https://github.com/ReactTraining/react-router)
- [React-player](https://github.com/CookPete/react-player)
- [Redux-socket.io](https://github.com/itaylor/redux-socket.io)
- [Debug](https://github.com/visionmedia/debug)
- [Seamless-immutable](https://github.com/rtfeldman/seamless-immutable)
- [Node.js](https://nodejs.org)
- [Socket.io](https://github.com/socketio/socket.io)
- [Express](https://github.com/expressjs/express)
- [Heroku](https://www.heroku.com/)


Quick Start
-----------

```shell
$ git clone https://github.com/brambo48/react-youtube-sync.git
$ cd react-youtube-sync
$ npm install
$ npm start
```


NPM Commands
------------

|Command|Description|
|---|---|
|**npm start**|Start webpack development server @ **localhost:3000** && Node.js backend server @ **localhost:3001**|
|**npm run build**|Build frontend production bundles to **./build** directory|
|**npm run start-prod**|Start Node.js production server @ **localhost:3001** and use Express to serve frontend build artifacts from **./build** directory|


Overview
------------
`react-youtube-sync` consists of a client and a server application, which together make it possible to watch any Youtube video in synchronicity across multiple devices. When the user of one device plays, pauses or forwards the video this action will also happen on all the other connected devices.

The frontend is built using React ([create-react-app](https://github.com/facebookincubator/create-react-app)) and [Redux](https://github.com/reactjs/redux) (to manage it's state).  It communicates with the Node.js backend side of the application through websockets. Through the use of websockets, the backend can easily broadcast the actions (play, pause, forward) of one user to all other connected users without the need for each user to refresh the page. This communication between users and the server keeps the videoplayer of all users in a group in sync. 

### ![redux-socket.io]()
When a user pauses, plays or forwards a video, this action is emitted to the server. The server then broadcasts this action to all other connected users. Upon receiving an action from the server, the client processes this action and updates the playerState accordingly (i.e. from 'playing' to 'paused'). 

As noted earlier, the frontend of `React-youtube-sync` uses Redux to manage it's state by dispatching actions. To prevent having two ‘kind’ of actions (websocket events and redux actions) flying all over we use a middleware called [redux-socket.io](https://github.com/itaylor/redux-socket.io) that interprets these websocket events as redux actions for us.

##### Communication from client to server
By initializing this middleware with a 'prefix' parameter:
```shell 
const socketIoMiddleware = createSocketIoMiddleware ( socket, 'WS_TO_SERVER_' );
```
all redux actions that have an `action.type` prefixed with `'WS_TO_SERVER_'` will now , upon dispatching, automatically be sent to our backend through websockets. 

##### Communication from server to client
On the other hand, all events with type `action` that are emitted by the server will automatically be picked up by the receiving clients' middleware and interpreted as a Redux action. For example:
```shell 
// On the server
socket.emit('action', {type:'SET_PLAYER_STATE', payload:'playing'});
```
will be interpreted and dispatched as a redux action upon receiving by the client. Resulting in the matching reducer for action type `SET_PLAYER_STATE` taking care of the state change on the clientside. 

Depoyment
------------

*Prerequisites: basic knowledge of [Heroku](https://www.heroku.com/).*

** Setup your Heroku account and Heroku CLI **

For installing the CLI tool, see [this article](https://devcenter.heroku.com/articles/heroku-command-line).

**1. Create the Heroku app**

```
heroku apps:create react-youtube-sync-test
```

**2. Push to Heroku**

```
git push heroku master
```

Heroku will give you a link at which to view your live app.