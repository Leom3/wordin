const socket = io();
var userName = "";
var turn = 0;

$('form').submit((e) => {
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
  for (player of players) {
    console.log(player);
    $('#usernameList').append($('<span class="username">').text(player));
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
  $('.lobbyContainer').html("");
  socket.emit('getWord', {"user" : userName, "turn" : 0});
  turn = turn + 1;
});

socket.on('getWord', (msg) => {
  $('.lobbyContainer').append($('<a class="word">').text(msg));
})