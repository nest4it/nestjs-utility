import type { EmailEventStart } from "../models/events";
export declare const createEmailEvent: (data: Omit<EmailEventStart, "opts">) => {
    data: {
        opts: {
            retries: number;
        };
        error: null;
        data: import("@sendgrid/mail").MailDataRequired;
        createdAt: Date;
        eventId: string;
    };
    createdAt: Date;
    eventId: `${string}-${string}-${string}-${string}-${string}`;
};
