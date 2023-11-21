import { _decorator, sys, Event } from 'cc';
const { ccclass } = _decorator;

interface IOption {
  debug?: boolean,
  automaticOpen?: boolean,
  reconnectInterval?: number,
  maxReconnectInterval?: number,
  reconnectDecay?: number,
  timeoutInterval?: number,
  maxReconnectAttempts?: any,
  binaryType?: BinaryType,
  closeCb?: Function,
}

@ccclass('WebSocket')
export class ReWebSocket {

    private url: string;
    private reconnectAttempts: number;
    private debug: boolean;
    private automaticOpen: boolean;
    private reconnectInterval: number;
    private maxReconnectInterval: number;
    private reconnectDecay: number;
    private timeoutInterval: number;
    private maxReconnectAttempts: number;
    private binaryType: BinaryType;
    private closesCb: Function;
    private readyState: number;
    private protocol: string;
    private CONNECTING: number;
    private OPEN: number;
    private CLOSING: number;
    private CLOSED: number;

    private ws: WebSocket;
    private protocols: string;
    private forcedClose: boolean;
    private timedOut: boolean;
    private eventTarget: HTMLElement;
    private addEventListener: EventListener;
    private removeEventListener: EventListener;
    private dispatchEvent: EventListener;

    constructor(url: string, protocols, options: IOption = {}) {
        
        this.url = url;

        this.reconnectAttempts = 0;
        /** Whether this instance should log debug messages. */
        this.debug = options.debug || false;
        /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
        this.automaticOpen = options.automaticOpen || true;
        /** The number of milliseconds to delay before attempting to reconnect. */
        this.reconnectInterval = options.reconnectInterval || 1000;
        /** The maximum number of milliseconds to delay a reconnection attempt. */
        this.maxReconnectInterval = options.maxReconnectInterval || 30000;
        /** The rate of increase of the reconnect delay.
         * Allows reconnect attempts to back off when problems persist. */
        this.reconnectDecay = options.reconnectDecay || 1.5;
        /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
        this.timeoutInterval = options.timeoutInterval || 2000;
        /** The maximum number of reconnection attempts to make. Unlimited if null. */
        this.maxReconnectAttempts = options.maxReconnectAttempts || null;
        /** The binary type, possible values 'blob' or 'arraybuffer', default 'blob'. */
        this.binaryType = options.binaryType;
        /** Reconnect failed or connect timeout, callback function */
        this.closesCb = options.closeCb || null;
        /**
         * The current state of the connection.
         * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
         * Read only.
         */
        this.readyState = WebSocket.CONNECTING;
        /**
         * A string indicating the name of the sub-protocol the server selected; this will be one of
         * the strings specified in the protocols parameter when creating the WebSocket object.
         * Read only.
         */
        this.protocol = null;
        /**
         * Whether all instances of ReconnectingWebSocket should log debug messages.
         * Setting this to true is the equivalent of setting
         * all instances of ReconnectingWebSocket.debug to true.
         */
        this.CONNECTING = WebSocket.CONNECTING;
        this.OPEN = WebSocket.OPEN;
        this.CLOSING = WebSocket.CLOSING;
        this.CLOSED = WebSocket.CLOSED;
    
        // Private state variables
        this.ws = null;
        this.protocols = protocols;
        this.forcedClose = false;
        this.timedOut = false;
        this.eventTarget = document.createElement('div');
    
        // Wire up "on*" properties as event handlers
        this.eventTarget.addEventListener('open', (event) => { this.onopen(event); });
        this.eventTarget.addEventListener('close', (event) => { this.onclose(event); });
        this.eventTarget.addEventListener('connecting', (event) => { this.onconnecting(event); });
        this.eventTarget.addEventListener('message', (event) => { this.onmessage(event); });
        this.eventTarget.addEventListener('error', (event) => { this.onerror(event); });
    
        // Expose the API required by EventTarget
        this.addEventListener = this.eventTarget.addEventListener.bind(this.eventTarget);
        this.removeEventListener = this.eventTarget.removeEventListener.bind(this.eventTarget);
        this.dispatchEvent = this.eventTarget.dispatchEvent.bind(this.eventTarget);
    
        // Whether or not to create a websocket upon instantiation
        if (this.automaticOpen === true) {
            this.open(false);
        }
    }

    /**
     * This function generates an event that is compatible with standard
     * compliant browsers and IE9 - IE11
     * This will prevent the error: Object doesn't support this action
     * @param s String The name that the event should use
     * @param args Object an optional object that the event will use
     */
    static generateEvent(s: string, args?: object) {
        let event;
        // if (cc && cc.sys && cc.sys.browserType === 'wechatgame') {
        if (sys && sys.browserType === sys.BrowserType.WECHAT) {
          // event = new cc.Event(s);
          event = new Event(s);
        } else {
          event = document.createEvent('CustomEvent');
          event.initCustomEvent(s, false, false, args);
        }
        return event;
    }

