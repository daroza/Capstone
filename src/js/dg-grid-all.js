

// js/config.js

if(!window.DG){
    window.DG = {};
}
DG.SystemConfig = new Class({
    relativePath : './',

    initialize : function(config){

    },

    getRealPath : function(url){
        if(url.indexOf('http:') == 0){
            return url;
        }
        return this.relativePath + url;
    },
    
    setRelativePath : function(relativePath){
        this.relativePath = relativePath;
    }

});

DG_Config = new DG.SystemConfig();

// js/component.js

if(!window.DG){
    window.DG = {};
}

DG.CmpMgrClass = new Class({
    items : {},
    formElements : {},

    initialize : function(){

    },

    addItem : function(item) {
        this.items[item.getId()] = item;
    },

    deleteItem : function(item){
        delete this.items[item.getId()];
    },

    get : function(id){
        return this.items[id];
    },

    zIndex : 1,
    getNewZIndex : function(inc){
        this.zIndex++;
        return this.zIndex;
    }


});

DG.CmpMgr = new DG.CmpMgrClass();

DG.getComponent = function(id){
    return DG.CmpMgr.get(id);
}

DG.FormMgrClass = new Class({
    formElements : {},
    forms : {},

    add : function(item){
        var name = item.getName();
        if(!this.formElements[name]){
            this.formElements[name] = item;
        }

        var formNames = item.getFormNames();

        for(var i=0, count = formNames.length; i<count; i++){
            if(this.forms[formNames[i]] == undefined){
                this.forms[formNames[i]] = [];
            }

            this.forms[formNames[i]].push(item.id);
        }
    },

    getForm : function(formName){
        var ret = [];
        if(this.forms[formName] === undefined){
            return ret;
        }
        for(var i=0, count=this.forms[formName].length;i<count; i++){
            var formEl = DG.CmpMgr.get(this.forms[formName][i]);

            ret.push({
                name : formEl.getName(),
                value : formEl.getValue()
            });
        }

        return ret;

    },

    get : function(name){
        return this.formElements[name] ? this.formElements[name] : null;
    }

});
DG.Form = new DG.FormMgrClass();

