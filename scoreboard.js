var app = angular.module("scoreboard", []);

// set required fields
app.value("playerResult",{
    playerFields: ["player_1","player_2","score_1","score_2"]
})

// set constant messages
app.value("message", {
    MinScoreCriteria: "Minimum score to win is 11",
    ScoreExceeded: "Invalid score!. Cannot exceed more than 11.",
    MissingFields: "Please select a value for: ",
    DifferenceScoreNotMet: "Winning score can only be 2 points more than other players score",
    AllFieldsMandatory : "Please select players and scores",
    isError:"error",
    isSuccess:"success",
    SuccessMessageForScoreAdded: "Result added successfully",
    PlayerAdded : "Player added successfully",
    PlayerAlreadyAvailable : "Player is already available",
    SamePlayers : "Player 1 and player 2 cannot be same"
});

app.controller("scoreboardController", ['$scope',"message","playerResult", 
    function($scope,message,playerResult) {
    $scope.players = [
        { id: 1, name: "Justin" },
        { id: 2, name: "Liam" },
        { id: 3, name: "Steve (CEO)" },
        { id: 4, name: "Dan" },
        { id: 5, name: "Lee" },
        { id: 6, name: "Gavin" },
        { id: 7, name: "Tracey" },
        { id: 8, name: "David" },
        { id: 9, name: "Sam" },
        { id: 10, name: "Chris" },
        { id: 11, name: "Joe" },
        { id: 12, name: "Emma" }
    ];

    $scope.results = [
        { id: 1, player_1: "Justin", score_1: 11, player_2: "Steve (CEO)", score_2: 6},
        { id: 2, player_1: "Steve (CEO)", score_1: 13, player_2: "Dan", score_2: 11},
        { id: 3, player_1: "Liam", score_1: 6, player_2: "Lee", score_2: 11},
        { id: 4, player_1: "Liam", score_1: 11, player_2: "Steve (CEO)", score_2: 9},
        { id: 5, player_1: "Justin", score_1: 14, player_2: "Lee", score_2: 12},
        { id: 6, player_1: "Justin", score_1: 10, player_2: "Dan", score_2: 12},
        { id: 7, player_1: "Dan", score_1: 11, player_2: "Lee", score_2: 9},
        { id: 8, player_1: "Justin", score_1: 11, player_2: "Liam", score_2: 3},
        { id: 9, player_1: "Tracey", score_1: 11, player_2: "Emma", score_2: 8},
        { id: 10, player_1: "Emma", score_1: 11, player_2: "Dan", score_2: 9}
    ];

    $scope.players.forEach(function(player) { player.point = 0 }); // add default points for each player
    CalculatePlayerScores(); // Caluculate Player scores  
    SortPlayerScores();
    
    function SortPlayerScores(){
        // sort players in descending order
        $scope.sortedPlayers= $scope.players.sort( function ( firstVal, secondVal ) { return secondVal.point - firstVal.point; } );
        // fix ceo at the end
        var ceoIndex = $scope.sortedPlayers.findIndex(item => item.name.includes("CEO")); 
        var ceoObject = $scope.sortedPlayers[ceoIndex];
        $scope.sortedPlayers.splice(ceoIndex,1);
        $scope.sortedPlayers.push(ceoObject);
    }

    // Caluculate Player scores
    function CalculatePlayerScores(player){
        if(player ==undefined){
            $scope.results.forEach(function (res) {
                if(res.score_1>res.score_2){
                    AddScoreToPlayer(res.player_1);
                }else{
                    AddScoreToPlayer(res.player_2);
                }
            });
        }else{
            AddScoreToPlayer(player);
        }  
        SortPlayerScores();      
    }

    $scope.league = [];
    $scope.SetClass;
    $scope.Message;
    $scope.MinimumScore = 11;

    // Add result
    $scope.addResult = function(result) {
        ResetMessage(); // reset messages
        var hasPassedCriteria = ValidateResult(result); // Validate before adding result
        if(hasPassedCriteria){ // successful validation  
            result.id = $scope.results.length + 1;
            $scope.results.push(result);
            // calculate player scores once new result is added
            if(result.score_1>result.score_2){
                CalculatePlayerScores(result.player_1); 
            }
            else{
                CalculatePlayerScores(result.player_2);
            }
            $scope.result = {};
            $scope.Message= message.SuccessMessageForScoreAdded;
            $scope.SetClass= message.isSuccess;
            document.activeElement.blur();
            document.getElementById("resultDisplay").focus();
            resetAddResultFieldValues();            
        }  
        else{
            // validation failed
            document.getElementById("resultDisplay").focus();
            $scope.SetClass= message.isError;
        }      
    }

    // reset add field values
    function resetAddResultFieldValues(){
        $scope.player_1="";
        $scope.score_1="";
        $scope.score_2="";
        $scope.player_2="";
    }

    //on value change of any input fields,  Reset Message and validate fields
    $scope.OnChange = function(result){
       ResetMessage();
        if(result!=undefined){
            ValidateResult(result); // call result validation
        }        
    }

    // Reset all messages
    function ResetMessage(){
        $scope.Message= "";
        $scope.PlayerMessage = "";
        $scope.SetClass="";
    }

    // Add new player to list
    $scope.addPlayer = function(player) {
        ResetMessage(); // reset all messages
        // check if the player is already available in the list
        var isAvailable= $scope.players.some(value => value.name.toLowerCase() === player.name.toLowerCase());
        if(isAvailable){
            $scope.PlayerMessage = message.PlayerAlreadyAvailable;
            $scope.AddPlayerClass = message.isError;
        }else{
            // if not available, add player to the list
            player.id = $scope.players.length + 1;
            player.point=0;
            $scope.players.push(player);
            $scope.player = {};
            SortPlayerScores(); // sort vales again
            $scope.PlayerMessage = message.PlayerAdded;
            $scope.AddPlayerClass = message.isSuccess;
        }       
    }

    // Add points to Winner
    function AddScoreToPlayer(player){
        var playerIndex = $scope.players.findIndex(item => item.name === player); // Find the player
        $scope.players[playerIndex].point = $scope.players[playerIndex].point + 2; // Winner gets 2 points
    }

    // Validate Results 
    function ValidateResult(result){
         // check validation
        var blResult = true;
        var winningPlayer;
        if(result == undefined){
            $scope.Message = message.AllFieldsMandatory;           
            blResult = false;
        }
        else{
            // check if all mandatory field values are available and is not undefined
            if(result.hasOwnProperty("player_1") && result.player_1!=undefined
            && result.hasOwnProperty("player_2") && result.player_2!=undefined
            && result.hasOwnProperty("score_1") && result.score_1!=undefined
            && result.hasOwnProperty("score_2") && result.score_2!=undefined){
                // validate Players
                if(result.player_1 != result.player_2){
                    // validate scores
                    // Check for minimum score criteria
                    if(result.score_1 >= 11 || result.score_2 >=11){ 
                        // check for Deuce scenario- then min score difference should be 2                        
                        if( result.score_1 >= 10 && result.score_2 >=10 ){
                            var differenceScore = Math.abs(result.score_1 -result.score_2);
                            if(differenceScore == 2){                                                        
                                blResult = true;
                            }else{
                                $scope.Message = message.DifferenceScoreNotMet;
                                blResult = false;
                            }
                        }else{
                            // no Deuce , check only for minimum score required i.e: 11
                            if(result.score_1 > 11 || result.score_2 >11){
                                $scope.Message = message.ScoreExceeded;
                                blResult = false;
                            }else{
                                blResult = true;
                            }                        
                        }  
                    }else{
                        $scope.Message = message.MinScoreCriteria;  // Minimum score to win is 11
                        blResult = false;
                    }
                }else{
                    $scope.Message = message.SamePlayers;  // Player 1 and 2 cannot be same
                    blResult = false;
                }                
            }
            else{
                // check if any mandatory fields are missing or is undefinied
                Object.keys(result).forEach(key => result[key] === undefined ? delete result[key] : '');
                var dataAvaialble = Object.getOwnPropertyNames(result).sort();                
                var dataNotAvailable = playerResult.playerFields.filter((field) => !dataAvaialble.includes(field)); 
                $scope.Message = message.MissingFields + dataNotAvailable.join();  
                blResult = false;              
            }            
        }         
        // end validation
        // set CSS
        var element= document.getElementById("addResult");
        if(blResult){
            // for success condition , set success message and css
            $scope.SetClass = message.isSuccess;  
            element.removeAttribute("disabled");   
            return true;
        }
        else{
            // set error css for Fail condition
            $scope.SetClass = message.isError;
            element.setAttribute("disabled",true);
            return false;
        }
    }

}]);