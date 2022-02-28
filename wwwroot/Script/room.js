//Global Variables
var fixedTime;

// ========================================================================================
// Connect
// ========================================================================================
const gameId = new URL(location).searchParams.get('gameId');
if (!gameId) {
    location = 'lobby.html';
    throw 'ERROR: Invalid game id';
}       

const param = $.param({ page: 'game', gameId });

const con = new signalR.HubConnectionBuilder()
            .withUrl('/hub?' + param)
            .build();     


//Start connection
con.start().then();


//Invalid Id
con.on('Reject', () => location = 'lobby.html');

//Get current game info
con.on('ViewGame', (game) => {

  showPlayer(game.seat1, 1);
  showPlayer(game.seat2, 2);
  showPlayer(game.seat3, 3);
  showPlayer(game.seat4, 4);
  showPlayer(game.seat5, 5);

});

//Get current game info
con.on('StartGame', (game) => {

  var mySeatNo = parseInt(sessionStorage.getItem("mySeatNo"));

  if(mySeatNo == 1){
    showCard(game.seat1, 1);
  }
  else if(mySeatNo == 2){
    showCard(game.seat2, 2);
  }
  else if(mySeatNo == 3){
    showCard(game.seat3, 3);
  }
  else if(mySeatNo == 4){
    showCard(game.seat4, 4);
  }
  else if(mySeatNo == 5){
    showCard(game.seat5, 5);
  }

  //Trigger the timer and blinds
  con.invoke("BlindTrigger");
  con.invoke("TimerTrigger");

});


//Trigger the timer
con.on('DisplayTimer', (game, id, sequence) => {

  var seat1 = (game.seat1 == null ? "" : game.seat1.id);
  var seat2 = (game.seat2 == null ? "" : game.seat2.id)
  var seat3 = (game.seat3 == null ? "" : game.seat3.id)
  var seat4 = (game.seat4 == null ? "" : game.seat4.id)
  var seat5 = (game.seat5 == null ? "" : game.seat5.id)

  var soundEffect = document.getElementById("bell-sound-effect");
  var seat1Timer = document.getElementById("seat-1-timer");
  var seat2Timer = document.getElementById("seat-2-timer");
  var seat3Timer = document.getElementById("seat-3-timer");
  var seat4Timer = document.getElementById("seat-4-timer");
  var seat5Timer = document.getElementById("seat-5-timer");

  if(seat1 == id){
    seat1Timer.style.display = "";
    actionTimer("player-" + 1 + "-timer", "seat-1-timer");
  }
  else if(seat2 == id){
    seat2Timer.style.display = "";
    actionTimer("player-" + 2 + "-timer", "seat-2-timer");
  }
  else if(seat3 == id){
    seat3Timer.style.display = "";
    actionTimer("player-" + 3 + "-timer", "seat-3-timer");
  }
  else if(seat4 == id){
    seat4Timer.style.display = "";
    actionTimer("player-" + 4 + "-timer", "seat-4-timer");
  }
  else{
    seat5Timer.style.display = "";
    actionTimer("player-" + 5 + "-timer", "seat-5-timer");
  }

  //Play the sound effect
  soundEffect.play();

});

//Get current game info
con.on('BlindChips', (bigBlindPosition, smallBlindPosition, sequence) => {
  var blindSign = document.getElementById("player-" + bigBlindPosition + "-blind");
  var bigBlind = document.getElementById("player-pour-chips-" + bigBlindPosition);
  var smallBlind = document.getElementById("player-pour-chips-" + smallBlindPosition);
  var bigBlindAmount = document.getElementById("chips-amount-" + bigBlindPosition);
  var smallBlindAmount = document.getElementById("chips-amount-" + smallBlindPosition);

  //Set the big blind and small blind
  bigBlind.style.display = "";
  smallBlind.style.display = "";
  bigBlindAmount.innerHTML = amountFormatter("10000");
  smallBlindAmount.innerHTML = amountFormatter("5000");

  console.log("Big Blind: " + bigBlindPosition + ", Small Blind: " + smallBlindPosition)
  console.log("Sequence: " + sequence)

  //Reveal the blind sign
  blindSign.style.display = "";

  //Remove other signs
  removeBlind(bigBlindPosition, false);

});

//Leaving the room
con.onclose(err => {
  if(sessionStorage.getItem("mySeatNo") != null){
    con.invoke('LeaveGame', parseInt(sessionStorage.getItem("mySeatNo")));
  }
});

