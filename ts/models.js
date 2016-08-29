"use strict";
var VOAsset = (function () {
    function VOAsset(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOAsset;
}());
exports.VOAsset = VOAsset;
var VOPlayLists_Assets = (function () {
    function VOPlayLists_Assets(obj) {
        for (var str in obj)
            this[str] = obj[str];
        if (!this.lasting)
            this.lasting = this.duration;
    }
    return VOPlayLists_Assets;
}());
exports.VOPlayLists_Assets = VOPlayLists_Assets;
var VOPlayListProps = (function () {
    function VOPlayListProps(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOPlayListProps;
}());
exports.VOPlayListProps = VOPlayListProps;
var VOPlaylist = (function () {
    function VOPlaylist(obj) {
        for (var str in obj)
            this[str] = obj[str];
        var ar = [];
        if (this.list)
            this.list.forEach(function (item) { ar.push(new VOPlayLists_Assets(item)); });
        this.list = ar;
        this.props = new VOPlayListProps(this.props || {});
    }
    return VOPlaylist;
}());
exports.VOPlaylist = VOPlaylist;
var VOLayoutProps = (function () {
    function VOLayoutProps(obj) {
        for (var str in obj)
            this[str] = obj[str];
        if (!this.id)
            this.id = -1;
    }
    return VOLayoutProps;
}());
exports.VOLayoutProps = VOLayoutProps;
var VOLayout = (function () {
    function VOLayout(obj) {
        for (var str in obj)
            this[str] = obj[str];
        var vps = [];
        if (obj.viewports) {
            obj.viewports.forEach(function (item) {
                vps.push(new VOViewport(item));
            });
        }
        this.viewports = vps;
        this.props = new VOLayoutProps(this.props);
    }
    return VOLayout;
}());
exports.VOLayout = VOLayout;
var VOTemplate = (function () {
    function VOTemplate(obj) {
        for (var str in obj)
            this[str] = obj[str];
        var out = [];
        if (obj.viewports) {
            obj.viewports.forEach(function (item) {
                out.push(new VOViewport(item));
            });
        }
        this.viewports = out;
    }
    return VOTemplate;
}());
exports.VOTemplate = VOTemplate;
var VOViewport = (function () {
    function VOViewport(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOViewport;
}());
exports.VOViewport = VOViewport;
var VODevice = (function () {
    function VODevice(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VODevice;
}());
exports.VODevice = VODevice;
var UpdateResult = (function () {
    function UpdateResult(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return UpdateResult;
}());
exports.UpdateResult = UpdateResult;
var VOStats = (function () {
    function VOStats(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOStats;
}());
exports.VOStats = VOStats;
var VOUserData = (function () {
    function VOUserData(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOUserData;
}());
exports.VOUserData = VOUserData;
