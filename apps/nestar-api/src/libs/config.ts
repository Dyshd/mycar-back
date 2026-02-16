import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { LookupAuthMemberFollowed, T } from './types/common';

export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
export const availableOptions = ['propertyBarter', 'propertyRent'];
export const availablePropertySorts = ['createdAt', 'updatedAt', 'propertyLikes', 'propertyViews', 'propertyRank', 'propertyPrice'];
export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleWiews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

/** =========================
 *  IMAGE CONFIGURATION
 *  ========================= */
export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'] as const;

/** faqat shu targetlarga ruxsat */
export const allowedUploadTargets = ['member', 'property'] as const;
export type AllowedUploadTarget = (typeof allowedUploadTargets)[number];

export const isAllowedUploadTarget = (t: any): t is AllowedUploadTarget => {
  return allowedUploadTargets.includes(t);
};

/** Unique image nom */
export const getSerialForImage = (filename: string) => {
  const ext = path.extname(filename || '').toLowerCase();
  return `${uuidv4()}${ext}`;
};

/** Diskka yozish uchun ABSOLUTE path yasash */
export const buildUploadDiskPath = (target: AllowedUploadTarget, imageName: string) => {
  const rel = path.join('uploads', target, imageName).replaceAll('\\', '/'); // frontendga qaytadi
  const abs = path.join(process.cwd(), rel); // diskka yoziladi
  return { rel, abs };
};

/** Papka yo‘q bo‘lsa yaratish */
export const ensureDir = (fileAbsPath: string) => {
  const dir = path.dirname(fileAbsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const shapeIntoMongoObjectId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};

/** =========================
 *  LOOKUPS
 *  ========================= */
export const lookupMember = {
  $lookup: {
    from: 'members',
    localField: 'memberId',
    foreignField: '_id',
    as: 'memberData',
  },
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
  return {
    $lookup: {
      from: 'likes',
      let: {
        localLikeRefId: targetRefId,
        localMemberId: memberId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
            },
          },
        },
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: '$$localMyFavorite',
          },
        },
      ],
      as: 'meLiked',
    },
  };
};

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
  const { followerId, followingId } = input;
  return {
    $lookup: {
      from: 'follows',
      let: {
        localFollowerId: followerId,
        localFollowingId: followingId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
            },
          },
        },
        {
          $project: {
            _id: 0,
            followerId: 1,
            followingId: 1,
            myFollowing: '$$localMyFavorite',
          },
        },
      ],
      as: 'meFollowed',
    },
  };
};

export const lookupFollowingData = {
  $lookup: {
    from: 'members',
    localField: 'followingId',
    foreignField: '_id',
    as: 'followingData',
  },
};

export const lookupFollowerData = {
  $lookup: {
    from: 'members',
    localField: 'followerId',
    foreignField: '_id',
    as: 'followerData',
  },
};

export const lookupFavorite = {
  $lookup: {
    from: 'members',
    localField: 'favoriteProperty.memberId',
    foreignField: '_id',
    as: 'favoriteProperty.memberData',
  },
};

export const lookupVisit = {
  $lookup: {
    from: 'members',
    localField: 'visitedProperty.memberId',
    foreignField: '_id',
    as: 'visitedProperty.memberData',
  },
};
