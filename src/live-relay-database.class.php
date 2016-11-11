<?php

require_once("ChessConfig.php");
include_once("db-connect.php");
include_once("DGT-game-parser.class.php");
include_once("PgnParser.class.php");

class RelayEvent {
    private $id;
    private $event_name;
    private $tournament_start;
    private $tournament_end;
    private $remote_url;
    private $refresh_interval;
    private $local_pgn;
    private $timestamp_latest_build;
    private $hour_offset_tournament_site;

    public static function createInstanceFromDbRow($row){
        $eventObj = new RelayEvent();
        $eventObj->setPropertiesByDbRow($row);
        return $eventObj;
    }

    public function save(){
        if($this->id){
            mysql_query("update chess_live_relay set
                            event_name='".$this->event_name."',
                            remote_url='".$this->remote_url."',
                            tournament_start='".$this->tournament_start."',
                            tournament_end='".$this->tournament_end."',
                            refresh_interval='".$this->refresh_interval."',
                            hour_offset_tournament_site='".$this->hour_offset_tournament_site."',
                            local_pgn='".$this->local_pgn."'
                         where ID='". $this->id . "'") or die(mysql_error());
        }else{
            mysql_query("insert into chess_live_relay(event_name,remote_url,tournament_start,tournament_end,refresh_interval,local_pgn,hour_offset_tournament_site,timestamp_latest_build)
                         values
                         (
                         '".$this->event_name."',
                         '".$this->remote_url."',
                         '".$this->tournament_start."',
                         '".$this->tournament_end."',
                         '".$this->refresh_interval."',
                         '".$this->local_pgn."',
                         '".$this->hour_offset_tournament_site."',
                         '".time()."')") or die(mysql_error());
        }
    }


    public static function saveFromForm($rowIndexInForm){
        if(self::areFormValuesOk($rowIndexInForm)){

            $event = self::createInstanceFromForm($rowIndexInForm);
            $event->save();
        }else echo "NO VALUE<br>";

    }

    private static function areFormValuesOk($rowIndexInForm){
        if(!isset($_POST['event_name'][$rowIndexInForm]))return false;
        if(!isset($_POST['remote_url'][$rowIndexInForm]))return false;
        if(!isset($_POST['tournament_start'][$rowIndexInForm]))return false;
        if(!isset($_POST['tournament_end'][$rowIndexInForm]))return false;
        if(!isset($_POST['refresh_interval'][$rowIndexInForm]))return false;
        return true;
    }
    private function createInstanceFromForm($rowIndexInForm){

        $row = array(
            'ID' => $_POST['id'][$rowIndexInForm],
            'event_name' => $_POST['event_name'][$rowIndexInForm],
            'tournament_start' => $_POST['tournament_start'][$rowIndexInForm],
            'tournament_end' => $_POST['tournament_end'][$rowIndexInForm],
            'remote_url' => $_POST['remote_url'][$rowIndexInForm],
            'refresh_interval' => $_POST['refresh_interval'][$rowIndexInForm],
            'timestamp_latest_build' => $_POST['timestamp_latest_build'][$rowIndexInForm],
            'hour_offset_tournament_site' => $_POST['hour_offset_tournament_site'][$rowIndexInForm],
            'local_pgn' => self::getPgnFromEventName($_POST['event_name'][$rowIndexInForm])
        );
        return self::createInstanceFromDbRow($row);
    }

    private static function getPgnFromEventName($eventName){
        $eventName = preg_replace("/[^0-9a-z_\-]/si","", $eventName);
        return $eventName."-[Y]-[M]-[D].pgn";
    }

    public static function getInstanceByEventName($eventName){
        $res = mysql_query("select * from chess_live_relay where event_name='$eventName'") or die(mysql_error());
        if($row = mysql_fetch_array($res)){
            return self::createInstanceFromDbRow($row);
        }
        return null;
    }

    public function setPropertiesByDbRow($row){
        $this->id = $row['ID'];
        $this->event_name = $row['event_name'];
        $this->tournament_start = $row['tournament_start'];
        $this->tournament_end = $row['tournament_end'];
        $this->remote_url = $row['remote_url'];
        $this->refresh_interval = $row['refresh_interval'];
        $this->hour_offset_tournament_site = $row['hour_offset_tournament_site'];
        $this->timestamp_latest_build = (isset($row['timestamp_latest_build']) ? $row['timestamp_latest_build'] : time());
        $this->local_pgn = $row['local_pgn'];
    }
    public function getId(){
        return $this->id;
    }
    public function getEventName(){
        return $this->event_name;
    }
    public function getTournamentStart(){
        return $this->tournament_start;
    }
    public function getTournamentEnd(){
        return $this->tournament_end;
    }
    public function getRemoteUrl(){
        return $this->remote_url;
    }
    public function getLocalPgn(){
        return $this->local_pgn;
    }
    public function getLocalPgnWithoutTags(){
        return $this->tagsToValue($this->local_pgn);
    }
    public function getHourOffset(){
        return $this->hour_offset_tournament_site;
    }

    private function tagsToValue($value){
        $date = $this->getDate();
        $value = str_replace("[Y]", $date['year'], $value);
        $value = str_replace("[M]", $date['month'], $value);
        $value = str_replace("[D]", $date['day'], $value);
        return $value;
    }

    private function getDate(){
        $ts = time();
        if($this->hour_offset_tournament_site){
            $ts-= ($this->hour_offset_tournament_site* 60*60);
        }
        $ret = array(
            'year' => date("Y", $ts),
            'month' => date("m", $ts),
            'day' => date("d", $ts)
        );
        if(date("Y-m-d H:i:s", $ts) > $this->tournament_end){
            $ret['year'] = substr($this->tournament_end, 0, 4);
            $ret['month'] = substr($this->tournament_end, 5, 2);
            $ret['day'] = substr($this->tournament_end, 8, 2);
        }
        if(date("Y-m-d H:i:s", $ts) < $this->tournament_start){
            $ret['year'] = substr($this->tournament_start, 0, 4);
            $ret['month'] = substr($this->tournament_start, 5, 2);
            $ret['day'] = substr($this->tournament_start, 8, 2);
        }
        $ret['date'] = $ret['year']."-".$ret['month']."-".$ret['day'];
        return $ret;

    }

    public function getRefreshInterval(){
        return $this->refresh_interval;
    }
    public function getTimeStampOfLastBuild(){
        return $this->timestamp_latest_build;
    }
    public function getDateOfLastBuild(){

        return date("Y-m-d H:i:s", $this->getTimeStampOfLastBuild());
    }

    public function loadRemoteGameDataIfItsTimeToDoSo(){
        if($this->shouldLoadNewGameData()){
            $this->setNewTimeStamp();
            $this->loadNewGameData();
        }
    }

    private function setNewTimeStamp(){
        $ts = time();
        mysql_query("update chess_live_relay set timestamp_latest_build=" . $ts. " where ID='".$this->id."'") or die(mysql_error());
        $this->timestamp_latest_build = $ts;
    }

    private function clearCache(){
       
    }
    private function shouldLoadNewGameData(){
        $today = date("Y-m-d H:i:s");
 
        if(!$this->isTournamentFinished() && !$this->isTodaysRoundFinished()){
            return ($this->getTimeStampOfLastBuild() + $this->getRefreshInterval()) < time();
        }
        return false;
    }

    private function isTournamentFinished(){
        $today = date("Y-m-d");
        if($this->getTournamentEnd() < $today || $this->getTournamentStart() > $today){
            return true;
        }
        return false;
    }

    private function isTodaysRoundFinished(){
        $date = $this->getDate();
        $dateString = $date['date'];
        $res = mysql_query("select ID from chess_live_rounds where event_id='".$this->id."' and round_date='".$dateString."' and finished='1'") or die(mysql_error());;
        if($row = mysql_fetch_array($res)){
            return true;
        }
        return false;
    }


    private function loadNewGameData(){
        $pgn = $this->getLocalPgnWithoutTags();
        $pgnObj = new PGNParser();
        $pgnObj->clearCacheFor($pgn);
        
        if(!preg_match("/\.pgn/si", $this->remote_url)) {
            $dgtParser = new DGTGameParser();
            $result = $dgtParser->createPgnFromDGTData($this->remote_url, $pgn, $this->id);
        }else{
            $pgnObj = new PGNParser();
            $result = $pgnObj->createCopyOfRemotePgn($this->remote_url, $pgn, $this->id);
        }

        if($result['success']){
            if($result['finished_round']){
                $this->finishRound();
            }else{
                $this->startRound();
            }
        }
    }

    private function finishRound(){
        $date = $this->getDate();
        $dateString = $date['date'];
        mysql_query("update chess_live_rounds set finished='1' where event_id='".$this->id."' and round_date='".$dateString."'") or die(mysql_error());
    }

    private function startRound() {
        $date = $this->getDate();
        $dateString = $date['date'];
        $res = mysql_query("select ID from chess_live_rounds where event_id='".$this->id."' and round_date='".$dateString."'") or die(mysql_error());
        if($row = mysql_fetch_array($res)){
            
        }else{
            mysql_query("insert into chess_live_rounds(event_id,started,round_date)values('".$this->id."','1','".$dateString."')") or die(mysql_error());
        }
    }
}
class LiveRelayDatabase{


    public function getActiveRelays(){
        $ret = array();

        $today = date("Y-m-d H:i.s");
        $res = mysql_query("select * from chess_live_relay where tournament_end >'$today' and tournament_start < '$today'") or die(mysql_error(). "<br>Check your config variables in ChessConfig.php and run configure-db.php ");
        while($row = mysql_fetch_array($res)){
            $ret[] = RelayEvent::createInstanceFromDbRow($row);
        }
        return $ret;
    }

    public function getPgnByEventName($eventName, $skipRemoteLoadOfData = false){
        $event = RelayEvent::getInstanceByEventName($eventName);
        if(isset($event)){
            if(!$skipRemoteLoadOfData){
                $event->loadRemoteGameDataIfItsTimeToDoSo();
            }
            return $event->getLocalPgnWithoutTags();
        }

        return $eventName;
    }


    private function shouldLoadNewGameData($lastBuild, $refreshInterval){
        return ($lastBuild + $refreshInterval) < time();
    }

    private function getSafeEventName($eventName){
        return preg_replace("/[^a-z0-9_\- /si","", $eventName);;
    }

    public function getLastBuildDates($ids){
        if(!count($ids)){
            return array();
        }
        $ret = array();
        $res = mysql_query("select * from chess_live_relay where id in(". implode(",", $ids) .")");
        while($row = mysql_fetch_array($res)){
            $event = RelayEvent::createInstanceFromDbRow($row);
            $ret[] = array('id' => $event->getId(), 'date' => $event->getDateOfLastBuild());
        }
        return $ret;
    }
}