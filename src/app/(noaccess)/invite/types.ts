export enum RedeemInviteCodeStatus {
    OK = 0,
    INVALID = 1,
    MAX_USED = 2,
    UNAUTHORIZED = 3,
    UNNECESSARY = 4,
    EXPIRED = 5
}

export interface RedeemInviteCodeRes {
    status: typeof RedeemInviteCodeStatus,
    code: string
}