//Leave Seat
con.on('LeaveSeat', (seatNo, noCard) => {
  var seat = document.getElementById("occupied-seat-" + seatNo);
  var buyInSign = document.getElementById("buy-in-seat-" + seatNo);
  var myChips = document.getElementById("seat-" + seatNo +"-chips");
  var myName = document.getElementById("player-" + seatNo + "-name");
  var mySeat = sessionStorage.getItem("mySeatNo");
  var playerHandCards = document.getElementById("player-" + seatNo + "-handcards");
  var seatTimer = document.getElementById("seat-" + seatNo +"-timer");

  console.log("No Card:" + noCard)
  if(noCard == "No Card"){
    removeAllCards();
    removeAllTimer();
    recoverPlayerTimer("", true);
    removeBlind("", true);
    removeChips("", true);
  }

  if(mySeat == seatNo){
    //Remove session storage
    sessionStorage.removeItem("mySeatNo");

    //Remove seat and recover buy in sign
    seat.style.display = "none";
    buyInSign.style.display = "";
    myChips.innerHTML = "";
    myName.innerHTML = "";
    playerHandCards.style.display = "none";

    //Remove blind
    removeBlind(mySeat, "");

    //Recover other seat
    for(var i = 1 ; i <= 5; i++){

      var otherSeat = document.getElementById("buy-in-seat-" + i);
      var occupiedSeat = document.getElementById("occupied-seat-" + i);

      if(i != seatNo && otherSeat.style.display == "none" && occupiedSeat.style.display == "none"){
        otherSeat.style.display = "";
      }
    }
  }
  else if(mySeat != null){
    //Remove seat
    seat.style.display = "none";
    myChips.innerHTML = "";
    myName.innerHTML = "";
  }
  else{
    //Remove seat
    seat.style.display = "none";
    buyInSign.style.display = "";
    myChips.innerHTML = "";
    myName.innerHTML = "";
  }

  seatTimer.style.display = "none";

});

//Get Seat
con.on('getSeat', (seatNo, chips, name) => {
  var seat = document.getElementById("occupied-seat-" + seatNo);
  var buyInSign = document.getElementById("buy-in-seat-" + seatNo);
  var myChips = document.getElementById("seat-" + seatNo +"-chips");
  var myName = document.getElementById("player-" + seatNo + "-name");

  //Set my seat no
  sessionStorage.setItem("mySeatNo", seatNo);

  //Display seat and remove buy in sign
  seat.style.display = "";
  buyInSign.style.display = "none";
  myChips.innerHTML = "$ " + amountFormatter(chips);

  if(name.length > 6){
    myName.innerHTML = name.substring(0,6) + "...";
  }
  else{
    myName.innerHTML = name;
  }
  

  //Remove other seat
  for(var i = 1 ; i <= 5; i++){

    var otherSeat = document.getElementById("buy-in-seat-" + i);

    if(i != seatNo && otherSeat.style.display != "none"){
      otherSeat.style.display = "none";
    }
  }

});

con.on('GameAction', (chipsOfTheRound) => {
  var checkBtn = document.getElementById("check-btn");
  var callBtn = document.getElementById("call-btn");
  var raiseBtn = document.getElementById("raise-btn");
  var foldBtn = document.getElementById("fold-btn");

  
});

con.on('CheckAction', () => {


});

con.on('RaiseAction', () => {


});

con.on('CallAction', () => {


});

con.on('FoldAction', () => {


});

function checkCard(){

}

function raiseCard(){

}

function callCard(){

}

function foldCard(){

}

function buyInGame(){
  var buyInAmount = parseInt(document.getElementById("buy-in-amount").value);
  var seatNo = parseInt(document.getElementById("seat-no").value);
  var userId = sessionStorage.getItem("userId");
  var name = sessionStorage.getItem('userName');

  con.invoke('JoinGame', seatNo, userId, "", name, buyInAmount);
}

function standUp(){
  var seatNo = parseInt(sessionStorage.getItem("mySeatNo"));
  con.invoke('LeaveGame', seatNo);
}

function exit(){
  if(sessionStorage.getItem("mySeatNo") != null){
      con.invoke('LeaveGame', parseInt(sessionStorage.getItem("mySeatNo"))).then(()=>
      {
          location = "lobby.html";
      });
  }
  else{
      location = "lobby.html";
  }
}