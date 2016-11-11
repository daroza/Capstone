/************************************************************************************************************
@fileoverview
Chess Widget
Copyright (C) 2007-2011  DHTMLGoodies.com, Alf Magne Kalleland

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

/**
 * 
 * @package DHTML Chess
 * @copyright Copyright &copy; 2007, www.dhtmlgoodies.com
 * @author Alf Magne Kalleland <post@dhtmlgoodies.com>
 */
var DHTMLGoodies = {};
var DG = {};
if(!String.trim)String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };
var D_chessObjects = [];
var ChessWidgetEventFuncs = new Object();

DHTMLGoodies.ChessPgn = new Class({
    Extends : Events,
    pgnTimeStamps : {},
    gameDetails : [],
    cachedGameList : {},
    numberOfGames : {},
    serverFile : 'chess.php',
    gameList : null,
    pgnFile : null,

    initialize : function(config){
        if(config)this.__setInitialProperties(config);
        this.objectIndex = D_chessObjects.length;
        D_chessObjects[this.objectIndex] = this;
    },
	__setInitialProperties : function(props) {
		if(props.pgnFile)this.pgnFile = props.pgnFile;
		if(props.serverFile)this.serverFile = props.serverFile;
	},
	__getGameDetails : function(gameIndex,jsOnComplete,liveUpdateMode) {
		if(this.gameDetails[gameIndex] && this.liveUpdateInterval == 0){
			this.__returnGameDetailsFromCache(gameIndex,jsOnComplete);
			return;
		}

        if(!this.pgnTimeStamps[this.pgnFile + '_' + gameIndex] || !this.gameDetails[gameIndex]){
            this.pgnTimeStamps[this.pgnFile + '_' + gameIndex]=0;
        }

        var req = new Request.JSON({
            method : 'get',
            url : this.serverFile,
            data : {
                getGameDetails : '1',
                pgnFile : this.pgnFile,
                gameIndex : gameIndex,
                liveUpdateMode : liveUpdateMode?'1':'0',
                timestamp : this.pgnTimeStamps[this.pgnFile + '_' + gameIndex]
            },
            onSuccess : function(json){
                if(json){
                    this.gameDetails[gameIndex] = json;
                    this.__setPgnTimestamp(gameIndex);
                }

                if(jsOnComplete.indexOf('(')>=0){
                    jsOnComplete = jsOnComplete.replace(')','');
                    eval(jsOnComplete + ',this.gameDetails[' + gameIndex + '])');
                }else{
                    eval(jsOnComplete + '(this.gameDetails[' + gameIndex + '])');
                }
            }.bind(this),
            onError : function(){
                this.__ajaxError();
            }.bind(this)

        });
        req.send();
    }
	,
	__isNumberOfGamesSet : function(){
		return (this.numberOfGames[this.pgnFile]?true:false);
	}
	,
	__getNumberOfGames : function()	{
		return this.numberOfGames[this.pgnFile];
	}
	,
	__getNumberOfGamesFromServer : function(jsOnComplete) {
		if(this.numberOfGames[this.pgnFile]){
			this.__returnNumberOfGamesFromCache(jsOnComplete);
			return;
		}

        var req = new Request({
            method : 'get',
            url : this.serverFile,
            data : {
                getNumberOfGames : '1',
                pgnFile : this.pgnFile
            },
            onComplete : function(response){
                this.numberOfGames[this.pgnFile] = response;
                eval(jsOnComplete + '(' + response + ')');
            }.bind(this),
            onError : function(){
                this.__ajaxError();
            }.bind(this)

        });
        req.send();
	}
	,
	__returnNumberOfGamesFromCache : function(jsOnComplete)	{
		eval(jsOnComplete + '(' + this.numberOfGames[this.pgnFile] + ')');
	}
	,
	__setPgnTimestamp : function(gameIndex)	{
		var d = new Date();
		this.pgnTimeStamps[this.pgnFile + '_' + gameIndex] = Math.floor(d.getTime()/1000);
	}
	,
	__returnGameDetailsFromCache : function(gameIndex,jsOnComplete)	{
		if(jsOnComplete.indexOf('(')>=0){
			jsOnComplete = jsOnComplete.replace(')','');
			eval(jsOnComplete + ',this.gameDetails[' + gameIndex + '])');
		}else{
			eval(jsOnComplete + '(this.gameDetails[' + gameIndex + '])');
		}
	}
	,
    clearListOfGamesCache : function(){
        this.cachedGameList = {};
    },
	__getGameList : function(jsOnComplete)	{
		if(this.cachedGameList[this.pgnFile]){
            if(!jsOnComplete){
                this.fireEvent('loadgames', [{ games : this.cachedGameList[this.pgnFile] }]);
                return;
            }
			this.__returnGameListFromCache(jsOnComplete);
			return;
		}

        this.fireEvent('beforeloadgames');

        var req = new Request.JSON({
            method : 'get',
            url : this.serverFile,
            data : {
                getGameList : '1',
                pgnFile : this.pgnFile
            },
            onSuccess : function(json){
                this.cachedGameList[this.pgnFile] = json;

                this.fireEvent('loadgames', [{ games : json }]);
                if(!jsOnComplete){
                    return json;
                }
                if(jsOnComplete.indexOf('(')>=0){
                    jsOnComplete = jsOnComplete.replace(')','');
                    eval(jsOnComplete + ',json)');
                }else{
                    eval(jsOnComplete + '(json)');
                }
            }.bind(this),
            onError : function(){
                this.__ajaxError();
            }.bind(this)

        });
        req.send();
	}
	,
	__returnGameListFromCache : function(jsOnComplete)	{
        if(!jsOnComplete){
            return;
        }
		if(jsOnComplete.indexOf('(')>=0){
			jsOnComplete = jsOnComplete.replace(')','');
			eval(jsOnComplete + ',this.cachedGameList[this.pgnFile])');
		}else{
			eval(jsOnComplete + '(this.cachedGameList[this.pgnFile])');
		}
	}
	,
	__ajaxError : function() {
		alert('Could not complete ajax request for ' + this.pgnFile);
	}
	,
	__setPgnFile : function(pgnFile) {
		this.gameList = new Array();
		this.gameDetails = new Array();
		this.pgnFile = pgnFile;
	}
});


