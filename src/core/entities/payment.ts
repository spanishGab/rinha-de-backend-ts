import { UUID } from 'crypto';
import { Big } from 'big.js';
import { DateTime } from 'luxon';

export type Payment = {
    correlationId: UUID;
    amount: Big;
    requestedAt?: DateTime;
}
