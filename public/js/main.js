const socket = io();

$('form').submit((e) => {
  e.preventDefault(); // prevents page reloading
  socket.emit('login', $('#usernameInput').val());
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
  $('.usernameForm').append($('<button class="startGameButton">').text("Start game"));
});

socket.on('error', (msg) => {
  console.error(msg);  
});