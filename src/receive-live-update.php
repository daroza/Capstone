<html>
<?php
// Simple access check - you can implement your own if you like
include_once("ChessConfig.php");
include_once("live-relay-database.class.php");
include_once("chess.php");


error_reporting(E_ALL);
ini_set('display_errors','on');

if(isset($_POST['username'])){
    $username = $_POST['username'];
}else{
    $username = $_GET['username'];
}

if(isset($_POST['password'])){
    $password = $_POST['password'];
}else{
    $password = $_GET['password'];
}

if($username == CHESS_USERNAME && $password == CHESS_PASSWORD){
    // Everything is OK
}else{
    die('Access denied');
}

if(isset($_POST['save'])){
    for($i=0,$count = count($_POST['event_name']);$i<$count;$i++){
        if(isset($_POST['event_name'][$i]) && strlen($_POST['event_name'][$i])){
            RelayEvent::saveFromForm($i);
        }

    }
}
?>
<style type="text/css">
body{
	font-family: Trebuchet MS;
}
td{
	font-size:0.8em;
}
.errorRow td{
    color:#F00;
    font-style:italic;
}
</style>
<head>
<script type="text/javascript" src="js/external/mootools-core-1.3-full-compat.js"></script>
<script type="text/javascript">
var inUpdateMode = false;
var isUsingDatabase = <?php if(CHESS_USE_DATABASE) echo "true"; else echo "false"; ?>;
var icons = {
    success : 'demo-images/success.png',
    error : 'demo-images/error.png',
    load : 'demo-images/ajax-loader.gif'
}
var secondsToNextUpdate = 0;
function startUpdates(){
    inUpdateMode = true;
    getUpdates();
}
function getUpdates(){
    if(inUpdateMode){
        var remote_urls = $$('.remote_url');
        var local_pgns = $$('.local_pgn');
        var statusIcons = $$('.updateStatusIcon');
        var eventObjects = $$('.event_name');
        var errorRows = $$('.errorRow');
        for(var i=0;i<remote_urls.length;i++){
            var obj = {
                'remote_url' : remote_urls[i].value,
                'local_pgn' : local_pgns[i].value,
                'event_name' : eventObjects[i].value,
                'icon' : statusIcons[i],
                'error' : errorRows[i]

            };

            if(remote_urls[i].value.length && local_pgns[i].value.length){
                getUpdate(obj);
            }
        }
        if(!isUsingDatabase){
            var seconds  = $('updateInterval').value;
            seconds = seconds/1;
            if(isNaN(seconds) || seconds < 10){
                seconds = 10;
            }

            secondsToNextUpdate = seconds;
            countDown(1000);
        }
    }
}

function getUpdate(obj){
    obj.icon.style.display = '';
    obj.icon.src = icons.load;

    var req = new Request.JSON({
        method : 'post',
        url : 'receive-live-update-controller.php',
        secure : true,
        data : {
            getRemotePgn : 1,
            remote_url : obj.remote_url,
            event_name : obj.event_name,
            local_pgn : obj.local_pgn
        },
        onSuccess : function(json){
            if(json.success){
                obj.error.setStyle('display','none');
                obj.icon.src = icons.success;
            }else{
                showError(obj.icon, obj.error, json.message);
            }
        },
        onComplete : function(message){
            obj.icon.src = icons.error;
        },
        onError : function(data){
            showError(obj.icon, obj.error, 'Invalid request');
        }
    });
    req.send();
}

function showError(iconEl, errorEl, message){

    iconEl.src = icons.error;
    errorEl.setStyle('display','');
    errorEl.getElements('td')[0].set('html', message);
}

function countDown(){
	if(!inUpdateMode){
		return;
	}
    if(secondsToNextUpdate == 0){
        getUpdates();
        $('secondsToNextUpdate').set('html', '');
    }else{
        $('secondsToNextUpdate').set('html', 'Next update in ' + secondsToNextUpdate + ' seconds');
        countDown.delay(1000);
    }
    secondsToNextUpdate = secondsToNextUpdate-1;
}

