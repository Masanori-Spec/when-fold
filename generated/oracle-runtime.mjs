// oracle/upstream/src/vs/nls.messages.ts
function getNLSMessages() {
  return globalThis._VSCODE_NLS_MESSAGES;
}
function getNLSLanguage() {
  return globalThis._VSCODE_NLS_LANGUAGE;
}

// oracle/upstream/src/vs/nls.ts
var isPseudo = getNLSLanguage() === "pseudo" || typeof document !== "undefined" && document.location && typeof document.location.hash === "string" && document.location.hash.indexOf("pseudo=true") >= 0;
function _format(message, args) {
  let result;
  if (args.length === 0) {
    result = message;
  } else {
    result = message.replace(/\{(\d+)\}/g, (match, rest) => {
      const index = rest[0];
      const arg = args[index];
      let result2 = match;
      if (typeof arg === "string") {
        result2 = arg;
      } else if (typeof arg === "number" || typeof arg === "boolean" || arg === void 0 || arg === null) {
        result2 = String(arg);
      }
      return result2;
    });
  }
  if (isPseudo) {
    result = "\uFF3B" + result.replace(/[aouei]/g, "$&$&") + "\uFF3D";
  }
  return result;
}
function localize(data, message, ...args) {
  if (typeof data === "number") {
    return _format(lookupMessage(data, message), args);
  }
  return _format(message, args);
}
function lookupMessage(index, fallback) {
  const message = getNLSMessages()?.[index];
  if (typeof message !== "string") {
    if (typeof fallback === "string") {
      return fallback;
    }
    throw new Error(`!!! NLS MISSING: ${index} !!!`);
  }
  return message;
}

// oracle/upstream/src/vs/base/common/platform.ts
var LANGUAGE_DEFAULT = "en";
var _isWindows = false;
var _isMacintosh = false;
var _isLinux = false;
var _isLinuxSnap = false;
var _isNative = false;
var _isWeb = false;
var _isElectron = false;
var _isIOS = false;
var _isCI = false;
var _isMobile = false;
var _locale = void 0;
var _language = LANGUAGE_DEFAULT;
var _platformLocale = LANGUAGE_DEFAULT;
var _translationsConfigFile = void 0;
var _userAgent = void 0;
var $globalThis = globalThis;
var nodeProcess = void 0;
if (typeof $globalThis.vscode !== "undefined" && typeof $globalThis.vscode.process !== "undefined") {
  nodeProcess = $globalThis.vscode.process;
} else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
  nodeProcess = process;
}
var isElectronProcess = typeof nodeProcess?.versions?.electron === "string";
var isElectronRenderer = isElectronProcess && nodeProcess?.type === "renderer";
if (typeof nodeProcess === "object") {
  _isWindows = nodeProcess.platform === "win32";
  _isMacintosh = nodeProcess.platform === "darwin";
  _isLinux = nodeProcess.platform === "linux";
  _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
  _isElectron = isElectronProcess;
  _isCI = !!nodeProcess.env["CI"] || !!nodeProcess.env["BUILD_ARTIFACTSTAGINGDIRECTORY"];
  _locale = LANGUAGE_DEFAULT;
  _language = LANGUAGE_DEFAULT;
  const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
  if (rawNlsConfig) {
    try {
      const nlsConfig = JSON.parse(rawNlsConfig);
      _locale = nlsConfig.userLocale;
      _platformLocale = nlsConfig.osLocale;
      _language = nlsConfig.resolvedLanguage || LANGUAGE_DEFAULT;
      _translationsConfigFile = nlsConfig.languagePack?.translationsConfigFile;
    } catch (e) {
    }
  }
  _isNative = true;
} else if (typeof navigator === "object" && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf("Windows") >= 0;
  _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
  _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
  _isLinux = _userAgent.indexOf("Linux") >= 0;
  _isMobile = _userAgent?.indexOf("Mobi") >= 0;
  _isWeb = true;
  _language = getNLSLanguage() || LANGUAGE_DEFAULT;
  _locale = navigator.language.toLowerCase();
  _platformLocale = _locale;
} else {
  console.error("Unable to resolve platform.");
}
var _platform = 0 /* Web */;
if (_isMacintosh) {
  _platform = 1 /* Mac */;
} else if (_isWindows) {
  _platform = 3 /* Windows */;
} else if (_isLinux) {
  _platform = 2 /* Linux */;
}
var isWindows = _isWindows;
var isMacintosh = _isMacintosh;
var isLinux = _isLinux;
var isWeb = _isWeb;
var isWebWorker = _isWeb && typeof $globalThis.importScripts === "function";
var webWorkerOrigin = isWebWorker ? $globalThis.origin : void 0;
var userAgent = _userAgent;
var language = _language;
var Language;
((Language2) => {
  function value() {
    return language;
  }
  Language2.value = value;
  function isDefaultVariant() {
    if (language.length === 2) {
      return language === "en";
    } else if (language.length >= 3) {
      return language[0] === "e" && language[1] === "n" && language[2] === "-";
    } else {
      return false;
    }
  }
  Language2.isDefaultVariant = isDefaultVariant;
  function isDefault() {
    return language === "en";
  }
  Language2.isDefault = isDefault;
})(Language || (Language = {}));
var setTimeout0IsFaster = typeof $globalThis.postMessage === "function" && !$globalThis.importScripts;
var setTimeout0 = (() => {
  if (setTimeout0IsFaster) {
    const pending = [];
    $globalThis.addEventListener("message", (e) => {
      if (e.data && e.data.vscodeScheduleAsyncWork) {
        for (let i = 0, len = pending.length; i < len; i++) {
          const candidate = pending[i];
          if (candidate.id === e.data.vscodeScheduleAsyncWork) {
            pending.splice(i, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return (callback) => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback
      });
      $globalThis.postMessage({ vscodeScheduleAsyncWork: myId }, "*");
    };
  }
  return (callback) => setTimeout(callback);
})();
var OperatingSystem = /* @__PURE__ */ ((OperatingSystem2) => {
  OperatingSystem2[OperatingSystem2["Windows"] = 1] = "Windows";
  OperatingSystem2[OperatingSystem2["Macintosh"] = 2] = "Macintosh";
  OperatingSystem2[OperatingSystem2["Linux"] = 3] = "Linux";
  return OperatingSystem2;
})(OperatingSystem || {});
var isChrome = !!(userAgent && userAgent.indexOf("Chrome") >= 0);
var isFirefox = !!(userAgent && userAgent.indexOf("Firefox") >= 0);
var isSafari = !!(!isChrome && (userAgent && userAgent.indexOf("Safari") >= 0));
var isEdge = !!(userAgent && userAgent.indexOf("Edg/") >= 0);
var isAndroid = !!(userAgent && userAgent.indexOf("Android") >= 0);

// oracle/upstream/src/vs/base/common/errors.ts
var ErrorHandler = class {
  unexpectedErrorHandler;
  listeners;
  constructor() {
    this.listeners = [];
    this.unexpectedErrorHandler = function(e) {
      setTimeout(() => {
        if (e.stack) {
          if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
            throw new ErrorNoTelemetry(e.message + "\n\n" + e.stack);
          }
          throw new Error(e.message + "\n\n" + e.stack);
        }
        throw e;
      }, 0);
    };
  }
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this._removeListener(listener);
    };
  }
  emit(e) {
    this.listeners.forEach((listener) => {
      listener(e);
    });
  }
  _removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
  setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler;
  }
  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }
  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e);
    this.emit(e);
  }
  // For external errors, we don't want the listeners to be called
  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }
};
var errorHandler = new ErrorHandler();
function onUnexpectedError(e) {
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedError(e);
  }
  return void 0;
}
var canceledName = "Canceled";
function isCancellationError(error) {
  if (error instanceof CancellationError) {
    return true;
  }
  return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
var CancellationError = class extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
};
function illegalArgument(name) {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  } else {
    return new Error("Illegal argument");
  }
}
function illegalState(name) {
  if (name) {
    return new Error(`Illegal state: ${name}`);
  } else {
    return new Error("Illegal state");
  }
}
var ErrorNoTelemetry = class _ErrorNoTelemetry extends Error {
  name;
  constructor(msg) {
    super(msg);
    this.name = "CodeExpectedError";
  }
  static fromError(err) {
    if (err instanceof _ErrorNoTelemetry) {
      return err;
    }
    const result = new _ErrorNoTelemetry();
    result.message = err.message;
    result.stack = err.stack;
    return result;
  }
  static isErrorNoTelemetry(err) {
    return err.name === "CodeExpectedError";
  }
};

// oracle/upstream/src/vs/base/common/functional.ts
function createSingleCallFunction(fn, fnDidRunCallback) {
  const _this = this;
  let didCall = false;
  let result;
  return function() {
    if (didCall) {
      return result;
    }
    didCall = true;
    if (fnDidRunCallback) {
      try {
        result = fn.apply(_this, arguments);
      } finally {
        fnDidRunCallback();
      }
    } else {
      result = fn.apply(_this, arguments);
    }
    return result;
  };
}

// oracle/upstream/src/vs/base/common/arrays.ts
var CompareResult;
((CompareResult2) => {
  function isLessThan(result) {
    return result < 0;
  }
  CompareResult2.isLessThan = isLessThan;
  function isLessThanOrEqual(result) {
    return result <= 0;
  }
  CompareResult2.isLessThanOrEqual = isLessThanOrEqual;
  function isGreaterThan(result) {
    return result > 0;
  }
  CompareResult2.isGreaterThan = isGreaterThan;
  function isNeitherLessOrGreaterThan(result) {
    return result === 0;
  }
  CompareResult2.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
  CompareResult2.greaterThan = 1;
  CompareResult2.lessThan = -1;
  CompareResult2.neitherLessOrGreaterThan = 0;
})(CompareResult || (CompareResult = {}));
var CallbackIterable = class _CallbackIterable {
  constructor(iterate) {
    this.iterate = iterate;
  }
  static empty = new _CallbackIterable((_callback) => {
  });
  forEach(handler) {
    this.iterate((item) => {
      handler(item);
      return true;
    });
  }
  toArray() {
    const result = [];
    this.iterate((item) => {
      result.push(item);
      return true;
    });
    return result;
  }
  filter(predicate) {
    return new _CallbackIterable((cb) => this.iterate((item) => predicate(item) ? cb(item) : true));
  }
  map(mapFn) {
    return new _CallbackIterable((cb) => this.iterate((item) => cb(mapFn(item))));
  }
  some(predicate) {
    let result = false;
    this.iterate((item) => {
      result = predicate(item);
      return !result;
    });
    return result;
  }
  findFirst(predicate) {
    let result;
    this.iterate((item) => {
      if (predicate(item)) {
        result = item;
        return false;
      }
      return true;
    });
    return result;
  }
  findLast(predicate) {
    let result;
    this.iterate((item) => {
      if (predicate(item)) {
        result = item;
      }
      return true;
    });
    return result;
  }
  findLastMaxBy(comparator) {
    let result;
    let first = true;
    this.iterate((item) => {
      if (first || CompareResult.isGreaterThan(comparator(item, result))) {
        first = false;
        result = item;
      }
      return true;
    });
    return result;
  }
};

// oracle/upstream/src/vs/base/common/iterator.ts
var Iterable;
((Iterable2) => {
  function is(thing) {
    return thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
  }
  Iterable2.is = is;
  const _empty = Object.freeze([]);
  function empty() {
    return _empty;
  }
  Iterable2.empty = empty;
  function* single(element) {
    yield element;
  }
  Iterable2.single = single;
  function wrap(iterableOrElement) {
    if (is(iterableOrElement)) {
      return iterableOrElement;
    } else {
      return single(iterableOrElement);
    }
  }
  Iterable2.wrap = wrap;
  function from(iterable) {
    return iterable || _empty;
  }
  Iterable2.from = from;
  function* reverse(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      yield array[i];
    }
  }
  Iterable2.reverse = reverse;
  function isEmpty(iterable) {
    return !iterable || iterable[Symbol.iterator]().next().done === true;
  }
  Iterable2.isEmpty = isEmpty;
  function first(iterable) {
    return iterable[Symbol.iterator]().next().value;
  }
  Iterable2.first = first;
  function some(iterable, predicate) {
    let i = 0;
    for (const element of iterable) {
      if (predicate(element, i++)) {
        return true;
      }
    }
    return false;
  }
  Iterable2.some = some;
  function find(iterable, predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        return element;
      }
    }
    return void 0;
  }
  Iterable2.find = find;
  function* filter(iterable, predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        yield element;
      }
    }
  }
  Iterable2.filter = filter;
  function* map(iterable, fn) {
    let index = 0;
    for (const element of iterable) {
      yield fn(element, index++);
    }
  }
  Iterable2.map = map;
  function* flatMap(iterable, fn) {
    let index = 0;
    for (const element of iterable) {
      yield* fn(element, index++);
    }
  }
  Iterable2.flatMap = flatMap;
  function* concat(...iterables) {
    for (const iterable of iterables) {
      yield* iterable;
    }
  }
  Iterable2.concat = concat;
  function reduce(iterable, reducer, initialValue) {
    let value = initialValue;
    for (const element of iterable) {
      value = reducer(value, element);
    }
    return value;
  }
  Iterable2.reduce = reduce;
  function* slice(arr, from2, to = arr.length) {
    if (from2 < -arr.length) {
      from2 = 0;
    }
    if (from2 < 0) {
      from2 += arr.length;
    }
    if (to < 0) {
      to += arr.length;
    } else if (to > arr.length) {
      to = arr.length;
    }
    for (; from2 < to; from2++) {
      yield arr[from2];
    }
  }
  Iterable2.slice = slice;
  function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
    const consumed = [];
    if (atMost === 0) {
      return [consumed, iterable];
    }
    const iterator = iterable[Symbol.iterator]();
    for (let i = 0; i < atMost; i++) {
      const next = iterator.next();
      if (next.done) {
        return [consumed, Iterable2.empty()];
      }
      consumed.push(next.value);
    }
    return [consumed, { [Symbol.iterator]() {
      return iterator;
    } }];
  }
  Iterable2.consume = consume;
  async function asyncToArray(iterable) {
    const result = [];
    for await (const item of iterable) {
      result.push(item);
    }
    return Promise.resolve(result);
  }
  Iterable2.asyncToArray = asyncToArray;
})(Iterable || (Iterable = {}));

// oracle/upstream/src/vs/base/common/lifecycle.ts
var TRACK_DISPOSABLES = false;
var disposableTracker = null;
function setDisposableTracker(tracker) {
  disposableTracker = tracker;
}
if (TRACK_DISPOSABLES) {
  const __is_disposable_tracked__ = "__is_disposable_tracked__";
  setDisposableTracker(new class {
    trackDisposable(x) {
      const stack = new Error("Potentially leaked disposable").stack;
      setTimeout(() => {
        if (!x[__is_disposable_tracked__]) {
          console.log(stack);
        }
      }, 3e3);
    }
    setParent(child, parent) {
      if (child && child !== Disposable.None) {
        try {
          child[__is_disposable_tracked__] = true;
        } catch {
        }
      }
    }
    markAsDisposed(disposable) {
      if (disposable && disposable !== Disposable.None) {
        try {
          disposable[__is_disposable_tracked__] = true;
        } catch {
        }
      }
    }
    markAsSingleton(disposable) {
    }
  }());
}
function trackDisposable(x) {
  disposableTracker?.trackDisposable(x);
  return x;
}
function markAsDisposed(disposable) {
  disposableTracker?.markAsDisposed(disposable);
}
function setParentOfDisposable(child, parent) {
  disposableTracker?.setParent(child, parent);
}
function setParentOfDisposables(children, parent) {
  if (!disposableTracker) {
    return;
  }
  for (const child of children) {
    disposableTracker.setParent(child, parent);
  }
}
function dispose(arg) {
  if (Iterable.is(arg)) {
    const errors = [];
    for (const d of arg) {
      if (d) {
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new AggregateError(errors, "Encountered errors while disposing of store");
    }
    return Array.isArray(arg) ? [] : arg;
  } else if (arg) {
    arg.dispose();
    return arg;
  }
}
function combinedDisposable(...disposables) {
  const parent = toDisposable(() => dispose(disposables));
  setParentOfDisposables(disposables, parent);
  return parent;
}
function toDisposable(fn) {
  const self = trackDisposable({
    dispose: createSingleCallFunction(() => {
      markAsDisposed(self);
      fn();
    })
  });
  return self;
}
var DisposableStore = class _DisposableStore {
  static DISABLE_DISPOSED_WARNING = false;
  _toDispose = /* @__PURE__ */ new Set();
  _isDisposed = false;
  constructor() {
    trackDisposable(this);
  }
  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */
  dispose() {
    if (this._isDisposed) {
      return;
    }
    markAsDisposed(this);
    this._isDisposed = true;
    this.clear();
  }
  /**
   * @return `true` if this object has been disposed of.
   */
  get isDisposed() {
    return this._isDisposed;
  }
  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */
  clear() {
    if (this._toDispose.size === 0) {
      return;
    }
    try {
      dispose(this._toDispose);
    } finally {
      this._toDispose.clear();
    }
  }
  /**
   * Add a new {@link IDisposable disposable} to the collection.
   */
  add(o) {
    if (!o) {
      return o;
    }
    if (o === this) {
      throw new Error("Cannot register a disposable on itself!");
    }
    setParentOfDisposable(o, this);
    if (this._isDisposed) {
      if (!_DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack);
      }
    } else {
      this._toDispose.add(o);
    }
    return o;
  }
  /**
   * Deletes a disposable from store and disposes of it. This will not throw or warn and proceed to dispose the
   * disposable even when the disposable is not part in the store.
   */
  delete(o) {
    if (!o) {
      return;
    }
    if (o === this) {
      throw new Error("Cannot dispose a disposable on itself!");
    }
    this._toDispose.delete(o);
    o.dispose();
  }
  /**
   * Deletes the value from the store, but does not dispose it.
   */
  deleteAndLeak(o) {
    if (!o) {
      return;
    }
    if (this._toDispose.has(o)) {
      this._toDispose.delete(o);
      setParentOfDisposable(o, null);
    }
  }
};
var Disposable = class {
  /**
   * A disposable that does nothing when it is disposed of.
   *
   * TODO: This should not be a static property.
   */
  static None = Object.freeze({ dispose() {
  } });
  _store = new DisposableStore();
  constructor() {
    trackDisposable(this);
    setParentOfDisposable(this._store, this);
  }
  dispose() {
    markAsDisposed(this);
    this._store.dispose();
  }
  /**
   * Adds `o` to the collection of disposables managed by this object.
   */
  _register(o) {
    if (o === this) {
      throw new Error("Cannot register a disposable on itself!");
    }
    return this._store.add(o);
  }
};

// oracle/upstream/src/vs/base/common/linkedList.ts
var Node = class _Node {
  static Undefined = new _Node(void 0);
  element;
  next;
  prev;
  constructor(element) {
    this.element = element;
    this.next = _Node.Undefined;
    this.prev = _Node.Undefined;
  }
};

// oracle/upstream/src/vs/base/common/stopwatch.ts
var hasPerformanceNow = globalThis.performance && typeof globalThis.performance.now === "function";
var StopWatch = class _StopWatch {
  _startTime;
  _stopTime;
  _now;
  static create(highResolution) {
    return new _StopWatch(highResolution);
  }
  constructor(highResolution) {
    this._now = hasPerformanceNow && highResolution === false ? Date.now : globalThis.performance.now.bind(globalThis.performance);
    this._startTime = this._now();
    this._stopTime = -1;
  }
  stop() {
    this._stopTime = this._now();
  }
  reset() {
    this._startTime = this._now();
    this._stopTime = -1;
  }
  elapsed() {
    if (this._stopTime !== -1) {
      return this._stopTime - this._startTime;
    }
    return this._now() - this._startTime;
  }
};

