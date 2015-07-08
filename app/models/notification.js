/**
 * Notification Object, extending Ember.Object.
 * All the Ember benefits, but not using Ember Data.
 * @prop  {string} id                                   - UUID (use utils/uuid)
 * @prop  {string} type                                 - (upload || download || generic)
 * @prop  {string} text                                 - Text on the notification
 * @prop  {int} progress                                - -1: Ongoing, status unknown. 0-100: Progress in %
 * @prop  {string} timestamp                            - When was the notification created?
 * @prop  {Ember.Controller} _notificationsCtrlRef      - Reference to the notifications controller
 *
 */
export default Ember.Object.extend({
    id: null,
    type: null,
    text: null,
    progress: null,
    timestamp: null,
    notificationsCtrlRef: null,
    subnotifications: [],
    customData: {},
    cleanup: null,
    isRunning: function () {
        return (this.get('progress') !== null && this.get('progress') < 100 && this.get('progress') >= 0);
    }.property('progress'),

    isErroredOut: function () {
        return this.get('progress') < 0;
    }.property('progress'),

    progressStyle: function () {
        let width = 100 - this.get('progress'),
            widthDone = this.get('progress'),
            style = `background: linear-gradient(90deg, #c2d9a5 ${widthDone}%, #e7e7e8 ${width}%)`;

        return (this.get('progress') > -1) ? style.htmlSafe() : '';
    }.property('progress')
});
