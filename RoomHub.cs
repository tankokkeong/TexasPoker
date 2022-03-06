using Microsoft.AspNetCore.SignalR;
using System;
using System.Net.Http;
using Newtonsoft.Json;
using System.Threading.Tasks;


// ============================================================================================
// Class: HandCardRanking
// ============================================================================================

public class HandCardRanking{
    public int HandType{get; set;}
    public int HankRank {get; set;}
    public int Value {get; set;} = 0;
    public string? HandName {get; set;}
}

// ============================================================================================
// Class: Player
// ============================================================================================

public class Player
{
    public string? SignalRConnectionId{get; set;} = null;
    public string? Id { get; set; } = null;
    public string? Icon { get; set; } = null;
    public string? Name { get; set; } = null;
    public string? FirstHandCard {get; set;} = null;
    public string? SecondHandCard {get; set;} = null;

    public int HandCardValue {get; set;} = 0;

    public string? HandCardName {get; set;} = null;

    public int ChipsOnHand { get; set; } = 0;

    public int ChipsOnTable { get; set; } = 0;

    public int SeatNo {get; set; } = 0;
    
    public Player(){}

    public Player(string signalRConnectionId, string id, string icon, string name, int chipsOnHand, int seatNo) => (SignalRConnectionId, Id, Icon, Name, ChipsOnHand, SeatNo) = (signalRConnectionId, id, icon, name, chipsOnHand, seatNo);

}

// ============================================================================================
// Class: Game
// ============================================================================================

