import { Booking, Service, Worker, ServiceCategory, Table, CalendarType } from "@prisma/client";

// Serialized version of Service with Decimal converted to number
export type SerializedService = Omit<Service, 'price' | 'minimumValue' | 'pricePerDay'> & {
    price: number | null;
    minimumValue: number | null;
    pricePerDay: number | null;
    categories?: SerializedServiceCategory[];
    workers?: { worker: Worker }[];
};

export type SerializedServiceCategory = Omit<ServiceCategory, 'price'> & {
    price: number | null;
};

// Booking with serialized service and relations
export type BookingWithService = Booking & {
    service: SerializedService;
    worker?: Worker | null;
    category?: SerializedServiceCategory | null;
    table?: Table | null;
};

