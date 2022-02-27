        // ========================================================================================
        // General
        // ========================================================================================
        const userName = sessionStorage.getItem('userName');
        const userId = sessionStorage.getItem('userId');

        if(!userName || !userId){
            location = 'lobby.html';
            throw 'ERROR: Invalid Name or User ID';
        }


        const gameId = new URL(location).searchParams.get('gameId');

        if (!gameId) {
            location = 'lobby.html';
            throw 'ERROR: Invalid mini game id';
        }   
        
        let started = false;
        
        let me = null;


        const $status = $('status');

        // ========================================================================================
        // Events
        // ========================================================================================

        $('#leave').click( e => location = 'lobby.html');


        // ========================================================================================
        // Connect
        // ========================================================================================

        const param = $.param({ page: 'mini-game', userName, userId, gameId});



        const conn = new signalR.HubConnectionBuilder()
            .withUrl('/minigameHub?' + param)
            .build();

            conn.on('Reject', () => location = "lobby.html");

            conn.on('Ready', (letter, game) => {
                if (game.playerA){
                    $('#nameA').text(game.playerA.name).show();
                   
                }
    
                if (game.playerB){
                    $('#nameB').text(game.playerB.name).show();
                    
                }
    
                if(me == null){
                    me = letter;
                    $('#' + me).addClass('me');
                }
            });
    
            conn.on('Left', letter => {
    
                started = false;
                $status.text(`Player ${letter} left. You win!`);
                setTimeout(() => location = 'list.html', 3000);
    
            });


        //Start Connection
        conn.start().then(main);

        function main(){
        
        }