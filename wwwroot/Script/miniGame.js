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
        const $status = $('#status');
        const $countdownTimer = $('#countdown');

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
                started = false;
                $status.text(`Player ${letter} left. You Win !!`)
                document.getElementById("big").style.display = "none";
                document.getElementById("small").style.display = "none";
            });

        // TODO: Start()
        conn.on('Start', () => {

            setTimeout(() => $status.text('Ready to Bet Big or Small!!'), 1000);
            setTimeout(() => $status.text('You have 10 second to bet your size!'), 3000);
            setTimeout(() => {
                document.getElementById("betsize").disabled = false;
                $countdownTimer.text('10')
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
            setTimeout(() => $countdownTimer.text('0'), 14000);
            setTimeout(() => {
                $status.text('Times Out!!!');
                //started = true;
                document.getElementById("betsize").disabled = true;
                }, 15000);
        });

        //Start Connection
        conn.start().then(main);

        function main(){
        
        }