    open(reconnectAttempt: boolean) {
        this.ws = new WebSocket(this.url, this.protocols || []);
        this.ws.binaryType = this.binaryType;
    
        if (reconnectAttempt) {
          if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
            if (typeof this.closesCb === 'function') {
              this.closesCb();
            }
            return;
          }
        } else {
          this.eventTarget.dispatchEvent(ReWebSocket.generateEvent('connecting'));
          this.reconnectAttempts = 0;
        }
    
        if (this.debug) {
          console.debug('ReWebSocket', 'attempt-connect', this.url);
        }
    
        const timeout = setTimeout(() => {
          if (this.debug) {
            console.debug('ReWebSocket', 'connection-timeout', this.url);
          }
          this.timedOut = true;
          this.close();
          // when creating a WebSocket timeout, if you don't want to close websocket,
          // you can use this.refresh instead of this.close (recommend this.close)
          // this.refresh();
          this.timedOut = false;
          if (typeof this.closesCb === 'function') {
            this.closesCb();
          }
        }, this.timeoutInterval);
    
        this.ws.onopen = (event) => {
          clearTimeout(timeout);
          if (this.debug) {
            console.debug('ReWebSocket', 'onopen', this.url);
          }
          this.protocol = this.ws.protocol;
          this.readyState = WebSocket.OPEN;
          this.reconnectAttempts = 0;
          const e = ReWebSocket.generateEvent('open');
          e.isReconnect = reconnectAttempt;
          reconnectAttempt = false;
          this.eventTarget.dispatchEvent(e);
        };
    
        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          this.ws = null;
          if (this.forcedClose) {
            this.readyState = WebSocket.CLOSED;
            this.eventTarget.dispatchEvent(ReWebSocket.generateEvent('close'));
          } else {
            this.readyState = WebSocket.CONNECTING;
            const e = ReWebSocket.generateEvent('connecting');
            e.code = event.code;
            e.reason = event.reason;
            e.wasClean = event.wasClean;
            this.eventTarget.dispatchEvent(e);
            if (!reconnectAttempt && !this.timedOut) {
              if (this.debug) {
                console.debug('ReWebSocket', 'onclose', this.url);
              }
              this.eventTarget.dispatchEvent(ReWebSocket.generateEvent('close'));
            }
    
            const rTimeout = this.reconnectInterval * (this.reconnectDecay ** this.reconnectAttempts);
            setTimeout(() => {
              this.reconnectAttempts += 1;
              this.open(true);
            }, rTimeout > this.maxReconnectInterval ? this.maxReconnectInterval : rTimeout);
          }
        };
    
        this.ws.onmessage = (event) => {
          if (this.debug) {
            console.debug('ReWebSocket', 'onmessage', this.url, event.data);
          }
          const e = ReWebSocket.generateEvent('message');
          e.data = event.data;
          this.eventTarget.dispatchEvent(e);
        };
        this.ws.onerror = (event) => {
          if (this.debug) {
            console.debug('ReWebSocket', 'onerror', this.url, event);
          }
          this.eventTarget.dispatchEvent(ReWebSocket.generateEvent('error'));
        };
      }
    
      /**
       * Transmits data to the server over the WebSocket connection.
       * @param data a text string, ArrayBuffer or Blob to send to the server.
       */
      send(data) {
        if (this.ws && this.ws.readyState === this.OPEN) {
          if (this.debug) {
            console.debug('ReWebSocket', 'send', this.url, data);
          }
          this.ws.send(data);
          return true;
        }
        console.error('INVALID_STATE_ERR : Pausing to reconnect websocket');
        return false;
      }
    
      /**
       * Closes the WebSocket connection or connection attempt, if any.
       * If the connection is already CLOSED, this method does nothing.
       */
      close(code = 1000, reason?: string) {
        this.forcedClose = true;
        if (this.ws) {
          this.ws.close(code, reason);
        }
      }
    
      /**
       * Additional public API method to refresh the connection if still open (close, re-open).
       * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
       */
      refresh() {
        if (this.ws) {
          this.ws.close();
        }
      }
      onopen(event) {
        console.log('ReWebSocket onopen')
      }
      onclose(event) {
        console.log('ReWebSocket onclose')
      }
      onconnecting(event) {
        console.log('ReWebSocket onconnecting')
      }
      onmessage(event) {
        console.log('ReWebSocket onmessage')
      }
      onerror(event) {
        console.log('ReWebSocket onerror')
      }
}

