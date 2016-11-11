<?php

/************************************************************************************************************
@fileoverview
Chess Widget
Copyright (C) 2011  DHTMLGoodies.com, Alf Magne Kalleland

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

Dhtmlgoodies.com., hereby disclaims all copyright interest in this script
written by Alf Magne Kalleland.

Alf Magne Kalleland, 2007
Owner of DHTMLgoodies.com


************************************************************************************************************/

include_once("jsonwrapper/jsonwrapper.php");
include_once("live-relay-database.class.php");

class ChessBoard {
    private $cssKeys = array(
        'bgColor' => '#7fb2e5',
        'bgColorPlayers' => '#53a6d7',
        'bgColorMoves' => '#bcd2fe',
        'bgColorClock' => '#95c1d5'
    );

    private $locationOfDHTMLChess = '.';

    private $jsKeys = array(
        'pgnFile' => '',
        'parentElement' => 'board',
        'serverFile' => '[locationOfDHTMLChess]/chess.php',
        'listeners' => '{}',
        'layout' => array(
            'imageFolder' => '[locationOfDHTMLChess]/images/',
            'cssPath' => '[locationOfDHTMLChess]/css/chess.css',
            'squareSize' => 45,
            'chessSet' => 'alpha',
            'colorLightSquares' => '#e7f1fa',
            'colorDarkSquares' => '#a2bdd9',
            'bgImagedDarkSquares' =>'[locationOfDHTMLChess]/demo-images/piece-bg-60-wood2-dark.png',
            'bgImagedLightSquares' =>'[locationOfDHTMLChess]/demo-images/piece-bg-60-wood2-light.png'
        ),
        'gameAttributes' => array(
            'round' =>'details_round',
            'white' =>'playerWhite',
            'black' =>'playerBlack',
            'event' =>'details_event',
            'result' =>'details_result',
            'clockwhite' =>'clockWhite',
            'clockblack' =>'clockBlack',
            'date' =>'details_date'
        ),
        'behaviour' => array(
            'animationTime' => 0.1,
            'autoplay' => array(
                'delay' => 1
            ),
            'flipBoardWhenBlackToStart' => false
        ),
        'liveupdateinterval' => 0
    );

    private $listeners = array();

    private $fileIncludes = '
        <script type="text/javascript" src="[locationOfDHTMLChess]/js/external/mootools-core-1.3-full-compat.js"></script>
	    <script type="text/javascript" src="[locationOfDHTMLChess]/js/chess.js?rnd=20110618-23"></script>
	    <script type="text/javascript" src="[locationOfDHTMLChess]/js/scroll-table.js"></script>
	    <link rel="stylesheet" href="[locationOfDHTMLChess]/css/scroll-table.css" type="text/css">
	';
    private $css = '
    #dgChessMainContainer{
        width:700px;
        border: 1px solid #000;
        background-color:<bgColor>;
    }
    #boardContainer{
        margin-top:5px;
        width:380px;
        height:380px;
        float:left;
        background-repeat:no-repeat;
    }
    .ChessBoardFrame45{
        margin-left:10px;
    }
    tr.ActiveGameInTable{
        background-color:#95c1d5;
    }
    #buttons{
        margin-top:0px;
        margin-left:5px;
        clear:both;
        height:20px;
        width:453px;
        font-size:0.8em;
    }
    img{
        border: 0px;
    }
    #dgChessRightColumn{
        width:320px;
        height:380px;
        float:left;
        position:relative;
    }
    /** 001 */
    #gameListContainer{
        width:310px;
        padding-top:5px;
        padding-left:5px;
    }
    .GameListEvenRow{
        background-color:#e7f1fa;
    }
    #divMovesContainer,#pgnFiles{
        clear:both;
        font-size:1.0em;
        font-style:italic;
        overflow:auto;
        background-color:#d3d2a6;
        margin-top:0px;
        border:1px solid #000;
    }

    .InlineChessMove_plainMove{
        white-space: nowrap;
    }

    .ChessBoardLabel{
        color:#000;
        font-size:0.9em;
    }

    #listOfGames{
        clear:both;
        padding-top:5px;
    }


    #gameListTable thead tr{
        background-color:#53a6d7;
        color:#FFF;
        font-weight:bold;


    }
    div.widget_tableDiv{
        border:1px solid #d3d2a6;
    }
    div.ChessMoveIndicator{
        border:2px solid #F00;
        opacity:0.7;
        filter:alpha(opacity=70);
    }

    #leftColumn {
        width:380px;
        float:left;
    }
    #gameListTable{
        width:100%;
        font-size:0.9em;
    }

    .player{
        height:50px;
        font-size:1.3em;
        line-height:48px;
        padding-left:4px;
        background-color:<bgColorPlayers>;
    }
    #playerWhite{
        border-top: 1px solid #000;
        color:#FFF;
    }
    #playerBlack{
        border-bottom: 1px solid #000;
    }
    #divMoves{
        padding-left:20px;
        height:218px;
        overflow-y:auto;
        background-color:<bgColorMoves>;
    }
    #divMoves a{
        text-decoration:none;
        color:#000;
    }
    #divMoves a.ActiveTableChessMove {
        color:#FFF;
    }
    #divMoves td{
        padding-left:3px;
    }
    #details_result{
        text-align:center;
        font-weight:bold;
        font-size:1.3em;
        margin-top:3px;
        margin-bottom:4px;
    }
    .clock{
        height:19px;
        background-color:<bgColorClock>;
        padding-left:3px;

    }
    #clockBlack {
        border-bottom: 1px solid #000;
    }
    #clockWhite {
        border-top: 1px solid #000;
    }';

    private $html = '
    <div id="dgChessMainContainer" style="margin-top:10px">
    <div id="leftColumn">
	<div id="boardContainer">
		<div id="board"></div>
	</div>
    <div id="buttons">
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-tostart-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-tostart.gif\'" onclick="chessObj.moveToStart();return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-tostart.gif"></a>
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-back-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-back.gif\'" onclick="chessObj.move(-1);return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-back.gif"></a>
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-forward-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-forward.gif\'" onclick="chessObj.move(1);return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-forward.gif"></a>
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-toend-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-toend.gif\'" onclick="chessObj.moveToEnd();return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-toend.gif"></a>
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-pause-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-pause.gif\'" onclick="chessObj.stopAutoPlay();return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-pause.gif"></a>
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-play-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-play.gif\'" onclick="chessObj.autoPlay();return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-play.gif"></a>
        <a href="#" onmouseover="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-flip-over.gif\'" onmouseout="this.getElements(\'img\')[0].src=\'[locationOfDHTMLChess]/demo-images/button-gray-flip.gif\'" onclick="chessObj.flip();return false"><img src="[locationOfDHTMLChess]/demo-images/button-gray-flip.gif"></a>
    </div>
    </div>
	<div id="dgChessRightColumn">
        <div id="gameListContainer">
            <div id="divMovesContainer">
                <div class="player" id="playerBlack"></div>
                <div class="clock" id="clockBlack"></div>
                <div id="divMoves">
                    <table id="tblMoves"><tbody>
					</tbody></table>
                    <div id="details_result"></div>
                </div>
                <div class="clock" id="clockWhite"></div>
                <div class="player" id="playerWhite"></div>


            </div>
        </div>
	</div>
    <div id="listOfGames" style="clear:both;width:100%">
        <div id="gameList" style="">
            <TABLE id="gameListTable" cellspacing=0 cellpadding=2>
                    <thead>
                    <tr>
                        <td>View</td>
                        <td>White</td>
                        <td>Black</td>
                        <td>Last moves</td>
                        <td>Res</td>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </TABLE>
        </div>
    </div>
    <div style="clear:both"></div>
