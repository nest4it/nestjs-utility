"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailEvent = void 0;
const crypto_1 = require("crypto");
const createEmailEvent = (data) => ({
    data: {
        ...data,
        opts: {
            retries: 0,
        }
    },
    createdAt: new Date(),
    eventId: (0, crypto_1.randomUUID)(),
});
exports.createEmailEvent = createEmailEvent;
//# sourceMappingURL=index.js.map