import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import {
    PropertyLocation,
    PropertyRentPeriod,
    PropertyStatus,
    PropertyTransmission,
    PropertyType,
} from '../../enums/property.enum';
import { Member, TotalConter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Property {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => PropertyType)
    propertyType: PropertyType;

    @Field(() => PropertyStatus)
    propertyStatus: PropertyStatus;

    @Field(() => PropertyLocation)
    propertyLocation: PropertyLocation;

    @Field(() => String)
    propertyAddress: string;

    @Field(() => String)
    propertyTitle: string;

    @Field(() => Number)
    propertyPrice: number;

    @Field(() => Number)
    propertySquare: number;

    @Field(() => Int)
    propertyBeds: number;

    @Field(() => Int)
    propertyRooms: number;

    // ✅ NEW
    @Field(() => PropertyTransmission, { nullable: true })
    propertyTransmission?: PropertyTransmission;

    @Field(() => Int)
    propertyViews: number;

    @Field(() => Int)
    propertyLikes: number;

    @Field(() => Int)
    propertyComments: number;

    @Field(() => Int)
    propertyRank: number;

    @Field(() => [String])
    propertyImages: string[];

    @Field(() => String, { nullable: true })
    propertyDesc?: string;

    @Field(() => Boolean)
    propertyBarter: boolean;

    @Field(() => Boolean)
    propertyRent: boolean;

    @Field(() => PropertyRentPeriod, { nullable: true })
    propertyRentPeriod?: PropertyRentPeriod;

    @Field(() => String)
    memberId: ObjectId;

    @Field(() => Date, { nullable: true })
    soldAt?: Date;

    @Field(() => Date, { nullable: true })
    deletedAt?: Date;

    @Field(() => Date, { nullable: true })
    constructedAt?: Date;

    @Field(() => Date, { nullable: true })
    createdAt?: Date;

    @Field(() => Date, { nullable: true })
    updatedAt?: Date;

    @Field(() => Member, { nullable: true })
    memberData?: Member;

    @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[];
}

@ObjectType()
export class Properties {
    @Field(() => [Property])
    list: Property[];

    @Field(() => [TotalConter], { nullable: true })
    metaCounter: TotalConter[];
}
