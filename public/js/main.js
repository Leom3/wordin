const socket = io();
var userName = "";
var turn = 0;
let isHost = false;

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
  $(".votePlayerList").html("");
  let i = 0;
  for (player of players) {
    $('#usernameList').append($('<span class="username">').text(player));
    $(".playerList").append(`<div class="player">${player}</div>`);
    $(".votePlayerList").append(`
      <div class="votePlayer">
        <input id="${i}player" type="radio" name="player" onchange="newVote(this)" />
         ${player}
        <span id="${i}playerVotes"></span>
      </div>`);
    i++;
  }
});

socket.on('loggedHost', (msg) => {
  isHost = true;
  $(".goToVotesButton").removeClass("hide");
  $(".validateVotesButton").removeClass("hide");
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

$(".goToVotesButton").click(() => {
  socket.emit("switchToVote", "");
});

socket.on("switchToVote", () => {
  $(".gameContainer").addClass("hide");
  $(".voteContainer").removeClass("hide");
});

function newVote(element) {
  socket.emit("addVote", {"id": parseInt($(element).attr("id"))});
}

socket.on("voteCount", (data) => {
  $(`#${data.id}playerVotes`).text(` ${data.nbVotes} `);
});

$(".resetButton").click(() => {
  socket.emit("reset", "");
});

socket.on("onReset", () => {
  isHost = false;
  $('#usernameList').html("");
  $(".playerList").html("");
  $(".votePlayerList").html("");
  $(".goToVotesButton").addClass("hide");
  $(".gameContainer").addClass("hide");
  $(".voteContainer").addClass("hide");
  $(".validateVotesButton").addClass("hide");
  $(".lobbyContainer").removeClass("hide");
  $('.addUsernameButton').removeClass("removed");
  $(".startGameButton").addClass("hide");
  $('#usernameInput').attr("readonly", false);
});