DG.Chess = new Class({
    Extends: Events,
        
    els : {
        parent : $(document.body),
        board : null,
        playerNames : null,
        movesInGame : null,
        movesInGameTableFormat : [],
        currentMove : null,
        currentPgnFile : null,
        currentComment : null,
        gameAttributes : null,       
        indicators : {}
    },

    layout : {
        chessSet : 'alpha',
        squareSize : 60,
        colorLightSquares : '#E1B78F',
        colorDarkSquares : '#936E4D',
        bgImageLightSquares : null,
        bgImageDarkSquares : null,
        cssPath : 'css/chess.css',
        imageFolder : 'images/',
        boardLabels : true,
        displayPrefaceComments : true,
        gameListTableProperties : {
            tableRef : null,
            props : null,
            viewProperties : null
        }
    },

    behaviour : {
        animate : true,
        animationTime : 0.5,
        sound : false,
 	    flipBoardWhenBlackToStart : true,
	    flipBoardWhenBlackWins : true,
        keyboardNavigation : true,
        highlightLastMove : true,
        autoplay : {
            delay : 1,
            delayBeforeComments : null,
            stopBeforeComments : false
        }
    },

	soundEmbed : null,
	isBusyWithLiveUpdate : null,
	pgnObject : null,
	pieces : null,
	currentMove : null,
	currentColor : null,
	currentVariationMove : null,
	currentVariationColor : null,
	currentVariationMoveNumber : null,

	currentHighlightInlineMove : null,
	currentHighlightTableMove : null,
	currentHighlightInlineVariationMove : null,

	currentHighlightedGame : null,
	previousClassHighlighedGame : null,

	dataForLiveUpdate : {},
	dragAndDropColor : false,
	eventElements : [],

	dragProperties : {},

	liveUpdateInterval : 0,
	elMovesInTable : [],
	languageCode : 'en',
	officers : {
        en : ['B','R','Q','N','K'],
	    no : ['L','T','D','S','K']
    },


	currentMoveNumber : 1,

	elMovesInTableMaxMovesPerTable : 900,
	
	isOldMSIE : ( (navigator.userAgent.toLowerCase().match(/msie\s[0-6]\./gi)) ? true : false ),
	isMSIE : (navigator.userAgent.toLowerCase().indexOf('msie')>=0)?true:false,
	isOpera : (navigator.userAgent.toLowerCase().indexOf('opera')>=0)?true:false,
	isFirefox : (navigator.userAgent.toLowerCase().indexOf('firefox')>=0)?true:false,
	elGameAttributes : {},
	stopAutoplayBeforeComments : false,

	currentGameIndex : false,
	insideVariation : false,

	coordLastMove : {
        from : {},
        to : {}
    },



	flipBoard : false,
	animateNextMove : false,
	isBusy : false,
	currentZIndex : 20000,
	lastMoveEnPassant : false,

	autoPlayActive : false,
	gameListProperties : {},


    initialize : function(config){
        this.objectIndex = D_chessObjects.length;

        D_chessObjects[this.objectIndex] = this;
        if(config)this.__setConfigParameters(config);
        this.pgnObject  = new DHTMLGoodies.ChessPgn(config);
        this.pgnObject.addEvent('loadgames', this.fireLoadGamesEvent.bind(this));
        this.pgnObject.addEvent('beforeloadgames', this.fireBeforeLoadGamesEvent.bind(this));
		this.__loadCss(this.layout.cssPath);
		this.__addSoundEffects();
		this.__addGeneralEvents();
		this.__createLiveUpdateHandler();
		this.__addKeyboardSupport();
		this.__createBoardDiv();
        this.__createDefaultPieces();

        if(config.behaviour && config.behaviour.autoloadGame){
            this.showGame(0);
        }
    },

    getId : function(){
        return this.els.board.id;
    },
	/**
	* Specify auto play speed, i.e. seconds between each move.
	*
	* @param Integer autoPlayDelay - seconds between each move when "AutoPlay" is active. (default = 0.5 seconds)
	* 
	* @public
	*/
	setAutoPlayDelayBetweenMoves : function(autoPlayDelayBetweenMoves){
		if(autoPlayDelayBetweenMoves<0.1)autoPlayDelayBetweenMoves = 0.1;
		this.behaviour.autoplay.delay = autoPlayDelayBetweenMoves;
	}
	,
	/**
	* setDragAndDropColor
	*
	* @param String dragAndDropColor - Specify which color it should be possible to drag. possible values: 'white' and 'black'
	* 
	* @public
	*/
	setDragAndDropColor : function(dragAndDropColor){
		this.dragAndDropColor = dragAndDropColor;
        if(this.pieces[dragAndDropColor]){
            for(var i=0;i<this.pieces[dragAndDropColor].length;i++){
                this.pieces[dragAndDropColor][i].el.setStyle('cursor','pointer');
            }
        }
	}
	,
	/**
	* Specify new pgn file
	*
	* @param String pgnFile - Path to new pgn file (relative path from the html file)
	* 
	* @public
	*/
	setPgn : function(pgnFile) {
		if(this.isBusy || this.autoPlayActive)return;
		this.currentGameIndex = false;
		this.__clearGameDetails();
		this.__clearCurrentVariationVariables();
		this.pgnObject.__setPgnFile(pgnFile);
        this._executeEvent('newpgn');
    }
	,
    _executeEvent : function(eventName){
        this.fireEvent(eventName, [this.pgnObject.gameDetails[this.currentGameIndex], this])
    },
	/**
	*  Display name of pgn file in element defined in property elActivePgnFile
	*
	* @private
	*/
	__displayActivePgnFileProperty : function() {

		if(this.els.currentPgnFile) {
			try{
				this.els.currentPgnFile.innerHTML = this.pgnObject.pgnFile.replace(/^.*\/(.*)$/g,'$1');
			}catch(e) {
			}
		}
	}
	,
	/**
	*  Set size of squares on the board(default = 60). The board will be updated instantly. However, this method
	*	can not be invoked when auto play is active or the script is busy animating a move.
	*
	* @param Integer squareSize - Size of squares
	* 
	* @public
	*/
	setSquareSize : function(squareSize) {
		if(this.isBusy || this.autoPlayActive)return;
		var toMove = this.currentMove;
		var toColor = this.currentColor;
		this.layout.squareSize = squareSize;
		this.__clearBoard();
		if(this.currentGameIndex===false){
			this.__createDefaultPieces();
			return;
		}
		this.parentRef.className = 'ChessBoardParentContainer' + squareSize;
		try{
			this.parentRef.parentNode.className = ' ChessBoardParentOfParentContainer' + squareSize;
		}catch(e) {

		}
		if(this.pgnObject.gameDetails[this.currentGameIndex].fen){
			this.displayBoardByFen(this.pgnObject.gameDetails[this.currentGameIndex].fen,this.parentRef);
		}else{
			this.__createDefaultPieces();
		}
		if(this.insideVariation){
			this.goToVariationMove(this.currentVariationMove,this.currentVariationColor,this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
		}else{
			if(toMove==0)this.currentMove=0;
			if(toMove>0)this.goToMove(toMove,toColor);
		}
		this.__createIndicators();
		this.__highlightLastMove();
	}
	,
	/**
	* Specify new chess set. The board will be updated instantly. However, this method
	*	can not be invoked when auto play is active or the script is busy animating a move.
	*
	* @param String chessSet - Name of chess set(possible values: "smart","alpha","merida","leipzig",traveler","motif","cases")
	* 
	* @public
	*/
	setChessSet : function(chessSet) {
		if(this.isBusy || this.autoPlayActive){
            return;
        }
		this.layout.chessSet = chessSet;
		var toMove = this.currentMove;
		var toColor = this.currentColor;
		this.__clearBoard();
		if(this.currentGameIndex===false){
			this.__createDefaultPieces();
			return;
		}
		if(this.pgnObject.gameDetails[this.currentGameIndex].fen){
			this.displayBoardByFen(this.pgnObject.gameDetails[this.currentGameIndex].fen,this.parentRef);
		}else{
			this.__createDefaultPieces();
		}
		if(this.insideVariation){
			this.goToVariationMove(this.currentVariationMove,this.currentVariationColor,this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
		}else{
			if(toMove==0)this.currentMove=0;
			if(toMove>0)this.goToMove(toMove,toColor);
		}
	}
	,
	/**
	*  Flips the board. The board will be updated instantly. However, this method
	*	can not be invoked when auto play is active or the script is busy animating a move.
	*
	* 
	* @public
	*/
	flip : function()
	{
		if(this.isBusy || this.autoPlayActive){
            return;
        }
		if(this.flipBoard){
			this.flipBoard = false;
		}else{
			this.flipBoard = true;
		}
		var toMove = this.currentMove;
		var toColor = this.currentColor;
		this.__clearBoard();
		if(this.currentGameIndex===false){
			this.__createDefaultPieces();
			return;
		}
		if(this.pgnObject.gameDetails[this.currentGameIndex].fen){
			this.displayBoardByFen(this.pgnObject.gameDetails[this.currentGameIndex].fen,this.parentRef);
		}else{
			this.__createDefaultPieces();
		}
		if(this.insideVariation){
			this.goToVariationMove(this.currentVariationMove,this.currentVariationColor,this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
		}else{
			if(toMove==0)this.currentMove=0;
			if(toMove>0)this.goToMove(toMove,toColor);
		}
	}
	,
	/**
	*  Return next move to be played.
	*
	* @public
	*/
	getNextMove : function() {
		var move = this.__getNextMove();
		return move.notation;
	}
	,
	/**
	*  Return result of game
	*
	* @public
	*/
	getResult : function() {
		if(this.currentGameIndex===false)return false;
		if(!this.pgnObject.gameDetails[this.currentGameIndex].result)return false;
		return this.pgnObject.gameDetails[this.currentGameIndex].result.trim();
	}
	,
	/**
	*  Return name/path of pgn file
	*
	* @public
	*/
	getPgnFile : function()
	{
		return this.pgnObject.pgnFile;
	}
	,
	/**
	*  Return color of the player who starts the game.
	*
	* @public
	*/
	getStartColor : function() {
		return this.whoToStartMove=='w'?'white':'black';
	}
	,
	// {{{ setFlipBoardWhenBlackToStart()
	/**
	*  Flip the board, i.e. show black pieces at the bottom when a game where black starts to move is being displayed. This means
 	*  that the game got a fen position where black starts to move.
	*
	* @param Boolean flipBoardWhenBlackToStart
	* 
	* @public
	*/
	setFlipBoardWhenBlackToStart : function(flipBoardWhenBlackToStart)
	{
		this.behaviour.flipBoardWhenBlackToStart = flipBoardWhenBlackToStart;
	}
	,
	/**
	*  Flip the board, i.e. show black pieces at the bottom when a game where black wins(result: 0-1) is being displayed. 
	*
	* @param Boolean flipBoardWhenBlackToStart
	* 
	* @public
	*/
	setFlipBoardWhenBlackWins : function(flipBoardWhenBlackWins) {
		this.behaviour.flipBoardWhenBlackWins = flipBoardWhenBlackWins;
	}
	,
	/**
	*  Return fen at the current displayed move(NOT YET IMPLEMENTD) 
	*
	* 
	* @public
	*/
	getCurrentFen : function() {
	}
	,
	/**
	*  Returns index of currently displayed game.(0 = first game)
	*
	* 
	* @public
	*/
	getCurrentGameIndex : function() {
		return this.currentGameIndex;
	}
	,
	/**
	*  Display a random game
	*
	* 
	* @public
	*/
	showRandomGame : function()	{
		if(this.pgnObject.__isNumberOfGamesSet()){
			var numGames = this.pgnObject.__getNumberOfGames();
			var gameIndex = Math.floor(Math.random() * numGames);
			return this.showGame(gameIndex);
		}else{
			var ind = this.objectIndex;
			this.pgnObject.__getNumberOfGamesFromServer('D_chessObjects[' + ind + '].__showRandomGame');
		}

	}
	,
	/**
	*  Display a random game - this method is called as a callback from the chessPgn class.
	*	@param Integer numberOfGames - Number of games.
	*
	* 
	* @private
	*/
	__showRandomGame : function(numberOfGames)	{
		if(numberOfGames)this.showRandomGame();
	}
	,
	/**
	*  Display a game in the selected pgn
	*	@param Integer gameIndex - index of game, first game = index 0
	*
	* 
	* @public
	*/
	showGame : function(gameIndex)	{
        this._executeEvent('beforeloadgame');

		this.currentGameIndex = gameIndex;
		this.__clearCurrentVariationVariables();
		this.__clearDragProperties();
		var ind = this.objectIndex;
		this.dataForLiveUpdate.liveUpdateGameIndexBefore = this.currentGameIndex;
		this.pgnObject.__getGameDetails(gameIndex,'D_chessObjects[' + ind + '].__showGame',false);
		return gameIndex;
	}
	,
	/**
	* 
	* @private
	*/
	__addKeyboardSupport : function()	{
		if(!this.behaviour.keyboardNavigation)return;
        $(document.documentElement).addEvent('keypress', this.__handleKeyboard.bind(this) );
	}
	,
	/**
	* 
	* @private
	*/
	__handleKeyboard : function(e)	{
		if(e.key == 'right'){
			this.move(1);
			return false;
		}
		if(e.key == 'left'){
			this.move(-1);
			return false;
		}
		if(e.control && e.shift && e.key=='f') {
			this.flip();
		}
	}
	,
	/**
	* 
	* @private
	*/
	__getNewGameData : function()	{
		if(this.isBusy || this.autoPlayActive || this.isBusyWithLiveUpdate)return;
		if(this.currentGameIndex===false)return;
		this.isBusyWithLiveUpdate = true;
		var lastMove = this.__getLastMove();

		this.dataForLiveUpdate.moveAfterLiveUpdate = false;
		this.dataForLiveUpdate.lastMoveBeforeUpdate = this.__getLastPlayedMove();
        this.dataForLiveUpdate.lastMoveInGameBeforeUpdate = lastMove;
        this.dataForLiveUpdate.gameProperties = this.pgnObject.gameDetails[this.currentGameIndex];

		this.dataForLiveUpdate.liveUpdateGameIndexBefore = this.currentGameIndex;

		if(this.currentMove==lastMove.move && this.currentColor==lastMove.color)this.dataForLiveUpdate.moveAfterLiveUpdate=true;
		if(lastMove.move==0)this.dataForLiveUpdate.moveAfterLiveUpdate=true;

		var ind = this.objectIndex;
		this.pgnObject.__getGameDetails(this.currentGameIndex,'D_chessObjects[' + ind + '].__receiveLiveGameUpdate',true);
	}
	,
	/**
	* 
	* @private
	*/
	__receiveLiveGameUpdate : function(details)	{
		this.isBusyWithLiveUpdate = false;

		if(!details)return;

		if(this.dataForLiveUpdate.liveUpdateGameIndexBefore!=this.currentGameIndex)return;
		var lastMove = this.__getLastMove();
		var lastPlayedMove = this.__getLastPlayedMove();

		this.__displayGameDetails();

		if(lastPlayedMove.move!=this.dataForLiveUpdate.lastMoveBeforeUpdate.move || lastPlayedMove.color!=this.dataForLiveUpdate.lastMoveBeforeUpdate.color)this.dataForLiveUpdate.moveAfterLiveUpdate=false;

		if(lastPlayedMove.move > lastMove.move || (lastPlayedMove.move==lastMove.move && lastMove.color=='white' && lastPlayedMove.color=='black')){	// Changes has been made 
			this.__clearBoard();
			this.__createDefaultPieces();
			this.goToMove(lastMove.move,lastMove.color);

		}else{
			this.goToMove(this.dataForLiveUpdate.lastMoveBeforeUpdate.move,this.dataForLiveUpdate.lastMoveBeforeUpdate.color);
		}
        if(lastMove.move != this.dataForLiveUpdate.lastMoveInGameBeforeUpdate.move || this.hasResultBeenUpdated()) {
            this._executeEvent('liveupdatenewmoves');
        }
		this.__highlightActiveMove(this.currentMove,this.currentColor);
		if(this.dataForLiveUpdate.moveAfterLiveUpdate)this.autoPlay();
        this._executeEvent('liveupdate');


	}
    ,
    hasResultBeenUpdated : function(){
        if(!this.dataForLiveUpdate.gameProperties.lastmoves){
            return false;
        }

        return this.dataForLiveUpdate.gameProperties.lastmoves != this.pgnObject.gameDetails[this.currentGameIndex].lastmoves;
    }
	,
	/**
	*	Display list of games in selected pgn file in a select box, format: "white name vs. black name"
	*	@param Object selectRef - reference to select box.
	* @public
	*/
	displayGameListInSelect : function(selectRef)	{
		if(this.isBusy || this.autoPlayActive)return;
		var ind = this.objectIndex;
		this.pgnObject.__getGameList('D_chessObjects[' + ind + '].__displayGameListInSelect("' + selectRef + '")');
		this.__displayActivePgnFileProperty();

	}
	,
	/**
	*
	* @private
	*/
	__displayGameListInSelect : function(selectRef,json)	{
		selectRef = $(selectRef);
        selectRef.addEvent('change', this.__showGameFromSelect.bind(this));
		selectRef.options.length=0;
		var ind = this.objectIndex;
        var gameList = json;

		for(var no=0;no<gameList.length;no++){
			selectRef.options[selectRef.options.length] = new Option(gameList[no].white + ' vs. ' + gameList[no].black,no);

		}

	}
	,
	/**
	*
	* @private
	*/
	__showGameFromSelect : function(e)	{

		this.showGame(e.target.options[e.target.selectedIndex].value);
	}
	,

    refreshListOfGames : function(){
        var obj = this.layout.gameListTableProperties;
        this.pgnObject.clearListOfGamesCache();
        this.displayGameListInTable(obj.tableRef, obj.props, obj.viewProperties, true);

    },

    loadGames : function() {
        this.pgnObject.__getGameList();
    },

    fireLoadGamesEvent : function(json) {
        this.fireEvent('loadgames', json);
    },

    fireBeforeLoadGamesEvent : function(){
        this.fireEvent('beforeloadgames', [ this ]);
    },

	/**
	*  Display a list of games from specified pgn in a TABLE tag. Remember that this tag needs a thead tag where you have your heading and an empty tbody tag where the games will e listed dynamically by
	*	this method.
	*
	*	@param Object tableRef - Reference to table, either id or a direct reference(i.e. $('myTable') or similar)
	*  @param Array props - which properties to show, i.e. columns in the table. example ['view','white','black','result','event'], all properties except "view" are properties in the pgn file.
	*	@param Object viewProperties - view properties, this is an associative array and the only property so far is "viewGameLink" which is the label of the link which displays the game.
	*				example of this argument:  { viewGameLink:'View game' }
	*
	* @public
	*/
	displayGameListInTable : function(tableRef,props,viewProperties, refreshOnly)	{
        this.layout.gameListTableProperties = {
            'tableRef' : tableRef,
            'props' : props,
            'viewProperties' : viewProperties
        }
		if(this.isBusy || this.autoPlayActive)return;
		if(props && !this.__isArray(props)){	// Properties sent in as commadelimited string
			props = props.split(/,/g);
		}
		tableRef = $(tableRef);

		var ind = this.objectIndex;
		var arrayString = '';
		if(!props){
			props = ['view','white','black','result'];
		}
		for(var no=0;no<props.length;no++){
			if(no==0)arrayString = '['; else arrayString = arrayString + ',';
			arrayString = arrayString + '"' + props[no] + '"';
		}
		if(arrayString)arrayString = arrayString + ']';

		if(viewProperties)this.gameListProperties = viewProperties;

		this.pgnObject.__getGameList('D_chessObjects[' + ind + '].__displayGameListInTable("' + tableRef.id + '",' + arrayString + ',' + (refreshOnly ? '1' : '0') + ')');
		this.__displayActivePgnFileProperty();
	}
	,
	/**
	*  Display game list in predefined table.
	* 
	* @private
	*/
	__displayGameListInTable : function(tableRef,props,refreshOnly, json){

		tableRef = $(tableRef);
		var ind = this.objectIndex;
		var gameList = json;
        if(!gameList.length){
            var newArr = [];
            for(var prop in gameList){
                newArr.push(gameList[prop]);
            }
            gameList = newArr;
        }

		var tbody = tableRef.getElementsByTagName('tbody')[0];
		if(!tbody){
			alert('Your game list table is missing a <tbody> element. Please insert it');
			return;
		}

		var d = new Date();
		var start = d.getTime();

        if(refreshOnly){
            for(var i=0;i<gameList.length;i++){
                 for(var j=0;j<props.length;j++){
                    if(props[j] != 'view'){
                        tbody.rows[i].cells[j].innerHTML = gameList[i][props[j]];
                    }
                }
            }
        }else{
            this.__clearTBodyRows(tableRef);
            
            var currentRowClassName = 'GameListOddRow';
            var tableContent = '';

            var rowTemplate = '<tr id="ChessGameList' + this.objectIndex + '-<ID>" class="<CLASSNAME>">';

            for(var no2=0;no2<props.length;no2++){
                if(props[no2]=='view'){
                    rowTemplate = rowTemplate + '<td><a href="#" id="game<ID>" onclick="D_chessObjects[' + ind + '].showGame(<ID>);return false"><PROPERTY_view></a></td>';
                }else{
                    rowTemplate = rowTemplate + '<td><PROPERTY_' + props[no2] + '></td>';
                }

            }

            rowTemplate+='</TR>';

            for(var i=0;i<gameList.length;i++){
                currentRowClassName = (currentRowClassName=='GameListOddRow'?'GameListEvenRow':'GameListOddRow');
                var thisRow = rowTemplate;
                thisRow = rowTemplate.replace(/<ID>/g,i);
                thisRow = thisRow.replace(/<CLASSNAME>/g,currentRowClassName);
                var txt = this.gameListProperties.viewGameLink;
                if(txt == 'gameNumber')txt = (i/1+1)+'';
                thisRow = thisRow.replace('<PROPERTY_view>',txt);
                for(var j=0;j<props.length;j++){
                    thisRow = thisRow.replace('<PROPERTY_' + props[j] + '>',gameList[i][props[j]]);
                }
                tableContent = tableContent + thisRow;
            }
            this.__replaceTbody(tableContent,tableRef);
        }
		var d2 = new Date();
		var end = d2.getTime();

        this.highlightActiveGame();
		return;

	}
	,
	/**
	* Replace old <tbody> with new content. The rows are sent to this method as a string.
	*
	* @param String content = HTML Content - table rows.
	* @param Object tableRef = Reference to HTML element
	* @private
	*/
	__replaceTbody : function(content,tableRef)
	{
		var className;
		var css;
		var tbodies = tableRef.getElementsByTagName('TBODY');
		if(tbodies.length>0){
			className = tbodies[0].className;
			css = tbodies[0].style.cssText;
			this.__discardElement(tbodies[0]);
		}
		content = '<tbody class="' + className + '" style="' + css + '">' + content + '</tbody>';
		try{
			tableRef.innerHTML = tableRef.innerHTML + content;
		}catch(e){	// IE
			var outerHTML = tableRef.outerHTML;
			tokens = outerHTML.split(/<\/TABLE>/gi);
			newHTML = tokens[0] + content + '</table>';
			tableRef.outerHTML = newHTML;
		}
        
    }
	,
	// {{{ __showGame()
	/**
	*  Called by the pgn class at the top when game details has been loaded via ajax. 
	* 
	* @private
	*/
	__showGame : function(details)	{
		if(this.dataForLiveUpdate.liveUpdateGameIndexBefore!=this.currentGameIndex)return;
		this.flipBoard = false;
		this.stopAutoPlay();
		if(details.fen){
			this.__setWhoToMoveFromFen(details.fen);
			if(this.whoToStartMove=='b' && this.behaviour.flipBoardWhenBlackToStart)this.flipBoard=true;
			this.__clearBoard();
			this.displayBoardByFen(details.fen,this.parentRef);
		}else{
			this.__setWhoToMoveFromResult(details.fen);
			if(this.whoToStartMove=='b' && this.behaviour.flipBoardWhenBlackWins)this.flipBoard=true;
			this.__clearBoard();
			this.__createDefaultPieces();
		}
		this.currentMove = 0;
		this.currentColor = this.whoToStartMove=='w';
		this.__clearDisplayedActiveMove();
		this.highlightActiveGame();
		this.__displayGameDetails();
        this._executeEvent('loadgame');

	}
	,
	// {{{ __clearGameDetails()
	/**
	*  Clear displayed game attributes
	* 
	* @private
	*/
	__clearGameDetails : function()	{
		this.__clearMoveDetails();
		for(var prop in this.els.gameAttributes){
			try{
				$(this.els.gameAttributes[prop]).innerHTML = '';
			}catch(e){

			}
		}
		if(this.els.playerNames)this.els.playerNames.innerHTML='';
	}
	,
	/**
	*  Display game details when uses selects a game.
	*
	* @private
	*/
	__displayGameDetails : function()	{
		this.__clearGameDetails();

		this.__displayMoveDetails();
		var gameDetails = this.pgnObject.gameDetails[this.currentGameIndex];
		for(var prop in this.els.gameAttributes){
			if(gameDetails[prop.toLowerCase()]){
				try{
					var el = $(this.els.gameAttributes[prop]);
					el.innerHTML = gameDetails[prop.toLowerCase()];
				}catch(e){

				}
			}
		}
		if(this.els.playerNames){
			this.els.playerNames.innerHTML = this.pgnObject.gameDetails[this.currentGameIndex].white + ' vs. ' + this.pgnObject.gameDetails[this.currentGameIndex].black;

		}
	}
	,
	/**
	*  Highlight active game in game list.
	*
	* @private
	*/
	highlightActiveGame : function()	{
		if(this.currentHighlightedGame){
			this.currentHighlightedGame.className = this.previousClassHighlighedGame;
		}
		if($('ChessGameList' + this.objectIndex + '-' + this.currentGameIndex)){
			this.currentHighlightedGame = $('ChessGameList' + this.objectIndex + '-' + this.currentGameIndex);
			if(this.currentHighlightedGame.className!='ActiveGameInTable')this.previousClassHighlighedGame = this.currentHighlightedGame.className;
			this.currentHighlightedGame.className = 'ActiveGameInTable';
		}
	}
	,
	// {{{ __clearMoveDetails()
	/**
	*  Clear move details, i.e. remove inline moves. This method is called by the __clearGameDetails method.
	*
	* @private
	*/
	__clearMoveDetails : function()	{

		if(this.els.movesInGame)this.els.movesInGame.innerHTML = '';
		if(this.els.movesInGameTableFormat){
			for(var no=0;no<this.els.movesInGameTableFormat.length;no++){
				this.__clearTBodyRows(this.els.movesInGameTableFormat[no]);
			}
		}

	}
	,
	__clearCurrentVariationVariables : function()	{
		this.insideVariation = false;
		this.currentVariationMove = 0;
		this.currentVariationColor = 'white';
		this.currentVariationMoveNumber = false;
	}
	,
	__setStartVariationVariables : function(moveRoot,moveRootColor,variationIndex)	{
		this.insideVariation = { move:moveRoot,color:moveRootColor,variationIndex:variationIndex };
		var variations = this.pgnObject.gameDetails[this.currentGameIndex].moves[moveRoot][moveRootColor].variation[variationIndex];
		for(var prop in variations){
			this.currentVariationMoveNumber = prop*2;
			this.currentVariationMove = prop/1;
			this.currentVariationColor = 'white';
			if(!variations[prop].white){
				this.currentVariationMoveNumber++;
				this.currentVariationColor = 'black';
			}
			break;
		}

		if(this.currentVariationColor=='black'){	// Set current variation move prior to the start of the variation
			this.currentVariationColor = 'white';
		}else{
			this.currentVariationColor = 'black';
			this.currentVariationMove--;
		}
	}
	,
	goToVariationMove : function(move,color,moveRoot,moveRootColor,variationIndex)	{
		var goToMove = moveRoot;
		var goToColor = moveRootColor;
		var goToMoveNumber = (move*2) + (color=='black'?1:0);
		if(goToColor=='black'){
			goToColor='white';
		}else{
			goToColor='black';
			goToMove--;
		}
		var animateNext = this.animateNextMove;
		this.animateNextMove = false;
		if(this.insideVariation && (this.insideVariation.move!=moveRoot || this.insideVariation.color!=moveRootColor || this.insideVariation.variationIndex!=variationIndex)){
			this.goToMove(goToMove,goToColor);
			this.__clearCurrentVariationVariables();
			this.__setStartVariationVariables(moveRoot,moveRootColor,variationIndex);
		}
		if(!this.insideVariation){
			this.goToMove(goToMove,goToColor);
			this.__setStartVariationVariables(moveRoot,moveRootColor,variationIndex);
		}
		if(this.insideVariation && goToMoveNumber<this.currentVariationMoveNumber){
			this.goToMove(goToMove,goToColor);
			this.__setStartVariationVariables(moveRoot,moveRootColor,variationIndex);
		}
		this.animateNextMove = animateNext;
		var variations = this.pgnObject.gameDetails[this.currentGameIndex].moves[moveRoot][moveRootColor].variation[variationIndex];
		var pieceMoved = false;
		for(var no=this.currentVariationMoveNumber;no<=goToMoveNumber;no++){
			pieceMoved = true;
			var moveNumber = Math.floor(no/2);
			var moveToColor = no%2==1?'black':'white';
			if(variations[moveNumber][moveToColor]){
				this.__parseAMove(variations[moveNumber][moveToColor],moveToColor);
				this.currentVariationMove = moveNumber;
				this.currentVariationColor = moveToColor;
				this.currentVariationMoveNumber=no;
			}
		}
		this.currentVariationMoveNumber++;
		this.__highlightLastMove();
		this.__highlightActiveVariationMove(move,color,moveRoot,moveRootColor);
	}
	,
	/**
	*  Return inline move string for a variation branch
	*
	* @private
	*/
	__getMoveDetailsForVariation : function(variations,move,color)	{
		var ind = this.objectIndex;
		var retValue = '';

        for(var i=0;i<variations.length;i++ ){
			var aVariation = variations[i]

			var ret = '';
			for(var prop in aVariation){
				if(ret)ret = ret + ' '; else ret = '[';
				if(aVariation[prop].white){
					ret = ret + prop + '. <a class="InlineVariationMove" href="#" id="InlineVariationMove_' + move + '_' + color + '_' + i + '_' + prop + '_' + 'white" onclick="D_chessObjects[' + ind + '].goToVariationMove(\'' + prop + '\',\'white\',\'' + move + '\',\'' + color + '\',\'' + i + '\');return false">' + this.__getAMoveInLanguage(aVariation[prop].white) + '</a>';
					if(aVariation[prop].black){
						ret = ret + ' <a class="InlineVariationMove" href="#" id="InlineVariationMove_' + move + '_' + color + '_' + i + '_' + prop + '_' + 'black" onclick="D_chessObjects[' + ind + '].goToVariationMove(\'' + prop + '\',\'black\',\'' + move + '\',\'' + color + '\',\'' + i + '\');return false">' + this.__getAMoveInLanguage(aVariation[prop].black) + '</a>' ;
					}
				}else{
					ret = ret + prop + '... <a class="InlineVariationMove" href="#" id="InlineVariationMove_' + move + '_' + color + '_' + i + '_' + prop + '_' + 'black" onclick="D_chessObjects[' + ind + '].goToVariationMove(\'' + prop + '\',\'black\',\'' + move + '\',\'' + color + '\',\'' + i + '\');return false">' + this.__getAMoveInLanguage(aVariation[prop].black) + '</a>' ;
				}
			}
			ret = ret + '] ';
			ret = ' <span class="InlineChessVariationBlock">' + ret + '</span>';
			retValue = retValue + ret;
		}
		return retValue;
	}
	,
	/**
	*
	* @private
	*/
	__getClassNameOfInlineMove : function(move)	{
		var ret = 'InlineChessMove_plainMove';
		if(move.indexOf('!')>=0)ret = 'InlineChessMove_goodMove';
		if(move.indexOf('!!')>=0)ret = 'InlineChessMove_veryGoodMove';
		if(move.indexOf('?')>=0)ret = 'InlineChessMove_badMove';
		if(move.indexOf('??')>=0)ret = 'InlineChessMove_veryBadMove';
		if(move.indexOf('!?')>=0)ret = 'InlineChessMove_supriseMove';
		if(move.indexOf('?!')>=0)ret = 'InlineChessMove_questionableMove';
		return ret;
	}
	,
	/**
	*  Return language specific version of a move.
	*
	* @private
	*/
	__getAMoveInLanguage : function(move)	{
		if(this.languageCode=='en')return move;
		for(var no=0;no<this.officers.en.length;no++){
			move = move.replace(this.officers.en[no],this.officers[this.languageCode][no]);
		}
		return move;
	}
	,
	/**
	*  Display move details
	*
	* @private
	*/
	__displayMoveDetails : function()	{

		this.__clearGameDetails();
		var moves = this.pgnObject.gameDetails[this.currentGameIndex].moves;
		var ind = this.objectIndex;

		if(this.els.movesInGame){	// Display move inline as a string
			var moveStr = '';
			if(this.pgnObject.gameDetails[this.currentGameIndex].prefaceComment && this.layout.displayPrefaceComments){
				moveStr = moveStr + '<span class="InlineChessComment">' + this.pgnObject.gameDetails[this.currentGameIndex].prefaceComment + '</span> ';
			}
			for(var prop in moves){
				if(moveStr)moveStr = moveStr + ' ';
				if(moves[prop].white){
					var className=this.__getClassNameOfInlineMove(moves[prop].white.move);

					moveStr = moveStr + prop + '.' + '<a class="' + className + '" id="InlineChessMove' + ind + '_' + prop + 'white" href="#" onclick="D_chessObjects[' + ind + '].goToMove(\'' + prop + '\',\'white\');return false">' + this.__getAMoveInLanguage(moves[prop].white.move) + '</a>';
					if(moves[prop].white.comment){
						moveStr = moveStr + ' <span class="InlineChessComment">' + moves[prop].white.comment + '</span> ';
					}
					if(moves[prop].white.variation){
						moveStr = moveStr + this.__getMoveDetailsForVariation(moves[prop].white.variation,prop,'white');
					}
					if(moves[prop].black){
						var className=this.__getClassNameOfInlineMove(moves[prop].black.move);
						moveStr = moveStr + ' ' + '<a class="' + className + '" id="InlineChessMove' + ind + '_' + prop + 'black" href="#" onclick="D_chessObjects[' + ind + '].goToMove(\'' + prop + '\',\'black\');return false">' + this.__getAMoveInLanguage(moves[prop].black.move) + '</a>';
						if(moves[prop].black.comment){
							moveStr = moveStr + ' <span class="InlineChessComment">' + moves[prop].black.comment + '</span> ';
						}
						if(moves[prop].black.variation){
							moveStr = moveStr + this.__getMoveDetailsForVariation(moves[prop].black.variation,prop,'black');
						}
					}
				}else{
					var className=this.__getClassNameOfInlineMove(moves[prop].black.move);
					moveStr = moveStr + prop + ' ...' + '<a class="' + className + '" id="InlineChessMove' + ind + '_' + prop + 'black" href="#" onclick="D_chessObjects[' + ind + '].goToMove(\'' + prop + '\',\'black\');return false">' + this.__getAMoveInLanguage(moves[prop].black.move) + '</a>';
					if(moves[prop].black.comment){
						moveStr = moveStr + ' <span class="InlineChessComment">' + moves[prop].black.comment + '</span> ';
					}
					if(moves[prop].black.variation){
						moveStr = moveStr + this.__getMoveDetailsForVariation(moves[prop].black.variation,prop,'black');
					}
				}
			}
			moveStr = moveStr + ' ' + this.pgnObject.gameDetails[this.currentGameIndex].result;
			this.els.movesInGame.innerHTML = moveStr;
		}
		if(this.els.movesInGameTableFormat[0]){
			var tbody = this.els.movesInGameTableFormat[0].getElementsByTagName('TBODY')[0];
			if(!tbody){
				alert('Cannot display moves inside a table because it is missing a <tbody> element');
				return;
			}
			var tableCounter = 0;
			var moveCounter = 1;
			for(var prop in moves){
				if(moveCounter>this.els.movesInGameTableFormatMaxMovesPerTable){
					tableCounter++;
					moveCounter=1;
					var tbody = this.els.movesInGameTableFormat[tableCounter].getElementsByTagName('TBODY')[0];
				}
				var row = document.createElement('TR');
				tbody.appendChild(row);

				var cell = document.createElement('TD');
				cell.innerHTML = prop;
				row.appendChild(cell);

				if(moves[prop].white){
					var cell = document.createElement('TD');
					cell.innerHTML = '<a id="TableChessMove' + ind + '_' + prop + 'white" href="#" onclick="D_chessObjects[' + ind + '].goToMove(\'' + prop + '\',\'white\');return false">' + this.__getAMoveInLanguage(moves[prop].white.move) + '</a>';
					row.appendChild(cell);

					if(moves[prop].black){
						var cell = document.createElement('TD');
						cell.innerHTML = '<a id="TableChessMove' + ind + '_' + prop + 'black" href="#" onclick="D_chessObjects[' + ind + '].goToMove(\'' + prop + '\',\'black\');return false">' + this.__getAMoveInLanguage(moves[prop].black.move) + '</a>';
						row.appendChild(cell);
					}
				}else{
					// No white move - create empty cell
					var cell = document.createElement('TD');
					cell.innerHTML = '...';
					row.appendChild(cell);

					if(moves[prop].black){
						var cell = document.createElement('TD');
						cell.innerHTML = '<a id="TableChessMove' + ind + '_' + prop + 'black" href="#" onclick="D_chessObjects[' + ind + '].goToMove(\'' + prop + '\',\'black\');return false">' + this.__getAMoveInLanguage(moves[prop].black.move) + '</a>';
						row.appendChild(cell);
					}
				}

				moveCounter++;
			}

		}


	}
	,
	/**
	*  User have clicked on "View" in the game list, call showGame from this method.
	*
	* @private
	*/
	__showGameLink : function()	{
		var ind = this.getAttribute('objectIndex');
		D_chessObjects[ind].showGame(this.id.replace(/[^0-9]/g,''));

	}
	,
	/**
	*  Move to the start of the game. This method won't do anything when the script is busy animating or if no game has been selected.
	*
	* @public
	*/
	moveToStart : function()	{
		if(this.currentGameIndex===false || this.isBusy)return;
		if(!this.pgnObject.gameDetails[this.currentGameIndex].moves[1])return;
		if(this.pgnObject.gameDetails[this.currentGameIndex].fen){
			this.displayBoardByFen(this.pgnObject.gameDetails[this.currentGameIndex].fen,this.parentRef);
		}else{
			this.__createDefaultPieces();
		}
		if(this.insideVariation){
			var firstMove = this.__getFirstVariationMove(this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
			this.goToVariationMove(firstMove.move,firstMove.color,this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex)
		}else{
			this.currentMove=0;
			this.currentColor=0;
			this.currentMoveNumber=1;
			var tmpColor='white';
			if(!this.pgnObject.gameDetails[this.currentGameIndex].moves[1].white)tmpColor='black';
			this.__highlightActiveMove(0,tmpColor);	// 0 since no highlight
			this.__displayActiveMove(1,tmpColor);
			this.__playSound('startGame');
		}



	}
	,
    animateLastMoveInGame : function(delay){
        delay = delay || 0;
        var lastMove = this.__getLastMove();
        if(lastMove.move == 0 && lastMove.color == 'white'){
            return;
        }
        if(lastMove.color == 'black'){
            lastMove.color = 'white';
        }else{
            lastMove.color = 'black';
            lastMove.move--;
        }
        this.goToMove(lastMove.move,lastMove.color);
        if(delay){
            this.move.delay(delay * 1000,this,1);
        }else{
            this.move(1);
        }


    },
	/**
	*  Move to the end of the game. This method won't do anything when the script is busy animating or if no game has been selected.
	*
	* @public
	*/
	moveToEnd : function()	{
		if(this.currentGameIndex===false || this.isBusy)return;
		if(!this.pgnObject.gameDetails[this.currentGameIndex].moves || !this.pgnObject.gameDetails[this.currentGameIndex].moves[1])return;
		var moveObj =  this.pgnObject.gameDetails[this.currentGameIndex].moves;
		if(this.insideVariation){
			var lastMove = this.__getLastVariationMove(this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
			this.goToVariationMove(lastMove.move,lastMove.color,this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
		}else{
			var lastMove = this.__getLastMove();
			this.goToMove(lastMove.move,lastMove.color);
		}
	}
	,
	/**
	*  Return an associative array with keys "move" and "color" for the last move in the game.
	*
	* @private
	*/
	__getLastMove : function()	{
        if(!this.pgnObject.gameDetails[this.currentGameIndex]){
            return false;
        }
		var moveObj =  this.pgnObject.gameDetails[this.currentGameIndex].moves;
		var lastMove = false;
		for(var prop in moveObj){
			lastMove=prop;
		}
		if(lastMove===false)return { move:0,color:'white' }
		var ret = new Object();
		ret.move = lastMove;
		if(moveObj[lastMove].black)ret.color='black'; else ret.color='white';
		return ret;
	}
	,
	/**
	*  Return an associative array with keys "move" and "color" for the first move in a variation.
	*
	* @private
	*/
	__getFirstVariationMove : function(moveRoot,moveRootColor,variationIndex)	{
		var moveObj =  this.pgnObject.gameDetails[this.currentGameIndex].moves[moveRoot][moveRootColor].variation[variationIndex];
		for(var prop in moveObj){
			lastMove=prop;
			break;
		}
		var ret = new Object();
		ret.move = lastMove;
		if(!lastMove)return 'white';
		if(moveObj[lastMove].black)ret.color='black'; else ret.color='white';
		return ret;
	}
	,
	/**
	*  Return an associative array with keys "move" and "color" for the last move in a variation.
	*
	* @private
	*/
	__getLastVariationMove : function(moveRoot,moveRootColor,variationIndex)	{

		var moveObj =  this.pgnObject.gameDetails[this.currentGameIndex].moves[moveRoot][moveRootColor].variation[variationIndex];
		for(var prop in moveObj){
			lastMove=prop;
		}
		var ret = new Object();
		ret.move = lastMove;
		if(!lastMove)return 'white';
		if(moveObj[lastMove].black)ret.color='black'; else ret.color='white';
		return ret;
	}
	,
	/**
	*  Move on the board
	*	@param Integer - number of moves, for example 1 for one step forward or -1 for one step back.
	*
	* @public
	*/
	move : function(moves)	{
        if(!moves){
            moves = 1;
        }
		if(this.currentGameIndex===false || this.isBusy)return;
		if(!this.pgnObject.gameDetails[this.currentGameIndex].moves[1])return;

		var fullMoves = Math.floor(Math.abs(moves)/2);
		var halfMoves = Math.abs(moves)%2;


		if(this.insideVariation){	// Inside variation - get current variation move and color
			var color = this.currentVariationColor;
			var move = this.currentVariationMove;
		}else{	// Following main line
			var color = this.currentColor;
			var move = this.currentMove;
		}

		if(moves>0){
			if(halfMoves==1){
				if(color=='white'){
					color='black';
				}else{
					color='white';
					move++;
				}
			}
		}
		if(moves<0){
			fullMoves*=-1;
			if(halfMoves==1){
				if(color=='black'){
					color='white';
				}else{
					color='black';
					move--;
				}
			}
		}
		move+=fullMoves;

		if(this.insideVariation){	// We are inside a variation
			if(move<=this.insideVariation.move){
				if(color=='white' && this.insideVariation.color=='black')return;	// We're at the start of the variation
				if(move<this.insideVariation.move)return;// We're at the start of the variation
			}
			if(moves>0){
				var lastMove = this.__getLastVariationMove(this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
			}
		}else{
			if(move<=0){
				this.moveToStart();
				this.__hideIndicators();
				return;
			}
			if(moves>0){
				var lastMove = this.__getLastMove();
			}
		}

		this.animateNextMove = false;
		if(this.behaviour.animate && moves==1)this.animateNextMove = true;
		if(moves>0){
			if(move>=lastMove.move){
				if(move>lastMove.move){
					move = lastMove.move/1;
					color = lastMove.color;
					this.animateNextMove = false;
					if(moves==1)return;// already at last move
				}else{
					move = lastMove.move/1;
					if(color=='black' && lastMove.color=='white'){
						color='white';
						this.animateNextMove = false;
					}
				}
			}
		}

		if(this.insideVariation){	// We are inside a variation
			if(moves!=0){
				this.goToVariationMove(move,color,this.insideVariation.move,this.insideVariation.color,this.insideVariation.variationIndex);
			}
		}else{	// Inside main line
			if(moves!=0){
				if(moves>0 && move==1 && color=='white' && !this.pgnObject.gameDetails[this.currentGameIndex].moves[1]['white'])color='black';
				this.goToMove(move,color,moves);
			}

		}
	}
	,
	// {{{ autoPlay()
	/**
	*  Start autoplay mode. this method won't do anything if no game has been selected.
	*
	* @public
	*/
	autoPlay : function()	{
		if(this.autoPlayActive || this.currentGameIndex===false)return;	// Already in auto play mode or no games loaded
		if(!this.pgnObject.gameDetails[this.currentGameIndex].moves || !this.pgnObject.gameDetails[this.currentGameIndex].moves[1])return;
		this.autoPlayActive = true;
		var moveDetails = this.__getNextMove();
		var move = moveDetails.move;
		var color = moveDetails.color;

		this.__autoPlayStep(move,color);
	}
	,
	// {{{ __autoPlayStep()
	/**
	*  This method takes care of the step by step moves in autoplay mode.
	*
	* @private
	*/
	__autoPlayStep : function(move,color)
	{
		if(this.insideVariation){
			var moveObj =  this.pgnObject.gameDetails[this.currentGameIndex].moves[this.insideVariation.move][this.insideVariation.color].variation[this.insideVariation.variationIndex];
			if(moveObj[move] && moveObj[move][color]){// Move exists
				this.move(1);
			}else{
				this.stopAutoPlay();
                this._executeEvent('stopautoplay');

			}
		}else{
			if(this.pgnObject.gameDetails[this.currentGameIndex] && this.pgnObject.gameDetails[this.currentGameIndex].moves[move] && this.pgnObject.gameDetails[this.currentGameIndex].moves[move][color]){// Move exists
				this.move(1);
			}else{
				this.stopAutoPlay();
                this._executeEvent('startautoplay');

			}
		}
	}
	,
	/**
	*  Exit autoplay mode.
	*
	* @public
	*/
	stopAutoPlay : function()
	{
		this.autoPlayActive = false;
	}
	,
	/**
	*  Go to a specific move in the game
	*	@param Integer moveNumber - example: 2
	*	@param String color, example "black"
	*
	* @public
	*/
	goToMove : function(moveNumber,color,direction)	{
        var d = new Date();
		if(this.currentGameIndex===false || this.isBusy || !moveNumber){
			this.__hideIndicators();
			return;
		}

		if(!this.pgnObject.gameDetails[this.currentGameIndex].moves[1])return;

		var tmpNo = (moveNumber*2) + (color=='black'?1:0);
		if(tmpNo<this.currentMoveNumber || this.insideVariation){
			if(this.pgnObject.gameDetails[this.currentGameIndex].fen){
				this.displayBoardByFen(this.pgnObject.gameDetails[this.currentGameIndex].fen,this.parentRef);
			}else{
				this.__createDefaultPieces();
			}
			this.currentColor = this.whoToStartMove;
		}

		if(tmpNo==this.currentMoveNumber-1)return;

		var tmpColor;
		if(this.currentColor=='w')tmpColor='white'; else tmpColor='black';
		for(var no=this.currentMoveNumber;no<tmpNo;no++){	/* Loop through moves */
			var tmpColor = (no%2==1?'white':'black');
			var moveIndex = Math.ceil(no/2);

			if(no==tmpNo-1){ // Only highlight the last move in the loop, i.e. the actual move we're moving to.
				this.__highlightActiveMove(moveIndex,tmpColor);
				this.__displayActiveMove(moveIndex,tmpColor);
			}
			if(this.pgnObject.gameDetails[this.currentGameIndex].moves[moveIndex] && this.pgnObject.gameDetails[this.currentGameIndex].moves[moveIndex][tmpColor])this.__parseAMove(this.pgnObject.gameDetails[this.currentGameIndex].moves[moveIndex][tmpColor].move,tmpColor);
		}
		var indicate = true;
		if(direction<0 && moveNumber==1){
			if(color=='white')indicate=false;
			if(color=='black' && !this.pgnObject.gameDetails[this.currentGameIndex].moves[1].white)indicate=false;
		}

		if(indicate)this.__highlightLastMove();
		this.currentMoveNumber = moveNumber*2 + (color=='black'?1:0);
		this.currentMove = moveNumber/1;
		this.currentColor = color;

		this.__clearCurrentVariationVariables();

		if(this.autoPlayActive && !this.behaviour.animate){

			var moveDetails = this.__getNextMove();
			var autoplayDelay = this.__getAutoPlayDelayBeforeNextMove();
			if(this.behaviour.autoplay.stopBeforeComments && this.pgnObject.gameDetails[this.currentGameIndex].moves[this.currentMove][this.currentColor].comment){
				this.stopAutoPlay();
				return;
			}
            this.move.delay(autoplayDelay, this, 1);
		}
	}
	,
	/**
	*  Return autosecond delay before next move.
	*
	* @private
	*/
	__getAutoPlayDelayBeforeNextMove : function()	{
		if(this.behaviour.autoplay.delayBeforeComments && this.pgnObject.gameDetails[this.currentGameIndex].moves[this.currentMove][this.currentColor].comment){
			var autoplayDelay = (this.behaviour.autoplay.delayBeforeComments*1000);
		}else{
			var autoplayDelay = (this.behaviour.autoplay.delay*1000);
		}
		return 	autoplayDelay;
	}
	,
	/**
	*  Highlight active move in table or inline view
	*
	* @private
	*/
	__highlightActiveMove : function(moveIndex,color)	{
		if(this.currentHighlightInlineMove){
			try{
				var className = this.currentHighlightInlineMove.className.replace(' ActiveInlineChessMove','');
				var className = className.replace(' ActiveInlineVariationChessMove','');
				className = className.trim();
				this.currentHighlightInlineMove.className=className;
			}catch(e){
			}
		}
		if(this.currentHighlightTableMove){
			try{
				this.currentHighlightTableMove.className='';
			}catch(e){
			}
		}
		if($('InlineChessMove' + this.objectIndex + '_' + moveIndex + color)){
			this.currentHighlightInlineMove = $('InlineChessMove' + this.objectIndex + '_' + moveIndex + color);
			var newClass = this.currentHighlightInlineMove.className + ' ActiveInlineChessMove';
			this.currentHighlightInlineMove.className = newClass;
			this.__autoScrollContainerInlineMove(this.currentHighlightInlineMove);
		}
		if($('TableChessMove' + this.objectIndex + '_' + moveIndex + color)){
			this.currentHighlightTableMove = $('TableChessMove' + this.objectIndex + '_' + moveIndex + color);
			this.currentHighlightTableMove.className = 'ActiveTableChessMove';
			this.__autoScrollContainerTableMove(this.currentHighlightTableMove);
		}
	}
	,
	/**
	*  Highlight active move in table or inline view
	*
	* @private
	*/
	__highlightActiveVariationMove : function(moveIndex,color,moveRoot,colorRoot)	{
		this.__highlightActiveMove(0,'white'); // remove standard highlight
		var idOfEl = 'InlineVariationMove_' + this.insideVariation.move + '_' + this.insideVariation.color + '_' + this.insideVariation.variationIndex + '_' + moveIndex + '_' + color;
		if($(idOfEl)){
			this.currentHighlightInlineMove = $(idOfEl);
			this.currentHighlightInlineMove.className = this.currentHighlightInlineMove.className + ' ActiveInlineVariationChessMove';
			this.__autoScrollContainerInlineMove(this.currentHighlightInlineMove);
		}


	}
	,
	/**
	*  Auto scroll games moves in table
	*
	* @private
	*/
	__autoScrollContainerTableMove : function(el)	{
		try{
			var parent = el.parentNode.parentNode;
			el = el.parentNode;
			while(parent!=this.els.movesInGameTableFormat[0] && parent.tagName.toLowerCase()!='body')parent = parent.parentNode;	// Find parent element
			var overflow = $(parent).getStyle('overflow');
			if(overflow && (overflow!='auto' || overflow!='scroll')){
				parent = parent.parentNode;
				var overflow = $(parent).getStyle('overflow');
			}

			if((el.offsetTop +30) > (parent.clientHeight + parent.scrollTop - el.offsetHeight - 2)){
				parent.scrollTop = (el.offsetTop - parent.clientHeight + el.offsetHeight +2) + 30;
			}else if(el.offsetTop < parent.scrollTop){
				parent.scrollTop = el.offsetTop;
			}
		}catch(e){

		}
	}
	,
	// {{{ __autoScrollContainerInlineMove()
	/**
	*  Automatically scroll highlighted inline move into view
	*	@param Object el - reference to inline move link
	*
	* @private
	*/
	__autoScrollContainerInlineMove : function(el)	{
		var parent = el.parentNode;
		while(parent!=this.els.movesInGame)parent = parent.parentNode;	// Find parent element
		if(el.offsetTop > (parent.clientHeight + parent.scrollTop - el.offsetHeight - 2)){
			parent.scrollTop = (el.offsetTop - parent.clientHeight + el.offsetHeight +2);
		}

	}
	,
	/**
	*  Clear the element where active move is eventually beeing displayed.
	*
	* @private
	*/
	__clearDisplayedActiveMove : function()	{
		if(this.els.currentMove){
			this.els.currentMove.innerHTML = '';
		}
		if(this.els.currentComment){
			this.els.currentComment.innerHTML = '';
		}
	}
	,
	/**
	*  Display active move inside eventual predefined element, i.e. the displayActiveMove property sent to the constructor.
	*
	* @private
	*/
	__displayActiveMove : function(moveIndex,color)	{
		if(this.els.currentMove){
			var move = this.__getAMoveInLanguage(this.pgnObject.gameDetails[this.currentGameIndex].moves[moveIndex][color].move);
			if(color=='black')move = '... ' + move;else move = '. ' + move;
			move = moveIndex + move;
			this.els.currentMove.innerHTML = move;
		}
		if(this.els.currentComment){

			var move = this.pgnObject.gameDetails[this.currentGameIndex].moves[moveIndex][color];
			if(move.comment){
				this.els.currentComment.innerHTML = move.comment;
			}else{
				this.els.currentComment.innerHTML = '';
			}
		}
	}
	,
	/**
	*  This method returns info regarding a piece from a move, i.e. from which file, rank, which piece moved etc.
	*
	*	@param String move, Move, example: Nxf6
	*
	* @private
	*/
	__getInfoByMoveString : function(move,color)	{
		var write = false;
		if(move=='hxg8Q+')write = true;
		move = move.replace(/[\#\+]/gi,'');

		if(move.length==3 && move.match(/^[a-h][18][BRNQ]$/)){	// If notation like g8Q
			move = move.substr(0,2) + '=' + move.substr(2,1);
		}

		// hxg8Q+
		var capture = (move.indexOf('x')>=0)?true:false;
		var castle = (move.indexOf('0')>=0)?true:false;
		if(!castle){
			castle = (move.indexOf('O')>=0)?true:false;
		}
		var pawnMove = move.substr(0,1).match(/[abcdefgh]/);

		var officer = move.substr(0,1).match(/[BKQNR]/g);
		var promote = move.match(/=/);

		if(pawnMove && move.substr(move.length-1,1).match(/[BKQNR]/)) {
			promote=true;
			officer = false;
		}


		var fromRank = false;	// It has been specified where to move from.
		var rankMatches = move.match(/[0-9]/g);
		if(rankMatches && rankMatches.length>1){
			fromRank = rankMatches[0];
		}
		if(promote){
			pawnMove=true;
			officer=false;
		}
		if(officer)pawnMove=false;
		var fromFile = false;	// It has been specified where to move from.
		var fileMatches = move.match(/[a-h]/g);
		if(fileMatches && fileMatches.length>1){
			fromFile = fileMatches[0];
		}
		if(pawnMove){
			if(capture){
				fromFile = move.replace(/^([a-h]).*$/,'$1');
			}else{
				fromFile = move.replace(/[^a-h]/g,'');
			}
			fromRank = move.replace(/[^0-9]/g,'');

			if(color=='black')fromRank = fromRank/1+1;else fromRank = fromRank/1-1;
		}
        return {
            fromFile : fromFile,
            fromRank : fromRank,
            castle : castle,
            officer : officer,
            pawnMove : pawnMove,
            capture : capture,
            promote : promote
        }
	}
	,
	/**
	*  Parse a specific move and display it on the board.
	*	@param Integer move, example 2
	*	@param String color, example "black"
	*
	* @private
	*/
	__parseAMove : function(move,color)	{
		this.lastMoveEnPassant = false;
		this.lastMovePawnPromote = false;
		this.currentlyParsedMove = move;

		var opositeColor = (color=='white')?'black':'white';
		if(move.substr(move.length-1,1) == '='){
			move = move.substr(0,move.length-1);
		}
		move = move.replace(/\-\/?\+/g,'')
		move = move.replace(/\+\/?\-/g,'')
		var moveInfo = this.__getInfoByMoveString(move);

		move = move.replace(/[\#\+!\?]/gi,'');

		if(!moveInfo.castle){
			var toSquare = move.replace(/=[BKQNR][+\#]?/g,'');
			toSquare = toSquare.replace(/[\#+]/g,'');
			toSquare = toSquare.substr(toSquare.length-2,2);
            if(moveInfo.promote){
                moveInfo.fromRank = '7';
                move = move.replace(/([a-h])x([a-h])=/,'$1x$2' + 8 + '=');
                toSquare = toSquare.replace(/[^a-h]/g,'') + '8';
            }
		}

		// Remember: exf6 could mean that pawn takes pawn on f5 (en passant)
		if(moveInfo.pawnMove){
			var numericPos = move.replace(/[^0-9]/g,'');
            if(moveInfo.promote){
                numericPos = '7';
            }
			if(!moveInfo.capture){
				var pieceIndex = this.__movePawnForward(move,color);
				if(pieceIndex||pieceIndex==0)this.__movePieceToLocation(color,pieceIndex,move);
			}else{
				var pieceIndex = this.__movePawnCapture(move,moveInfo.fromFile,color,true);
			}
			if(moveInfo.promote){
				var obj = this.pieces[color][pieceIndex];
				var promoteTo = move.replace(/[^NBRQ]/g,'').toLowerCase();
				this.__removePieceFromBoard(pieceIndex,color);
				var ind = this.__createPieceByPromotion(obj.file,obj.rank,color,promoteTo);
				this.lastMovePawnPromote = true;
			}
		}
		if(moveInfo.officer){
			var pieceType = move.substr(0,1).toLowerCase();
			if(moveInfo.capture){
				var el = this.__getPieceOnSquare(toSquare,opositeColor);
				this.__removePieceFromBoard(el,opositeColor);
			}
			this.__moveOfficer(toSquare,color,moveInfo.fromFile,moveInfo.fromRank,pieceType);
		}
		if(moveInfo.castle){
			var matches = move.match(/\-/g);
			var rank = (color=='white')?1:8;
			if(matches.length>1){	/* Long castle */
                this.__moveOfficer('c' + rank,color,false,false,'k', true);
                this.__moveOfficer('d' + rank,color,'a',false,'r', true);
			}else{
                this.__moveOfficer('g' + rank,color,false,false,'k', true);
                this.__moveOfficer('f' + rank,color,'h',false,'r', true);
			}
		}
	}
	,
	/**
	*  Piece has been promoted, create a new piece and display it on the board. The pawn promoted is technically being removed from the board.
	*	@param String file, example: "e"
	*	@param Integer rank, example 8
	*	@param String color, example "white"
	*	@param String promoteTo - What to promote the piece to, example "n" for knight.
	*
	* @private
	*/
	__createPieceByPromotion : function(file,rank,color,promoteTo)
	{
		if(color=='white')color='w'; else color='b';
		col = this.__getColFromFile(file) + ((8-rank)*8);
		col--;
        var pos = this.__getBoardPosByCol(col);

        var el = new Element('div', {
           'class' : 'DG-chess-piece',
           styles : {
               width : this.layout.squareSize,
               height : this.layout.squareSize,
               position : 'absolute',
               left : pos.x,
               top : pos.y,
               display : this.animateNextMove ? 'none' : ''
           }
        });
		this.els.board.adopt(el);

		var img = new Element('img', {
           src : this.layout.imageFolder + this.layout.chessSet + this.layout.squareSize  + color + promoteTo.toLowerCase() + '.png'
        });
		el.adopt(img);
		if(this.isOldMSIE && !this.isOpera)this.correctPng(img);
		var index = this.__addPieceToArray(color,promoteTo,col,el);
		this.__addEventToChessPiece(el,color,index);
		return index;

	}
	,
	/**
	*  Move officer
	*	@param String toSquare, example: "e4"
	*	@param String color, example "white"
	*	@param String fromFile, example "e"
	*	@param Integer fromRank, example 8
	*	@param String pieceType, example "b" for bishop
	*
	* @private
	*/
	__moveOfficer : function(toSquare,color,fromFile,fromRank,pieceType, forceMove){
		for(i=0;i<this.pieces[color].length;i++){
			var obj = this.pieces[color][i];
			if(fromFile && obj.file!=fromFile)continue;
			if(fromRank && obj.rank!=fromRank)continue;
			if(obj.pieceType==pieceType){	// Matching piece found
				if(forceMove || this.__canPieceMoveToSquare(color,i,toSquare)){	/* Correct piece found */
					this.__movePieceToLocation(color,i,toSquare);
					return;
				}
			}
		}
	}
	,
	/**
	*  Return trure if a specific piece can move to a given square.
	*	@param color color of piece
	*	@param Integer index, Index of piece in the piece array - color and index is used to get a reference to the piece.
	*	@param String toSquare, whcih square to move to, example "h4"
	*
	* @private
	*/
	__canPieceMoveToSquare : function(color,index,toSquare,recursive) {
		var opositeColor = color=='white'?'black':'white';
		var obj = this.pieces[color][index];
		if(!obj.onBoard)return false;
		var toPos = this.__getColAndRowFromSquare(toSquare);
		var currCol = this.__getColFromFile(obj.file);
		var currRow = obj.rank;

		var diffTo = Math.max(toPos.col,currCol) - Math.min(toPos.col,currCol);
		var diffFrom = Math.max(toPos.row,currRow) - Math.min(toPos.row,currRow);


		if(obj.pieceType=='b' || obj.pieceType=='q'){	// Bishop - piecetypes are all in lower case
			if(diffTo == diffFrom){
				if(!this.__occupiedSquaresBetween({ 'col':toPos.col,'row':toPos.row },{ 'col':currCol,'row':currRow } )){
					if(recursive)return true;
					if(!this.__isMovingIntoCheckByMovingThisPiece(obj,color,toSquare))return true;
				}
			}
		}
		if(obj.pieceType=='r' || obj.pieceType=='q'){	/* rook */
			if(diffTo==0 || diffFrom==0){
				if(!this.__occupiedSquaresBetween({ 'col':toPos.col,'row':toPos.row },{ 'col':currCol,'row':currRow } )){
					if(recursive)return true;
					if(!this.__isMovingIntoCheckByMovingThisPiece(obj,color,toSquare))return true;
				}
			}
		}
		if(obj.pieceType=='k'){	/* King */
			return true;
		}
		if(obj.pieceType=='n'){
			if(diffFrom==2 && diffTo==1){
				if(recursive)return true;
				if(!this.__isMovingIntoCheckByMovingThisPiece(obj,color,toSquare))return true;
			}
			if(diffTo==2 && diffFrom==1){
				if(recursive)return true;
				if(!this.__isMovingIntoCheckByMovingThisPiece(obj,color,toSquare))return true;

			}
		}
		return false;
	}
	,
	/**
	*  Return true if a specific move results in a check position, i.e. invalid move
	*	@param Object pieceObj - Reference to piece to move
	*	@param String color - color of king to check
	*	@param String toSquare - To which square
	*
	* @private
	*/
	__isMovingIntoCheckByMovingThisPiece : function(pieceObj,color,toSquare) {
		var checkBefore = this.__isKingInCheck(color);
		if(checkBefore)return false;

		pieceObj.onBoard=false;	// Temporary "removing" the piece from the board
		var opositeColor = color=='white'?'black':'white';
		var elOnDestSquare = this.__getPieceOnSquare(toSquare,opositeColor);	// If there's a piece on the destination square, we need to temporary remove that piece too.
		if(elOnDestSquare || elOnDestSquare===0){
			this.pieces[opositeColor][elOnDestSquare].onBoard=false;
		}
		var checkAfter = this.__isKingInCheck(color);


		pieceObj.onBoard = true;
		if(checkAfter){	/* Is in check after ? */
			var savedFile = pieceObj.file;
			var savedRank = pieceObj.rank;

			pieceObj.file = toSquare.substr(0,1);
			pieceObj.rank = toSquare.substr(1,1);

			var checkAfter = this.__isKingInCheck(color);

			pieceObj.file = savedFile;
			pieceObj.rank = savedRank;
		}

		if(elOnDestSquare || elOnDestSquare===0){
			this.pieces[opositeColor][elOnDestSquare].onBoard=true;
		}

		return checkAfter;
	}
	,
	/**
	*  Return true if move of a piece results in check, i.e. invalid move
	*	@param Integer index, Index of piece in the piece array - color and index is used to get a reference to the piece.
	*
	* @private
	*/
	__isKingInCheck : function(color){
		var kingObj;
		for(var i=0;i<this.pieces[color].length;i++){
			if(this.pieces[color][i].pieceType=='k'){
				kingObj = this.pieces[color][i];
				break;
			}
		}

		var kingRow = kingObj.rank;
		var kingCol = this.__getColFromFile(kingObj.file);

		var opositeColor = color=='white'?'black':'white';
		for(var i=0;i<this.pieces[opositeColor].length;i++){ 	/* Find bishop,rooks and queens and check if they put the king in check if the piece sent to this method moves */
			var piece = this.pieces[opositeColor][i];
			if(!piece.onBoard)continue;
			if(piece.pieceType=='b' || piece.pieceType=='q' || piece.pieceType=='r'){
				var ret = this.__canPieceMoveToSquare(opositeColor,i,kingObj.file+kingObj.rank,true);
				if(ret){
					return true;
				}
			}
		}
		return false;
	}
	,
	/**
	* Return true if there are occupied squares on the line between fromSquare and toSquare
	* from and to are associative arrays of rows and cols (numeric
	*	@param Object from, Object of row and col, i.e. numeric file and rank.
	*	@param Object to, Object of row and col, i.e. numeric file and rank.
	*
	* @private
	*/
	__occupiedSquaresBetween : function(from,to) {
		var squares = this.__getSquaresBetween(from,to);
		for(var squareCounter=0;squareCounter<squares.length;squareCounter++){
			var el = this.__getPieceOnSquare(squares[squareCounter],'white');
			if(el || el===0)return true;
			var el = this.__getPieceOnSquare(squares[squareCounter],'black');
			if(el || el===0)return true;
		}
		return false;

	}
	,
	/**
	* Return array of squares between a and b.
	*	@param Object from, associative array of row and col, i.e. numeric file and rank.
	*	@param Object to, associative array of row and col, i.e. numeric file and rank.
	*
	* @private
	*/
	__getSquaresBetween : function(from,to)	{
		var retArray = new Array();
		if(from.row==to.row){	/* Same rank */
			var min = Math.min(from.col,to.col)+1;
			var max = Math.max(from.col,to.col)-1;
			if(max<min==1)return false;
			for(var counter=min;counter<=max;counter++){
				retArray[retArray.length] = this.__getFileByCol(counter) + '' + to.row;
			}
			return retArray;
		}else if(from.col==to.col){	/* Same file */
			var file = this.__getFileByCol(from.col);
			var min = Math.min(from.row,to.row)+1;
			var max = Math.max(from.row,to.row)-1;
			if(max<min==1)return false;
			for(var counter=min;counter<=max;counter++){
				retArray[retArray.length] = file + '' + counter;

			}
			return retArray;
		}else{	/* Diagonals */
			var moveX = 1;
			var moveY = 1;
			if(from.col>to.col)moveX = -1;
			if(from.row>to.row)moveY = -1;

			var min = Math.min(from.col,to.col);
			var max = Math.max(from.col,to.col);
			var diff = max-min;
			for(var counter=1;counter<diff;counter++){
				var file = 	from.col + (counter*moveX);
				var rank = from.row + (counter*moveY);
				file = this.__getFileByCol(file);
				retArray[retArray.length] = file + '' + rank;

			}
			return retArray;
		}
	}
	,
	/**
	*  Move pawn forward on the board(i.e. straight forward, not capture).
	*	@param String move, which move.
	*	@param color, color of piece to move.
	*
	* @private
	*/
	__movePawnForward : function(move,color) {
		move = move.replace(/[^0-9a-h]/g,'');
		var file = move.replace(/[0-9]/g,'');
		var rank = move.replace(/[^0-9]/g,'');

		for(var no=0;no<this.pieces[color].length;no++){
			var obj = this.pieces[color][no];
			if(!obj.onBoard)continue;
			var rankMatch = false;
			if(color=='white' && obj.rank<rank)rankMatch=true;
			if(color=='black' && obj.rank>rank)rankMatch=true;
			var maxRankDiff = 1;

			if(color=='white'){
				if(rank==4)maxRankDiff=2;
				if(rank-obj.rank>maxRankDiff)rankMatch=false;
			}
			if(color=='black'){
				if(rank==5)maxRankDiff=2;
				if(obj.rank - rank>maxRankDiff)rankMatch=false;
			}
			if(rankMatch){	/* Check for occupied squares between this pawn and the destination. if found, this is not the right pawn to move */
				var colFrom = this.__getColFromFile(file);
				var colTo = this.__getColFromFile(obj.file);
				if(this.__occupiedSquaresBetween({ 'col':colFrom,'row':rank },{ 'col':colTo,'row':obj.rank } )){
					rankMatch = false;
				}
			}
			if(obj.pieceType=='p' && obj.file==file && rankMatch){
				return no;
			}
		}
		return false;
	}
	,
	/**
	*  Move pawn forward by capturing another piece.
	*	@param String move, which move.
	*	@param String fromFile, from which file, example: "e".
	*	@param color, color of piece to move.
	*
	* @private
	*/
	__movePawnCapture : function(move,fromFile,color,removePiece){
		var opositeColor = (color=='white')?'black':'white';
		var capturedSquare = move.replace(/.*?x([a-z][1-8]).*/g,'$1');
		var el = this.__getPieceOnSquare(capturedSquare,opositeColor);
		var retVal = this.__movePawn(fromFile,capturedSquare,color,removePiece);
		if(el || el===0){
			if(removePiece)this.__removePieceFromBoard(el,opositeColor);
		}else{	/* En passant */
			this.lastMoveEnPassant = true;
			var file = capturedSquare.substr(0,1);
			var rank = capturedSquare.substr(1,1);
			if(color=='white')rank--; else rank++;
			capturedSquare  = file + '' + rank;
			var el = this.__getPieceOnSquare(capturedSquare,opositeColor);
			if(el && removePiece)this.__removePieceFromBoard(el,opositeColor);
		}
		return retVal;
	}
	,
	/**
	*  Move pawn one step forward - this method is called by the __movePawnCapture method.
	*	@param String fromFile, from which file, example: "e".
	*	@param String toSquare - to which square, example: "d5"
	*	@param color, color of piece to move.
	*
	* @private
	*/
	__movePawn : function(fromFile,toSquare,color,removePiece)	{
		var rank = toSquare.substr(1,1)/1;
		if(color=='white')rank--; else rank++;
		var index = this.__getPieceOnSquare(fromFile+rank,color);
		if(removePiece)this.__movePieceToLocation(color,index,toSquare);
		return index;
	}
	,
	/**
	*  return index of piece on a specific square
	*	@param String square - which square, example: "d5"
	*	@param String color, piece of which color, example "white"
	*
	* @private
	*/
	__getPieceOnSquare : function(square,color)	{
		var file = square.substr(0,1);
		var rank = square.substr(1,1);
		for(no=0;no<this.pieces[color].length;no++){
			var obj = this.pieces[color][no];
			if(!obj.onBoard)continue;
			if(obj.file==file && obj.rank==rank && obj.onBoard)return no;
		}
		return false;
	}
	// }}}
	,
	// {{{ __onAnimatedMoveComplete()
	/**
	*  Callback executed on move complete - This method is only executed after an animated move.
	*
	* @private
	*/
	__onAnimatedMoveComplete : function() {

        this._executeEvent('aftermove');
		var lastMove = this.__getLastMove();
		var lastPlayedMove = this.__getLastPlayedMove();
		this.__playSound();
		if(lastMove.color==lastPlayedMove.color && lastMove.move==lastPlayedMove.move){
            this._executeEvent('afterlastmove');

        }
	}
	,
	/**
	*  Move a piece to a new location on the board and update array(i.e. where the position of each piece is stored)
	*	@param String color, piece of which color, example "white"
	*	@param Integer index - piece with which index in the array
	*	@param String toSquare - Move to which square, example: "d5"
	*
	* @private
	*/
	__movePieceToLocation : function(color,index,toSquare)	{
		var pos = this.__getBoardPosByNotation(toSquare);

		var el = this.pieces[color][index].el;
		this.currentZIndex++;
		el.style.zIndex = this.currentZIndex;
		var fromPos = this.__getBoardPosByNotation(this.pieces[color][index].file + this.pieces[color][index].rank);
		this.coordLastMove.from.x = fromPos.x;
		this.coordLastMove.from.y = fromPos.y;

		this.coordLastMove.to.x = pos.x;
		this.coordLastMove.to.y = pos.y;

		if(this.animateNextMove){/* Animate move */
			this.isBusy = true;
			var currLeft = el.style.left.replace('px','')/1;
			var currTop = el.style.top.replace('px','')/1;

			this.__slideElement(
				{ 'x':pos.x,'y':pos.y }
				,
				index,
				color
			)
		}else{
			el.style.left = pos.x + 'px';
			el.style.top = pos.y + 'px';
		}
		this.__updatePieceRankFileByPosition(index,color,{'x':pos.x,'y':pos.y});
	}
	,
	/**
	*  Move element to new location by sliding. this method is called a number of times and it moves the piece step by step from a to b
	*	@param Object from - associative array with keys "x" and "y" (pixels)
	*	@param Object to - associative array with keys "x" and "y" (pixels)
	*	@param Integer index - index of piece in the array
	*	@param String color - color of piece, example "white"
	*
	* @private
	*/
    __slideElement : function(to,index,color,dragDropVar,end,timeVar){
        var animationTime = to.animationTime ? to.animationTime : this.behaviour.animationTime;
        var myFx = new Fx.Morph(this.pieces[color][index].el, {
            duration : animationTime * 1000
        });
        myFx.addEvent('complete', function(){
            this.__slideElementComplete( to, index, color, dragDropVar, end, timeVar);
        }.bind(this));
        myFx.start({
            'left' : [ this.pieces[color][index].el.getStyle('left') , to.x ],
            'top' : [ this.pieces[color][index].el.getStyle('top') , to.y  ]
        });
    }   ,
	__slideElementComplete : function(to,index,color,dragDropVar,end,timeVar){
        if(!dragDropVar){
            this.animateNextMove = false;
            this.__highlightLastMove();
            this.isBusy = false;
            var opositeColor = (color=='white')?'black':'white';
            var toSquare = this.__getNotationByBoardPos(to.x,to.y);
            var pieceIndex = this.__getPieceOnSquare(toSquare,opositeColor);
            if(pieceIndex || pieceIndex===0){
                this.__removePieceFromBoard(pieceIndex,opositeColor);
            }else{
                if(this.lastMoveEnPassant){
                    if(opositeColor=='black'){
                        toSquare = toSquare.substr(0,1) + (toSquare.substr(1,1)/1-1);
                    }else{
                        toSquare = toSquare.substr(0,1) + (toSquare.substr(1,1)/1+1);
                    }
                    var pieceIndex = this.__getPieceOnSquare(toSquare,opositeColor);
                    this.__removePieceFromBoard(pieceIndex,opositeColor);
                }
            }
            if(this.lastMovePawnPromote){
                var pieceIndex = this.__getPieceOnSquare(toSquare,color);
                this.__removePieceFromBoard(pieceIndex,color);
                var pieceIndex = this.__getPieceOnSquare(toSquare,color);
                this.pieces[color][pieceIndex].el.style.display='block';
            }

            var moveComplete=true;
            if(this.pieces[color][index].pieceType=='k'){
                var lastMove = this.__getLastPlayedMove();
                if(lastMove.moveString=='O-O' || lastMove.moveString=='O-O-O' || lastMove.moveString=='0-0' || lastMove.moveString=='0-0-0')moveComplete = false;
            }
            if(moveComplete)this.__onAnimatedMoveComplete();

            if(this.autoPlayActive){
                var moveDetails = this.__getNextMove();
                var autoplayDelay = this.__getAutoPlayDelayBeforeNextMove();
                if(this.behaviour.autoplay.stopBeforeComments && this.pgnObject.gameDetails[this.currentGameIndex].moves[this.currentMove][this.currentColor].comment){
                    this.stopAutoPlay();
                    return;
                }
                this.__autoPlayStep.delay(autoplayDelay, this, [moveDetails.move, moveDetails.color]);
            }
        }else{
            if(dragDropVar!='sameSquare'){
                this._executeEvent('wrongemove');

            }else {
                this.__playSound('move');
            }
        }

	}
	,
	/**
	*  Removing a piece from the board by hiding it and by setting the "onBoard" attribute to false.
	*	@param Integer pieceIndex - index of piece in the array
	*	@param String color - color of piece, example "white"
	*
	* @private
	*/
	__removePieceFromBoard : function(pieceIndex,color)	{
		if(this.animateNextMove)return;
		try{
			this.pieces[color][pieceIndex].onBoard=false;
			this.pieces[color][pieceIndex].el.style.display='none';
		}catch(e){

		}
	}
	,
	/**
	*  Update rank and file of position based on x and y coordinates (pixel)
	*
	* @private
	*/
	__updatePieceRankFileByPosition : function(pieceIndex,color,position) {
		var files = 'abcdefgh';
		var file = position.x / this.layout.squareSize;
		var rank = position.y / this.layout.squareSize;
		rank = 8-rank;
		if(this.flipBoard){
			file = 7-file;
			rank = 9-rank;
		}
		file = files.substr(file,1);
		this.pieces[color][pieceIndex].file = file;
		this.pieces[color][pieceIndex].rank = rank;

	}
	,
	/**
	*  Indicate last move with a rectangle around the two squares
	*
	* @private
	*/
	__highlightLastMove : function()	{
		if(!this.els.indicators.from.parentNode){
            this.__createIndicators();
        }
		if(this.behaviour.highlightLastMove && !this.animateNextMove){
            this.__showIndicators();
		}else{
			this.__hideIndicators();
		}

		try{
            var borderWidth = this.els.indicators.to.getStyle('border-left-width').replace('px','')/1;
		}catch(e){
			var borderWidth = 2;
		}

		if(!borderWidth)borderWidth = (this.els.indicators['from'].offsetWidth - this.els.indicators['from'].clientWidth) /2;

		var size = this.layout.squareSize - (borderWidth*2);
		if(this.coordLastMove.x || this.coordLastMove.y || this.coordLastMove.to.x || this.coordLastMove.to.y) {
            this.els.indicators.from.setStyles({
                left : this.coordLastMove.from.x,
                top : this.coordLastMove.from.y,
                width : size,
                height : size
            });

            this.els.indicators.to.setStyles({
                left : this.coordLastMove.to.x,
                top : this.coordLastMove.to.y,
                width : size,
                height : size
            });
		}else{
			this.__hideIndicators();
		}
	}
	,
	/**
	*  Hide rectangle indicators
	*
	* @private
	*/
	__hideIndicators : function()	{
		this.els.indicators.from.style.display='none';
		this.els.indicators.to.style.display='none';
	}
    ,
    __showIndicators : function() {
		this.els.indicators.from.style.display='block';
		this.els.indicators.to.style.display='block';
    }
	,
	/**
	*  Specify if board labels(A-H,1-8) should be displayed or not
	*
	*	@param Boolean boardLabels
	*	@deprecated
	* @private
	*/
	setBoardLabels : function(boardLabels)	{
		this.layout.boardLabels = boardLabels;
	}
	,
	/**
	*  Display board pieces based on fen string.
	*
	*	@param Boolean boardLabels
	* @public
	*/
	displayBoardByFen : function(fenString,element) {
		//element = $(element);
		//element.innerHTML = '';
		//this.__createBoardDiv(element);
        this.__clearPieces();
		this.__loadFen(fenString,this.els.board );
		this.__hideIndicators();
	}
	,
	/**
	*  Set who to start move from result
	*
	* @private
	*/
	__setWhoToMoveFromResult : function(){
		var res = this.pgnObject.gameDetails[this.currentGameIndex].result;
		res = res.trim();
		if(res=='0-1'){
            this.whoToStartMove='b';
        } else {
            this.whoToStartMove='w';
        }
	}
	,
	/**
	*  Set who to start move from fen string, i.e. the first player to move.
	*
	* @private
	*/
	__setWhoToMoveFromFen : function(fenString)	{
		try{
			var items = fenString.split(/\s/g);
            if(items.length>1){
			    this.whoToStartMove = items[1].trim();
            }else{
                this.whoToStartMove = 'w';
            }
		}catch(e){
			alert('Unable to parse FEN string');
			return 'w';
		}
	}
	,
	/**
	*  Clear pieces from the board
	*
	* @private
	*/
	__clearBoard : function()	{
		this.parentRef.innerHTML = '';
		this.__createBoardDiv();
		this.els.board.innerHTML = '';
		this.__createSquares(this.els.board);
		if(!this.whoToStartMove)this.whoToStartMove='w';
		this.currentMove = 1;
		this.currentColor = this.whoToStartMove;
		this.currentMoveNumber = 1;
	}
	,
	/**
	*  Create pieces and put them in the startup position
	*
	* @private
	*/
	__createDefaultPieces : function()	{
        this.__clearPieces();
        
		this.pieces = new Array();
		this.pieces['white'] = new Array();
		this.pieces['black'] = new Array();

 		var boardPieces = [ 'rnbqkbnrpppppppp', 'pppppppprnbqkbnr' ];

        for(var i=0;i<boardPieces.length;i++){
            strPieces = boardPieces[i];
            var color = i == 0 ? 'b' : 'w';
            for(var no=0;no<strPieces.length;no++){
                var character = strPieces.substr(no,1);
                var pos = this.__getBoardPosByCol(i== 0 ? no : no + 48);

                var el = new Element('div', {
                    'class': 'DG-chess-piece',
                    styles : {
                        'left' : pos.x,
                        'top' : pos.y,
                        'width' : this.layout.squareSize,
                        'height' : this.layout.squareSize,
                        'position' : 'absolute',
                        'background-image' : (this.isMSIE) ? 'none' : 'url("' + this.layout.imageFolder + this.layout.chessSet + this.layout.squareSize  + color + character.toLowerCase() + '.png")'
                    }
                });
                this.els.board.adopt(el);

                if(this.isMSIE){
                    var img = new Element('img',{
                       'src' : this.layout.imageFolder + this.layout.chessSet + this.layout.squareSize  + color + character.toLowerCase() + '.png'
                    });
                    el.adopt(img);
                    if(this.isOldMSIE && !this.isOpera)this.correctPng(img);
                }

                var pieceIndex = this.__addPieceToArray(color,character.toLowerCase(),(i== 0 ? no : no + 48),el);
                this.__addEventToChessPiece(el,color,pieceIndex);
            }
        }


	}
	,
    __clearPieces : function(){
        var els = this.els.board.getElements('.DG-chess-piece');
          for(var i=0;i<els.length;i++){
             els[i].destroy();
         }
		if(!this.whoToStartMove)this.whoToStartMove='w';
		this.currentMove = 1;
		this.currentColor = this.whoToStartMove;
		this.currentMoveNumber = 1;

    },
	/**
	*  Add a piece to the array of pieces
	*
	* @private
	*/
	__addPieceToArray : function(color,type,col,el)	{
		if(color=='w')color='white';
		if(color=='b')color='black';
		var ind = this.pieces[color].length;
        var pos = this.__getRankFileByCol(63-col);

        this.pieces[color][ind] = {
            'pieceType' : type,
            'file' : pos.file,
            'rank' : pos.rank,
            'el' : el,
            'onBoard' : true
        };
		return ind;
	}
	,
	/**
	*  Create main div element(s) for the chess board
	*	@param Object element - where to insert the board.
	*
	* @private
	*/
	__createBoardDiv : function(element) {

		if(!element)element = this.parentRef;
        element = $(element);

        var boardOuter = new Element('div', {
            'class' : 'ChessBoard' + this.layout.squareSize,
            'id' : this.__getUniqueId(),
            'styles' : {
                'position' : 'relative'
            }
        });

		this.labelDivRef = boardOuter.id;

        var board = new Element('div', {
            'class' : 'ChessBoardInner' + this.layout.squareSize,
            'styles' : {
                'position' : 'relative',
                'left' : 0,
                'top' : 0,
                'width' : (this.layout.squareSize*8),
                'height' : (this.layout.squareSize*8)
            }

        });

		this.els.board = board;
		this.els.board.addEvent('selectstart', this.__cancelEvent);

        this.boardFrame = new Element('div', {
            'class' : 'ChessBoardFrame' + this.layout.squareSize
        });

		this.boardFrame.adopt(board);
		boardOuter.adopt(this.boardFrame);
		element.adopt(boardOuter);

		if(this.layout.boardLabels)this.__addBoardLabels(boardOuter);
		this.__createSquares(this.els.board);
		this.__createIndicators();
		return board;
	}
	,
	/**
	*	Returns an unique id
	*	@return String identificator
	*	@private
	*/
	__getUniqueId : function() {
		var ret = 'UID' + Math.random() + '' + Math.random();
		return ret.replace(/\./g,'');
	}
	,
	/**
	*	Displays board labels 0-8,A-H around the table
	*	@public
	*/
	showBoardLabels : function() {
		var el = $(this.labelDivRef);
		this.layout.boardLabels = true;
		this.__addBoardLabels(el);
	}
	,
	/**
	*	Hides the board labels from the board
	*	@public
	*/
	hideBoardLabels : function() {
		this.layout.boardLabels = false;
		var el = $(this.labelDivRef);
		var subDivs = el.getElementsByTagName('DIV');
		for(var i=0;i<subDivs.length;i++) {
			if(subDivs[i].className.indexOf('ChessBoardLabel')>=0) {
				el.removeChild(subDivs[i]);
				i--;
			}
		}
	}
	,
	/**
	*  Create div elements for the squares on the board
	*	@param Object board - Reference to the board div.
	*
	* @private
	*/
	__createSquares : function(board) {

		currentBgColor = this.layout.colorLightSquares;
		currentBgImg = this.layout.bgImageLightSquares;
		currentClass = 'chessBoardSquare_light';

		var lightIsArray = false;
		var darkIsArray = false;
		if(this.__isArray(this.layout.bgImageLightSquares))lightIsArray = true;
		if(this.__isArray(this.layout.bgImageDarkSquares))darkIsArray = true;

		var countLightSquares = 0;
		var countDarkSquares = 0;
		for(no=1;no<=64;no++){
            var square = new Element('div',{
                 'class' : currentClass,
                 styles : {
                     'float' : 'left',
                     'width' : this.layout.squareSize,
                     'height' : this.layout.squareSize,
                     'background-color' : currentBgColor ? currentBgColor : null,
                     'background-image' : currentBgImg ? 'url(\'' + currentBgImg + '\')' : 'none'
                 }
            });

			board.adopt(square);
			val = (no + Math.floor(no/8))%2;
			if(val==0){
				currentBgColor = this.layout.colorLightSquares;
				currentBgImg = this.layout.bgImageLightSquares;
				if(lightIsArray)currentBgImg = this.layout.bgImageLightSquares[Math.floor(Math.random()*this.layout.bgImageLightSquares.length)];
				else currentBgImg = this.layout.bgImageLightSquares;
				currentClass = 'chessBoardSquare_light';
				currentClass = currentClass + ' chessBoardSquare_light_no' + (no%8);
			}else{
				currentBgColor=this.layout.colorDarkSquares;
				if(darkIsArray)currentBgImg = this.layout.bgImageDarkSquares[Math.floor(Math.random()*this.bgImageDarkSquares.length)];
				else currentBgImg = this.layout.bgImageDarkSquares;
				currentClass = 'chessBoardSquare_dark';
				currentClass = currentClass + ' chessBoardSquare_dark_no' + (no%8);
			}
		}

	}
	,
	/**
	*  Create board labels(A-H, 1-8) around the table.
	*	@param Object boardOuter - Reference to the board div(the outer div).
	*
	* @private
	*/
	__addBoardLabels : function(boardOuter) {
		var letters = 'ABCDEFGH';

		var borderWidth = this.els.board.getStyle('border-left-width').replace('px','')/1;

		var posDiff = borderWidth;
		try{
			var left = this.els.board.getPosition().x;
			var leftOuter = this.boardFrame.getPosition().x;
			posDiff += left - leftOuter;
		}catch(e){

		}

		for(var no=1;no<=8;no++){
            var file = new Element('div', {
                'class' : 'ChessBoardLabel ChessBoardLabel'+this.layout.squareSize,
                'id' : 'ChessBoardLabel_' + letters.substr((no-1),1),
                html : letters.substr((no-1),1),
                styles :{
                    'position' : 'absolute',
                    'right' : (((8-no) * this.layout.squareSize) + posDiff),
                    'bottom' : 0,
                    'text-align' : 'center',
                    'width' : this.layout.squareSize
                }
            });
			boardOuter.adopt(file);

            var rank = new Element('div',{
                 html : no,
                 'id' : 'ChessBoardLabel_' + no,
                 'class' : 'ChessBoardLabel ChessBoardLabel'+this.layout.squareSize,
                 styles : {
                     'position' : 'absolute',
                     'left' : 0,
                     'top' : (((8-no) * this.layout.squareSize) + posDiff),
                     'height' : this.layout.squareSize,
                     'line-height' : this.layout.squareSize
                 }
            });

			boardOuter.adopt(rank);

			if(this.flipBoard){
				rank.innerHTML = 9-no;
				file.innerHTML = letters.substr((8-no),1);
			}
		}
	}
	,
	/**
	*  Load Forsyth-Edwards Notation (FEN)
	*
	* @private
	*/
	__loadFen : function(fenString,boardEl)	{
		this.__setWhoToMoveFromFen(fenString);
        
		var items = fenString.split(/\s/g);
		var pieces = items[0];

		this.pieces = new Array();
		this.pieces['white'] = new Array();
		this.pieces['black'] = new Array();

		var currentCol = 0;
		for(var i=0;i<pieces.length;i++){
			var character = pieces.substr(i,1);
			var characters = pieces.substr(i,2);

            if(characters.match(/\d\d/)){
                currentCol+=characters/1;
                i++;
            }
			else if(character.match(/[A-Z]/i)){
				var boardPos = this.__getBoardPosByCol(currentCol);

                var piece = new Element('div',{
                    'class': 'DG-chess-piece',
                    styles : {
                        position : 'absolute',
                        left : boardPos.x,
                        top : boardPos.y
                    }
                });

				if(character.match(/[A-Z]/)){	/* White pieces */
					var color = 'w';
				}
				if(character.match(/[a-z]/)){	/* Black pieces */
					var color = 'b';
				}

                var img = new Element('img',{
                    src :  this.layout.imageFolder + this.layout.chessSet + this.layout.squareSize  + color + character.toLowerCase() + '.png'
                });
				piece.adopt(img);

				boardEl.appendChild(piece);
				var pieceIndex = this.__addPieceToArray(color,character.toLowerCase(),currentCol,piece);
				this.__addEventToChessPiece(piece,color,pieceIndex);
				currentCol++;
				if(this.isOldMSIE && !this.isOpera)this.correctPng(img);
			}else{
			    if(character.match(/[0-8]/))currentCol+=character/1;
            }
		}
	}
	,
	__addEventToChessPiece : function(el,color,pieceIndex){
        var ind = this.objectIndex;
		el.setAttribute('objectIndex',ind);
		el.setAttribute('color',color);
		el.setAttribute('pieceIndex',pieceIndex);

        el.addEvent('mousedown', this.__mouseDownOnChessPiece.bind(this));
        el.addEvent('selectstart', this.__cancelEvent);
        el.addEvent('dragstart', this.__cancelEvent);
	}
	,
	/**
	*  Return last played move
	*	Internal note: This method will return wrong values when you click on a move, i.e. uses the goToMove
	*
	* @private
	*/
	__getLastPlayedMove : function()
	{
		var ret = new Object();
		if(this.insideVariation){
			ret.color = this.currentVariationColor;
			ret.move = this.currentVariationMove;
			try{
				ret.moveString = this.pgnObject.gameDetails[this.currentGameIndex].moves[this.insideVariation.move][this.insideVariation.color].variation[this.insideVariation.variationIndex][this.currentVariationMove][this.currentVariationColor];
			}catch(e){

			}
		}else{
			ret.color = this.currentColor;
			ret.move = this.currentMove;
			try{
				ret.moveString = this.pgnObject.gameDetails[this.currentGameIndex].moves[this.currentMove][this.currentColor].move;
			}catch(e){
				// Move does not exists
			}
		}

		return ret;
	}
	,
	/**
	*  Return move and color for the next move.
	*
	* @private
	*/
	__getNextMove : function()
	{
		if(this.currentGameIndex===false)return { move:0,color:'white' };
		var ret = new Object();
		if(this.insideVariation){
			var move = this.currentVariationMove;
			var color = this.currentVariationColor;

		}else{
			var move = this.currentMove;
			var color = this.currentColor;
		}
		if(move==0){	// At the start of a game
			move = 1;
			color='white';
			if(!this.pgnObject.gameDetails[this.currentGameIndex].moves[1])color='white';// No moves at all
			else if(!this.insideVariation && !this.pgnObject.gameDetails[this.currentGameIndex].moves[1]['white'])color='black';
		}else{
			if(color=='black'){
				color='white';
				move++;
			}else{
				color='black';
			}
		}
		ret.move = move;
		ret.color = color;
		var notationNextMove;
		try{
			if(this.insideVariation){
				notationNextMove = this.pgnObject.gameDetails[this.currentGameIndex].moves[this.insideVariation.move][this.insideVariation.color].variation[this.insideVariation.variationIndex][move][color];

			}else{
				notationNextMove = this.pgnObject.gameDetails[this.currentGameIndex].moves[move][color].move;
			}
		}catch(e){
			return ret; // Move does not exists, we're at the end of the game.
		}

        notationNextMove = notationNextMove.replace(/[\!\?]/g,'');

		var squareInfo = this.__getSquareAndPieceByNotation(notationNextMove,color);
		var moveInfo = this.__getInfoByMoveString(notationNextMove,color);

		ret = moveInfo;

		ret.notation = notationNextMove;
		ret.toSquare = squareInfo.square;
		ret.pieceType = squareInfo.pieceType;
		if(moveInfo.pawnMove)ret.pieceType='p';
		ret.move = move;
		ret.color = color;
		return ret;

	}

	,
	// {{{ __getSquareAndPieceByNotation()
	/**
	*  Return an object of square and piece by a notation, example Nxf6+ returns pieceType 'n' and toSquare '
	*
	* @private
	*/
	__getSquareAndPieceByNotation : function(notation,color)
	{
		var ret = new Object();
		notation = notation.trim();
		notation = notation.replace(/[\+#]/g,'');
		if(notation=='0-0' || notation=='O-O'){
			ret.pieceType='k';
			if(color=='white')ret.square= 'g1'; else ret.square='g8';
			return ret;
		}
		if(notation == '0-0-0' || notation == 'O-O-O'){
			ret.pieceType='k';
			if(color=='white')ret.square= 'c1'; else ret.square='c8';
			return ret;
		}
		var piece = notation.replace(/[^BKQNR]/g,'');
		if(!piece)piece='p';
		piece = piece.toLowerCase();
		var toSquare = notation.replace(/=[BKQNR][+\#]?/g,'');
		toSquare = toSquare.replace(/[\#+]/g,'');
		ret.square = toSquare.substr(toSquare.length-2,2);
		ret.pieceType = piece;
		return ret;
	}
	// }}}
	,
	// {{{ __getFileByCol()
	/**
	*  Return a-h from column number
	*
	* @private
	*/
	__getFileByCol : function(col)
	{
		var files = 'abcdefgh';
		return files.substr(col-1,1);
	}
	// }}}
	,
	// {{{ __getColFromFile()
	/**
	*  Return column(1-8) from file(a-h)
	*	@param String file - (a-h)
	*
	* @private
	*/
	__getColFromFile : function(file)
	{
		var files = 'abcdefgh';
		return files.indexOf(file)+1;
	}
	// }}}
	,
	// {{{ __getColAndRowFromSquare()
	/**
	*  Return column(1-8) and row(1-8) from square(example: e4)
	*	@param String square - example: "e4"
	*
	* @private
	*/
	__getColAndRowFromSquare : function(square)
	{
		var file = square.substr(0,1);
		var rank = square.substr(1,1)/1;
		file = this.__getColFromFile(file);
		var retArray = new Object();
		retArray.col = file;
		retArray.row = rank;
		return retArray;
	}
	// }}}
	,
	// {{{ __getRankFileByCol()
	/**
	*  Return rank(1-8) and file(a-h) from column(1-64)
	*	@param Integer col - example: 5 for e1(col starts at the bottom left corner)
	*
	* @private
	*/
	__getRankFileByCol : function(col)
	{
		var files = 'hgfedcba';
		var rank = 1;
		while(col>=8){
			rank++;
			col-=8;
		}

		var ret = new Object();
		ret.file = files.substr(col,1);

		ret.rank = rank;
		return ret;
	}
	// }}}
	,
	// {{{ __getNotationByBoardPos()
	/**
	*  Return notation(example e4) from board position(x and y in pixels)
	*	@param Integer x in pixels
	*	@param integer y in pixels.
	*
	* @private
	*/
	__getNotationByBoardPos : function(x,y)
	{
		var files = 'abcdefgh';
		var file = x / this.layout.squareSize;
		var rank = 8 - (y / this.layout.squareSize);
		if(this.flipBoard){
			file = 7-file;
			rank = 9-rank;

		}
		file = files.charAt(file);
		return file+rank;
	}
	// }}}
	,
	// {{{ __getBoardPosByNotation()
	/**
	*  Return square position(x and y) from notation.
	*	@param String notation, example: "e4"
	*
	* @private
	*/
	__getBoardPosByNotation : function(notation)
	{
		var files = 'abcdefgh';
		notation = notation.replace(/[^0-9a-h]/g,'');
		var y = notation.replace(/[^0-9]/gi,'')/1;
		var file = notation.replace(/[0-9]/gi,'');
		var x = files.indexOf(file)+1;

		x--;
		y = 8-y;

		if(this.flipBoard){
			x = 7-x;
			y = 7-y;
		}

		var retArray = new Object();
		retArray.x = x * this.layout.squareSize;
		retArray.y = y * this.layout.squareSize;
		return retArray;

	}
	// }}}
	,
	// {{{ __getBoardPosByCol()
	/**
	*  Starting from the top - 1-64
	*
	*	@param Integer col
	*
	* @private
	*/
	__getBoardPosByCol : function(col)
	{
		var rank = 0;
		while(col>=8){
			rank++;
			col-=8;
		}
		var retArray = new Object();

		if(this.flipBoard){
			col = 7-col;
			rank = 7-rank;
		}

		retArray.x = col* this.layout.squareSize;
		retArray.y = rank * this.layout.squareSize;
		return retArray;
	}
	// }}}
	,
	// {{{ __loadCss()
	/**
	*  Load css file dynamically
	*
	*	@param String cssFile
	*
	* @private
	*/
	__loadCss : function(cssFile)
	{
		var lt = document.createElement('LINK');
		lt.href = cssFile + '?rand=' + Math.random();
		lt.rel = 'stylesheet';
		lt.media = 'screen';
		lt.type = 'text/css';
		document.getElementsByTagName('HEAD')[0].appendChild(lt);
	}
	,
	/**
	*  Create div indicators(rectangle).
	*
	* @private
	*/
	__createIndicators : function()
	{
        this.els.indicators.from = new Element('div', {
            'class' : 'ChessMoveIndicator',
            'styles' : {
                'position' : 'absolute',
                'z-index' : 9000,
                'display' : 'none'
            }
        });
		this.els.board.adopt(this.els.indicators.from);

        this.els.indicators.to = new Element('div', {
            'class' : 'ChessMoveIndicator',
            'styles' : {
                'position' : 'absolute',
                'z-index' : 9000,
                'display' : 'none'
            }
        });
        this.els.board.adopt(this.els.indicators.to);
	}
	,
	/**
	*  Set initial properties sent to the constructor
	*	@param Object props - Associative array of properties
	*
	* @private
	*/
	__setConfigParameters : function(config) {

        config.layout = config.layout || {};
        config.els = config.els || {};
        config.behaviour = config.behaviour || {};

		if(config.layout.cssPath)this.layout.cssPath = config.layout.cssPath;
		if(config.layout.imageFolder)this.layout.imageFolder = config.layout.imageFolder;
		if(config.layout.squareSize)this.layout.squareSize = config.layout.squareSize;

        if(config.listeners){
			this.addEvents( config.listeners);
        }
        if(config.behaviour.autoplay){
            if(config.behaviour.autoplay.delay)this.behaviour.autoplay.delay = config.behaviour.autoplay.delay;
            if(config.behaviour.autoplay.delayBeforeComments)this.behaviour.autoplay.delayBeforeComments = config.behaviour.autoplay.delayBeforeComments;
            if(config.behaviour.autoplay.stopBeforeComments || config.behaviour.autoplay.stopBeforeComments===false)this.behaviour.autoplay.stopBeforeComments = config.behaviour.autoplay.stopBeforeComments;
        }
        if(config.els.parent){
			this.parentRef = $(config.els.parent);
			this.parentRef.className = 'ChessBoardParentContainer' + this.layout.squareSize;
			try{
				$(this.parentRef.parentNode).addClass('ChessBoardParentOfParentContainer' + this.layout.squareSize);
			}catch(e) {

			}
		}
		if(config.layout.boardLabels || config.layout.boardLabels===false)this.layout.boardLabels = config.layout.boardLabels;
		if(config.behaviour.flipBoardWhenBlackToStart || config.behaviour.flipBoardWhenBlackToStart===false)this.behaviour.flipBoardWhenBlackToStart = config.behaviour.flipBoardWhenBlackToStart;
		if(config.layout.chessSet)this.layout.chessSet = config.layout.chessSet;
		if(config.els.movesInGame)this.els.movesInGame = $(config.els.movesInGame);
		if(config.els.movesInGameTableFormat){
			if(this.__isArray(config.els.movesInGameTableFormat)){
				for(var no=0;no<config.els.movesInGameTableFormat.length;no++){
					this.els.movesInGameTableFormat[no] = $(config.els.movesInGameTableFormat[no]);
				}
			}else{
				this.els.movesInGameTableFormat[0] = $(config.els.movesInGameTableFormat);
			}
		}
		if(config.els.playerNames)this.els.playerNames = $(config.els.playerNames);
		if(config.els.currentMove)this.els.currentMove = $(config.els.currentMove);
		if(config.els.currentPgnFile)this.els.currentPgnFile = $(config.els.currentPgnFile);
		if(config.els.currentComment)this.els.currentComment = $(config.els.currentComment);
		if(config.layout.colorLightSquares || config.layout.colorLightSquares=='')this.layout.colorLightSquares = config.layout.colorLightSquares;
		if(config.layout.colorDarkSquares || config.layout.colorDarkSquares=='')this.layout.colorDarkSquares = config.layout.colorDarkSquares;
		if(config.layout.bgImageDarkSquares || config.layout.bgImageDarkSquares=='')this.layout.bgImageDarkSquares = config.layout.bgImageDarkSquares;
		if(config.layout.bgImageLightSquares || config.layout.bgImageLightSquares=='')this.layout.bgImageLightSquares = config.layout.bgImageLightSquares;

        if(config.behaviour.animationTime)this.behaviour.animationTime = config.behaviour.animationTime;
		if(config.behaviour.animate !== undefined)this.behaviour.animate=config.behaviour.animate;
		if(config.behaviour.sound !== undefined)this.behaviour.sound=config.behaviour.sound;

		if(config.behaviour.highlightLastMove || config.behaviour.highlightLastMove===false)this.behaviour.highlightLastMove=config.behaviour.highlightLastMove;
		if(config.layout.displayPrefaceComments !== undefined)this.layout.displayPrefaceComments=config.layout.displayPrefaceComments;
		if(config.els.gameAttributes)this.els.gameAttributes = config.els.gameAttributes;
		if(config.dragAndDropColor)this.dragAndDropColor = config.dragAndDropColor;
		if(config.liveUpdateInterval)this.liveUpdateInterval = config.liveUpdateInterval;
		if(config.elMovesInTableMaxMovesPerTable)this.els.movesInGameTableFormatMaxMovesPerTable = config.elMovesInTableMaxMovesPerTable;
		if(config.languageCode)this.languageCode = config.languageCode;
		if(config.behaviour.keyboardNavigation || config.behaviour.keyboardNavigation===false)this.behaviour.keyboardNavigation=config.behaviour.keyboardNavigation;

	}
	,
	// {{{ __isDragOk()
	/**
	*  Return true if it's ok to start dragging this piece
	*	@param String color - color of piece
	*	@param Integer pieceIndex - Index of piece in piece array.
	*  
	* @private
	*/
	__isDragOk : function(color,pieceIndex)
	{
		if(this.currentGameIndex===false || this.isBusy || this.autoPlayActive)return false;

		var nextMove = this.__getNextMove();
		if(color!=nextMove.color)return false;	// Color of piece is not the same as the one to move
		if(color!=this.dragAndDropColor)return false;
		return true;

	}
	,
	/**
	*  Mouse down event on check piece.
	*	@param Event e
	*  
	* @private
	*/
	__clearDragProperties : function()
	{
		this.dragProperties = new Object();
	}
	,
	/**
	*  Mouse down event on check piece.
	*	@param Event e
	*  
	* @private
	*/
	__mouseDownOnChessPiece : function(e) {
        var src = e.target;
        if(src.tagName.toLowerCase() == 'img'){
            src = src.getParent('div');
        }
		var color = src.getAttribute('color');
		var pieceIndex = src.getAttribute('pieceIndex');
		var objectIndex = src.getAttribute('objectIndex');

		var tmpColor = 'white';
		if(color=='b')tmpColor='black';
		if(this.__isDragOk(tmpColor,pieceIndex)){
			var pieceX = this.pieces[tmpColor][pieceIndex].el.style.left.replace('px','')/1;
			var pieceY = this.pieces[tmpColor][pieceIndex].el.style.top.replace('px','')/1;
			this.currentZIndex++;
			this.pieces[tmpColor][pieceIndex].el.style.zIndex = this.currentZIndex;
			this.dragProperties = { color:tmpColor,pieceIndex:pieceIndex,mouseX:e.client.x,mouseY:e.client.y,pieceX:pieceX,pieceY:pieceY,toFile:false,toRank:false };
			this.dragCountDownVar = 2;
			document.body.style.cursor = 'pointer';
			this.__countDownToDragStart.delay(20,this);
		}
		return false;
	}
	,
	/**
	*  A small delay before drag starts
	*	@param Event e
	*  
	* @private
	*/
	__countDownToDragStart : function()	{
		if(this.dragCountDownVar>=0 && this.dragCountDownVar<5){
			this.dragCountDownVar = 5;
		}
	}
	,
	/**
	*  Move dragged piece according to the mouse position
	*	@param Event e
	*  
	* @private
	*/
	__moveDraggedPiece : function(e) {
		if(this.dragCountDownVar==5){	// Drag is in progress
            this.pieces[this.dragProperties.color][this.dragProperties.pieceIndex].el.setStyles({
                left : (e.client.x - this.dragProperties.mouseX + this.dragProperties.pieceX),
                top : (e.client.y - this.dragProperties.mouseY + this.dragProperties.pieceY)
            });
            e.stop();
		}
	}
	,
	/**
	*  Get square, example "e4" from x and y in pixels
	*	@param Integer x - x position in pixels
	*	@param Integer y - y position in pixels
	*  
	* @private
	*/
	__getSquareFromDragXY : function(x,y)	{
		x = Math.ceil(x/this.layout.squareSize);
		y = Math.ceil(8-y/this.layout.squareSize);
		if(this.flipBoard){
			x = 9-x;
			y = 9-y;
		}
		return this.__getFileByCol(x) + y;
	}
	,
	/**
	*  Returns true if correct piece has been dragged to correct square
	*	@param String toSquare - To which square has it been dragged
	*  
	* @private
	*/
	__isCorrectPieceDraggedToCorrectSquare : function(toSquare)	{
		if(this.currentGameIndex===false)return false;

		var nextMove = this.__getNextMove();

		if(nextMove.pawnMove){
			if(nextMove.capture){
				var index = this.__movePawnCapture(nextMove.notation,nextMove.fromFile,nextMove.color,false);
			}else{
				var index = this.__movePawnForward(nextMove.notation,nextMove.color);
			}
			if(index==this.dragProperties.pieceIndex && toSquare==nextMove.toSquare)return true;
			return false;
		}

		var pieceObj = this.pieces[this.dragProperties.color][this.dragProperties.pieceIndex];
		var moveOk=true;

		if(!this.__canPieceMoveToSquare(this.dragProperties.color,this.dragProperties.pieceIndex/1,toSquare))moveOk=false;

		if(pieceObj.pieceType!=nextMove.pieceType)moveOk=false;
		if(nextMove.fromFile && nextMove.fromFile!=pieceObj.file)moveOk=false;
		if(nextMove.toSquare!=toSquare)moveOk=false;
		if(nextMove.fromRank && nextMove.fromRank!=pieceObj.rank)moveOk=false;
		if(moveOk){
			return true;
		}

		// Move doesn't match main line, check variations.
		if(!this.insideVariation){	// We shouldn't be inside a variation already.
			var variations = this.__getVariationIndexes(nextMove.move,nextMove.color);
			if(variations){
				for(var prop in variations){
					var aVariation = variations[prop];
					this.__setStartVariationVariables(nextMove.move,nextMove.color,prop);
					if(this.__isCorrectPieceDraggedToCorrectSquare(toSquare))return true;

				}
				this.insideVariation = false;
			}
		}
		var opositeColor = this.dragProperties.color=='white'?'black':'white';
		var el = this.__getPieceOnSquare(toSquare,opositeColor);
		if(el===false)this.__playSound('move');else this.__playSound('capture');
		return false;
	}
	,
	/**
	*  Return array indexes for variations from a specific move.
	*  
	* @private
	*/
	__getVariationIndexes : function(move,color) {
		try{
			return this.pgnObject.gameDetails[this.currentGameIndex].moves[move][color].variation;
		}catch(e){
			return false;
		}
	}
	,
	/**
	*  This method is used to control how long auto play is allowed to proceed between dragged moves. 
	*  
	* @private
	*/
	__dragAndDropAfterMoveCallback : function() {
		var lastMove = this.__getLastPlayedMove();
		if(lastMove.color==this.dragProperties.color){
            this.move.delay(100, this, 1);
            this._executeEvent('correctmove');
		}
	}
	,
	/**
	*  Mouse up - check if drag is in progress and if piece has been moved to correct square
	*  
	* @private
	*/
	__releaseDraggedPiece : function(e)	{
		if(this.dragCountDownVar==5){
			document.body.style.cursor = '';
			var ind = this.objectIndex;
			this.dragCountDownVar = -1;

			var x = e.client.x - this.els.board.getPosition().x + Math.max(document.documentElement.scrollLeft,document.body.scrollLeft);
			var y = e.client.y - this.els.board.getPosition().y + Math.max(document.documentElement.scrollTop,document.body.scrollTop);
			var toSquare = this.__getSquareFromDragXY(x,y);

			if(this.__isCorrectPieceDraggedToCorrectSquare(toSquare)){
                this.__dragAndDropAfterMoveCallback.delay(this.behaviour.animationTime * 1000, this);
				this.move(1);
			}else{
				var fromPos = this.__getPieceXY(this.dragProperties.color,this.dragProperties.pieceIndex);

				var pieceObj = this.pieces[this.dragProperties.color][this.dragProperties.pieceIndex];
				var toPos = this.__getBoardPosByNotation(pieceObj.file+pieceObj.rank);

				var dragDropVar = 'differentSquare';
				if(toSquare==this.pieces[this.dragProperties.color][this.dragProperties.pieceIndex].file + this.pieces[this.dragProperties.color][this.dragProperties.pieceIndex].rank){
					dragDropVar = 'sameSquare';
				}
				this.__slideElement(
					{
                        'x' : toPos.x,
                        'y':toPos.y,
                        'animationTime' : 0.01
                    },
					this.dragProperties.pieceIndex,
					this.dragProperties.color,
					dragDropVar
				)
			}
		}
	}
	,
	/**
	*  Returns x and y position of a specific chess piece
	*	@param String color - color of piece
	*	@param Integer pieceIndex - Index of piece in the array of pieces.
	*  
	* @private
	*/
	__getPieceXY : function(color,pieceIndex){
        return {
            x : this.pieces[color][pieceIndex].el.style.left.replace('px','')/1,
            y : this.pieces[color][pieceIndex].el.style.top.replace('px','')/1
        };
	}
	,
	// {{{ __cancelEvent()
	/**
	*  Just to cancel ondragstart and onselectstart events.
	*  
	* @private
	*/
	__cancelEvent : function(){
		return false;
	}
	,
	/**
	*  Add general events for the widget
	*  
	* @private
	*/
	__addGeneralEvents : function() {
        $(document.documentElement).addEvent('mousemove', this.__moveDraggedPiece.bind(this) );
        $(document.documentElement).addEvent('mouseup', this.__releaseDraggedPiece.bind(this) );
	}
	,
	/**
	*  
	* @private
	*/
	__createLiveUpdateHandler : function() {
		if(!this.liveUpdateInterval)return;
        this.__getNewGameData.periodical(this.liveUpdateInterval*1000, this);
	}
	,
	/**
	*  Creates a bgsound element - the sound effect feature will currently only work in IE on windows.
	*  
	* @private
	*/
	__addSoundEffects : function()	{
		if(!this.behaviour.sound)return;
        this.soundEmbed = new Element( this.isMSIE ? 'bgsound' : 'object',{
            type :  "audio/wav",
            autostart :  true,
            loop : false,
            data : '',
            styles : {
                visibility : 'hidden',
                display : this.isMSIE ? 'none' : 'block'
            }
        });
 		var body = document.getElementsByTagName('BODY')[0];
		body.appendChild(this.soundEmbed);
	}
	,
	/**
	*  Play a wav file
	*	@param String whichSound - Which sound to play
	*  
	* @private
	*/
	__playSound : function(whichSound)	{
		if(!this.behaviour.sound)return;
		var lastMove = this.__getLastPlayedMove();

		if(whichSound){
			switch(whichSound){
				case "startGame":soundFile = 'startgame1.wav';break;
				case "move":soundFile = 'move1.wav';break;
				case "capture":soundFile = 'capture1.wav';break;
			}
		}else{
			var soundFile = 'move1.wav';
			if(lastMove.moveString.indexOf('x')>=0){
				soundFile = 'capture1.wav';
			}
			if(lastMove.moveString.indexOf('O-O')>=0)soundFile = 'castle1.wav';
		}

		if(this.soundEmbed[ this.isMSIE ? 'src' : 'data'].indexOf('1')>0)soundFile = soundFile.replace('1','2');
		this.soundEmbed[ this.isMSIE ? 'src' : 'data'] = 'sound/' + soundFile; // + '?rnd='+Math.random();

	}
	,
	/**
	*  Add transparency to pgn files dynamically - for old IE browsers.
	*	@param Object el - reference to DOM img element.
	*  
	* @private
	*/
	correctPng : function(el) {
		el = $(el);
		el.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + el.src + "', sizingMethod='scale')";
		el.src = this.layout.imageFolder + 'spacer.gif';
		el.width = this.layout.squareSize;
		el.height = this.layout.squareSize;
	}
	,
	/**
	* Clear rows in a data table.
	*
	* @param Object tbodyRef = Reference to HTML element(tbody or table)
	* @private
	*/
	__clearTBodyRows : function(tbodyRef) {
		if(!tbodyRef)return;
		if(tbodyRef.tagName.toLowerCase()=='table'){
			var table = tbodyRef;
			var tbodies = tbodyRef.getElementsByTagName('TBODY');
			var tbodyRef = tbodies[0];
		}else{
			var table = tbodyRef.parentNode;
		}
		var className = tbodyRef.className;
		var css = tbodyRef.style.cssText;
		this.__discardElement(tbodyRef);
		var tbody = document.createElement('tbody');
		if(className)tbody.className = className;
		if(css)tbody.style.cssText = css;
		table.appendChild(tbody);
	}
	,
	/**
	* Delete DOM element
	*
	* @param Object element = Reference to HTML element
	* @private
	*/
	__discardElement : function(element){
		element = $(element);
		var gBin = $('IELeakGBin'); 
		if (!gBin) { 
			gBin = document.createElement('DIV'); 
			gBin.id = 'IELeakGBin'; 
			gBin.style.display = 'none'; 
			var head = document.getElementsByTagName('HEAD')[0];
			head.appendChild(gBin); 
		} 
		// move the element to the garbage bin 
		gBin.appendChild(element); 
		gBin.innerHTML = ''; 
	}
	,
	/**
	* Return true if element is an array
	*
	* @param Object el = Reference to HTML element
	* @private
	*/
	__isArray : function(el){
		if(!el)return false;
		if(el.constructor.toString().indexOf("Array") != -1)return true;
		return false;
	}
});

DHTMLGoodies.Chess = new Class({
   Extends : DG.Chess,

   initialize : function(config){
       if(!config.listeners){
           config.listeners = {};
       }
       if(config.callbackOnGameLoaded)config.listeners.loadgame = eval(config.callbackOnGameLoaded);
       if(config.callbackOnBeforeGameLoaded)config.listeners.beforeloadgame = eval(config.callbackOnBeforeGameLoaded);
       if(config.callbackOnSwitchPgn)config.listeners.newpgn = eval(config.callbackOnSwitchPgn);
       if(config.callbackOnCorrectMove)config.listeners.correctmove = eval(config.callbackOnCorrectMove);
       if(config.callbackOnWrongMove)config.listeners.wrongemove = eval(config.callbackOnWrongMove);
       if(config.callbackAfterLastMove)config.listeners.afterlastmove = eval(config.callbackAfterLastMove);
       if(config.callbackOnStartAutoPlay)config.listeners.startautoplay = eval(config.callbackAfterLastMove);
       if(config.callbackOnStopAutoPlay)config.listeners.stopautoplay = eval(config.callbackOnStopAutoPlay);
       if(config.callbackAfterLiveUpdate)config.listeners.liveupdate = eval(config.callbackAfterLiveUpdate);

       if(!config.els){
           config.els = {};
       }
       if(config.elPlayerNames)config.els.playerNames = config.elPlayerNames;
	   if(config.elActiveMove)config.els.currentMove = config.elActiveMove;
	   if(config.elActivePgnFile)config.els.currentPgnFile = config.elActivePgnFile;
	   if(config.elActiveComment)config.els.currentComment = config.elActiveComment;
	   if(config.elMovesInline)config.els.movesInGame = config.elMovesInline;
	   if(config.elMovesInTable)config.els.movesInGameTableFormat = config.elMovesInTable;
       if(config.parentRef)config.els.parent = config.parentRef;
       if(config.elGameAttributes)config.els.gameAttributes = config.elGameAttributes;

       if(!config.layout){
           config.layout = {};
       }
       if(config.chessSet)config.layout.chessSet = config.chessSet;
       if(config.squareSize)config.layout.squareSize = config.squareSize;
       if(config.bgImageDarkSquares)config.layout.bgImageDarkSquares = config.bgImageDarkSquares;
       if(config.bgImageLightSquares)config.layout.bgImageLightSquares = config.bgImageLightSquares;
       if(config.colorDarkSquares)config.layout.colorDarkSquares = config.colorDarkSquares;
       if(config.colorLightSquares)config.layout.colorLightSquares = config.colorLightSquares;
       if(config.imageFolder)config.layout.imageFolder = config.imageFolder;
       if(config.cssPath)config.layout.cssPath = config.cssPath;
       if(config.boardLabels || config.boardLabels===false)config.layout.boardLabels = config.boardLabels;
       if(config.displayPrefaceCommentWithInlineMoves !== undefined)config.layout.displayPrefaceComments = config.displayPrefaceCommentWithInlineMoves;

       if(!config.behaviour){
           config.behaviour = {};
       }
       if(!config.behaviour.autoplay){
           config.behaviour.autoplay = {};
       }
       if(config.flipBoardWhenBlackToStart !== undefined)config.behaviour.flipBoardWhenBlackToStart = config.flipBoardWhenBlackToStart;
       if(config.flipBoardWhenBlackWins !== undefined)config.behaviour.flipBoardWhenBlackWins = config.flipBoardWhenBlackWins;
       if(config.animate !== undefined)config.behaviour.animate = config.animate;
       if(config.animationSpeed !== undefined)config.behaviour.animationTime = config.animationSpeed;
       if(config.indicateLastMove !== undefined)config.behaviour.highlightLastMove = config.indicateLastMove;
       if(config.keyboardSupport !== undefined)config.behaviour.keyboardNavigation = config.keyboardSupport;
       if(config.autoPlayDelayBetweenMoves !== undefined)config.behaviour.autoplay.delay = config.autoPlayDelayBetweenMoves;
       if(config.autoplayDelayBeforeComments !== undefined)config.behaviour.autoplay.delayBeforeComments = config.autoplayDelayBeforeComments;
       if(config.stopAutoplayBeforeComments !== undefined)config.behaviour.autoplay.stopBeforeComments = config.stopAutoplayBeforeComments;


       this.parent(config);
   }
});