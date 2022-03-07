using Microsoft.AspNetCore.SignalR;

// ============================================================================================
// Class: Player
// ============================================================================================
    
public class MiniPlayer
{
    public string Id {get; set;}
    public string Name {get; set;}
    public MiniPlayer(string id, string name) => (Id, Name) = (id, name);
}



// ============================================================================================
// Class: Game
// ============================================================================================

public class MiniGame
{
    public string Id {get; set;} = Guid.NewGuid().ToString();
    public MiniPlayer? PlayerA { get; set; } = null;
    public MiniPlayer? PlayerB { get; set; } = null;
    public bool IsWaiting { get; set; } = false;
    public bool isEmpty => PlayerA == null && PlayerB ==null;
    public bool isFull => PlayerA != null && PlayerB != null;


    public string? AddPlayer(MiniPlayer player){

        if (PlayerA == null){
            PlayerA = player;
            IsWaiting = true;
            return "A";
        }
        else if (PlayerB == null){
            PlayerB = player;
            IsWaiting = false;
            return "B";
        }

        return null;
    }

    public int Rolling(){
        Random random = new Random();
        int roll = random.Next(1,7);    
        return roll;   
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

    private static List<MiniGame> minigames = new()
    {

    };

    public string Create()
    {
        var minigame = new MiniGame();
        minigames.Add(minigame);
        return minigame.Id;
    }

    public async Task StartGame()
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        var game = minigames.Find(g => g.Id == gameId);
        if(game == null){
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        await Clients.Group(gameId).SendAsync("Start");
    }

    public async Task RollTheDice(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        var game = minigames.Find(g => g.Id == gameId);

        if(game == null){
            await Clients.Caller.SendAsync("Reject");
            return;
        }    
        
        int one = game.Rolling();
        int two = game.Rolling();
        int three = game.Rolling();

        int total = one + two + three;

        await CheckPlayerDecision(total);

        await Clients.Group(gameId).SendAsync("Result", one, two, three, total);
      
        return;
    }
    
    public async Task CheckPlayerDecision(int totalDice){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        var game = minigames.Find(g => g.Id == gameId);

        if(game == null){
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        string bigOrSmall = "";
        string OddOrEven = "";

        // Big or Small
        if (totalDice >= 11 && totalDice <=18){

                bigOrSmall = "Big";
                await Clients.Group(gameId).SendAsync("betSizeResult", bigOrSmall, OddOrEven);
            
        }else if(totalDice >= 3 && totalDice <=10){

                bigOrSmall = "Small";
                await Clients.Group(gameId).SendAsync("betSizeResult", bigOrSmall, OddOrEven);    
        }

        //Odd or Even
        if(totalDice % 2 == 0){
            OddOrEven = "Even";
            await Clients.Group(gameId).SendAsync("betSizeResult", bigOrSmall, OddOrEven);

        }else{
            
            OddOrEven = "Odd";
            await Clients.Group(gameId).SendAsync("betSizeResult",bigOrSmall, OddOrEven);
        }
    }

    // ----------------------------------------------------------------------------------------
    // Functions
    // ----------------------------------------------------------------------------------------
    private async Task UpdateList (string? id = null)
    {
        var list = minigames.FindAll(g => g.IsWaiting == true);
        
        if(id == null){    
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

        switch (page){
            case "lobby" : await ListConnected(); break;
            case "mini-game" : await GameConnected(); break;

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
        string id = Context.ConnectionId;
        string name = Context.GetHttpContext()?.Request.Query["username"] ?? "";
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        var game = minigames.Find(g=> g.Id == gameId);
        if (game == null || game.isFull){
            await Clients.Caller.SendAsync("Reject");
            return ;
        }

        var player = new MiniPlayer(id, name);
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

        switch (page){
            case "lobby" : ListDisconnected(); break;
            case "mini-game" : await GameDisconnected(); break;

        }
        await base.OnDisconnectedAsync(exception);
    }

    private void ListDisconnected()
    {
        // Do nothing
    }

    private async Task GameDisconnected()
    {
        string id = Context.ConnectionId;
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        var game = minigames.Find(g => g.Id == gameId);

        if(game == null){
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        if(game.PlayerA?.Id == id)
        {
            game.PlayerA = null;
            await Clients.Group(gameId).SendAsync("Left", "A");
        }
        else if (game.PlayerB?.Id == id){

            game.PlayerB = null;
            await Clients.Group(gameId).SendAsync("Left", "B");
        }

        if(game.isEmpty)
        {
            minigames.Remove(game);
            await UpdateList();
        }
    }
}