import { Schema } from "mongoose";
import {
	PropertyLocation,
	PropertyRentPeriod,
	PropertyStatus,
	PropertyType,
} from "../libs/enums/property.enum";

const PropertySchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: Object.values(PropertyType),
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: Object.values(PropertyStatus),
			default: PropertyStatus.ACTIVE,
		},

		propertyLocation: {
			type: String,
			enum: Object.values(PropertyLocation),
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertySquare: {
			type: Number,
			required: true,
		},

		propertyBeds: {
			type: Number,
			required: true,
		},

		propertyRooms: {
			type: Number,
			required: true,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyDesc: {
			type: String,
		},

		propertyBarter: {
			type: Boolean,
			default: false,
		},

		propertyRent: {
			type: Boolean,
			default: false,
		},

		// ✅ RENT PERIOD DBda saqlansin
		propertyRentPeriod: {
			type: String,
			enum: Object.values(PropertyRentPeriod),
			default: PropertyRentPeriod.MONTHLY, // xohlasa olib tashlasa ham bo‘ladi
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Member",
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: "properties" }
);

PropertySchema.index(
	{ propertyType: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 },
	{ unique: true }
);

export default PropertySchema;
