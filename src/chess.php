<?php
header('Content-Type: text/html; charset=ISO-8859-1');
include_once("ChessConfig.php");
include_once("PgnParser.class.php");
include_once("live-relay-database.class.php");


function getPgnFile($pgnFile){
    if(!stristr($pgnFile, '.pgn')){
        $eventDb = new LiveRelayDatabase();
        $pgnFile = $eventDb->getPgnByEventName($pgnFile, isset($_GET['getGameList']));
    }
    if(strstr($pgnFile, '/')){
        $tokens = explode("/", $pgnFile);
        return $tokens[count($tokens)-1];
    }
    return $pgnFile;
}

if(isset($_GET['pgnFile']) && isset($_GET['getGameList'])){	/* Return game list */
	$pgnObj = new PGNParser(PGN_FOLDER . getPgnFile($_GET['pgnFile']));
	echo $pgnObj->getGameListAsJson();
}

if(isset($_GET['pgnFile']) && isset($_GET['getGameDetails']) && isset($_GET['gameIndex'])){	/* Return game list */
	$pgnObj = new PGNParser(PGN_FOLDER . getPgnFile($_GET['pgnFile']));
	echo $pgnObj->getGameDetailsAsJson($_GET['gameIndex'],$_GET['timestamp'], $_GET['liveUpdateMode']);
}

if(isset($_GET['pgnFile']) && isset($_GET['getNumberOfGames'])){
	$pgnObj = new PGNParser(PGN_FOLDER . getPgnFile($_GET['pgnFile']));
	echo $pgnObj->getNumberOfGames();
}

