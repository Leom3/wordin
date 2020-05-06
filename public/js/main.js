const socket = io();

$('form').submit((e) => {
  e.preventDefault(); // prevents page reloading
  socket.emit('login', $('#usernameInput').val());
  $('#usernameInput').val('');
  return false;
});

socket.on('logged', (msg) => {
  $('#usernameList').append($('<span class="username">').text(msg));
  $('.addUsernameButton').addClass("removed");
  $('#usernameInput').attr("readonly", true);
});
