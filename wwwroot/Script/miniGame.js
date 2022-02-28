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
            });

            conn.on('Left', letter => {
                started = false;
                winnerSound.play();

                $status.text(`Player ${letter} left. You Win !!`)

                document.getElementById("big").style.display = "none";
                document.getElementById("small").style.display = "none";
            });

        //Start Connection
        conn.start().then(main);

        function main(){
        
        }