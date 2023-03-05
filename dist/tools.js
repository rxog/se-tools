(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = __importDefault(require("./modules/Utils"));
const Queue_1 = __importDefault(require("./modules/Queue"));
const Events_1 = __importDefault(require("./modules/Events"));
const seTools = {
    event: new Events_1.default(),
    queue: Queue_1.default,
    utils: Utils_1.default,
};
exports.default = seTools;
window.seTools = seTools;

},{"./modules/Events":4,"./modules/Queue":5,"./modules/Utils":6}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = __importDefault(require("./Utils"));
class ChatMessage {
    constructor(event) {
        this.badges = event.data.badges;
        this.badgeInfo = event.data.tags["badge-info"] || "";
        this.channel = event.data.channel;
        this.customRewardId = event.data.tags["custom-reward-id"] || null;
        this.highlighted = event.data.tags["msg-id"] === "highlighted-message";
        this.emotes = event.data.emotes;
        this.msgId = event.data.msgId;
        this.userId = event.data.userId;
        this.username = event.data.displayName;
        this.raw = event;
        this.renderedText = event.renderedText;
        this.text = Utils_1.default.trimSpaces(event.data.text);
        this.roles = this.getRoles();
        this.stats = this.getStats();
        this.time = new Date(event.data.time);
    }
    getWordList() {
        return Utils_1.default.createList(this.text, " ");
    }
    getRoles() {
        let roles = {
            staff: false,
            broadcaster: false,
            moderator: false,
            vip: false,
            subscriber: false,
        };
        for (let badge of this.badges) {
            switch (badge.type) {
                case "broadcaster":
                    roles.broadcaster = true;
                    break;
                case "moderator":
                    roles.moderator = true;
                    break;
                case "vip":
                    roles.vip = true;
                    break;
                case "subscriber":
                    roles.subscriber = true;
                    break;
                case "staff":
                    roles.staff = true;
                    break;
            }
        }
        return roles;
    }
    getStats() {
        const textLen = this.text.length;
        let stats = {};
        stats.wordCount = this.getWordList().length;
        stats.emoteCount = this.emotes.length;
        stats.emotePercentage = Utils_1.default.getPercentageOf(stats.emoteCount, stats.wordCount);
        stats.capsCount = (this.text.match(/[A-Z]/g) || []).length;
        stats.capsPercentage = Utils_1.default.getPercentageOf(stats.capsCount, textLen);
        stats.specialCharsCount = (this.text.match(/[^a-zA-Z0-9\s]/g) || []).length;
        stats.specialCharsPercentage = Utils_1.default.getPercentageOf(stats.specialCharsCount, textLen);
        return stats;
    }
    getDisplayColor() {
        return Utils_1.default.isset(this.raw.data.displayColor)
            ? this.raw.data.displayColor
            : Utils_1.default.getRandomHexColor();
    }
    hasRole(role) {
        switch (role) {
            case "broadcaster":
            case "streamer":
                return this.roles.broadcaster === true;
            case "moderator":
            case "mod":
                return this.roles.moderator === true;
            case "vip":
                return this.roles.vip === true;
            case "subscriber":
            case "sub":
                return this.roles.subscriber === true;
            case "staff":
                return this.roles.staff === true;
            default:
                return false;
        }
    }
    isBroadcaster() {
        return this.roles.broadcaster === true;
    }
    isModerator() {
        return this.roles.moderator === true;
    }
    isVIP() {
        return this.roles.vip === true;
    }
    isSubscriber() {
        return this.roles.subscriber === true;
    }
    isStaff() {
        return this.roles.staff === true;
    }
    hasPrimeBadge() {
        return this.badges.includes("premium");
    }
    hasTurboBadge() {
        return this.badges.includes("turbo");
    }
    getTierBadge() {
        const match = Utils_1.default.matchRegexGroups(this.raw.data.tags.badges, /subscriber\/(?<tier>[2|3]0)?[0-9]+/i);
        if (!match.tier)
            return 0;
        if (match.tier === "20")
            return 2;
        if (match.tier === "30")
            return 3;
        return 1;
    }
    getMonthsSubscribed() {
        const match = Utils_1.default.matchRegexGroups(this.badgeInfo, /subscriber\/(?<months>[1-9][0-9]*)/i);
        return (match === null || match === void 0 ? void 0 : match.months) ? parseInt(match.months) : 0;
    }
    getBitsBadge() {
        const match = Utils_1.default.matchRegexGroups(this.raw.data.tags.badges, /bits\/(?<bits>[1-9][0-9]*)/i);
        return (match === null || match === void 0 ? void 0 : match.bits) ? parseInt(match.bits) : 0;
    }
    getGiftsBadge() {
        const match = Utils_1.default.matchRegexGroups(this.raw.data.tags.badges, /sub-gifter\/(?<gifts>[1-9][0-9]*)/i);
        return (match === null || match === void 0 ? void 0 : match.gifts) ? parseInt(match.gifts) : 0;
    }
    isAction() {
        return this.raw.data.isAction === true;
    }
    isCustomReward() {
        return Utils_1.default.isset(this.customRewardId);
    }
    isHighlight() {
        return this.highlighted;
    }
    isCommand(cmdName = "") {
        const cmd = cmdName.startsWith("!") ? cmdName : "!" + cmdName;
        return this.text.startsWith(cmd);
    }
    getCommand(withArgs = false) {
        if (!this.isCommand())
            return null;
        const match = Utils_1.default.matchRegexGroups(this.text, /^!(?<cmd>\w+)\s?\@?(?<args>[\w\s?]*)/i);
        if (!match)
            return null;
        return withArgs
            ? { command: match.cmd, args: Utils_1.default.createList(match.args, " ", true) }
            : match.cmd;
    }
    contains(text, caseSensitive = false) {
        return Utils_1.default.containsText(this.text, text, caseSensitive);
    }
    containsRegex(regex) {
        return Utils_1.default.matchesRegex(this.text, regex);
    }
    usernameOnList(list) {
        var _a;
        if (Array.isArray(list) && list.length > 0) {
            for (let entry of list) {
                if (((_a = entry.toLocaleLowerCase) === null || _a === void 0 ? void 0 : _a.call(entry)) === this.username.toLocaleLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }
    hasUsername(name) {
        var _a;
        return this.username.toLocaleLowerCase() === ((_a = name.toLocaleLowerCase) === null || _a === void 0 ? void 0 : _a.call(name));
    }
    hasUserId(id) {
        return this.userId === String(id);
    }
    usernameContains(text, caseSensitive = false) {
        return Utils_1.default.containsText(this.username, text, caseSensitive);
    }
    usernameContainsRegex(regex) {
        return Utils_1.default.matchesRegex(this.username, regex);
    }
}
exports.default = ChatMessage;

},{"./Utils":6}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
exports.events = [
    { name: "Subscriber", listener: "subscriber-latest" },
    { name: "Resub", listener: "subscriber-latest" },
    { name: "SubGift", listener: "subscriber-latest" },
    { name: "CommunityGift", listener: "subscriber-latest" },
    { name: "SubBomb", listener: "subscriber-latest" },
    { name: "SubBombComplete", listener: "subscriber-latest" },
    { name: "Tip", listener: "tip-latest" },
    { name: "Cheer", listener: "cheer-latest" },
    { name: "Host", listener: "host-latest" },
    { name: "Raid", listener: "raid-latest" },
    { name: "Follow", listener: "follower-latest" },
    { name: "Message", listener: "message" },
    { name: "DeleteMessage", listener: "delete-message" },
    { name: "DeleteMessages", listener: "delete-messages" },
    { name: "EventSkip", listener: "event:skip" },
    { name: "BotCounter", listener: "bot:counter" },
    { name: "WidgetButton", listener: "event:test" },
    { name: "KVStoreUpdate", listener: "kvstore:update" },
    { name: "ToggleSound", listener: "alertService:toggleSound" },
];

},{}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChatMessage_1 = __importDefault(require("./ChatMessage"));
const EventList_1 = require("./EventList");
const Utils_1 = __importDefault(require("./Utils"));
class Events {
    constructor() {
        this.skippable = [
            "bot:counter",
            "event:test",
            "event:skip",
            "message",
            "kvstore:update",
            "alertService:toggleSound",
        ];
        this.giftCollection = {};
        this.expectedEventListeners = [];
        this.expectedEventNames = [];
        this.expectsOnWidgetLoad = Utils_1.default.funcExists("onWidgetLoad");
        this.expectsOnSessionUpdate = Utils_1.default.funcExists("onSessionUpdate");
        this.useSenderCorrection = true;
        this.preflightEventListeners();
        this.registerOnWidgetLoad();
        this.registerOnSessionUpdate();
        this.registerOnEventReceived();
    }
    disableSenderCorrection() {
        this.useSenderCorrection = false;
    }
    isSkippable(event) {
        return this.skippable.includes(event);
    }
    preflightEventListeners() {
        for (let event of EventList_1.events) {
            if (Utils_1.default.funcExists(`on${event.name}`)) {
                if (!this.expectsEventListener(event.listener)) {
                    this.expectedEventListeners.push(event.listener);
                }
                this.expectedEventNames.push(event.name);
            }
        }
    }
    registerOnWidgetLoad() {
        if (this.expectsOnWidgetLoad) {
            window.addEventListener("onWidgetLoad", this.onWidgetLoadHandler.bind(this));
        }
    }
    unregisterOnWidgetLoad() {
        window.removeEventListener("onWidgetLoad", this.onWidgetLoadHandler);
    }
    registerOnSessionUpdate() {
        if (this.expectsOnSessionUpdate) {
            window.addEventListener("onSessionUpdate", this.onSessionUpdateHandler.bind(this));
        }
    }
    unregisterOnSessionUpdate() {
        window.removeEventListener("onSessionUpdate", this.onSessionUpdateHandler);
    }
    registerOnEventReceived() {
        if (this.expectsEvents()) {
            window.addEventListener("onEventReceived", this.onEventReceivedHandler.bind(this));
        }
    }
    unregisterOnEventReceived() {
        window.removeEventListener("onEventReceived", this.onEventReceivedHandler);
    }
    expectsEventListener(listener) {
        return this.expectedEventListeners.includes(listener);
    }
    expectsEvents() {
        return this.expectedEventNames.length > 0;
    }
    expectsEventName(name) {
        return this.expectedEventNames.includes(name);
    }
    onWidgetLoadHandler(e) {
        Utils_1.default.callFunc("onWidgetLoad", e);
    }
    onSessionUpdateHandler(e) {
        Utils_1.default.callFunc("onSessionUpdate", e);
    }
    onSubscriberHandler(e) {
        Utils_1.default.callFunc("onSubscriber", e);
    }
    onResubHandler(e) {
        Utils_1.default.callFunc("onResub", e);
    }
    onSubGiftHandler(e) {
        Utils_1.default.callFunc("onSubGift", e);
    }
    onCommunityGiftHandler(e) {
        Utils_1.default.callFunc("onCommunityGift", e);
    }
    onSubBombHandler(e) {
        Utils_1.default.callFunc("onSubBomb", e);
    }
    onSubBombCompleteHandler(e, recipients) {
        Utils_1.default.callFunc("onSubBombComplete", e, recipients);
    }
    onTipHandler(e) {
        Utils_1.default.callFunc("onTip", e);
    }
    onCheerHandler(e) {
        Utils_1.default.callFunc("onCheer", e);
    }
    onHostHandler(e) {
        Utils_1.default.callFunc("onHost", e);
    }
    onRaidHandler(e) {
        Utils_1.default.callFunc("onRaid", e);
    }
    onFollowHandler(e) {
        Utils_1.default.callFunc("onFollow", e);
    }
    onMessageHandler(e) {
        const data = e.service.toLowerCase() === "twitch" ? new ChatMessage_1.default(e) : e;
        Utils_1.default.callFunc("onMessage", data);
    }
    onDeleteMessageHandler(e) {
        Utils_1.default.callFunc("onDeleteMessage", e);
    }
    onDeleteMessagesHandler(e) {
        Utils_1.default.callFunc("onDeleteMessages", e);
    }
    onEventSkipHandler() {
        Utils_1.default.callFunc("onEventSkip");
    }
    onBotCounterHandler(e) {
        Utils_1.default.callFunc("onBotCounter", e);
    }
    onWidgetButtonHandler(e) {
        Utils_1.default.callFunc("onWidgetButton", e);
    }
    onKVStoreUpdateHandler(e) {
        Utils_1.default.callFunc("onKVStoreUpdate", e);
    }
    onToggleSoundHandler(e) {
        Utils_1.default.callFunc("onToggleSound", e);
    }
    onEventReceivedHandler(p) {
        var _a, _b, _c, _d, _e;
        const l = (_a = p === null || p === void 0 ? void 0 : p.detail) === null || _a === void 0 ? void 0 : _a.listener;
        const e = (_b = p === null || p === void 0 ? void 0 : p.detail) === null || _b === void 0 ? void 0 : _b.event;
        // Chat message
        if (this.expectsEventName("Message") && l === "message") {
            this.onMessageHandler(e);
        }
        // Single message deleted
        else if (this.expectsEventName("DeleteMessage") && l === "delete-message") {
            this.onDeleteMessageHandler(e);
        }
        // Multiple messages deleted (User Timeout)
        else if (this.expectsEventName("DeleteMessages") &&
            l === "delete-messages") {
            this.onDeleteMessagesHandler(e);
        }
        // Check type of subscription
        else if (l === "subscriber-latest") {
            // Correct sender on test alerts
            if (this.useSenderCorrection &&
                e.isTest &&
                !(e.gifted && e.isCommunityGift) &&
                !e.bulkGifted) {
                e.sender = undefined;
            }
            // New Sub
            if (this.expectsEventName("Subscriber") &&
                !e.gifted &&
                e.amount === 1 &&
                e.sender === undefined) {
                this.onSubscriberHandler(e);
            }
            // Gift
            else if (this.expectsEventName("SubGift") &&
                e.gifted &&
                !e.isCommunityGift) {
                this.onSubGiftHandler(e);
            }
            // Resub
            else if (this.expectsEventName("Resub") &&
                e.amount > 1 &&
                e.sender === undefined) {
                this.onResubHandler(e);
            }
            // SubBomb - Main
            else if (e.bulkGifted) {
                if (this.expectsEventName("SubBombComplete")) {
                    const g = (_c = e === null || e === void 0 ? void 0 : e.sender) === null || _c === void 0 ? void 0 : _c.toLowerCase();
                    if (g && this.giftCollection[g] === undefined) {
                        this.giftCollection[g] = { amount: e.amount, recipients: [] };
                    }
                }
                if (this.expectsEventName("SubBomb")) {
                    this.onSubBombHandler(e);
                }
            }
            // SubBomb - Gift
            else if (e.gifted && e.isCommunityGift) {
                if (this.expectsEventName("CommunityGift")) {
                    this.onCommunityGiftHandler(e);
                }
                if (this.expectsEventName("SubBombComplete")) {
                    const g = (_d = e === null || e === void 0 ? void 0 : e.sender) === null || _d === void 0 ? void 0 : _d.toLowerCase();
                    if (g && this.giftCollection[g] !== undefined) {
                        this.giftCollection[g].recipients.push(e.name);
                        if (this.giftCollection[g].amount ===
                            ((_e = this.giftCollection[g].recipients) === null || _e === void 0 ? void 0 : _e.length)) {
                            e.amount = this.giftCollection[g].amount;
                            this.onSubBombCompleteHandler(e, this.giftCollection[g].recipients);
                            delete this.giftCollection[g];
                        }
                    }
                }
            }
        }
        // Tip
        else if (this.expectsEventName("Tip") && l === "tip-latest") {
            this.onTipHandler(e);
        }
        // Cheer
        else if (this.expectsEventName("Cheer") && l === "cheer-latest") {
            this.onCheerHandler(e);
        }
        // Host
        else if (this.expectsEventName("Host") && l === "host-latest") {
            this.onHostHandler(e);
        }
        // Raid
        else if (this.expectsEventName("Raid") && l === "raid-latest") {
            this.onRaidHandler(e);
        }
        // Follow
        else if (this.expectsEventName("Follow") && l === "follower-latest") {
            this.onFollowHandler(e);
        }
        // Bot-Counter updated
        else if (this.expectsEventName("BotCounter") && l === "bot:counter") {
            this.onBotCounterHandler(e);
        }
        // Event skipped
        else if (this.expectsEventName("EventSkip") && l === "event:skip") {
            this.onEventSkipHandler();
        }
        // Widget-Button pressed
        else if (this.expectsEventName("WidgetButton") &&
            l === "event:test" &&
            e.listener === "widget-button") {
            this.onWidgetButtonHandler(e);
        }
        // Key-Value-Store updated
        else if (this.expectsEventName("KVStoreUpdate") && l === "kvstore:update") {
            this.onKVStoreUpdateHandler(e.data);
        }
        // Alerts were (un)muted by the user
        else if (this.expectsEventName("ToggleSound") &&
            l === "alertService:toggleSound") {
            this.onToggleSoundHandler(e);
        }
    }
}
exports.default = Events;

},{"./ChatMessage":2,"./EventList":3,"./Utils":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor() {
        this.queue = [];
        this.inUse = false;
    }
    get length() {
        return this.queue.length;
    }
    get isEmpty() {
        return this.queue.length === 0;
    }
    add(element) {
        this.queue.push(element);
    }
    remove(index, deleteCount = 1) {
        if (index < 0) {
            index = this.queue.length + index;
        }
        if (index >= 0 && index <= this.queue.length - 1) {
            this.queue.splice(index, deleteCount);
        }
    }
    removeFirst() {
        this.remove(0);
    }
    removeLast() {
        this.remove(-1);
    }
    get(index) {
        if (index >= 0 && index <= this.queue.length - 1) {
            return this.queue[index];
        }
        if (index < 0 && Math.abs(index) <= this.queue.length) {
            return this.queue[this.queue.length + index];
        }
        return null;
    }
    get first() {
        return this.get(0);
    }
    get last() {
        return this.get(-1);
    }
    processFirst(promiseFunc, delayAfter = 0) {
        return new Promise((resolve, reject) => {
            const first = this.first;
            if (first !== null && !this.inUse) {
                this.inUse = true;
                promiseFunc(first)
                    .then(() => {
                    setTimeout(() => {
                        this.removeFirst();
                        this.inUse = false;
                        resolve();
                    }, delayAfter);
                })
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    processAll(promiseFunc, delayBetween = 0) {
        return new Promise((resolve, reject) => {
            const processNext = () => {
                const element = this.first;
                if (element !== null && !this.inUse) {
                    this.inUse = true;
                    promiseFunc(element)
                        .then(() => {
                        this.removeFirst();
                        this.inUse = false;
                        if (this.isEmpty) {
                            resolve();
                        }
                        else {
                            setTimeout(processNext, delayBetween);
                        }
                    })
                        .catch((error) => {
                        this.inUse = false;
                        reject(error);
                    });
                }
                else {
                    resolve();
                }
            };
            processNext();
        });
    }
}
exports.default = Queue;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
}
exports.default = Utils;
Utils.isset = (field, noEmptyString = true) => {
    if (noEmptyString) {
        return field !== null && field !== undefined && field !== "";
    }
    else {
        return field !== null && field !== undefined;
    }
};
Utils.allset = (...fields) => {
    for (let field of fields) {
        if (!Utils.isset(field)) {
            return false;
        }
    }
    return true;
};
Utils.resolves = (path, item) => {
    let props = path.split(".");
    for (let prop of props) {
        if (item[prop] === undefined) {
            return false;
        }
        item = item[prop];
    }
    return true;
};
Utils.funcExists = (funcName) => {
    return typeof window[funcName] !== "undefined";
};
Utils.callFunc = (funcName, ...params) => {
    if (Utils.funcExists(funcName)) {
        window[funcName](...params);
    }
};
Utils.isString = (value) => {
    return typeof value === "string";
};
Utils.trimSpaces = (text) => {
    if (!Utils.isset(text))
        return "";
    if (!Utils.isString(text))
        return String(text);
    return text.replace(/\s+/g, " ").trim();
};
Utils.createList = (baseText, splitter = ",", deleteEmptyStrings = false) => {
    if (!Utils.isString(baseText))
        return [];
    const list = baseText.split(splitter).map((item) => Utils.trimSpaces(item));
    if (deleteEmptyStrings) {
        return list.filter((item) => item !== "");
    }
    return list;
};
Utils.containsText = (text, snippet, caseSensitive = false) => {
    if (!Utils.isString(text) || !Utils.isString(snippet))
        return null;
    return Utils.allset(text, snippet)
        ? (caseSensitive && text.includes(snippet)) ||
            text.toLocaleLowerCase().includes(snippet === null || snippet === void 0 ? void 0 : snippet.toLocaleLowerCase())
        : false;
};
Utils.formatCurrency = (amount, currency, locale) => {
    const minimumFractionDigits = Utils.isWholeNumber(amount) ? 0 : 2;
    return amount.toLocaleString(locale, {
        style: "currency",
        minimumFractionDigits,
        currency,
    });
};
Utils.matchesRegex = (text, regex) => {
    return Utils.allset(text, regex) ? regex.test(text) : false;
};
Utils.matchRegexGroups = (text, regex) => {
    var _a;
    const match = regex.exec(text);
    return (_a = match === null || match === void 0 ? void 0 : match.groups) !== null && _a !== void 0 ? _a : null;
};
Utils.divisibleBy = (dividend, divisor) => {
    return divisor === 0 ? false : dividend % divisor === 0;
};
Utils.isWholeNumber = (number) => {
    return Utils.divisibleBy(number, 1);
};
Utils.nextIterator = (i, max, step = 1) => {
    return Math.abs(i) >= Math.abs(max) ? 0 : i + step;
};
Utils.formatTimerValue = (number) => {
    return String(number).padStart(2, "0");
};
Utils.getRandomNumber = (min, max) => {
    const realMin = Math.min(min, max);
    const realMax = Math.max(min, max);
    return Math.floor(Math.random() * (realMax - realMin + 1)) + realMin;
};
Utils.getRandomDecimal = (min, max, decimalPlaces = 2) => {
    const randomNumber = Utils.getRandomNumber(min * Math.pow(10, decimalPlaces), max * Math.pow(10, decimalPlaces));
    return randomNumber / Math.pow(10, decimalPlaces);
};
Utils.getPercentageOf = (value, percentageOf) => {
    return value > 0 && percentageOf > 0 ? (value / percentageOf) * 100 : 0;
};
Utils.getRandomRGBObject = () => {
    const r = Utils.getRandomNumber(0, 255);
    const g = Utils.getRandomNumber(0, 255);
    const b = Utils.getRandomNumber(0, 255);
    return { r, g, b };
};
Utils.getRandomHexColor = () => {
    const { r, g, b } = Utils.getRandomRGBObject();
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
};
Utils.getRandomRGBColor = () => {
    const { r, g, b } = Utils.getRandomRGBObject();
    return `rgb(${r}, ${g}, ${b})`;
};
Utils.getRandomRGBAColor = (alpha) => {
    const a = alpha >= 0 && alpha <= 1 ? alpha : 1;
    const { r, g, b } = Utils.getRandomRGBObject();
    return `rgb(${r}, ${g}, ${b}, ${a})`;
};
Utils.isChrome = () => {
    return Utils.matchesRegex(window.navigator.userAgent, /chrom(e|ium)/i);
};
Utils.getChromeVersion = (fullVersion = false) => {
    var _a;
    const match = Utils.matchRegexGroups(window.navigator.userAgent, /chrom(e|ium)\/(?<version>[0-9]+(?:\.[0-9]+){0,3})/i);
    const value = (_a = match === null || match === void 0 ? void 0 : match.version) !== null && _a !== void 0 ? _a : 0;
    return fullVersion ? value : parseInt(value);
};
Utils.isOBSBrowserSource = () => {
    return Utils.isset(window.obsstudio);
};
Utils.camelCaseToKebabCase = (str) => {
    return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
};
Utils.kebabCaseToCamelCase = (str) => {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};
Utils.parseTier = (value, primeAsTier1 = false) => {
    if (value === "prime")
        return primeAsTier1 ? 1 : value;
    if (typeof value === "string")
        value = Number(value);
    switch (value) {
        case 1000:
        case 1:
            return 1;
        case 2000:
        case 2:
            return 2;
        case 3000:
        case 3:
            return 3;
        default:
            return 0;
    }
};

},{}]},{},[1]);
