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
        
        let me = null;


        const $status = $('status');

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

                if(me == 'A' && game.isFull){
                    conn.invoke('Start');
                }
            });

            conn.on('Left', letter => {
                let id = setTimeout(() => location = 'lobby.html', 3000);
                while (id--) clearTimeout(id);
                
                started = false;
                $status.text(`Player ${letter} left. You win!`);
                
            });

            conn.on('Start', () => {
                setTimeout(() => $status.text('Ready... 3'), 1000);
                setTimeout(() => $status.text('Ready... 2'), 2000);
                setTimeout(() => $status.text('Ready... 1'), 3000);
                setTimeout(() => {
                    $status.text('Place your bet!');
                    started = true;
                    }, 10000);
    
            });


            conn.on('Win', letter => {
                started = false;
    
                if(me == letter){
                    $status.text("You Win!");
                }else{
                    $status.text("You Lose!");
                }
    
                setTimeout(() => location = 'lobby.html', 3000);
            });
    


        //Start Connection
        conn.start().then(main);

        function main(){
        
        }