</div>';

    private $js = "
        var chessObj = new DG.Chess({
            behaviour : <behaviour>,
            layout : <layout>,
            els : {
                parent : '<parentElement>',
                movesInGameTableFormat : 'tblMoves',
                movesInGameTableFormatMaxMovesPerTable : 500,
                mo2vesInGame : 'divMoves',
                playerNames : 'players',
                currentMove : 'activeMove',
                gameAttributes: <gameAttributes>
            },
            listeners : <listeners>,
            pgnFile:'<pgnFile>',
            serverFile:'<serverFile>',
            liveUpdateInterval : <liveupdateinterval>

        } );
        chessObj.displayGameListInTable('gameListTable','view,white,black,lastmoves,result',{ jsObject:'chessObj',viewGameLink:'View' });
        chessObj.showGame(0);
    ";

    public function setFolderLocationOfDHTMLChessAPI($folder){
        $this->locationOfDHTMLChess = $folder;
    }

    public function setPgn($pgnFile){
       $this->jsKeys['pgnFile'] = $pgnFile;
    }

    public function setCss($css){
        $this->cssKeys = array_merge($this->cssKeys, $css);
    }
    public function setJavascript($js){
        foreach($js as $key=>$value){
            if(is_array($value)){
                $this->jsKeys[$key] = array_merge($this->jsKeys[$key], $value);
            }else{
                $this->jsKeys[$key] = $value;
            }
        }
    }
    public function addListeners($listeners){
        $this->jsKeys['listeners'] = $listeners;
    }

    public function setLayout($layout){
        $this->jsKeys['layout'] = array_merge($this->jsKeys['layout'], $layout);
    }

    public function write(){
        $this->includeFiles();
        $this->includeCSS();
        $this->includeHTML();
        $this->includeJavascript();
    }

    private function includeFiles(){
        echo $this->getNewPaths($this->fileIncludes);

    }

    private function getNewPaths($data){
        return str_replace("[locationOfDHTMLChess]", $this->locationOfDHTMLChess, $data);
    }

    private function includeCSS(){
        $css = $this->css;
        foreach($this->cssKeys as $key=>$value){
            $css = str_replace("<" . $key. ">", $value, $css);
        }
        echo "<style type='text/css'>". $css ."</style>";
    }

    private function includeHTML(){
        echo $this->getNewPaths($this->html);
    }
    private function includeJavascript(){
        $js = $this->js;
        foreach($this->jsKeys as $key=>$value){
            if(is_array($value)){
                $value = json_encode($value);
            }
            $js = str_replace("<" . $key. ">", $value, $js);
        }

        $js = $this->getNewPaths($js);

        echo "<script type='text/javascript'>" . $js ."</script>";
    }





}