// oracle/upstream/src/vs/base/common/event.ts
var _enableListenerGCedWarning = false;
var _enableDisposeWithListenerWarning = false;
var _enableSnapshotPotentialLeakWarning = false;
var Event;
((Event2) => {
  Event2.None = () => Disposable.None;
  function _addLeakageTraceLogic(options) {
    if (_enableSnapshotPotentialLeakWarning) {
      const { onDidAddListener: origListenerDidAdd } = options;
      const stack = Stacktrace.create();
      let count = 0;
      options.onDidAddListener = () => {
        if (++count === 2) {
          console.warn("snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here");
          stack.print();
        }
        origListenerDidAdd?.();
      };
    }
  }
  function defer(event, disposable) {
    return debounce(event, () => void 0, 0, void 0, true, void 0, disposable);
  }
  Event2.defer = defer;
  function once(event) {
    return (listener, thisArgs = null, disposables) => {
      let didFire = false;
      let result = void 0;
      result = event((e) => {
        if (didFire) {
          return;
        } else if (result) {
          result.dispose();
        } else {
          didFire = true;
        }
        return listener.call(thisArgs, e);
      }, null, disposables);
      if (didFire) {
        result.dispose();
      }
      return result;
    };
  }
  Event2.once = once;
  function onceIf(event, condition) {
    return Event2.once(Event2.filter(event, condition));
  }
  Event2.onceIf = onceIf;
  function map(event, map2, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((i) => listener.call(thisArgs, map2(i)), null, disposables), disposable);
  }
  Event2.map = map;
  function forEach(event, each, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((i) => {
      each(i);
      listener.call(thisArgs, i);
    }, null, disposables), disposable);
  }
  Event2.forEach = forEach;
  function filter(event, filter2, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((e) => filter2(e) && listener.call(thisArgs, e), null, disposables), disposable);
  }
  Event2.filter = filter;
  function signal(event) {
    return event;
  }
  Event2.signal = signal;
  function any(...events) {
    return (listener, thisArgs = null, disposables) => {
      const disposable = combinedDisposable(...events.map((event) => event((e) => listener.call(thisArgs, e))));
      return addAndReturnDisposable(disposable, disposables);
    };
  }
  Event2.any = any;
  function reduce(event, merge, initial, disposable) {
    let output = initial;
    return map(event, (e) => {
      output = merge(output, e);
      return output;
    }, disposable);
  }
  Event2.reduce = reduce;
  function snapshot(event, disposable) {
    let listener;
    const options = {
      onWillAddFirstListener() {
        listener = event(emitter.fire, emitter);
      },
      onDidRemoveLastListener() {
        listener?.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options);
    }
    const emitter = new Emitter(options);
    disposable?.add(emitter);
    return emitter.event;
  }
  function addAndReturnDisposable(d, store) {
    if (store instanceof Array) {
      store.push(d);
    } else if (store) {
      store.add(d);
    }
    return d;
  }
  function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
    let subscription;
    let output = void 0;
    let handle = void 0;
    let numDebouncedCalls = 0;
    let doFire;
    const options = {
      leakWarningThreshold,
      onWillAddFirstListener() {
        subscription = event((cur) => {
          numDebouncedCalls++;
          output = merge(output, cur);
          if (leading && !handle) {
            emitter.fire(output);
            output = void 0;
          }
          doFire = () => {
            const _output = output;
            output = void 0;
            handle = void 0;
            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output);
            }
            numDebouncedCalls = 0;
          };
          if (typeof delay === "number") {
            clearTimeout(handle);
            handle = setTimeout(doFire, delay);
          } else {
            if (handle === void 0) {
              handle = 0;
              queueMicrotask(doFire);
            }
          }
        });
      },
      onWillRemoveListener() {
        if (flushOnListenerRemove && numDebouncedCalls > 0) {
          doFire?.();
        }
      },
      onDidRemoveLastListener() {
        doFire = void 0;
        subscription.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options);
    }
    const emitter = new Emitter(options);
    disposable?.add(emitter);
    return emitter.event;
  }
  Event2.debounce = debounce;
  function accumulate(event, delay = 0, disposable) {
    return Event2.debounce(event, (last, e) => {
      if (!last) {
        return [e];
      }
      last.push(e);
      return last;
    }, delay, void 0, true, void 0, disposable);
  }
  Event2.accumulate = accumulate;
  function latch(event, equals = (a, b) => a === b, disposable) {
    let firstCall = true;
    let cache;
    return filter(event, (value) => {
      const shouldEmit = firstCall || !equals(value, cache);
      firstCall = false;
      cache = value;
      return shouldEmit;
    }, disposable);
  }
  Event2.latch = latch;
  function split(event, isT, disposable) {
    return [
      Event2.filter(event, isT, disposable),
      Event2.filter(event, (e) => !isT(e), disposable)
    ];
  }
  Event2.split = split;
  function buffer(event, flushAfterTimeout = false, _buffer = [], disposable) {
    let buffer2 = _buffer.slice();
    let listener = event((e) => {
      if (buffer2) {
        buffer2.push(e);
      } else {
        emitter.fire(e);
      }
    });
    if (disposable) {
      disposable.add(listener);
    }
    const flush = () => {
      buffer2?.forEach((e) => emitter.fire(e));
      buffer2 = null;
    };
    const emitter = new Emitter({
      onWillAddFirstListener() {
        if (!listener) {
          listener = event((e) => emitter.fire(e));
          if (disposable) {
            disposable.add(listener);
          }
        }
      },
      onDidAddFirstListener() {
        if (buffer2) {
          if (flushAfterTimeout) {
            setTimeout(flush);
          } else {
            flush();
          }
        }
      },
      onDidRemoveLastListener() {
        if (listener) {
          listener.dispose();
        }
        listener = null;
      }
    });
    if (disposable) {
      disposable.add(emitter);
    }
    return emitter.event;
  }
  Event2.buffer = buffer;
  function chain(event, sythensize) {
    const fn = (listener, thisArgs, disposables) => {
      const cs = sythensize(new ChainableSynthesis());
      return event(function(value) {
        const result = cs.evaluate(value);
        if (result !== HaltChainable) {
          listener.call(thisArgs, result);
        }
      }, void 0, disposables);
    };
    return fn;
  }
  Event2.chain = chain;
  const HaltChainable = Symbol("HaltChainable");
  class ChainableSynthesis {
    steps = [];
    map(fn) {
      this.steps.push(fn);
      return this;
    }
    forEach(fn) {
      this.steps.push((v) => {
        fn(v);
        return v;
      });
      return this;
    }
    filter(fn) {
      this.steps.push((v) => fn(v) ? v : HaltChainable);
      return this;
    }
    reduce(merge, initial) {
      let last = initial;
      this.steps.push((v) => {
        last = merge(last, v);
        return last;
      });
      return this;
    }
    latch(equals = (a, b) => a === b) {
      let firstCall = true;
      let cache;
      this.steps.push((value) => {
        const shouldEmit = firstCall || !equals(value, cache);
        firstCall = false;
        cache = value;
        return shouldEmit ? value : HaltChainable;
      });
      return this;
    }
    evaluate(value) {
      for (const step of this.steps) {
        value = step(value);
        if (value === HaltChainable) {
          break;
        }
      }
      return value;
    }
  }
  function fromNodeEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = (...args) => result.fire(map2(...args));
    const onFirstListenerAdd = () => emitter.on(eventName, fn);
    const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
    const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
    return result.event;
  }
  Event2.fromNodeEventEmitter = fromNodeEventEmitter;
  function fromDOMEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = (...args) => result.fire(map2(...args));
    const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
    const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
    const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
    return result.event;
  }
  Event2.fromDOMEventEmitter = fromDOMEventEmitter;
  function toPromise(event) {
    return new Promise((resolve) => once(event)(resolve));
  }
  Event2.toPromise = toPromise;
  function fromPromise(promise) {
    const result = new Emitter();
    promise.then((res) => {
      result.fire(res);
    }, () => {
      result.fire(void 0);
    }).finally(() => {
      result.dispose();
    });
    return result.event;
  }
  Event2.fromPromise = fromPromise;
  function forward(from, to) {
    return from((e) => to.fire(e));
  }
  Event2.forward = forward;
  function runAndSubscribe(event, handler, initial) {
    handler(initial);
    return event((e) => handler(e));
  }
  Event2.runAndSubscribe = runAndSubscribe;
  class EmitterObserver {
    constructor(_observable, store) {
      this._observable = _observable;
      const options = {
        onWillAddFirstListener: () => {
          _observable.addObserver(this);
          this._observable.reportChanges();
        },
        onDidRemoveLastListener: () => {
          _observable.removeObserver(this);
        }
      };
      if (!store) {
        _addLeakageTraceLogic(options);
      }
      this.emitter = new Emitter(options);
      if (store) {
        store.add(this.emitter);
      }
    }
    emitter;
    _counter = 0;
    _hasChanged = false;
    beginUpdate(_observable) {
      this._counter++;
    }
    handlePossibleChange(_observable) {
    }
    handleChange(_observable, _change) {
      this._hasChanged = true;
    }
    endUpdate(_observable) {
      this._counter--;
      if (this._counter === 0) {
        this._observable.reportChanges();
        if (this._hasChanged) {
          this._hasChanged = false;
          this.emitter.fire(this._observable.get());
        }
      }
    }
  }
  function fromObservable(obs, store) {
    const observer = new EmitterObserver(obs, store);
    return observer.emitter.event;
  }
  Event2.fromObservable = fromObservable;
  function fromObservableLight(observable) {
    return (listener, thisArgs, disposables) => {
      let count = 0;
      let didChange = false;
      const observer = {
        beginUpdate() {
          count++;
        },
        endUpdate() {
          count--;
          if (count === 0) {
            observable.reportChanges();
            if (didChange) {
              didChange = false;
              listener.call(thisArgs);
            }
          }
        },
        handlePossibleChange() {
        },
        handleChange() {
          didChange = true;
        }
      };
      observable.addObserver(observer);
      observable.reportChanges();
      const disposable = {
        dispose() {
          observable.removeObserver(observer);
        }
      };
      if (disposables instanceof DisposableStore) {
        disposables.add(disposable);
      } else if (Array.isArray(disposables)) {
        disposables.push(disposable);
      }
      return disposable;
    };
  }
  Event2.fromObservableLight = fromObservableLight;
})(Event || (Event = {}));
var EventProfiling = class _EventProfiling {
  static all = /* @__PURE__ */ new Set();
  static _idPool = 0;
  name;
  listenerCount = 0;
  invocationCount = 0;
  elapsedOverall = 0;
  durations = [];
  _stopWatch;
  constructor(name) {
    this.name = `${name}_${_EventProfiling._idPool++}`;
    _EventProfiling.all.add(this);
  }
  start(listenerCount) {
    this._stopWatch = new StopWatch();
    this.listenerCount = listenerCount;
  }
  stop() {
    if (this._stopWatch) {
      const elapsed = this._stopWatch.elapsed();
      this.durations.push(elapsed);
      this.elapsedOverall += elapsed;
      this.invocationCount += 1;
      this._stopWatch = void 0;
    }
  }
};
var _globalLeakWarningThreshold = -1;
var LeakageMonitor = class _LeakageMonitor {
  constructor(_errorHandler, threshold, name = (_LeakageMonitor._idPool++).toString(16).padStart(3, "0")) {
    this._errorHandler = _errorHandler;
    this.threshold = threshold;
    this.name = name;
  }
  static _idPool = 1;
  _stacks;
  _warnCountdown = 0;
  dispose() {
    this._stacks?.clear();
  }
  check(stack, listenerCount) {
    const threshold = this.threshold;
    if (threshold <= 0 || listenerCount < threshold) {
      return void 0;
    }
    if (!this._stacks) {
      this._stacks = /* @__PURE__ */ new Map();
    }
    const count = this._stacks.get(stack.value) || 0;
    this._stacks.set(stack.value, count + 1);
    this._warnCountdown -= 1;
    if (this._warnCountdown <= 0) {
      this._warnCountdown = threshold * 0.5;
      const [topStack, topCount] = this.getMostFrequentStack();
      const message = `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`;
      console.warn(message);
      console.warn(topStack);
      const error = new ListenerLeakError(message, topStack);
      this._errorHandler(error);
    }
    return () => {
      const count2 = this._stacks.get(stack.value) || 0;
      this._stacks.set(stack.value, count2 - 1);
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) {
      return void 0;
    }
    let topStack;
    let topCount = 0;
    for (const [stack, count] of this._stacks) {
      if (!topStack || topCount < count) {
        topStack = [stack, count];
        topCount = count;
      }
    }
    return topStack;
  }
};
var Stacktrace = class _Stacktrace {
  constructor(value) {
    this.value = value;
  }
  static create() {
    const err = new Error();
    return new _Stacktrace(err.stack ?? "");
  }
  print() {
    console.warn(this.value.split("\n").slice(2).join("\n"));
  }
};
var ListenerLeakError = class extends Error {
  constructor(message, stack) {
    super(message);
    this.name = "ListenerLeakError";
    this.stack = stack;
  }
};
var ListenerRefusalError = class extends Error {
  constructor(message, stack) {
    super(message);
    this.name = "ListenerRefusalError";
    this.stack = stack;
  }
};
var id = 0;
var UniqueContainer = class {
  constructor(value) {
    this.value = value;
  }
  stack;
  id = id++;
};
var compactionThreshold = 2;
var forEachListener = (listeners, fn) => {
  if (listeners instanceof UniqueContainer) {
    fn(listeners);
  } else {
    for (let i = 0; i < listeners.length; i++) {
      const l = listeners[i];
      if (l) {
        fn(l);
      }
    }
  }
};
var _listenerFinalizers;
if (_enableListenerGCedWarning) {
  const leaks = [];
  setInterval(() => {
    if (leaks.length === 0) {
      return;
    }
    console.warn("[LEAKING LISTENERS] GC'ed these listeners that were NOT yet disposed:");
    console.warn(leaks.join("\n"));
    leaks.length = 0;
  }, 3e3);
  _listenerFinalizers = new FinalizationRegistry((heldValue) => {
    if (typeof heldValue === "string") {
      leaks.push(heldValue);
    }
  });
}
var Emitter = class {
  _options;
  _leakageMon;
  _perfMon;
  _disposed;
  _event;
  /**
   * A listener, or list of listeners. A single listener is the most common
   * for event emitters (#185789), so we optimize that special case to avoid
   * wrapping it in an array (just like Node.js itself.)
   *
   * A list of listeners never 'downgrades' back to a plain function if
   * listeners are removed, for two reasons:
   *
   *  1. That's complicated (especially with the deliveryQueue)
   *  2. A listener with >1 listener is likely to have >1 listener again at
   *     some point, and swapping between arrays and functions may[citation needed]
   *     introduce unnecessary work and garbage.
   *
   * The array listeners can be 'sparse', to avoid reallocating the array
   * whenever any listener is added or removed. If more than `1 / compactionThreshold`
   * of the array is empty, only then is it resized.
   */
  _listeners;
  /**
   * Always to be defined if _listeners is an array. It's no longer a true
   * queue, but holds the dispatching 'state'. If `fire()` is called on an
   * emitter, any work left in the _deliveryQueue is finished first.
   */
  _deliveryQueue;
  _size = 0;
  constructor(options) {
    this._options = options;
    this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(options?.onListenerError ?? onUnexpectedError, this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : void 0;
    this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : void 0;
    this._deliveryQueue = this._options?.deliveryQueue;
  }
  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      if (this._deliveryQueue?.current === this) {
        this._deliveryQueue.reset();
      }
      if (this._listeners) {
        if (_enableDisposeWithListenerWarning) {
          const listeners = this._listeners;
          queueMicrotask(() => {
            forEachListener(listeners, (l) => l.stack?.print());
          });
        }
        this._listeners = void 0;
        this._size = 0;
      }
      this._options?.onDidRemoveLastListener?.();
      this._leakageMon?.dispose();
    }
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event() {
    this._event ??= (callback, thisArgs, disposables) => {
      if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
        const message = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
        console.warn(message);
        const tuple = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1];
        const error = new ListenerRefusalError(`${message}. HINT: Stack shows most frequent listener (${tuple[1]}-times)`, tuple[0]);
        const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
        errorHandler2(error);
        return Disposable.None;
      }
      if (this._disposed) {
        return Disposable.None;
      }
      if (thisArgs) {
        callback = callback.bind(thisArgs);
      }
      const contained = new UniqueContainer(callback);
      let removeMonitor;
      let stack;
      if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
        contained.stack = Stacktrace.create();
        removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
      }
      if (_enableDisposeWithListenerWarning) {
        contained.stack = stack ?? Stacktrace.create();
      }
      if (!this._listeners) {
        this._options?.onWillAddFirstListener?.(this);
        this._listeners = contained;
        this._options?.onDidAddFirstListener?.(this);
      } else if (this._listeners instanceof UniqueContainer) {
        this._deliveryQueue ??= new EventDeliveryQueuePrivate();
        this._listeners = [this._listeners, contained];
      } else {
        this._listeners.push(contained);
      }
      this._options?.onDidAddListener?.(this);
      this._size++;
      const result = toDisposable(() => {
        _listenerFinalizers?.unregister(result);
        removeMonitor?.();
        this._removeListener(contained);
      });
      if (disposables instanceof DisposableStore) {
        disposables.add(result);
      } else if (Array.isArray(disposables)) {
        disposables.push(result);
      }
      if (_listenerFinalizers) {
        const stack2 = new Error().stack.split("\n").slice(2, 3).join("\n").trim();
        const match = /(file:|vscode-file:\/\/vscode-app)?(\/[^:]*:\d+:\d+)/.exec(stack2);
        _listenerFinalizers.register(result, match?.[2] ?? stack2, result);
      }
      return result;
    };
    return this._event;
  }
  _removeListener(listener) {
    this._options?.onWillRemoveListener?.(this);
    if (!this._listeners) {
      return;
    }
    if (this._size === 1) {
      this._listeners = void 0;
      this._options?.onDidRemoveLastListener?.(this);
      this._size = 0;
      return;
    }
    const listeners = this._listeners;
    const index = listeners.indexOf(listener);
    if (index === -1) {
      console.log("disposed?", this._disposed);
      console.log("size?", this._size);
      console.log("arr?", JSON.stringify(this._listeners));
      throw new Error("Attempted to dispose unknown listener");
    }
    this._size--;
    listeners[index] = void 0;
    const adjustDeliveryQueue = this._deliveryQueue.current === this;
    if (this._size * compactionThreshold <= listeners.length) {
      let n = 0;
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]) {
          listeners[n++] = listeners[i];
        } else if (adjustDeliveryQueue && n < this._deliveryQueue.end) {
          this._deliveryQueue.end--;
          if (n < this._deliveryQueue.i) {
            this._deliveryQueue.i--;
          }
        }
      }
      listeners.length = n;
    }
  }
  _deliver(listener, value) {
    if (!listener) {
      return;
    }
    const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
    if (!errorHandler2) {
      listener.value(value);
      return;
    }
    try {
      listener.value(value);
    } catch (e) {
      errorHandler2(e);
    }
  }
  /** Delivers items in the queue. Assumes the queue is ready to go. */
  _deliverQueue(dq) {
    const listeners = dq.current._listeners;
    while (dq.i < dq.end) {
      this._deliver(listeners[dq.i++], dq.value);
    }
    dq.reset();
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event) {
    if (this._deliveryQueue?.current) {
      this._deliverQueue(this._deliveryQueue);
      this._perfMon?.stop();
    }
    this._perfMon?.start(this._size);
    if (!this._listeners) {
    } else if (this._listeners instanceof UniqueContainer) {
      this._deliver(this._listeners, event);
    } else {
      const dq = this._deliveryQueue;
      dq.enqueue(this, event, this._listeners.length);
      this._deliverQueue(dq);
    }
    this._perfMon?.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
};
var EventDeliveryQueuePrivate = class {
  /**
   * Index in current's listener list.
   */
  i = -1;
  /**
   * The last index in the listener's list to deliver.
   */
  end = 0;
  /**
   * Emitter currently being dispatched on. Emitter._listeners is always an array.
   */
  current;
  /**
   * Currently emitting value. Defined whenever `current` is.
   */
  value;
  enqueue(emitter, value, end) {
    this.i = 0;
    this.end = end;
    this.current = emitter;
    this.value = value;
  }
  reset() {
    this.i = this.end;
    this.current = void 0;
    this.value = void 0;
  }
};

// oracle/upstream/src/vs/base/common/cancellation.ts
var shortcutEvent = Object.freeze(function(callback, context) {
  const handle = setTimeout(callback.bind(context), 0);
  return { dispose() {
    clearTimeout(handle);
  } };
});
var CancellationToken;
((CancellationToken3) => {
  function isCancellationToken(thing) {
    if (thing === CancellationToken3.None || thing === CancellationToken3.Cancelled) {
      return true;
    }
    if (thing instanceof MutableToken) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
  }
  CancellationToken3.isCancellationToken = isCancellationToken;
  CancellationToken3.None = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event.None
  });
  CancellationToken3.Cancelled = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent
  });
})(CancellationToken || (CancellationToken = {}));
var MutableToken = class {
  _isCancelled = false;
  _emitter = null;
  cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;
      if (this._emitter) {
        this._emitter.fire(void 0);
        this.dispose();
      }
    }
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    if (this._isCancelled) {
      return shortcutEvent;
    }
    if (!this._emitter) {
      this._emitter = new Emitter();
    }
    return this._emitter.event;
  }
  dispose() {
    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }
  }
};

// oracle/upstream/src/vs/base/common/cache.ts
function identity(t) {
  return t;
}
var LRUCachedFunction = class {
  lastCache = void 0;
  lastArgKey = void 0;
  _fn;
  _computeKey;
  constructor(arg1, arg2) {
    if (typeof arg1 === "function") {
      this._fn = arg1;
      this._computeKey = identity;
    } else {
      this._fn = arg2;
      this._computeKey = arg1.getCacheKey;
    }
  }
  get(arg) {
    const key = this._computeKey(arg);
    if (this.lastArgKey !== key) {
      this.lastArgKey = key;
      this.lastCache = this._fn(arg);
    }
    return this.lastCache;
  }
};

