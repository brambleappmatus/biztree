import { Booking, Service } from "@prisma/client";

// Serialized version of Service with Decimal converted to number
export type SerializedService = Omit<Service, 'price'> & {
    price: number | null
};

// Booking with serialized service
export type BookingWithService = Booking & {
    service: SerializedService
};
