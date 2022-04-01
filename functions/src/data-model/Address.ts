export class Address {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    
    constructor(street: string, city: string, province: string, postalCode: string, country: string) {
        this.street = street;
        this.city = city;
        this.province = province;
        this.postalCode = postalCode;
        this.country = country;
    }
}