// oracle/upstream/src/vs/base/common/lazy.ts
var Lazy = class {
  constructor(executor) {
    this.executor = executor;
  }
  _didRun = false;
  _value;
  _error;
  /**
   * True if the lazy value has been resolved.
   */
  get hasValue() {
    return this._didRun;
  }
  /**
   * Get the wrapped value.
   *
   * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
   * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
   */
  get value() {
    if (!this._didRun) {
      try {
        this._value = this.executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
    }
    if (this._error) {
      throw this._error;
    }
    return this._value;
  }
  /**
   * Get the wrapped value without forcing evaluation.
   */
  get rawValue() {
    return this._value;
  }
};

// oracle/upstream/src/vs/base/common/strings.ts
function isFalsyOrWhitespace(str) {
  if (!str || typeof str !== "string") {
    return true;
  }
  return str.trim().length === 0;
}
var UTF8_BOM_CHARACTER = String.fromCharCode(65279 /* UTF8_BOM */);
var AmbiguousCharacters = class _AmbiguousCharacters {
  constructor(confusableDictionary) {
    this.confusableDictionary = confusableDictionary;
  }
  static ambiguousCharacterData = new Lazy(() => {
    return JSON.parse(
      '{"_common":[8232,32,8233,32,5760,32,8192,32,8193,32,8194,32,8195,32,8196,32,8197,32,8198,32,8200,32,8201,32,8202,32,8287,32,8199,32,8239,32,2042,95,65101,95,65102,95,65103,95,8208,45,8209,45,8210,45,65112,45,1748,45,8259,45,727,45,8722,45,10134,45,11450,45,1549,44,1643,44,8218,44,184,44,42233,44,894,59,2307,58,2691,58,1417,58,1795,58,1796,58,5868,58,65072,58,6147,58,6153,58,8282,58,1475,58,760,58,42889,58,8758,58,720,58,42237,58,451,33,11601,33,660,63,577,63,2429,63,5038,63,42731,63,119149,46,8228,46,1793,46,1794,46,42510,46,68176,46,1632,46,1776,46,42232,46,1373,96,65287,96,8219,96,8242,96,1370,96,1523,96,8175,96,65344,96,900,96,8189,96,8125,96,8127,96,8190,96,697,96,884,96,712,96,714,96,715,96,756,96,699,96,701,96,700,96,702,96,42892,96,1497,96,2036,96,2037,96,5194,96,5836,96,94033,96,94034,96,65339,91,10088,40,10098,40,12308,40,64830,40,65341,93,10089,41,10099,41,12309,41,64831,41,10100,123,119060,123,10101,125,65342,94,8270,42,1645,42,8727,42,66335,42,5941,47,8257,47,8725,47,8260,47,9585,47,10187,47,10744,47,119354,47,12755,47,12339,47,11462,47,20031,47,12035,47,65340,92,65128,92,8726,92,10189,92,10741,92,10745,92,119311,92,119355,92,12756,92,20022,92,12034,92,42872,38,708,94,710,94,5869,43,10133,43,66203,43,8249,60,10094,60,706,60,119350,60,5176,60,5810,60,5120,61,11840,61,12448,61,42239,61,8250,62,10095,62,707,62,119351,62,5171,62,94015,62,8275,126,732,126,8128,126,8764,126,65372,124,65293,45,120784,50,120794,50,120804,50,120814,50,120824,50,130034,50,42842,50,423,50,1000,50,42564,50,5311,50,42735,50,119302,51,120785,51,120795,51,120805,51,120815,51,120825,51,130035,51,42923,51,540,51,439,51,42858,51,11468,51,1248,51,94011,51,71882,51,120786,52,120796,52,120806,52,120816,52,120826,52,130036,52,5070,52,71855,52,120787,53,120797,53,120807,53,120817,53,120827,53,130037,53,444,53,71867,53,120788,54,120798,54,120808,54,120818,54,120828,54,130038,54,11474,54,5102,54,71893,54,119314,55,120789,55,120799,55,120809,55,120819,55,120829,55,130039,55,66770,55,71878,55,2819,56,2538,56,2666,56,125131,56,120790,56,120800,56,120810,56,120820,56,120830,56,130040,56,547,56,546,56,66330,56,2663,57,2920,57,2541,57,3437,57,120791,57,120801,57,120811,57,120821,57,120831,57,130041,57,42862,57,11466,57,71884,57,71852,57,71894,57,9082,97,65345,97,119834,97,119886,97,119938,97,119990,97,120042,97,120094,97,120146,97,120198,97,120250,97,120302,97,120354,97,120406,97,120458,97,593,97,945,97,120514,97,120572,97,120630,97,120688,97,120746,97,65313,65,119808,65,119860,65,119912,65,119964,65,120016,65,120068,65,120120,65,120172,65,120224,65,120276,65,120328,65,120380,65,120432,65,913,65,120488,65,120546,65,120604,65,120662,65,120720,65,5034,65,5573,65,42222,65,94016,65,66208,65,119835,98,119887,98,119939,98,119991,98,120043,98,120095,98,120147,98,120199,98,120251,98,120303,98,120355,98,120407,98,120459,98,388,98,5071,98,5234,98,5551,98,65314,66,8492,66,119809,66,119861,66,119913,66,120017,66,120069,66,120121,66,120173,66,120225,66,120277,66,120329,66,120381,66,120433,66,42932,66,914,66,120489,66,120547,66,120605,66,120663,66,120721,66,5108,66,5623,66,42192,66,66178,66,66209,66,66305,66,65347,99,8573,99,119836,99,119888,99,119940,99,119992,99,120044,99,120096,99,120148,99,120200,99,120252,99,120304,99,120356,99,120408,99,120460,99,7428,99,1010,99,11429,99,43951,99,66621,99,128844,67,71922,67,71913,67,65315,67,8557,67,8450,67,8493,67,119810,67,119862,67,119914,67,119966,67,120018,67,120174,67,120226,67,120278,67,120330,67,120382,67,120434,67,1017,67,11428,67,5087,67,42202,67,66210,67,66306,67,66581,67,66844,67,8574,100,8518,100,119837,100,119889,100,119941,100,119993,100,120045,100,120097,100,120149,100,120201,100,120253,100,120305,100,120357,100,120409,100,120461,100,1281,100,5095,100,5231,100,42194,100,8558,68,8517,68,119811,68,119863,68,119915,68,119967,68,120019,68,120071,68,120123,68,120175,68,120227,68,120279,68,120331,68,120383,68,120435,68,5024,68,5598,68,5610,68,42195,68,8494,101,65349,101,8495,101,8519,101,119838,101,119890,101,119942,101,120046,101,120098,101,120150,101,120202,101,120254,101,120306,101,120358,101,120410,101,120462,101,43826,101,1213,101,8959,69,65317,69,8496,69,119812,69,119864,69,119916,69,120020,69,120072,69,120124,69,120176,69,120228,69,120280,69,120332,69,120384,69,120436,69,917,69,120492,69,120550,69,120608,69,120666,69,120724,69,11577,69,5036,69,42224,69,71846,69,71854,69,66182,69,119839,102,119891,102,119943,102,119995,102,120047,102,120099,102,120151,102,120203,102,120255,102,120307,102,120359,102,120411,102,120463,102,43829,102,42905,102,383,102,7837,102,1412,102,119315,70,8497,70,119813,70,119865,70,119917,70,120021,70,120073,70,120125,70,120177,70,120229,70,120281,70,120333,70,120385,70,120437,70,42904,70,988,70,120778,70,5556,70,42205,70,71874,70,71842,70,66183,70,66213,70,66853,70,65351,103,8458,103,119840,103,119892,103,119944,103,120048,103,120100,103,120152,103,120204,103,120256,103,120308,103,120360,103,120412,103,120464,103,609,103,7555,103,397,103,1409,103,119814,71,119866,71,119918,71,119970,71,120022,71,120074,71,120126,71,120178,71,120230,71,120282,71,120334,71,120386,71,120438,71,1292,71,5056,71,5107,71,42198,71,65352,104,8462,104,119841,104,119945,104,119997,104,120049,104,120101,104,120153,104,120205,104,120257,104,120309,104,120361,104,120413,104,120465,104,1211,104,1392,104,5058,104,65320,72,8459,72,8460,72,8461,72,119815,72,119867,72,119919,72,120023,72,120179,72,120231,72,120283,72,120335,72,120387,72,120439,72,919,72,120494,72,120552,72,120610,72,120668,72,120726,72,11406,72,5051,72,5500,72,42215,72,66255,72,731,105,9075,105,65353,105,8560,105,8505,105,8520,105,119842,105,119894,105,119946,105,119998,105,120050,105,120102,105,120154,105,120206,105,120258,105,120310,105,120362,105,120414,105,120466,105,120484,105,618,105,617,105,953,105,8126,105,890,105,120522,105,120580,105,120638,105,120696,105,120754,105,1110,105,42567,105,1231,105,43893,105,5029,105,71875,105,65354,106,8521,106,119843,106,119895,106,119947,106,119999,106,120051,106,120103,106,120155,106,120207,106,120259,106,120311,106,120363,106,120415,106,120467,106,1011,106,1112,106,65322,74,119817,74,119869,74,119921,74,119973,74,120025,74,120077,74,120129,74,120181,74,120233,74,120285,74,120337,74,120389,74,120441,74,42930,74,895,74,1032,74,5035,74,5261,74,42201,74,119844,107,119896,107,119948,107,120000,107,120052,107,120104,107,120156,107,120208,107,120260,107,120312,107,120364,107,120416,107,120468,107,8490,75,65323,75,119818,75,119870,75,119922,75,119974,75,120026,75,120078,75,120130,75,120182,75,120234,75,120286,75,120338,75,120390,75,120442,75,922,75,120497,75,120555,75,120613,75,120671,75,120729,75,11412,75,5094,75,5845,75,42199,75,66840,75,1472,108,8739,73,9213,73,65512,73,1633,108,1777,73,66336,108,125127,108,120783,73,120793,73,120803,73,120813,73,120823,73,130033,73,65321,73,8544,73,8464,73,8465,73,119816,73,119868,73,119920,73,120024,73,120128,73,120180,73,120232,73,120284,73,120336,73,120388,73,120440,73,65356,108,8572,73,8467,108,119845,108,119897,108,119949,108,120001,108,120053,108,120105,73,120157,73,120209,73,120261,73,120313,73,120365,73,120417,73,120469,73,448,73,120496,73,120554,73,120612,73,120670,73,120728,73,11410,73,1030,73,1216,73,1493,108,1503,108,1575,108,126464,108,126592,108,65166,108,65165,108,1994,108,11599,73,5825,73,42226,73,93992,73,66186,124,66313,124,119338,76,8556,76,8466,76,119819,76,119871,76,119923,76,120027,76,120079,76,120131,76,120183,76,120235,76,120287,76,120339,76,120391,76,120443,76,11472,76,5086,76,5290,76,42209,76,93974,76,71843,76,71858,76,66587,76,66854,76,65325,77,8559,77,8499,77,119820,77,119872,77,119924,77,120028,77,120080,77,120132,77,120184,77,120236,77,120288,77,120340,77,120392,77,120444,77,924,77,120499,77,120557,77,120615,77,120673,77,120731,77,1018,77,11416,77,5047,77,5616,77,5846,77,42207,77,66224,77,66321,77,119847,110,119899,110,119951,110,120003,110,120055,110,120107,110,120159,110,120211,110,120263,110,120315,110,120367,110,120419,110,120471,110,1400,110,1404,110,65326,78,8469,78,119821,78,119873,78,119925,78,119977,78,120029,78,120081,78,120185,78,120237,78,120289,78,120341,78,120393,78,120445,78,925,78,120500,78,120558,78,120616,78,120674,78,120732,78,11418,78,42208,78,66835,78,3074,111,3202,111,3330,111,3458,111,2406,111,2662,111,2790,111,3046,111,3174,111,3302,111,3430,111,3664,111,3792,111,4160,111,1637,111,1781,111,65359,111,8500,111,119848,111,119900,111,119952,111,120056,111,120108,111,120160,111,120212,111,120264,111,120316,111,120368,111,120420,111,120472,111,7439,111,7441,111,43837,111,959,111,120528,111,120586,111,120644,111,120702,111,120760,111,963,111,120532,111,120590,111,120648,111,120706,111,120764,111,11423,111,4351,111,1413,111,1505,111,1607,111,126500,111,126564,111,126596,111,65259,111,65260,111,65258,111,65257,111,1726,111,64428,111,64429,111,64427,111,64426,111,1729,111,64424,111,64425,111,64423,111,64422,111,1749,111,3360,111,4125,111,66794,111,71880,111,71895,111,66604,111,1984,79,2534,79,2918,79,12295,79,70864,79,71904,79,120782,79,120792,79,120802,79,120812,79,120822,79,130032,79,65327,79,119822,79,119874,79,119926,79,119978,79,120030,79,120082,79,120134,79,120186,79,120238,79,120290,79,120342,79,120394,79,120446,79,927,79,120502,79,120560,79,120618,79,120676,79,120734,79,11422,79,1365,79,11604,79,4816,79,2848,79,66754,79,42227,79,71861,79,66194,79,66219,79,66564,79,66838,79,9076,112,65360,112,119849,112,119901,112,119953,112,120005,112,120057,112,120109,112,120161,112,120213,112,120265,112,120317,112,120369,112,120421,112,120473,112,961,112,120530,112,120544,112,120588,112,120602,112,120646,112,120660,112,120704,112,120718,112,120762,112,120776,112,11427,112,65328,80,8473,80,119823,80,119875,80,119927,80,119979,80,120031,80,120083,80,120187,80,120239,80,120291,80,120343,80,120395,80,120447,80,929,80,120504,80,120562,80,120620,80,120678,80,120736,80,11426,80,5090,80,5229,80,42193,80,66197,80,119850,113,119902,113,119954,113,120006,113,120058,113,120110,113,120162,113,120214,113,120266,113,120318,113,120370,113,120422,113,120474,113,1307,113,1379,113,1382,113,8474,81,119824,81,119876,81,119928,81,119980,81,120032,81,120084,81,120188,81,120240,81,120292,81,120344,81,120396,81,120448,81,11605,81,119851,114,119903,114,119955,114,120007,114,120059,114,120111,114,120163,114,120215,114,120267,114,120319,114,120371,114,120423,114,120475,114,43847,114,43848,114,7462,114,11397,114,43905,114,119318,82,8475,82,8476,82,8477,82,119825,82,119877,82,119929,82,120033,82,120189,82,120241,82,120293,82,120345,82,120397,82,120449,82,422,82,5025,82,5074,82,66740,82,5511,82,42211,82,94005,82,65363,115,119852,115,119904,115,119956,115,120008,115,120060,115,120112,115,120164,115,120216,115,120268,115,120320,115,120372,115,120424,115,120476,115,42801,115,445,115,1109,115,43946,115,71873,115,66632,115,65331,83,119826,83,119878,83,119930,83,119982,83,120034,83,120086,83,120138,83,120190,83,120242,83,120294,83,120346,83,120398,83,120450,83,1029,83,1359,83,5077,83,5082,83,42210,83,94010,83,66198,83,66592,83,119853,116,119905,116,119957,116,120009,116,120061,116,120113,116,120165,116,120217,116,120269,116,120321,116,120373,116,120425,116,120477,116,8868,84,10201,84,128872,84,65332,84,119827,84,119879,84,119931,84,119983,84,120035,84,120087,84,120139,84,120191,84,120243,84,120295,84,120347,84,120399,84,120451,84,932,84,120507,84,120565,84,120623,84,120681,84,120739,84,11430,84,5026,84,42196,84,93962,84,71868,84,66199,84,66225,84,66325,84,119854,117,119906,117,119958,117,120010,117,120062,117,120114,117,120166,117,120218,117,120270,117,120322,117,120374,117,120426,117,120478,117,42911,117,7452,117,43854,117,43858,117,651,117,965,117,120534,117,120592,117,120650,117,120708,117,120766,117,1405,117,66806,117,71896,117,8746,85,8899,85,119828,85,119880,85,119932,85,119984,85,120036,85,120088,85,120140,85,120192,85,120244,85,120296,85,120348,85,120400,85,120452,85,1357,85,4608,85,66766,85,5196,85,42228,85,94018,85,71864,85,8744,118,8897,118,65366,118,8564,118,119855,118,119907,118,119959,118,120011,118,120063,118,120115,118,120167,118,120219,118,120271,118,120323,118,120375,118,120427,118,120479,118,7456,118,957,118,120526,118,120584,118,120642,118,120700,118,120758,118,1141,118,1496,118,71430,118,43945,118,71872,118,119309,86,1639,86,1783,86,8548,86,119829,86,119881,86,119933,86,119985,86,120037,86,120089,86,120141,86,120193,86,120245,86,120297,86,120349,86,120401,86,120453,86,1140,86,11576,86,5081,86,5167,86,42719,86,42214,86,93960,86,71840,86,66845,86,623,119,119856,119,119908,119,119960,119,120012,119,120064,119,120116,119,120168,119,120220,119,120272,119,120324,119,120376,119,120428,119,120480,119,7457,119,1121,119,1309,119,1377,119,71434,119,71438,119,71439,119,43907,119,71919,87,71910,87,119830,87,119882,87,119934,87,119986,87,120038,87,120090,87,120142,87,120194,87,120246,87,120298,87,120350,87,120402,87,120454,87,1308,87,5043,87,5076,87,42218,87,5742,120,10539,120,10540,120,10799,120,65368,120,8569,120,119857,120,119909,120,119961,120,120013,120,120065,120,120117,120,120169,120,120221,120,120273,120,120325,120,120377,120,120429,120,120481,120,5441,120,5501,120,5741,88,9587,88,66338,88,71916,88,65336,88,8553,88,119831,88,119883,88,119935,88,119987,88,120039,88,120091,88,120143,88,120195,88,120247,88,120299,88,120351,88,120403,88,120455,88,42931,88,935,88,120510,88,120568,88,120626,88,120684,88,120742,88,11436,88,11613,88,5815,88,42219,88,66192,88,66228,88,66327,88,66855,88,611,121,7564,121,65369,121,119858,121,119910,121,119962,121,120014,121,120066,121,120118,121,120170,121,120222,121,120274,121,120326,121,120378,121,120430,121,120482,121,655,121,7935,121,43866,121,947,121,8509,121,120516,121,120574,121,120632,121,120690,121,120748,121,1199,121,4327,121,71900,121,65337,89,119832,89,119884,89,119936,89,119988,89,120040,89,120092,89,120144,89,120196,89,120248,89,120300,89,120352,89,120404,89,120456,89,933,89,978,89,120508,89,120566,89,120624,89,120682,89,120740,89,11432,89,1198,89,5033,89,5053,89,42220,89,94019,89,71844,89,66226,89,119859,122,119911,122,119963,122,120015,122,120067,122,120119,122,120171,122,120223,122,120275,122,120327,122,120379,122,120431,122,120483,122,7458,122,43923,122,71876,122,66293,90,71909,90,65338,90,8484,90,8488,90,119833,90,119885,90,119937,90,119989,90,120041,90,120197,90,120249,90,120301,90,120353,90,120405,90,120457,90,918,90,120493,90,120551,90,120609,90,120667,90,120725,90,5059,90,42204,90,71849,90,65282,34,65284,36,65285,37,65286,38,65290,42,65291,43,65294,46,65295,47,65296,48,65297,49,65298,50,65299,51,65300,52,65301,53,65302,54,65303,55,65304,56,65305,57,65308,60,65309,61,65310,62,65312,64,65316,68,65318,70,65319,71,65324,76,65329,81,65330,82,65333,85,65334,86,65335,87,65343,95,65346,98,65348,100,65350,102,65355,107,65357,109,65358,110,65361,113,65362,114,65364,116,65365,117,65367,119,65370,122,65371,123,65373,125,119846,109],"_default":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"cs":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"de":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"es":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"fr":[65374,126,65306,58,65281,33,8216,96,8245,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"it":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ja":[8211,45,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65292,44,65307,59],"ko":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pl":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pt-BR":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"qps-ploc":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ru":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,305,105,921,73,1009,112,215,120,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"tr":[160,32,8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"zh-hans":[65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41],"zh-hant":[8211,45,65374,126,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65307,59]}'
    );
  });
  static cache = new LRUCachedFunction({ getCacheKey: JSON.stringify }, (locales) => {
    function arrayToMap(arr) {
      const result = /* @__PURE__ */ new Map();
      for (let i = 0; i < arr.length; i += 2) {
        result.set(arr[i], arr[i + 1]);
      }
      return result;
    }
    function mergeMaps(map1, map2) {
      const result = new Map(map1);
      for (const [key, value] of map2) {
        result.set(key, value);
      }
      return result;
    }
    function intersectMaps(map1, map2) {
      if (!map1) {
        return map2;
      }
      const result = /* @__PURE__ */ new Map();
      for (const [key, value] of map1) {
        if (map2.has(key)) {
          result.set(key, value);
        }
      }
      return result;
    }
    const data = this.ambiguousCharacterData.value;
    let filteredLocales = locales.filter(
      (l) => !l.startsWith("_") && l in data
    );
    if (filteredLocales.length === 0) {
      filteredLocales = ["_default"];
    }
    let languageSpecificMap = void 0;
    for (const locale of filteredLocales) {
      const map2 = arrayToMap(data[locale]);
      languageSpecificMap = intersectMaps(languageSpecificMap, map2);
    }
    const commonMap = arrayToMap(data["_common"]);
    const map = mergeMaps(commonMap, languageSpecificMap);
    return new _AmbiguousCharacters(map);
  });
  static getInstance(locales) {
    return _AmbiguousCharacters.cache.get(Array.from(locales));
  }
  static _locales = new Lazy(
    () => Object.keys(_AmbiguousCharacters.ambiguousCharacterData.value).filter(
      (k) => !k.startsWith("_")
    )
  );
  static getLocales() {
    return _AmbiguousCharacters._locales.value;
  }
  isAmbiguous(codePoint) {
    return this.confusableDictionary.has(codePoint);
  }
  containsAmbiguousCharacter(str) {
    for (let i = 0; i < str.length; i++) {
      const codePoint = str.codePointAt(i);
      if (typeof codePoint === "number" && this.isAmbiguous(codePoint)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns the non basic ASCII code point that the given code point can be confused,
   * or undefined if such code point does note exist.
   */
  getPrimaryConfusable(codePoint) {
    return this.confusableDictionary.get(codePoint);
  }
  getConfusableCodePoints() {
    return new Set(this.confusableDictionary.keys());
  }
};

// oracle/upstream/src/vs/platform/contextkey/common/scanner.ts
function hintDidYouMean(...meant) {
  switch (meant.length) {
    case 1:
      return localize("contextkey.scanner.hint.didYouMean1", "Did you mean {0}?", meant[0]);
    case 2:
      return localize("contextkey.scanner.hint.didYouMean2", "Did you mean {0} or {1}?", meant[0], meant[1]);
    case 3:
      return localize("contextkey.scanner.hint.didYouMean3", "Did you mean {0}, {1} or {2}?", meant[0], meant[1], meant[2]);
    default:
      return void 0;
  }
}
var hintDidYouForgetToOpenOrCloseQuote = localize("contextkey.scanner.hint.didYouForgetToOpenOrCloseQuote", "Did you forget to open or close the quote?");
var hintDidYouForgetToEscapeSlash = localize("contextkey.scanner.hint.didYouForgetToEscapeSlash", "Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/'.");
var Scanner = class _Scanner {
  static getLexeme(token) {
    switch (token.type) {
      case 0 /* LParen */:
        return "(";
      case 1 /* RParen */:
        return ")";
      case 2 /* Neg */:
        return "!";
      case 3 /* Eq */:
        return token.isTripleEq ? "===" : "==";
      case 4 /* NotEq */:
        return token.isTripleEq ? "!==" : "!=";
      case 5 /* Lt */:
        return "<";
      case 6 /* LtEq */:
        return "<=";
      case 7 /* Gt */:
        return ">=";
      case 8 /* GtEq */:
        return ">=";
      case 9 /* RegexOp */:
        return "=~";
      case 10 /* RegexStr */:
        return token.lexeme;
      case 11 /* True */:
        return "true";
      case 12 /* False */:
        return "false";
      case 13 /* In */:
        return "in";
      case 14 /* Not */:
        return "not";
      case 15 /* And */:
        return "&&";
      case 16 /* Or */:
        return "||";
      case 17 /* Str */:
        return token.lexeme;
      case 18 /* QuotedStr */:
        return token.lexeme;
      case 19 /* Error */:
        return token.lexeme;
      case 20 /* EOF */:
        return "EOF";
      default:
        throw illegalState(`unhandled token type: ${JSON.stringify(token)}; have you forgotten to add a case?`);
    }
  }
  static _regexFlags = new Set(["i", "g", "s", "m", "y", "u"].map((ch) => ch.charCodeAt(0)));
  static _keywords = /* @__PURE__ */ new Map([
    ["not", 14 /* Not */],
    ["in", 13 /* In */],
    ["false", 12 /* False */],
    ["true", 11 /* True */]
  ]);
  _input = "";
  _start = 0;
  _current = 0;
  _tokens = [];
  _errors = [];
  get errors() {
    return this._errors;
  }
  reset(value) {
    this._input = value;
    this._start = 0;
    this._current = 0;
    this._tokens = [];
    this._errors = [];
    return this;
  }
  scan() {
    while (!this._isAtEnd()) {
      this._start = this._current;
      const ch = this._advance();
      switch (ch) {
        case 40 /* OpenParen */:
          this._addToken(0 /* LParen */);
          break;
        case 41 /* CloseParen */:
          this._addToken(1 /* RParen */);
          break;
        case 33 /* ExclamationMark */:
          if (this._match(61 /* Equals */)) {
            const isTripleEq = this._match(61 /* Equals */);
            this._tokens.push({ type: 4 /* NotEq */, offset: this._start, isTripleEq });
          } else {
            this._addToken(2 /* Neg */);
          }
          break;
        case 39 /* SingleQuote */:
          this._quotedString();
          break;
        case 47 /* Slash */:
          this._regex();
          break;
        case 61 /* Equals */:
          if (this._match(61 /* Equals */)) {
            const isTripleEq = this._match(61 /* Equals */);
            this._tokens.push({ type: 3 /* Eq */, offset: this._start, isTripleEq });
          } else if (this._match(126 /* Tilde */)) {
            this._addToken(9 /* RegexOp */);
          } else {
            this._error(hintDidYouMean("==", "=~"));
          }
          break;
        case 60 /* LessThan */:
          this._addToken(this._match(61 /* Equals */) ? 6 /* LtEq */ : 5 /* Lt */);
          break;
        case 62 /* GreaterThan */:
          this._addToken(this._match(61 /* Equals */) ? 8 /* GtEq */ : 7 /* Gt */);
          break;
        case 38 /* Ampersand */:
          if (this._match(38 /* Ampersand */)) {
            this._addToken(15 /* And */);
          } else {
            this._error(hintDidYouMean("&&"));
          }
          break;
        case 124 /* Pipe */:
          if (this._match(124 /* Pipe */)) {
            this._addToken(16 /* Or */);
          } else {
            this._error(hintDidYouMean("||"));
          }
          break;
        // TODO@ulugbekna: 1) rewrite using a regex 2) reconsider what characters are considered whitespace, including unicode, nbsp, etc.
        case 32 /* Space */:
        case 13 /* CarriageReturn */:
        case 9 /* Tab */:
        case 10 /* LineFeed */:
        case 160 /* NoBreakSpace */:
          break;
        default:
          this._string();
      }
    }
    this._start = this._current;
    this._addToken(20 /* EOF */);
    return Array.from(this._tokens);
  }
  _match(expected) {
    if (this._isAtEnd()) {
      return false;
    }
    if (this._input.charCodeAt(this._current) !== expected) {
      return false;
    }
    this._current++;
    return true;
  }
  _advance() {
    return this._input.charCodeAt(this._current++);
  }
  _peek() {
    return this._isAtEnd() ? 0 /* Null */ : this._input.charCodeAt(this._current);
  }
  _addToken(type) {
    this._tokens.push({ type, offset: this._start });
  }
  _error(additional) {
    const offset = this._start;
    const lexeme = this._input.substring(this._start, this._current);
    const errToken = { type: 19 /* Error */, offset: this._start, lexeme };
    this._errors.push({ offset, lexeme, additionalInfo: additional });
    this._tokens.push(errToken);
  }
  // u - unicode, y - sticky // TODO@ulugbekna: we accept double quotes as part of the string rather than as a delimiter (to preserve old parser's behavior)
  stringRe = /[a-zA-Z0-9_<>\-\./\\:\*\?\+\[\]\^,#@;"%\$\p{L}-]+/uy;
  _string() {
    this.stringRe.lastIndex = this._start;
    const match = this.stringRe.exec(this._input);
    if (match) {
      this._current = this._start + match[0].length;
      const lexeme = this._input.substring(this._start, this._current);
      const keyword = _Scanner._keywords.get(lexeme);
      if (keyword) {
        this._addToken(keyword);
      } else {
        this._tokens.push({ type: 17 /* Str */, lexeme, offset: this._start });
      }
    }
  }
  // captures the lexeme without the leading and trailing '
  _quotedString() {
    while (this._peek() !== 39 /* SingleQuote */ && !this._isAtEnd()) {
      this._advance();
    }
    if (this._isAtEnd()) {
      this._error(hintDidYouForgetToOpenOrCloseQuote);
      return;
    }
    this._advance();
    this._tokens.push({ type: 18 /* QuotedStr */, lexeme: this._input.substring(this._start + 1, this._current - 1), offset: this._start + 1 });
  }
  /*
   * Lexing a regex expression: /.../[igsmyu]*
   * Based on https://github.com/microsoft/TypeScript/blob/9247ef115e617805983740ba795d7a8164babf89/src/compiler/scanner.ts#L2129-L2181
   *
   * Note that we want slashes within a regex to be escaped, e.g., /file:\\/\\/\\// should match `file:///`
   */
  _regex() {
    let p = this._current;
    let inEscape = false;
    let inCharacterClass = false;
    while (true) {
      if (p >= this._input.length) {
        this._current = p;
        this._error(hintDidYouForgetToEscapeSlash);
        return;
      }
      const ch = this._input.charCodeAt(p);
      if (inEscape) {
        inEscape = false;
      } else if (ch === 47 /* Slash */ && !inCharacterClass) {
        p++;
        break;
      } else if (ch === 91 /* OpenSquareBracket */) {
        inCharacterClass = true;
      } else if (ch === 92 /* Backslash */) {
        inEscape = true;
      } else if (ch === 93 /* CloseSquareBracket */) {
        inCharacterClass = false;
      }
      p++;
    }
    while (p < this._input.length && _Scanner._regexFlags.has(this._input.charCodeAt(p))) {
      p++;
    }
    this._current = p;
    const lexeme = this._input.substring(this._start, this._current);
    this._tokens.push({ type: 10 /* RegexStr */, lexeme, offset: this._start });
  }
  _isAtEnd() {
    return this._current >= this._input.length;
  }
};

// oracle/upstream/src/vs/platform/instantiation/common/instantiation.ts
var _util;
((_util2) => {
  _util2.serviceIds = /* @__PURE__ */ new Map();
  _util2.DI_TARGET = "$di$target";
  _util2.DI_DEPENDENCIES = "$di$dependencies";
  function getServiceDependencies(ctor) {
    return ctor[_util2.DI_DEPENDENCIES] || [];
  }
  _util2.getServiceDependencies = getServiceDependencies;
})(_util || (_util = {}));
var IInstantiationService = createDecorator("instantiationService");
function storeServiceDependency(id2, target, index) {
  if (target[_util.DI_TARGET] === target) {
    target[_util.DI_DEPENDENCIES].push({ id: id2, index });
  } else {
    target[_util.DI_DEPENDENCIES] = [{ id: id2, index }];
    target[_util.DI_TARGET] = target;
  }
}
function createDecorator(serviceId) {
  if (_util.serviceIds.has(serviceId)) {
    return _util.serviceIds.get(serviceId);
  }
  const id2 = function(target, key, index) {
    if (arguments.length !== 3) {
      throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    }
    storeServiceDependency(id2, target, index);
  };
  id2.toString = () => serviceId;
  _util.serviceIds.set(serviceId, id2);
  return id2;
}

// oracle/upstream/src/vs/platform/contextkey/common/contextkey.ts
var CONSTANT_VALUES = /* @__PURE__ */ new Map();
CONSTANT_VALUES.set("false", false);
CONSTANT_VALUES.set("true", true);
CONSTANT_VALUES.set("isMac", isMacintosh);
CONSTANT_VALUES.set("isLinux", isLinux);
CONSTANT_VALUES.set("isWindows", isWindows);
CONSTANT_VALUES.set("isWeb", isWeb);
CONSTANT_VALUES.set("isMacNative", isMacintosh && !isWeb);
CONSTANT_VALUES.set("isEdge", isEdge);
CONSTANT_VALUES.set("isFirefox", isFirefox);
CONSTANT_VALUES.set("isChrome", isChrome);
CONSTANT_VALUES.set("isSafari", isSafari);
var hasOwnProperty = Object.prototype.hasOwnProperty;
var defaultConfig = {
  regexParsingWithErrorRecovery: true
};
var errorEmptyString = localize("contextkey.parser.error.emptyString", "Empty context key expression");
var hintEmptyString = localize("contextkey.parser.error.emptyString.hint", "Did you forget to write an expression? You can also put 'false' or 'true' to always evaluate to false or true, respectively.");
var errorNoInAfterNot = localize("contextkey.parser.error.noInAfterNot", "'in' after 'not'.");
var errorClosingParenthesis = localize("contextkey.parser.error.closingParenthesis", "closing parenthesis ')'");
var errorUnexpectedToken = localize("contextkey.parser.error.unexpectedToken", "Unexpected token");
var hintUnexpectedToken = localize("contextkey.parser.error.unexpectedToken.hint", "Did you forget to put && or || before the token?");
var errorUnexpectedEOF = localize("contextkey.parser.error.unexpectedEOF", "Unexpected end of expression");
var hintUnexpectedEOF = localize("contextkey.parser.error.unexpectedEOF.hint", "Did you forget to put a context key?");
var Parser = class _Parser {
  constructor(_config = defaultConfig) {
    this._config = _config;
  }
  // Note: this doesn't produce an exact syntax tree but a normalized one
  // ContextKeyExpression's that we use as AST nodes do not expose constructors that do not normalize
  static _parseError = new Error();
  // lifetime note: `_scanner` lives as long as the parser does, i.e., is not reset between calls to `parse`
  _scanner = new Scanner();
  // lifetime note: `_tokens`, `_current`, and `_parsingErrors` must be reset between calls to `parse`
  _tokens = [];
  _current = 0;
  // invariant: 0 <= this._current < this._tokens.length ; any incrementation of this value must first call `_isAtEnd`
  _parsingErrors = [];
  get lexingErrors() {
    return this._scanner.errors;
  }
  get parsingErrors() {
    return this._parsingErrors;
  }
  /**
   * Parse a context key expression.
   *
   * @param input the expression to parse
   * @returns the parsed expression or `undefined` if there's an error - call `lexingErrors` and `parsingErrors` to see the errors
   */
  parse(input) {
    if (input === "") {
      this._parsingErrors.push({ message: errorEmptyString, offset: 0, lexeme: "", additionalInfo: hintEmptyString });
      return void 0;
    }
    this._tokens = this._scanner.reset(input).scan();
    this._current = 0;
    this._parsingErrors = [];
    try {
      const expr = this._expr();
      if (!this._isAtEnd()) {
        const peek = this._peek();
        const additionalInfo = peek.type === 17 /* Str */ ? hintUnexpectedToken : void 0;
        this._parsingErrors.push({ message: errorUnexpectedToken, offset: peek.offset, lexeme: Scanner.getLexeme(peek), additionalInfo });
        throw _Parser._parseError;
      }
      return expr;
    } catch (e) {
      if (!(e === _Parser._parseError)) {
        throw e;
      }
      return void 0;
    }
  }
  _expr() {
    return this._or();
  }
  _or() {
    const expr = [this._and()];
    while (this._matchOne(16 /* Or */)) {
      const right = this._and();
      expr.push(right);
    }
    return expr.length === 1 ? expr[0] : ContextKeyExpr.or(...expr);
  }
  _and() {
    const expr = [this._term()];
    while (this._matchOne(15 /* And */)) {
      const right = this._term();
      expr.push(right);
    }
    return expr.length === 1 ? expr[0] : ContextKeyExpr.and(...expr);
  }
  _term() {
    if (this._matchOne(2 /* Neg */)) {
      const peek = this._peek();
      switch (peek.type) {
        case 11 /* True */:
          this._advance();
          return ContextKeyFalseExpr.INSTANCE;
        case 12 /* False */:
          this._advance();
          return ContextKeyTrueExpr.INSTANCE;
        case 0 /* LParen */: {
          this._advance();
          const expr = this._expr();
          this._consume(1 /* RParen */, errorClosingParenthesis);
          return expr?.negate();
        }
        case 17 /* Str */:
          this._advance();
          return ContextKeyNotExpr.create(peek.lexeme);
        default:
          throw this._errExpectedButGot(`KEY | true | false | '(' expression ')'`, peek);
      }
    }
    return this._primary();
  }
  _primary() {
    const peek = this._peek();
    switch (peek.type) {
      case 11 /* True */:
        this._advance();
        return ContextKeyExpr.true();
      case 12 /* False */:
        this._advance();
        return ContextKeyExpr.false();
      case 0 /* LParen */: {
        this._advance();
        const expr = this._expr();
        this._consume(1 /* RParen */, errorClosingParenthesis);
        return expr;
      }
      case 17 /* Str */: {
        const key = peek.lexeme;
        this._advance();
        if (this._matchOne(9 /* RegexOp */)) {
          const expr = this._peek();
          if (!this._config.regexParsingWithErrorRecovery) {
            this._advance();
            if (expr.type !== 10 /* RegexStr */) {
              throw this._errExpectedButGot(`REGEX`, expr);
            }
            const regexLexeme = expr.lexeme;
            const closingSlashIndex = regexLexeme.lastIndexOf("/");
            const flags = closingSlashIndex === regexLexeme.length - 1 ? void 0 : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
            let regexp;
            try {
              regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
            } catch (e) {
              throw this._errExpectedButGot(`REGEX`, expr);
            }
            return ContextKeyRegexExpr.create(key, regexp);
          }
          switch (expr.type) {
            case 10 /* RegexStr */:
            case 19 /* Error */: {
              const lexemeReconstruction = [expr.lexeme];
              this._advance();
              let followingToken = this._peek();
              let parenBalance = 0;
              for (let i = 0; i < expr.lexeme.length; i++) {
                if (expr.lexeme.charCodeAt(i) === 40 /* OpenParen */) {
                  parenBalance++;
                } else if (expr.lexeme.charCodeAt(i) === 41 /* CloseParen */) {
                  parenBalance--;
                }
              }
              while (!this._isAtEnd() && followingToken.type !== 15 /* And */ && followingToken.type !== 16 /* Or */) {
                switch (followingToken.type) {
                  case 0 /* LParen */:
                    parenBalance++;
                    break;
                  case 1 /* RParen */:
                    parenBalance--;
                    break;
                  case 10 /* RegexStr */:
                  case 18 /* QuotedStr */:
                    for (let i = 0; i < followingToken.lexeme.length; i++) {
                      if (followingToken.lexeme.charCodeAt(i) === 40 /* OpenParen */) {
                        parenBalance++;
                      } else if (expr.lexeme.charCodeAt(i) === 41 /* CloseParen */) {
                        parenBalance--;
                      }
                    }
                }
                if (parenBalance < 0) {
                  break;
                }
                lexemeReconstruction.push(Scanner.getLexeme(followingToken));
                this._advance();
                followingToken = this._peek();
              }
              const regexLexeme = lexemeReconstruction.join("");
              const closingSlashIndex = regexLexeme.lastIndexOf("/");
              const flags = closingSlashIndex === regexLexeme.length - 1 ? void 0 : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
              let regexp;
              try {
                regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
              } catch (e) {
                throw this._errExpectedButGot(`REGEX`, expr);
              }
              return ContextKeyExpr.regex(key, regexp);
            }
            case 18 /* QuotedStr */: {
              const serializedValue = expr.lexeme;
              this._advance();
              let regex = null;
              if (!isFalsyOrWhitespace(serializedValue)) {
                const start = serializedValue.indexOf("/");
                const end = serializedValue.lastIndexOf("/");
                if (start !== end && start >= 0) {
                  const value = serializedValue.slice(start + 1, end);
                  const caseIgnoreFlag = serializedValue[end + 1] === "i" ? "i" : "";
                  try {
                    regex = new RegExp(value, caseIgnoreFlag);
                  } catch (_e) {
                    throw this._errExpectedButGot(`REGEX`, expr);
                  }
                }
              }
              if (regex === null) {
                throw this._errExpectedButGot("REGEX", expr);
              }
              return ContextKeyRegexExpr.create(key, regex);
            }
            default:
              throw this._errExpectedButGot("REGEX", this._peek());
          }
        }
        if (this._matchOne(14 /* Not */)) {
          this._consume(13 /* In */, errorNoInAfterNot);
          const right = this._value();
          return ContextKeyExpr.notIn(key, right);
        }
        const maybeOp = this._peek().type;
        switch (maybeOp) {
          case 3 /* Eq */: {
            this._advance();
            const right = this._value();
            if (this._previous().type === 18 /* QuotedStr */) {
              return ContextKeyExpr.equals(key, right);
            }
            switch (right) {
              case "true":
                return ContextKeyExpr.has(key);
              case "false":
                return ContextKeyExpr.not(key);
              default:
                return ContextKeyExpr.equals(key, right);
            }
          }
          case 4 /* NotEq */: {
            this._advance();
            const right = this._value();
            if (this._previous().type === 18 /* QuotedStr */) {
              return ContextKeyExpr.notEquals(key, right);
            }
            switch (right) {
              case "true":
                return ContextKeyExpr.not(key);
              case "false":
                return ContextKeyExpr.has(key);
              default:
                return ContextKeyExpr.notEquals(key, right);
            }
          }
          // TODO: ContextKeyExpr.smaller(key, right) accepts only `number` as `right` AND during eval of this node, we just eval to `false` if `right` is not a number
          // consequently, package.json linter should _warn_ the user if they're passing undesired things to ops
          case 5 /* Lt */:
            this._advance();
            return ContextKeySmallerExpr.create(key, this._value());
          case 6 /* LtEq */:
            this._advance();
            return ContextKeySmallerEqualsExpr.create(key, this._value());
          case 7 /* Gt */:
            this._advance();
            return ContextKeyGreaterExpr.create(key, this._value());
          case 8 /* GtEq */:
            this._advance();
            return ContextKeyGreaterEqualsExpr.create(key, this._value());
          case 13 /* In */:
            this._advance();
            return ContextKeyExpr.in(key, this._value());
          default:
            return ContextKeyExpr.has(key);
        }
      }
      case 20 /* EOF */:
        this._parsingErrors.push({ message: errorUnexpectedEOF, offset: peek.offset, lexeme: "", additionalInfo: hintUnexpectedEOF });
        throw _Parser._parseError;
      default:
        throw this._errExpectedButGot(`true | false | KEY 
	| KEY '=~' REGEX 
	| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`, this._peek());
    }
  }
  _value() {
    const token = this._peek();
    switch (token.type) {
      case 17 /* Str */:
      case 18 /* QuotedStr */:
        this._advance();
        return token.lexeme;
      case 11 /* True */:
        this._advance();
        return "true";
      case 12 /* False */:
        this._advance();
        return "false";
      case 13 /* In */:
        this._advance();
        return "in";
      default:
        return "";
    }
  }
  _flagsGYRe = /g|y/g;
  _removeFlagsGY(flags) {
    return flags.replaceAll(this._flagsGYRe, "");
  }
  // careful: this can throw if current token is the initial one (ie index = 0)
  _previous() {
    return this._tokens[this._current - 1];
  }
  _matchOne(token) {
    if (this._check(token)) {
      this._advance();
      return true;
    }
    return false;
  }
  _advance() {
    if (!this._isAtEnd()) {
      this._current++;
    }
    return this._previous();
  }
  _consume(type, message) {
    if (this._check(type)) {
      return this._advance();
    }
    throw this._errExpectedButGot(message, this._peek());
  }
  _errExpectedButGot(expected, got, additionalInfo) {
    const message = localize("contextkey.parser.error.expectedButGot", "Expected: {0}\nReceived: '{1}'.", expected, Scanner.getLexeme(got));
    const offset = got.offset;
    const lexeme = Scanner.getLexeme(got);
    this._parsingErrors.push({ message, offset, lexeme, additionalInfo });
    return _Parser._parseError;
  }
  _check(type) {
    return this._peek().type === type;
  }
  _peek() {
    return this._tokens[this._current];
  }
  _isAtEnd() {
    return this._peek().type === 20 /* EOF */;
  }
};
var ContextKeyExpr = class {
  static false() {
    return ContextKeyFalseExpr.INSTANCE;
  }
  static true() {
    return ContextKeyTrueExpr.INSTANCE;
  }
  static has(key) {
    return ContextKeyDefinedExpr.create(key);
  }
  static equals(key, value) {
    return ContextKeyEqualsExpr.create(key, value);
  }
  static notEquals(key, value) {
    return ContextKeyNotEqualsExpr.create(key, value);
  }
  static regex(key, value) {
    return ContextKeyRegexExpr.create(key, value);
  }
  static in(key, value) {
    return ContextKeyInExpr.create(key, value);
  }
  static notIn(key, value) {
    return ContextKeyNotInExpr.create(key, value);
  }
  static not(key) {
    return ContextKeyNotExpr.create(key);
  }
  static and(...expr) {
    return ContextKeyAndExpr.create(expr, null, true);
  }
  static or(...expr) {
    return ContextKeyOrExpr.create(expr, null, true);
  }
  static greater(key, value) {
    return ContextKeyGreaterExpr.create(key, value);
  }
  static greaterEquals(key, value) {
    return ContextKeyGreaterEqualsExpr.create(key, value);
  }
  static smaller(key, value) {
    return ContextKeySmallerExpr.create(key, value);
  }
  static smallerEquals(key, value) {
    return ContextKeySmallerEqualsExpr.create(key, value);
  }
  static _parser = new Parser({ regexParsingWithErrorRecovery: false });
  static deserialize(serialized) {
    if (serialized === void 0 || serialized === null) {
      return void 0;
    }
    const expr = this._parser.parse(serialized);
    return expr;
  }
};
function expressionsAreEqualWithConstantSubstitution(a, b) {
  const aExpr = a ? a.substituteConstants() : void 0;
  const bExpr = b ? b.substituteConstants() : void 0;
  if (!aExpr && !bExpr) {
    return true;
  }
  if (!aExpr || !bExpr) {
    return false;
  }
  return aExpr.equals(bExpr);
}
function cmp(a, b) {
  return a.cmp(b);
}
var ContextKeyFalseExpr = class _ContextKeyFalseExpr {
  static INSTANCE = new _ContextKeyFalseExpr();
  type = 0 /* False */;
  constructor() {
  }
  cmp(other) {
    return this.type - other.type;
  }
  equals(other) {
    return other.type === this.type;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    return false;
  }
  serialize() {
    return "false";
  }
  keys() {
    return [];
  }
  map(mapFnc) {
    return this;
  }
  negate() {
    return ContextKeyTrueExpr.INSTANCE;
  }
};
var ContextKeyTrueExpr = class _ContextKeyTrueExpr {
  static INSTANCE = new _ContextKeyTrueExpr();
  type = 1 /* True */;
  constructor() {
  }
  cmp(other) {
    return this.type - other.type;
  }
  equals(other) {
    return other.type === this.type;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    return true;
  }
  serialize() {
    return "true";
  }
  keys() {
    return [];
  }
  map(mapFnc) {
    return this;
  }
  negate() {
    return ContextKeyFalseExpr.INSTANCE;
  }
};
var ContextKeyDefinedExpr = class _ContextKeyDefinedExpr {
  constructor(key, negated) {
    this.key = key;
    this.negated = negated;
  }
  static create(key, negated = null) {
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === "boolean") {
      return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return new _ContextKeyDefinedExpr(key, negated);
  }
  type = 2 /* Defined */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp1(this.key, other.key);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key;
    }
    return false;
  }
  substituteConstants() {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === "boolean") {
      return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return this;
  }
  evaluate(context) {
    return !!context.getValue(this.key);
  }
  serialize() {
    return this.key;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapDefined(this.key);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyNotExpr.create(this.key, this);
    }
    return this.negated;
  }
};
var ContextKeyEqualsExpr = class _ContextKeyEqualsExpr {
  constructor(key, value, negated) {
    this.key = key;
    this.value = value;
    this.negated = negated;
  }
  static create(key, value, negated = null) {
    if (typeof value === "boolean") {
      return value ? ContextKeyDefinedExpr.create(key, negated) : ContextKeyNotExpr.create(key, negated);
    }
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === "boolean") {
      const trueValue = constantValue ? "true" : "false";
      return value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return new _ContextKeyEqualsExpr(key, value, negated);
  }
  type = 4 /* Equals */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }
  substituteConstants() {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === "boolean") {
      const trueValue = constantValue ? "true" : "false";
      return this.value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return this;
  }
  evaluate(context) {
    return context.getValue(this.key) == this.value;
  }
  serialize() {
    return `${this.key} == '${this.value}'`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapEquals(this.key, this.value);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyNotEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
};
var ContextKeyInExpr = class _ContextKeyInExpr {
  constructor(key, valueKey) {
    this.key = key;
    this.valueKey = valueKey;
  }
  static create(key, valueKey) {
    return new _ContextKeyInExpr(key, valueKey);
  }
  type = 10 /* In */;
  negated = null;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.valueKey, other.key, other.valueKey);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.valueKey === other.valueKey;
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    const source = context.getValue(this.valueKey);
    const item = context.getValue(this.key);
    if (Array.isArray(source)) {
      return source.includes(item);
    }
    if (typeof item === "string" && typeof source === "object" && source !== null) {
      return hasOwnProperty.call(source, item);
    }
    return false;
  }
  serialize() {
    return `${this.key} in '${this.valueKey}'`;
  }
  keys() {
    return [this.key, this.valueKey];
  }
  map(mapFnc) {
    return mapFnc.mapIn(this.key, this.valueKey);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyNotInExpr.create(this.key, this.valueKey);
    }
    return this.negated;
  }
};
var ContextKeyNotInExpr = class _ContextKeyNotInExpr {
  constructor(key, valueKey) {
    this.key = key;
    this.valueKey = valueKey;
    this._negated = ContextKeyInExpr.create(key, valueKey);
  }
  static create(key, valueKey) {
    return new _ContextKeyNotInExpr(key, valueKey);
  }
  type = 11 /* NotIn */;
  _negated;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return this._negated.cmp(other._negated);
  }
  equals(other) {
    if (other.type === this.type) {
      return this._negated.equals(other._negated);
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    return !this._negated.evaluate(context);
  }
  serialize() {
    return `${this.key} not in '${this.valueKey}'`;
  }
  keys() {
    return this._negated.keys();
  }
  map(mapFnc) {
    return mapFnc.mapNotIn(this.key, this.valueKey);
  }
  negate() {
    return this._negated;
  }
};
var ContextKeyNotEqualsExpr = class _ContextKeyNotEqualsExpr {
  constructor(key, value, negated) {
    this.key = key;
    this.value = value;
    this.negated = negated;
  }
  static create(key, value, negated = null) {
    if (typeof value === "boolean") {
      if (value) {
        return ContextKeyNotExpr.create(key, negated);
      }
      return ContextKeyDefinedExpr.create(key, negated);
    }
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === "boolean") {
      const falseValue = constantValue ? "true" : "false";
      return value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return new _ContextKeyNotEqualsExpr(key, value, negated);
  }
  type = 5 /* NotEquals */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }
  substituteConstants() {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === "boolean") {
      const falseValue = constantValue ? "true" : "false";
      return this.value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return this;
  }
  evaluate(context) {
    return context.getValue(this.key) != this.value;
  }
  serialize() {
    return `${this.key} != '${this.value}'`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapNotEquals(this.key, this.value);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
};
var ContextKeyNotExpr = class _ContextKeyNotExpr {
  constructor(key, negated) {
    this.key = key;
    this.negated = negated;
  }
  static create(key, negated = null) {
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === "boolean") {
      return constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return new _ContextKeyNotExpr(key, negated);
  }
  type = 3 /* Not */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp1(this.key, other.key);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key;
    }
    return false;
  }
  substituteConstants() {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === "boolean") {
      return constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return this;
  }
  evaluate(context) {
    return !context.getValue(this.key);
  }
  serialize() {
    return `!${this.key}`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapNot(this.key);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyDefinedExpr.create(this.key, this);
    }
    return this.negated;
  }
};
function withFloatOrStr(value, callback) {
  if (typeof value === "string") {
    const n = parseFloat(value);
    if (!isNaN(n)) {
      value = n;
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    return callback(value);
  }
  return ContextKeyFalseExpr.INSTANCE;
}
var ContextKeyGreaterExpr = class _ContextKeyGreaterExpr {
  constructor(key, value, negated) {
    this.key = key;
    this.value = value;
    this.negated = negated;
  }
  static create(key, _value, negated = null) {
    return withFloatOrStr(_value, (value) => new _ContextKeyGreaterExpr(key, value, negated));
  }
  type = 12 /* Greater */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    if (typeof this.value === "string") {
      return false;
    }
    return parseFloat(context.getValue(this.key)) > this.value;
  }
  serialize() {
    return `${this.key} > ${this.value}`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapGreater(this.key, this.value);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeySmallerEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
};
var ContextKeyGreaterEqualsExpr = class _ContextKeyGreaterEqualsExpr {
  constructor(key, value, negated) {
    this.key = key;
    this.value = value;
    this.negated = negated;
  }
  static create(key, _value, negated = null) {
    return withFloatOrStr(_value, (value) => new _ContextKeyGreaterEqualsExpr(key, value, negated));
  }
  type = 13 /* GreaterEquals */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    if (typeof this.value === "string") {
      return false;
    }
    return parseFloat(context.getValue(this.key)) >= this.value;
  }
  serialize() {
    return `${this.key} >= ${this.value}`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapGreaterEquals(this.key, this.value);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeySmallerExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
};
var ContextKeySmallerExpr = class _ContextKeySmallerExpr {
  constructor(key, value, negated) {
    this.key = key;
    this.value = value;
    this.negated = negated;
  }
  static create(key, _value, negated = null) {
    return withFloatOrStr(_value, (value) => new _ContextKeySmallerExpr(key, value, negated));
  }
  type = 14 /* Smaller */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    if (typeof this.value === "string") {
      return false;
    }
    return parseFloat(context.getValue(this.key)) < this.value;
  }
  serialize() {
    return `${this.key} < ${this.value}`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapSmaller(this.key, this.value);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyGreaterEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
};
var ContextKeySmallerEqualsExpr = class _ContextKeySmallerEqualsExpr {
  constructor(key, value, negated) {
    this.key = key;
    this.value = value;
    this.negated = negated;
  }
  static create(key, _value, negated = null) {
    return withFloatOrStr(_value, (value) => new _ContextKeySmallerEqualsExpr(key, value, negated));
  }
  type = 15 /* SmallerEquals */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }
  equals(other) {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    if (typeof this.value === "string") {
      return false;
    }
    return parseFloat(context.getValue(this.key)) <= this.value;
  }
  serialize() {
    return `${this.key} <= ${this.value}`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapSmallerEquals(this.key, this.value);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyGreaterExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
};
var ContextKeyRegexExpr = class _ContextKeyRegexExpr {
  constructor(key, regexp) {
    this.key = key;
    this.regexp = regexp;
  }
  static create(key, regexp) {
    return new _ContextKeyRegexExpr(key, regexp);
  }
  type = 7 /* Regex */;
  negated = null;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    if (this.key < other.key) {
      return -1;
    }
    if (this.key > other.key) {
      return 1;
    }
    const thisSource = this.regexp ? this.regexp.source : "";
    const otherSource = other.regexp ? other.regexp.source : "";
    if (thisSource < otherSource) {
      return -1;
    }
    if (thisSource > otherSource) {
      return 1;
    }
    return 0;
  }
  equals(other) {
    if (other.type === this.type) {
      const thisSource = this.regexp ? this.regexp.source : "";
      const otherSource = other.regexp ? other.regexp.source : "";
      return this.key === other.key && thisSource === otherSource;
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    const value = context.getValue(this.key);
    return this.regexp ? this.regexp.test(value) : false;
  }
  serialize() {
    const value = this.regexp ? `/${this.regexp.source}/${this.regexp.flags}` : "/invalid/";
    return `${this.key} =~ ${value}`;
  }
  keys() {
    return [this.key];
  }
  map(mapFnc) {
    return mapFnc.mapRegex(this.key, this.regexp);
  }
  negate() {
    if (!this.negated) {
      this.negated = ContextKeyNotRegexExpr.create(this);
    }
    return this.negated;
  }
};
var ContextKeyNotRegexExpr = class _ContextKeyNotRegexExpr {
  constructor(_actual) {
    this._actual = _actual;
  }
  static create(actual) {
    return new _ContextKeyNotRegexExpr(actual);
  }
  type = 8 /* NotRegex */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return this._actual.cmp(other._actual);
  }
  equals(other) {
    if (other.type === this.type) {
      return this._actual.equals(other._actual);
    }
    return false;
  }
  substituteConstants() {
    return this;
  }
  evaluate(context) {
    return !this._actual.evaluate(context);
  }
  serialize() {
    return `!(${this._actual.serialize()})`;
  }
  keys() {
    return this._actual.keys();
  }
  map(mapFnc) {
    return new _ContextKeyNotRegexExpr(this._actual.map(mapFnc));
  }
  negate() {
    return this._actual;
  }
};
function eliminateConstantsInArray(arr) {
  let newArr = null;
  for (let i = 0, len = arr.length; i < len; i++) {
    const newExpr = arr[i].substituteConstants();
    if (arr[i] !== newExpr) {
      if (newArr === null) {
        newArr = [];
        for (let j = 0; j < i; j++) {
          newArr[j] = arr[j];
        }
      }
    }
    if (newArr !== null) {
      newArr[i] = newExpr;
    }
  }
  if (newArr === null) {
    return arr;
  }
  return newArr;
}
var ContextKeyAndExpr = class _ContextKeyAndExpr {
  constructor(expr, negated) {
    this.expr = expr;
    this.negated = negated;
  }
  static create(_expr, negated, extraRedundantCheck) {
    return _ContextKeyAndExpr._normalizeArr(_expr, negated, extraRedundantCheck);
  }
  type = 6 /* And */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    if (this.expr.length < other.expr.length) {
      return -1;
    }
    if (this.expr.length > other.expr.length) {
      return 1;
    }
    for (let i = 0, len = this.expr.length; i < len; i++) {
      const r = cmp(this.expr[i], other.expr[i]);
      if (r !== 0) {
        return r;
      }
    }
    return 0;
  }
  equals(other) {
    if (other.type === this.type) {
      if (this.expr.length !== other.expr.length) {
        return false;
      }
      for (let i = 0, len = this.expr.length; i < len; i++) {
        if (!this.expr[i].equals(other.expr[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  substituteConstants() {
    const exprArr = eliminateConstantsInArray(this.expr);
    if (exprArr === this.expr) {
      return this;
    }
    return _ContextKeyAndExpr.create(exprArr, this.negated, false);
  }
  evaluate(context) {
    for (let i = 0, len = this.expr.length; i < len; i++) {
      if (!this.expr[i].evaluate(context)) {
        return false;
      }
    }
    return true;
  }
  static _normalizeArr(arr, negated, extraRedundantCheck) {
    const expr = [];
    let hasTrue = false;
    for (const e of arr) {
      if (!e) {
        continue;
      }
      if (e.type === 1 /* True */) {
        hasTrue = true;
        continue;
      }
      if (e.type === 0 /* False */) {
        return ContextKeyFalseExpr.INSTANCE;
      }
      if (e.type === 6 /* And */) {
        expr.push(...e.expr);
        continue;
      }
      expr.push(e);
    }
    if (expr.length === 0 && hasTrue) {
      return ContextKeyTrueExpr.INSTANCE;
    }
    if (expr.length === 0) {
      return void 0;
    }
    if (expr.length === 1) {
      return expr[0];
    }
    expr.sort(cmp);
    for (let i = 1; i < expr.length; i++) {
      if (expr[i - 1].equals(expr[i])) {
        expr.splice(i, 1);
        i--;
      }
    }
    if (expr.length === 1) {
      return expr[0];
    }
    while (expr.length > 1) {
      const lastElement = expr[expr.length - 1];
      if (lastElement.type !== 9 /* Or */) {
        break;
      }
      expr.pop();
      const secondToLastElement = expr.pop();
      const isFinished = expr.length === 0;
      const resultElement = ContextKeyOrExpr.create(
        lastElement.expr.map((el) => _ContextKeyAndExpr.create([el, secondToLastElement], null, extraRedundantCheck)),
        null,
        isFinished
      );
      if (resultElement) {
        expr.push(resultElement);
        expr.sort(cmp);
      }
    }
    if (expr.length === 1) {
      return expr[0];
    }
    if (extraRedundantCheck) {
      for (let i = 0; i < expr.length; i++) {
        for (let j = i + 1; j < expr.length; j++) {
          if (expr[i].negate().equals(expr[j])) {
            return ContextKeyFalseExpr.INSTANCE;
          }
        }
      }
      if (expr.length === 1) {
        return expr[0];
      }
    }
    return new _ContextKeyAndExpr(expr, negated);
  }
  serialize() {
    return this.expr.map((e) => e.serialize()).join(" && ");
  }
  keys() {
    const result = [];
    for (const expr of this.expr) {
      result.push(...expr.keys());
    }
    return result;
  }
  map(mapFnc) {
    return new _ContextKeyAndExpr(this.expr.map((expr) => expr.map(mapFnc)), null);
  }
  negate() {
    if (!this.negated) {
      const result = [];
      for (const expr of this.expr) {
        result.push(expr.negate());
      }
      this.negated = ContextKeyOrExpr.create(result, this, true);
    }
    return this.negated;
  }
};
var ContextKeyOrExpr = class _ContextKeyOrExpr {
  constructor(expr, negated) {
    this.expr = expr;
    this.negated = negated;
  }
  static create(_expr, negated, extraRedundantCheck) {
    return _ContextKeyOrExpr._normalizeArr(_expr, negated, extraRedundantCheck);
  }
  type = 9 /* Or */;
  cmp(other) {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    if (this.expr.length < other.expr.length) {
      return -1;
    }
    if (this.expr.length > other.expr.length) {
      return 1;
    }
    for (let i = 0, len = this.expr.length; i < len; i++) {
      const r = cmp(this.expr[i], other.expr[i]);
      if (r !== 0) {
        return r;
      }
    }
    return 0;
  }
  equals(other) {
    if (other.type === this.type) {
      if (this.expr.length !== other.expr.length) {
        return false;
      }
      for (let i = 0, len = this.expr.length; i < len; i++) {
        if (!this.expr[i].equals(other.expr[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  substituteConstants() {
    const exprArr = eliminateConstantsInArray(this.expr);
    if (exprArr === this.expr) {
      return this;
    }
    return _ContextKeyOrExpr.create(exprArr, this.negated, false);
  }
  evaluate(context) {
    for (let i = 0, len = this.expr.length; i < len; i++) {
      if (this.expr[i].evaluate(context)) {
        return true;
      }
    }
    return false;
  }
  static _normalizeArr(arr, negated, extraRedundantCheck) {
    let expr = [];
    let hasFalse = false;
    if (arr) {
      for (let i = 0, len = arr.length; i < len; i++) {
        const e = arr[i];
        if (!e) {
          continue;
        }
        if (e.type === 0 /* False */) {
          hasFalse = true;
          continue;
        }
        if (e.type === 1 /* True */) {
          return ContextKeyTrueExpr.INSTANCE;
        }
        if (e.type === 9 /* Or */) {
          expr = expr.concat(e.expr);
          continue;
        }
        expr.push(e);
      }
      if (expr.length === 0 && hasFalse) {
        return ContextKeyFalseExpr.INSTANCE;
      }
      expr.sort(cmp);
    }
    if (expr.length === 0) {
      return void 0;
    }
    if (expr.length === 1) {
      return expr[0];
    }
    for (let i = 1; i < expr.length; i++) {
      if (expr[i - 1].equals(expr[i])) {
        expr.splice(i, 1);
        i--;
      }
    }
    if (expr.length === 1) {
      return expr[0];
    }
    if (extraRedundantCheck) {
      for (let i = 0; i < expr.length; i++) {
        for (let j = i + 1; j < expr.length; j++) {
          if (expr[i].negate().equals(expr[j])) {
            return ContextKeyTrueExpr.INSTANCE;
          }
        }
      }
      if (expr.length === 1) {
        return expr[0];
      }
    }
    return new _ContextKeyOrExpr(expr, negated);
  }
  serialize() {
    return this.expr.map((e) => e.serialize()).join(" || ");
  }
  keys() {
    const result = [];
    for (const expr of this.expr) {
      result.push(...expr.keys());
    }
    return result;
  }
  map(mapFnc) {
    return new _ContextKeyOrExpr(this.expr.map((expr) => expr.map(mapFnc)), null);
  }
  negate() {
    if (!this.negated) {
      const result = [];
      for (const expr of this.expr) {
        result.push(expr.negate());
      }
      while (result.length > 1) {
        const LEFT = result.shift();
        const RIGHT = result.shift();
        const all = [];
        for (const left of getTerminals(LEFT)) {
          for (const right of getTerminals(RIGHT)) {
            all.push(ContextKeyAndExpr.create([left, right], null, false));
          }
        }
        result.unshift(_ContextKeyOrExpr.create(all, null, false));
      }
      this.negated = _ContextKeyOrExpr.create(result, this, true);
    }
    return this.negated;
  }
};
var IContextKeyService = createDecorator("contextKeyService");
function cmp1(key1, key2) {
  if (key1 < key2) {
    return -1;
  }
  if (key1 > key2) {
    return 1;
  }
  return 0;
}
function cmp2(key1, value1, key2, value2) {
  if (key1 < key2) {
    return -1;
  }
  if (key1 > key2) {
    return 1;
  }
  if (value1 < value2) {
    return -1;
  }
  if (value1 > value2) {
    return 1;
  }
  return 0;
}
function implies(p, q) {
  if (p.type === 0 /* False */ || q.type === 1 /* True */) {
    return true;
  }
  if (p.type === 9 /* Or */) {
    if (q.type === 9 /* Or */) {
      return allElementsIncluded(p.expr, q.expr);
    }
    return false;
  }
  if (q.type === 9 /* Or */) {
    for (const element of q.expr) {
      if (implies(p, element)) {
        return true;
      }
    }
    return false;
  }
  if (p.type === 6 /* And */) {
    if (q.type === 6 /* And */) {
      return allElementsIncluded(q.expr, p.expr);
    }
    for (const element of p.expr) {
      if (implies(element, q)) {
        return true;
      }
    }
    return false;
  }
  return p.equals(q);
}
function allElementsIncluded(p, q) {
  let pIndex = 0;
  let qIndex = 0;
  while (pIndex < p.length && qIndex < q.length) {
    const cmp3 = p[pIndex].cmp(q[qIndex]);
    if (cmp3 < 0) {
      return false;
    } else if (cmp3 === 0) {
      pIndex++;
      qIndex++;
    } else {
      qIndex++;
    }
  }
  return pIndex === p.length;
}
function getTerminals(node) {
  if (node.type === 9 /* Or */) {
    return node.expr;
  }
  return [node];
}

// oracle/upstream/src/vs/platform/keybinding/common/keybindingResolver.ts
var ResultKind = /* @__PURE__ */ ((ResultKind2) => {
  ResultKind2[ResultKind2["NoMatchingKb"] = 0] = "NoMatchingKb";
  ResultKind2[ResultKind2["MoreChordsNeeded"] = 1] = "MoreChordsNeeded";
  ResultKind2[ResultKind2["KbFound"] = 2] = "KbFound";
  return ResultKind2;
})(ResultKind || {});
var NoMatchingKb = { kind: 0 /* NoMatchingKb */ };
var MoreChordsNeeded = { kind: 1 /* MoreChordsNeeded */ };
function KbFound(commandId, commandArgs, isBubble) {
  return { kind: 2 /* KbFound */, commandId, commandArgs, isBubble };
}
var KeybindingResolver = class _KeybindingResolver {
  _log;
  _defaultKeybindings;
  _keybindings;
  _defaultBoundCommands;
  _map;
  _lookupMap;
  constructor(defaultKeybindings, overrides, log) {
    this._log = log;
    this._defaultKeybindings = defaultKeybindings;
    this._defaultBoundCommands = /* @__PURE__ */ new Map();
    for (const defaultKeybinding of defaultKeybindings) {
      const command = defaultKeybinding.command;
      if (command && command.charAt(0) !== "-") {
        this._defaultBoundCommands.set(command, true);
      }
    }
    this._map = /* @__PURE__ */ new Map();
    this._lookupMap = /* @__PURE__ */ new Map();
    this._keybindings = _KeybindingResolver.handleRemovals([].concat(defaultKeybindings).concat(overrides));
    for (let i = 0, len = this._keybindings.length; i < len; i++) {
      const k = this._keybindings[i];
      if (k.chords.length === 0) {
        continue;
      }
      const when = k.when?.substituteConstants();
      if (when && when.type === 0 /* False */) {
        continue;
      }
      this._addKeyPress(k.chords[0], k);
    }
  }
  static _isTargetedForRemoval(defaultKb, keypress, when) {
    if (keypress) {
      for (let i = 0; i < keypress.length; i++) {
        if (keypress[i] !== defaultKb.chords[i]) {
          return false;
        }
      }
    }
    if (when && when.type !== 1 /* True */) {
      if (!defaultKb.when) {
        return false;
      }
      if (!expressionsAreEqualWithConstantSubstitution(when, defaultKb.when)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Looks for rules containing "-commandId" and removes them.
   */
  static handleRemovals(rules) {
    const removals = /* @__PURE__ */ new Map();
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];
      if (rule.command && rule.command.charAt(0) === "-") {
        const command = rule.command.substring(1);
        if (!removals.has(command)) {
          removals.set(command, [rule]);
        } else {
          removals.get(command).push(rule);
        }
      }
    }
    if (removals.size === 0) {
      return rules;
    }
    const result = [];
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];
      if (!rule.command || rule.command.length === 0) {
        result.push(rule);
        continue;
      }
      if (rule.command.charAt(0) === "-") {
        continue;
      }
      const commandRemovals = removals.get(rule.command);
      if (!commandRemovals || !rule.isDefault) {
        result.push(rule);
        continue;
      }
      let isRemoved = false;
      for (const commandRemoval of commandRemovals) {
        const when = commandRemoval.when;
        if (this._isTargetedForRemoval(rule, commandRemoval.chords, when)) {
          isRemoved = true;
          break;
        }
      }
      if (!isRemoved) {
        result.push(rule);
        continue;
      }
    }
    return result;
  }
  _addKeyPress(keypress, item) {
    const conflicts = this._map.get(keypress);
    if (typeof conflicts === "undefined") {
      this._map.set(keypress, [item]);
      this._addToLookupMap(item);
      return;
    }
    for (let i = conflicts.length - 1; i >= 0; i--) {
      const conflict = conflicts[i];
      if (conflict.command === item.command) {
        continue;
      }
      let isShorterKbPrefix = true;
      for (let i2 = 1; i2 < conflict.chords.length && i2 < item.chords.length; i2++) {
        if (conflict.chords[i2] !== item.chords[i2]) {
          isShorterKbPrefix = false;
          break;
        }
      }
      if (!isShorterKbPrefix) {
        continue;
      }
      if (_KeybindingResolver.whenIsEntirelyIncluded(conflict.when, item.when)) {
        this._removeFromLookupMap(conflict);
      }
    }
    conflicts.push(item);
    this._addToLookupMap(item);
  }
  _addToLookupMap(item) {
    if (!item.command) {
      return;
    }
    let arr = this._lookupMap.get(item.command);
    if (typeof arr === "undefined") {
      arr = [item];
      this._lookupMap.set(item.command, arr);
    } else {
      arr.push(item);
    }
  }
  _removeFromLookupMap(item) {
    if (!item.command) {
      return;
    }
    const arr = this._lookupMap.get(item.command);
    if (typeof arr === "undefined") {
      return;
    }
    for (let i = 0, len = arr.length; i < len; i++) {
      if (arr[i] === item) {
        arr.splice(i, 1);
        return;
      }
    }
  }
  /**
   * Returns true if it is provable `a` implies `b`.
   */
  static whenIsEntirelyIncluded(a, b) {
    if (!b || b.type === 1 /* True */) {
      return true;
    }
    if (!a || a.type === 1 /* True */) {
      return false;
    }
    return implies(a, b);
  }
  getDefaultBoundCommands() {
    return this._defaultBoundCommands;
  }
  getDefaultKeybindings() {
    return this._defaultKeybindings;
  }
  getKeybindings() {
    return this._keybindings;
  }
  lookupKeybindings(commandId) {
    const items = this._lookupMap.get(commandId);
    if (typeof items === "undefined" || items.length === 0) {
      return [];
    }
    const result = [];
    let resultLen = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      result[resultLen++] = items[i];
    }
    return result;
  }
  lookupPrimaryKeybinding(commandId, context, enforceContextCheck = false) {
    const items = this._lookupMap.get(commandId);
    if (typeof items === "undefined" || items.length === 0) {
      return null;
    }
    if (items.length === 1 && !enforceContextCheck) {
      return items[0];
    }
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (context.contextMatchesRules(item.when)) {
        return item;
      }
    }
    if (enforceContextCheck) {
      return null;
    }
    return items[items.length - 1];
  }
  /**
   * Looks up a keybinding trigged as a result of pressing a sequence of chords - `[...currentChords, keypress]`
   *
   * Example: resolving 3 chords pressed sequentially - `cmd+k cmd+p cmd+i`:
   * 	`currentChords = [ 'cmd+k' , 'cmd+p' ]` and `keypress = `cmd+i` - last pressed chord
   */
  resolve(context, currentChords, keypress) {
    const pressedChords = [...currentChords, keypress];
    this._log(`| Resolving ${pressedChords}`);
    const kbCandidates = this._map.get(pressedChords[0]);
    if (kbCandidates === void 0) {
      this._log(`\\ No keybinding entries.`);
      return NoMatchingKb;
    }
    let lookupMap = null;
    if (pressedChords.length < 2) {
      lookupMap = kbCandidates;
    } else {
      lookupMap = [];
      for (let i = 0, len = kbCandidates.length; i < len; i++) {
        const candidate = kbCandidates[i];
        if (pressedChords.length > candidate.chords.length) {
          continue;
        }
        let prefixMatches = true;
        for (let i2 = 1; i2 < pressedChords.length; i2++) {
          if (candidate.chords[i2] !== pressedChords[i2]) {
            prefixMatches = false;
            break;
          }
        }
        if (prefixMatches) {
          lookupMap.push(candidate);
        }
      }
    }
    const result = this._findCommand(context, lookupMap);
    if (!result) {
      this._log(`\\ From ${lookupMap.length} keybinding entries, no when clauses matched the context.`);
      return NoMatchingKb;
    }
    if (pressedChords.length < result.chords.length) {
      this._log(`\\ From ${lookupMap.length} keybinding entries, awaiting ${result.chords.length - pressedChords.length} more chord(s), when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
      return MoreChordsNeeded;
    }
    this._log(`\\ From ${lookupMap.length} keybinding entries, matched ${result.command}, when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
    return KbFound(result.command, result.commandArgs, result.bubble);
  }
  _findCommand(context, matches) {
    for (let i = matches.length - 1; i >= 0; i--) {
      const k = matches[i];
      if (!_KeybindingResolver._contextMatchesRules(context, k.when)) {
        continue;
      }
      return k;
    }
    return null;
  }
  static _contextMatchesRules(context, rules) {
    if (!rules) {
      return true;
    }
    return rules.evaluate(context);
  }
};
function printWhenExplanation(when) {
  if (!when) {
    return `no when condition`;
  }
  return `${when.serialize()}`;
}
function printSourceExplanation(kb) {
  return kb.extensionId ? kb.isBuiltinExtension ? `built-in extension ${kb.extensionId}` : `user extension ${kb.extensionId}` : kb.isDefault ? `built-in` : `user`;
}

// oracle/upstream/src/vs/platform/keybinding/common/resolvedKeybindingItem.ts
var ResolvedKeybindingItem = class {
  _resolvedKeybindingItemBrand = void 0;
  resolvedKeybinding;
  chords;
  bubble;
  command;
  commandArgs;
  when;
  isDefault;
  extensionId;
  isBuiltinExtension;
  constructor(resolvedKeybinding, command, commandArgs, when, isDefault, extensionId, isBuiltinExtension) {
    this.resolvedKeybinding = resolvedKeybinding;
    this.chords = resolvedKeybinding ? toEmptyArrayIfContainsNull(resolvedKeybinding.getDispatchChords()) : [];
    if (resolvedKeybinding && this.chords.length === 0) {
      this.chords = toEmptyArrayIfContainsNull(resolvedKeybinding.getSingleModifierDispatchChords());
    }
    this.bubble = command ? command.charCodeAt(0) === 94 /* Caret */ : false;
    this.command = this.bubble ? command.substr(1) : command;
    this.commandArgs = commandArgs;
    this.when = when;
    this.isDefault = isDefault;
    this.extensionId = extensionId;
    this.isBuiltinExtension = isBuiltinExtension;
  }
};
function toEmptyArrayIfContainsNull(arr) {
  const result = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    const element = arr[i];
    if (!element) {
      return [];
    }
    result.push(element);
  }
  return result;
}

// oracle/upstream/src/vs/base/common/keyCodes.ts
var KeyCodeStrMap = class {
  _keyCodeToStr;
  _strToKeyCode;
  constructor() {
    this._keyCodeToStr = [];
    this._strToKeyCode = /* @__PURE__ */ Object.create(null);
  }
  define(keyCode, str) {
    this._keyCodeToStr[keyCode] = str;
    this._strToKeyCode[str.toLowerCase()] = keyCode;
  }
  keyCodeToStr(keyCode) {
    return this._keyCodeToStr[keyCode];
  }
  strToKeyCode(str) {
    return this._strToKeyCode[str.toLowerCase()] || 0 /* Unknown */;
  }
};
var uiMap = new KeyCodeStrMap();
var userSettingsUSMap = new KeyCodeStrMap();
var userSettingsGeneralMap = new KeyCodeStrMap();
var EVENT_KEY_CODE_MAP = new Array(230);
var NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
var scanCodeIntToStr = [];
var scanCodeStrToInt = /* @__PURE__ */ Object.create(null);
var scanCodeLowerCaseStrToInt = /* @__PURE__ */ Object.create(null);
var ScanCodeUtils = {
  lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0 /* None */,
  toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0 /* None */,
  toString: (scanCode) => scanCodeIntToStr[scanCode] || "None"
};
var IMMUTABLE_CODE_TO_KEY_CODE = [];
var IMMUTABLE_KEY_CODE_TO_CODE = [];
for (let i = 0; i <= 193 /* MAX_VALUE */; i++) {
  IMMUTABLE_CODE_TO_KEY_CODE[i] = -1 /* DependsOnKbLayout */;
}
for (let i = 0; i <= 132 /* MAX_VALUE */; i++) {
  IMMUTABLE_KEY_CODE_TO_CODE[i] = -1 /* DependsOnKbLayout */;
}
(function() {
  const empty = "";
  const mappings = [
    // immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel
    [1, 0 /* None */, "None", 0 /* Unknown */, "unknown", 0, "VK_UNKNOWN", empty, empty],
    [1, 1 /* Hyper */, "Hyper", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 2 /* Super */, "Super", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 3 /* Fn */, "Fn", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 4 /* FnLock */, "FnLock", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 5 /* Suspend */, "Suspend", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 6 /* Resume */, "Resume", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 7 /* Turbo */, "Turbo", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 8 /* Sleep */, "Sleep", 0 /* Unknown */, empty, 0, "VK_SLEEP", empty, empty],
    [1, 9 /* WakeUp */, "WakeUp", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [0, 10 /* KeyA */, "KeyA", 31 /* KeyA */, "A", 65, "VK_A", empty, empty],
    [0, 11 /* KeyB */, "KeyB", 32 /* KeyB */, "B", 66, "VK_B", empty, empty],
    [0, 12 /* KeyC */, "KeyC", 33 /* KeyC */, "C", 67, "VK_C", empty, empty],
    [0, 13 /* KeyD */, "KeyD", 34 /* KeyD */, "D", 68, "VK_D", empty, empty],
    [0, 14 /* KeyE */, "KeyE", 35 /* KeyE */, "E", 69, "VK_E", empty, empty],
    [0, 15 /* KeyF */, "KeyF", 36 /* KeyF */, "F", 70, "VK_F", empty, empty],
    [0, 16 /* KeyG */, "KeyG", 37 /* KeyG */, "G", 71, "VK_G", empty, empty],
    [0, 17 /* KeyH */, "KeyH", 38 /* KeyH */, "H", 72, "VK_H", empty, empty],
    [0, 18 /* KeyI */, "KeyI", 39 /* KeyI */, "I", 73, "VK_I", empty, empty],
    [0, 19 /* KeyJ */, "KeyJ", 40 /* KeyJ */, "J", 74, "VK_J", empty, empty],
    [0, 20 /* KeyK */, "KeyK", 41 /* KeyK */, "K", 75, "VK_K", empty, empty],
    [0, 21 /* KeyL */, "KeyL", 42 /* KeyL */, "L", 76, "VK_L", empty, empty],
    [0, 22 /* KeyM */, "KeyM", 43 /* KeyM */, "M", 77, "VK_M", empty, empty],
    [0, 23 /* KeyN */, "KeyN", 44 /* KeyN */, "N", 78, "VK_N", empty, empty],
    [0, 24 /* KeyO */, "KeyO", 45 /* KeyO */, "O", 79, "VK_O", empty, empty],
    [0, 25 /* KeyP */, "KeyP", 46 /* KeyP */, "P", 80, "VK_P", empty, empty],
    [0, 26 /* KeyQ */, "KeyQ", 47 /* KeyQ */, "Q", 81, "VK_Q", empty, empty],
    [0, 27 /* KeyR */, "KeyR", 48 /* KeyR */, "R", 82, "VK_R", empty, empty],
    [0, 28 /* KeyS */, "KeyS", 49 /* KeyS */, "S", 83, "VK_S", empty, empty],
    [0, 29 /* KeyT */, "KeyT", 50 /* KeyT */, "T", 84, "VK_T", empty, empty],
    [0, 30 /* KeyU */, "KeyU", 51 /* KeyU */, "U", 85, "VK_U", empty, empty],
    [0, 31 /* KeyV */, "KeyV", 52 /* KeyV */, "V", 86, "VK_V", empty, empty],
    [0, 32 /* KeyW */, "KeyW", 53 /* KeyW */, "W", 87, "VK_W", empty, empty],
    [0, 33 /* KeyX */, "KeyX", 54 /* KeyX */, "X", 88, "VK_X", empty, empty],
    [0, 34 /* KeyY */, "KeyY", 55 /* KeyY */, "Y", 89, "VK_Y", empty, empty],
    [0, 35 /* KeyZ */, "KeyZ", 56 /* KeyZ */, "Z", 90, "VK_Z", empty, empty],
    [0, 36 /* Digit1 */, "Digit1", 22 /* Digit1 */, "1", 49, "VK_1", empty, empty],
    [0, 37 /* Digit2 */, "Digit2", 23 /* Digit2 */, "2", 50, "VK_2", empty, empty],
    [0, 38 /* Digit3 */, "Digit3", 24 /* Digit3 */, "3", 51, "VK_3", empty, empty],
    [0, 39 /* Digit4 */, "Digit4", 25 /* Digit4 */, "4", 52, "VK_4", empty, empty],
    [0, 40 /* Digit5 */, "Digit5", 26 /* Digit5 */, "5", 53, "VK_5", empty, empty],
    [0, 41 /* Digit6 */, "Digit6", 27 /* Digit6 */, "6", 54, "VK_6", empty, empty],
    [0, 42 /* Digit7 */, "Digit7", 28 /* Digit7 */, "7", 55, "VK_7", empty, empty],
    [0, 43 /* Digit8 */, "Digit8", 29 /* Digit8 */, "8", 56, "VK_8", empty, empty],
    [0, 44 /* Digit9 */, "Digit9", 30 /* Digit9 */, "9", 57, "VK_9", empty, empty],
    [0, 45 /* Digit0 */, "Digit0", 21 /* Digit0 */, "0", 48, "VK_0", empty, empty],
    [1, 46 /* Enter */, "Enter", 3 /* Enter */, "Enter", 13, "VK_RETURN", empty, empty],
    [1, 47 /* Escape */, "Escape", 9 /* Escape */, "Escape", 27, "VK_ESCAPE", empty, empty],
    [1, 48 /* Backspace */, "Backspace", 1 /* Backspace */, "Backspace", 8, "VK_BACK", empty, empty],
    [1, 49 /* Tab */, "Tab", 2 /* Tab */, "Tab", 9, "VK_TAB", empty, empty],
    [1, 50 /* Space */, "Space", 10 /* Space */, "Space", 32, "VK_SPACE", empty, empty],
    [0, 51 /* Minus */, "Minus", 88 /* Minus */, "-", 189, "VK_OEM_MINUS", "-", "OEM_MINUS"],
    [0, 52 /* Equal */, "Equal", 86 /* Equal */, "=", 187, "VK_OEM_PLUS", "=", "OEM_PLUS"],
    [0, 53 /* BracketLeft */, "BracketLeft", 92 /* BracketLeft */, "[", 219, "VK_OEM_4", "[", "OEM_4"],
    [0, 54 /* BracketRight */, "BracketRight", 94 /* BracketRight */, "]", 221, "VK_OEM_6", "]", "OEM_6"],
    [0, 55 /* Backslash */, "Backslash", 93 /* Backslash */, "\\", 220, "VK_OEM_5", "\\", "OEM_5"],
    [0, 56 /* IntlHash */, "IntlHash", 0 /* Unknown */, empty, 0, empty, empty, empty],
    // has been dropped from the w3c spec
    [0, 57 /* Semicolon */, "Semicolon", 85 /* Semicolon */, ";", 186, "VK_OEM_1", ";", "OEM_1"],
    [0, 58 /* Quote */, "Quote", 95 /* Quote */, "'", 222, "VK_OEM_7", "'", "OEM_7"],
    [0, 59 /* Backquote */, "Backquote", 91 /* Backquote */, "`", 192, "VK_OEM_3", "`", "OEM_3"],
    [0, 60 /* Comma */, "Comma", 87 /* Comma */, ",", 188, "VK_OEM_COMMA", ",", "OEM_COMMA"],
    [0, 61 /* Period */, "Period", 89 /* Period */, ".", 190, "VK_OEM_PERIOD", ".", "OEM_PERIOD"],
    [0, 62 /* Slash */, "Slash", 90 /* Slash */, "/", 191, "VK_OEM_2", "/", "OEM_2"],
    [1, 63 /* CapsLock */, "CapsLock", 8 /* CapsLock */, "CapsLock", 20, "VK_CAPITAL", empty, empty],
    [1, 64 /* F1 */, "F1", 59 /* F1 */, "F1", 112, "VK_F1", empty, empty],
    [1, 65 /* F2 */, "F2", 60 /* F2 */, "F2", 113, "VK_F2", empty, empty],
    [1, 66 /* F3 */, "F3", 61 /* F3 */, "F3", 114, "VK_F3", empty, empty],
    [1, 67 /* F4 */, "F4", 62 /* F4 */, "F4", 115, "VK_F4", empty, empty],
    [1, 68 /* F5 */, "F5", 63 /* F5 */, "F5", 116, "VK_F5", empty, empty],
    [1, 69 /* F6 */, "F6", 64 /* F6 */, "F6", 117, "VK_F6", empty, empty],
    [1, 70 /* F7 */, "F7", 65 /* F7 */, "F7", 118, "VK_F7", empty, empty],
    [1, 71 /* F8 */, "F8", 66 /* F8 */, "F8", 119, "VK_F8", empty, empty],
    [1, 72 /* F9 */, "F9", 67 /* F9 */, "F9", 120, "VK_F9", empty, empty],
    [1, 73 /* F10 */, "F10", 68 /* F10 */, "F10", 121, "VK_F10", empty, empty],
    [1, 74 /* F11 */, "F11", 69 /* F11 */, "F11", 122, "VK_F11", empty, empty],
    [1, 75 /* F12 */, "F12", 70 /* F12 */, "F12", 123, "VK_F12", empty, empty],
    [1, 76 /* PrintScreen */, "PrintScreen", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 77 /* ScrollLock */, "ScrollLock", 84 /* ScrollLock */, "ScrollLock", 145, "VK_SCROLL", empty, empty],
    [1, 78 /* Pause */, "Pause", 7 /* PauseBreak */, "PauseBreak", 19, "VK_PAUSE", empty, empty],
    [1, 79 /* Insert */, "Insert", 19 /* Insert */, "Insert", 45, "VK_INSERT", empty, empty],
    [1, 80 /* Home */, "Home", 14 /* Home */, "Home", 36, "VK_HOME", empty, empty],
    [1, 81 /* PageUp */, "PageUp", 11 /* PageUp */, "PageUp", 33, "VK_PRIOR", empty, empty],
    [1, 82 /* Delete */, "Delete", 20 /* Delete */, "Delete", 46, "VK_DELETE", empty, empty],
    [1, 83 /* End */, "End", 13 /* End */, "End", 35, "VK_END", empty, empty],
    [1, 84 /* PageDown */, "PageDown", 12 /* PageDown */, "PageDown", 34, "VK_NEXT", empty, empty],
    [1, 85 /* ArrowRight */, "ArrowRight", 17 /* RightArrow */, "RightArrow", 39, "VK_RIGHT", "Right", empty],
    [1, 86 /* ArrowLeft */, "ArrowLeft", 15 /* LeftArrow */, "LeftArrow", 37, "VK_LEFT", "Left", empty],
    [1, 87 /* ArrowDown */, "ArrowDown", 18 /* DownArrow */, "DownArrow", 40, "VK_DOWN", "Down", empty],
    [1, 88 /* ArrowUp */, "ArrowUp", 16 /* UpArrow */, "UpArrow", 38, "VK_UP", "Up", empty],
    [1, 89 /* NumLock */, "NumLock", 83 /* NumLock */, "NumLock", 144, "VK_NUMLOCK", empty, empty],
    [1, 90 /* NumpadDivide */, "NumpadDivide", 113 /* NumpadDivide */, "NumPad_Divide", 111, "VK_DIVIDE", empty, empty],
    [1, 91 /* NumpadMultiply */, "NumpadMultiply", 108 /* NumpadMultiply */, "NumPad_Multiply", 106, "VK_MULTIPLY", empty, empty],
    [1, 92 /* NumpadSubtract */, "NumpadSubtract", 111 /* NumpadSubtract */, "NumPad_Subtract", 109, "VK_SUBTRACT", empty, empty],
    [1, 93 /* NumpadAdd */, "NumpadAdd", 109 /* NumpadAdd */, "NumPad_Add", 107, "VK_ADD", empty, empty],
    [1, 94 /* NumpadEnter */, "NumpadEnter", 3 /* Enter */, empty, 0, empty, empty, empty],
    [1, 95 /* Numpad1 */, "Numpad1", 99 /* Numpad1 */, "NumPad1", 97, "VK_NUMPAD1", empty, empty],
    [1, 96 /* Numpad2 */, "Numpad2", 100 /* Numpad2 */, "NumPad2", 98, "VK_NUMPAD2", empty, empty],
    [1, 97 /* Numpad3 */, "Numpad3", 101 /* Numpad3 */, "NumPad3", 99, "VK_NUMPAD3", empty, empty],
    [1, 98 /* Numpad4 */, "Numpad4", 102 /* Numpad4 */, "NumPad4", 100, "VK_NUMPAD4", empty, empty],
    [1, 99 /* Numpad5 */, "Numpad5", 103 /* Numpad5 */, "NumPad5", 101, "VK_NUMPAD5", empty, empty],
    [1, 100 /* Numpad6 */, "Numpad6", 104 /* Numpad6 */, "NumPad6", 102, "VK_NUMPAD6", empty, empty],
    [1, 101 /* Numpad7 */, "Numpad7", 105 /* Numpad7 */, "NumPad7", 103, "VK_NUMPAD7", empty, empty],
    [1, 102 /* Numpad8 */, "Numpad8", 106 /* Numpad8 */, "NumPad8", 104, "VK_NUMPAD8", empty, empty],
    [1, 103 /* Numpad9 */, "Numpad9", 107 /* Numpad9 */, "NumPad9", 105, "VK_NUMPAD9", empty, empty],
    [1, 104 /* Numpad0 */, "Numpad0", 98 /* Numpad0 */, "NumPad0", 96, "VK_NUMPAD0", empty, empty],
    [1, 105 /* NumpadDecimal */, "NumpadDecimal", 112 /* NumpadDecimal */, "NumPad_Decimal", 110, "VK_DECIMAL", empty, empty],
    [0, 106 /* IntlBackslash */, "IntlBackslash", 97 /* IntlBackslash */, "OEM_102", 226, "VK_OEM_102", empty, empty],
    [1, 107 /* ContextMenu */, "ContextMenu", 58 /* ContextMenu */, "ContextMenu", 93, empty, empty, empty],
    [1, 108 /* Power */, "Power", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 109 /* NumpadEqual */, "NumpadEqual", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 110 /* F13 */, "F13", 71 /* F13 */, "F13", 124, "VK_F13", empty, empty],
    [1, 111 /* F14 */, "F14", 72 /* F14 */, "F14", 125, "VK_F14", empty, empty],
    [1, 112 /* F15 */, "F15", 73 /* F15 */, "F15", 126, "VK_F15", empty, empty],
    [1, 113 /* F16 */, "F16", 74 /* F16 */, "F16", 127, "VK_F16", empty, empty],
    [1, 114 /* F17 */, "F17", 75 /* F17 */, "F17", 128, "VK_F17", empty, empty],
    [1, 115 /* F18 */, "F18", 76 /* F18 */, "F18", 129, "VK_F18", empty, empty],
    [1, 116 /* F19 */, "F19", 77 /* F19 */, "F19", 130, "VK_F19", empty, empty],
    [1, 117 /* F20 */, "F20", 78 /* F20 */, "F20", 131, "VK_F20", empty, empty],
    [1, 118 /* F21 */, "F21", 79 /* F21 */, "F21", 132, "VK_F21", empty, empty],
    [1, 119 /* F22 */, "F22", 80 /* F22 */, "F22", 133, "VK_F22", empty, empty],
    [1, 120 /* F23 */, "F23", 81 /* F23 */, "F23", 134, "VK_F23", empty, empty],
    [1, 121 /* F24 */, "F24", 82 /* F24 */, "F24", 135, "VK_F24", empty, empty],
    [1, 122 /* Open */, "Open", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 123 /* Help */, "Help", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 124 /* Select */, "Select", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 125 /* Again */, "Again", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 126 /* Undo */, "Undo", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 127 /* Cut */, "Cut", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 128 /* Copy */, "Copy", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 129 /* Paste */, "Paste", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 130 /* Find */, "Find", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 131 /* AudioVolumeMute */, "AudioVolumeMute", 117 /* AudioVolumeMute */, "AudioVolumeMute", 173, "VK_VOLUME_MUTE", empty, empty],
    [1, 132 /* AudioVolumeUp */, "AudioVolumeUp", 118 /* AudioVolumeUp */, "AudioVolumeUp", 175, "VK_VOLUME_UP", empty, empty],
    [1, 133 /* AudioVolumeDown */, "AudioVolumeDown", 119 /* AudioVolumeDown */, "AudioVolumeDown", 174, "VK_VOLUME_DOWN", empty, empty],
    [1, 134 /* NumpadComma */, "NumpadComma", 110 /* NUMPAD_SEPARATOR */, "NumPad_Separator", 108, "VK_SEPARATOR", empty, empty],
    [0, 135 /* IntlRo */, "IntlRo", 115 /* ABNT_C1 */, "ABNT_C1", 193, "VK_ABNT_C1", empty, empty],
    [1, 136 /* KanaMode */, "KanaMode", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [0, 137 /* IntlYen */, "IntlYen", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 138 /* Convert */, "Convert", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 139 /* NonConvert */, "NonConvert", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 140 /* Lang1 */, "Lang1", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 141 /* Lang2 */, "Lang2", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 142 /* Lang3 */, "Lang3", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 143 /* Lang4 */, "Lang4", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 144 /* Lang5 */, "Lang5", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 145 /* Abort */, "Abort", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 146 /* Props */, "Props", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 147 /* NumpadParenLeft */, "NumpadParenLeft", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 148 /* NumpadParenRight */, "NumpadParenRight", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 149 /* NumpadBackspace */, "NumpadBackspace", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 150 /* NumpadMemoryStore */, "NumpadMemoryStore", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 151 /* NumpadMemoryRecall */, "NumpadMemoryRecall", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 152 /* NumpadMemoryClear */, "NumpadMemoryClear", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 153 /* NumpadMemoryAdd */, "NumpadMemoryAdd", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 154 /* NumpadMemorySubtract */, "NumpadMemorySubtract", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 155 /* NumpadClear */, "NumpadClear", 131 /* Clear */, "Clear", 12, "VK_CLEAR", empty, empty],
    [1, 156 /* NumpadClearEntry */, "NumpadClearEntry", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 0 /* None */, empty, 5 /* Ctrl */, "Ctrl", 17, "VK_CONTROL", empty, empty],
    [1, 0 /* None */, empty, 4 /* Shift */, "Shift", 16, "VK_SHIFT", empty, empty],
    [1, 0 /* None */, empty, 6 /* Alt */, "Alt", 18, "VK_MENU", empty, empty],
    [1, 0 /* None */, empty, 57 /* Meta */, "Meta", 91, "VK_COMMAND", empty, empty],
    [1, 157 /* ControlLeft */, "ControlLeft", 5 /* Ctrl */, empty, 0, "VK_LCONTROL", empty, empty],
    [1, 158 /* ShiftLeft */, "ShiftLeft", 4 /* Shift */, empty, 0, "VK_LSHIFT", empty, empty],
    [1, 159 /* AltLeft */, "AltLeft", 6 /* Alt */, empty, 0, "VK_LMENU", empty, empty],
    [1, 160 /* MetaLeft */, "MetaLeft", 57 /* Meta */, empty, 0, "VK_LWIN", empty, empty],
    [1, 161 /* ControlRight */, "ControlRight", 5 /* Ctrl */, empty, 0, "VK_RCONTROL", empty, empty],
    [1, 162 /* ShiftRight */, "ShiftRight", 4 /* Shift */, empty, 0, "VK_RSHIFT", empty, empty],
    [1, 163 /* AltRight */, "AltRight", 6 /* Alt */, empty, 0, "VK_RMENU", empty, empty],
    [1, 164 /* MetaRight */, "MetaRight", 57 /* Meta */, empty, 0, "VK_RWIN", empty, empty],
    [1, 165 /* BrightnessUp */, "BrightnessUp", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 166 /* BrightnessDown */, "BrightnessDown", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 167 /* MediaPlay */, "MediaPlay", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 168 /* MediaRecord */, "MediaRecord", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 169 /* MediaFastForward */, "MediaFastForward", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 170 /* MediaRewind */, "MediaRewind", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 171 /* MediaTrackNext */, "MediaTrackNext", 124 /* MediaTrackNext */, "MediaTrackNext", 176, "VK_MEDIA_NEXT_TRACK", empty, empty],
    [1, 172 /* MediaTrackPrevious */, "MediaTrackPrevious", 125 /* MediaTrackPrevious */, "MediaTrackPrevious", 177, "VK_MEDIA_PREV_TRACK", empty, empty],
    [1, 173 /* MediaStop */, "MediaStop", 126 /* MediaStop */, "MediaStop", 178, "VK_MEDIA_STOP", empty, empty],
    [1, 174 /* Eject */, "Eject", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 175 /* MediaPlayPause */, "MediaPlayPause", 127 /* MediaPlayPause */, "MediaPlayPause", 179, "VK_MEDIA_PLAY_PAUSE", empty, empty],
    [1, 176 /* MediaSelect */, "MediaSelect", 128 /* LaunchMediaPlayer */, "LaunchMediaPlayer", 181, "VK_MEDIA_LAUNCH_MEDIA_SELECT", empty, empty],
    [1, 177 /* LaunchMail */, "LaunchMail", 129 /* LaunchMail */, "LaunchMail", 180, "VK_MEDIA_LAUNCH_MAIL", empty, empty],
    [1, 178 /* LaunchApp2 */, "LaunchApp2", 130 /* LaunchApp2 */, "LaunchApp2", 183, "VK_MEDIA_LAUNCH_APP2", empty, empty],
    [1, 179 /* LaunchApp1 */, "LaunchApp1", 0 /* Unknown */, empty, 0, "VK_MEDIA_LAUNCH_APP1", empty, empty],
    [1, 180 /* SelectTask */, "SelectTask", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 181 /* LaunchScreenSaver */, "LaunchScreenSaver", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 182 /* BrowserSearch */, "BrowserSearch", 120 /* BrowserSearch */, "BrowserSearch", 170, "VK_BROWSER_SEARCH", empty, empty],
    [1, 183 /* BrowserHome */, "BrowserHome", 121 /* BrowserHome */, "BrowserHome", 172, "VK_BROWSER_HOME", empty, empty],
    [1, 184 /* BrowserBack */, "BrowserBack", 122 /* BrowserBack */, "BrowserBack", 166, "VK_BROWSER_BACK", empty, empty],
    [1, 185 /* BrowserForward */, "BrowserForward", 123 /* BrowserForward */, "BrowserForward", 167, "VK_BROWSER_FORWARD", empty, empty],
    [1, 186 /* BrowserStop */, "BrowserStop", 0 /* Unknown */, empty, 0, "VK_BROWSER_STOP", empty, empty],
    [1, 187 /* BrowserRefresh */, "BrowserRefresh", 0 /* Unknown */, empty, 0, "VK_BROWSER_REFRESH", empty, empty],
    [1, 188 /* BrowserFavorites */, "BrowserFavorites", 0 /* Unknown */, empty, 0, "VK_BROWSER_FAVORITES", empty, empty],
    [1, 189 /* ZoomToggle */, "ZoomToggle", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 190 /* MailReply */, "MailReply", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 191 /* MailForward */, "MailForward", 0 /* Unknown */, empty, 0, empty, empty, empty],
    [1, 192 /* MailSend */, "MailSend", 0 /* Unknown */, empty, 0, empty, empty, empty],
    // See https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
    // If an Input Method Editor is processing key input and the event is keydown, return 229.
    [1, 0 /* None */, empty, 114 /* KEY_IN_COMPOSITION */, "KeyInComposition", 229, empty, empty, empty],
    [1, 0 /* None */, empty, 116 /* ABNT_C2 */, "ABNT_C2", 194, "VK_ABNT_C2", empty, empty],
    [1, 0 /* None */, empty, 96 /* OEM_8 */, "OEM_8", 223, "VK_OEM_8", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_KANA", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_HANGUL", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_JUNJA", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_FINAL", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_HANJA", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_KANJI", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_CONVERT", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_NONCONVERT", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_ACCEPT", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_MODECHANGE", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_SELECT", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_PRINT", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_EXECUTE", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_SNAPSHOT", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_HELP", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_APPS", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_PROCESSKEY", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_PACKET", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_DBE_SBCSCHAR", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_DBE_DBCSCHAR", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_ATTN", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_CRSEL", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_EXSEL", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_EREOF", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_PLAY", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_ZOOM", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_NONAME", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_PA1", empty, empty],
    [1, 0 /* None */, empty, 0 /* Unknown */, empty, 0, "VK_OEM_CLEAR", empty, empty]
  ];
  const seenKeyCode = [];
  const seenScanCode = [];
  for (const mapping of mappings) {
    const [immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel] = mapping;
    if (!seenScanCode[scanCode]) {
      seenScanCode[scanCode] = true;
      scanCodeIntToStr[scanCode] = scanCodeStr;
      scanCodeStrToInt[scanCodeStr] = scanCode;
      scanCodeLowerCaseStrToInt[scanCodeStr.toLowerCase()] = scanCode;
      if (immutable) {
        IMMUTABLE_CODE_TO_KEY_CODE[scanCode] = keyCode;
        if (keyCode !== 0 /* Unknown */ && keyCode !== 3 /* Enter */ && keyCode !== 5 /* Ctrl */ && keyCode !== 4 /* Shift */ && keyCode !== 6 /* Alt */ && keyCode !== 57 /* Meta */) {
          IMMUTABLE_KEY_CODE_TO_CODE[keyCode] = scanCode;
        }
      }
    }
    if (!seenKeyCode[keyCode]) {
      seenKeyCode[keyCode] = true;
      if (!keyCodeStr) {
        throw new Error(`String representation missing for key code ${keyCode} around scan code ${scanCodeStr}`);
      }
      uiMap.define(keyCode, keyCodeStr);
      userSettingsUSMap.define(keyCode, usUserSettingsLabel || keyCodeStr);
      userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel || usUserSettingsLabel || keyCodeStr);
    }
    if (eventKeyCode) {
      EVENT_KEY_CODE_MAP[eventKeyCode] = keyCode;
    }
    if (vkey) {
      NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[vkey] = keyCode;
    }
  }
  IMMUTABLE_KEY_CODE_TO_CODE[3 /* Enter */] = 46 /* Enter */;
})();
var KeyCodeUtils;
((KeyCodeUtils2) => {
  function toString(keyCode) {
    return uiMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toString = toString;
  function fromString(key) {
    return uiMap.strToKeyCode(key);
  }
  KeyCodeUtils2.fromString = fromString;
  function toUserSettingsUS(keyCode) {
    return userSettingsUSMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toUserSettingsUS = toUserSettingsUS;
  function toUserSettingsGeneral(keyCode) {
    return userSettingsGeneralMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toUserSettingsGeneral = toUserSettingsGeneral;
  function fromUserSettings(key) {
    return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
  }
  KeyCodeUtils2.fromUserSettings = fromUserSettings;
  function toElectronAccelerator(keyCode) {
    if (keyCode >= 98 /* Numpad0 */ && keyCode <= 113 /* NumpadDivide */) {
      return null;
    }
    switch (keyCode) {
      case 16 /* UpArrow */:
        return "Up";
      case 18 /* DownArrow */:
        return "Down";
      case 15 /* LeftArrow */:
        return "Left";
      case 17 /* RightArrow */:
        return "Right";
    }
    return uiMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toElectronAccelerator = toElectronAccelerator;
})(KeyCodeUtils || (KeyCodeUtils = {}));

// oracle/upstream/src/vs/base/common/keybindings.ts
var KeyCodeChord = class _KeyCodeChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyCode = keyCode;
  }
  equals(other) {
    return other instanceof _KeyCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.keyCode === other.keyCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
  }
  isModifierKey() {
    return this.keyCode === 0 /* Unknown */ || this.keyCode === 5 /* Ctrl */ || this.keyCode === 57 /* Meta */ || this.keyCode === 6 /* Alt */ || this.keyCode === 4 /* Shift */;
  }
  toKeybinding() {
    return new Keybinding([this]);
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === 5 /* Ctrl */ || this.shiftKey && this.keyCode === 4 /* Shift */ || this.altKey && this.keyCode === 6 /* Alt */ || this.metaKey && this.keyCode === 57 /* Meta */;
  }
};
var ScanCodeChord = class _ScanCodeChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.scanCode = scanCode;
  }
  equals(other) {
    return other instanceof _ScanCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.scanCode === other.scanCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && (this.scanCode === 157 /* ControlLeft */ || this.scanCode === 161 /* ControlRight */) || this.shiftKey && (this.scanCode === 158 /* ShiftLeft */ || this.scanCode === 162 /* ShiftRight */) || this.altKey && (this.scanCode === 159 /* AltLeft */ || this.scanCode === 163 /* AltRight */) || this.metaKey && (this.scanCode === 160 /* MetaLeft */ || this.scanCode === 164 /* MetaRight */);
  }
};
var Keybinding = class {
  chords;
  constructor(chords) {
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this.chords = chords;
  }
  getHashCode() {
    let result = "";
    for (let i = 0, len = this.chords.length; i < len; i++) {
      if (i !== 0) {
        result += ";";
      }
      result += this.chords[i].getHashCode();
    }
    return result;
  }
  equals(other) {
    if (other === null) {
      return false;
    }
    if (this.chords.length !== other.chords.length) {
      return false;
    }
    for (let i = 0; i < this.chords.length; i++) {
      if (!this.chords[i].equals(other.chords[i])) {
        return false;
      }
    }
    return true;
  }
};
var ResolvedChord = class {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyLabel = keyLabel;
    this.keyAriaLabel = keyAriaLabel;
  }
};
var ResolvedKeybinding = class {
};

// oracle/upstream/src/vs/base/common/keybindingParser.ts
var KeybindingParser = class {
  static _readModifiers(input) {
    input = input.toLowerCase().trim();
    let ctrl = false;
    let shift = false;
    let alt = false;
    let meta = false;
    let matchedModifier;
    do {
      matchedModifier = false;
      if (/^ctrl(\+|\-)/.test(input)) {
        ctrl = true;
        input = input.substr("ctrl-".length);
        matchedModifier = true;
      }
      if (/^shift(\+|\-)/.test(input)) {
        shift = true;
        input = input.substr("shift-".length);
        matchedModifier = true;
      }
      if (/^alt(\+|\-)/.test(input)) {
        alt = true;
        input = input.substr("alt-".length);
        matchedModifier = true;
      }
      if (/^meta(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr("meta-".length);
        matchedModifier = true;
      }
      if (/^win(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr("win-".length);
        matchedModifier = true;
      }
      if (/^cmd(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr("cmd-".length);
        matchedModifier = true;
      }
    } while (matchedModifier);
    let key;
    const firstSpaceIdx = input.indexOf(" ");
    if (firstSpaceIdx > 0) {
      key = input.substring(0, firstSpaceIdx);
      input = input.substring(firstSpaceIdx);
    } else {
      key = input;
      input = "";
    }
    return {
      remains: input,
      ctrl,
      shift,
      alt,
      meta,
      key
    };
  }
  static parseChord(input) {
    const mods = this._readModifiers(input);
    const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
    if (scanCodeMatch) {
      const strScanCode = scanCodeMatch[1];
      const scanCode = ScanCodeUtils.lowerCaseToEnum(strScanCode);
      return [new ScanCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
    }
    const keyCode = KeyCodeUtils.fromUserSettings(mods.key);
    return [new KeyCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
  }
  static parseKeybinding(input) {
    if (!input) {
      return null;
    }
    const chords = [];
    let chord;
    while (input.length > 0) {
      [chord, input] = this.parseChord(input);
      chords.push(chord);
    }
    return chords.length > 0 ? new Keybinding(chords) : null;
  }
};

// oracle/upstream/src/vs/base/common/keybindingLabels.ts
var ModifierLabelProvider = class {
  modifierLabels;
  constructor(mac, windows, linux = windows) {
    this.modifierLabels = [null];
    this.modifierLabels[2 /* Macintosh */] = mac;
    this.modifierLabels[1 /* Windows */] = windows;
    this.modifierLabels[3 /* Linux */] = linux;
  }
  toLabel(OS, chords, keyLabelProvider) {
    if (chords.length === 0) {
      return null;
    }
    const result = [];
    for (let i = 0, len = chords.length; i < len; i++) {
      const chord = chords[i];
      const keyLabel = keyLabelProvider(chord);
      if (keyLabel === null) {
        return null;
      }
      result[i] = _simpleAsString(chord, keyLabel, this.modifierLabels[OS]);
    }
    return result.join(" ");
  }
};
var UILabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "\u2303",
    shiftKey: "\u21E7",
    altKey: "\u2325",
    metaKey: "\u2318",
    separator: ""
  },
  {
    ctrlKey: localize({ key: "ctrlKey", comment: ["This is the short form for the Control key on the keyboard"] }, "Ctrl"),
    shiftKey: localize({ key: "shiftKey", comment: ["This is the short form for the Shift key on the keyboard"] }, "Shift"),
    altKey: localize({ key: "altKey", comment: ["This is the short form for the Alt key on the keyboard"] }, "Alt"),
    metaKey: localize({ key: "windowsKey", comment: ["This is the short form for the Windows key on the keyboard"] }, "Windows"),
    separator: "+"
  },
  {
    ctrlKey: localize({ key: "ctrlKey", comment: ["This is the short form for the Control key on the keyboard"] }, "Ctrl"),
    shiftKey: localize({ key: "shiftKey", comment: ["This is the short form for the Shift key on the keyboard"] }, "Shift"),
    altKey: localize({ key: "altKey", comment: ["This is the short form for the Alt key on the keyboard"] }, "Alt"),
    metaKey: localize({ key: "superKey", comment: ["This is the short form for the Super key on the keyboard"] }, "Super"),
    separator: "+"
  }
);
var AriaLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: localize({ key: "ctrlKey.long", comment: ["This is the long form for the Control key on the keyboard"] }, "Control"),
    shiftKey: localize({ key: "shiftKey.long", comment: ["This is the long form for the Shift key on the keyboard"] }, "Shift"),
    altKey: localize({ key: "optKey.long", comment: ["This is the long form for the Alt/Option key on the keyboard"] }, "Option"),
    metaKey: localize({ key: "cmdKey.long", comment: ["This is the long form for the Command key on the keyboard"] }, "Command"),
    separator: "+"
  },
  {
    ctrlKey: localize({ key: "ctrlKey.long", comment: ["This is the long form for the Control key on the keyboard"] }, "Control"),
    shiftKey: localize({ key: "shiftKey.long", comment: ["This is the long form for the Shift key on the keyboard"] }, "Shift"),
    altKey: localize({ key: "altKey.long", comment: ["This is the long form for the Alt key on the keyboard"] }, "Alt"),
    metaKey: localize({ key: "windowsKey.long", comment: ["This is the long form for the Windows key on the keyboard"] }, "Windows"),
    separator: "+"
  },
  {
    ctrlKey: localize({ key: "ctrlKey.long", comment: ["This is the long form for the Control key on the keyboard"] }, "Control"),
    shiftKey: localize({ key: "shiftKey.long", comment: ["This is the long form for the Shift key on the keyboard"] }, "Shift"),
    altKey: localize({ key: "altKey.long", comment: ["This is the long form for the Alt key on the keyboard"] }, "Alt"),
    metaKey: localize({ key: "superKey.long", comment: ["This is the long form for the Super key on the keyboard"] }, "Super"),
    separator: "+"
  }
);
var ElectronAcceleratorLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Cmd",
    separator: "+"
  },
  {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Super",
    separator: "+"
  }
);
var UserSettingsLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "cmd",
    separator: "+"
  },
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "win",
    separator: "+"
  },
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "meta",
    separator: "+"
  }
);
function _simpleAsString(modifiers, key, labels) {
  if (key === null) {
    return "";
  }
  const result = [];
  if (modifiers.ctrlKey) {
    result.push(labels.ctrlKey);
  }
  if (modifiers.shiftKey) {
    result.push(labels.shiftKey);
  }
  if (modifiers.altKey) {
    result.push(labels.altKey);
  }
  if (modifiers.metaKey) {
    result.push(labels.metaKey);
  }
  if (key !== "") {
    result.push(key);
  }
  return result.join(labels.separator);
}

// oracle/upstream/src/vs/platform/keybinding/common/baseResolvedKeybinding.ts
var BaseResolvedKeybinding = class extends ResolvedKeybinding {
  _os;
  _chords;
  constructor(os, chords) {
    super();
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this._os = os;
    this._chords = chords;
  }
  getLabel() {
    return UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getLabel(keybinding));
  }
  getAriaLabel() {
    return AriaLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getAriaLabel(keybinding));
  }
  getElectronAccelerator() {
    if (this._chords.length > 1) {
      return null;
    }
    if (this._chords[0].isDuplicateModifierCase()) {
      return null;
    }
    return ElectronAcceleratorLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getElectronAccelerator(keybinding));
  }
  getUserSettingsLabel() {
    return UserSettingsLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUserSettingsLabel(keybinding));
  }
  isWYSIWYG() {
    return this._chords.every((keybinding) => this._isWYSIWYG(keybinding));
  }
  hasMultipleChords() {
    return this._chords.length > 1;
  }
  getChords() {
    return this._chords.map((keybinding) => this._getChord(keybinding));
  }
  _getChord(keybinding) {
    return new ResolvedChord(
      keybinding.ctrlKey,
      keybinding.shiftKey,
      keybinding.altKey,
      keybinding.metaKey,
      this._getLabel(keybinding),
      this._getAriaLabel(keybinding)
    );
  }
  getDispatchChords() {
    return this._chords.map((keybinding) => this._getChordDispatch(keybinding));
  }
  getSingleModifierDispatchChords() {
    return this._chords.map((keybinding) => this._getSingleModifierChordDispatch(keybinding));
  }
};

