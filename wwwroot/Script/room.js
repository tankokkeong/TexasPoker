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

  console.log("Big Blind: " + bigBlindPosition + ", Small Blind: " + smallBlindPosition)
  console.log("Sequence: " + sequence)

  //Reveal the blind sign
  blindSign.style.display = "";

  //Remove other signs
  removeBlind(bigBlindPosition, false);

  console.log("after blind")
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

function removeBlind(blindId, isAll){

  if(blindId != ""){

    for(var i = 1; i <= 5; i++){
      if(blindId != i){
        document.getElementById("player-" + i + "-blind").style.display = "none";
      }
    }
  }
  else{
    for(var i = 1; i <= 5; i++){
      document.getElementById("player-" + i + "-blind").style.display = "none";
    }
  }

}

function removeAllCards(){

  for(var i = 1; i <= 5; i++){
    var playerHandCards = document.getElementById("player-" + i + "-handcards");

    playerHandCards.style.display = "none";
  }
}

function removeAllTimer(){
  for(var i = 1; i <= 5; i++){
    var seatTimer = document.getElementById("seat-" + i +"-timer");

    seatTimer.style.display = "none";
  }
}

function showPlayer(player, seatNo){
  if(player != null){
    var seat = document.getElementById("occupied-seat-" + seatNo);
    var buyInSign = document.getElementById("buy-in-seat-" + seatNo);
    var myChips = document.getElementById("seat-" + seatNo +"-chips");
    var myName = document.getElementById("player-" + seatNo + "-name");

    //Display seat and remove buy in sign
    seat.style.display = "";
    buyInSign.style.display = "none";
    myChips.innerHTML = "$ " + amountFormatter(player.chipsOnHand);

    if(player.name.length > 6){
      myName.innerHTML = player.name.substring(0,6) + "...";
    }
    else{
      myName.innerHTML = player.name;
    }

    //If it is the login user
    if(player.name == sessionStorage.getItem("userName")){

      //Remove other seat
      for(var i = 1 ; i <= 5; i++){

        var otherSeat = document.getElementById("buy-in-seat-" + i);

        if(i != seatNo && otherSeat.style.display != "none"){
          otherSeat.style.display = "none";
        }
      }
    }
  }
}

function showCard(player, seatNo){
  var soundEffect = document.getElementById("shuffle-sound-effect");
  var firstCard = document.getElementById("player-" + seatNo + "-card-1");
  var secondCard = document.getElementById("player-" + seatNo + "-card-2");
  var playerHandCards = document.getElementById("player-" + seatNo + "-handcards");

  //reveal the card
  soundEffect.play();
  playerHandCards.style.display = "";
  firstCard.innerHTML = player.firstHandCard;
  secondCard.innerHTML = player.secondHandCard;
}

function buyInDisplay(){
  var inputAmount = document.getElementById("buy-in-amount");
  var inputManual = document.getElementById("buy-in-manual");
  var displayAmount = document.getElementById("buy-in-amount-display");
  var buyInBtn = document.getElementById("confirm-buyin-btn");

  if(inputAmount.value < 0 || inputAmount.value  > 1000000){
    buyInBtn.disabled = true;
  }
  else{
      displayAmount.innerHTML = amountFormatter(inputAmount.value);
      inputManual.value = inputAmount.value;
      buyInBtn.disabled = false;
  }
  
}

function buyInManual(){
  var inputAmount = document.getElementById("buy-in-amount");
  var inputManual = document.getElementById("buy-in-manual");
  var displayAmount = document.getElementById("buy-in-amount-display");
  var digit_validation = /^[0-9]+$/;
  var buyInBtn = document.getElementById("confirm-buyin-btn");

  if(!digit_validation.test(inputManual.value)){
    inputManual.value =  inputManual.value.substring(0, inputManual.value.length-1);;
    buyInBtn.disabled = false;
  }
  else if(inputManual.value >= 1000000){
    displayAmount.innerHTML = amountFormatter(1000000);
    inputAmount.value = 1000000
    inputManual.value = 1000000;
    $("#buy-in-warning").html("");
    buyInBtn.disabled = false;
  }
  else if(inputManual.value >= 100000){
    displayAmount.innerHTML = amountFormatter(inputManual.value);
    inputAmount.value = inputManual.value
    inputManual.value = inputManual.value;
    $("#buy-in-warning").html("");
    buyInBtn.disabled = false;
  }
  else{
    $("#buy-in-warning").html("Your amount is less than the minimum amount!");
    buyInBtn.disabled = true;
  }
}

function amountFormatter(amount){
  return Intl.NumberFormat('en-US').format(amount * 1);
}

function showRaisePopUp(){
  $(document).ready(function(){
    $("#raise-popup").slideToggle("fast");
  });
}

function raiseAmount(){
  var raiseInput = document.getElementById("raise-amount-input");
  var raiseDisplay = document.getElementById("raise-amount-display");

  if(raiseInput.value >= 0){
    raiseDisplay.innerHTML = amountFormatter(raiseInput.value);
  }
}

function allInAmount(){
  var raiseInput = document.getElementById("raise-amount-input");
  var allInAmount = raiseInput.getAttribute("max");
  var raiseDisplay = document.getElementById("raise-amount-display");

  if(raiseInput.value >= 0){
    raiseDisplay.innerHTML = amountFormatter(allInAmount);
    raiseInput.value = allInAmount;
  }

}

function actionTimer(playerId, timerId){

  var timerLength = document.getElementById(playerId);
  var timer = document.getElementById(timerId);
  fixedTime = 300;

  const myTimeout = setInterval(function(){

    if(fixedTime/3 < 20){
      timerLength.classList.remove("bg-warning");
      timerLength.classList.add("bg-danger");
    }
    else if(fixedTime/3 < 50){
      timerLength.classList.remove("bg-success");
      timerLength.classList.add("bg-warning");
    }

    timerLength.style.width = fixedTime/3 + "%";

    fixedTime--;

    if(fixedTime <= -1){
      stopTimer(myTimeout);

      //Recover the timer
      recoverPlayerTimer(playerId);

      //Remove the timer
      timer.style.display = "none";

    }
  }, 100);
}

function stopTimer(id){
  clearInterval(id);
}

function recoverPlayerTimer(playerId, isAll){
  var timerLength = document.getElementById(playerId);

  //Recover the timer
  fixedTime = -1;

  if(isAll){
    for(var i = 1; i <= 5; i++){
      var allTimer = document.getElementById("player-" + i + "-timer");

      allTimer.classList.add("bg-success");
      allTimer.classList.remove("bg-danger");
      allTimer.classList.remove("bg-warning");
      allTimer.style.width = "100%";
    }
  }
  else{
    timerLength.classList.add("bg-success");
    timerLength.classList.remove("bg-danger");
    timerLength.classList.remove("bg-warning");
    timerLength.style.width = "100%";
  }

} 

function chooseSeat(number){
  var seatInput = document.getElementById("seat-no");

  seatInput.value = number;
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