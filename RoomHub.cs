using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;

// ============================================================================================
// Class: Player
// ============================================================================================
    
public class Player
{
    public string? Id { get; set; } = null;
    public string? Icon { get; set; } = null;
    public string? Name { get; set; } = null;
    public string? FirstHandCard {get; set;} = null;
    public string? SecondHandCard {get; set;} = null;
    public int ChipsOnHand { get; set; } = 0;

    public int ChipsOfTheRound{get; set;} = 0;

    public Player(){}

    public Player(string id, string icon, string name, int chipsOnHand) => (Id, Icon, Name, ChipsOnHand) = (id, icon, name, chipsOnHand);

}



// ============================================================================================
// Class: Game
// ============================================================================================

public class Game
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int NumberOfPlayer {get; set;} = 0;

    public string[] cards = 
    {"A <br> <span class='spades'>♠</span>", "K <br> <span class='spades'>♠</span>", "Q <br> <span class='spades'>♠</span>", "J <br> <span class='spades'>♠</span>", "10 <br> <span class='spades'>♠</span>", "9 <br> <span class='spades'>♠</span>", "8 <br> <span class='spades'>♠</span>", "7 <br> <span class='spades'>♠</span>", "6 <br> <span class='spades'>♠</span>", "5 <br> <span class='spades'>♠</span>", "4 <br> <span class='spades'>♠</span>", "3 <br> <span class='spades'>♠</span>", "2 <br> <span class='spades'>♠</span>",
    "A <br> <span class='hearts'>♥</span>", "K <br> <span class='hearts'>♥</span>", "Q <br> <span class='hearts'>♥</span>", "J <br> <span class='hearts'>♥</span>", "10 <br> <span class='hearts'>♥</span>", "9 <br> <span class='hearts'>♥</span>", "8 <br> <span class='hearts'>♥</span>", "7 <br> <span class='hearts'>♥</span>", "6 <br> <span class='hearts'>♥</span>", "5 <br> <span class='hearts'>♥</span>", "4 <br> <span class='hearts'>♥</span>", "3 <br> <span class='hearts'>♥</span>", "2 <br> <span class='hearts'>♥</span>",
    "A <br> <span class='clubs'>♣</span>", "K <br> <span class='clubs'>♣</span>", "Q <br> <span class='clubs'>♣</span>", "J <br> <span class='clubs'>♣</span>", "10 <br> <span class='clubs'>♣</span>", "9 <br> <span class='clubs'>♣</span>", "8 <br> <span class='clubs'>♣</span>", "7 <br> <span class='clubs'>♣</span>", "6 <br> <span class='clubs'>♣</span>", "5 <br> <span class='clubs'>♣</span>", "4 <br> <span class='clubs'>♣</span>", "3 <br> <span class='clubs'>♣</span>", "2 <br> <span class='clubs'>♣</span>",
    "A <br> <span class='diamonds'>♦</span>", "K <br> <span class='diamonds'>♦</span>", "Q <br> <span class='diamonds'>♦</span>", "J <br> <span class='diamonds'>♦</span>", "10 <br> <span class='diamonds'>♦</span>", "9 <br> <span class='diamonds'>♦</span>", "8 <br> <span class='diamonds'>♦</span>", "7 <br> <span class='diamonds'>♦</span>", "6 <br> <span class='diamonds'>♦</span>", "5 <br> <span class='diamonds'>♦</span>", "4 <br> <span class='diamonds'>♦</span>", "3 <br> <span class='diamonds'>♦</span>", "2 <br> <span class='diamonds'>♦</span>",
    };

    public List<Player> playersOfTheRound = new List<Player>();

    public List<Player> playersOfNextRound = new List<Player>();

    public int TimerPosition {get; set;} = 0;

    public int BigBlindPosition {get; set;} = 0;
    public int SmallBlindPosition {get; set;} = 0;

    public int ChipsOfTheRound {get; set;} = 10000;

    // public Dictionary<string, int> BlindPosition {get; set;} = new Dictionary<string, int>
    // {{"Seat 1", 1}, {"Seat 2", 2}, {"Seat 3", 3}
    // ,{"Seat 4", 4}, {"Seat 5", 5}};

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

    public bool IsWaiting { get; set; } = true;

    public bool IsEmpty => NumberOfPlayer == 0;
    public bool IsFull  => NumberOfPlayer == 5;

    public string[] Shuffle(){
        int[] arr = { 1, 2, 3, 4, 5 };
        Random random = new Random();
        cards = cards.OrderBy(x => random.Next()).ToArray();

        return cards;
    }

    public void AddPlayer(Player player, int seatNo)
    {
        if (seatNo == 1 && Seat1 == null)
        {
            Seat1 = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 2 && Seat2 == null)
        {
            Seat2 = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 3 && Seat3 == null)
        {
            Seat3 = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 4 && Seat4 == null)
        {
            Seat4 = player;
            NumberOfPlayer++;
        }
        else
        {
            Seat5 = player;
            NumberOfPlayer++;
        }

        if(IsWaiting){
            //Clear the previous record
            playersOfTheRound.Clear();


            if(Seat1 != null){
                playersOfTheRound.Add(Seat1);
            }

            if(Seat2 != null){
                playersOfTheRound.Add(Seat2);
            }

            if(Seat3 != null){
                playersOfTheRound.Add(Seat3);
            }

            if(Seat4 != null){
                playersOfTheRound.Add(Seat4);
            }

            if(Seat5 != null){
                playersOfTheRound.Add(Seat5);
            }
            
        }
        else{
            if(Seat1 != null){
                playersOfNextRound.Add(Seat1);
            }

            if(Seat2 != null){
                playersOfNextRound.Add(Seat2);
            }

            if(Seat3 != null){
                playersOfNextRound.Add(Seat3);
            }

            if(Seat4 != null){
                playersOfNextRound.Add(Seat4);
            }
            
            if(Seat5 != null){
                playersOfNextRound.Add(Seat5);
            }

            Console.WriteLine("Player Of Next Round Triggered");
        }

    }

    public void RemovePlayer(int seatNo)
    {
        if (seatNo == 1 && Seat1 != null)
        {
            if(playersOfTheRound.FindAll(p => p.Id == Seat1.Id) != null){
                playersOfTheRound.Remove(Seat1);
            }
            else if(playersOfNextRound.FindAll(p => p.Id == Seat1.Id) != null){
                playersOfNextRound.Remove(Seat1);
            }

            Seat1 = null;
            NumberOfPlayer--;
        }
        else if (seatNo == 2 && Seat2 != null)
        {
            if(playersOfTheRound.FindAll(p => p.Id == Seat2.Id) != null){
                playersOfTheRound.Remove(Seat2);
            }
            else if(playersOfNextRound.FindAll(p => p.Id == Seat2.Id) != null){
                playersOfNextRound.Remove(Seat2);
            }

            Seat2 = null;
            NumberOfPlayer--; 
        }
        else if (seatNo == 3 && Seat3 != null)
        {
            if(playersOfTheRound.FindAll(p => p.Id == Seat3.Id) != null){
                playersOfTheRound.Remove(Seat3);
            }
            else if(playersOfNextRound.FindAll(p => p.Id == Seat3.Id) != null){
                playersOfNextRound.Remove(Seat3);
            }

            Seat3 = null;
            NumberOfPlayer--;
        }
        else if (seatNo == 4 && Seat4 != null)
        {
            if(playersOfTheRound.FindAll(p => p.Id == Seat4.Id) != null){
                playersOfTheRound.Remove(Seat4);
            }
            else if(playersOfNextRound.FindAll(p => p.Id == Seat4.Id) != null){
                playersOfNextRound.Remove(Seat4);
            }

            Seat4 = null;
            NumberOfPlayer--;
        }
        else if (seatNo == 5 && Seat5 != null)
        {
            if(playersOfTheRound.FindAll(p => p.Id == Seat5.Id) != null){
                playersOfTheRound.Remove(Seat5);
            }
            else if(playersOfNextRound.FindAll(p => p.Id == Seat5.Id) != null){
                playersOfNextRound.Remove(Seat5);
            }
            
            Seat5 = null;
            NumberOfPlayer--;
        }

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
            await Clients.Caller.SendAsync("getSeat", seatNo, chips, name);
            await Clients.Group(gameId).SendAsync("ViewGame", game);

            if(game.NumberOfPlayer > 1){

                //Start Game
                game.IsWaiting = false;
                await HandCardDealing();
            }

            return;
        }

    }

    public async Task LeaveGame(int seatNo)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null)
        {
                //Remove player
                game.RemovePlayer(seatNo);

            if(game.NumberOfPlayer <= 1){
                //End Game
                game.IsWaiting = true;
                await Clients.Group(gameId).SendAsync("LeaveSeat", seatNo, "No Card");
                game.playersOfTheRound.Clear();
                game.playersOfNextRound.Clear();
                game.TimerPosition = 0;
                game.BigBlindPosition = 1;
                return;
            }

            await Clients.Group(gameId).SendAsync("LeaveSeat", seatNo);
            return;
        }

    }

    public async Task TimerTrigger(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<string> sequence = DetermineTimerSequence();

         //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){

            if(game.TimerPosition >= sequence.Count() -1){
                game.TimerPosition = 0;
                await Clients.Group(gameId).SendAsync("DisplayTimer", game, sequence[game.TimerPosition], sequence);
                game.TimerPosition++;
                return;
            }
            else{
                await Clients.Group(gameId).SendAsync("DisplayTimer", game, sequence[game.TimerPosition], sequence);
                game.TimerPosition++;
                return;
            }
            
        }

    }

    public async Task BlindTrigger(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<string> sequence = DetermineTimerSequence();

        //Find game
        var game = games.Find(g => g.Id == gameId);


        if (game != null){

            //Find Big Blind and Small Blind Position
            game.BigBlindPosition = FindSeatUserPosition(sequence[0], gameId);
            game.SmallBlindPosition = FindSeatUserPosition(sequence[1], gameId);

            await Clients.Group(gameId).SendAsync("BlindChips", game.BigBlindPosition, game.SmallBlindPosition, sequence, game.ChipsOfTheRound);
            return;
        }
    }

    private int FindSeatUserPosition(string playerID, string gameID){
        //Find game
        var game = games.Find(g => g.Id == gameID);
        int position = 0;

        if (game != null){
            if(playerID == game.Seat1?.Id){
                position = 1;
            }
            else if(playerID == game.Seat2?.Id){
                position = 2;
            }
            else if(playerID == game.Seat3?.Id){
                position = 3;
            }
            else if(playerID == game.Seat4?.Id){
                position = 4;
            }
            else if(playerID == game.Seat5?.Id){
                position = 5;
            }

        }

        return position;
    }

    private List<string> DetermineTimerSequence(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<string> timer_sequence = new List<string>();

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){
            foreach(Player player in game.playersOfTheRound){
                timer_sequence.Add(player.Id);
            }
        }

        return timer_sequence;
    }

    public async Task HandCardDealing(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //Find game
        var game = games.Find(g => g.Id == gameId);
        int cardIndex = 0;

        if (game != null){
            //Shuffle card
            game.Shuffle();

            List<string> sequence = CardDealingSequence(game);

            if (sequence.Contains("Seat 1") && game.Seat1 != null){
                game.Seat1.FirstHandCard = game.cards[cardIndex];
                game.Seat1.SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 2") && game.Seat2 != null){
                game.Seat2.FirstHandCard = game.cards[cardIndex];
                game.Seat2.SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 3") && game.Seat3 != null){
                game.Seat3.FirstHandCard = game.cards[cardIndex];
                game.Seat3.SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 4") && game.Seat4 != null){
                game.Seat4.FirstHandCard = game.cards[cardIndex];
                game.Seat4.SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 5") && game.Seat5 != null){
                game.Seat5.FirstHandCard = game.cards[cardIndex];
                game.Seat5.SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            await Clients.Group(gameId).SendAsync("StartGame", game);
            return;

        }
        
    }

    private List<string> CardDealingSequence(Game game){
        List<string> sequence = new List<string>();

        if(game.Seat1 != null){
            sequence.Add("Seat 1");
        }

        if(game.Seat2 != null){
            sequence.Add("Seat 2");
        }

        if(game.Seat3 != null){
            sequence.Add("Seat 3");
        }

        if(game.Seat4 != null){
            sequence.Add("Seat 4");
        }

        if(game.Seat5 != null){
            sequence.Add("Seat 5");
        }

        return sequence;
    }

    public async Task FlopRound(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1);

            game.FirstCard = game.cards[cardIndex + 1];
            game.SecondCard = game.cards[cardIndex + 2];
            game.ThirdCard = game.cards[cardIndex + 3];
        }
    }

    public async Task TurnRound(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1) + 4;
            game.FourthCard = game.cards[cardIndex + 1];
        }
    }

    public async Task RiverRound(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1) + 5;
            game.FifthCard = game.cards[cardIndex + 1];
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
        string id     = Context.ConnectionId;
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        
        var game = games.Find(g => g.Id == gameId);
        if (game == null || game.IsFull)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }
        else{
            await Groups.AddToGroupAsync(id, gameId);
            //await Clients.Group(gameId).SendAsync("Ready", letter, game);
            await Clients.Caller.SendAsync("ViewGame", game);
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