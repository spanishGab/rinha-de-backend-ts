import { DateTime } from "luxon";

const LOG_LEVEL = Number(process.env.LOG_LEVEL ?? 0)

export function debug(message: string) {
    if (LOG_LEVEL > 0) {
        return;
    }
    console.debug(`${DateTime.now()} [DEBUG]: ${message}`)
}

export function info(message: string) {
    if (LOG_LEVEL > 1) {
        return;
    }
    console.info(`${DateTime.now()} [INFO]: ${message}`)
}

export function warn(message: string) {
    if (LOG_LEVEL > 2) {
        return;
    }
    console.warn(`${DateTime.now()} [WARN]: ${message}`)
}

export function error(message: string) {
    if (LOG_LEVEL > 3) {
        return;
    }
    console.error(`${DateTime.now()} [ERROR]: ${message}`)
}
