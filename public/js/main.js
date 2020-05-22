const socket = io();
var userName = "";
var turn = 0;

$('.usernameForm').submit((e) => {
  e.preventDefault(); // prevents page reloading
  socket.emit('login', $('#usernameInput').val());
  userName = $('#usernameInput').val();
  $('#usernameInput').val('');
  $('#usernameInput').attr("readonly", true);
  $('.addUsernameButton').addClass("removed");
  return false;
});

socket.on('players', (players) => {
  $('#usernameList').html("");
  $(".playerList").html("");
  for (player of players) {
    $('#usernameList').append($('<span class="username">').text(player));
    $(".playerList").append(`<div class="player">${player}</div>`);
  }
});

socket.on('loggedHost', (msg) => {
  $('.lobbyContainer').append($('<button class="startGameButton">').text("Start game"));
  $(".startGameButton").on("click", function() {
    socket.emit('startGame', "");
  });
});

socket.on('error', (msg) => {
  console.error(msg);  
});

socket.on('startGame', (msg) => {
  $('.lobbyContainer').addClass("hide");
  $(".gameContainer").removeClass("hide");
  socket.emit('getWord', {"user" : userName, "turn" : 0});
  turn = turn + 1;
});

socket.on('getWord', (msg) => {
  $('.word').text(msg);
})

$('.sendWordForm').submit((e) => {
  e.preventDefault(); // prevents page reloading  
  socket.emit('emitClue', {"user": userName, "msg": $('.wordInput').val()});
  $('.wordInput').val('');
  return false;
});

socket.on("getClue", (data) => {
  $(`.player`)[data.index].append(` ${data.msg} `);
});