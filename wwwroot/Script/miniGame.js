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



        // ========================================================================================
        // Connect
        // ========================================================================================

        const param = $.param({ page: 'mini-game', userName, userId, gameId});



        const conn = new signalR.HubConnectionBuilder()
            .withUrl('/minigameHub?' + param)
            .build();


        //Start Connection
        conn.start().then(main);

        function main(){
        
        }