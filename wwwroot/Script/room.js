//Variables
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

  console.log("Start Game: " + JSON.stringify(game))

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


});

//Leaving the room
con.onclose(err => {
  if(sessionStorage.getItem("mySeatNo") != null){
    con.invoke('LeaveGame', parseInt(sessionStorage.getItem("mySeatNo")));
  }
});

//Leave Seat
con.on('LeaveSeat', (seatNo, chips, name) => {
  var seat = document.getElementById("occupied-seat-" + seatNo);
  var buyInSign = document.getElementById("buy-in-seat-" + seatNo);
  var myChips = document.getElementById("seat-" + seatNo +"-chips");
  var myName = document.getElementById("player-" + seatNo + "-name");
  var mySeat = sessionStorage.getItem("mySeatNo");

  if(mySeat == seatNo){
    //Remove session storage
    sessionStorage.removeItem("mySeatNo");

    //Remove seat and recover buy in sign
    seat.style.display = "none";
    buyInSign.style.display = "";
    myChips.innerHTML = "";
    myName.innerHTML = "";

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
  myName.innerHTML = name;

  //Remove other seat
  for(var i = 1 ; i <= 5; i++){

    var otherSeat = document.getElementById("buy-in-seat-" + i);

    if(i != seatNo && otherSeat.style.display != "none"){
      otherSeat.style.display = "none";
    }
  }

});

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
    myName.innerHTML = player.name;

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
  var firstCard = document.getElementById("player-" + seatNo + "-card-1");
  var secondCard = document.getElementById("player-" + seatNo + "-card-2");
  var playerHandCards = document.getElementById("player-" + seatNo + "-handcards");

  console.log("Player: " + JSON.stringify(player))

  //reveal the card
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

function actionTimer(playerId){

  var timerLength = document.getElementById(playerId);
  var fixedTime = 100;

  const myTimeout = setInterval(function(){

    if(fixedTime < 20){
      timerLength.classList.remove("bg-warning");
      timerLength.classList.add("bg-danger");
      timerLength.style.width = (fixedTime) + "%";
    }
    else if(fixedTime < 50){
      timerLength.classList.add("bg-warning");
      timerLength.style.width = (fixedTime) + "%";
    }
    else{
      timerLength.style.width = (fixedTime) + "%";
    }

    fixedTime--;

    console.log(fixedTime)
    if(fixedTime == -1){
      clearInterval(myTimeout);
    }
  }, 100);
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