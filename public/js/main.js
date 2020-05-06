const socket = io();

$('form').submit((e) => {
  e.preventDefault(); // prevents page reloading
  socket.emit('login', $('#usernameInput').val());
  $('#usernameInput').val('');
  $('#usernameInput').attr("readonly", true);
  return false;
});

socket.on('players', (players) => {
  $('#usernameList').innerHTML("");
  for (player of players) {
    $('#usernameList').append($('<span class="username">').text(player));
  }
  $('.addUsernameButton').addClass("removed");
});

socket.on('loggedHost', (msg) => {
  $('.usernameForm').append($('<button class="startGameButton">').text("Start game"));
});

socket.on('error', (msg) => {
  console.error(msg);  
});