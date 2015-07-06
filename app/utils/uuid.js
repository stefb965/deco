/**
 * Make a simple UUID.
 */
export default {
    _s4: function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    },

    makeUUID: function () {
        var s4 = this._s4;
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
};
