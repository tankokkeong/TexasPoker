using Microsoft.AspNetCore.SignalR;

// ============================================================================================
// Class: Player
// ============================================================================================
    
public class MiniPlayer
{
    public string Id { get; set; }
    public string Icon { get; set; }
    public string Name { get; set; }
    // public string FirstHandCard {get; set;}
    // public string SecondHandCard {get; set;}
    // public int ChipsOnHand { get; set; } = 0;

    public MiniPlayer(string id, string icon, string name) => (Id, Icon, Name) = (id, icon, name);

}



// ============================================================================================
// Class: Game
// ============================================================================================

public class MiniGame
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int NumberOfPlayer = 0;
    public MiniPlayer? Seat1 { get; set; } = null;
    public MiniPlayer? Seat2 { get; set; } = null;
    public MiniPlayer? Seat3 { get; set; } = null;
    public MiniPlayer? Seat4 { get; set; } = null;
    public MiniPlayer? Seat5 { get; set; } = null;

    public string? FirstDice {get; set;} = null;
    public string? SecondDice {get; set;} = null;
    public string? ThirdDice {get; set;} = null;

    // public int PoolChips {get; set;}

    public bool IsWaiting { get; set; } = false;

    public bool IsEmpty => NumberOfPlayer == 0;
    public bool IsFull  => NumberOfPlayer == 5;

    public string? AddPlayer(MiniPlayer miniPlayer, int seatNo)
    {
        if (seatNo == 1 && Seat1 != null)
        {
            Seat1 = miniPlayer;
            NumberOfPlayer++;
        }
        else if (seatNo == 2 && Seat2 != null)
        {
            Seat2 = miniPlayer;
            NumberOfPlayer++;
        }
        else if (seatNo == 3 && Seat3 != null)
        {
            Seat3 = miniPlayer;
            NumberOfPlayer++;
        }
        else if (seatNo == 4 && Seat4 != null)
        {
            Seat4 = miniPlayer;
            NumberOfPlayer++;
        }
        else
        {
            Seat5 = miniPlayer;
            NumberOfPlayer++;
        }

        return null;
    }


}



// ============================================================================================
// Class: GameHub 👦🏻👧🏻
// ============================================================================================

public class MiniRoomHub : Hub
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

    // TODO: Start()
    public async Task Start()
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        var game = games.Find(g => g.Id == gameId);
        if (game == null)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        await Clients.Group(gameId).SendAsync("Start");
    }

    // TODO: Run(letter)
    public async Task Run(string letter)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

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
            case "list": await ListConnected(); break;
            case "game": await GameConnected(); break;
        }

        await base.OnConnectedAsync();
    }

    private async Task ListConnected()
    {
        string id = Context.ConnectionId;
        await UpdateList(id);
    }

    private async Task GameConnected()
    {

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
            case "game": await GameDisconnected(); break;
        }

        await base.OnDisconnectedAsync(exception);
    }

    private void ListDisconnected()
    {
        // Do nothing
    }

    private async Task GameDisconnected()
    {
       
    }

    // End of GameHub -------------------------------------------------------------------------
}