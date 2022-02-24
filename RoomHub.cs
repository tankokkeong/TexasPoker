using Microsoft.AspNetCore.SignalR;

// ============================================================================================
// Class: Player
// ============================================================================================
    
public class Player
{
    public string Id { get; set; }
    public string Icon { get; set; }
    public string Name { get; set; }
    public string FirstHandCard {get; set;}
    public string SecondHandCard {get; set;}
    public int ChipsOnHand { get; set; } = 0;
    public bool IsWin => Count >= FINISH;

    public Player(string id, string icon, string name) => (Id, Icon, Name) = (id, icon, name);

    public void Run() => Count += STEP;
}



// ============================================================================================
// Class: Game
// ============================================================================================

public class Game
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int NumberOfPlayer;
    public Player? Player1 { get; set; } = null;
    public Player? Player2 { get; set; } = null;
    public Player? Player3 { get; set; } = null;
    public Player? Player4 { get; set; } = null;
    public Player? Player5 { get; set; } = null;

    public string FirstCard {get; set;}
    public string SecondCard {get; set;}
    public string ThirdCard {get; set;}
    public string FourthCard {get; set;}
    public string FifthCard {get; set;}

    public int PoolChips {get; set;}

    public bool IsWaiting { get; set; } = false;

    public bool IsEmpty => NumberOfPlayer == 0;
    public bool IsFull  => NumberOfPlayer == 5;

    public string? AddPlayer(Player player)
    {
        if (PlayerA == null)
        {
            PlayerA = player;
            IsWaiting = true;
            return "A";
        }
        else if (PlayerB == null)
        {
            PlayerB = player;
            IsWaiting = false;
            return "B";
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

    private static List<Game> games = new List<Game>()
    {
        // new Game { PlayerA = new Player("P001", "👦🏻", "Boy") , IsWaiting = true },
        // new Game { PlayerA = new Player("P002", "👧🏻", "Girl"), IsWaiting = true },
    };

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

        var game = games.Find(g => g.Id == gameId);
        if (game == null)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        var player = letter == "A" ? game.PlayerA : game.PlayerB;
        if (player == null) return;

        player.Run();
        await Clients.Group(gameId).SendAsync("Move", letter, player.Count);

        if (player.IsWin)
        {
            await Clients.Group(gameId).SendAsync("Win", letter);
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
        string id     = Context.ConnectionId;
        string icon   = Context.GetHttpContext()?.Request.Query["icon"]   ?? "";
        string name   = Context.GetHttpContext()?.Request.Query["name"]   ?? "";
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        var game = games.Find(g => g.Id == gameId);
        if (game == null || game.IsFull)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        var player = new Player(id, icon, name);
        var letter = game.AddPlayer(player);
        await Groups.AddToGroupAsync(id, gameId);
        await Clients.Group(gameId).SendAsync("Ready", letter, game);
        await UpdateList();
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
        string id     = Context.ConnectionId;
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        var game = games.Find(g => g.Id == gameId);
        if (game == null)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        if (game.PlayerA?.Id == id)
        {
            game.PlayerA = null;
            await Clients.Group(gameId).SendAsync("Left", "A");
        }
        else if (game.PlayerB?.Id == id)
        {
            game.PlayerB = null;
            await Clients.Group(gameId).SendAsync("Left", "B");
        }

        if (game.IsEmpty)
        {
            games.Remove(game);
            await UpdateList();
        }
    }

    // End of GameHub -------------------------------------------------------------------------
}