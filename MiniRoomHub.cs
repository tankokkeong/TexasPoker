using Microsoft.AspNetCore.SignalR;

// ============================================================================================
// Class: Player
// ============================================================================================
    
public class MiniPlayer
{
    public string? Id { get; set; } = null;
    public string? Icon { get; set; } = null;
    public string? Name { get; set; } = null;
    public int CurrentChipOnHand { get; set; } = 0;
    public MiniPlayer(){}
    public MiniPlayer(string id, string icon, string name, int currentChipOnHand) => (Id, Icon, Name, CurrentChipOnHand) = (id, icon, name, currentChipOnHand);

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
    
    public int PoolChip {get; set;}

    public bool IsWaiting { get; set; } = false;

    public bool IsEmpty => NumberOfPlayer == 0;
    public bool IsFull  => NumberOfPlayer == 5;

    public string? AddPlayer(MiniPlayer miniPlayer, int seatNo)
    {
        if (seatNo == 1 && Seat1 != null)
        {
            Seat1 = miniPlayer;
            IsWaiting = true;
            NumberOfPlayer++;
        }
        else if (seatNo == 2 && Seat2 != null)
        {
            Seat2 = miniPlayer;
            IsWaiting = false;
            NumberOfPlayer++;
        }
        else if (seatNo == 3 && Seat3 != null)
        {
            Seat3 = miniPlayer;
            IsWaiting = false;
            NumberOfPlayer++;
        }
        else if (seatNo == 4 && Seat4 != null)
        {
            Seat4 = miniPlayer;
            IsWaiting = false;
            NumberOfPlayer++;
        }
        else
        {
            Seat5 = miniPlayer;
            IsWaiting = false;
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

    private static List<MiniGame> minigames = new List<MiniGame>();

    public string Create()
    {
        var minigame = new MiniGame();
        minigames.Add(minigame);
        return minigame.Id;
    }

    // // TODO: Start()
    // public async Task Start()
    // {
    //     string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

    //     var game = games.Find(g => g.Id == gameId);
    //     if (game == null)
    //     {
    //         await Clients.Caller.SendAsync("Reject");
    //         return;
    //     }

    //     await Clients.Group(gameId).SendAsync("Start");
    // }

    // // TODO: Run(letter)
    // public async Task Run(string letter)
    // {
    //     string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

    // }

    // ----------------------------------------------------------------------------------------
    // Functions
    // ----------------------------------------------------------------------------------------

    private async Task UpdateList(string? id = null)
    {
        var list = minigames.FindAll(g => g.IsWaiting);

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
            case "minigame": await GameConnected(); break;
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
            case "lobby": ListDisconnected(); break;
            case "minigame": await GameDisconnected(); break;
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