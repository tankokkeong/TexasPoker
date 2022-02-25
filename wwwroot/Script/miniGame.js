// ========================================================================================
// Connect
// ========================================================================================

const param = $.param({ page: 'minigame' });

const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub?' + param)
    .build();


var playerSeat = [false, false, false, false, false];

let images = [
    "dice1.png",
    "dice2.png",
    "dice3.png",
    "dice4.png",
    "dice5.png",
    "dice6.png",
]


function diceRoller(){

    let dice = document.querySelectorAll(".dices");
    const randomDice = images[0];
    randomDice.selectedIndex = Math.floor(Math.random() * 6) + 1;

}



