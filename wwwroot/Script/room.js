//Global Variables
//var fixedTime;
var playerChipsOfTheRound = [0, 0, 0, 0, 0];
const userID = sessionStorage.getItem("userId");

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

//Invalid Id
con.on('Reject', () => location = 'lobby.html');

//Get current game info
con.on('ViewGame', (game) => {

  showPlayer(game.seat[0], 1);
  showPlayer(game.seat[1], 2);
  showPlayer(game.seat[2], 3);
  showPlayer(game.seat[3], 4);
  showPlayer(game.seat[4], 5);

  //console.log("View Game Trigger: ")
});

con.on('updateWinnerChipsOnHands', (seatNo, total, poolChips) => {

  //console.log("Winner seat: " + seatNo + " Winner Chips: " + total + " Pool Chips: " + poolChips)
  var winnerChips = document.getElementById("seat-" + seatNo + "-chips");

  winnerChips.innerHTML = "$ " + amountFormatter(total);
});

con.on('updatePotChips', (total) => {
  console.log("Pot total: " + total)

  //Remove all the chips
  removeChips("", true);

  displayPotChips(total);
});

con.on("updateChipsOnTable", (chipsAmount1, chipsAmount2, chipsAmount3, chipsAmount4, chipsAmount5) => {

  // console.log("Update chips on table triggered: " + chipsAmount1 + " " + chipsAmount2 + " " 
  // + chipsAmount3 + " " + chipsAmount4 + " " + chipsAmount5)

  var chipsOnTable1 = document.getElementById("chips-amount-1");
  var chipsOnTable2 = document.getElementById("chips-amount-2");
  var chipsOnTable3 = document.getElementById("chips-amount-3");
  var chipsOnTable4 = document.getElementById("chips-amount-4");
  var chipsOnTable5 = document.getElementById("chips-amount-5");
  var pourChip1 = document.getElementById("player-pour-chips-1");
  var pourChip2 = document.getElementById("player-pour-chips-2");
  var pourChip3 = document.getElementById("player-pour-chips-3");
  var pourChip4 = document.getElementById("player-pour-chips-4");
  var pourChip5 = document.getElementById("player-pour-chips-5");

  if(chipsAmount1 != 0){
    chipsOnTable1.innerHTML = amountFormatter(chipsAmount1);
    pourChip1.style.display = "";
  }
  else{
    pourChip1.style.display = "none";
  }

  if(chipsAmount2 != 0){
    chipsOnTable2.innerHTML = amountFormatter(chipsAmount2);
    pourChip2.style.display = "";
  }
  else{
    pourChip2.style.display = "none";
  }

  if(chipsAmount3 != 0){
    chipsOnTable3.innerHTML = amountFormatter(chipsAmount3);
    pourChip3.style.display = "";
  }
  else{
    pourChip3.style.display = "none";
  }

  if(chipsAmount4 != 0){
    chipsOnTable4.innerHTML = amountFormatter(chipsAmount4);
    pourChip4.style.display = "";
  }
  else{
    pourChip4.style.display = "none";
  }

  if(chipsAmount5 != 0){
    chipsOnTable5.innerHTML = amountFormatter(chipsAmount5);
    pourChip5.style.display = "";
  }
  else{
    pourChip5.style.display = "none";
  }

});


//Get current game info
con.on('updateChipsOnHand', (chip1, chip2, chip3, chip4, chip5) => {

  //console.log("Update Chips Triggered")
  var userChips1 = document.getElementById("seat-1-chips");
  var userChips2 = document.getElementById("seat-2-chips");
  var userChips3 = document.getElementById("seat-3-chips");
  var userChips4 = document.getElementById("seat-4-chips");
  var userChips5 = document.getElementById("seat-5-chips");

  if(chip1 != null){
    userChips1.innerHTML = "$ " + amountFormatter(chip1);
  }

  if(chip2 != null){
    userChips2.innerHTML = "$ " + amountFormatter(chip2);
  }

  if(chip3 != null){
    userChips3.innerHTML = "$ " + amountFormatter(chip3);
  }

  if(chip4 != null){
    userChips4.innerHTML = "$ " + amountFormatter(chip4);
  }

  if(chip5 != null){
    userChips5.innerHTML = "$ " + amountFormatter(chip5);
  }

});

