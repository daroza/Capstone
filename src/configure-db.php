<?php
require_once("ChessConfig.php");

if($_GET['username'] == CHESS_USERNAME && $_GET['password'] == CHESS_PASSWORD){
    // Everything is OK
    if(CHESS_USERNAME == 'chess' && CHESS_PASSWORD=='chess'){
        die('Access denied - You need to specify your own username and password in ChessConfig.php');
    }
}else{

    die('Access denied - Invalid username and/or password');
}

if(CHESS_USE_DATABASE){

    $conn = mysql_connect(CHESS_DB_HOST,CHESS_DB_USERNAME,CHESS_DB_PASSWORD);
    mysql_select_db(CHESS_DB_NAME,$conn);


    $res = mysql_query("select ID from chess_live_relay");
    if($row = mysql_fetch_array($res)){
        echo "Skipping table chess_live_relay because it allready exists<br>";
    }else{
        $sql = "create table chess_live_relay(
                    ID int auto_increment not null primary key,
                    event_name varchar(255),
                    tournament_start datetime,
                    tournament_end datetime,
                    remote_url varchar(512),
                    local_pgn varchar(255),
                    refresh_interval int,
                    timestamp_latest_build int,
                    hour_offset_tournament_site int
                )";

        mysql_query($sql) or die(mysql_error());

        $now = date("Y-m-d 00:00:00");
        $nowPlus12Hours = date("Y-m-d 23:59:59", strtotime('+12HOURS'));
        $sql = "insert into chess_live_relay(event_name, tournament_start,tournament_end,remote_url, local_pgn,refresh_interval,timestamp_latest_build,hour_offset_tournament_site)
                    values('dhtmlgoodies','$now','$nowPlus12Hours','http://www.dhtmlgoodies.com/scripts/dhtml-chess/','dhtmlgoodies-[Y]-[M]-[D].pgn',60,". time().",0)";
        mysql_query($sql) or die(mysql_error());


        mysql_query("CREATE INDEX chess_live_relay_name ON chess_live_relay(event_name)") or die(mysql_error());

        echo "- Created database table chess_live_relay and inserted dummy data<br>";
    }


    $res = mysql_query("select ID from chess_live_rounds");
    if($row = mysql_fetch_array($res)){
        echo "Skipping table chess_live_finished_rounds because it allready exists<br>";

    }else{
        mysql_query("create table chess_live_rounds(
            ID int auto_increment not null primary key,
            event_id int,
            started char(1),
            finished char(1),
            round_date date
        )") or die(mysql_error());
        mysql_query("CREATE INDEX chess_live_rounds_ev ON chess_live_rounds(event_ID)") or die(mysql_error());
        echo "- Created database table chess_live_rounds<br>";
    }
    echo "DB configuration complete!";

}