DG.Component = new Class({
    Extends : Events,
    config : {

    },

    cls : '',

    behaviour : {
        closable : true,
        minimizable : false,
        movable : false,
        resizable : false,
        preserveAspectRatio : false
    },

    els : {

    },

    tagNameContentEl : 'div',
    id : null,
    items : [],
    type : 'Component',
    cType : 'Component',
    parentComponent : null,
    objMovable : null,

    left : null,
    top : null,
    width : null,
    height : null,
    minWidth : null,
    maxWidth : null,
    overflow : null,

    minHeight : null,
    maxHeight : null,

    title : '',
    html : '',
    fullScreen : false,
    active : true,
    stretch : null,
    css : undefined,

    remote : {
        url : null,
        refreshInterval : null,
        data : {},
        isJSON : false,
        pleaseWaitMessage : 'Loading content...'
    },

    resizeProperties : {
        'active' : null,
        'min' : null,
        'max' : null,
        'mouseX' : null,
        'elX' : null,
        'el' : null,
        'index' : null,
        'currentX' : null
    },

    secrets : {},

    layout : {
        type : 'default',
        position : ''
    },

    initialize : function(config){
        this.lifeCycle(config);
    },

    tpl : '',
    
    formName : undefined,

    layoutManager : null,

    lifeCycle : function(config) {
        this.id = config.id || this.type.replace('.','-') + '-' + String.uniqueID();
        DG.CmpMgr.addItem(this);
        this.layoutManager = new DG.LayoutManager(this);
        
        this.lifeCycle_config(config);

        this.createCoreDomElements();
        this.addCoreEvents();

        this.increaseZIndex();

        this.lifeCycle_elements();
        this.lifeCycle_events();
        this.lifeCycle_dom();
        this.lifeCycle_remote();

        if(config.items){
            this.addItems(config.items);
        }

        this.layoutManager.prepareView();

        this.lifeCycle_rendered();
    },

    lifeCycle_config : function(config){
        config = config || {};
        config.els = config.els || {};
        config.behaviour = config.behaviour || {};
        config.remote = config.remote || {};

        this.tpl = config.tpl || this.tpl;
        this.css = config.css || this.css;
        this.secrets = config.secrets || this.secrets;
        
        if(config.active !== undefined){
            this.active = config.active;
        }
        if(config.els.parent){
            this.els.parent = document.id(config.els.parent);
            document.id(window).addEvent('resize', this.resize.bind(this));
        }
        this.overflow = config.overflow || this.overflow;
        this.fullScreen = config.fullScreen || this.fullScreen;
        this.title = config.title || this.title;
        this.html = config.html || this.html;
        this.stretch = config.stretch || this.stretch;
        this.formName = config.formName || this.formName;
        if(config.layout !== undefined){
            if(!config.layout.type){
                config.layout = { type : config.layout }
            }
            this.layout = Object.merge(this.layout, config.layout);
        }
        this.remote.url = config.remote.url || this.remote.url;
        this.remote.lazy = config.remote.lazy || null;
        this.remote.refreshInterval = config.remote.refreshInterval || this.remote.refreshInterval;
        this.remote.data = config.remote.data || this.remote.data;
        this.remote.cache = config.remote.cache || false;

        this.columnConfig = config.columnConfig || [];
        
        if(config.remote.params !== undefined){
            this.remote.data = config.remote.params;
        }
        this.remote.menuConfig = config.remote.menuConfig || null;
        if(config.remote.pleaseWaitMessage !== undefined){
            this.remote.pleaseWaitMessage = config.remote.pleaseWaitMessage;
        }
        
        if(config.behaviour.movable !== undefined){
            this.behaviour.movable = config.behaviour.movable;
        }
        if(config.behaviour.resizable !== undefined){
            this.behaviour.resizable = config.behaviour.resizable;
        }
        if(config.behaviour.closable !== undefined){
            this.behaviour.closable = config.behaviour.closable;
        }
        if(config.behaviour.minimizable !== undefined){
            this.behaviour.minimizable = config.behaviour.minimizable;
        }
        if(config.behaviour.preserveAspectRatio !== undefined){
            this.behaviour.preserveAspectRatio = config.behaviour.preserveAspectRatio;
        }

        if(config.parentComponent){
            this.parentComponent = config.parentComponent;
        }
        this.cls = config.cls || this.cls;
        
        if(config.left !== undefined){
            this.left = this.getSizeValue(config.left);
        }
        if(config.top !== undefined){
            this.top = this.getSizeValue(config.top);
        }
        if(config.objMovable){
            this.objMovable = config.objMovable;
        }
        this.width = this.getSizeValue(config.width) || this.width;
        this.height = this.getSizeValue(config.height) || this.height;
        this.minWidth = this.getSizeValue(config.minWidth) || this.minWidth;
        this.maxWidth = this.getSizeValue(config.maxWidth) || this.maxWidth;
        this.minHeight = this.getSizeValue(config.minHeight) || this.minHeight;
        this.maxHeight = this.getSizeValue(config.maxHeight) || this.maxHeight;

        if(config.listeners){
            this.addEvents(config.listeners);
        }
    },
    
    lifeCycle_elements : function() {

    },
    lifeCycle_events : function(config) {

    },

    lifeCycle_dom : function() {
        if(this.cls){
            this.getEl().addClass(this.cls);
        }
        if(this.css){
            this.getEl().setStyles(this.css);
        }
    },

    lifeCycle_remote : function() {

    },
    lifeCycle_rendered : function() {

        if(!this.isActive()){
            this.hide();
        }
        if(!this.height){
            this.autoSetHeight();
        }
        this.fireEvent('render', this);

        this.resize.delay(100, this);
    },

    autoSetHeight : function() {
        var size = this.getContentEl().measure(function(){
            return this.getSize();
        });
        size.y += this.getVerticalMargins(this.getContentEl());
        size.y += this.getVerticalBorderAndPadding(this.getEl())
        this.height = size.y;
    },

    getMeasuredWidth : function() {
        var size = this.getContentEl().measure(function(){
            return this.getSize();
        });
        return size.x;
    },


    setContent : function() {
        var el = this.getContentEl();

        if(this.html){

            var html = new Element('div');
            html.set('html', this.html);
            el.adopt(html);

        }
        if(this.getUrl()){
            this.load();
        }

    },

    shouldStretch : function() {
        return this.stretch ? true : false;
    },
    cancelEvent : function(){
        return false;
    },

    load : function() {
        if(this.remote.lazy){
            this.remote.lazy = false;
            return;
        }
        this.fireEvent('beforeload', [this.getUrl(), this]);
        this.showWaitMessage();
        this.getContentFromUrl();
    },

    getContentFromUrl : function() {

        if(this.isJSONRequest()){
            this.runJSONRequest({
                url : this.getUrl(),
                params : this.getDataForRemoteRequest(),
                onSuccess : function(json) {
                    this.fireEvent('load', [json, this]);
                    this.fireEvent('afterload', [json, this]);
                    this.hideWaitMessage();

                }.bind(this)
            });
        }else{
            var req = new Request({
                url : this.getUrl(),
                noCache : !this.isCacheEnabled(),
                data : this.getDataForRemoteRequest(),
                evalScripts : true,
                onComplete : function(response) {
                    this.getContentEl().set('html', response);
                    this.fireEvent('load', [response, this]);
                    this.fireEvent('afterload', [response, this]);
                    this.hideWaitMessage();
                }.bind(this)
            });
            req.send();
        }
    },

    isCacheEnabled: function() {
        return this.remote.cache ? true : false
    },

    getDataForRemoteRequest : function() {
        return this.remote.data;
    },

    runJSONRequest : function(config){
         var req = new Request.JSON({
            url : config.url,
            noCache : !this.isCacheEnabled(),
            data : config.params,
            evalScripts : true,
            onSuccess : config.onSuccess.bind(this)
        });
        req.send();
    },

    isJSONRequest : function() {
        return this.remote.isJSON ? true : false;
    },

    getParentComponent : function() {
        return this.parentComponent ? this.parentComponent : null;
    },

    setItems : function(items) {
        for(var i=0;i<items.length;i++){
            this.addItem(items[i]);
        }
    },

    setParentComponent : function(parentComponent) {
        this.parentComponent = parentComponent;
    },

    getParentComponent : function(){
        return this.parentComponent;
    },

    getParentEl : function() {
        if(this.parentComponent){
            return this.parentComponent.getContentEl();
        }
        return this.els.parent;
    },

    createCoreDomElements : function() {
        this.els.container = new Element('div');
        this.els.container.addClass('DG-component-container');

        if(this.isFullScreen()){
            this.els.container.addClass('DG-component-full-screen');
        }
        if(this.els.parent){
            this.els.parent.adopt(this.els.container);
        }
        this.els.container.setProperty('id', this.getId());

        if(this.cls){
            this.els.container.addClass(this.cls);
        }

        this.els.el = new Element(this.tagNameContentEl);
        this.els.el.setStyle('height', '100%');
        this.els.el.addClass('DG-component-content');
        this.els.container.adopt(this.els.el);
        if(this.overflow == 'hidden'){
            this.els.el.setStyle('overflow', 'hidden');
        }

        var waitEl = this.els.pleaseWait = new Element('div');
        waitEl.addClass('DG-dashboard-item-load-message');
        waitEl.set('html', this.remote.pleaseWaitMessage);
        this.els.container.adopt(waitEl);
        this.hideWaitMessage();
        this.setContent();
    },

    isFullScreen : function(){
        return this.fullScreen;
    },

    addCoreEvents : function() {
       this.getEl().addEvent('mousedown', this.increaseZIndex.bind(this));
    },

    increaseZIndex : function(e) {
        if(e && e.target && e.target.tagName.toLowerCase() == 'a'){
            return;
        }
        this.getEl().setStyle('z-index', this.getNewZIndex());
    },

    showWaitMessage : function() {

        if(this.hasPleaseWaitMessage()){
            this.els.pleaseWait.setStyle('display', '');
        }
    },

    hideWaitMessage : function() {
        this.els.pleaseWait.setStyle('display', 'none');
    },

    hasPleaseWaitMessage : function() {
        return this.remote.pleaseWaitMessage ? true : false;
    },
    getObjMovable : function() {
        if(!DG.MOVABLE){
            DG.MOVABLE = new DG.DashboardMovable();
            DG.MOVABLE.addEvent('drop', this.dropItem.bind(this));
        }
        return DG.MOVABLE;
    },

    dropItem : function() {
        this.getObjMovable().getSourceColumn().removeItem(this.getObjMovable().getSourceItem());
        if(this.getObjMovable().getTargetColumn()){
            this.getObjMovable().getTargetColumn().addItem(this.getObjMovable().getSourceItem(), this.getObjMovable().getTargetItem(),  this.getObjMovable().getTargetPosition());
        }
        this.fireEvent('drop', this);
    },

    getEl : function(){
        return this.els.container ? this.els.container : null;
    },

    getContentEl : function(){
        return this.els.el;
    },

    getConfigObject : function() {
        var ret = this.getItemProperties();
        
        for(var i=0; i<this.items.length; i++){
            if(!ret.items){
                ret.items = [];
            }
            ret.items.push(this.items[i].getConfigObject());
        }
        return ret;
    },

    hideAllItems : function() {
        for(var i=0; i<this.items.length; i++){
            this.items[i].hide();
        }
    },

    hide : function() {
        if(this.getEl().getStyle('display') !== 'none'){
            this.getEl().setStyle('display', 'none');
            this.active = 0;
            this.fireEvent('hide', this);
        }

    },

    show : function() {

        if(this.getEl().getStyle('display') === 'none'){
            this.getEl().setStyles({
                'display' : ''
            });
            this.active = 1;
            this.fireEvent('show', this);
        }
        this.getEl().setStyles({
            'z-index' : this.getNewZIndex()
        });
        this.resize();
    },

    getNewZIndex : function() {
        var ret =  DG.CmpMgr.getNewZIndex();
        if(this.els.parent == document.id(document.body)){
            ret+=1000;
        }
        return ret;
    },

    showItem : function(id){
        for(var i=0, count = this.items.length; i<count; i++){
            if(this.items[i].getId() == id){
                this.items[i].show();
                return;
            }
        }

    },

    getItemProperties : function(){
        var parentId = null;
        if(this.getParentComponent()){
            parentId = this.getParentComponent().getId();
        }

        return {
            id : this.getId(),
            active : this.isActive() ? 1 : 0,
            title : this.getTitle(),
            html : this.getHtmlText(),
            type : this.getType(),
            width : this.getWidth(),
            height : this.getHeight(),
            minWidth : this.getMinWidth(),
            maxWidth : this.getMaxWidth(),
            minHeight : this.getMinHeight(),
            maxHeight : this.getMaxHeight(),
            left : this.getLeft(),
            top : this.getTop(),
            parentId : parentId,
            remote : this.remote,
            els : {
                parent : parentId ? null : this.els.parent.id
            },
            behaviour : this.getBehaviour()
        }
    },

    getBehaviour : function() {
        var ret = {};
        for(var key in this.behaviour){
            if(key == 'data'){
                ret[key] = this.behaviour[key];
            }else{
                ret[key] = this.behaviour[key] ? 1 : 0;
            }
        }
        return ret;
    },

    getCType : function(){
        return this.cType;
    },

    getItems : function() {
        var ret = [];
        for(var i=0;i<this.items.length;i++){
            var obj = {
                item : this.items[i]
            };
            if(this.items[i].hasItems()){
                obj.items = this.items[i].getItems();
            }

            ret.push(obj);
        }
        return ret;
    },

    getItemIds : function() {
        var ret = [];
        for(var i=0;i<this.items.length;i++){
            var obj = {
                id : this.items[i].getId()
            };
            if(this.items[i].hasItems()){
                obj.items = this.items[i].getItemIds();
            }

            ret.push(obj);
        }
        return ret;
    },

    hasItems : function() {
        return this.items.length > 0;
    },

    getId : function(){
        return this.id;
    },

    isDragDropActive : function() {
        var objMovable = this.getObjMovable();
        if(!objMovable){
            return false;
        }
        return objMovable.isActive();
    },

    isActive : function() {
        return this.active == 1;
    },

    setLeft : function(left){
        this.left = left;
    },

    setTitle : function(title){
        this.title = title;
        if(this.els.titleBar && this.els.titleBar.title){
            this.els.titleBar.title.set('html', this.title);
        }
    },

    setTop : function(top){
        this.top = top;
    },

    getTop : function() {
        return this.top;
    },
    setWidth : function(width) {
        this.width = width;
    },

    setHeight : function(height){
        this.height = height;
    },

    getUrl : function() {
        if(!this.remote.url){
            return '';
        }
        var ret = this.remote.url;
        if(window.DG_Config){
            return DG_Config.getRealPath(ret);
        }
        return this.remote.url;
    },

    setUrl : function(url){
        this.remote.url = url;
    },

    getRemoteRefreshInterval : function(){
        return this.remote.refreshInterval ? this.remote.refreshInterval : 0;
    },
    
    increaseWidth : function(increaseBy){
        this.width += increaseBy;
    },

    increaseLeft : function(increaseBy){
        this.left += increaseBy;
    },

    getWidth : function(){
        return this.width;
    },

    getMinWidth : function() {
        return this.minWidth;
    },

    getMaxWidth : function() {
        return this.maxWidth;
    },

    getMinHeight : function() {
        return this.minHeight;
    },

    getMaxHeight : function() {
        return this.maxHeight;
    },
    getLeft : function(){
        return this.left;
    },
    getHeight : function(){
        return this.height ? this.height : this.getEl().getSize().y;
    },

    getSizeValue : function(val){
        if(val && !isNaN(val)){
            return val/1;
        }
        return val;
    },

    getType : function() {
        return this.type;
    },
    


    getLayout : function() {
        return this.layout;
    },

    resize : function(config) {


        config = config || {};
        // this.logResize(config);
        if(this.fullScreen || this.layoutManager.isInATabLayout()){
            config.left = 0;
            config.top = 0;
            config.width = '100%';
            config.height = '100%';
            var parentEl = this.getParentEl()
            config.height = this.getInnerHeight(parentEl);
            if(parentEl.tagName.toLowerCase() == 'fieldset'){
                config.height -= parentEl.getElements('legend')[0].getSize().y;
            }

        }

        if(config.width) {
            if(config.width.indexOf && config.width.indexOf('%') >=0){
                var parent = this.getParentEl();
                if(parent){
                    config.width = parent.getSize().x- this.getHorizontalBorderAndPadding(parent);
                }
            }

            if(this.behaviour.preserveAspectRatio && this.width && !this.isMinimized()){
                var ratio = this.getAspectRatio();
                if(ratio) {
                    config.height = config.width / ratio;
                }
            }
            this.width = config.width;
            var width = config.width - this.getHorizontalBorders(this.getEl()) - this.getHorizontalMargins(this.getEl());
            if(width >0){
                this.getEl().setStyle('width', width);
            }

        }
        if(config.height) {
            if(config.height.indexOf && config.height.indexOf('%') >=0){
                var parent = this.getParentEl();
                if(parent){
                    config.height = parent.getSize().y;
                }
            }
           
            this.height = config.height;
            var height = config.height - this.getVerticalBorders(this.getEl()) - this.getVerticalMargins(this.getEl());

            if(height > 0){
                this.getEl().setStyle('height', height);
            }
        }

        if(config.left || config.top){
            this.setPosition(config);
        }
        
        if(config.height || config.width){
            this.resizeComponentDOM();
            this.fireEvent('resize');
        }

        this.resizeItems();
    },

    logResize : function(config) {
        this.log('RESIZING COMPONENT ' + this.type);
        if(this.getParentComponent()){
            this.log('PARENT: ' + this.getParentComponent().type)
        }
        this.log('width: ' + config.width);
        this.log('height: ' + config.height);
        this.log('******************');
    },

    setPosition : function(config) {

        if(config.left !== undefined){
            if(config.left >=0){
                this.setLeft(config.left);
                this.getEl().setStyle('left', config.left);
            }
        }

        if(config.top !== undefined){
            if(config.top >= 0){
                this.setTop(config.top);
                this.getEl().setStyle('top', config.top);
            }
        }
    },

    resizeItems : function() {
        this.layoutManager.resizeItems();
    },

    isMinimized : function(){
        return false;
    },

    totalVerticalPadding : null,
    

    getTotalVerticalBorderAndPadding : function() {
        if(!this.totalVerticalPadding){
            this.totalVerticalPadding = this.getVerticalBorderAndPadding(this.getEl());
        }
        return this.totalVerticalPadding;
    },

    totalHorizontalPadding : null,
    getTotalHorizontalBorderAndPadding : function() {
        if(!this.totalHorizontalPadding && this.totalHorizontalPadding !== 0){
            this.totalHorizontalPadding = this.getHorizontalBorderAndPadding(this.getEl());
        }

        return this.totalHorizontalPadding;
    },
    
    totalPaddingContent : null,
    getPaddingOfContentEl : function() {
        if(!this.totalPaddingContent && this.totalPaddingContent!== 0){
            this.totalPaddingContent = this.getHorizontalBorderAndPadding(this.getContentEl());
        }
        return this.totalPaddingContent;
    },


    getHorizontalBorderAndPadding : function(el) {
        return this.getHorizontalPadding(el) + this.getHorizontalBorders(el);
    },

    horizontalPaddings : {},
    getHorizontalPadding : function(el){
        if(!el.id){
            el.id = 'el-' + String.uniqueID();
        }

        if(this.horizontalPaddings[el.id] === undefined){
            this.horizontalPaddings[el.id] =
                this.getNumericStyle(el, 'padding-left') +
                this.getNumericStyle(el, 'padding-right');

        }
        return this.horizontalPaddings[el.id];

    },
    horizontalBorders : {},
    getHorizontalBorders : function(el){
        if(!el.id){
            el.id = 'el-' + String.uniqueID();
        }

        if(this.horizontalBorders[el.id] === undefined){
            this.horizontalBorders[el.id] =
                this.getNumericStyle(el, 'border-left-width') +
                this.getNumericStyle(el, 'border-right-width');

        }
        return this.horizontalBorders[el.id];

    },

    verticalPaddings : {},
    getVerticalBorderAndPadding : function(el) {
        return this.getVerticalPadding(el) + this.getVerticalBorders(el);
    },

    getVerticalPadding : function(el){
        if(!el.id)el.id = 'el-' + String.uniqueID();


        if(this.verticalPaddings[el.id] === undefined){
            this.verticalPaddings[el.id] =
                this.getNumericStyle(el, 'padding-top') +
                this.getNumericStyle(el, 'padding-bottom');

        }
        return this.verticalPaddings[el.id];

    },

    verticalBorder : {},

    getVerticalBorders : function(el){
        if(!el.id)el.id = 'el-' + String.uniqueID();


        if(this.verticalBorder[el.id] === undefined){
            this.verticalBorder[el.id] =
                this.getNumericStyle(el, 'border-top-width') +
                this.getNumericStyle(el, 'border-bottom-width');

        }
        return this.verticalBorder[el.id];

    },

    verticalMargins : {},
    getVerticalMargins : function(el){
        if(!el.id)el.id = 'el-' + String.uniqueID();

        if(this.verticalMargins[el.id] === undefined){
            this.verticalMargins[el.id] =
                this.getNumericStyle(el, 'margin-top') +
                this.getNumericStyle(el, 'margin-bottom')

        }
        return this.verticalMargins[el.id];

    },

    horizontalMargins : {},
    getHorizontalMargins : function(el){
        if(!el.id)el.id = 'el-' + String.uniqueID();

        if(this.horizontalMargins[el.id] === undefined){
            this.horizontalMargins[el.id] =
                this.getNumericStyle(el, 'margin-left') +
                this.getNumericStyle(el, 'margin-right')

        }
        return this.horizontalMargins[el.id];

    },

    getNumericStyle : function(el, style) {
        return Math.ceil(el.getStyle(style).replace('px','') /1);
    },
    
    resizeComponentDOM : function(){
        var height = this.getHeight();
        if(height == 0){
            return;
        }
        height -= this.getVerticalBorderAndPadding(this.getContentEl());
        height -= this.getVerticalMargins(this.getContentEl());
        height -= this.getVerticalBorderAndPadding(this.getEl());

        this.getContentEl().setStyle('height', height);
    },

    getInnerWidth : function(el){
        return el.getSize().x - this.getHorizontalBorderAndPadding(el);
    },

    getInnerHeight : function(el) {
        return el.getSize().y - this.getVerticalBorderAndPadding(el);
    },

    getInnerHeightOfContentEl : function() {
        return this.getInnerHeight(this.getContentEl());
    },

    isParentDisplayed : function() {
        return this.els.parent.getStyle('display') != 'none';
    },

    addItems : function(items) {
        var count = items.length;
        for(var i=0;i< count;i++){
            this.addItem(items[i]);
        }
    },

    addItem : function(item, insertAt, pos){
        return this.layoutManager.addItem(item,insertAt,pos);
    },

    isMovable : function(){
        return this.behaviour.movable;
    },

    isClosable : function() {
        return this.behaviour.closable;
    },

    isMinimizable : function() {
        return this.behaviour.minimizable;
    },

    getItem : function(index){
        return this.items[index];
    },

    removeItem : function(item) {
        this.items.erase(item);
    },

    disposeAllItems : function() {
        for(var i=this.items.length-1; i>=0; i--){
            this.items[i].dispose();
        }
    },

    dispose : function() {
        if(this.getParentComponent()){
            this.getParentComponent().removeItem(this);
        }
        var countItems = this.items.length;
        for(var i=countItems-1;i>=0;i--){
            this.items[i].dispose();
        }
        this.getEl().dispose();
        DG.CmpMgr.deleteItem(this);
    },

    isResizable : function() {
        return this.behaviour.resizable ? true : false;
    },

    hasFixedWidth : function() {
        return this.minWidth && this.minWidth == this.maxWidth;
    },

    getTitle : function(){
        return this.title;
    },

    getHtmlText : function(){
        return this.html;
    },

    createAColResizeHandle : function(index) {
        if(!this.els.resizeHandles){
            this.els.resizeHandles = [];
        }
        var el = new Element('div');
        el.addClass('DG-dashboard-resize-handle');
        el.setStyles({
            'top' : 0,
            'position' : 'absolute',
            'height' : '100%',
            'cursor' : 'col-resize',
            'z-index' : 15000
        });
        if(this.hasColumnFixedSize(index) || this.hasColumnFixedSize(index+1)){
            el.setStyle('display','none');
        }
        if(!this.isColumnResizable(index) || !this.isColumnResizable(index+1)){
            el.setStyle('display','none');
        }
        el.setProperty('handle-index', index)
        el.addEvent('mousedown', this.startColResize.bind(this));
        el.addEvent('mouseover', this.mouseOverResizeHandle.bind(this));
        el.addEvent('mouseout', this.mouseOutResizeHandle.bind(this));
        this.getEl().adopt(el);
        this.els.resizeHandles.push(el);
        return el;
    },

    isColumnResizable : function() {
        return true;
    },
    
    deleteResizeHandles : function(){
        var els = this.getEl().getChildren('.DG-dashboard-resize-handle');
        if(els.length == 0){
            els = this.getContentEl().getChildren('.DG-dashboard-resize-handle');
        }
        var count = els.length;
        for(var i=count-1;i>=0;i--){
            els[i].dispose();
        }
        this.els.resizeHandles = [];
    },
    mouseOverResizeHandle : function(e) {
        if(!this.isResizeActive()){
            e.target.addClass('DG-resize-handle-over');
        }
    },
    mouseOutResizeHandle : function(e){
        e.target.removeClass('DG-resize-handle-over');
    },
    
    startColResize : function(e) {
        var handleIndex = e.target.getProperty('handle-index') / 1;
        e.target.addClass('DG-resize-handle-active');
        var offset = this.getLeftOffsetOfColResizeHandle();

        this.resizeProperties.min = this.getMinPosOfResizeHandle(handleIndex) - offset;
        this.resizeProperties.max = this.getMaxPosOfResizeHandle(handleIndex) - offset;

        this.resizeProperties.mouseX = this.resizeProperties.currentX = e.page.x;
        this.resizeProperties.elX = e.target.getStyle('left').replace('px','') / 1;
        this.resizeProperties.currentX = this.resizeProperties.elX;
        
        this.resizeProperties.active = true;
        this.resizeProperties.el = e.target;
        this.resizeProperties.index = handleIndex;

        return false;
    },

    getMinPosOfResizeHandle : function() {
        return 0;
    },

    getMaxPosOfResizeHandle : function(){
        return 1000;
    },

    hasColumnFixedSize : function(columnIndex){
        if(columnIndex >= this.items.length){
            return false;
        }
        return this.items[columnIndex].hasFixedWidth();
    },

    isResizeActive : function() {
        return this.resizeProperties.active;
    },

    getLeftOffsetOfColResizeHandle : function() {
        if(!this.els.resizeHandles[0]){
            return 3;
        }
        if(!this.handleOffset){
            var offset = Math.ceil(this.els.resizeHandles[0].getSize().x / 2);
            if(offset > 0){
                this.handleOffset = offset;
            }else{
                return 3;
            }
        }
        return this.handleOffset;
    },

    moveColResizeHandle : function(e) {
        if(this.resizeProperties.active){
            var pos = this.resizeProperties.elX - this.resizeProperties.mouseX + e.page.x;
            pos = Math.max(pos, this.resizeProperties.min);
            pos = Math.min(pos, this.resizeProperties.max);
            this.resizeProperties.el.setStyle('left', pos);

            this.resizeProperties.currentX = pos;
            return false;
        }
    },

    stopColResize : function(e) {
        if(this.resizeProperties.active){
            this.resizeProperties.active = false;
            this.resizeProperties.el.removeClass('DG-resize-handle-active');
            var change = this.resizeProperties.currentX - this.resizeProperties.elX;
            this.fireEvent('colresize', [this.resizeProperties.index, change]);
            this.resizeItems();
        }
        return false;
    },

    log : function(txt){
        if(window.console && console.log && !Browser.ie){
            console.log(txt);
        }else{

            if(document.id('debug')){
                var html = document.id('debug').get('html');
                html = html + txt + '...<br>';
                document.id('debug').set('html', html);
            }
        }
    },

    clearDomElements : function(cls){
        var els = this.els.el.getElements(cls);
        for(var i=els.length-1;i>=0;i--){
            els[i].dispose();
        }
    },

    setRemoteParam : function(key, value){
        this.remote.data[key] = value;
    },

    getRemoteParam : function(key){
        return this.remote.data[key];
    },

    getSecret : function(key){
        return this.secrets[key];
    },

    saveSecret : function(key, value){
        this.secrets[key] = value;
    },

    getSecrets : function(){
        return this.secrets;
    },

    saveSecrets : function(secrets){
        Object.merge(this.secrets, secrets)
    },

    clearSecrets : function() {
        this.secrets = {};
    },

    getFormNames : function(){
        var formNames = [];
        if(this.getFormName()){
            formNames.push(this.getFormName());
        }
        var cmp = this;
        while(cmp = cmp.getParentComponent()){
            var formName = cmp.getFormName();
            if(formName){
                formNames.push(formName);
            }
        }

        return formNames;
    },

    getFormName : function(){
        return this.formName;
    }

});

