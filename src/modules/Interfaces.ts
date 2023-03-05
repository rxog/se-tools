export type Roles = {
  staff: boolean;
  broadcaster: boolean;
  moderator: boolean;
  vip: boolean;
  subscriber: boolean;
};

export type ChatMessageStats = {
  wordCount: number;
  emoteCount: number;
  emotePercentage: number;
  capsCount: number;
  capsPercentage: number;
  specialCharsCount: number;
  specialCharsPercentage: number;
};

export interface EventList {
  name: string;
  listener: string;
}

export interface SubscriberEvent {
  _id: string;
  name: string;
  amount: number;
  tier: string;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface ResubEvent {
  _id: string;
  name: string;
  amount: number;
  tier: string;
  message: string;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface SubGiftEvent {
  _id: string;
  name: string;
  amount: number;
  tier: string;
  message: string;
  sender: string;
  gifted: boolean;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface SubBombEvent {
  _id: string;
  name: string;
  amount: number;
  count: number;
  tier: string;
  message: string;
  sender: string;
  bulkGifted: boolean;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface CommunityGiftEvent {
  _id: string;
  name: string;
  amount: number;
  count: number;
  tier: string;
  message: string;
  sender: string;
  gifted: boolean;
  isCommunityGift: boolean;
  playedAsCommunityGift: boolean;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface FollowEvent {
  _id: string;
  name: string;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface TipEvent {
  _id: string;
  name: string;
  amount: number;
  message: string;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface CheerEvent {
  _id: string;
  name: string;
  amount: number;
  message: string;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface RaidEvent {
  _id: string;
  name: string;
  amount: number;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface HostEvent {
  _id: string;
  name: string;
  amount: number;
  sessionTop: boolean;
  type: string;
  originalEventName: string;
}

export interface MessageEvent {
  service: string;
  renderedText: string;
  data: {
    time: number;
    tags: {
      "badge-info": string;
      badges: string;
      "client-nonce": string;
      color: string;
      "display-name": string;
      emotes: string;
      flags: string;
      id: string;
      mod: string;
      "room-id": string;
      subscriber: string;
      "tmi-sent-ts": number;
      turbo: string;
      "user-id": string;
      "user-type": string;
      "msg-id": string;
      "custom-reward-id": string;
    };
    nick: string;
    userId: string;
    displayName: string;
    displayColor: string;
    badges: Array<{
      type: string;
      version: string;
      url: string;
      description: string;
    }>;
    channel: string;
    text: string;
    isAction: boolean;
    emotes: Array<{
      type: string;
      name: string;
      id: string;
      gif: boolean;
      urls: object;
      start: number;
      end: number;
    }>;
    msgId: string;
  };
}

export interface DeleteMessageEvent {
  msgId: string;
}

export interface DeleteMessagesEvent {
  userId: string;
}

export interface BotCounterEvent {
  counter: string;
  value: number;
}

export interface KVStoreUpdateEvent {
  key: string;
  value: object;
}

export interface WidgetButtonEvent {
  listener: string;
  field: string;
  value: string;
}

export interface ToggleSoundEvent {
  muted: boolean;
}
