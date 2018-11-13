import { EventEmitter } from 'events'

// to control order of execution before emitting to eventLoop
export const eventQueue = new EventEmitter() // eslint-disable-line import/prefer-default-export