// js/layout-manager.js

DG.LayoutManager = new Class({
    component : null,
    tabStrip : null,


    initialize : function(component){
        this.component = component;
        this.component.addEvent('resize', this.resize.bind(this));
    },

    addItem : function(item, insertAt, pos){
        item = this.getNewComponent(item);
        item.setParentComponent(this.component);

        if(insertAt) {
            var items = [];
            for(var i=0;i<this.component.items.length;i++) {
                if(pos == 'after') {
                    items.push(this.component.items[i]);
                    this.getContentEl().adopt(this.component.items[i].getEl());
                }
                if(this.component.items[i].getId() == insertAt.getId()) {
                    items.push(item);
                    this.getContentEl().adopt(item.getEl());
                }
                if(pos == 'before') {
                    items.push(this.items[i]);
                    this.getContentEl().adopt(this.items[i].getEl());
                }
            }
            this.component.items = items;
        }else{
            this.component.items.push(item);
            this.getContentEl().adopt(item.getEl());
        }

        this.component.fireEvent('addItem', item);
        if(item.isMovable()){
            this.component.getObjMovable().addSource(item, '.DG-dashboard-item-titlebar-title');
        }
        try{

            this.component.resizeItems();
        }catch(e){

        }
        this.handleNewItem(item);

        return item;
    },

    resizeItems : function() {
        if(!this.component.isActive()){
            return;
        }
        var layout = this.getLayout();

        switch(layout){

            case 'rows':
                this.resizeItems_rows();
                break;
            case 'cols':
                this.resizeItems_cols();
                break;
            default :
                this.resizeItems_default();

        }
     },

    resizeItems_default : function() {
        var config = {};

        config.width = this.component.getInnerWidth(this.component.getContentEl());

        if(config.width < 0){
            config.width = null;
        }

        for(var i=0;i<this.component.items.length;i++){
              this.component.items[i].resize(config);
        }

    },

    resizeItems_cols : function(){
        var totalWidth = this.getInnerWidthOfComponent();
        var totalWidthOfItems = 0;
        for(var i=0;i<this.component.items.length;i++){
            if(!this.component.items[i].shouldStretch()){
                var width = this.component.items[i].getWidth() + this.component.getHorizontalMargins(this.component.items[i].getEl());
                if(width){
                    totalWidthOfItems += width
                }
            }
        }

        var stretchWidth = totalWidth - totalWidthOfItems;
        var height = this.getInnerHeightOfComponent();
        var currentLeft = 0;
        for(var i=0;i<this.component.items.length;i++){
             var config = { 'height' : height, 'left' : currentLeft };
             if(this.component.items[i].shouldStretch()){
                config.width = stretchWidth;
             }else{
                config.width = this.component.items[i].getWidth();
             }

             this.component.items[i].resize(config);
             currentLeft += config.width;
         }

    },

    resizeItems_rows : function() {

        var totalHeightOfItems = 0;
        for(var i=0;i<this.component.items.length;i++){
            if(!this.component.items[i].shouldStretch()){
                var height = this.component.items[i].getHeight();
                if(height){
                    totalHeightOfItems += height
                }
            }
        }
        var stretchHeight = this.component.getInnerHeightOfContentEl() - totalHeightOfItems;
  
        var width = this.getInnerWidthOfComponent();

        for(var i=0;i<this.component.items.length;i++){
             var config = { 'width' : width };

             if(this.component.items[i].shouldStretch()){
                config.height = stretchHeight;
             }else{
                config.height = this.component.items[i].getHeight();
             }
             this.component.items[i].resize(config);
         }

    },

    getInnerWidthOfComponent : function() {
        var width = 0;
        if(this.component.getWidth()){
             width = this.component.getWidth();
             width -= this.component.getHorizontalBorderAndPadding(this.component.getEl());
             width -= this.component.getHorizontalBorderAndPadding(this.component.getContentEl());
             width -= this.component.getHorizontalMargins(this.component.getContentEl());
        }
        return width;

    },
    getInnerHeightOfComponent : function() {
        var height = 0;
        if(this.component.getHeight()){
             height = this.component.getHeight();
             height -= this.component.getVerticalBorderAndPadding(this.component.getEl());
             height -= this.component.getVerticalBorderAndPadding(this.component.getContentEl());
             height -= this.component.getVerticalMargins(this.component.getContentEl());
        }
        return height;

    },

    getNewComponent : function(config) {

        if(!this.isConfigObject(config)){
            if(!config.getParentComponent()){
                config.setParentComponent(this);
            }

            return config;
        }
        config = config || {};
        config.els = config.els || {};
        if(!config.els.parent && this.getEl()){
            config.els.parent = this.getEl();
        }
        config.parentComponent = this.component;
        //try{
            var cmpType = this.getComponentType(config);

            if(cmpType.nameSpace){
                 var obj = new window.DG[cmpType.nameSpace][cmpType.componentType](config);
            }else{
                if(!window.DG[cmpType.componentType]){
                    this.component.log('Cannot create object of type ' + cmpType.componentType)
                }
                var obj = new window.DG[cmpType.componentType](config);
            }
        //}catch(e){
            //this.log('Cannot create object of class ' + this.getComponentType(config).componentType);
           // this.log(e.message);
        //}
        return obj;
    },


    getComponentType : function(config) {
        var cmp = {};
        var cmpType = '';
        var nameSpace = '';
        if(config.type){
            cmpType = config.type;
        }
        else if(config.cType){
            cmpType = config.cType;
        }else{
            cmpType = this.component.cType;
        }
        if(cmpType.indexOf('.')>=0){
            var tokens = cmpType.split(/\./g);
            nameSpace = tokens[0];
            cmpType = tokens[1];
        }
        return {
            nameSpace : nameSpace,
            componentType : cmpType
        }
    },

    isConfigObject : function(obj) {
        return obj && obj.initialize ? false : true;
    },

    getContentEl : function() {
        return this.component.getContentEl();
    },

    getEl : function() {
        return this.component.getEl();
    },

    log : function(txt){
        if(window.console && console.log){
            console.log(txt);
        }
    },

    handleNewItem : function(item) {
        if(this.isTabLayout()){
            var tab = this.getTabStrip().addItem(item);
            //tab.show();
        }
        if(this.getLayout() == 'cols'){
            item.getEl().setStyle('position', 'absolute');
        }
    },

    prepareView : function() {
        var layout = this.getLayout();

        if(this.isTabLayout(layout)){
            this.component.getEl().addClass('DG-component-tab-layout')
            this.prepareTabLayout();
        }

        this.component.resizeComponentDOM();
    },

    prepareTabLayout : function() {
        if(this.isTabLayout()){
            var tabStrip = this.getTabStrip();
            tabStrip.showFirstActiveTab();
        }
    },

    getTabStrip : function() {
        if(!this.tabStrip){
             this.tabStrip = new DG.TabStrip({
                parentComponent : this.component,
                listeners : {
                    add : this.resize.bind(this)
                }
            });
        }
        return this.tabStrip;
    },

    getLayout : function(){
        return this.component.getLayout().type  ? this.component.getLayout().type  : 'default';
    },

    isTabLayout : function(layout){
        return this.component.getLayout().type == 'tabs';
    },

    isInATabLayout : function() {

        if(!this.component.getParentComponent()){
            return false;
        }

        return this.component.getParentComponent().getLayout().type === 'tabs';
    },

    getHeightOfNavElements : function() {
        if(this.tabStrip){

            return this.tabStrip.getHeight();
        }
        return 0;
    },

    resize : function() {
        if(this.component.items.length === 0){
            return;
        }
        if(this.isTabLayout()){
            this.getTabStrip().onComponentResize();

        }

    }



});

// js/visual-component.js

