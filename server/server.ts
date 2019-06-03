require('dotenv').config()

const cors = require('cors');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
const bodyParser = require('body-parser');


// Set the port to 3001
const PORT = process.env.PORT || 3001;

interface Admin {
  roomId: string
  id: string
}

interface RoomInfo {
  roomId: string
  type: string
}

const adminSocketList: Admin[] = [];
const roomList: RoomInfo[] = [];
const curVideoObj = {};
const playlistObj = {};
const statusObj = {};


app.set("port", PORT);
// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());


app.post('/api/fetchState', (req,res) => {
  const roomId = req.body.roomId;
  console.log("fetchState-room", roomId)
  console.log("fetchState-obj", curVideoObj)
  console.log("fetchState-objroom", curVideoObj[roomId])
  
  res.json(curVideoObj[roomId] && curVideoObj[roomId]);
})

app.get('/api/showRoom', (req, res) => {
  const filteredPublic = roomList.filter(room => room.type === "public")
  
  res.json({
    list: filteredPublic
  })
})

app.post('/api/getRoom', (req, res) => {
  const params = req.body.params;
  const filteredRoom = roomList.filter(room => room.roomId === params);
  const haveRoom = filteredRoom.length > 0;
  console.log("filteredROOM", filteredRoom);
  const promise1 = axios.get('https://api.datamuse.com/words?ml=ocean');
  const promise2 = axios.get('https://api.datamuse.com/words?ml=animal');
  const currentVideo = curVideoObj[params] ? curVideoObj[params].videoId : '';
  Promise.all([promise1, promise2]).then(function(response) {
    const randomNum = Math.floor(Math.random() * 100)
    const data1 = response[0].data[randomNum].word.replace(/ /g, '');
    const data2 = response[1].data[randomNum].word.replace(/ /g, '');
    if (!haveRoom) {
      res.json({response: false});
      return;
    }
    io.of('movie').emit('update create room state');
    
    res.json({
      response: true,
      type: filteredRoom[0].type,
      username: `${data1} ${data2}`,
      playlist: playlistObj[params],
      currentVideo
    });
  })
  
});

app.post('/api/createRoom', (req, res) => {
  const promise1 = axios.get('https://api.datamuse.com/words?ml=fast');
  const promise2 = axios.get('https://api.datamuse.com/words?ml=cheetah');
  const socket = JSON.parse(req.body.socket);
  const type = req.body.type;
  
  console.log(socket.id)

  Promise.all([promise1, promise2]).then(function(response) {
    let isNotAvailable;
    let roomId;
    let data1, data2
    do {
      const randomNum = Math.floor(Math.random() * 100)
      data1 = response[0].data[randomNum].word.replace(/ /g, '');
      data2 = response[1].data[randomNum].word.replace(/ /g, '');
      roomId = `${data1}-${data2}`
      const filteredRoom = roomList.filter(room => room.roomId === roomId);
      isNotAvailable = filteredRoom.length > 0;
    } while(isNotAvailable);

    roomList.push({
      roomId,
      type
    });
    adminSocketList.push({
      roomId: roomId,
      id: socket.id

    });
    playlistObj[roomId] = [];
    statusObj[roomId] = {};
    

    res.json({url: `${data1}-${data2}`});
  });
});

app.get('/api/youtube/:query', (req, res) => {
  const {query} = req.params;
  axios.get(
    'https://www.googleapis.com/youtube/v3/search', {
     params: {
       key: process.env.YOUTUBE_API,
       part: 'snippet',
       order: 'relevance',
       q: query,
       type: 'video',
       videoDefinition: 'high',
       maxResults: 10
    }
  }).then(result => {
    res.json(result.data.items);
  }).catch(error => console.log(error));
})



