var fixedTime;
function removeChips(chipsId, isAll){

    if(chipsId != ""){

        for(var i = 1; i <= 5; i++){
            if(chipsId != i){
                document.getElementById("player-pour-chips-" + i).style.display = "none";
            }
        }
    }
    else{
        for(var i = 1; i <= 5; i++){
        document.getElementById("player-pour-chips-" + i).style.display = "none";
        }
    }
}

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

function removeAllActionStatus(){

    for(var i = 1; i <= 5; i++){
        var actionStatus = document.getElementById("user-" + i + "-action");

        actionStatus.style.display = "none";
    }
}

function removeAllTableCards(){

    for(var i = 1; i <= 5; i++){
        var tableCards = document.getElementById("table-card-" + i);

        tableCards.style.display = "none";
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

function removeTimer(seatNo){

    var seatTimer = document.getElementById("seat-" + seatNo +"-timer");
    seatTimer.style.display = "none";
}

function removeAllActionButtons(){
    var checkBtn = document.getElementById("check-btn");
    var callBtn = document.getElementById("call-btn");
    var raiseBtn = document.getElementById("raise-btn");
    var foldBtn = document.getElementById("fold-btn");

    //Disabled all button
    checkBtn.disabled = true;
    callBtn.disabled = true;
    raiseBtn.disabled = true;
    foldBtn.disabled = true;
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
    var firstCard = document.getElementById("player-" + seatNo + "-card-1");
    var secondCard = document.getElementById("player-" + seatNo + "-card-2");
    var playerHandCards = document.getElementById("player-" + seatNo + "-handcards");

    //reveal the card
    cardSoundEffect();
    playerHandCards.style.display = "";
    firstCard.innerHTML = player.firstHandCard;
    secondCard.innerHTML = player.secondHandCard;
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

function amountFormatter(amount){
    return Intl.NumberFormat('en-US').format(amount * 1);
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
    var walletAmount = sessionStorage.getItem("userWallet");

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
        inputAmount.value = 100000;
        inputManual.value = 100000;
    }

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

function chooseSeat(number){
    var seatInput = document.getElementById("seat-no");

    seatInput.value = number;
}

function displayWalletAmount(){
    var walletDisplay = document.getElementById("my-wallet-amount");
    var buyInWalletDisplay = document.getElementById("buy-in-wallet-display");
    var walletAmount = sessionStorage.getItem("userWallet");
    var buyInBtn = document.getElementById("confirm-buyin-btn");

    if(walletAmount != null){
        walletDisplay.innerHTML = amountFormatter(walletAmount);
        buyInWalletDisplay.innerHTML = amountFormatter(walletAmount);

        if(walletAmount < 100000){
            $("#buy-in-warning").html("Your wallet amount is less than the minimum amount!");
            buyInBtn.disabled = true;
        }
    }
}

function checkCardSoundEffect(){
    var checkSoundEffect = document.getElementById("check-card-sound-effect");
  
    //Play Sound Effect
    checkSoundEffect.play();
    
  }
  
function raiseCardSoundEffect(){
    var raiseSoundEffect = document.getElementById("raise-card-sound-effect");

    //Play Sound Effect
    raiseSoundEffect.play();
}

function callCardSoundEffect(){
    var callSoundEffect = document.getElementById("call-card-sound-effect");

    //Play Sound Effect
    callSoundEffect.play();
}

function foldCardSoundEffect(){
    var foldSoundEffect = document.getElementById("fold-card-sound-effect");

    //Play Sound Effect
    foldSoundEffect.play();
}

function cardSoundEffect(){
    var soundEffect = document.getElementById("shuffle-sound-effect");

    soundEffect.play();
}

function showActionStatus(seatNo, action){
    var actionStatus = document.getElementById("user-" + seatNo + "-action");
    actionStatus.innerHTML = action;
    actionStatus.style.display = "";
    
}

//Call Default Functions
displayWalletAmount();