DG.VisualComponent = new Class({
    Extends : DG.Component,

    type : 'VisualComponent',
    
    els : {
        container : null,
        parent : null,
        titleBar: {
            el : null,
            icon : null,
            title : null,
            controls : null
        },
        el : null,
        resize : null,
        statusBar : {
            el : null,
            text : null,
            statusIcon : null,
            icon : null
        }
    },
    
    behaviour : {
        movable : false,
        minimizable : true,
        resizable : true,
        preserveAspectRatio : false
    },
    minHeight : 120,

    width : null,
    height : 200,

    icon : null,
    statusBar : {
        visible : false,
        text : '',
        icon : ''
    },

    titleBar : true,
    hasMenu : false,
    dragProperties : {
        mode : null,
        originalElPos : {
            x : null,
            y : null
        },
        originalMousePos : {
            x : null,
            y : null
        },
        currentMousePos : {
            x : null,
            y : null
        }
    },

    buttons : [],

    menuConfig : null,
    menuObj : null,

    column : null,

    aspectRatio : 1,

    state : {
        isMinimized : false,
        isFullScreen : false
    },
    
    lifeCycle_config : function(config){
        this.parent(config);
        this.parseConfigParams(config);
        this.buttons = config.buttons || this.buttons;
        
    },

    lifeCycle_elements : function() {
        this.parent();
        var el = this.els.container;
        el.addClass('DG-dashboard-item');

        el.adopt(this.getTitleBarEl());

        var contentEl = this.getContentEl();
        contentEl.addClass('DG-dashboard-item-content');

        el.adopt(this.getResizeEl());
        if(!this.getParentComponent()){
            el.adopt(this.getHorResizeEl());
        }
        el.adopt(contentEl);
        el.adopt(this.getButtonBar());
        el.adopt(this.getStatusBar());
        if(this.els.parent){
            this.els.parent.adopt(el);
        }
    },

    lifeCycle_dom : function() {
        this.parent();
        if(!this.statusBar.visible){
            this.hideStatusBar();
        }
        if(!this.titleBar){
            this.hideTitleBar();
        }

        this.setSizeOfControlElements.delay(100, this);

        if(this.shouldPreserveAspectRatio()){
            this.autoSize.delay(50, this);
        }

        if(!this.getParentComponent()){
            document.id(window).addEvent('resize', this.resize.bind(this));
        }
        
        this.resize({
            'width' : this.width,
            'height' : this.height,
            'left' : this.left,
            'top' : this.top
        });

        this.resizeComponentDOM.delay(500, this);
    },

    lifeCycle_remote : function() {
        this.parent();
        if(this.getRemoteRefreshInterval() > 0){
            this.load.periodical(this.getRemoteRefreshInterval() * 1000, this);
        }
        if(this.remote.menuConfig){
            this.loadRemoteMenuConfig();
        }
    },

    lifeCycle_events : function() {
        document.id(document.body).addEvent('mouseup', this.stopResize.bind(this));
        document.id(document.body).addEvent('mousemove', this.mouseMove.bind(this));
    },

    hideStatusIcon : function() {
        this.els.statusBar.icon.setStyle('visibility', 'hidden');
    },

    setStatusText : function(text) {
        this.els.statusBar.text.set('html', text);
    },

    clearStatusText : function(text) {
        this.els.statusBar.text.set('html', '');
    },

    showStatusIcon : function(icon) {
        this.els.statusBar.icon.setStyle('display', '');
        if(icon !== undefined){
            this.els.statusBar.icon.setStyle('background-image', 'url(' + icon + ')');
        }
    },

    parseConfigParams : function(config) {
        config = config || {};
        config.behaviour = config.behaviour || {};
        config.statusBar = config.statusBar || {};
        config.remote = config.remote || {};
        this.hasMenu = config.hasMenu || this.hasMenu;
        if(config.menuConfig !== undefined){
            this.menuConfig = config.menuConfig;
        }
        if(config.width){
            if(config.aspectRatio){
                this.aspectRatio = config.aspectRatio;
            }
        }

        this.icon = config.icon || this.icon;
        this.statusBar.icon = config.statusBar.icon || this.statusBar.icon;
        this.statusBar.text = config.statusBar.text || '';
        if(config.statusBar.visible !==undefined){
            this.statusBar.visible = config.statusBar.visible;
        }
        
        if(config.titleBar !==undefined){
            this.titleBar = config.titleBar;
        }

        this.menuConfig = config.menuConfig || this.menuConfig;
    },

    hideStatusBar : function() {
        this.els.statusBar.el.setStyle('display','none');
        this.totalHeightOfTitleAndStatusBar = 0;
        this.statusBar.visible = false;
    },

    hideTitleBar : function() {
        this.els.titleBar.el.setStyle('display','none');
        this.totalHeightOfTitleAndStatusBar = 0;
        this.titleBar = false;
    },

    autoSize : function() {
        this.resize({ width: this.getCalculatedWidth()  });
    },

    getCalculatedWidth : function() {
        return this.els.container.getSize().x;
    },

    saveAspectRatio : function() {
        if(this.width && this.height && !this.aspectRatio){
            this.aspectRatio = this.width / this.height;
        }
    },

    getAspectRatio : function() {
        if(!this.aspectRatio){
            this.saveAspectRatio();
        }
        return this.aspectRatio;
    },

    shouldPreserveAspectRatio : function() {
        return this.behaviour.preserveAspectRatio ? true : false;
    },
    
    resizeComponentDOM : function() {
        var height = this.getHeight();

        height -= this.getVerticalBorderAndPadding(this.getEl());
        height -= this.getVerticalMargins(this.getEl());


        height -= this.getTotalHeightOfTitleAndStatusBar();
        
        height -= this.getVerticalBorderAndPadding(this.getContentEl());
        height -= this.getVerticalMargins(this.getContentEl());

        if(height < 0){
            return;
        }
        this.getContentEl().setStyle('height', height);
        if(this.els.titleBar.title && this.width){
            var widthOfControlButtons = this.getWidthOfIconAndButtons();
            this.els.titleBar.title.setStyle('width', this.width - this.getWidthOfIconAndButtons());
            this.els.statusBar.text.setStyle('width', this.width - 30);
        };
    },

    totalHeightOfTitleAndStatusBar : undefined,
    getTotalHeightOfTitleAndStatusBar : function() {
        if(!this.totalHeightOfTitleAndStatusBar){
            this.totalHeightOfTitleAndStatusBar =
                this.getHeightOfTitleBar() +
                this.getHeightOfStatusBar() +
                this.getHeightOfButtonBar();
        }
        return this.totalHeightOfTitleAndStatusBar + this.layoutManager.getHeightOfNavElements();
    },

    heightOfTabContainer : undefined,
    getHeightOfTabContainer : function() {

        if(this.heightOfTabContainer === undefined){
            this.heightOfTabContainer = this.els.tabContainer.getSize().y;
        }
        return this.heightOfTabContainer;
    },

    heightOfButtonBar : undefined,
    getHeightOfButtonBar : function() {
        if(!this.buttons.length){
            return 0;
        }
        if(this.heightOfButtonBar === undefined){
            this.heightOfButtonBar = this.els.buttonBar.el.getSize().y;
        }
        return this.heightOfButtonBar;
    },
    
    heightOfTitlebar : undefined,
    getHeightOfTitleBar : function() {
        if(!this.titleBar){
            return 0;
        }
        if(this.heightOfTitlebar === undefined || !this.heightOfTitlebar){
            this.heightOfTitlebar = this.els.titleBar.el.getSize().y;
        }
        return this.heightOfTitlebar;
    },

    getHeightOfStatusBar : function() {
        var statusBarSize = this.els.statusBar.el.getSize();
        if(statusBarSize.y == 0){
            statusBarSize.y = 1;
        }
        return statusBarSize.y;
    },
    
    getWidthOfIconAndButtons : function() {
        var ret = 0;
        if(this.icon){
            ret+= this.els.titleBar.icon.getSize().x;
        }
        ret+=this.els.titleBar.controls.getSize().x;

        return ret;
    },


    cancelTextSelection : function() {
        return false;
    },


    getTitleBarEl : function() {
        var el = this.els.titleBar.el = new Element('div');
        el.addClass('DG-dashboard-item-titlebar');

        var left = 0;
        if(this.icon){
            this.els.titleBar.icon = new Element('div');
            this.els.titleBar.icon.addClass('DG-dashboard-item-titlebar-icon');
            this.els.titleBar.icon.setStyle('background-image', 'url(' + DG_Config.getRealPath(this.icon) + ')');
            el.adopt(this.els.titleBar.icon);
            left += this.els.titleBar.icon.getStyle('width').replace(/[^0-9]/g,'')/1
        }

        this.els.titleBar.title = new Element('div');
        this.els.titleBar.title.setStyle('left', left);
        this.els.titleBar.title.addClass('DG-dashboard-item-titlebar-title');
        this.els.titleBar.title.set('html', this.title);
        this.els.titleBar.title.setProperty('title', this.title);
        el.adopt(this.els.titleBar.title);

        el.adopt(this.getControlElement());
        el.addEvent('selectstart', this.cancelTextSelection);


        if(this.isMovable() && !this.getParentComponent()){
            this.getEl().setStyle('position', 'absolute');
            this.els.titleBar.el.addEvent('mousedown', this.startMove.bind(this));
            this.els.titleBar.el.setStyle('cursor', 'move');
        }
        return el;
    },

    setSizeOfControlElements : function() {
        if(this.els.titleBar.controls){
            var width = this.getWidthOfControlElements();

            this.els.titleBar.controls.setStyle('width', width);
            this.els.titleBar.controls.setStyle('display', width > 0 ? '' : 'none');
        }
        if(this.icon){
            this.els.titleBar.title.setStyle('left', this.els.titleBar.icon.getStyle('width'));
        }
    },

    getControlElement : function() {
        var el = this.els.titleBar.controls = new Element('div');
        this.els.titleBar.controls.addClass('DG-dashboard-item-titlebar-controls');
        el.setStyle('cursor', 'default');

        if(this.isMinimizable()) {
            el.adopt(this.getButton('minimize', 'toggleMinimizeMaximize'));
           // el.adopt(this.getButton('fullscreen', 'toFullScreen'));
        }

        if(this.hasTitleBarMenu()){
            var menuEl = this.els.titleBar.menu = this.getButton('menu', 'showHideMenu');
            el.adopt(menuEl);
            this.createMenuObject();
        }
        if(this.isClosable()) {
            el.adopt(this.getButton('close', 'close'));
        }

        var width = this.getWidthOfControlElements();
        el.setStyle('width', width);
        return el;
    },

    toFullScreen : function() {
        if(this.state.isFullScreen === false){
            var shim = this.getShim();
            shim.show();

        }
    },
    getShim : function() {
        if(!this.cmpShim){
            this.cmpShim = new DG.ComponentToFullScreen({
                component : this
            });
        }
        return this.cmpShim;
    },

    hasTitleBarMenu : function(){
        return this.menu ? true : false;
    },

    getButton : function(buttonType, action) {
        var button = new Element('div');
        button.addClass('DG-dashboard-item-titlebar-controls-' + buttonType);
        button.addClass('DG-dashboard-item-titlebar-controls-button');
        button.addEvent('click', this[action].bind(this));
        button.addEvent('mouseover', this.selectControlButton.bind(this));
        button.addEvent('mouseout', this.deselectControlButton.bind(this));
        button.setProperty('title', buttonType.capitalize())
        return button;
    },

    close : function() {
        this.hide();
        this.fireEvent('close', this);
    },

    selectControlButton : function(e) {

        var el = e.target;
        var cls = [
            'DG-dashboard-item-titlebar-controls-fullscreen',
            'DG-dashboard-item-titlebar-controls-minimize',
            'DG-dashboard-item-titlebar-controls-maximize',
            'DG-dashboard-item-titlebar-controls-close',
            'DG-dashboard-item-titlebar-controls-menu'
        ];
        for(var i=0;i<cls.length;i++){
            if(el.hasClass(cls[i])){
                el.addClass(cls[i] + '-over');
                return;
            }
        }
    },

    deselectControlButton : function(e) {
        var el = e.target;
        e.target.removeClass('DG-dashboard-item-titlebar-controls-fullscreen-over');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-minimize-over');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-maximize-over');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-close-over');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-menu-over');
    },

    createMenuObject : function() {
        this.menuObj = new DG.DashboardItemMenu({
            alignTo : this.els.titleBar.menu,
            menuConfig : this.menuConfig,
            listeners : {
                click : this.clickOnMenuItem.bind(this)
            }
        });

    },
    showHideMenu : function() {
        this.menuObj.toggle();
    },

    clickOnMenuItem : function(obj) {
        this.showHideMenu();
        this.fireEvent('menuclick', [obj, this])
    },
    
    getWidthOfControlElements : function() {
        var ret = 0;
        var els = this.els.titleBar.controls.getElements('.DG-dashboard-item-titlebar-controls-button');

        for(var i=0, count = els.length; i<count; i++){
            ret += els[i].getStyle('width').replace('px','') /1;
        }
        return ret;
    },

    isMinimized : function() {
        return this.state.isMinimized;
    },

    toggleMinimizeMaximize : function(e) {
        e.target.removeClass('DG-dashboard-item-titlebar-controls-minimize');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-maximize');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-maximize-over');
        e.target.removeClass('DG-dashboard-item-titlebar-controls-minimize-over');
        if(this.state.isMinimized === true){
            e.target.addClass('DG-dashboard-item-titlebar-controls-minimize');
            this.maximize();
        }else{
            e.target.addClass('DG-dashboard-item-titlebar-controls-maximize');
            this.minimize();
        }
    },

    maximize : function() {
        this.state.isMinimized = false;
        this.resize({
            height : this.shouldPreserveAspectRatio() ? this.width / this.getAspectRatio() : this.height
        });
        this.els.el.setStyle('visibility', 'visible');
        if(this.isResizable()){
            this.els.resize.setStyle('display', '');
        }

    },

    minimize : function() {
        this.state.isMinimized = true;
        var height = this.height;
        this.getEl().setStyle('height', this.getHeightOfTitleBar());
        this.els.el.setStyle('visibility', 'hidden');
        this.els.resize.setStyle('display', 'none');
        this.height = height;

    },



    parseContentTemplate : function(lines) {
        var html = '';

        for(var i=0;i<lines.length;i++){
            var content = this.tpl;
            for(var prop in lines[i]) {
                content = content.replace('{' + prop + '}', this.getTplValue(prop, lines[i][prop]));
            }
            html = html + content;
        }

        this.getContentEl().set('html', html);
    },

    getTplValue : function(key, value){
        return value;
    },

    setDataForRemoteRequest : function(key, value){
        this.remote.data = this.remote.data || {};
        this.remote.data[key] = value;
    },

    getHtml : function(){
        return this.els.el.get('html');

    },

    getButtonBar : function() {
        if(!this.els.buttonBar){
            this.els.buttonBar = this.els.buttonBar || {};
            var el = this.els.buttonBar.el = new Element('div');
            el.addClass('DG-dashboard-item-button-bar');
            if(this.buttons.length == 0){
                el.setStyle('display', 'none');
            }
            for(var i=this.buttons.length-1;i>=0;i--){
                var config = this.buttons[i];
                config.component = this;
                var button = new DG.Button(config);
                el.adopt(button.getEl());
            }
        }
        return this.els.buttonBar.el;
    },


    getStatusBar : function() {
        var el = this.els.statusBar.el = new Element('div');
        el.addClass('DG-dashboard-item-status-bar');

        var statusIcon = this.els.statusBar.icon = new Element('div');
        statusIcon.addClass('DG-dashboard-item-status-bar-icon');
        if(this.statusBar.icon){
            statusIcon.setStyle('background-image', 'url(' + this.statusBar.icon + ')');
        }else{
            statusIcon.setStyle('display', 'none');
        }
        el.adopt(statusIcon);

        var statusText = this.els.statusBar.text = new Element('div');
        statusText.addClass('DG-dashboard-item-status-bar-text');
        if(this.statusBar.text){
            statusText.set('html', this.statusBar.text);
        }
        el.adopt(statusText);

        return el;
    },

    getResizeEl : function() {
        var el = this.els.resize = new Element('div');
        el.addClass('DG-dashboard-item-status-bar-resize');
        el.addEvent('mousedown', this.startResize.bind(this));
        if(!this.isResizable()){
            el.setStyle('display','none');
        }
        return el;
    },

    getHorResizeEl : function(){
        var el = this.els.resizeHor = new Element('div');
        el.addClass('DG-dashboard-item-status-bar-resize-horizontal');
        el.addEvent('mousedown', this.startResize.bind(this));
        if(!this.isResizable()){
            el.setStyle('display','none');
        }
        return el;
    },

    startMove : function(e){
        this.increaseZIndex();
        this.dragProperties.mode = 'move';
        this.dragProperties.originalMousePos = {
            x : e.page.x,
            y : e.page.y
        };
        var pos = this.getEl().getPosition();
        this.dragProperties.originalElPos = {
            x : pos.x,
            y : pos.y
        };
        return false;
    },

    startResize : function(e) {
        if(!this.width){
            this.resize({
                width : this.getEl().getSize().x
            });
        }

        if(e.target.hasClass('DG-dashboard-item-status-bar-resize-horizontal')){
            this.dragProperties.mode = 'resizeX'
        }else{
            this.dragProperties.mode = 'resizeY'
        }
        this.dragProperties.originalMousePos = {
            x : e.page.x,
            y : e.page.y
        };
        return false;
    },

    stopResize : function(e) {
        this.dragProperties.mode = null;
    },

    mouseMove : function(e) {
        if(this.dragProperties.mode == 'resizeY'){
            var height = this.height + e.page.y - this.dragProperties.originalMousePos.y;
            this.height = Math.max(this.minHeight, height);
            if(this.maxHeight){
                this.height = Math.min(this.maxHeight, this.height);
            }
            this.resize({
                height : this.height
            });
            this.aspectRatio = null;
            this.dragProperties.originalMousePos = {
                x : e.page.x,
                y : e.page.y
            };

        }
        if(this.dragProperties.mode == 'resizeX'){

            var width = this.width + e.page.x - this.dragProperties.originalMousePos.x;
            this.width = Math.max(this.minWidth, width, 50);
            if(this.maxWidth){
                this.width = Math.min(this.maxWidth, this.width);
            }

            this.resize({
                width : this.width
            });
            this.aspectRatio = null;

            this.dragProperties.originalMousePos = {
                x : e.page.x,
                y : e.page.y
            };
        }

        if(this.dragProperties.mode == 'move'){
            var left = this.dragProperties.originalElPos.x + e.page.x - this.dragProperties.originalMousePos.x;
            var top = this.dragProperties.originalElPos.y + e.page.y - this.dragProperties.originalMousePos.y;

            this.setPosition({
                left : left,
                top : top
            });
        }
    },

    loadRemoteMenuConfig : function(){
        this.runJSONRequest({
            url : this.remote.menuConfig.url,
            params : this.remote.menuConfig.params,
            onSuccess : function(json){
                this.menuConfig = json.data;
            }
        });
    }
})

