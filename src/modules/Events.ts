import ChatMessage from "./ChatMessage";
import { events } from "./EventList";
import * as I from "./Interfaces";
import Utils from "./Utils";

export default class Events {
  private skippable = [
    "bot:counter",
    "event:test",
    "event:skip",
    "message",
    "kvstore:update",
    "alertService:toggleSound",
  ];
  private giftCollection: any = {};
  private expectedEventListeners: string[] = [];
  private expectedEventNames: string[] = [];
  private expectsOnWidgetLoad = Utils.funcExists("onWidgetLoad");
  private expectsOnSessionUpdate = Utils.funcExists("onSessionUpdate");
  private useSenderCorrection = true;
  constructor() {
    this.preflightEventListeners();
    this.registerOnWidgetLoad();
    this.registerOnSessionUpdate();
    this.registerOnEventReceived();
  }

  public disableSenderCorrection() {
    this.useSenderCorrection = false;
  }

  public isSkippable(event: string): boolean {
    return this.skippable.includes(event);
  }

  private preflightEventListeners(): void {
    for (let event of events) {
      if (Utils.funcExists(`on${event.name}`)) {
        if (!this.expectsEventListener(event.listener)) {
          this.expectedEventListeners.push(event.listener);
        }
        this.expectedEventNames.push(event.name);
      }
    }
  }

  public registerOnWidgetLoad(): void {
    if (this.expectsOnWidgetLoad) {
      window.addEventListener(
        "onWidgetLoad",
        this.onWidgetLoadHandler.bind(this)
      );
    }
  }

  public unregisterOnWidgetLoad(): void {
    window.removeEventListener("onWidgetLoad", this.onWidgetLoadHandler);
  }

  public registerOnSessionUpdate(): void {
    if (this.expectsOnSessionUpdate) {
      window.addEventListener(
        "onSessionUpdate",
        this.onSessionUpdateHandler.bind(this)
      );
    }
  }

  public unregisterOnSessionUpdate(): void {
    window.removeEventListener("onSessionUpdate", this.onSessionUpdateHandler);
  }

  public registerOnEventReceived(): void {
    if (this.expectsEvents()) {
      window.addEventListener(
        "onEventReceived",
        this.onEventReceivedHandler.bind(this)
      );
    }
  }

  public unregisterOnEventReceived(): void {
    window.removeEventListener("onEventReceived", this.onEventReceivedHandler);
  }

  private expectsEventListener(listener: string): boolean {
    return this.expectedEventListeners.includes(listener);
  }

  private expectsEvents(): boolean {
    return this.expectedEventNames.length > 0;
  }

  private expectsEventName(name: string): boolean {
    return this.expectedEventNames.includes(name);
  }

  private onWidgetLoadHandler(e: any): void {
    Utils.callFunc("onWidgetLoad", e);
  }

  private onSessionUpdateHandler(e: any): void {
    Utils.callFunc("onSessionUpdate", e);
  }

  private onSubscriberHandler(e: I.SubscriberEvent): void {
    Utils.callFunc("onSubscriber", e);
  }

  private onResubHandler(e: I.ResubEvent): void {
    Utils.callFunc("onResub", e);
  }

  private onSubGiftHandler(e: I.SubGiftEvent): void {
    Utils.callFunc("onSubGift", e);
  }

  private onCommunityGiftHandler(e: I.CommunityGiftEvent): void {
    Utils.callFunc("onCommunityGift", e);
  }

  private onSubBombHandler(e: I.SubBombEvent): void {
    Utils.callFunc("onSubBomb", e);
  }

  private onSubBombCompleteHandler(
    e: I.SubBombEvent,
    recipients: string[]
  ): void {
    Utils.callFunc("onSubBombComplete", e, recipients);
  }

  private onTipHandler(e: I.TipEvent): void {
    Utils.callFunc("onTip", e);
  }

  private onCheerHandler(e: I.CheerEvent): void {
    Utils.callFunc("onCheer", e);
  }

  private onHostHandler(e: I.HostEvent): void {
    Utils.callFunc("onHost", e);
  }

