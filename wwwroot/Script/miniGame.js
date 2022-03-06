        // ========================================================================================
        // General
        // ========================================================================================
        const username = sessionStorage.getItem('userName');

        if(!username){
            location = 'lobby.html';
            throw 'ERROR: Invalid Name';
        }


        const gameId = new URL(location).searchParams.get('gameId');

        if (!gameId) {
            location = 'lobby.html';
            throw 'ERROR: Invalid mini game id';
        }   
        
        let started = false;
        let me = null; //A or B

        const $gameResult = $('#gameResult');
        const $status = $('#status');
        const $countdownTimer = $('#countdown');
        const $rewards = $('#Rewards');
        const $current = $('#Current');


        const images = 
        [
        "Images/dice1.png",
        "Images/dice2.png",
        "Images/dice3.png",
        "Images/dice4.png",
        "Images/dice5.png",
        "Images/dice6.png"];

        // ========================================================================================
        // Events
        // ========================================================================================

        $('#leave').click( e => location = 'lobby.html');


        // ========================================================================================
        // Connect
        // ========================================================================================

        const param = $.param({ page: 'mini-game', username, gameId});

        const conn = new signalR.HubConnectionBuilder()
            .withUrl('/minigameHub?' + param)
            .build();

            conn.on('Reject', () => location = "lobby.html");

            conn.on('Ready', (letter, game) => {
                if(game.playerA){
                    $('#A').text(game.playerA.name).show();
                }
                if(game.playerB){
                    $('#B').text(game.playerB.name).show(); 
                }

                if (me == null){
                    me = letter;
                    $('#' + me).addClass('me');
                }

                // TODO: Host starts the game
                if(me == 'A' && game.isFull){
                    conn.invoke('Start');
                }
            });

            conn.on('Left', letter => {
                let id = setTimeout(() => location = 'lobby.html', 5000);
                while (id--) clearTimeout(id);

                started = false;
                $status.text(`Player ${letter} left.`)
            });

        
        var soundEffect = document.getElementById("diceRoll-sound-effect");
        var winSoundEffect = document.getElementById("win-sound-effect");
        var loseSoundEffect = document.getElementById("lose-sound-effect");

        conn.on('Start', () => {

            setTimeout (() => {
                $countdownTimer.text('');
                $status.text('Game Start!')}, 1000);
            setTimeout(() => $status.text('You have 10 second to guess the size!'), 2000);
            setTimeout(() => {
                $countdownTimer.text('10');
                document.getElementById("betsize").disabled = false;
                document.getElementById("betSubmit").disabled = false;
                document.getElementById("betRange").disabled = false;
                
            }, 4000);
            setTimeout(() => $countdownTimer.text('9'), 5000);
            setTimeout(() => $countdownTimer.text('8'), 6000);
            setTimeout(() => $countdownTimer.text('7'), 7000);
            setTimeout(() => $countdownTimer.text('6'), 8000);
            setTimeout(() => $countdownTimer.text('5'), 9000);
            setTimeout(() => $countdownTimer.text('4'), 10000);
            setTimeout(() => $countdownTimer.text('3'), 11000);
            setTimeout(() => $countdownTimer.text('2'), 12000);
            setTimeout(() => $countdownTimer.text('1'), 13000);
            setTimeout(() => {
                $status.text('Times Out!!!');
                $countdownTimer.text('');
                document.getElementById("betsize").disabled = true;
                document.getElementById("betSubmit").disabled = true;
                document.getElementById("betRange").disabled = true;
            }, 14000);
            setTimeout(() => {
                $status.text('Rolling Time!!!');
                soundEffect.play();
            }, 16000);
            setTimeout(() => {
                $status.text('');
                conn.invoke("Roll");
                
            }, 21000);
            setTimeout(() => {
                conn.invoke("CheckPlayerDecision");
            }, 24000);
            setTimeout(() => {
                $status.text("Ready for the next game!!!");
                $gameResult.text('')
                $rewards.text('');
                $current.text('');
            }, 30000);
            setTimeout(() => $countdownTimer.text('3'), 32000);
            setTimeout(() => $countdownTimer.text('2'), 33000);
            setTimeout(() => {
                $countdownTimer.text("1");
            }, 34000);
            setTimeout(() => {
                conn.invoke("Start");
            }, 34000);

        });

        conn.on('Result', (one,two,three,total) => {

            document.querySelector("#dice1").setAttribute("src", images[one - 1]);
            document.querySelector("#dice2").setAttribute("src", images[two - 1]);
            document.querySelector("#dice3").setAttribute("src", images[three - 1]);
            $status.text(`Dice ${one} ${two} ${three}. Total Score : ${total}`);
        });

        //Start Connection
        conn.start().then(main);

        function betSubmit(){
            document.getElementById("betsize").disabled = true;
            document.getElementById("betSubmit").disabled = true;
            document.getElementById("betRange").disabled = true;
        }
