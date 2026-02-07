import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	PETROL = 'PETROL',
	DIESEL = 'DIESEL',
	GAS = 'GAS',
	HYBRID = 'HYBRID',
	ELECTRIC = 'ELECTRIC',
}

registerEnumType(PropertyType, {
	name: 'FuelType',
});

export enum PropertyStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyLocation {
	TASHKENT = 'TASHKENT',
	TASHKENT_REGION = 'TASHKENT_REGION',
	SAMARKAND = 'SAMARKAND',
	BUKHARA = 'BUKHARA',
	ANDIJAN = 'ANDIJAN',
	NAMANGAN = 'NAMANGAN',
	FERGANA = 'FERGANA',
	KHOREZM = 'KHOREZM',
	NAVOI = 'NAVOI',
	KASHKADARYA = 'KASHKADARYA',
	SURKHANDARYA = 'SURKHANDARYA',
	SYRDARYA = 'SYRDARYA',
	JIZZAKH = 'JIZZAKH',
	KARAKALPAKSTAN = 'KARAKALPAKSTAN',
}

registerEnumType(PropertyLocation, {
	name: 'CarLocation',
});