io.of('movie')
  .on('connection', (socket) => {
  let roomId;

  console.log(socket.id + " connected to /movie"); 

  socket.on('message_sent', function(data) {
    io.of('movie').to(data.room).emit('message_receive', data);
  })
  

  socket.on('add to playlist', (data) => {
    playlistObj[data.roomId].push(data);
    socket.to(data.roomId).broadcast.emit('sync playlist', playlistObj[data.roomId]);
  });

  
  socket.on('done playing', (data) => {
    console.log("PLAYLIST", playlistObj[roomId])
    statusObj[data][socket.id] = false
    console.log(statusObj)
    const statusArr = Object.values(statusObj[data]);
    
    if (!statusArr.includes(true) && playlistObj[data].length > 0) {
      const nextVideo = playlistObj[data].shift();
      if(curVideoObj[roomId].videoId === nextVideo.id) {
        io.of('movie').to(data).emit('sync video timestamp', 0);
      } else {
        io.of('movie').to(data).emit('play next video', nextVideo.id);
      }
      io.of('movie').to(data).emit('sync playlist', playlistObj[data]);
      for (let key in statusObj[data]) {
        statusObj[data][key] = true
      }
      curVideoObj[roomId] = {
        videoData: nextVideo, 
        videoId: nextVideo.id,
        roomId
       };
      io.of('movie').emit('update room state');
      console.log(statusObj)
    }
  })


  socket.on('joinRoom', (roomObject) => {
    roomId = roomObject.roomId;
 
    if (roomObject.roomIdCookie && roomObject.adminIdCookie) {
      const filteredAdmin = adminSocketList.filter(admin => admin.id === roomObject.adminIdCookie && admin.roomId === roomObject.roomId);
      const isAdmin = filteredAdmin.length > 0;
      if (isAdmin) {
        adminSocketList.push({
          roomId,
          id: socket.id
        })
      }
    }
    
    console.log('ADMIN LIST:', adminSocketList)
    console.log('ROOM LIST:', roomList)

    console.log(socket.id + 'joined ' + roomObject.roomId)

    socket.join(roomObject.roomId, () => {
      if (statusObj[roomObject.roomId]) {
        statusObj[roomObject.roomId][socket.id] = true
      }

      // update public room to reflect number of clients
      io.of('/movie').in(roomId).clients((error, clients) => {
        if (error) throw error;
        io.of('movie').emit("send number of clients", ({
          numClients: clients.length,
          roomId
        }));
      });
      
      
      const currentAdminList = adminSocketList.filter(admin => admin.roomId === roomObject.roomId);
      if(currentAdminList.length > 0) {
        const currentAdminId = currentAdminList[currentAdminList.length - 1].id;
        socket.to(currentAdminId).emit('admin timestamp', '')
      }

      socket.on('give admin timestamp', timestamp => {
        socket.emit('sync video timestamp', timestamp);
      })
      let rooms = Object.keys(socket.rooms);
      console.log(rooms);

      const filteredAdmin = adminSocketList.filter(admin => admin.id === socket.id)
      console.log("filtered", filteredAdmin)
            
      const isAdmin = filteredAdmin.length > 0;

      if (isAdmin) {
        socket.emit('is admin', filteredAdmin[0]);
      }

      socket.on('play video', (data) => {
        if (isAdmin) {
          curVideoObj[roomId] = data;
          socket.to(data.roomId).broadcast.emit('play video', data.videoId);
          io.of('movie').emit('update room state');
        }
      })
 
      socket.on('delete from playlist', (data) => {
        playlistObj[roomId] = playlistObj[roomId].filter((playlist, i) => i !== data.id);
        io.of('/movie').to(roomId).emit('sync playlist', playlistObj[roomId]);
      })

      socket.on('share video timestamp', (timestamp: number) => {
        if (isAdmin && timestamp) {
          console.log(timestamp)
          socket.to(roomObject.roomId).broadcast.emit('sync video timestamp', timestamp);
        }
        
      })
      socket.on('disconnect', () => {
        console.log('socket disconnected')
        io.of('/movie').in(roomId).clients((error, clients) => {
          if (error) throw error;
          io.of('movie').emit("send number of clients", ({
            numClients: clients.length,
            roomId
          }));
        });
        if (roomId && socket && statusObj[roomId] && statusObj[roomId][socket.id]) {
          delete statusObj[roomId][socket.id]
        }
      })
    });
  })

  socket.on('get number of clients', (roomId) => {
    io.of('/movie').in(roomId).clients((error, clients) => {
      if (error) throw error;
      io.of('movie').emit("send number of clients", ({
        numClients: clients.length,
        roomId
      }));
      console.log(`number of clients ${clients.length} ${clients}`)
    });
  })

})

http.listen(PORT, '0.0.0.0',() => {
  console.log('listening on *', PORT);
});

