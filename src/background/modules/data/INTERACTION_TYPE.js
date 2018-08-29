/**
 * The possible types of interacting with a remote server (/user/toot/…).
 *
 * @module Data/INTERACTION_TYPE
 */

export const INTERACTION_TYPE = Object.freeze({
    FOLLOW: Symbol("remote follow"),
    TOOT_INTERACT: Symbol("remote toot interact")
});