//Get current game info
con.on('StartGame', (game) => {

  var mySeatNo = parseInt(sessionStorage.getItem("mySeatNo"));

  //Remove winner declaration
  removeWinnerDeclaration();
  removeAllActionStatus();
  removeTableCards();
  removePotChips();

  if(mySeatNo == 1){
    showCard(game.seat[0], 1);
  }
  else if(mySeatNo == 2){
    showCard(game.seat[1], 2);
  }
  else if(mySeatNo == 3){
    showCard(game.seat[2], 3);
  }
  else if(mySeatNo == 4){
    showCard(ggame.seat[3], 4);
  }
  else if(mySeatNo == 5){
    showCard(game.seat[4], 5);
  }

});


//Trigger the timer
con.on('DisplayTimer', (game, id, sequence) => {

  //Reset the timer time
  fixedTime = -1;

  var seat1 = (game.seat[0] == null ? "" : game.seat[0].id);
  var seat2 = (game.seat[1] == null ? "" : game.seat[1].id);
  var seat3 = (game.seat[2] == null ? "" : game.seat[2].id);
  var seat4 = (game.seat[3] == null ? "" : game.seat[3].id);
  var seat5 = (game.seat[4] == null ? "" : game.seat[4].id);

  var soundEffect = document.getElementById("bell-sound-effect");
  var seat1Timer = document.getElementById("seat-1-timer");
  var seat2Timer = document.getElementById("seat-2-timer");
  var seat3Timer = document.getElementById("seat-3-timer");
  var seat4Timer = document.getElementById("seat-4-timer");
  var seat5Timer = document.getElementById("seat-5-timer");

  //console.log("Next ID: " + id + " Sequence: " + sequence)

  setTimeout(function(){
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
  }, 200);

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

  //console.log("Blind Chips triggered")

  //Set the big blind and small blind
  bigBlind.style.display = "";
  smallBlind.style.display = "";
  bigBlindAmount.innerHTML = amountFormatter("10000");
  smallBlindAmount.innerHTML = amountFormatter("5000");

  //Assign the chips of the round
  playerChipsOfTheRound[bigBlindPosition -1] = 10000;
  playerChipsOfTheRound[smallBlindPosition -1] = 5000;

  // console.log("Big Blind: " + bigBlindPosition + ", Small Blind: " + smallBlindPosition)
  // console.log("Sequence: " + sequence)
  // console.log("Player Chips of the round: " + playerChipsOfTheRound)

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

  alert("Disconnected");
});