function hideStatusIcons(){
    var statusIcons = $$('.updateStatusIcon');
    for(var i=0;i<statusIcons.length;i++){
        statusIcons[i].setStyle('display','none');
    }
}




function stopUpdates(){
    inUpdateMode = false;
    $('secondsToNextUpdate').set('html', '');
    hideStatusIcons();
}

function getLastBuildDates(){

    var els = $$('.timeOfLastBuild');
    var ids = $$('.ids');

    var idArray = [];
    for(var i=0, count = ids.length;i<count; i++){
        idArray.push(ids[i].value);
    }
    var req = new Request.JSON({
        method : 'post',
        url : 'receive-live-update-controller.php',
        secure : true,
        data : {
            getLastBuilds : 1,
            ids : idArray
        },
        onSuccess : function(json){
            for(var i=0;i<json.data.length;i++){

                $('id-field-' + json.data[i].id).set('html', json.data[i].date);
            }

        },
        onComplete : function(message){

        },
        onError : function(data){

        }
    });
    req.send();
}
getLastBuildDates.periodical(30 * 1000, getLastBuildDates);
</script>
<style type="text/css">
p{
    margin:0px;
}
i{
    color: blue;
    font-size:0.9em;
}
</style>
</head>
<body>
<div style="width:800px">
<p>Example of remote path: http://www.dhtmlgoodies.com/scripts/dhtml-chess/pgn/live.pgn</p>
<p>Example of local file: live.pgn</p>
<!-- http://www.szachy.lublin.pl/transmisja/live.pgn -->
<form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
<input type="hidden" name="username" value="<?php echo $username; ?>">
<input type="hidden" name="password" value="<?php echo $password; ?>">
<table>
    <tr>
        <td>Update interval(seconds) :</td>
        <td><input type="text" size="3" id="updateInterval" name="updateInterval" value="60"></td>
        <td><input type="button" value="<?php if(CHESS_USE_DATABASE) echo "Test"; else echo "Start"; ?>" onclick="startUpdates()"></td>
        <?php
        if(!CHESS_USE_DATABASE){
        ?>
        <td><input type="button" value="Stop" onclick="stopUpdates()"></td>
            <?php
        }
        ?>
        <td id="secondsToNextUpdate"></td>
    </tr>
