using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;

// ============================================================================================
// Class: Player
// ============================================================================================
    
public class Player
{
    public string Id { get; set; }
    public string Icon { get; set; }
    public string Name { get; set; }
    public string? FirstHandCard {get; set;} = null;
    public string? SecondHandCard {get; set;} = null;
    public int ChipsOnHand { get; set; } = 0;

    public Player(){}

    public Player(string id, string icon, string name, int chipsOnHand) => (Id, Icon, Name, ChipsOnHand) = (id, icon, name, chipsOnHand);

}



// ============================================================================================
// Class: Game
// ============================================================================================

public class Game
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int NumberOfPlayer = 0;

    public string[] cards = 
    {"A♠", "K♠", "Q♠", "J♠", "10♠", "9♠", "8♠", "7♠", "6♠", "5♠", "4♠", "3♠", "2♠",
    "A♥", "K♥", "Q♥", "J♥", "10♥", "9♥", "8♥", "7♥", "6♥", "5♥", "4♥", "3♥", "2♥",
    "A♣", "K♣", "Q♣", "J♣", "10♣", "9♣", "8♣", "7♣", "6♣", "5♣", "4♣", "3♣", "2♣",
    "A♦", "K♦", "Q♦", "J♦", "10♦", "9♦", "8♦", "7♦", "6♦", "5♦", "4♦", "3♦", "2♦",
    };

    public List<Player> playersOfTheRound = new List<Player>();

    public Player? Seat1 { get; set; } = null;
    public Player? Seat2 { get; set; } = null;
    public Player? Seat3 { get; set; } = null;
    public Player? Seat4 { get; set; } = null;
    public Player? Seat5 { get; set; } = null;

    public string? FirstCard {get; set;} = null;
    public string? SecondCard {get; set;} = null;
    public string? ThirdCard {get; set;} = null;
    public string? FourthCard {get; set;} = null;
    public string? FifthCard {get; set;} = null;

    public int PoolChips {get; set;}

    public bool IsWaiting { get; set; } = false;

    public bool IsEmpty => NumberOfPlayer == 0;
    public bool IsFull  => NumberOfPlayer == 5;

    public string[] Shuffle(){
        int[] arr = { 1, 2, 3, 4, 5 };
        Random random = new Random();
        cards = cards.OrderBy(x => random.Next()).ToArray();

        return cards;
    }

    public string? AddPlayer(Player player, int seatNo)
    {
        if (seatNo == 1 && Seat1 != null)
        {
            Seat1 = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 2 && Seat2 != null)
        {
            Seat2 = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 3 && Seat3 != null)
        {
            Seat3 = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 4 && Seat4 != null)
        {
            Seat4 = player;
            NumberOfPlayer++;
        }
        else
        {
            Seat5 = player;
            NumberOfPlayer++;
        }

        return null;
    }


}



// ============================================================================================
// Class: GameHub 👦🏻👧🏻
// ============================================================================================

public class GameHub : Hub
{
    // ----------------------------------------------------------------------------------------
    // General
    // ----------------------------------------------------------------------------------------
    
    private static List<Game> games = new List<Game>();

    public string Create()
    {
        var game = new Game();
        games.Add(game);
        return game.Id;
    }

    public async Task JoinGame(int seatNo, string id, string icon, string name, int chips)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null || !game.IsFull)
        {
            //Create new player
            var player = new Player(id, icon, name, chips);

            game.AddPlayer(player, seatNo);
            await Clients.Caller.SendAsync("Reject");
            return;
        }

    }

    public async Task HandCardDealing(){

    }

    public async Task FlopRound(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1);
        }
    }

    public async Task TurnRound(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1) + 4;
        }
    }

    public async Task RiverRound(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1) + 5;
        }

    }

    // ----------------------------------------------------------------------------------------
    // Functions
    // ----------------------------------------------------------------------------------------

    private async Task UpdateList(string? id = null)
    {
        var list = games.FindAll(g => g.IsWaiting);

        if (id == null)
        {
            await Clients.All.SendAsync("UpdateList", list);
        }
        else
        {
            await Clients.Client(id).SendAsync("UpdateList", list);
        }
    }

    // ----------------------------------------------------------------------------------------
    // Connected
    // ----------------------------------------------------------------------------------------

    public override async Task OnConnectedAsync()
    {
        string page = Context.GetHttpContext()?.Request.Query["page"] ?? "";

        switch (page)
        {
            case "lobby": await ListConnected(); break;
            case "game": await checkGameId(); break;
        }

        await base.OnConnectedAsync();
    }

    private async Task ListConnected()
    {
        string id = Context.ConnectionId;
        await UpdateList(id);
    }

    private async Task checkGameId()
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        
        var game = games.Find(g => g.Id == gameId);
        if (game == null || game.IsFull)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }

    }

    // ----------------------------------------------------------------------------------------
    // Disconnected
    // ----------------------------------------------------------------------------------------

    public override async Task OnDisconnectedAsync(Exception? exception) 
    {
        string page = Context.GetHttpContext()?.Request.Query["page"] ?? "";

        switch (page)
        {
            case "list": ListDisconnected(); break;
            //case "game": await GameDisconnected(); break;
        }

        await base.OnDisconnectedAsync(exception);
    }

    private void ListDisconnected()
    {
        // Do nothing
    }


    // End of GameHub -------------------------------------------------------------------------
}