//Leave Seat
con.on('LeaveSeat', (seatNo, onePlayer, leaverChipsOnHand) => {
  var seat = document.getElementById("occupied-seat-" + seatNo);
  var buyInSign = document.getElementById("buy-in-seat-" + seatNo);
  var myChips = document.getElementById("seat-" + seatNo +"-chips");
  var myName = document.getElementById("player-" + seatNo + "-name");
  var mySeat = sessionStorage.getItem("mySeatNo");
  var playerHandCards = document.getElementById("player-" + seatNo + "-handcards");
  var seatTimer = document.getElementById("seat-" + seatNo +"-timer");
  var myWallet = parseInt(sessionStorage.getItem("userWallet"));

  console.log("Remaining One Player: " + onePlayer)
  if(onePlayer == "Remaining One Player"){
    removePotChips();
    removeAllActionStatus();
    removeAllTableCards();
    removeAllCards();
    removeAllTimer();
    recoverPlayerTimer("", true);
    removeBlind("", true);
    removeChips("", true);
    removeAllActionButtons();
    removeTableCards();
    playerChipsOfTheRound = [0, 0, 0, 0, 0];
  }

  if(mySeat == seatNo){
    //Remove session storage
    sessionStorage.removeItem("mySeatNo");

    //Set the new wallet amount
    sessionStorage.setItem("userWallet", myWallet + leaverChipsOnHand);
    updateWalletAmount();

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
  // else if(mySeat != null){

  //   //If I am playing
  //   //Remove seat
  //   seat.style.display = "none";
  //   myChips.innerHTML = "";
  //   myName.innerHTML = "";
  // }
  else{
    //Remove seat
    seat.style.display = "none";
    buyInSign.style.display = "none";
    myChips.innerHTML = "";
    myName.innerHTML = "";

    if(mySeat == null){
      buyInSign.style.display = "";
    }
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

con.on('GameAction', (chipsOfTheRound, userId, minRaise, maxAllIn, isAllIn, myInfo) => {
  var checkBtn = document.getElementById("check-btn");
  var callBtn = document.getElementById("call-btn");
  var raiseBtn = document.getElementById("raise-btn");
  var foldBtn = document.getElementById("fold-btn");
  var myUserId = sessionStorage.getItem("userId");
  var mySeatNo = sessionStorage.getItem("mySeatNo");
  var raiseInput = document.getElementById("raise-amount-input");
  var minRaiseThreshold = parseInt(myInfo.chipsOnHand) + parseInt(myInfo.chipsOnTable);


  if(minRaiseThreshold < minRaise){
    //Set the minimum and maximum raise amount
    raiseInput.setAttribute("min", parseInt(minRaiseThreshold));
    raiseInput.setAttribute("max", parseInt(minRaiseThreshold));
    raiseInput.value = parseInt(minRaiseThreshold);
    raiseAmount();
  }
  else{
    //Set the minimum and maximum raise amount
    raiseInput.setAttribute("min", parseInt(minRaise));
    raiseInput.setAttribute("max", parseInt(maxAllIn));
    raiseInput.value = parseInt(minRaise);
    raiseAmount();
  }


  //console.log("Min Raise: "+ minRaise + " Max All In: " + maxAllIn)

  if(userId === myUserId){
    
    console.log("My info: " + JSON.stringify(myInfo))
    //console.log("Is All In: " + isAllIn + " Chips Of the round: " + chipsOfTheRound)

    if(isAllIn){
      con.invoke("checkTrigger", parseInt(mySeatNo));
    }

    if(parseInt(myInfo.chipsOnTable) == chipsOfTheRound){
      checkBtn.disabled = false;
      callBtn.disabled = true;
      raiseBtn.disabled = false;
      foldBtn.disabled = false;
    }
    else{
      checkBtn.disabled = true;
      callBtn.disabled =  false;
      raiseBtn.disabled =  false;
      foldBtn.disabled =  false;
    }

    // console.log("Compare: " + minRaiseThreshold < minRaise)
    // if( minRaiseThreshold < minRaise){
    //   raiseBtn.disabled =  true;
    // }
    // else{
    //   raiseBtn.disabled =  false;
    // }

  }
  
});

con.on('RoundWinner', (winner, poolChips) => {

  //console.log("Winner of the round: " + JSON.stringify(winner))

  //Play sound effect
  chipsSoundEffect();

  //Show winner declaration
  displayWinnerDeclaration(winner.name);

  addGameRecord(winner.name + " won the pool chips of $" + amountFormatter(poolChips) + " with a " + winner.handCardName + 
  " with the hand card of " + cardFormatter(winner.firstHandCard) + " " + cardFormatter(winner.secondHandCard));

  //Remove pool chips
  removePotChips();

  //Remove all the chips
  removeChips("", true);

  //Show the action status to all users
  showActionStatus(winner.seatNo, "Win");

  //Remove the timer
  removeTimer(seatNo);

  //Disable the timer
  removeAllActionButtons();

  //Reset player chips of the round
  resetPlayerChipsOfTheRound();

});

con.on('DeclareWinner', (winner) => {

  //console.log("Declare Winner: " + JSON.stringify(winner))

  //Play sound effect
  chipsSoundEffect();

  //Show winner declaration
  displayWinnerDeclaration(winner.name);

  addGameRecord(winner.name + " won the game!");

  //Remove pool chips
  removePotChips();

  //Remove all the chips
  removeChips("", true);

  //Show the action status to all users
  showActionStatus(winner.seatNo, "Win");

  //Remove the timer
  removeTimer(seatNo);

  //Disable the timer
  removeAllActionButtons();

  //Reset player chips of the round
  resetPlayerChipsOfTheRound();

});

con.on('CheckAction', (seatNo, name, timerposition) => {

  //console.log("Timer position: " + timerposition)

  checkCardSoundEffect();

  //Show the action status to all users
  showActionStatus(seatNo, "Check");

  addGameRecord(name + " checks");

  //Remove the timer
  removeTimer(seatNo);

  //Disable the timer
  removeAllActionButtons();

});

con.on('RaiseAction', (seatNo, name, isAllIn) => {

  //console.log("All in: " + isAllIn)

  //Check if the users all in
  if(isAllIn){
    allInSoundEffect();

    //Show the action status to all users
    showActionStatus(seatNo, "All In");

    addGameRecord(name + " all in");
  }
  else{
    raiseCardSoundEffect();

    //Show the action status to all users
    showActionStatus(seatNo, "Raise");

    addGameRecord(name + " raises");
  }

    //Remove the timer
    removeTimer(seatNo);

    //Remove all the action buttons
    removeAllActionButtons();

});

con.on('CallAction', (seatNo, name) => {
  callCardSoundEffect();

  //Show the action status to all users
  showActionStatus(seatNo, "Call");

  addGameRecord(name + " calls");

  //Remove the timer
  removeTimer(seatNo);

  //Remove all the action buttons
  removeAllActionButtons();

});

con.on('FoldAction', (seatNo, name) => {

  foldCardSoundEffect();

  //Show the action status to all users
  showActionStatus(seatNo, "Fold");

  addGameRecord(name + " folds");

  //Remove the timer
  removeTimer(seatNo);

  //Remove all the action buttons
  removeAllActionButtons();

});

con.on('FlopRound', (card1, card2, card3) => {
  var firstCard = document.getElementById("table-card-1");
  var secondCard = document.getElementById("table-card-2");
  var thirdCard = document.getElementById("table-card-3");

  //Add game records
  addGameRecord("The first 3 community cards are " + cardFormatter(card1) + " " + cardFormatter(card2) + " " + cardFormatter(card3))

  //Remove chips
  removeChips("", true);
  
  //Reset player chips of the round
  resetPlayerChipsOfTheRound();

  //Remove action status
  removeAllActionStatus();

  //Card sound effect
  cardSoundEffect();

  firstCard.style.display = "";
  secondCard.style.display = "";
  thirdCard.style.display = "";

  firstCard.innerHTML = card1;
  secondCard.innerHTML = card2;
  thirdCard.innerHTML = card3;

});

con.on('TurnRound', (card4) => {
  var fourthCard = document.getElementById("table-card-4");

  //Add game records
  addGameRecord("The fourth community card is " + cardFormatter(card4))

  //Remove chips
  removeChips("", true);

  //Reset player chips of the round
  resetPlayerChipsOfTheRound();

  //Remove action status
  removeAllActionStatus();

  //Card sound effect
  cardSoundEffect();

  fourthCard.style.display = "";
  fourthCard.innerHTML = card4;

});

con.on('RiverRound', (card5) => {

  var firstCard = document.getElementById("table-card-1");
  var secondCard = document.getElementById("table-card-2");
  var thirdCard = document.getElementById("table-card-3");
  var fourthCard = document.getElementById("table-card-4");
  var fifthCard = document.getElementById("table-card-5");
  
  //Add game records
  addGameRecord("The complete community cards are " + cardFormatter(firstCard.innerHTML) + " " + cardFormatter(secondCard.innerHTML) 
  + " " + cardFormatter(thirdCard.innerHTML) + " " + cardFormatter(fourthCard.innerHTML) + " " + cardFormatter(card5))

  //Remove chips
  removeChips("", true);

  //Reset player chips of the round
  resetPlayerChipsOfTheRound();

  //Remove action status
  removeAllActionStatus();

  //Card sound effect
  cardSoundEffect();

  fifthCard.style.display = "";
  fifthCard.innerHTML = card5;
});

function checkCard(){
  var mySeatNo = sessionStorage.getItem("mySeatNo");
  con.invoke("checkTrigger", parseInt(mySeatNo));
  
}

function raiseCard(){
  var mySeatNo = sessionStorage.getItem("mySeatNo");
  var raiseAmount = parseInt(document.getElementById("raise-amount-input").value);

  con.invoke("RaiseTrigger", parseInt(mySeatNo), raiseAmount);
}

function callCard(){
  var mySeatNo = sessionStorage.getItem("mySeatNo");
  con.invoke("callTrigger", parseInt(mySeatNo));
}

function foldCard(){
  var mySeatNo = sessionStorage.getItem("mySeatNo");
  con.invoke("FoldTrigger", parseInt(mySeatNo));
}

function buyInGame(){
  var buyInAmount = parseInt(document.getElementById("buy-in-amount").value);
  var seatNo = parseInt(document.getElementById("seat-no").value);
  var userId = sessionStorage.getItem("userId");
  var name = sessionStorage.getItem('userName');
  var raiseInput = document.getElementById("raise-amount-input");
  var raiseAmountDisplay = document.getElementById("raise-amount-display");
  var myWallet = parseInt(sessionStorage.getItem("userWallet"));

  //Set the new wallet amount
  sessionStorage.setItem("userWallet", myWallet-buyInAmount);
  updateWalletAmount();

  raiseInput.value = 20000;
  raiseInput.setAttribute("min", "20000");
  raiseInput.setAttribute("max", buyInAmount);
  raiseAmountDisplay.innerHTML = amountFormatter(20000);

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

function resetPlayerChipsOfTheRound(){
    playerChipsOfTheRound = [0, 0, 0, 0, 0];
}


//Start connection
con.start();