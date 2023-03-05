import Utils from "./Utils";
import { MessageEvent, ChatMessageStats, Roles } from "./Interfaces";

export default class ChatMessage {
  badges: any[];
  badgeInfo: string;
  channel: string;
  customRewardId: string | null;
  highlighted: boolean;
  emotes: any;
  msgId: string;
  userId: string;
  username: string;
  raw: any;
  renderedText: string;
  text: string;
  roles: Roles;
  stats: ChatMessageStats;
  time: Date;

  constructor(event: MessageEvent) {
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
    this.text = Utils.trimSpaces(event.data.text);
    this.roles = this.getRoles();
    this.stats = this.getStats();
    this.time = new Date(event.data.time);
  }

  private getWordList(): Array<string> {
    return Utils.createList(this.text, " ");
  }

  public getRoles(): Roles {
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

  public getStats(): ChatMessageStats {
    const textLen = this.text.length;
    let stats = {} as ChatMessageStats;
    stats.wordCount = this.getWordList().length;
    stats.emoteCount = this.emotes.length;
    stats.emotePercentage = Utils.getPercentageOf(
      stats.emoteCount,
      stats.wordCount
    );
    stats.capsCount = (this.text.match(/[A-Z]/g) || []).length;
    stats.capsPercentage = Utils.getPercentageOf(stats.capsCount, textLen);
    stats.specialCharsCount = (this.text.match(/[^a-zA-Z0-9\s]/g) || []).length;
    stats.specialCharsPercentage = Utils.getPercentageOf(
      stats.specialCharsCount,
      textLen
    );
    return stats;
  }

  public getDisplayColor(): string {
    return Utils.isset(this.raw.data.displayColor)
      ? this.raw.data.displayColor
      : Utils.getRandomHexColor();
  }

  public hasRole(role: string): boolean {
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

  public isBroadcaster(): boolean {
    return this.roles.broadcaster === true;
  }

  public isModerator(): boolean {
    return this.roles.moderator === true;
  }

  public isVIP(): boolean {
    return this.roles.vip === true;
  }

  public isSubscriber(): boolean {
    return this.roles.subscriber === true;
  }

  public isStaff(): boolean {
    return this.roles.staff === true;
  }

  public hasPrimeBadge(): boolean {
    return this.badges.includes("premium");
  }

  public hasTurboBadge(): boolean {
    return this.badges.includes("turbo");
  }

  public getTierBadge(): number {
    const match: any = Utils.matchRegexGroups(
      this.raw.data.tags.badges,
      /subscriber\/(?<tier>[2|3]0)?[0-9]+/i
    );
    if (!match.tier) return 0;
    if (match.tier === "20") return 2;
    if (match.tier === "30") return 3;
    return 1;
  }

  public getMonthsSubscribed(): number {
    const match: any = Utils.matchRegexGroups(
      this.badgeInfo,
      /subscriber\/(?<months>[1-9][0-9]*)/i
    );
    return match?.months ? parseInt(match.months) : 0;
  }

  public getBitsBadge(): number {
    const match: any = Utils.matchRegexGroups(
      this.raw.data.tags.badges,
      /bits\/(?<bits>[1-9][0-9]*)/i
    );
    return match?.bits ? parseInt(match.bits) : 0;
  }

  public getGiftsBadge(): number {
    const match: any = Utils.matchRegexGroups(
      this.raw.data.tags.badges,
      /sub-gifter\/(?<gifts>[1-9][0-9]*)/i
    );
    return match?.gifts ? parseInt(match.gifts) : 0;
  }

  public isAction(): boolean {
    return this.raw.data.isAction === true;
  }

  public isCustomReward(): boolean {
    return Utils.isset(this.customRewardId as string);
  }

  public isHighlight(): boolean {
    return this.highlighted;
  }

  public isCommand(cmdName: string = ""): boolean {
    const cmd = cmdName.startsWith("!") ? cmdName : "!" + cmdName;
    return this.text.startsWith(cmd);
  }

  public getCommand(withArgs: boolean = false): object | null {
    if (!this.isCommand()) return null;
    const match: any = Utils.matchRegexGroups(
      this.text,
      /^!(?<cmd>\w+)\s?\@?(?<args>[\w\s?]*)/i
    );
    if (!match) return null;
    return withArgs
      ? { command: match.cmd, args: Utils.createList(match.args, " ", true) }
      : match.cmd;
  }

  public contains(
    text: string,
    caseSensitive: boolean = false
  ): boolean | null {
    return Utils.containsText(this.text, text, caseSensitive);
  }

  public containsRegex(regex: RegExp): boolean {
    return Utils.matchesRegex(this.text, regex);
  }

  public usernameOnList(list: string[]): boolean {
    if (Array.isArray(list) && list.length > 0) {
      for (let entry of list) {
        if (entry.toLocaleLowerCase?.() === this.username.toLocaleLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  public hasUsername(name: string): boolean {
    return this.username.toLocaleLowerCase() === name.toLocaleLowerCase?.();
  }

  public hasUserId(id: string | number): boolean {
    return this.userId === String(id);
  }

  public usernameContains(
    text: string,
    caseSensitive: boolean = false
  ): boolean | null {
    return Utils.containsText(this.username, text, caseSensitive);
  }

  public usernameContainsRegex(regex: RegExp): boolean {
    return Utils.matchesRegex(this.username, regex);
  }
}
