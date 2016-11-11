<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<head>
	<title>DHTML Chess - pgn viewer</title>

    <style type="text/css">
    body{
        font-family:Trebuchet MS;
        background-color:#FFF;
        margin-top:3px;
    }
    .inline_code{
        -moz-border-bottom-colors: none;
        -moz-border-image: none;
        -moz-border-left-colors: none;
        -moz-border-right-colors: none;
        -moz-border-top-colors: none;
        background-color: #E2EBED;
        border-color: #317082;
        border-style: solid;
        border-width: 1px 1px 1px 5px;
        color: #000000;
        display: block;
        font-family: Courier New,Courier New,Courier,monospace;
        font-size: 0.8em;
        margin: 5px;
        padding: 3px;
        width: 720px;
        white-space:pre;
    }
    </style>
    <script type="text/javascript" src="js/external/mootools-core-1.3-full-compat.js"></script>

	<script type="text/javascript">
    var periodical = null;
	function showDetails(gameDetails){
        chessObj.animateLastMoveInGame(0.5);
        if(!periodical){
            periodical = chessObj.refreshListOfGames.periodical(10 * 1000, chessObj);
        }
	}

    function receiveLiveUpdate(){

    }

    function newMoves(){
        try{
            console.log('refreshing');
        }catch(e){
            
        }
		chessObj.refreshListOfGames();

    }
        
	</script>
</head>
<body>
<?php
include("chess-board.class.php");
$chessBoard = new ChessBoard();
$chessBoard->setPgn('dgt.pgn');
$chessBoard->setCss(array(
      'bgColor' => '#7fb2e5',           // bg color container around entire chess widget
      'bgColorPlayers' => '#53a6d7',    // background color player names
      'bgColorMoves' => '#bcd2fe',      // background color move box
      'bgColorClock' => '#95c1d5'       // background color clocks
    )
);
$chessBoard->setJavascript(array(
    'liveupdateinterval' => 15, // 0 to display standard database games, value in seconds between each server request if you want to relay live games
    'serverFile' => 'chess.php',
    'layout' => array(
        'colorLightSquares' => '#e7f1fa',
        'colorDarkSquares' => '#a2bdd9'
    ),
    'behaviour' => array(
        'animationTime' => 0.3,
        'autoplay' => array(
            'delay' => 1
        )
    ),
    'listeners' => "{'loadgame' : showDetails, 'liveupdate' : receiveLiveUpdate, 'liveupdatenewmoves' : newMoves }"

));
$chessBoard->write();
// Another method for adding listeners
// $chessBoard->addListeners("{'loadgame' : showDetails, 'liveupdate' : receiveLiveUpdate }");
?>

<h4>chess-board-class.php demo</h4>
<p>This is a demo of how you can create a chess board using the chess-board-class.php file. </p>
<p>Code used:</p>
<h5>Simple example</h5>
<p class="inline_code">
&lt;?php
include("chess-board.class.php");
$chessBoard = new ChessBoard();
$chessBoard->setPgn('pgn/live-games.pgn');
$chessBoard->write();

?&gt;</p>
<h5>Code - customized board:</h5>
<p class="inline_code">
&lt;?php
include("chess-board.class.php");
$chessBoard = new ChessBoard();
// Set path to pgn file
$chessBoard->setPgn('pgn/dgt.pgn');

$chessBoard->setCss(array(
      'bgColor' => '#7fb2e5',           // bg color container around entire chess widget
      'bgColorPlayers' => '#53a6d7',    // background color player names
      'bgColorMoves' => '#bcd2fe',      // background color move box
      'bgColorClock' => '#95c1d5'       // background color clocks
    )
);

$chessBoard->setJavascript(array(
    'liveupdateinterval' => 15,
    'serverFile' = 'test/css.php'
));
$chessBoard->write();
?&gt;</p>
</body>
</html>