</table>
<?php
if(CHESS_USE_DATABASE){
    ?>
    <input type="submit" value="Save events" name="save">
    <?php
    $relayObj = new LiveRelayDatabase();
    $activeRelays = $relayObj->getActiveRelays();
    foreach($activeRelays as $activeRelay){
        ?>

        <fieldset>
            <legend>Active relay</legend>
            <input type="hidden" class="ids" name="id[]" value="<?php echo $activeRelay->getId(); ?>">
            <table>
                <tr class="errorRow" style="display:none">
                    <td colspan="2" class="errors"></td>
                </tr>
                <tr>
                    <td>Event name:</td>
                    <td><input size="80" class="event_name" type="text" name="event_name[]" value="<?php echo $activeRelay->getEventName(); ?>"></td>
                    <td rowspan="2"> <img class="updateStatusIcon" src="demo-images/ajax-loader.gif" style="display:none"></td></td>
                </tr>
                <tr>
                    <td></td>
                    <td><i>The event name is what you put into the pgnFile property of the chess board.</i></td>
                </tr>
                <tr>
                    <td>URL to relay:</td>
                    <td><input size="80" class="remote_url" type="text" name="remote_url[]" value="<?php echo $activeRelay->getRemoteUrl(); ?>"></td>
                </tr>
                <tr>
                    <td>Hour offset:</td>
                    <td><input size="80" class="hour_offset_tournament_site" type="text" name="hour_offset_tournament_site[]" value="<?php echo $activeRelay->getHourOffset(); ?>"></td>
                </tr>
                <tr>
                    <td colspan="2"><i>This is optional and needed only when there's a big difference in the time zone between your server and the tournament site. If
                        you're at a timezone with GMT+1 and the tournament site is at GMT+4, the value for this field will be 3</i></td>
                </tr>
                 <tr>
                    <td>name of local file: pgn/</td>
                    <td><input type="hidden" readonly class="local_pgn" name="local_pgn[]" value="<?php echo $activeRelay->getLocalPgn(); ?>"><?php echo $activeRelay->getLocalPgn(); ?> <i> (Pgn file name is automatically generated)</i></i></td>
                 </tr>
                 <tr>
                    <td nowrap>Tournament start (y-m-d h:m:s):</td>
                    <td><input size="20" type="text" class="tournament_start" name="tournament_start[]" value="<?php echo $activeRelay->getTournamentStart(); ?>"></td>
                </tr>
                 <tr>
                    <td nowrap>Tournament end (y-m-d h:m:s):</td>
                    <td><input size="20" type="text" class="tournament_end" name="tournament_end[]" value="<?php echo $activeRelay->getTournamentEnd(); ?>"></td>
                </tr>
                 <tr>
                    <td>Refresh interval:</td>
                    <td><input size="3" type="text" class="refresh_interval" name="refresh_interval[]" value="<?php echo $activeRelay->getRefreshInterval(); ?>"> seconds</td>
                </tr>
                 <tr>
                    <td>Last build:</td>
                    <td><input type="hidden" name="timestamp_latest_build[]" value="<?php echo $activeRelay->getDateOfLastBuild(); ?>"><span id="id-field-<?php echo $activeRelay->getId(); ?>" class="timeOfLastBuild"><?php echo $activeRelay->getDateOfLastBuild(); ?></span></td>
                </tr>

            </table>
        </fieldset>
        <?
    }

    for($i=0;$i<3;$i++){
        ?>
        <fieldset>
            <legend>New relay</legend>
            <input type="hidden" name="id[]" value="">
            <table>
                <tr class="errorRow" style="display:none">
                    <td colspan="2" class="errors"></td>
                </tr>
               <tr>
                    <td>Event name:</td>
                    <td><input size="80" class="event_name" type="text" name="event_name[]" value=""></td>
                    <td rowspan="4"> <img class="updateStatusIcon" src="demo-images/ajax-loader.gif" style="display:none"></td></td>
                </tr>
                <tr>
                    <td colspan="2"><i>The event name is what you put into the pgnFile property of the chess board.</i></td>
                </tr>
                <tr>
                    <td>URL to remote file/folder:</td>
                    <td><input size="80" class="remote_url" type="text" name="remote_url[]" value=""></td>
                </tr>
                <tr>
                    <td>Hour offset:</td>
                    <td><input size="80" class="hour_offset_tournament_site" type="text" name="hour_offset_tournament_site[]" value=""></td>
                </tr>
                <input type="hidden" class="local_pgn" name="local_pgn[]" value="test.pgn">
                 <tr>
                    <td>Tournament start (y-m-d h:m:s):</td>
                    <td><input size="20" type="text" class="tournament_start" name="tournament_start[]" value=""></td>
                </tr>
                 <tr>
                    <td>Tournament end (y-m-d h:m:s):</td>
                    <td><input size="20" type="text" class="tournament_end" name="tournament_end[]" value=""></td>
                </tr>
                 <tr>
                    <td>Refresh interval:</td>
                    <td><input size="3" type="text" class="refresh_interval" name="refresh_interval[]" value="60"> seconds</td>
                </tr>
                <input type="hidden" name="timestamp_latest_build[]" value="<?php echo time(); ?>">

            </table>
        </fieldset>
        <?

    }

}else{
    for($i=0;$i<10;$i++){
    ?>
        <fieldset>
            <legend>Remote URL</legend>

    <table>
    <tr>
        <td>URL to remote file/folder:</td>
        <td><input size="80" class="remote_url" type="text" name="remote_url[<?echo $i; ?>]" value=""></td>
        <td rowspan="2"> <img class="updateStatusIcon" src="demo-images/ajax-loader.gif" style="display:none"></td></td>
    </tr>
    <tr>
        <td>name of local file: pgn/</td>
        <td><input size="80" type="text" class="local_pgn" name="local_pgn[<?echo $i; ?>]" value="livepl.pgn"></td>
    </tr>
    </table>
    </fieldset>
    <?php
    }
}
?>


</form>
</div>
</body>
</html>