// js/visual-component-json.js

DG.VisualComponentJSON = new Class({
    Extends : DG.VisualComponent,
    type : 'VisualComponentJSON',
    remote : {
        isJSON : true
    },
    height : 200,

    lifeCycle_events : function() {
        this.parent();
        this.addEvent('load', this.parseJSON.bind(this));
    },

    parseJSON : function(json){
        this.parseContentTemplate(json.data);
    }
});

// js/grid.js

DG.Grid = new Class({
    Extends : DG.VisualComponentJSON,
    type : 'Grid',
    columnConfig : [],
    rowConfig : {

    },
    
    data : [],

    sortState : {
        key : null,
        colIndex : null,
        direction : ''
    },
    hasMenu : true,
    colMovable : null,
    stretch : false,

    menu : true,

    menuConfig : [

    ],

    scrollbar : {

    },

    defaultSort : {},

    lifeCycle_config : function(config) {
        this.parent(config);
        this.data = config.data || {}
        this.stretch = config.stretch || this.stretch;
        this.columnConfig = config.columnConfig || this.columnConfig;
        this.defaultSort = config.defaultSort || this.defaultSort;
    },

    lifeCycle_elements : function() {
        this.parent();
        var el = this.els.contentHeader = new Element('div');
        el.addClass('DG-grid-header-container');
        this.getContentEl().adopt(this.els.contentHeader);

        this.els.gridDataContainerTop = new Element('div');
        this.els.gridDataContainerTop.addClass('DG-grid-data-container');
        this.els.gridDataContainerTop.setStyles({
            'overflow' : 'hidden',
            'position' : 'relative'
        });

        this.getContentEl().addClass('DG-component-content-grid');
        this.getContentEl().adopt(this.els.gridDataContainerTop);
        this.els.gridDataContainer = new Element('div');
        this.els.gridDataContainerTop.adopt(this.els.gridDataContainer);

        this.els.gridDataContainer.setStyle('position', 'relative');

        this.createColumnHeaderElements();
        this.createDataColumnElements();
        this.createScrollbars();
        this.getContentEl().setStyle('overflow', 'visible');
        this.getEl().addClass('DG-grid');

        this.createColResizeHandles();
    },

    lifeCycle_dom : function() {
        this.parent();
        this.refreshView();
        this.resizeComponentDOM();
        this.createMovable();
        this.ifStretchHideLastResizeHandles();
    },

    lifeCycle_events : function() {
        this.parent();
        document.id(document.body).addEvent('mousemove', this.moveColResizeHandle.bind(this));
        document.id(document.body).addEvent('mouseup', this.stopColResize.bind(this));
        this.addEvent('colresize', this.resizeColumn.bind(this));
        this.menuObj.addEvent('show', this.updateMenuItems.bind(this));
        this.getContentEl().addEvent('selectstart', this.cancelEvent);
        this.getContentEl().addEvent('click', this.clickOnDataItem.bind(this));
        this.getContentEl().addEvent('dblclick', this.dblClickOnDataItem.bind(this));
    },

    lifeCycle_rendered : function(){
        this.parent();
        this.positionVerticalScrollbar.delay(100, this);
    },
    clickOnDataItem : function(e){
        this.fireGridEvent('click', this.getRecordFromEvent(e));
    },

    dblClickOnDataItem : function(e){
        this.fireGridEvent('dblclick', this.getRecordFromEvent(e));
    },
  
    fireCustomEvent : function(eventName, dataIndex){
        this.fireGridEvent(eventName, this.data[dataIndex], dataIndex);

    },

    getRecordFromEvent : function(e){
        var el = e.target;
        if(!el.hasClass('DG-grid-data-cell')){
            el = el.getParent('.DG-grid-data-cell');
        }
        if(el && el.hasClass('DG-grid-data-cell')){
            return this.data[el.getProperty('dataIndex')];
        }
    },

    fireGridEvent : function(eventType, record, dataIndex){
        if(dataIndex === undefined){
            dataIndex = null;
        }
        if(record){
            this.fireEvent(eventType, [record, this, dataIndex]);
        }
    },

    clickOnMenuItem : function(obj){

        if(obj.gridSystemItem){
            if(obj.checked){
                this.showColumn(obj.key);
            }else{
                this.hideColumn(obj.key);
            }
            this.showHideMenu();
        }else{
            this.parent(obj);

        }
    },

    updateMenuItems : function(obj){
        this.menuObj.setNewMenuConfig(this.getMenuConfig());
    },

    getMenuConfig : function() {
        var ret = [];
        for(var i=0;i<this.columnConfig.length; i++){
            if(this.columnConfig[i].heading){
                ret.push({
                    type : 'checkbox',
                    disabled : this.columnConfig[i].removable ? false : true,
                    checked : this.isColumnVisible(i),
                    label : this.columnConfig[i].heading,
                    key : this.columnConfig[i].key,
                    gridSystemItem : true
                });
            }
        }
        return Array.clone(this.menuConfig).append(ret);
    },

    isColumnDragActive : function() {
        return this.colMovable && this.colMovable.isActive();
    },

    hideResizeHandles : function() {
        for(var i=0;i<this.els.resizeHandles.length;i++){
            this.els.resizeHandles[i].setStyle('display', 'none');
        }

    },
    showResizeHandles : function() {
        for(var i=0;i<this.els.resizeHandles.length;i++){
            if(this.isColumnResizable(i)){

                this.els.resizeHandles[i].setStyle('display', '');
            }
        }
        this.ifStretchHideLastResizeHandles();
    },

    createMovable : function() {
        this.colMovable = new DG.GridColumnMovable();
        this.colMovable.addEvent('drop', this.moveColumn.bind(this));
        this.colMovable.addEvent('start', this.hideResizeHandles.bind(this));
        this.colMovable.addEvent('stop', this.showResizeHandles.bind(this));

        var sourceAdded = false;
        for(var i=0;i<this.els.columnHeaders.length;i++){
            if(this.isColumnMovable(i)){
                this.colMovable.addSource(this.els.columnHeaders[i]);
                sourceAdded = true;
            }
            if(sourceAdded){
                this.colMovable.addTarget(this.els.columnHeaders[i]);
            }
        }
    },

    isColumnMovable : function(index) {
        return this.columnConfig[index].movable === undefined || this.columnConfig[index].movable == true;
    },

    resizeItems : function() {
        this.parent();
        if(this.els.resizeHandles && this.shouldStretchLastColumn()){
            this.resizeColumns();
        }
    },

    moveColumn : function(obj){
        var source = obj.getSourceItem();
        var target = obj.getTargetItem();
        var targetPos = obj.getTargetPosition();

        if(source && target){
            var sourceIndex = source.getProperty('col-index');
            var targetIndex = target.getProperty('col-index');

            if(sourceIndex != targetIndex){
                var newConfig = [];
                for(var i=0;i<this.columnConfig.length;i++){
                    if(i == targetIndex && targetPos == 'before'){
                        newConfig.push(this.columnConfig[sourceIndex]);
                    }
                    if(i!= sourceIndex){
                        newConfig.push(this.columnConfig[i]);
                    }

                    if(i == targetIndex && targetPos == 'after'){
                        newConfig.push(this.columnConfig[sourceIndex]);
                    }
                }
                this.columnConfig = newConfig;

                this.refreshView();
            }
        }
    },

    refreshView : function() {
        this.populateColumnHeaders();
        this.resizeColumns();
        this.sortAndPopulate();
    },

    parseJSON : function(json){
        if(json.columnConfig){
            this.data = [];
            this.columnConfig = json.columnConfig;
            this.createColumnHeaderElements();
            this.createColResizeHandles();
        }

        this.setData(json.data);
        this.refreshView();
    },

    setData : function(data){
        this.data = data;
        this.fireEvent('add', [ this.data, this] );
        this.sortAndPopulate();
    },

    deleteAllRecords : function() {
        this.data = [];
        this.sortAndPopulate();
    },

    addRecords : function(records) {
        this.data = this.data.append(records);
        this.fireEvent('add', [ this.data, this] );
        this.sortAndPopulate();
    },

    addRecord : function(record){
        this.data.push(record);
        this.fireEvent('add', [ this.data, this] );
        this.sortAndPopulate();
    },

    getCountRows : function() {
        return this.data.length;
    },

    sortAndPopulate : function() {
        if(this.sortState.key){
            this.sortState.direction = this.sortState.direction == 'asc' ? 'desc' : 'asc';
            this.sortColumn(this.getColumnIndexByKey(this.sortState.key));
        }else{

            if(this.defaultSort.key){
                var index = this.getColumnIndexByKey(this.defaultSort.key);
                this.sortColumn(index, this.defaultSort.direction ? this.defaultSort.direction : 'asc');
            }
        }
        this.populateData();
    },



    resizeComponentDOM : function() {

        var contentSize = this.getContentEl().getSize();
        var contentHeight = contentSize.y;
        var contentWidth = contentSize.x;

        if(contentHeight == 0){
            this.resizeComponentDOM.delay(100, this);
            return;
        }
        this.parent();

        this.els.gridDataContainerTop.setStyle('height', contentHeight - this.getHeightOfGridHeader());

        this.scrollbar.vertical.resize();
        this.scrollbar.horizontal.resize();
    },


    resize : function(config){
        this.parent(config);
        this.resizeComponentDOM();
    },

    headerSize : 0,
    getHeightOfGridHeader : function() {
        if(!this.headerSize){
            var size = this.els.contentHeader.getSize().y;
            if(size > 0){
                this.headerSize = size;
            }
        }
        return this.headerSize;
    },

    createScrollbars : function() {
        this.scrollbar.horizontal = new DG.Scroller({
            type : 'horizontal',
            applyTo : this.getContentEl(),
            parent : this.getContentEl()

        });
        this.scrollbar.horizontal.getEl().inject(this.els.buttonBar.el, 'before');

        this.scrollbar.vertical = new DG.Scroller({
            type : 'vertical',
            applyTo : this.els.gridDataContainer,
            parent : this.els.gridDataContainerTop,
            mouseWheelSizeCls : 'DG-grid-data-cell'
        });
        this.scrollbar.vertical.getEl().inject(this.els.buttonBar.el, 'before');

        this.getEl().adopt(this.scrollbar.vertical.getEl());
        this.positionVerticalScrollbar();

    },

    positionVerticalScrollbar : function() {
        var top = this.getHeightOfTitleBar() +  this.getHeightOfGridHeader();
        if(top == 0){
            this.positionVerticalScrollbar.delay(100, this);
            return;
        }
        this.scrollbar.vertical.getEl().setStyle('top', top);
    },

    getTotalHeightOfTitleAndStatusBar : function() {
        return this.parent() + this.scrollbar.horizontal.getHeight();
    },

    createColumnHeaderElements : function() {
        this.clearDomElements('.DG-grid-header-cell');
        this.els.columnHeaders = [];
        this.headerMenuObj = [];
        for(var i=0;i<this.columnConfig.length;i++){
            var el = new Element('div');
            el.setProperty('col-index', i);
            el.addClass('DG-grid-header-cell');
            var span = new Element('span');
            span.addClass('DG-grid-header-cell-text');
            el.adopt(span);

            this.addHeaderBackgroundElements(el);

            if(this.columnConfig[i].removable){
                var menu = new Element('div');
                menu.addClass('DG-grid-data-cell-menu');
                menu.addEvent('click', this.showHideColMenu.bind(this));
                el.adopt(menu);
                this.headerMenuObj[i] = new DG.DashboardItemMenu({
                    alignTo : menu,
                    align : 'left',
                    width: 90,
                    menuConfig : [{
                        key : this.columnConfig[i].key,
                        label : 'Hide',
                        event : 'hide'
                    }],
                    listeners : {
                        click : this.clickOnColMenuItem.bind(this),
                        hide : function(){
                            this.removeClass('DG-grid-header-cell-over');
                        }.bind(el)
                    }
                });
            }
            if(this.isColumnSortable(i)){
                el.addEvent('click', this.sort.bind(this));
            }
            el.addEvent('mouseover', this.mouseoverHeader.bind(this));
            el.addEvent('mouseout', this.mouseoutHeader.bind(this));

            this.els.contentHeader.adopt(el);
            this.els.columnHeaders.push(el);
        }

    },

    addHeaderBackgroundElements : function(parent){
        var left = new Element('div');
        left.setStyles({
            position : 'absolute',
            left : '0px',
            top : '0px',
            width : '50%',
            height : '30px'
        });
        left.addEvent('mouseover', function(e){
            this.colMovable.setInsertPosition('before');
            this.colMovable.storeInitialInsertionPoint(e);
        }.bind(this));
        parent.adopt(left);
        var right = new Element('div');
        right.setStyles({
            position : 'absolute',
            right : '0px',
            top : '0px',
            width : '50%',
            height : '30px'
        });
        right.addEvent('mouseover', function(e){
            this.colMovable.setInsertPosition('after');
            this.colMovable.storeInitialInsertionPoint(e);
        }.bind(this));
        parent.adopt(right);
    },

    clickOnColMenuItem : function(obj, menu){
        switch(obj.event){
            case 'hide':
                this.hideColumn(obj.key);
                break;
        }
        menu.toggle();
    },

    showHideColMenu : function(e){
        var index = this.getColIndex(e.target);
        this.headerMenuObj[index].toggle();
        e.stop();
    },

    showColumn : function(key) {
        if(this.isColumnHidden(this.getColumnIndexByKey(key))){
            this.setColumnIsHidden(key, false);
        }
    },

    hideColumn : function(key) {
        if(this.isColumnVisible(this.getColumnIndexByKey(key))){
            this.setColumnIsHidden(key, true);
        }
    },

    setColumnIsHidden : function(key, isHidden) {
        var index = this.getColumnIndexByKey(key);
        if(index >=0){
            this.columnConfig[index].hidden = isHidden;
            this.refreshView();
        }
        this.showResizeHandles();

    },

    mouseoverHeader : function(e) {
        var index = this.getColIndex(e.target);
        if(!this.isResizeActive() && !this.isColumnDragActive() && this.isColumnSortable(index)){
            this.getHeaderEl(e.target).addClass('DG-grid-header-cell-over');
        }
    },

    mouseoutHeader : function(e) {
        if(!this.isResizeActive()){
            var index = this.getColIndex(e.target);
            if(this.headerMenuObj[index] && this.headerMenuObj[index].isActive()){
                return;
            }
            this.els.columnHeaders[index].removeClass('DG-grid-header-cell-over');
        }
    },

    getHeaderEl : function(el) {
        if(!el.hasClass('DG-grid-header-cell')){
            el = el.getParent('.DG-grid-header-cell');
        }
        return el;
    },

    getColIndex : function(el){
        var ret = el.getProperty('col-index');
        if(!ret && ret!='0'){
            ret = el.getParent().getProperty('col-index');
        }
        return ret;
    },

    sort : function(e) {
        var el = this.getHeaderEl(e.target);
        this.sortColumn(this.getColIndex(el));
        this.populateData();
    },

    clearSortClassNameFromHeaders : function() {
        for(var i=0;i<this.columnConfig.length;i++){
            var el = this.els.columnHeaders[i].getElements('span')[0];
            el.removeClass('DG-grid-header-cell-text-sort-asc');
            el.removeClass('DG-grid-header-cell-text-sort-desc');
        }
    },

    sortColumn : function(colIndex, direction) {
        if(this.isColumnSortable(colIndex) && this.data.length){
            this.clearSortClassNameFromHeaders();

            var key = this.columnConfig[colIndex].key;
            if(!direction){
                var direction = 'asc';
                if(key == this.sortState.key){
                    direction = this.sortState.direction == 'asc' ? 'desc' : 'asc'
                }
            }

            var sortFunc = this.getSortFunction(colIndex, direction);
            this.data.sort(sortFunc);

            this.sortState = {
                key : key,
                direction : direction
            };
            this.els.columnHeaders[colIndex].getElements('span')[0].addClass('DG-grid-header-cell-text-sort-' + direction)
        }
    },

    getSortFunction : function(colIndex, direction){
        var key = this.columnConfig[colIndex].key;

        if(this.columnConfig[colIndex].sortWith){
            var secondKey = this.columnConfig[colIndex].sortWith;
            if(direction == 'asc'){
                var sortFunc = function(a,b){
                    return a[key]+a[secondKey] < b[key]+b[secondKey] ? -1 : 1
                }
            }else{
                var sortFunc = function(a,b){
                    return a[key]+a[secondKey] > b[key]+b[secondKey] ? -1 : 1
                }
            }
        }else{
            if(direction == 'asc'){
                var sortFunc = function(a,b){
                    return a[key] < b[key] ? -1 : 1
                }
            }else{
                var sortFunc = function(a,b){
                    return a[key] > b[key] ? -1 : 1
                }
            }
        }
        return sortFunc;
    },

    isColumnSortable : function(colIndex) {
        if(colIndex!== 0 && !colIndex){
            return false;
        }
        return this.columnConfig[colIndex].sortable ? true : false;
    },

    createColResizeHandles : function() {
        this.els.resizeHandles = [];
        for(var i=0;i<this.columnConfig.length;i++){
            var el = this.createAColResizeHandle(i);
            this.getContentEl().adopt(el);
            el.addClass('DG-grid-resize-handle');
            el.setStyle('top', '0');
            el.addEvent('mouseenter', this.mouseOverResizeHandle.bind(this));
            el.addEvent('mouseleave', this.mouseOutResizeHandle.bind(this));
        }
    },

    mouseOverResizeHandle : function(e) {
        e.target.addClass('DG-grid-resize-handle-over');
    },
    mouseOutResizeHandle : function(e){
        e.target.removeClass('DG-grid-resize-handle-over');
    },

    resizeColumns : function() {
        var leftPos = 0;
        this.stretchLastColumn();

        for(var i=0;i<this.columnConfig.length;i++){
            if(this.isColumnHidden(i)){
                this.els.resizeHandles[i].setStyle('display', 'none');
            }else{
                var width = this.getColumnWidth(i);

                this.els.columnHeaders[i].setStyles({
                    'left' : leftPos,
                    'width' : width - this.getHorizontalBorderAndPadding(this.els.columnHeaders[i])
                });
                this.els.dataColumns[i].setStyles({
                    'left' : leftPos,
                    'width' : (width - this.getHorizontalBorderAndPadding(this.els.dataColumns[i]))
                });

                this.columnConfig[i].left = leftPos;

                leftPos += width;
                this.els.resizeHandles[i].setStyles({
                    'left' : leftPos,
                    'display' : this.isColumnResizable(i) ? '' : 'none'
                });
            }
        }

        var totalWidth  = this.getTotalWidthOfColumns();
        this.els.gridDataContainerTop.setStyle('width', totalWidth);
        this.scrollbar.horizontal.setContentSize(totalWidth);
        this.resizeComponentDOM();
    },

    getColumnCoordinates : function(index){
        return {
            left : this.columnConfig[index].left,
            width : this.getColumnWidth(index)
        }

    },

    getColumnWidth : function(index){
        return this.columnConfig[index].stretchWidth ? this.columnConfig[index].stretchWidth : this.columnConfig[index].width;
    },

    stretchLastColumn : function() {
        if(this.shouldStretchLastColumn()){
            for(var i=0;i<this.columnConfig.length;i++){
                this.columnConfig[i].stretchWidth = null;
            }

            var totalWidth = this.getTotalWidthOfColumns();
            var viewSize = this.getContentEl().getCoordinates().width - this.getHorizontalBorderAndPadding(this.getContentEl());
            var restSize = viewSize - totalWidth;
            if(restSize <=0){
                return;
            }

            this.columnConfig[this.getIndexOfLastVisibleColumn()].stretchWidth = this.columnConfig[this.getIndexOfLastVisibleColumn()].width + restSize;

        }
    },

    isLastVisibleColumn : function(index){
        return index == this.getIndexOfLastVisibleColumn();
    },

    getIndexOfLastVisibleColumn : function() {
        for(var i=this.columnConfig.length-1; i>=0; i--){
            if(this.isColumnVisible(i)){
                return i;
            }
        }
    },

    populateColumnHeaders : function() {
        for(var i=0;i<this.columnConfig.length;i++){
            if(this.isColumnHidden(i)){
                this.els.columnHeaders[i].setStyle('display', 'none');
            }else{
                this.els.columnHeaders[i].setStyle('display', '');
            }
            this.els.columnHeaders[i].getElements('span')[0].set('html', this.columnConfig[i].heading ? this.columnConfig[i].heading : '');
        }
    },

    lightVersion : false,

    populateData : function() {
        if(Browser.ie){
            this.populateDataIE();
            return;
        }
        contentHtml = [];
        for(var i=0;i<this.columnConfig.length;i++){
            var coordinates = this.getColumnCoordinates(i);

            if(this.isColumnHidden(i)){
                contentHtml.push('<div class="DG-grid-data-column" style="display:none"></div>')
            }else{
                contentHtml.push('<div colIndex="' + i + '" class="DG-grid-data-column DG-grid-data-column-' + i + ' ' + this.getColumnCssClass(i) + '">' + this.getHtmlTextForColumn(i)  + '</div>')
            }
        }
        this.els.gridDataContainer.set('html', contentHtml.join(''));
        this.els.dataColumns = this.els.gridDataContainer.getChildren('.DG-grid-data-column');
        this.fireEvent('renderdata', [this, this]);
        this.resizeColumns();
        this.resizeVerticalScrollbar();
    },

    getColumnCssClass : function(colIndex){
        if(this.isLastVisibleColumn(colIndex)){
            var ret = 'DG-grid-data-last-column-';
        }else{
            var ret = 'DG-grid-data-column-';
        }
        ret +=  this.columnConfig[colIndex].align ? this.columnConfig[colIndex].align : 'left';
        return ret;
    },

    populateDataIE : function() {
        this.els.gridDataContainer.set('html', '');
        this.createDataColumnElements();
        this.resizeColumns();

        for(var i=0;i<this.columnConfig.length;i++){
            if(this.isColumnHidden(i)){
                this.els.dataColumns[i].setStyle('display', 'none');
            }else{
                this.els.dataColumns[i].setStyle('display', '');
                this.els.dataColumns[i].set('html', this.getHtmlTextForColumn(i));
            }
        }

        this.resizeVerticalScrollbar();

    },

    resizeVerticalScrollbar : function() {
        var column = this.els.dataColumns[this.getIndexOfLastVisibleColumn()];
        if(!column){
            return;
        }
        var height = column.getSize().y;
        if(height === 0){
            this.resizeVerticalScrollbar.delay(300, this);
        }else{
            this.els.gridDataContainer.setStyle('height', height);
            this.scrollbar.vertical.setContentSize();
        }
    },

    createDataColumnElements : function() {
        this.els.dataColumns = [];
        for(var i=0;i<this.columnConfig.length;i++){
            var el = new Element('div');
            el.addClass('DG-grid-data-column');
            el.setProperty('colIndex', i);
            el.addClass(this.getColumnCssClass(i));
            this.els.gridDataContainer.adopt(el);
            this.els.dataColumns[i] = el;
        }
    },

    getHtmlTextForColumn : function (colIndex) {
        var ret = [];
        var cmpString = 'DG.CmpMgr.get(\'' + this.getId() + '\')';
        var rowClasses = ['DG-grid-data-odd-row', 'DG-grid-data-even-row'];

        for(var i=0, count = this.data.length ; i<count; i++){
            if(this.columnConfig[colIndex].key){
                var content = this.data[i][this.columnConfig[colIndex].key];
                if(this.columnConfig[colIndex].renderer){
                    content = this.columnConfig[colIndex].renderer(content, this.data[i]);
                }
            }else{
                if(this.columnConfig[colIndex].event){
                    var content = '<a href="#" onclick="' + cmpString + '.fireCustomEvent(\'' + this.columnConfig[colIndex].event + '\', ' + i + ');return false">' + this.columnConfig[colIndex].txt + '</a>';
                }else{
                    var content = this.columnConfig[colIndex].txt;
                }
            }
            var id = 'cell-' + colIndex + '-' + i;
            ret.push('<div id="' + id + '" class="DG-grid-data-cell ' + (rowClasses[i % 2]) + '" dataId="' + this.data[i].id + '" dataIndex="' + i + '"><span class="DG-grid-data-cell-text">' + content + '</span></div>');
        }
        return ret.join('');
    },

    isColumnResizable : function(columnIndex){
        if(columnIndex >= this.columnConfig.length){
            return true;
        }
        if(this.columnConfig[columnIndex].resizable == undefined){
            return true;
        }
        return this.columnConfig[columnIndex].resizable;
    },

    isColumnHidden : function(colIndex){
        return this.columnConfig[colIndex] && this.columnConfig[colIndex].hidden;
    },

    isColumnVisible : function(colIndex){
        return this.columnConfig[colIndex] && !this.columnConfig[colIndex].hidden
    },

    shouldStretchLastColumn : function() {
        return this.stretch;
    },

    getMinPosOfResizeHandle : function(colIndex) {
        var ret = this.getTotalWidthOfPreviousColumns(colIndex);
        ret += this.columnConfig[colIndex].minSize ? this.columnConfig[colIndex].minSize : 50;
        return ret;
    },
    getMaxPosOfResizeHandle : function(colIndex) {
        var ret = this.getTotalWidthOfPreviousColumns(colIndex);
        ret += this.columnConfig[colIndex].maxSize ? this.columnConfig[colIndex].maxSize : 600;
        return ret;
    },

    getTotalWidthOfPreviousColumns : function(colIndex){
        var ret = 0;
        for(var i=0; i<colIndex; i++){
            if(!this.isColumnHidden(i)){
                ret += this.columnConfig[i].width;
            }
        }
        return ret;
    },

    resizeColumn : function(colIndex, resizedBy){
        this.columnConfig[colIndex].width += resizedBy;
        this.resizeColumns();
    },

    getVerticalSpacingInGridHeaderCells : function() {
        return this.getHorizontalBorderAndPadding(this.els.columnHeaders[0]);
    },

    getHorizontalPaddingOfColumn : function() {
        return this.getHorizontalBorderAndPadding(this.els.dataColumns[0]);
    },

    getTotalWidthOfColumns : function() {
        var ret = 0;
        for(var i=0;i<this.columnConfig.length;i++){
            if(!this.isColumnHidden(i)){
                if(this.columnConfig[i].stretchWidth){
                    ret += Math.max(this.columnConfig[i].width, this.columnConfig[i].stretchWidth);
                }else{
                    ret += this.columnConfig[i].width;
                }

            }
        }
        return ret;
    },

    getItemProperties : function() {
        var ret = this.parent();
        ret.stretch = this.stretch;
        ret.columnConfig = this.columnConfig;
        return ret;
    },

    ifStretchHideLastResizeHandles : function(){
        if(this.shouldStretchLastColumn()){
            var index = this.getIndexOfLastVisibleColumn();
            for(var i=index; i<this.els.resizeHandles.length;i++){
                this.els.resizeHandles[i].setStyle('display', 'none');
            }
        }
    },

    getColumnIndexByKey : function(key){
        for(var i=0; i<this.columnConfig.length; i++){
            if(this.columnConfig[i].key == key){
                return i;
            }
        }
    },

    getGridDataEl : function() {
        return this.els.gridDataContainer;
    },

    getGridDataContainer : function() {
        return this.els.gridDataContainerTop;
    },

    cacheRowHeight : null,
    getRowHeight : function() {
        if(!this.cacheRowHeight){
            var cell = this.getGridDataEl().getElement('div.DG-grid-data-cell');
            if(!cell){
                return 25;
            }
            this.cacheRowHeight = cell.getSize().y;
        }
        return this.cacheRowHeight;
    },

    getColumnElByIndex : function(index){
        return this.els.dataColumns[index];
    },

    getCellAt : function(col, row) {
        var col = this.getColumnElByIndex(col);
        return col.getElements('.DG-grid-data-cell')[row];
    },

    getCellSelectionInColumn : function(col, fromRow, toRow){
        var ret = [];
        var col = this.getColumnElByIndex(col);
        var cells = col.getElements('.DG-grid-data-cell');
        for(var i=fromRow; i<=toRow; i++){
            ret.push(cells[i]);
        }
        return ret;
    },

    getCellsInColumn : function(col, fromRow, toRow){
        var ret = [];
        var cells = this.getCellSelectionInColumn(col, fromRow, toRow);
        for(var i=0, count = cells.length; i<count; i++){
            var obj = {
                text : cells[i].get('text'),
                coordinate : this.getAlphaNumericColumnName(col) + (fromRow + i + 1)
            };
            ret.push(obj);
        }
        return ret;
    },
    
    getAlphaNumericColumnName : function(colIndex) {
        return ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(colIndex,1)
    },

    scrollBy : function(x, y) {
        if(y){
            this.scrollbar.vertical.scrollBy(y);
        }
        if(x){
            this.scrollbar.horizontal.scrollBy(x);
        }
    }

});

