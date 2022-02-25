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

//Get Seat
con.on('getSeat', (seatNo, chips, name) => {
  var seat = document.getElementById("occupied-seat-" + seatNo);
  var buyInSign = document.getElementById("buy-in-seat-" + seatNo);
  var myChips = document.getElementById("seat-" + seatNo +"-chips");
  var myName = document.getElementById("player-" + seatNo + "-name");

  console.log(seatNo)

  //Display seat and remove buy in sign
  seat.style.display = "";
  buyInSign.style.display = "none";
  myChips.innerHTML = "$ " + amountFormatter(chips);
  myName.innerHTML = name;
});

var playerSeat = [false, false, false, false, false];

function cardDealing(){

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

  console.log("hi")

  con.invoke('JoinGame', seatNo, userId, "", name, buyInAmount);
}