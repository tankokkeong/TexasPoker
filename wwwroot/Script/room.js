//Variables
var cards = 
["A♠", "K♠", "Q♠", "J♠", "10♠", "9♠", "8♠", "7♠", "6♠", "5♠", "4♠", "3♠", "2♠",
 "A♥", "K♥", "Q♥", "J♥", "10♥", "9♥", "8♥", "7♥", "6♥", "5♥", "4♥", "3♥", "2♥",
 "A♣", "K♣", "Q♣", "J♣", "10♣", "9♣", "8♣", "7♣", "6♣", "5♣", "4♣", "3♣", "2♣",
 "A♦", "K♦", "Q♦", "J♦", "10♦", "9♦", "8♦", "7♦", "6♦", "5♦", "4♦", "3♦", "2♦",
];

var playerSeat = [false, false, false, false, false];

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  function cardDealing(){

  }

  function buyInDisplay(){
    var inputAmount = document.getElementById("buy-in-amount");
    var displayAmount = document.getElementById("buy-in-amount-display");

    if(inputAmount.value >= 0){
        displayAmount.innerHTML = amountFormatter(inputAmount.value);
    }
  }

  function amountFormatter(amount){
      var digitArray = amount.split("");
      var arrayIndex = digitArray.length - 1;
      var formattedAmount = "";

      return Intl.NumberFormat('en-US').format(amount * 1);
  }

  function buyInManual(){
    var buyInAmount = document.getElementById("buy-in-manual");
  }