public class Game
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int NumberOfPlayer {get; set;} = 0;

    public int NumberOfConnection {get; set;} = 0;
    public string[] cards = 
    {"A <br> <span class='spades'>♠</span>", "K <br> <span class='spades'>♠</span>", "Q <br> <span class='spades'>♠</span>", "J <br> <span class='spades'>♠</span>", "10 <br> <span class='spades'>♠</span>", "9 <br> <span class='spades'>♠</span>", "8 <br> <span class='spades'>♠</span>", "7 <br> <span class='spades'>♠</span>", "6 <br> <span class='spades'>♠</span>", "5 <br> <span class='spades'>♠</span>", "4 <br> <span class='spades'>♠</span>", "3 <br> <span class='spades'>♠</span>", "2 <br> <span class='spades'>♠</span>",
    "A <br> <span class='hearts'>♥</span>", "K <br> <span class='hearts'>♥</span>", "Q <br> <span class='hearts'>♥</span>", "J <br> <span class='hearts'>♥</span>", "10 <br> <span class='hearts'>♥</span>", "9 <br> <span class='hearts'>♥</span>", "8 <br> <span class='hearts'>♥</span>", "7 <br> <span class='hearts'>♥</span>", "6 <br> <span class='hearts'>♥</span>", "5 <br> <span class='hearts'>♥</span>", "4 <br> <span class='hearts'>♥</span>", "3 <br> <span class='hearts'>♥</span>", "2 <br> <span class='hearts'>♥</span>",
    "A <br> <span class='clubs'>♣</span>", "K <br> <span class='clubs'>♣</span>", "Q <br> <span class='clubs'>♣</span>", "J <br> <span class='clubs'>♣</span>", "10 <br> <span class='clubs'>♣</span>", "9 <br> <span class='clubs'>♣</span>", "8 <br> <span class='clubs'>♣</span>", "7 <br> <span class='clubs'>♣</span>", "6 <br> <span class='clubs'>♣</span>", "5 <br> <span class='clubs'>♣</span>", "4 <br> <span class='clubs'>♣</span>", "3 <br> <span class='clubs'>♣</span>", "2 <br> <span class='clubs'>♣</span>",
    "A <br> <span class='diamonds'>♦</span>", "K <br> <span class='diamonds'>♦</span>", "Q <br> <span class='diamonds'>♦</span>", "J <br> <span class='diamonds'>♦</span>", "10 <br> <span class='diamonds'>♦</span>", "9 <br> <span class='diamonds'>♦</span>", "8 <br> <span class='diamonds'>♦</span>", "7 <br> <span class='diamonds'>♦</span>", "6 <br> <span class='diamonds'>♦</span>", "5 <br> <span class='diamonds'>♦</span>", "4 <br> <span class='diamonds'>♦</span>", "3 <br> <span class='diamonds'>♦</span>", "2 <br> <span class='diamonds'>♦</span>",
    };

    public int previousBlindPosition {get; set; } = 0;

    public List<Player?> playersOfTheRound = new List<Player?>();

    public List<Player?> playersOfNextRound = new List<Player?>();

    public int CardRoundCount {get; set;} = 0;
    public int TimerPosition {get; set;} = 0;

    public int BigBlindPosition {get; set;} = 0;
    public int SmallBlindPosition {get; set;} = 0;

    public int ChipsOfTheRound {get; set;} = 10000;

    // public Dictionary<string, int> BlindPosition {get; set;} = new Dictionary<string, int>
    // {{"Seat 1", 1}, {"Seat 2", 2}, {"Seat 3", 3}
    // ,{"Seat 4", 4}, {"Seat 5", 5}};

    //Default 5 players
    public List<Player?> Seat {get; set;} = 
    new List<Player?>{null, null, null, null, null};

    public string? FirstCard {get; set;} = null;
    public string? SecondCard {get; set;} = null;
    public string? ThirdCard {get; set;} = null;
    public string? FourthCard {get; set;} = null;
    public string? FifthCard {get; set;} = null;

    public int PoolChips {get; set;} = 0;

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
        if (seatNo == 1 && Seat[0] == null)
        {
            Seat[0] = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 2 && Seat[1] == null)
        {
            Seat[1] = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 3 && Seat[2] == null)
        {
            Seat[2] = player;
            NumberOfPlayer++;
        }
        else if (seatNo == 4 && Seat[3] == null)
        {
            Seat[3] = player;
            NumberOfPlayer++;
        }
        else
        {
            Seat[4] = player;
            NumberOfPlayer++;
        }

        if(NumberOfPlayer <= 2){

            //Clear previous record
            playersOfTheRound.Clear();
            playersOfNextRound.Clear();

            if(Seat[0] != null){
                playersOfTheRound.Add(Seat[0]);
                playersOfNextRound.Add(Seat[0]);
            }

            if(Seat[1] != null){
                playersOfTheRound.Add(Seat[1]);
                playersOfNextRound.Add(Seat[1]);
            }

            if(Seat[2] != null){
                playersOfTheRound.Add(Seat[2]);
                playersOfNextRound.Add(Seat[2]);
            }

            if(Seat[3] != null){
                playersOfTheRound.Add(Seat[3]);
                playersOfNextRound.Add(Seat[3]);
            }

            if(Seat[4] != null){
                playersOfTheRound.Add(Seat[4]);
                playersOfNextRound.Add(Seat[4]);
            }
            
        }
        else{

            //Clear previous record
            playersOfNextRound.Clear();

            if(Seat[0] != null){
                playersOfNextRound.Add(Seat[0]);
            }

            if(Seat[1] != null){
                playersOfNextRound.Add(Seat[1]);
            }

            if(Seat[2] != null){
                playersOfNextRound.Add(Seat[2]);
            }

            if(Seat[3] != null){
                playersOfNextRound.Add(Seat[3]);
            }
            
            if(Seat[4] != null){
                playersOfNextRound.Add(Seat[4]);
            }
            
            Console.WriteLine("Player Of Next Round Triggered");
        }

        //Console.WriteLine("Number of sitting players: " + NumberOfPlayer);
        //Console.WriteLine("Number of players Of the round: " + playersOfTheRound.Count());

    }

    public void RemovePlayer(int seatNo)
    {
        if (seatNo == 1 && Seat[0] != null)
        {
            if(playersOfTheRound.FindAll(p => p?.Id == Seat[0]?.Id) != null){
                playersOfTheRound.Remove(Seat[0]);
            }

            if(playersOfNextRound.FindAll(p => p?.Id == Seat[0]?.Id) != null){
                playersOfNextRound.Remove(Seat[0]);
            }

            Seat[0] = null;
            NumberOfPlayer--;
        }
        else if (seatNo == 2 && Seat[1] != null)
        {
            if(playersOfTheRound.FindAll(p => p?.Id == Seat[1]?.Id) != null){
                playersOfTheRound.Remove(Seat[1]);
            }

            if(playersOfNextRound.FindAll(p => p?.Id == Seat[1]?.Id) != null){
                playersOfNextRound.Remove(Seat[1]);
            }

            Seat[1] = null;
            NumberOfPlayer--; 
        }
        else if (seatNo == 3 && Seat[2] != null)
        {
            if(playersOfTheRound.FindAll(p => p?.Id == Seat[2]?.Id) != null){
                playersOfTheRound.Remove(Seat[2]);
            }
            
            if(playersOfNextRound.FindAll(p => p?.Id == Seat[2]?.Id) != null){
                playersOfNextRound.Remove(Seat[2]);
            }

            Seat[2] = null;
            NumberOfPlayer--;
        }
        else if (seatNo == 4 && Seat[3] != null)
        {
            if(playersOfTheRound.FindAll(p => p?.Id == Seat[3]?.Id) != null){
                playersOfTheRound.Remove(Seat[3]);
            }
            
            if(playersOfNextRound.FindAll(p => p?.Id == Seat[3]?.Id) != null){
                playersOfNextRound.Remove(Seat[3]);
            }

            Seat[3] = null;
            NumberOfPlayer--;
        }
        else if (seatNo == 5 && Seat[4] != null)
        {
            if(playersOfTheRound.FindAll(p => p?.Id == Seat[4]?.Id) != null){
                playersOfTheRound.Remove(Seat[4]);
            }
            
            if(playersOfNextRound.FindAll(p => p?.Id == Seat[4]?.Id) != null){
                playersOfNextRound.Remove(Seat[4]);
            }
            
            Seat[4] = null;
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
        string connectionId     = Context.ConnectionId;

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null || !game.IsFull)
        {
            //Create new player
            var player = new Player(connectionId, id, icon, name, chips, seatNo);

            game.AddPlayer(player, seatNo);
            await Clients.Caller.SendAsync("getSeat", seatNo, chips, name);
            await Clients.Group(gameId).SendAsync("ViewGame", game);

            if(game.NumberOfPlayer > 1){

                //Start Game
                await HandCardDealing();
            }

            return;
        }

    }

    public async Task LeaveGame(int seatNo)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<Player> sequence = DetermineTimerSequence();

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null)
        {

            //Remove player
            game.RemovePlayer(seatNo);

            if(game.NumberOfPlayer == 0){

            }

            if(game.NumberOfPlayer == 1){
                await updatePotChips();
                await Clients.Group(gameId).SendAsync("DeclareWinner", sequence[0]);

                //Console.WriteLine("Winner timer position: " + FindSeatUserPosition(sequence[0], game.Id));

                //Update winner's chips
                game.Seat[FindSeatUserPosition(sequence[0].Id, game.Id) - 1].ChipsOnHand = game.Seat[FindSeatUserPosition(sequence[0].Id, game.Id) - 1].ChipsOnHand  + game.PoolChips;
                await Clients.Group(gameId).SendAsync("updateWinnerChipsOnHands", FindSeatUserPosition(sequence[0].Id, game.Id), game.Seat[FindSeatUserPosition(sequence[0].Id, game.Id) - 1].ChipsOnHand, game.PoolChips);

                //Remove player
                game.RemovePlayer(seatNo);

                //End Game
                await Clients.Group(gameId).SendAsync("LeaveSeat", seatNo, "Remaining One Player");
                game.playersOfTheRound.Clear();
                game.playersOfNextRound.Clear();
                game.TimerPosition = 0;
                game.previousBlindPosition = 0;
                game.CardRoundCount = 0;
                return;
            }

            await Clients.Group(gameId).SendAsync("LeaveSeat", seatNo);
            return;
        }

    }

    public async Task checkTrigger(int seatNo = 0){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

         //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){
            await Clients.Group(gameId).SendAsync("CheckAction", seatNo, game.Seat[seatNo - 1]?.Name);
            await TimerTrigger();
        }
    }

    public async Task CallTrigger(int seatNo = 0){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){
           
            //Deduct the user chips on hand
            game.Seat[seatNo - 1].ChipsOnHand = game.Seat[seatNo - 1].ChipsOnHand - (game.ChipsOfTheRound - game.Seat[seatNo - 1].ChipsOnTable);
            game.Seat[seatNo - 1].ChipsOnTable = game.ChipsOfTheRound;
            await updateChipsOnHand();
            await Clients.Group(gameId).SendAsync("CallAction", seatNo, game.Seat[seatNo - 1]?.Name);
            await TimerTrigger();
        }
    }

    public async Task FoldTrigger(int seatNo = 0){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){

            //remove the cards on hand
            game.Seat[seatNo - 1].FirstHandCard = null;
            game.Seat[seatNo - 1].SecondHandCard = null;


            await Clients.Group(gameId).SendAsync("FoldAction", seatNo, game.Seat[seatNo - 1]?.Name);

            //Remove from players of the round
            game.playersOfTheRound.Remove(game.Seat[seatNo - 1]);

            if(game.NumberOfPlayer >= 2){
                await TimerTrigger();
            }
        }
    }

    public async Task TimerTrigger(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<Player> sequence = DetermineTimerSequence();

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){

            if(sequence.Count() == 1){

                await updatePotChips();
                await Clients.Group(gameId).SendAsync("DeclareWinner", sequence[0]);

                //Console.WriteLine("Winner timer position: " + game.TimerPosition);

                //Update winner's chips
                game.Seat[FindSeatUserPosition(sequence[0].Id, game.Id) - 1].ChipsOnHand = game.Seat[FindSeatUserPosition(sequence[0].Id, game.Id) - 1].ChipsOnHand  + game.PoolChips;
                await Clients.Group(gameId).SendAsync("updateWinnerChipsOnHands", FindSeatUserPosition(sequence[0].Id, game.Id), game.Seat[FindSeatUserPosition(sequence[0].Id, game.Id) - 1].ChipsOnHand, game.PoolChips);

                //Reset all the attributes
                game.CardRoundCount = 0;

                //Leave the users if the chips on hand is 0
                if(game.Seat[0]?.ChipsOnHand <= 0){
                    await LeaveGame(1);
                }

                if(game.Seat[1]?.ChipsOnHand <= 0){
                    await LeaveGame(2); 
                }

                if(game.Seat[2]?.ChipsOnHand <= 0){
                    await LeaveGame(3);
                }

                if(game.Seat[3]?.ChipsOnHand <= 0){
                    await LeaveGame(4);   
                }

                if(game.Seat[4]?.ChipsOnHand <= 0){
                    await LeaveGame(5);
                }

                updateSeatDetails();
                
                if(game.NumberOfPlayer >= 2){
                    await HandCardDealing();
                }
            }
            else{
                if(game.TimerPosition == 0){

                    //Determine the flop round, turn round, and river round
                    if(game.CardRoundCount == 1){

                        await FlopRound();
                        await updatePotChips();

                        //Update the pool chips
                        updatePoolChips();

                        //Reset the chips of the round
                        game.ChipsOfTheRound = 0;
                    }
                    else if(game.CardRoundCount == 2){
                        
                        await TurnRound();
                        await updatePotChips();

                        //Update the pool chips
                        updatePoolChips();

                        //Reset the chips of the round
                        game.ChipsOfTheRound = 0;
                    }
                    else if(game.CardRoundCount == 3){

                        await RiverRound();
                        await updatePotChips();

                        //Update the pool chips
                        updatePoolChips();

                        //Reset the chips of the round
                        game.ChipsOfTheRound = 0;
                    }

                    game.CardRoundCount++; 
                }

                if(game.CardRoundCount > 4){
                    
                    string ?card1 = CardFormatter(game.FirstCard);
                    string ?card2 = CardFormatter(game.SecondCard);
                    string ?card3 = CardFormatter(game.ThirdCard);
                    string ?card4 = CardFormatter(game.FourthCard);
                    string ?card5 = CardFormatter(game.FifthCard);

                    //Check hand card ranking
                    if(game.Seat[0] != null){
                        string ?card6 = CardFormatter(game.Seat[0].FirstHandCard);
                        string ?card7 = CardFormatter(game.Seat[0].SecondHandCard);

                        await CheckHandRanking(1, card1, card2, card3, card4, card5, card6, card7);
                    }

                    if(game.Seat[1] != null){
                        string ?card6 = CardFormatter(game.Seat[1].FirstHandCard);
                        string ?card7 = CardFormatter(game.Seat[1].SecondHandCard);

                        await CheckHandRanking(2, card1, card2, card3, card4, card5, card6, card7);
                    }

                    if(game.Seat[2] != null){
                        string ?card6 = CardFormatter(game.Seat[2].FirstHandCard);
                        string ?card7 = CardFormatter(game.Seat[2].SecondHandCard);

                        await CheckHandRanking(3, card1, card2, card3, card4, card5, card6, card7);
                    }

                    if(game.Seat[3] != null){
                        string ?card6 = CardFormatter(game.Seat[3].FirstHandCard);
                        string ?card7 = CardFormatter(game.Seat[3].SecondHandCard);

                        await CheckHandRanking(4, card1, card2, card3, card4, card5, card6, card7);
                    }

                    if(game.Seat[4] != null){
                        string ?card6 = CardFormatter(game.Seat[4].FirstHandCard);
                        string ?card7 = CardFormatter(game.Seat[4].SecondHandCard);

                        await CheckHandRanking(5, card1, card2, card3, card4, card5, card6, card7);
                    }

                    List<string> winningPlayers = CompareWinningHand();

                    for(int i = 0; i < winningPlayers.Count(); i++){
                        await Clients.Group(gameId).SendAsync("RoundWinner", game.Seat[FindSeatUserPosition(winningPlayers[i], game.Id) - 1], game.ChipsOfTheRound);
                    }
                    
                }
                else{

                    Console.WriteLine("Timer Position Count: " + game.TimerPosition);

                    if(game.TimerPosition == sequence.Count() -1){

                        await Clients.Group(gameId).SendAsync("GameAction", game.ChipsOfTheRound , sequence[game.TimerPosition].Id,  game.TimerPosition);
                        await Clients.Group(gameId).SendAsync("DisplayTimer", game, sequence[game.TimerPosition].Id, sequence);
                        Console.WriteLine("Player's Turn: " + sequence[game.TimerPosition].Name);
                        game.TimerPosition = 0;
                    }
                    else{

                        await Clients.Group(gameId).SendAsync("GameAction", game.ChipsOfTheRound , sequence[game.TimerPosition].Id, game.TimerPosition);
                        await Clients.Group(gameId).SendAsync("DisplayTimer", game, sequence[game.TimerPosition].Id, sequence);
                        Console.WriteLine("Player's Turn: " + sequence[game.TimerPosition].Name);
                        game.TimerPosition++;
                    }
                }

            }
            
        }

        return;

    }

    public async Task BlindTrigger(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<Player> sequence = DetermineTimerSequence();

        //Console.WriteLine("Blind Triggered: Sequence count " + sequence.Count());

        //Find game
        var game = games.Find(g => g.Id == gameId);


        if (game != null){

            //Find Big Blind and Small Blind Position
            game.BigBlindPosition = FindSeatUserPosition(sequence[game.previousBlindPosition].Id, gameId);

            if(game.previousBlindPosition + 1 == sequence.Count()){
                game.previousBlindPosition = 0;
                game.SmallBlindPosition = FindSeatUserPosition(sequence[game.previousBlindPosition].Id, gameId);
            }
            else{
                game.SmallBlindPosition = FindSeatUserPosition(sequence[game.previousBlindPosition + 1].Id, gameId);
                game.previousBlindPosition++;
            }

            game.TimerPosition = game.BigBlindPosition - 1;
            
            //Deduct the user chips on hand
            game.Seat[game.BigBlindPosition - 1].ChipsOnHand = game.Seat[game.BigBlindPosition - 1].ChipsOnHand - 10000;
            game.Seat[game.SmallBlindPosition - 1].ChipsOnHand = game.Seat[game.SmallBlindPosition - 1].ChipsOnHand - 5000;
            game.Seat[game.BigBlindPosition - 1].ChipsOnTable = 10000;
            game.Seat[game.SmallBlindPosition - 1].ChipsOnTable = 5000;
            game.PoolChips = 15000;
            game.ChipsOfTheRound = 10000;

            await updateChipsOnHand();

            await Clients.Group(gameId).SendAsync("BlindChips", game.BigBlindPosition, game.SmallBlindPosition, sequence);
        }

        return;
    }

    private int FindSeatUserPosition(string playerID, string gameID){
        //Find game
        var game = games.Find(g => g.Id == gameID);
        int position = 0;

        if (game != null){
            if(playerID == game.Seat[0]?.Id){
                position = 1;
            }
            else if(playerID == game.Seat[1]?.Id){
                position = 2;
            }
            else if(playerID == game.Seat[2]?.Id){
                position = 3;
            }
            else if(playerID == game.Seat[3]?.Id){
                position = 4;
            }
            else if(playerID == game.Seat[4]?.Id){
                position = 5;
            }

        }

        return position;
    }

    private List<Player> DetermineTimerSequence(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        List<string> timer_sequence = new List<string>();

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){

            //Bubble Sort the list before return
            int n = game.playersOfTheRound.Count();

            //Console.WriteLine("Number of players of the round: " + n);

            for (int i = 0; i < n - 1; i++){
                for (int j = 0; j < n - i - 1; j++){

                    if (game.playersOfTheRound[j].SeatNo > game.playersOfTheRound[j + 1].SeatNo)
                    {
                        // swap temp and default_sequence[i]
                        Player temp = game.playersOfTheRound[j];
                        game.playersOfTheRound[j] = game.playersOfTheRound[j + 1];
                        game.playersOfTheRound[j + 1] = temp;
                    }
                }
            }

            foreach(Player player in game.playersOfTheRound){
                Console.WriteLine("Sorted, Seat: " + player.SeatNo + " Name: " + player.Name);
            }

            Console.WriteLine("Sorting done");

            
        }

        return game.playersOfTheRound;
    }

    public async Task HandCardDealing(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //printAllUser();

        //Find game
        var game = games.Find(g => g.Id == gameId);
        int cardIndex = 0;

        if (game != null){

            //Console.WriteLine("Hand Card Dealing triggered Player of next round: " + game.playersOfNextRound.Count() );

            //Shuffle card
            game.Shuffle();

            List<string> sequence = CardDealingSequence(game);

            if (sequence.Contains("Seat 1") && game.Seat[0] != null){
                game.Seat[0].FirstHandCard = game.cards[cardIndex];
                game.Seat[0].SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 2") && game.Seat[1] != null){
                game.Seat[1].FirstHandCard = game.cards[cardIndex];
                game.Seat[1].SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 3") && game.Seat[2] != null){
                game.Seat[2].FirstHandCard = game.cards[cardIndex];
                game.Seat[2].SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 4") && game.Seat[3] != null){
                game.Seat[3].FirstHandCard = game.cards[cardIndex];
                game.Seat[3].SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            if (sequence.Contains("Seat 5") && game.Seat[4] != null){
                game.Seat[4].FirstHandCard = game.cards[cardIndex];
                game.Seat[4].SecondHandCard = game.cards[cardIndex + 1];

                cardIndex = cardIndex + 2;
            }

            await Clients.Group(game.Id).SendAsync("StartGame", game);
            await BlindTrigger();
            await TimerTrigger();
            return;

        }
        
    }

    public async Task CheckHandRanking(int seatNo = 0, string? card1 = null, string? card2 = null, string? card3 = null, string? card4 = null, string? card5 = null,
    string? card6 = null, string? card7 = null){
        
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(seatNo != 0){

            if (game != null){
                
                if(card1 != null && card2 != null && card3 != null && card4 != null && card5 !=null
                && card6 != null && card7 != null){

                    var client = new HttpClient();
                    var URL = "https://ewt-poker-evaluator.herokuapp.com/?card1=" + card1 +
                    "&card2=" + card2 +
                    "&card3=" + card3 +
                    "&card4=" + card4 + 
                    "&card5=" + card5 + 
                    "&card6=" + card6 +
                    "&card7=" + card7;

                    Console.WriteLine("Card 1: " + card1 + "Card 2: " + card2 + " Card 3: " + card3 + " Card 4: " + card4 + " Card 5: " + card5 + " Card 6: " + card6 + " Card 7: " + card7);
                    Console.WriteLine("URL: "+ URL);

                    var content = await client.GetStringAsync(URL);

                    HandCardRanking? myObject = JsonConvert.DeserializeObject<HandCardRanking>(content);


                    if(seatNo == 1 && game.Seat[0] != null){
                        game.Seat[0].HandCardValue = myObject.Value;
                        game.Seat[0].HandCardName = myObject.HandName;
                    }
                    else if(seatNo == 2 && game.Seat[1] != null){
                        game.Seat[1].HandCardValue = myObject.Value;
                        game.Seat[1].HandCardName = myObject.HandName;
                    }
                    else if(seatNo == 3 && game.Seat[2] != null){
                        game.Seat[2].HandCardValue = myObject.Value;
                        game.Seat[2].HandCardName = myObject.HandName;
                    }
                    else if(seatNo == 4 && game.Seat[3] != null){
                        game.Seat[3].HandCardValue = myObject.Value;
                        game.Seat[3].HandCardName = myObject.HandName;
                    }
                    else if(seatNo == 5 && game.Seat[4] != null){
                        game.Seat[4].HandCardValue = myObject.Value;
                        game.Seat[4].HandCardName = myObject.HandName;
                    }

                }
            }
        }
    }

    private List<string> CardDealingSequence(Game game){
        List<string> sequence = new List<string>();

        if(game.Seat[0] != null){
            sequence.Add("Seat 1");
        }

        if(game.Seat[1] != null){
            sequence.Add("Seat 2");
        }

        if(game.Seat[2] != null){
            sequence.Add("Seat 3");
        }

        if(game.Seat[3] != null){
            sequence.Add("Seat 4");
        }

        if(game.Seat[4] != null){
            sequence.Add("Seat 5");
        }

        return sequence;
    }

    private void updateSeatDetails(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if (game != null){

            //Console.WriteLine("Players of next round: " + game.playersOfNextRound[0].Name + " " + game.playersOfNextRound[1].Name + " " + game.playersOfNextRound[2].Name);
            game.playersOfTheRound.Clear();
            
            for(int i = 0; i < game.playersOfNextRound.Count(); i++){

                //Add the queueing users to the player of the round list
                game.playersOfTheRound.Add(game.playersOfNextRound[i]);    
            }
        }
    }

    private async Task updateChipsOnHand(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){

            //Update the chips on hand
            await Clients.Group(game.Id).
            SendAsync("updateChipsOnHand", game.Seat[0]?.ChipsOnHand, game.Seat[1]?.ChipsOnHand, game.Seat[2]?.ChipsOnHand,
            game.Seat[3]?.ChipsOnHand, game.Seat[4]?.ChipsOnHand);
            
            //Update the chips on the table
            await Clients.Group(game.Id).
            SendAsync("updateChipsOnTable", game.Seat[0]?.ChipsOnTable, game.Seat[1]?.ChipsOnTable, game.Seat[2]?.ChipsOnTable,
            game.Seat[3]?.ChipsOnTable, game.Seat[4]?.ChipsOnTable);
        }
    }

    private async Task FlopRound(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1);

            game.FirstCard = game.cards[cardIndex + 1];
            game.SecondCard = game.cards[cardIndex + 2];
            game.ThirdCard = game.cards[cardIndex + 3];

            //Reveal the first 3 cards 
            await Clients.Group(game.Id).SendAsync("FlopRound", game.FirstCard, game.SecondCard, game.ThirdCard);
        }
    }

    private async Task TurnRound(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1) + 4;
            game.FourthCard = game.cards[cardIndex + 1];

            //Reveal the foruth card 
            await Clients.Group(game.Id).SendAsync("TurnRound", game.FourthCard);
        }
    }

    private async Task RiverRound(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            int cardIndex = ((game.playersOfTheRound.Count() * 2) - 1) + 5;
            game.FifthCard = game.cards[cardIndex + 1];

            //Reveal the foruth card 
            await Clients.Group(game.Id).SendAsync("RiverRound", game.FifthCard);
        }

    }

    private async Task updatePotChips(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            
            int ?totalChips = 0;

            if(game.Seat[0] != null){
                totalChips += game.Seat[0]?.ChipsOnTable;   
            }

            if(game.Seat[1] != null){
                totalChips += game.Seat[1]?.ChipsOnTable;   
            }

            if(game.Seat[2] != null){
                totalChips += game.Seat[2]?.ChipsOnTable;   
            }

            if(game.Seat[3] != null){
                totalChips += game.Seat[3]?.ChipsOnTable;   
            }

            if(game.Seat[4] != null){
                totalChips += game.Seat[4]?.ChipsOnTable;   
            }

            //Reveal the foruth card 
            await Clients.Group(game.Id).SendAsync("updatePotChips", totalChips);
        }
    }

    private void updatePoolChips(){

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){
            //Update the pool chips
            if(game.Seat[0] != null){
                game.PoolChips = game.PoolChips + game.Seat[0].ChipsOnTable;
            }

            if(game.Seat[1] != null){
                game.PoolChips = game.PoolChips + game.Seat[1].ChipsOnTable;
            }

            if(game.Seat[2] != null){
                game.PoolChips = game.PoolChips + game.Seat[2].ChipsOnTable;
            }

            if(game.Seat[3] != null){
                game.PoolChips = game.PoolChips + game.Seat[3].ChipsOnTable;
            }

            if(game.Seat[4] != null){
                game.PoolChips = game.PoolChips + game.Seat[4].ChipsOnTable;
            }
        }

    }

    private void printAllUser(){
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);

        if(game != null){

            for(int i = 0; i < 5; i++){
                if(game.Seat[i] != null){
                    Console.WriteLine("Seat " + i + " : " + game.Seat[i].Name);
                }
                else{
                    Console.WriteLine("Seat " + i + " : null");
                }
            }
        }
    }

    private List<string> CompareWinningHand(){
        List<string> winningId = new List<string>();

        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        //Find game
        var game = games.Find(g => g.Id == gameId);
        int highestValue = 0;

        if(game != null){

            //Compare all the users' hand card values
            for(int i = 0; i < 5; i++){

                if(game.Seat[i] != null){
                    
                    if(game.Seat[i].HandCardValue > highestValue){

                        //Clear previous winning hand
                        winningId.Clear();

                        //Add the winning record
                        highestValue = game.Seat[i].HandCardValue;
                        winningId.Add(game.Seat[i].Id);
                    }
                    else if(game.Seat[i].HandCardValue == highestValue){

                        winningId.Add(game.Seat[i].Id);
                    }
                }
            }
        }

        return winningId;
    }

    private string? CardFormatter(string card){

        if(card != null){
            if(card.Substring(0,1) == "1"){
                return "T" + card.Substring(21,1);
            }
            else{
                return card.Substring(0, 1) + card.Substring(20,1);
            }
        }
        else{
            return null;
        }
    }

    // ----------------------------------------------------------------------------------------
    // Functions
    // ----------------------------------------------------------------------------------------

    // private async Task UpdateList(string? id = null)
    // {

    // }

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
        //await UpdateList(id);
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
            game.NumberOfConnection++;
            await Groups.AddToGroupAsync(id, gameId);
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
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        string connectionId     = Context.ConnectionId;

        var game = games.Find(g => g.Id == gameId);
        if (game == null)
        {
            await Clients.Caller.SendAsync("Reject");
            return;
        }

        //trigger the leave seat function when a user lost connection
        if(game.Seat[0] != null){

            if(connectionId == game.Seat[0].SignalRConnectionId){
                await LeaveGame(1);
            }
        }

        if(game.Seat[1] != null){

            if(connectionId == game.Seat[1].SignalRConnectionId){
                await LeaveGame(2);
            }
        }

        if(game.Seat[2] != null){

            if(connectionId == game.Seat[2].SignalRConnectionId){
                await LeaveGame(3);
            }
        }

        if(game.Seat[3] != null){

            if(connectionId == game.Seat[3].SignalRConnectionId){
                await LeaveGame(4);
            }
        }

        if(game.Seat[4] != null){
            
            if(connectionId == game.Seat[4].SignalRConnectionId){
                await LeaveGame(5);
            }
        }

        game.NumberOfConnection--;

        //Remove the room if there is no player in the room
        if (game.NumberOfConnection == 0)
        {
            //games.Remove(game);
            //await UpdateList();
        }
    }

    // End of GameHub -------------------------------------------------------------------------
}