// ========================================================================================
// Connect
// ========================================================================================

const gameId = new URL(location).searchParams.get('gameId');
if (!gameId) {
    location = 'lobby.html';
    throw 'ERROR: Invalid mini game id';
}   

const param = $.param({ page: 'mini-game' });

const conn = new signalR.HubConnectionBuilder()
    .withUrl('/minigameHub?' + param)
    .build();


//Start Connection
conn.start().then();

//Invalid id
conn.on('Reject', () => location = 'lobby.html');








