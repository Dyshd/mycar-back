import { Schema } from 'mongoose';
import {
	PropertyLocation,
	PropertyRentPeriod,
	PropertyStatus,
	PropertyTransmission,
	PropertyType,
} from '../libs/enums/property.enum';

const PropertySchema = new Schema(
	{
		propertyType: { type: String, enum: Object.values(PropertyType), required: true },

		propertyStatus: { type: String, enum: Object.values(PropertyStatus), default: PropertyStatus.ACTIVE },

		propertyLocation: { type: String, enum: Object.values(PropertyLocation), required: true },

		propertyAddress: { type: String, required: true },

		propertyTitle: { type: String, required: true },

		propertyPrice: { type: Number, required: true },

		// Mileage (km)
		propertySquare: { type: Number, required: true },

		// Seats
		propertyBeds: { type: Number, required: true },

		// ❗ Eski field (gear count / sizda qanday bo‘lsa shunday)
		propertyRooms: { type: Number, required: true },

		// ✅ NEW: transmission enum
		propertyTransmission: {
			type: String,
			enum: Object.values(PropertyTransmission),
			default: null,
		},

		propertyViews: { type: Number, default: 0 },
		propertyLikes: { type: Number, default: 0 },
		propertyComments: { type: Number, default: 0 },
		propertyRank: { type: Number, default: 0 },

		propertyImages: { type: [String], required: true },

		propertyDesc: { type: String },

		propertyBarter: { type: Boolean, default: false },
		propertyRent: { type: Boolean, default: false },

		propertyRentPeriod: {
			type: String,
			enum: Object.values(PropertyRentPeriod),
			default: PropertyRentPeriod.MONTHLY,
		},

		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },

		soldAt: { type: Date },
		deletedAt: { type: Date },
		constructedAt: { type: Date },
	},
	{ timestamps: true, collection: 'properties' },
);

PropertySchema.index(
	{ propertyType: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 },
	{ unique: true },
);

// ✅ filtering tez ishlashi uchun
PropertySchema.index({ propertyTransmission: 1 });

export default PropertySchema;
