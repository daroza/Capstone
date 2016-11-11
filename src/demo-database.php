<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<head>
	<title>Demo, Relay of Live Games - DHTML Chess Script</title>

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
            periodical = chessObj.refreshListOfGames.periodical(30 * 1000, chessObj);
        }
	}

    function receiveLiveUpdate(){

    }

    function newMoves(){
		chessObj.refreshListOfGames();
    }
        
	</script>
</head>
<body>

</body>
</html>