// js/scroller.js

DG.Scroller = new Class({
    Extends : Events,
    els : {
        applyTo : null,
        el : null,
        elInner : null,
        parent : null
    },
    
    active : 0,
    wheelSize : 5,
    type : 'horizontal',
    currentSize : 0,
    
    initialize : function(config){
        this.type = config.type || this.type;    
        if(config.applyTo){
            this.setApplyTo(config.applyTo);

        }
        this.els.parent = config.parent ? document.id(config.parent) : null;
        if(config.mouseWheelSizeCls){
            this.determineMouseWheelSize(config.mouseWheelSizeCls);
        }
        this.createElements();
        this.createEvents();
    },

    setApplyTo : function(applyTo){

        if(instanceOf(applyTo, Array)){
            this.els.applyTo = applyTo;
        }else{
            this.els.applyTo = [applyTo];
        }

    },

    determineMouseWheelSize : function(cls){
        var el = new Element('div');
        el.addClass(cls);
        el.setStyle('visibility', 'hidden')
        document.id(document.body).adopt(el);
        this.wheelSize = el.getSize().y;
        if(!this.wheelSize){
            this.wheelSize = 25;
        }
        el.destroy();
    },

    createElements : function(){
        this.els.el = new Element('div');
        this.els.el.addClass('DG-scroller');
        this.els.el.addClass('DG-scroller-' + this.type);
        this.els.el.setStyles({
            'position' : 'relative',
            'z-index' : 1000,
            'overflow' : 'hidden'
        });

        if(this.type == 'horizontal'){
            this.els.el.setStyles({
                'overflow-x' : 'auto',
                'width' : '100%',
                'height' : '21px'
            });
        }else{
            this.els.el.setStyles({
                'overflow-y' : 'auto',
                'height' : '100%',
                'width' : '21px',
                'right' : '0px',
                'top' : '0px',
                'position' : 'absolute'
            });
        }

        this.els.el.addEvent('scroll', this.performScroll.bind(this));
        
        this.els.elInner = new Element('div');
        this.els.elInner.setStyle('position', 'relative');
        this.els.elInner.set('html', '&nbsp;');

        this.els.el.adopt(this.els.elInner);
    },

    createEvents : function() {
        this.els.elInner.addEvent('resize', this.toggle.bind(this));
        if(this.type == 'vertical'){
            for(var i=0; i< this.els.applyTo.length;i++){
                this.els.applyTo[i].addEvent('mousewheel', this.eventScroll.bind(this));
            }
        }
        document.id(window).addEvent('resize', this.resize.bind(this));
    },

    resize : function() {
        if(this.type == 'horizontal'){
            this.els.el.setStyle('width', this.els.parent.getSize().x);
        } else{
            var size = this.els.parent.getSize().y;
            if(size == 0){
                return;
            }
           this.els.el.setStyle('height', size);
        }

        this.toggle();
    },

    getEl : function(){
        return this.els.el;
    },

    setContentSize : function(size) {
        if(this.type == 'horizontal'){
            this.currentSize = size || this.getWidthOfScrollableElements();
            this.els.elInner.setStyle('width', this.currentSize);
        }else{
            this.currentSize = size || this.getHeightOfScrollableElements();
            if(this.currentSize <= 0){
                var el = this.els.applyTo.getChildren('.DG-grid-data-column');
                if(el.length){
                    this.currentSize = el[0].getSize().y;
                }
            }
            this.els.elInner.setStyle('height', this.currentSize);
        }

        if(this.currentSize <= 0){
            this.setContentSize.delay(1000, this);
        }


        this.resize();
        this.toggle();
    },

    getWidthOfScrollableElements : function() {
        var ret = 0;
        for(var i=0;i<this.els.applyTo.length;i++){
            ret += this.els.applyTo[i].getSize().x;
        }
        return ret;
    },

    getHeightOfScrollableElements : function() {
        var ret = 0;
        for(var i=0;i<this.els.applyTo.length;i++){
            ret += this.els.applyTo[i].getSize().y;
        }
        return ret;
    },

    eventScroll : function(e){
        this.els.el.scrollTop -= (e.wheel * this.wheelSize);
        return false;
    },
    
    performScroll : function(e){
        if(this.type == 'horizontal'){
            this.scrollTo(this.els.el.scrollLeft);
        }else{
            this.scrollTo(this.els.el.scrollTop);
        }
    },

    scrollBy : function(val){
        if(this.type == 'horizontal'){
            this.els.el.scrollLeft += val;
            this.scrollTo(this.els.el.scrollLeft);
        }else{
            this.els.el.scrollTop += val;
            this.scrollTo(this.els.el.scrollTop);
        }



    },

    scrollTo : function(val){
        if(this.type == 'horizontal'){
            for(var i=0;i<this.els.applyTo.length;i++){
                this.els.applyTo[i].style.left = (val *-1) + 'px';
            }
        }else{
            for(var i=0;i<this.els.applyTo.length;i++){
                this.els.applyTo[i].style.top = (val *-1) + 'px';
            }
        }
        this.fireEvent('scroll', this);
    },

    getHeight : function() {
        if(!this.active){
            return 0;
        }

        return this.els.el.getSize().y
    },

    getWidth : function() {
        if(!this.active){
            return 0;
        }
        return this.els.el.getSize().x
    },

    toggle : function() {
        if(this.shouldShowScrollbar()){
            this.show();
        } else {
            this.hide();
        }
    },

    shouldShowScrollbar : function() {
        if(this.type == 'horizontal'){
            var size = this.getParentEl().getSize().x;
        } else{
            var size = this.getParentEl().getSize().y;
        }
        return this.currentSize > size && size > 0;
    },

    getParentEl : function() {
        return this.els.parent ? this.els.parent : this.els.el;
    },

    show : function() {
        this.active = true;
        this.els.el.setStyle('display', '');
    },

    hide : function() {
        this.active = false;
        this.scrollTo(0);
        this.els.el.setStyle('display', 'none');
    }
});