// oracle/upstream/src/vs/platform/keybinding/common/usLayoutResolvedKeybinding.ts
var USLayoutResolvedKeybinding = class _USLayoutResolvedKeybinding extends BaseResolvedKeybinding {
  constructor(chords, os) {
    super(os, chords);
  }
  _keyCodeToUILabel(keyCode) {
    if (this._os === 2 /* Macintosh */) {
      switch (keyCode) {
        case 15 /* LeftArrow */:
          return "\u2190";
        case 16 /* UpArrow */:
          return "\u2191";
        case 17 /* RightArrow */:
          return "\u2192";
        case 18 /* DownArrow */:
          return "\u2193";
      }
    }
    return KeyCodeUtils.toString(keyCode);
  }
  _getLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._keyCodeToUILabel(chord.keyCode);
  }
  _getAriaLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return KeyCodeUtils.toString(chord.keyCode);
  }
  _getElectronAccelerator(chord) {
    return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
  }
  _getUserSettingsLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    const result = KeyCodeUtils.toUserSettingsUS(chord.keyCode);
    return result ? result.toLowerCase() : result;
  }
  _isWYSIWYG() {
    return true;
  }
  _getChordDispatch(chord) {
    return _USLayoutResolvedKeybinding.getDispatchStr(chord);
  }
  static getDispatchStr(chord) {
    if (chord.isModifierKey()) {
      return null;
    }
    let result = "";
    if (chord.ctrlKey) {
      result += "ctrl+";
    }
    if (chord.shiftKey) {
      result += "shift+";
    }
    if (chord.altKey) {
      result += "alt+";
    }
    if (chord.metaKey) {
      result += "meta+";
    }
    result += KeyCodeUtils.toString(chord.keyCode);
    return result;
  }
  _getSingleModifierChordDispatch(keybinding) {
    if (keybinding.keyCode === 5 /* Ctrl */ && !keybinding.shiftKey && !keybinding.altKey && !keybinding.metaKey) {
      return "ctrl";
    }
    if (keybinding.keyCode === 4 /* Shift */ && !keybinding.ctrlKey && !keybinding.altKey && !keybinding.metaKey) {
      return "shift";
    }
    if (keybinding.keyCode === 6 /* Alt */ && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.metaKey) {
      return "alt";
    }
    if (keybinding.keyCode === 57 /* Meta */ && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.altKey) {
      return "meta";
    }
    return null;
  }
  /**
   * *NOTE*: Check return value for `KeyCode.Unknown`.
   */
  static _scanCodeToKeyCode(scanCode) {
    const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
    if (immutableKeyCode !== -1 /* DependsOnKbLayout */) {
      return immutableKeyCode;
    }
    switch (scanCode) {
      case 10 /* KeyA */:
        return 31 /* KeyA */;
      case 11 /* KeyB */:
        return 32 /* KeyB */;
      case 12 /* KeyC */:
        return 33 /* KeyC */;
      case 13 /* KeyD */:
        return 34 /* KeyD */;
      case 14 /* KeyE */:
        return 35 /* KeyE */;
      case 15 /* KeyF */:
        return 36 /* KeyF */;
      case 16 /* KeyG */:
        return 37 /* KeyG */;
      case 17 /* KeyH */:
        return 38 /* KeyH */;
      case 18 /* KeyI */:
        return 39 /* KeyI */;
      case 19 /* KeyJ */:
        return 40 /* KeyJ */;
      case 20 /* KeyK */:
        return 41 /* KeyK */;
      case 21 /* KeyL */:
        return 42 /* KeyL */;
      case 22 /* KeyM */:
        return 43 /* KeyM */;
      case 23 /* KeyN */:
        return 44 /* KeyN */;
      case 24 /* KeyO */:
        return 45 /* KeyO */;
      case 25 /* KeyP */:
        return 46 /* KeyP */;
      case 26 /* KeyQ */:
        return 47 /* KeyQ */;
      case 27 /* KeyR */:
        return 48 /* KeyR */;
      case 28 /* KeyS */:
        return 49 /* KeyS */;
      case 29 /* KeyT */:
        return 50 /* KeyT */;
      case 30 /* KeyU */:
        return 51 /* KeyU */;
      case 31 /* KeyV */:
        return 52 /* KeyV */;
      case 32 /* KeyW */:
        return 53 /* KeyW */;
      case 33 /* KeyX */:
        return 54 /* KeyX */;
      case 34 /* KeyY */:
        return 55 /* KeyY */;
      case 35 /* KeyZ */:
        return 56 /* KeyZ */;
      case 36 /* Digit1 */:
        return 22 /* Digit1 */;
      case 37 /* Digit2 */:
        return 23 /* Digit2 */;
      case 38 /* Digit3 */:
        return 24 /* Digit3 */;
      case 39 /* Digit4 */:
        return 25 /* Digit4 */;
      case 40 /* Digit5 */:
        return 26 /* Digit5 */;
      case 41 /* Digit6 */:
        return 27 /* Digit6 */;
      case 42 /* Digit7 */:
        return 28 /* Digit7 */;
      case 43 /* Digit8 */:
        return 29 /* Digit8 */;
      case 44 /* Digit9 */:
        return 30 /* Digit9 */;
      case 45 /* Digit0 */:
        return 21 /* Digit0 */;
      case 51 /* Minus */:
        return 88 /* Minus */;
      case 52 /* Equal */:
        return 86 /* Equal */;
      case 53 /* BracketLeft */:
        return 92 /* BracketLeft */;
      case 54 /* BracketRight */:
        return 94 /* BracketRight */;
      case 55 /* Backslash */:
        return 93 /* Backslash */;
      case 56 /* IntlHash */:
        return 0 /* Unknown */;
      // missing
      case 57 /* Semicolon */:
        return 85 /* Semicolon */;
      case 58 /* Quote */:
        return 95 /* Quote */;
      case 59 /* Backquote */:
        return 91 /* Backquote */;
      case 60 /* Comma */:
        return 87 /* Comma */;
      case 61 /* Period */:
        return 89 /* Period */;
      case 62 /* Slash */:
        return 90 /* Slash */;
      case 106 /* IntlBackslash */:
        return 97 /* IntlBackslash */;
    }
    return 0 /* Unknown */;
  }
  static _toKeyCodeChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord instanceof KeyCodeChord) {
      return chord;
    }
    const keyCode = this._scanCodeToKeyCode(chord.scanCode);
    if (keyCode === 0 /* Unknown */) {
      return null;
    }
    return new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
  }
  static resolveKeybinding(keybinding, os) {
    const chords = toEmptyArrayIfContainsNull(keybinding.chords.map((chord) => this._toKeyCodeChord(chord)));
    if (chords.length > 0) {
      return [new _USLayoutResolvedKeybinding(chords, os)];
    }
    return [];
  }
};
export {
  ContextKeyExpr,
  KeybindingParser,
  KeybindingResolver,
  OperatingSystem,
  Parser,
  ResolvedKeybindingItem,
  ResultKind,
  USLayoutResolvedKeybinding
};
