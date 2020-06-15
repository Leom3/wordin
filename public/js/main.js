const socket = io();
var userName = "";
var turn = 0;
let isHost = false;
let currentVote = -1;

window.onbeforeunload = function() {
  return "If you leave this page, you won'll have to wait for the next!";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

$('.usernameForm').submit((e) => {
  e.preventDefault(); // prevents page reloading
  var checkUser = getCookie("username");
  $("#usernameInput").attr("placeholder", "");
  if (checkUser) {
    alert("seems like you are already logged with " + checkUser);
  }
  else {
    socket.emit('login', $('#usernameInput').val());
    userName = $('#usernameInput').val();
    document.cookie= "username=" + userName;
    $('#usernameInput').val('');
    $('#usernameInput').attr("readonly", true);
    $('.addUsernameButton').addClass("removed");
  }
  return false;
});

socket.on('players', (players) => {
  console.log("TOKEN :" + sessionStorage.token);
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
        <span id="${i}playerVotes" class="voteCount">0</span>
      </div>`);
    i++;
  }
});

socket.on('loggedHost', (msg) => {
  isHost = true;
  $(".goToVotesButton").removeClass("hide");
  $(".validateVotesButton").removeClass("hide");
  $(".newGameButton").removeClass("hide");
  $('.lobbyContainer').append($('<button class="startGameButton">').text("Start game"));
  $(".startGameButton").on("click", function() {
    socket.emit('startGame', turn);
  });
});

socket.on('error', (msg) => {
  console.error(msg);  
});

socket.on('startGame', (msg) => {
  if (isHost == false) {
    $(".resetButton").addClass("hide");
  }
  let data = [];
  for (let i = 0; i < $('.player').length; i++) {
    data.push($('.player')[i].innerText);
  }
  if (!localStorage.getItem("players")) {
    localStorage.setItem("players", JSON.stringify(data));
  }
  data = JSON.parse(localStorage.getItem("players"));
  for (let i = 0; i < $('.player').length; i++) {
    $('.player')[i].innerText = data[i];
  }
  $('.lobbyContainer').addClass("hide");
  $('.resultContainer').addClass("hide");
  $(".gameContainer").removeClass("hide");
  $(".votePlayer input").prop("checked", false);
  $(".votePlayer span").text("0");
  currentVote = -1;
  socket.emit('getWord', {"user" : userName, "turn" : turn});
  turn = turn + 1;
});

socket.on('getWord', (msg) => {
  console.log(msg);
  $('.word').text(msg);
})

$('.sendWordForm').submit((e) => {
  e.preventDefault(); // prevents page reloading  
  socket.emit('emitClue', {"user": userName, "msg": $('.wordInput').val()});
  $('.wordInput').val('');
  return false;
});

socket.on("getClue", (data) => {
  let players = document.querySelectorAll(".player");
  let message = document.createElement("div");
  message.innerHTML = data.msg;
  players[data.index].appendChild(message);
});

$(".goToVotesButton").click(() => {
  socket.emit("switchToVote", "");
});

socket.on("switchToVote", () => {
  $(".appendClass").removeClass("gameName");
  $(".gameContainer").addClass("hide");
  $(".voteContainer").removeClass("hide");
});

function newVote(element) {
  if (currentVote !== -1) {
    socket.emit("removeVote", {"id": currentVote, "nbVotes": parseInt($(`#${currentVote}playerVotes`).text())});
  }
  currentVote = parseInt($(element).attr("id"));
  socket.emit("addVote", {"id": parseInt($(element).attr("id")), "nbVotes": parseInt($(`#${parseInt($(element).attr("id"))}playerVotes`).text())});
}

socket.on("addVote", (data) => {
  $(`#${data.id}playerVotes`).text(` ${data.nbVotes} `);
});

socket.on("removeVote", (data) => {
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
  $(".resultContainer").addClass("hide");
  $('#usernameInput').attr("readonly", false);
  $(".newGameButton").addClass("hide");
  $("#usernameInput").attr("placeholder", "Username");
  localStorage.removeItem("players");
  currentVote = -1;
  turn = 0;
  userName = "";
});

$('.validateVotesButton').click(() => {
  const data = [];
  for (let i = 0; i < $(".votePlayer").length; i++) {
    data.push({id: i, nbVotes: parseInt($(`#${i}playerVotes`).text())});
  }
  socket.emit("submitVote", data);  
});

socket.on("voteResults", (data) => {
  $(".voteContainer").addClass("hide");
  $(".resultContainer").removeClass("hide");
  $(".winnerName").text("Players voted for " + data.winner);
  $(".winMessage").text(data.msg);
});

$('.newGameButton').click(() => {
  socket.emit('startGame', turn);
});