// js/movable.js

DG.Movable = new Class({
    Extends : Events,
    sources : {},
    targets : {},
    els : {
        shim : null,
        insertionMarker : null
    },
    dragProperties : {
        el : null,
        waiting : null,
        countSources : 0,
        mouseOverCol : null,
        originalMousePos : {
            x : null,
            y : null
        },
        originalElPos : {
            x : null,
            y : null
        },
        jsObjects : {
            source : {
                item : null,
                column : null
            },
            target : {
                item : null,
                column : null,
                pos : null
            }
        }
    },
    id : null,
    delay : 1,
    
    initialize : function() {
        this.createElements();
        this.id = String.uniqueID();

        document.id(document.body).addEvent('mouseup', this.stopMove.bind(this));
        document.id(document.body).addEvent('mousemove', this.mouseMove.bind(this));
    },

    addSource : function(obj, handle) {
        var el = obj.getEl ? obj.getEl() : obj;
        if(el.hasClass('DG-movable')){
            return;
        }
        if(!el.id){
            el.id = 'DG-movable-' + String.uniqueID();
        }
        if(this.sources[el.id]){
            console.log('Error: ' + el.id + ' has duplicates');
        }
        this.sources[el.id] = obj;
        el.addClass('DG-movable');
        if(handle){
            var handleObj = el.getElements(handle)[0];
            try{
                handleObj.addEvent('mousedown', this.startMove.bind(this));
            }catch(e){
                console.log(obj);
            }
            handleObj.addClass('DG-movable-handle');
            handleObj.setStyle('cursor','move');
        }else{
            el.addEvent('mousedown', this.startMove.bind(this));
        }

    },

    addTarget : function(obj){
        var el = obj.getEl ? obj.getEl() : obj;
        if(!el.id){
            el.id = 'DG-movable-target-' + String.uniqueID();
        }
        this.targets[el.id] = obj;
        el.addEvent('mousemove', this.setCurrentDestination.bind(this));
        el.addEvent('mouseover', this.storeInitialInsertionPoint.bind(this));
        el.addClass('DG-movable-target');
    },

    storeInitialInsertionPoint : function() {

    },
    setWidthOfShimAndInsertionPoint : function(width) {
        this.els.shim.setStyle('width', width);
        this.els.insertionMarker.setStyles({
            width : width,
            display : ''
        });
    },

    setCurrentDestination : function(e) {

        if(this.dragProperties.mode == 'move'){
            //this.dragProperties.jsObjects.target.item = null;
            //this.dragProperties.jsObjects.target.pos = 'before';
        }

    },
    getTargetElementFromEvent : function(e){
        var el = e.target;
        if(!el.hasClass('DG-movable-target')){
            el = el.getParent('.DG-movable-target');
        }
        return el;
    },

    placeInsertionMarker : function() {

    },

    createElements : function() {
        this.createShim();
        this.createInsertionMarker();
    },

    createShim : function() {
        var el = this.els.shim = new Element('div');
        el.addClass('DG-dashboard-item-shim');
        document.id(document.body).adopt(el);
    },

    createInsertionMarker : function() {
        var el = this.els.insertionMarker = new Element('div');
        el.addClass('DG-dashboard-insertion-marker');
        el.setStyle('display','none');
        document.id(document.body).adopt(el);
    },

    stopMove : function(e) {
        if(this.dragProperties.waiting || this.dragProperties.mode){
            this.fireEvent('stop');
        }
        if(this.dragProperties.waiting){
            clearTimeout(this.dragProperties.waiting);
        }
        if(this.dragProperties.mode){
            this.dragProperties.mode = null;
            this.dragProperties.el.setStyle('display', '');
            this.els.shim.setStyle('display','none');
            this.els.insertionMarker.setStyle('display','none');
            this.fireEvent('drop', this);
        }
    },

    startMove : function(e) {

        this.fireEvent('start');
        this.dragProperties.el = e.target;
        if(!this.dragProperties.el.hasClass('DG-movable')){
            this.dragProperties.el = this.dragProperties.el.getParent('.DG-movable');
        }
        var coordinates = this.dragProperties.el.getCoordinates();

        this.els.shim.setStyles({
            left : coordinates.left,
            top : coordinates.top + 30,
            width : coordinates.width,
            height : coordinates.height,
            display : 'none'
        });
        this.dragProperties.mouseOverCol = null;
        this.dragProperties.jsObjects.target = {
            column : null,
            item : null
        };
        this.els.insertionMarker.setStyle('height', coordinates.height);

        this.dragProperties.jsObjects.source = {
            item : this.sources[this.dragProperties.el.id],
            column : this.sources[this.dragProperties.el.id].getParentComponent ? this.sources[this.dragProperties.el.id].getParentComponent() : null
        };

        this.dragProperties.originalElPos = {
            x : coordinates.left,
            y : coordinates.top
        };
        this.dragProperties.originalMousePos = {
            x : e.page.x,
            y : e.page.y
        };
        if(this.hasDelay()){
            this.dragProperties.waiting = this.startMoveAfterDelay.delay(this.delay * 1000, this);
        }else{
            this.hideElAndShowShim();
        }
    },

    hasDelay : function() {
        return this.delay > 0;
    },

    showShim : function() {
        this.els.shim.setStyle('display', '');
    },

    startMoveAfterDelay : function() {
        if(this.dragProperties.waiting){
            this.hideElAndShowShim();
        }
    },

    hideElAndShowShim : function() {
        this.dragProperties.el.setStyle('display', 'none');
        this.dragProperties.mode = 'move'
        this.showShim();
        this.setInitialInsertionPoint();
        this.placeInsertionMarker();
    },

    mouseMove : function(e) {
        if(this.dragProperties.mode == 'move'){
            this.els.shim.setStyles({
                left : this.dragProperties.originalElPos.x + e.page.x - this.dragProperties.originalMousePos.x,
                top : this.dragProperties.originalElPos.y + e.page.y - this.dragProperties.originalMousePos.y + 30
            });
        }
        return false;
    },

    setInitialInsertionPoint : function() {
        
    },
    isActive : function() {
        return this.dragProperties.mode ? true : false;
    },

    getSourceColumn : function() {
        return this.dragProperties.jsObjects.source.column;
    },
    getSourceItem : function() {
        return this.dragProperties.jsObjects.source.item;
    },
    getTargetColumn : function() {
        return this.dragProperties.jsObjects.target.column;
    },
    getTargetItem : function() {
        return this.dragProperties.jsObjects.target.item;
    },
    getTargetPosition : function() {
        return this.dragProperties.jsObjects.target.pos;
    }


});

// js/grid-column-movable.js

DG.GridColumnMovable = new Class({
    Extends : DG.Movable,
    delay : 0.5,

    currentPosOfInsertionMarker : {
        item : null
    },
    
    initialize : function(){
        this.parent();
        this.els.shim.addClass('DG-grid-movable-shim');
        this.els.insertionMarker.addClass('DG-grid-movable-insertion-marker');
        document.id(document.body).adopt(this.els.insertionMarker);
    },

    hideElAndShowShim : function(){
        this.parent();
        this.dragProperties.el.setStyle('display', '');

        this.els.shim.set('html', this.dragProperties.el.getChildren('span')[0].get('html'));
    },

    setCurrentDestination : function(e) {

    },

    startMove : function(e){
        this.parent(e);
        this.setInsertPosition('before');
        this.currentPosOfInsertionMarker = null;
        return false;
    },
    
    storeInitialInsertionPoint : function(e) {
        if(this.dragProperties.mode == 'move'){
            var el = this.getTargetElementFromEvent(e);
            this.dragProperties.jsObjects.target.item = el;

            var pos;
            if(this.isTargetNextSiblingOfSource()){
                pos = 'after';
            } else if(this.isTargetPreviousSiblingOfSource()){
                pos = 'before';
            }else{
                pos = this.getInsertPosition();
            }
            this.dragProperties.jsObjects.target.pos = pos;

            this.placeInsertionMarker();
        }
    },

    placeInsertionMarker : function() {
        if(this.dragProperties.jsObjects.target.item && this.currentPosOfInsertionMarker != this.dragProperties.jsObjects.target.item){
            this.currentPosOfInsertionMarker = this.dragProperties.jsObjects.target.item;
            if(this.isSourceAndTargetEqual()){
                this.els.insertionMarker.setStyle('display', 'none');
                return;
            }
            var coords = this.dragProperties.jsObjects.target.item.getCoordinates();
            var left = coords.left;
            if(this.dragProperties.jsObjects.target.pos == 'after'){
                left+= coords.width;
            }
            this.els.insertionMarker.setStyles({
                left : left,
                top : coords.top,
                display : ''
            });
        }
    },

    setInsertPosition : function(pos){
        this.insertPosition = pos;
        this.currentPosOfInsertionMarker = null;
    },
    getInsertPosition : function(){
        return this.insertPosition ? this.insertPosition : '';
    },
    isSourceAndTargetEqual : function() {
        return this.dragProperties.jsObjects.source.item == this.dragProperties.jsObjects.target.item;
    },

    isTargetNextSiblingOfSource : function() {
        return this.dragProperties.jsObjects.target.item == this.getNextVisibleSibling(this.dragProperties.jsObjects.source.item);
    },

    isTargetPreviousSiblingOfSource : function() {
        return this.dragProperties.jsObjects.target.item == this.getPreviousVisibleSibling(this.dragProperties.jsObjects.source.item);
    },
    getNextVisibleSibling : function(el) {
        var ret = el.getNext('.DG-movable');
        if(ret && ret.getStyle('display') == 'none'){
            return this.getNextVisibleSibling(ret);
        }
        return ret;
    },

    getPreviousVisibleSibling : function(el) {
        var ret = el.getPrevious('.DG-movable');
        if(ret && ret.getStyle('display') == 'none'){
            return this.getPreviousVisibleSibling(ret);
        }
        return ret;
    }
});

