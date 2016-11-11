<?php

include_once("ChessConfig.php");
include_once("live-relay-database.class.php");



if(strpos($_SERVER['HTTP_REFERER'],RECEIVE_LIVE_UPDATE_VALID_REFERER) !== 0){
    echo '{ "success" : false, "message" : "Access denied" }';
    die();
}
#exit;



header('Content-Type: text/html; charset=ISO-8859-1');
include_once("ChessConfig.php");
include_once("PgnParser.class.php");
include_once("DGT-game-parser.class.php");


if(isset($_POST['getRemotePgn'])){

    if(!preg_match("/\.pgn/si", $_POST['remotePath'])) {
        $dgtParser = new DGTGameParser();
        $result = $dgtParser->createPgnFromDGTData($_POST['remote_url'], $_POST['local_pgn']);
    }else{
        $pgnObj = new PGNParser();
        $result = $pgnObj->createCopyOfRemotePgn($_POST['remote_url'], $_POST['local_pgn']);
    }
    if(!$result['success']){
   		#header('HTTP/1.1 400');
    }
    echo stripslashes(json_encode($result));

}

if(isset($_POST['getLastBuilds'])){
    $result = array('success' => false, 'data' => array());
    $relayDb = new LiveRelayDatabase();
    $data = $relayDb->getLastBuildDates($_POST['ids']);
    if(count($data)){
        $result['success'] = true;
        $result['data'] = $data;
    }
    echo stripslashes(json_encode($result));

}