  private onRaidHandler(e: I.RaidEvent): void {
    Utils.callFunc("onRaid", e);
  }

  private onFollowHandler(e: I.FollowEvent): void {
    Utils.callFunc("onFollow", e);
  }

  private onMessageHandler(e: I.MessageEvent): void {
    const data = e.service.toLowerCase() === "twitch" ? new ChatMessage(e) : e;
    Utils.callFunc("onMessage", data);
  }

  private onDeleteMessageHandler(e: I.DeleteMessageEvent): void {
    Utils.callFunc("onDeleteMessage", e);
  }

  private onDeleteMessagesHandler(e: I.DeleteMessagesEvent): void {
    Utils.callFunc("onDeleteMessages", e);
  }

  private onEventSkipHandler(): void {
    Utils.callFunc("onEventSkip");
  }

  private onBotCounterHandler(e: I.BotCounterEvent): void {
    Utils.callFunc("onBotCounter", e);
  }

  private onWidgetButtonHandler(e: I.WidgetButtonEvent): void {
    Utils.callFunc("onWidgetButton", e);
  }

  private onKVStoreUpdateHandler(e: I.KVStoreUpdateEvent): void {
    Utils.callFunc("onKVStoreUpdate", e);
  }

  private onToggleSoundHandler(e: I.ToggleSoundEvent): void {
    Utils.callFunc("onToggleSound", e);
  }

  private onEventReceivedHandler(p: any): void {
    const l = p?.detail?.listener;
    const e = p?.detail?.event;

    // Chat message
    if (this.expectsEventName("Message") && l === "message") {
      this.onMessageHandler(e);
    }
    // Single message deleted
    else if (this.expectsEventName("DeleteMessage") && l === "delete-message") {
      this.onDeleteMessageHandler(e);
    }
    // Multiple messages deleted (User Timeout)
    else if (
      this.expectsEventName("DeleteMessages") &&
      l === "delete-messages"
    ) {
      this.onDeleteMessagesHandler(e);
    }
    // Check type of subscription
    else if (l === "subscriber-latest") {
      // Correct sender on test alerts
      if (
        this.useSenderCorrection &&
        e.isTest &&
        !(e.gifted && e.isCommunityGift) &&
        !e.bulkGifted
      ) {
        e.sender = undefined;
      }
      // New Sub
      if (
        this.expectsEventName("Subscriber") &&
        !e.gifted &&
        e.amount === 1 &&
        e.sender === undefined
      ) {
        this.onSubscriberHandler(e);
      }
      // Gift
      else if (
        this.expectsEventName("SubGift") &&
        e.gifted &&
        !e.isCommunityGift
      ) {
        this.onSubGiftHandler(e);
      }
      // Resub
      else if (
        this.expectsEventName("Resub") &&
        e.amount > 1 &&
        e.sender === undefined
      ) {
        this.onResubHandler(e);
      }
      // SubBomb - Main
      else if (e.bulkGifted) {
        if (this.expectsEventName("SubBombComplete")) {
          const g = e?.sender?.toLowerCase();
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
          const g = e?.sender?.toLowerCase();

          if (g && this.giftCollection[g] !== undefined) {
            this.giftCollection[g].recipients.push(e.name);

            if (
              this.giftCollection[g].amount ===
              this.giftCollection[g].recipients?.length
            ) {
              e.amount = this.giftCollection[g].amount;
              this.onSubBombCompleteHandler(
                e,
                this.giftCollection[g].recipients
              );

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
    else if (
      this.expectsEventName("WidgetButton") &&
      l === "event:test" &&
      e.listener === "widget-button"
    ) {
      this.onWidgetButtonHandler(e);
    }
    // Key-Value-Store updated
    else if (this.expectsEventName("KVStoreUpdate") && l === "kvstore:update") {
      this.onKVStoreUpdateHandler(e.data);
    }
    // Alerts were (un)muted by the user
    else if (
      this.expectsEventName("ToggleSound") &&
      l === "alertService:toggleSound"
    ) {
      this.onToggleSoundHandler(e);
    }
  }
}