// js/dashboard-item-menu.js


DG.DashboardItemMenu = new Class({
    Extends : Events,
    els : {
        el : null,
        icon : null,
        text : null,
        alignTo : null,
        currentHighlightedItem : null,
        menuItems : []
    },
    active : null,

    align : 'right',

    menuConfig : [
    ],

    initialize : function(config) {
        this.menuConfig = config.menuConfig || this.menuConfig;
        if(config.alignTo){
            this.els.alignTo = document.id(config.alignTo);
        }
        this.align = config.align || this.align;
        this.width = config.width;
        if(config.listeners){
            this.addEvents(config.listeners);
        }
        this.createElements();

        window.addEvent('click', this.autoHide.bind(this));
    },

    createElements : function() {
        var el = this.els.el = new Element('div');
        el.addClass('DG-dashboard-menu');
        el.setStyle('display','none');
        document.id(document.body).adopt(el);
        if(this.width){
            el.setStyle('width', this.width);
        }
        this.createMenuItems();
    },
    
    createMenuItems : function() {
        this.clearMenuItems();
     
        for(var i=0;i<this.menuConfig.length;i++) {
            if(this.isSpacer(this.menuConfig[i])){
                var el = new Element('div');
                el.addClass('DG-dashboard-menu-item-spacer');
            }else{
                var el = this.els.menuItems[i] = new Element('div');
                el.addClass('DG-dashboard-menu-item');

                if(this.menuConfig[i].disabled){
                    el.addClass('DG-dashboard-menu-item-disabled');
                }else{
                    el.addEvent('mouseover', this.mouseoverMenuItem.bind(this));
                    el.addEvent('mouseout', this.mouseoutMenuItem.bind(this));
                    el.addEvent('click', this.clickOnMenuItem.bind(this));
                }
                el.setProperty('menu-index', i);
                var icon = new Element('div');
                icon.addClass('DG-dashboard-menu-item-icon');
                if(this.menuConfig[i].icon){
                    icon.setStyle('background-image', 'url(' + this.menuConfig[i].icon + ')');
                }
                el.adopt(icon);

                if(this.menuConfig[i].type && this.menuConfig[i].type == 'checkbox'){
                    var checkEl = new Element('input');
                    checkEl.setProperty('type', 'checkbox');
                    icon.adopt(checkEl);
                    if(this.menuConfig[i].checked){
                        checkEl.setProperty('checked', true);
                    }
                }

                var text = new Element('div');
                text.set('html', this.menuConfig[i].label);
                text.addClass('DG-dashboard-menu-item-text');
                el.adopt(text);
            }
            this.els.el.adopt(el);
        }
    },

    isSpacer : function(menuItemConfig){
        return menuItemConfig.spacer ? true : false
    },

    clearMenuItems : function() {
        this.clearDomElements('.DG-dashboard-menu-item');
        this.clearDomElements('.DG-dashboard-menu-item-spacer');
    },

    clearDomElements : function(cls){
        var els = this.els.el.getElements(cls);
        for(var i=els.length-1;i>=0;i--){
            els[i].dispose();
        }
    },

    clickOnMenuItem : function(e) {
        this.updateMenuItemDom(e.target);

        var menuConfigIndex = this.getMenuItemIndex(e.target);
        this.updateMenuItemConfig(menuConfigIndex);
        var events = ['click'];
        if(this.menuConfig[menuConfigIndex].event){
            events.push(this.menuConfig[menuConfigIndex].event);
        }
        for(var i=0;i<events.length;i++){
            this.fireEvent(events[i], [ this.menuConfig[menuConfigIndex], this]);
        }

    },

    updateMenuItemDom : function(clickEl) {
        var menuConfigIndex = this.getMenuItemIndex(clickEl);
        if(this.menuConfig[menuConfigIndex].type == 'checkbox' && clickEl.tagName.toLowerCase()!='input'){
            var el = this.els.menuItems[menuConfigIndex].getElement('input');
            el.setProperty('checked', el.getProperty('checked') == true ? false : true);
        }
    },

    updateMenuItemConfig : function(index) {
        if(this.menuConfig[index].type == 'checkbox'){
            this.menuConfig[index].checked = this.els.menuItems[index].getElements('input')[0].checked ? true : false;
        }
    },

    getMenuConfigByDomElement : function(el){
        return this.menuConfig[this.getMenuItemIndex(el)];
    },

    getMenuItemIndex : function(el) {
        el = this.getMenuItemEl(el);
        return el.getProperty('menu-index');
    },

    getMenuItemEl : function(el){
        if(!el.hasClass('DG-dashboard-menu-item')){
            el = el.getParent('.DG-dashboard-menu-item');
        }
        return el;
    },



    mouseoverMenuItem : function(e){
        this.getMenuItemElByEl(e).addClass('DG-dashboard-menu-item-over');
    },
    mouseoutMenuItem: function(e) {
        this.getMenuItemElByEl(e).removeClass('DG-dashboard-menu-item-over');
    },

    getMenuItemElByEl : function(e) {
        var el = e.target;
        if(!el.hasClass('DG-dashboard-menu-item')){
            el = el.getParent('.DG-dashboard-menu-item');
        }
        return el;
    },
    
    toggle : function(menuConfig) {
        if(this.active){
            this.hide();
        } else {
            this.show.delay(20, this);
        }
    },

    show : function() {
        this.fireEvent('show', this);

        
        if(this.menuConfig.length == 0){
            return;
        }
        this.els.el.setStyle('display','');
        this.els.el.setStyle('visibility','hidden');
        this.positionMenu();
        this.positionAndSetVisibility.delay(50, this);
        this.active = true;
    },

    positionAndSetVisibility : function() {
        this.els.el.setStyle('visibility','visible');
        this.positionMenu();
    },

    isActive : function() {
        return this.active;
    },


    hide : function() {
        this.els.el.setStyle('display','none');
        this.active = false;
        this.fireEvent('hide', this);
    },

    autoHide : function(e){
        if(this.active && !e.target.getParent('.DG-dashboard-menu')){
            this.hide();
        }
    },

    positionAt : function (x, y){
        this.els.el.setStyles({
            left : x,
            top : y
        });
    },

    positionMenu : function() {
        if(!this.els.alignTo){
            return;
        }
        var coords =  this.els.alignTo.getCoordinates();
        var leftPos = coords.left;
        if(this.align == 'right') {
            var size = this.els.el.getSize();
            leftPos -= size.x;
            leftPos +=  coords.width;
        }

        this.els.el.setStyles({
            left : leftPos,
            top : coords.top + coords.height
        });
    },

    setNewMenuConfig : function(menuConfig){
        this.menuConfig = menuConfig;
        this.createMenuItems();
    }
});

// js/movable.js

DG.Movable = new Class({
    Extends : Events,
    sources : {},
    targets : {},
    els : {
        shim : null,
        insertionMarker : null
    },
    dragProperties : {
        el : null,
        waiting : null,
        countSources : 0,
        mouseOverCol : null,
        originalMousePos : {
            x : null,
            y : null
        },
        originalElPos : {
            x : null,
            y : null
        },
        jsObjects : {
            source : {
                item : null,
                column : null
            },
            target : {
                item : null,
                column : null,
                pos : null
            }
        }
    },
    id : null,
    delay : 1,
    
    initialize : function() {
        this.createElements();
        this.id = String.uniqueID();

        document.id(document.body).addEvent('mouseup', this.stopMove.bind(this));
        document.id(document.body).addEvent('mousemove', this.mouseMove.bind(this));
    },

    addSource : function(obj, handle) {
        var el = obj.getEl ? obj.getEl() : obj;
        if(el.hasClass('DG-movable')){
            return;
        }
        if(!el.id){
            el.id = 'DG-movable-' + String.uniqueID();
        }
        if(this.sources[el.id]){
            console.log('Error: ' + el.id + ' has duplicates');
        }
        this.sources[el.id] = obj;
        el.addClass('DG-movable');
        if(handle){
            var handleObj = el.getElements(handle)[0];
            try{
                handleObj.addEvent('mousedown', this.startMove.bind(this));
            }catch(e){
                console.log(obj);
            }
            handleObj.addClass('DG-movable-handle');
            handleObj.setStyle('cursor','move');
        }else{
            el.addEvent('mousedown', this.startMove.bind(this));
        }

    },

    addTarget : function(obj){
        var el = obj.getEl ? obj.getEl() : obj;
        if(!el.id){
            el.id = 'DG-movable-target-' + String.uniqueID();
        }
        this.targets[el.id] = obj;
        el.addEvent('mousemove', this.setCurrentDestination.bind(this));
        el.addEvent('mouseover', this.storeInitialInsertionPoint.bind(this));
        el.addClass('DG-movable-target');
    },

    storeInitialInsertionPoint : function() {

    },
    setWidthOfShimAndInsertionPoint : function(width) {
        this.els.shim.setStyle('width', width);
        this.els.insertionMarker.setStyles({
            width : width,
            display : ''
        });
    },

    setCurrentDestination : function(e) {

        if(this.dragProperties.mode == 'move'){
            //this.dragProperties.jsObjects.target.item = null;
            //this.dragProperties.jsObjects.target.pos = 'before';
        }

    },
    getTargetElementFromEvent : function(e){
        var el = e.target;
        if(!el.hasClass('DG-movable-target')){
            el = el.getParent('.DG-movable-target');
        }
        return el;
    },

    placeInsertionMarker : function() {

    },

    createElements : function() {
        this.createShim();
        this.createInsertionMarker();
    },

    createShim : function() {
        var el = this.els.shim = new Element('div');
        el.addClass('DG-dashboard-item-shim');
        document.id(document.body).adopt(el);
    },

    createInsertionMarker : function() {
        var el = this.els.insertionMarker = new Element('div');
        el.addClass('DG-dashboard-insertion-marker');
        el.setStyle('display','none');
        document.id(document.body).adopt(el);
    },

    stopMove : function(e) {
        if(this.dragProperties.waiting || this.dragProperties.mode){
            this.fireEvent('stop');
        }
        if(this.dragProperties.waiting){
            clearTimeout(this.dragProperties.waiting);
        }
        if(this.dragProperties.mode){
            this.dragProperties.mode = null;
            this.dragProperties.el.setStyle('display', '');
            this.els.shim.setStyle('display','none');
            this.els.insertionMarker.setStyle('display','none');
            this.fireEvent('drop', this);
        }
    },

    startMove : function(e) {

        this.fireEvent('start');
        this.dragProperties.el = e.target;
        if(!this.dragProperties.el.hasClass('DG-movable')){
            this.dragProperties.el = this.dragProperties.el.getParent('.DG-movable');
        }
        var coordinates = this.dragProperties.el.getCoordinates();

        this.els.shim.setStyles({
            left : coordinates.left,
            top : coordinates.top + 30,
            width : coordinates.width,
            height : coordinates.height,
            display : 'none'
        });
        this.dragProperties.mouseOverCol = null;
        this.dragProperties.jsObjects.target = {
            column : null,
            item : null
        };
        this.els.insertionMarker.setStyle('height', coordinates.height);

        this.dragProperties.jsObjects.source = {
            item : this.sources[this.dragProperties.el.id],
            column : this.sources[this.dragProperties.el.id].getParentComponent ? this.sources[this.dragProperties.el.id].getParentComponent() : null
        };

        this.dragProperties.originalElPos = {
            x : coordinates.left,
            y : coordinates.top
        };
        this.dragProperties.originalMousePos = {
            x : e.page.x,
            y : e.page.y
        };
        if(this.hasDelay()){
            this.dragProperties.waiting = this.startMoveAfterDelay.delay(this.delay * 1000, this);
        }else{
            this.hideElAndShowShim();
        }
    },

    hasDelay : function() {
        return this.delay > 0;
    },

    showShim : function() {
        this.els.shim.setStyle('display', '');
    },

    startMoveAfterDelay : function() {
        if(this.dragProperties.waiting){
            this.hideElAndShowShim();
        }
    },

    hideElAndShowShim : function() {
        this.dragProperties.el.setStyle('display', 'none');
        this.dragProperties.mode = 'move'
        this.showShim();
        this.setInitialInsertionPoint();
        this.placeInsertionMarker();
    },

    mouseMove : function(e) {
        if(this.dragProperties.mode == 'move'){
            this.els.shim.setStyles({
                left : this.dragProperties.originalElPos.x + e.page.x - this.dragProperties.originalMousePos.x,
                top : this.dragProperties.originalElPos.y + e.page.y - this.dragProperties.originalMousePos.y + 30
            });
        }
        return false;
    },

    setInitialInsertionPoint : function() {
        
    },
    isActive : function() {
        return this.dragProperties.mode ? true : false;
    },

    getSourceColumn : function() {
        return this.dragProperties.jsObjects.source.column;
    },
    getSourceItem : function() {
        return this.dragProperties.jsObjects.source.item;
    },
    getTargetColumn : function() {
        return this.dragProperties.jsObjects.target.column;
    },
    getTargetItem : function() {
        return this.dragProperties.jsObjects.target.item;
    },
    getTargetPosition : function() {
        return this.dragProperties.jsObjects.target.pos;
    }


});